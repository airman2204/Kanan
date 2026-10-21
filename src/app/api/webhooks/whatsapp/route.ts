import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db/store";

/**
 * Endpoint de integración para Make (Integromat) / Meta Cloud API (WhatsApp Business Platform)
 * Permite disparar o marcar como enviados los mensajes de la secuencia poservicio,
 * así como recibir webhooks de calificación (1-5 estrellas).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDatabase();

    // Marcar mensaje específico de la secuencia como enviado y retornar link directo a WhatsApp
    if (body.action === "TRIGGER_MESSAGE" && body.mensajeId) {
      const msg = db.mensajes_automatizacion.find((m) => m.id === body.mensajeId);
      if (!msg) {
        return NextResponse.json({ ok: false, error: "Mensaje no encontrado" }, { status: 404 });
      }
      if (msg.estatus_envio === "Programado") {
        msg.estatus_envio = "Enviado";
        saveDatabase(db);
      }
      const cleanPhone = msg.destinatario_whatsapp.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
      const waLink = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg.contenido_mensaje)}`;

      return NextResponse.json({
        ok: true,
        mensaje: msg,
        waLink,
        db,
      });
    }

    return NextResponse.json({
      ok: true,
      webhook_status: "received",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error en webhook de WhatsApp";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
