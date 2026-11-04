const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
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

const PORT = process.env.PORT || 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://kananlimpieza.mx/api/chat/webhook';
const API_KEY = process.env.CHAT_API_KEY || 'kanan_secret_2026';

let qrCodeData = null;
let connectionStatus = 'connecting'; // 'connecting', 'qr_ready', 'connected', 'disconnected'
let sock = null;
let connectedPhone = null;

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

async function startWhatsApp() {
  let authStateResult;
  try {
    authStateResult = await useSupabaseAuthState(supabase, 'kanan_primary_session');
    console.log('✅ [Kanan Chat] Persistencia remota en Supabase conectada con éxito.');
  } catch (supabaseErr) {
    console.warn('⚠️ [Kanan Chat] Falló Supabase auth state, usando respaldo local:', supabaseErr.message);
    authStateResult = await useMultiFileAuthState(authDir);
  }
  const { state, saveCreds } = authStateResult;

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['Kanan Limpieza CRM', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

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

      if (shouldReconnect) {
        setTimeout(startWhatsApp, 4000);
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
    }
  });

  // Mensajes entrantes del cliente
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const senderJid = msg.key.remoteJid || '';
      if (senderJid.includes('@g.us')) continue; // Ignorar grupos

      const cleanPhone = senderJid.replace(/@.+/, '');
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
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
  });
}

// Iniciar sesión Baileys
startWhatsApp();

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
  if (!qrCodeData) {
    return res.json({ ok: false, status: connectionStatus, qr: null, message: 'Generando nuevo código QR...' });
  }
  res.json({ ok: true, status: connectionStatus, qr: qrCodeData });
});

app.post('/api/send-message', authMiddleware, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!sock || connectionStatus !== 'connected') {
      return res.status(503).json({ ok: false, error: 'Chat bridge no está conectado' });
    }
    if (!to || !message) {
      return res.status(400).json({ ok: false, error: 'Faltan parámetros (to, message)' });
    }

    let cleanPhone = to.replace(/\D/g, '');
    // En México, WhatsApp requiere el prefijo internacional 521 para celulares de 10 dígitos
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith('52') && !cleanPhone.startsWith('521') && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }
    const jid = `${cleanPhone}@s.whatsapp.net`;

    await sock.sendMessage(jid, { text: message });
    console.log(`📤 [Kanan Chat] Mensaje enviado con éxito a ${cleanPhone}`);
    res.json({ ok: true, to: cleanPhone });
  } catch (err) {
    console.error('[Kanan Chat] Error enviando mensaje:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/send-sticker', authMiddleware, async (req, res) => {
  try {
    const { to, stickerPath } = req.body;
    if (!sock || connectionStatus !== 'connected') {
      return res.status(503).json({ ok: false, error: 'Chat bridge no está conectado' });
    }
    if (!to) {
      return res.status(400).json({ ok: false, error: 'Falta teléfono destino' });
    }

    let cleanPhone = to.replace(/\D/g, '');
    // En México, WhatsApp requiere el prefijo internacional 521 para celulares de 10 dígitos
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith('52') && !cleanPhone.startsWith('521') && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }
    const jid = `${cleanPhone}@s.whatsapp.net`;

    // Buscar archivo de sticker local o en public
    let resolvedPath = path.isAbsolute(stickerPath || '')
      ? stickerPath
      : path.join(__dirname, stickerPath || 'assets/kanan-movil.webp');

    if (!fs.existsSync(resolvedPath)) {
      // Probar en public/assets/stickers si existe en la app raíz
      resolvedPath = path.join(__dirname, '..', 'public', stickerPath || 'assets/stickers/kanan-movil.webp');
    }

    if (fs.existsSync(resolvedPath)) {
      await sock.sendMessage(jid, { sticker: fs.readFileSync(resolvedPath) });
      console.log(`👾 [Kanan Chat] Sticker enviado con éxito a ${cleanPhone}`);
      return res.json({ ok: true, to: cleanPhone });
    } else {
      // Si el archivo físico no existe, enviar emoji representativo sin tronar
      await sock.sendMessage(jid, { text: '🚐💨 Kanan Móvil en camino...' });
      return res.json({ ok: true, fallback: true });
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

app.listen(PORT, () => {
  console.log(`🚀 [Kanan Chat Bridge] Servidor corriendo en puerto ${PORT}`);
});
