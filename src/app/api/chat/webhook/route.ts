import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase, updateCitaInDb } from "@/lib/db/store";
import { procesarRespuestaEncuesta } from "@/lib/chat/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, text, clientName, timestamp } = body;

    if (!phone || !text) {
      return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const db = getDatabase();

    // 1. Buscar el cliente por su teléfono (probando con 10 dígitos o con prefijo 52)
    const cliente = db.clientes.find((cl) => {
      const p = cl.whatsapp.replace(/\D/g, "");
      return cleanPhone.endsWith(p) || p.endsWith(cleanPhone);
    });

    if (cliente) {
      // Buscar su cita más reciente
      const citasCliente = db.servicios_citas
        .filter((c) => c.cliente_id === cliente.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const ultimaCita = citasCliente[0];

      // 2. Verificar si es una respuesta a la encuesta (un número del 1 al 5)
      const cleanText = text.trim();
      const ratingMatch = cleanText.match(/^[1-5]$/);

      if (ratingMatch && ultimaCita) {
        const rating = parseInt(ratingMatch[0], 10);
        updateCitaInDb(ultimaCita.id, {
          calificacion_estrellas: rating,
          calificacion: rating,
        });

        // Disparar lógica de reseñas de Google o alerta de soporte
        await procesarRespuestaEncuesta(cliente, ultimaCita, rating);
      }

      // 3. Registrar el mensaje recibido en el historial de automatizaciones para visualización
      db.mensajes_automatizacion.unshift({
        id: `in-${Date.now()}`,
        cita_id: ultimaCita ? ultimaCita.id : "sin_cita",
        cliente_id: cliente.id,
        etapa: "3_encuesta_3h_poservicio",
        etapa_titulo: "Mensaje Recibido Cliente",
        destinatario_whatsapp: cleanPhone,
        contenido_mensaje: `[Cliente]: ${text}`,
        estatus_envio: "Enviado",
        fecha_programada: timestamp || new Date().toISOString(),
      });

      saveDatabase(db);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error procesando webhook de chat";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
