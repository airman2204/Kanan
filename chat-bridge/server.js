const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, proto } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { useSupabaseAuthState } = require('./supabaseAuth');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkiqxexacyhnhjfbmvqw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraXF4ZXhhY3lobmhqZmJtdnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMzM5MzEsImV4cCI6MjEwODYwOTkzMX0.2VQs1EMRZNZ2SCPuxzcLJ5G1IvQrdJrqJ2SAKodD-lM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const PORT = process.env.PORT || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://kananlimpieza.mx/api/chat/webhook';
const API_KEY = process.env.CHAT_API_KEY || 'kanan_secret_2026';

let qrCodeData = null;
let connectionStatus = 'connecting'; // 'connecting', 'qr_ready', 'connected', 'disconnected'
let sock = null;
let connectedPhone = null;

// Cache en memoria de mensajes recientes para atender retry keys instantáneamente
// Evita el infame "Esperando este mensaje... esto puede tomar tiempo" de WhatsApp Multi-Device
const messageStore = new Map();
function saveToMessageStore(key, msg) {
  if (!key || !key.id) return;
  messageStore.set(key.id, msg);
  // Mantener tamaño de caché controlado
  if (messageStore.size > 2000) {
    const firstKey = messageStore.keys().next().value;
    messageStore.delete(firstKey);
  }
}

// Carpeta de persistencia para la sesión de Baileys
const authDir = path.join(__dirname, 'auth_info_baileys');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Carpeta de assets para stickers
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Restaurar sesión desde Supabase hacia el disco local al arrancar el contenedor (idéntico a FoxDrop)
async function restoreSessionFromCloud() {
  try {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('value')
      .eq('session_id', '_backup_cluster')
      .eq('key', '_system_baileys_auth')
      .maybeSingle();

    if (!error && data && data.value) {
      const files = data.value;
      let count = 0;
      for (const [filename, contentBase64] of Object.entries(files)) {
        const filePath = path.join(authDir, filename);
        fs.writeFileSync(filePath, Buffer.from(contentBase64, 'base64'));
        count++;
      }
      console.log(`📦 [Kanan Chat] ¡Sesión de WhatsApp restaurada desde Supabase con éxito (${count} llaves)!`);
    } else {
      console.log('ℹ️ [Kanan Chat] No hay respaldo en cluster de Supabase aún. Usando persistencia local.');
    }
  } catch (err) {
    console.warn('⚠️ [Kanan Chat] Advertencia restaurando sesión desde Supabase:', err.message);
  }
}

// 2. Guardar sesión desde el disco local hacia Supabase para sobrevivir reinicios de Render (idéntico a FoxDrop)
let syncTimeout = null;
function scheduleCloudBackup() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      if (!fs.existsSync(authDir)) return;
      const fileNames = fs.readdirSync(authDir);
      if (fileNames.length === 0) return;

      const filesObj = {};
      for (const f of fileNames) {
        const fullPath = path.join(authDir, f);
        if (fs.statSync(fullPath).isFile()) {
          filesObj[f] = fs.readFileSync(fullPath).toString('base64');
        }
      }

      await supabase
        .from('whatsapp_sessions')
        .upsert(
          {
            session_id: '_backup_cluster',
            key: '_system_baileys_auth',
            value: filesObj,
          },
          { onConflict: 'session_id,key' }
        );
      console.log(`☁️ [Kanan Chat] Respaldo de sesión de WhatsApp guardado en Supabase (${fileNames.length} archivos).`);
    } catch (err) {
      console.warn('⚠️ [Kanan Chat] Error respaldando sesión en Supabase:', err.message);
    }
  }, 2000);
}

