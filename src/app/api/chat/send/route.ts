import { NextRequest, NextResponse } from "next/server";
import { enviarMensajeChat, enviarStickerChat } from "@/lib/chat/bridgeClient";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, stickerUrl, cliente_id } = body;

    if (!to || (!message && !stickerUrl)) {
      return NextResponse.json({ ok: false, error: "Faltan parámetros (to, message/stickerUrl)" }, { status: 400 });
    }

    let sent = false;
    let contenidoGuardar = message || "";

    if (stickerUrl) {
      sent = await enviarStickerChat(to, stickerUrl);
      contenidoGuardar = `[Sticker]: ${stickerUrl}`;
    } else if (message) {
      sent = await enviarMensajeChat(to, message);
    }

    // Guardar en el log de mensajes si hay cliente_id
    if (cliente_id) {
      const db = getDatabase();
      const nuevoMsg = {
        id: `chat-${Date.now()}`,
        cita_id: "manual",
        cliente_id,
        etapa: "1_confirmacion_inmediata",
        etapa_titulo: "Chat Manual Admin",
        destinatario_whatsapp: to,
        contenido_mensaje: contenidoGuardar,
        estatus_envio: sent ? "Enviado" : "Programado",
        fecha_programada: new Date().toISOString(),
      };

      db.mensajes_automatizacion.unshift(nuevoMsg as any);
      saveDatabase(db);

      // Guardar también en Supabase para persistencia
      await supabase.from("mensajes_automatizacion").insert(nuevoMsg);
    }

    return NextResponse.json({ ok: sent });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al enviar mensaje";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
