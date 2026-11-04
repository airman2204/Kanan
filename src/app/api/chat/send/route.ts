import { NextRequest, NextResponse } from "next/server";
import { enviarMensajeChat } from "@/lib/chat/bridgeClient";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, cliente_id } = body;

    if (!to || !message) {
      return NextResponse.json({ ok: false, error: "Faltan parámetros (to, message)" }, { status: 400 });
    }

    const sent = await enviarMensajeChat(to, message);

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
        contenido_mensaje: message,
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