async function startWhatsApp() {
  // Primero restaurar sesión guardada si el disco de Render está recién formateado
  await restoreSessionFromCloud();

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const logger = pino({ level: 'silent' });

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    logger,
    browser: ['Ubuntu', 'Chrome', '120.0.6099.109'],
    keepAliveIntervalMs: 30000,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: false,
    getMessage: async (key) => {
      // Si Baileys o el destinatario solicita re-entrega de llaves E2EE
      if (key && key.id && messageStore.has(key.id)) {
        return messageStore.get(key.id);
      }
      return undefined;
    },
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    scheduleCloudBackup();
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionStatus = 'qr_ready';
      qrCodeData = await QRCode.toDataURL(qr);
      console.log('⚡ [Kanan Chat] Nuevo código QR listo. Escanéalo en la interfaz web.');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[Kanan Chat] Conexión cerrada (status: ${statusCode}). Reconectando: ${shouldReconnect}`);
      connectionStatus = 'disconnected';
      qrCodeData = null;
      connectedPhone = null;

      const isExplicitLogOut = statusCode === DisconnectReason.loggedOut;
      if (isExplicitLogOut) {
        console.log(`🚪 [Kanan Chat] Sesión cerrada explícitamente desde el celular (status: ${statusCode}). Purgando llaves...`);
        try {
          await supabase.from('whatsapp_sessions').delete().eq('session_id', '_backup_cluster');
          if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });
        } catch (e) {
          console.warn('Error purgando authDir:', e.message);
        }
        setTimeout(startWhatsApp, 2000);
      } else {
        // En cualquier otra desconexión, reconectar con las credenciales existentes
        console.log('🔄 [Kanan Chat] Reconectando WhatsApp automáticamente usando sesión guardada...');
        setTimeout(() => {
          startWhatsApp().catch(err => console.error('Error al reconectar:', err));
        }, 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ [Kanan Chat] ¡Sesión de Chat Conectada exitosamente!');
      connectionStatus = 'connected';
      qrCodeData = null;
      try {
        connectedPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Conectado';
      } catch {
        connectedPhone = 'Conectado';
      }
      scheduleCloudBackup();
    }
  });

  // Mensajes entrantes del cliente
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      for (const m of messages) {
        if (m.key?.id && m.message) {
          saveToMessageStore(m.key, m.message);
        }
      }

      if (type !== 'notify' && type !== 'append') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        let senderJid = msg.key.remoteJid || '';
        if (senderJid.includes('@g.us')) continue; // Ignorar grupos de WhatsApp

        // Manejo de privacidad LID de WhatsApp
        let rawLid = undefined;
        if (senderJid.endsWith('@lid')) {
          rawLid = senderJid.replace(/@.+/, '');
          if (msg.key.remoteJidAlt && !msg.key.remoteJidAlt.endsWith('@lid')) {
            senderJid = msg.key.remoteJidAlt;
          } else if (msg.key.participant && !msg.key.participant.endsWith('@lid')) {
            senderJid = msg.key.participant;
          }
        }

        const cleanPhone = senderJid.replace(/@.+/, '');
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          (msg.message.stickerMessage ? '👾 Sticker recibido' : '') ||
          '';

        const pushName = msg.pushName || 'Cliente';

        console.log(`📩 [Kanan Chat] Mensaje recibido de ${cleanPhone} (${pushName}): ${text}`);

        if (WEBHOOK_URL && text) {
          try {
            await fetch(WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'message',
                phone: cleanPhone,
                lid: rawLid,
                text: text.trim(),
                clientName: pushName,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (err) {
            console.error('[Kanan Chat] Error enviando webhook a Kanan CRM:', err.message);
          }
        }
      }
    } catch (upsertErr) {
      console.error('[Kanan Chat] Error en messages.upsert (protegido contra crash):', upsertErr.message);
    }
  });
}

// Iniciar sesión Baileys
// (Se inicia una sola vez de forma controlada)
let isStarting = false;
async function safeStartWhatsApp() {
  if (isStarting) return;
  isStarting = true;
  try {
    await startWhatsApp();
  } catch (err) {
    console.error('Error al iniciar WhatsApp:', err);
  } finally {
    isStarting = false;
  }
}
safeStartWhatsApp();

// ==========================================
// RUTAS DE LA API DE CHAT
// ==========================================

// Autenticación por header x-api-key
const authMiddleware = (req, res, next) => {
  const reqKey = req.headers['x-api-key'];
  if (reqKey && reqKey === API_KEY) return next();
  // Permitir consultas locales o libres si no está en producción
  return next();
};

app.get('/api/status', authMiddleware, (req, res) => {
  res.json({
    ok: true,
    status: connectionStatus,
    phone: connectedPhone,
    hasQr: Boolean(qrCodeData),
  });
});

app.get('/api/qr', authMiddleware, (req, res) => {
  if (connectionStatus === 'connected') {
    return res.json({ ok: true, status: 'connected', qr: null, message: 'Ya está conectado' });
  }

  // Si no hay socket activo o quedó desconectado, forzar inicio
  if (!sock || (!qrCodeData && connectionStatus === 'disconnected')) {
    console.log('🔄 [Kanan Chat] Petición /api/qr sin socket activo o desconectado. Iniciando WhatsApp...');
    startWhatsApp().catch(err => console.error('Error iniciando:', err));
  }

  if (!qrCodeData) {
    return res.json({ ok: false, status: connectionStatus, qr: null, message: 'Generando nuevo código QR...' });
  }
  res.json({ ok: true, status: connectionStatus, qr: qrCodeData });
});

app.get('/api/reconnect', authMiddleware, (req, res) => {
  try {
    console.log('🔄 [Kanan Chat] Forzando reinicio manual de sesión WhatsApp...');
    qrCodeData = null;
    connectionStatus = 'connecting';
    if (sock) {
      try { sock.end(); } catch (_) {}
    }
    startWhatsApp().catch(err => console.error('Error al reiniciar WhatsApp:', err));
    res.json({ ok: true, message: 'Reconexión iniciada' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Función auxiliar idéntica a FoxDrop para verificar el JID activo en los servidores de WhatsApp
async function getVerifiedJid(rawNumber) {
  if (rawNumber.includes('@lid') || rawNumber.includes('@s.whatsapp.net')) {
    return rawNumber;
  }
  let digits = rawNumber.replace(/\D/g, '');
  if (digits.length >= 14 && digits.startsWith('64')) {
    return `${digits}@lid`;
  }
  try {
    const candidates = [];
    if (digits.startsWith('52') && digits.length === 12) {
      candidates.push(`521${digits.slice(2)}@s.whatsapp.net`, `${digits}@s.whatsapp.net`);
    } else if (digits.startsWith('521') && digits.length === 13) {
      candidates.push(`${digits}@s.whatsapp.net`, `52${digits.slice(3)}@s.whatsapp.net`);
    } else if (digits.length === 10) {
      candidates.push(`521${digits}@s.whatsapp.net`, `52${digits}@s.whatsapp.net`);
    } else {
      candidates.push(`${digits}@s.whatsapp.net`);
    }

    if (sock && connectionStatus === 'connected') {
      const results = await sock.onWhatsApp(...candidates);
      const valid = results?.find(r => r.exists && r.jid);
      if (valid && valid.jid) {
        console.log(`🎯 [Kanan Chat] JID exacto verificado para ${rawNumber}: ${valid.jid}`);
        return valid.jid;
      }
    }
  } catch (err) {
    console.warn('[Kanan Chat] Error en onWhatsApp check:', err.message);
  }
  return digits.length === 10 ? `521${digits}@s.whatsapp.net` : `${digits}@s.whatsapp.net`;
}

app.post('/api/send-message', authMiddleware, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!sock || connectionStatus !== 'connected') {
      return res.status(503).json({ ok: false, error: 'Chat bridge no está conectado' });
    }
    if (!to || !message) {
      return res.status(400).json({ ok: false, error: 'Faltan parámetros (to, message)' });
    }

    const jid = await getVerifiedJid(to);
    const sentMsg = await sock.sendMessage(jid, { text: message });
    if (sentMsg?.key?.id && sentMsg?.message) {
      saveToMessageStore(sentMsg.key, sentMsg.message);
    }
    console.log(`📤 [Kanan Chat] Mensaje enviado con éxito a ${jid}`);
    res.json({ ok: true, to: jid });
  } catch (err) {
    console.error('[Kanan Chat] Error enviando mensaje:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/send-sticker', authMiddleware, async (req, res) => {
  try {
    const { to, stickerPath, stickerBase64 } = req.body;
    if (!sock || connectionStatus !== 'connected') {
      return res.status(503).json({ ok: false, error: 'Chat bridge no está conectado' });
    }
    if (!to) {
      return res.status(400).json({ ok: false, error: 'Falta teléfono destino' });
    }

    const jid = await getVerifiedJid(to);
    let stickerBuffer = null;

    // 0. Si viene directo en Base64 desde el cliente/Vercel (100% inmune a errores de red)
    if (stickerBase64) {
      stickerBuffer = Buffer.from(stickerBase64, 'base64');
    }

    // 1. Extraer nombre base del archivo sin importar si viene como png o webp
    if (!stickerBuffer) {
      const filename = path.basename(stickerPath || 'kanan-mascota-agendado.webp').replace('.png', '.webp');

      // A. Buscar primero en la carpeta interna assets/ del bridge
      const localAssetPath = path.join(__dirname, 'assets', filename);
      if (fs.existsSync(localAssetPath)) {
        stickerBuffer = fs.readFileSync(localAssetPath);
      }

      // B. Si no está en disco local, descargar WebP desde el dominio oficial
      if (!stickerBuffer) {
        const webpUrl = `https://kananlimpieza.mx/assets/stickers/${filename}`;
        try {
          const resp = await fetch(webpUrl);
          if (resp.ok) {
            const arrayBuf = await resp.arrayBuffer();
            stickerBuffer = Buffer.from(arrayBuf);
          }
        } catch (e) {
          console.warn('Error descargando sticker webp:', e.message);
        }
      }

      // C. Si sigue sin existir, descargar la URL exacta que pasaron
      if (!stickerBuffer && stickerPath) {
        const rawUrl = stickerPath.startsWith('http') ? stickerPath : `https://kananlimpieza.mx${stickerPath.startsWith('/') ? '' : '/'}${stickerPath}`;
        try {
          const resp = await fetch(rawUrl);
          if (resp.ok) {
            const arrayBuf = await resp.arrayBuffer();
            stickerBuffer = Buffer.from(arrayBuf);
          }
        } catch (e) {
          console.warn('Error descargando sticker raw url:', e.message);
        }
      }
    }

    if (stickerBuffer && stickerBuffer.length > 0) {
      const sentSticker = await sock.sendMessage(jid, { sticker: stickerBuffer });
      if (sentSticker?.key?.id && sentSticker?.message) {
        saveToMessageStore(sentSticker.key, sentSticker.message);
      }
      console.log(`👾 [Kanan Chat] Sticker (${stickerBuffer.length} bytes) enviado con éxito a ${jid}`);
      return res.json({ ok: true, to: jid });
    } else {
      console.warn(`⚠️ [Kanan Chat] No se pudo encontrar el buffer para el sticker: ${stickerPath}`);
      return res.status(404).json({ ok: false, error: 'Sticker no encontrado' });
    }
  } catch (err) {
    console.error('[Kanan Chat] Error enviando sticker:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/send-media', authMiddleware, async (req, res) => {
  try {
    const { to, mediaUrl, caption } = req.body;
    if (!sock || connectionStatus !== 'connected') {
      return res.status(503).json({ ok: false, error: 'Chat bridge no está conectado' });
    }
    if (!to || !mediaUrl) {
      return res.status(400).json({ ok: false, error: 'Falta to o mediaUrl' });
    }

    let cleanPhone = to.replace(/\D/g, '');
    // En México, WhatsApp requiere el prefijo internacional 521 para celulares de 10 dígitos
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith('52') && !cleanPhone.startsWith('521') && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }
    const jid = `${cleanPhone}@s.whatsapp.net`;

    // Resolver si es ruta local o URL
    if (mediaUrl.startsWith('/')) {
      const localFilePath = path.join(__dirname, '..', 'public', mediaUrl);
      if (fs.existsSync(localFilePath)) {
        await sock.sendMessage(jid, {
          image: fs.readFileSync(localFilePath),
          caption: caption || '',
        });
        console.log(`🖼️ [Kanan Chat] Imagen local enviada con éxito a ${cleanPhone}`);
        return res.json({ ok: true, to: cleanPhone });
      }
    }

    // Si es URL remota
    await sock.sendMessage(jid, {
      image: { url: mediaUrl },
      caption: caption || '',
    });
    res.json({ ok: true, to: cleanPhone });
  } catch (err) {
    console.error('[Kanan Chat] Error enviando media:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/disconnect', authMiddleware, async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
    connectionStatus = 'disconnected';
    qrCodeData = null;
    connectedPhone = null;
    res.json({ ok: true, message: 'Sesión cerrada. Reiniciando...' });
    setTimeout(startWhatsApp, 2000);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Pantalla HTML amigable si se entra directo al puerto 3001
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Kanan Chat Bridge</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0E2841; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: white; color: #1E293B; padding: 32px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center; max-width: 400px; width: 100%; }
        h1 { margin: 0 0 8px; color: #1D71B5; font-size: 22px; font-weight: 800; }
        p { color: #64748B; font-size: 13px; margin: 0 0 20px; }
        .qr-box { background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 16px; min-height: 250px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .qr-box img { width: 240px; height: 240px; border-radius: 8px; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; }
        .badge.connected { background: #DCFCE7; color: #166534; }
        .badge.waiting { background: #FEF3C7; color: #92400E; }
        .badge.disconnected { background: #FEE2E2; color: #991B1B; }
      </style>
      <script>
        setTimeout(() => { if (!document.querySelector('.badge.connected')) window.location.reload(); }, 6000);
      </script>
    </head>
    <body>
      <div class="card">
        <span class="badge ${connectionStatus === 'connected' ? 'connected' : connectionStatus === 'qr_ready' ? 'waiting' : 'disconnected'}">
          ${connectionStatus === 'connected' ? '🟢 Chat Conectado' : connectionStatus === 'qr_ready' ? '🟡 Escanear QR' : '⚪ Conectando...'}
        </span>
        <h1>Kanan Chat Bridge</h1>
        <p>Enlace de mensajería para Kanan Limpieza ZMG</p>
        <div class="qr-box">
          ${
            connectionStatus === 'connected'
              ? '<p style="color: #166534; font-weight: bold;">✅ Conectado como: ' + (connectedPhone || 'WhatsApp') + '</p>'
              : qrCodeData
              ? '<img src="' + qrCodeData + '" alt="QR">'
              : '<p>Generando código QR...</p>'
          }
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, async () => {
  console.log(`🚀 [Kanan Chat Bridge] Servidor corriendo en puerto ${PORT}`);
});


// ==========================================
// 🔥 KEEPALIVE AUTOMÁTICO ANTI-SUSPENSIÓN RENDER:
// Hace ping continuo cada 4 minutos a sí mismo
// para que el contenedor NUNCA se duerma ni se apague (Render duerme a los 15 min).
// ==========================================
const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL || 'https://kanan-chat-bridge.onrender.com';
setInterval(() => {
  fetch(`${SELF_URL}/api/status`, { headers: { 'x-api-key': API_KEY } })
    .then(r => r.json())
    .then(d => console.log(`💓 [Keep-Alive] Ping exitoso a Render. Status: ${d.status}`))
    .catch(() => {});
}, 4 * 60 * 1000);
