/**
 * Cliente HTTP interno para comunicarse con el microservicio chat-bridge
 */

const CHAT_BRIDGE_URL =
  process.env.CHAT_BRIDGE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://kanan-chat-bridge.onrender.com"
    : "http://localhost:3001");
const CHAT_API_KEY = process.env.CHAT_API_KEY || "kanan_secret_2026";

interface BridgeResponse {
  ok: boolean;
  status?: string;
  qr?: string;
  message?: string;
  error?: string;
}

export async function obtenerEstadoBridge(): Promise<BridgeResponse> {
  try {
    const res = await fetch(`${CHAT_BRIDGE_URL}/api/status`, {
      headers: { "x-api-key": CHAT_API_KEY },
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
    return { ok: false, status: "disconnected", error: "Servicio no disponible" };
  } catch {
    return { ok: false, status: "disconnected", error: "Bridge desconectado o apagado" };
  }
}

export async function obtenerQrBridge(): Promise<BridgeResponse> {
  try {
    const res = await fetch(`${CHAT_BRIDGE_URL}/api/qr`, {
      headers: { "x-api-key": CHAT_API_KEY },
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
    return { ok: false, error: "No se pudo obtener código QR" };
  } catch {
    return { ok: false, error: "Bridge desconectado" };
  }
}

/**
 * Modo Pruebas / Sandbox de WhatsApp:
 * Si está activo o si el número NO es el del desarrollador (2221817807),
 * bloquea el envío hacia clientes reales para evitar estropear conversaciones.
 */
const WHITELIST_TEST_PHONE = "2221817807";

export async function enviarMensajeChat(toPhone: string, message: string): Promise<boolean> {
  try {
    let cleanPhone = toPhone.replace(/\D/g, "");
    const last10 = cleanPhone.slice(-10);

    // FILTRO DE SEGURIDAD: Solo enviar flujos de prueba a tu número (2221817807)
    if (last10 !== WHITELIST_TEST_PHONE) {
      console.log(`🛡️ [WhatsApp Sandbox] Envío bloqueado a ${cleanPhone}. Solo autorizado para pruebas al número ${WHITELIST_TEST_PHONE}`);
      return true; // Retorna true para no romper los flujos internos del CRM
    }

    if (!cleanPhone.startsWith("52") && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith("52") && !cleanPhone.startsWith("521") && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }
    const res = await fetch(`${CHAT_BRIDGE_URL}/api/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CHAT_API_KEY,
      },
      body: JSON.stringify({ to: cleanPhone, message }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("No se pudo enviar mensaje vía chat-bridge (modo silencioso):", err);
    return false;
  }
}

export async function enviarStickerChat(toPhone: string, stickerPath: string): Promise<boolean> {
  try {
    let cleanPhone = toPhone.replace(/\D/g, "");
    const last10 = cleanPhone.slice(-10);

    // FILTRO DE SEGURIDAD: Solo enviar flujos de prueba a tu número (2221817807)
    if (last10 !== WHITELIST_TEST_PHONE) {
      console.log(`🛡️ [WhatsApp Sandbox] Sticker bloqueado a ${cleanPhone}. Solo autorizado al número ${WHITELIST_TEST_PHONE}`);
      return true;
    }

    if (!cleanPhone.startsWith("52") && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith("52") && !cleanPhone.startsWith("521") && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }

    // Si el sticker está localmente en public/assets/stickers, leerlo y mandarlo en Base64 para garantizar entrega inmediata
    let stickerBase64: string | undefined = undefined;
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filename = path.basename(stickerPath).replace(".png", ".webp");
      const localPath = path.join(process.cwd(), "public", "assets", "stickers", filename);
      if (fs.existsSync(localPath)) {
        stickerBase64 = fs.readFileSync(localPath).toString("base64");
      }
    } catch {
      // continuar con stickerPath normal
    }

    const res = await fetch(`${CHAT_BRIDGE_URL}/api/send-sticker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CHAT_API_KEY,
      },
      body: JSON.stringify({ to: cleanPhone, stickerPath, stickerBase64 }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("No se pudo enviar sticker vía chat-bridge:", err);
    return false;
  }
}

export async function enviarMediaChat(
  toPhone: string,
  mediaUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const cleanPhone = toPhone.replace(/\D/g, "");
    const last10 = cleanPhone.slice(-10);

    // FILTRO DE SEGURIDAD: Solo enviar flujos de prueba a tu número (2221817807)
    if (last10 !== WHITELIST_TEST_PHONE) {
      console.log(`🛡️ [WhatsApp Sandbox] Media bloqueado a ${cleanPhone}. Solo autorizado al número ${WHITELIST_TEST_PHONE}`);
      return true;
    }

    const res = await fetch(`${CHAT_BRIDGE_URL}/api/send-media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CHAT_API_KEY,
      },
      body: JSON.stringify({ to: cleanPhone, mediaUrl, caption }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.warn("No se pudo enviar media vía chat-bridge:", err);
    return false;
  }
}
