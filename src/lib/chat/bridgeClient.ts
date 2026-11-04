/**
 * Cliente HTTP interno para comunicarse con el microservicio chat-bridge
 */

const CHAT_BRIDGE_URL = process.env.CHAT_BRIDGE_URL || "http://localhost:3001";
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

export async function enviarMensajeChat(toPhone: string, message: string): Promise<boolean> {
  try {
    let cleanPhone = toPhone.replace(/\D/g, "");
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
    if (!cleanPhone.startsWith("52") && cleanPhone.length === 10) {
      cleanPhone = `521${cleanPhone}`;
    } else if (cleanPhone.startsWith("52") && !cleanPhone.startsWith("521") && cleanPhone.length === 12) {
      cleanPhone = `521${cleanPhone.slice(2)}`;
    }
    const res = await fetch(`${CHAT_BRIDGE_URL}/api/send-sticker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CHAT_API_KEY,
      },
      body: JSON.stringify({ to: cleanPhone, stickerPath }),
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
