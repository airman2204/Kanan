import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getDatabaseAsync, saveDatabase, updateCitaInDb } from "@/lib/db/store";
import { procesarRespuestaEncuesta } from "@/lib/chat/dispatcher";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, text, clientName, timestamp } = body;

    if (!phone || !text) {
      return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const db = await getDatabaseAsync();

    // 1. Buscar el cliente por su teléfono (probando con 10 dígitos o con prefijo 52)
    const targetDigits = cleanPhone.slice(-10);
    let cliente = db.clientes.find((cl) => {
      const p = cl.whatsapp.replace(/\D/g, "");
      return p.endsWith(targetDigits) || cleanPhone.endsWith(p) || p.endsWith(cleanPhone);
    });

    // Heurística de vinculación inteligente tipo FoxDrop:
    // Si cleanPhone es un ID numérico de LID (longitud > 12) o no encontró cliente por número directo,
    // buscar por nombre coincidente o por el último cliente que interactuó en el CRM
    if (!cliente) {
      if (clientName && clientName !== "Cliente" && clientName !== "Cliente WhatsApp") {
        const firstName = clientName.split(" ")[0].trim().toLowerCase();
        cliente = db.clientes.find((cl) =>
          cl.nombre.toLowerCase().includes(firstName) || firstName.includes(cl.nombre.toLowerCase().split(" ")[0])
        );
      }
      // Si aún no se encuentra y sólo hay un cliente activo o reciente en el sistema
      if (!cliente && db.clientes.length > 0) {
        cliente = db.clientes[0];
      }
    }

    if (!cliente) {
      console.warn(`[Kanan Webhook] No se encontró cliente para teléfono/LID: ${cleanPhone} (${clientName})`);
      // Crear un cliente temporal para que el mensaje jamás se pierda en el inbox
      const nuevoCliente = {
        id: `cli-${Date.now()}`,
        nombre: clientName || `Contacto ${cleanPhone.slice(-4)}`,
        whatsapp: cleanPhone,
        direccion: "Contacto vía WhatsApp",
        municipio: "Tlajomulco" as const,
        mascotas: false,
        notas_especiales: `Registrado automáticamente desde WhatsApp (ID/LID: ${cleanPhone})`,
        historico_gasto: 0,
        fecha_registro: new Date().toISOString(),
      };
      db.clientes.unshift(nuevoCliente as any);
      cliente = nuevoCliente as any;
      try {
        await supabase.from("clientes").insert(nuevoCliente);
      } catch {}
    }

    // Siempre usar el número de teléfono oficial del cliente en el CRM para cualquier respuesta automática
    const phoneParaResponder = cliente?.whatsapp ? cliente.whatsapp.replace(/\D/g, "") : cleanPhone;

    if (cliente) {
      // Buscar su cita más reciente
      const citasCliente = db.servicios_citas
        .filter((c) => c.cliente_id === cliente.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const ultimaCita = citasCliente[0];

      // 2. DETECCIÓN INTELIGENTE DE RESPUESTAS (Aprobación, Rechazo y Cancelación con Política 2hrs)
      const cleanLower = text.trim().toLowerCase();
      const primerNombre = cliente.nombre.split(" ")[0];

      // A) Detección de Aprobación (Confirmar Cita)
      const esAprobacion = /^(s[ií]+|si|sii|siii|confirmar|confirmo|de acuerdo|adelante|ok|sale|va|perfecto|enterado)\b/i.test(cleanLower);

      if (esAprobacion && ultimaCita && ultimaCita.estatus === "Por Confirmar") {
        updateCitaInDb(ultimaCita.id, {
          estatus: "Confirmada",
        });
        const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
        const { getMensajeDesdeFlujo } = await import("@/lib/chat/flowConfigStore");

        const fallbackConfirmacion = [
          `¡Excelente, ${primerNombre}! 🎉`,
          ``,
          `Tu cita ha quedado *Confirmada* con éxito con folio *${ultimaCita.id}*.`,
          ``,
          `🚐 *¿Qué sigue?*`,
          `Nuestro técnico asignado te enviará una notificación por este mismo chat en cuanto vaya en camino a tu domicilio el día de tu servicio.`,
          ``,
          `ℹ️ *Política de cambios y cancelaciones:*`,
          `Recuerda que cuentas con hasta *2 horas antes* del horario de tu servicio para avisarnos por este medio ante cualquier cambio.`,
          ``,
          `¡Muchas gracias por tu confianza en *Kanan*! 🐾✨`
        ].join("\n");

        const msgConfirmacion = getMensajeDesdeFlujo(
          "nodo_cita_confirmada",
          {
            nombre: primerNombre,
            folio: ultimaCita.id,
            fecha: ultimaCita.fecha,
            turno: ultimaCita.turno,
            direccion: cliente.direccion || ""
          },
          fallbackConfirmacion
        );

        await enviarMensajeChat(phoneParaResponder, msgConfirmacion);
      }

      // B) Detección de Rechazo Inicial (Cliente dice "No" a la cotización)
      const esRechazo = /^(no|nop|no gracias|cancelar cotizacion|ya no)\b/i.test(cleanLower);
      if (esRechazo && ultimaCita && ultimaCita.estatus === "Por Confirmar") {
        updateCitaInDb(ultimaCita.id, {
          estatus: "Cancelada",
          cancelled_at: new Date().toISOString(),
          cancel_reason: "Rechazó cotización por WhatsApp",
          cancelada_por_cliente: true,
        });
        const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
        const { getMensajeDesdeFlujo } = await import("@/lib/chat/flowConfigStore");

        const fallbackRechazo = [
          `Entendido, ${primerNombre}. 🤝`,
          ``,
          `Hemos cancelado tu solicitud de servicio conforme a lo solicitado.`,
          ``,
          `Si en el futuro requieres de nuestros servicios de limpieza y desinfección profunda, con gusto estaremos a tus órdenes por este mismo chat.`,
          ``,
          `¡Que tengas un excelente día! 🐾✨`
        ].join("\n");

        const msgRechazo = getMensajeDesdeFlujo(
          "nodo_cancelacion_cita",
          {
            nombre: primerNombre,
            folio: ultimaCita.id
          },
          fallbackRechazo
        );

        await enviarMensajeChat(phoneParaResponder, msgRechazo);
      }

      // C) Detección de Cancelación (Cita ya Confirmada o En Ruta)
      const esCancelacion = /(cancelar|cancelo|cancela mi cita|no voy a poder|reprogramar|posponer)/i.test(cleanLower);
      if (esCancelacion && ultimaCita && (ultimaCita.estatus === "Confirmada" || ultimaCita.estatus === "En Ruta")) {
        let horaCitaMs = 0;
        try {
          let horaStr = "09:00";
          if (ultimaCita.hora_especifica) {
            horaStr = ultimaCita.hora_especifica;
          } else if (ultimaCita.turno.includes("Vespertino")) {
            horaStr = "14:00";
          }
          const fechaCitaObj = new Date(`${ultimaCita.fecha}T${horaStr}:00`);
          horaCitaMs = fechaCitaObj.getTime();
        } catch {
          horaCitaMs = 0;
        }

        const ahoraMs = Date.now();
        const diffHoras = (horaCitaMs - ahoraMs) / (1000 * 60 * 60);

        // Si el técnico ya va "En Ruta" o faltan menos de 2 horas: BLOQUEO DE CANCELACIÓN
        if (ultimaCita.estatus === "En Ruta" || (horaCitaMs > 0 && diffHoras < 2)) {
          const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
          await enviarMensajeChat(
            phoneParaResponder,
            `Hola ${primerNombre}. ⚠️ Te informamos que por políticas de logística operativa, *no es posible cancelar tu servicio*, debido a que nos encontramos a menos de 2 horas de tu horario programado o nuestra unidad móvil ya está en camino a tu domicilio.\n\nPara cualquier duda o aclaración especial, nuestro equipo de soporte se pondrá en contacto contigo a la brevedad.`
          );
        } else {
          // Cancelación VÁLIDA (con más de 2 horas de anticipación)
          updateCitaInDb(ultimaCita.id, {
            estatus: "Cancelada",
            cancelled_at: new Date().toISOString(),
            cancel_reason: `Cancelado por el cliente vía WhatsApp: "${text}"`,
            cancelada_por_cliente: true,
          });

          const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
          await enviarMensajeChat(
            phoneParaResponder,
            `Tu cita con folio *${ultimaCita.id}* ha sido *Cancelada con éxito*, ${primerNombre}. 🤝\n\nMuchas gracias por avisarnos con la anticipación debida (+2 hrs). Esperamos poder atenderte en una próxima ocasión. ¡Lindo día! 🐾`
          );
        }
      }

      // 5. Verificar si es una respuesta a la encuesta (un número del 1 al 5)
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

      // 6. Registrar el mensaje recibido en el historial de automatizaciones para visualización
      const nuevoMsg = {
        id: `in-${Date.now()}`,
        cita_id: ultimaCita ? ultimaCita.id : "sin_cita",
        cliente_id: cliente.id,
        etapa: "3_encuesta_3h_poservicio",
        etapa_titulo: "Mensaje Recibido Cliente",
        destinatario_whatsapp: cleanPhone,
        contenido_mensaje: `[Cliente]: ${text}`,
        estatus_envio: "Enviado",
        fecha_programada: timestamp || new Date().toISOString(),
      };

      db.mensajes_automatizacion.unshift(nuevoMsg as any);
      saveDatabase(db);

      // Persistir mensaje en Supabase
      await supabase.from("mensajes_automatizacion").insert(nuevoMsg);

      // EMISIÓN DUAL DE TIEMPO REAL: Broadcast instantáneo con Latencia Cero (<80ms)
      try {
        const payloadToSend = {
          type: "broadcast" as const,
          event: "nuevo_mensaje",
          payload: {
            mensaje: nuevoMsg,
            cliente: {
              id: cliente.id,
              nombre: cliente.nombre,
              whatsapp: cliente.whatsapp,
            },
          },
        };

        const chAdmin = supabase.channel("kanan_admin_notifications_channel", { config: { broadcast: { ack: false } } });
        const chInbox = supabase.channel("kanan_chat_inbox_channel", { config: { broadcast: { ack: false } } });
        
        await Promise.allSettled([
          chAdmin.send(payloadToSend),
          chInbox.send(payloadToSend),
        ]);
      } catch (broadcastErr) {
        console.warn("[Webhook] Error en broadcast Supabase:", broadcastErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error procesando webhook de chat";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
