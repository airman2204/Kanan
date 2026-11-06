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

    // 1. Identificación ESTRICTA Y EXCLUSIVA por número de teléfono
    // Solo vincula si el número telefónico coincide exactamente (mismos 10 dígitos o mismo identificador WhatsApp)
    const targetDigits = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    let cliente = db.clientes.find((cl) => {
      const p = cl.whatsapp.replace(/\D/g, "");
      const p10 = p.length >= 10 ? p.slice(-10) : p;
      return p === cleanPhone || (targetDigits.length === 10 && p10 === targetDigits);
    });

    // 2. Si el número NO existe en la base de datos, ES UN CLIENTE NUEVO GARANTIZADO
    // Bajo NINGUNA circunstancia se busca por nombre similar ni se vincula con clientes previos
    if (!cliente) {
      console.log(`🆕 [Kanan Webhook] Contacto 100% aislado creado para: ${cleanPhone} (${clientName})`);
      // Si no tenemos un nombre explícito personal del cliente, mostrar directamente su número de teléfono
      let nombreAMostrar = cleanPhone;
      if (cleanPhone.length === 10) {
        nombreAMostrar = `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
      } else if (cleanPhone.startsWith("52") && cleanPhone.length >= 12) {
        const local = cleanPhone.slice(-10);
        nombreAMostrar = `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
      } else if (clientName && clientName !== "Cliente" && clientName !== "Cliente WhatsApp") {
        nombreAMostrar = clientName;
      }

      const nuevoCliente = {
        id: `cli-${Date.now()}`,
        nombre: nombreAMostrar,
        whatsapp: cleanPhone,
        direccion: "Contacto vía WhatsApp",
        municipio: "Guadalajara" as const,
        mascotas: false,
        notas_especiales: `Registrado automáticamente desde WhatsApp`,
        historico_gasto: 0,
        fecha_registro: new Date().toISOString(),
      };
      db.clientes.unshift(nuevoCliente as any);
      cliente = nuevoCliente as any;
      try {
        await supabase.from("clientes").insert(nuevoCliente);
      } catch (e) {
        console.warn("Error guardando nuevo cliente en Supabase:", e);
      }
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

        // Guardar también la respuesta automática en el historial para que se vea en el chat del admin
        const msgConfirmacionRegistro = {
          id: `auto-${Date.now()}`,
          cita_id: ultimaCita.id,
          cliente_id: cliente.id,
          etapa: "1_confirmacion_inmediata",
          etapa_titulo: "Confirmación Automática WhatsApp",
          destinatario_whatsapp: phoneParaResponder,
          contenido_mensaje: msgConfirmacion,
          estatus_envio: "Enviado",
          fecha_programada: new Date().toISOString(),
        };
        db.mensajes_automatizacion.unshift(msgConfirmacionRegistro as any);
        // Mensaje de seguimiento para consultar método de pago (solo Efectivo o SPEI)
        const msgMetodoPago = [
          `Por último ${primerNombre}, para preparar el comprobante de tu servicio:`,
          `¿Cómo prefieres realizar tu pago el día de tu cita?`,
          ``,
          `1️⃣ *Efectivo*`,
          `2️⃣ *Transferencia SPEI*`,
          ``,
          `Responde con *1* o *2* (o escribe Efectivo / Transferencia). 💵📲`
        ].join("\n");

        setTimeout(async () => {
          try {
            await enviarMensajeChat(phoneParaResponder, msgMetodoPago);
            const msgPagoRegistro = {
              id: `auto-${Date.now() + 1}`,
              cita_id: ultimaCita.id,
              cliente_id: cliente.id,
              etapa: "1_confirmacion_inmediata",
              etapa_titulo: "Consulta Método de Pago",
              destinatario_whatsapp: phoneParaResponder,
              contenido_mensaje: msgMetodoPago,
              estatus_envio: "Enviado",
              fecha_programada: new Date().toISOString(),
            };
            const currentDb = await getDatabaseAsync();
            currentDb.mensajes_automatizacion.unshift(msgPagoRegistro as any);
            saveDatabase(currentDb);
            await supabase.from("mensajes_automatizacion").insert(msgPagoRegistro);
          } catch (e) {
            console.warn("Error enviando consulta de método de pago:", e);
          }
        }, 1500);
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

        // Guardar respuesta automática de rechazo en historial
        const msgRechazoRegistro = {
          id: `auto-${Date.now()}`,
          cita_id: ultimaCita.id,
          cliente_id: cliente.id,
          etapa: "1_confirmacion_inmediata",
          etapa_titulo: "Cancelación Automática WhatsApp",
          destinatario_whatsapp: phoneParaResponder,
          contenido_mensaje: msgRechazo,
          estatus_envio: "Enviado",
          fecha_programada: new Date().toISOString(),
        };
        db.mensajes_automatizacion.unshift(msgRechazoRegistro as any);
        try {
          await supabase.from("mensajes_automatizacion").insert(msgRechazoRegistro);
        } catch (e) {
          console.warn("Error guardando rechazo automático en Supabase:", e);
        }
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

          const msgCancRegistro = {
            id: `auto-${Date.now()}`,
            cita_id: ultimaCita.id,
            cliente_id: cliente.id,
            etapa: "1_confirmacion_inmediata",
            etapa_titulo: "Cancelación Exitosa WhatsApp",
            destinatario_whatsapp: phoneParaResponder,
            contenido_mensaje: `Tu cita con folio *${ultimaCita.id}* ha sido *Cancelada con éxito*, ${primerNombre}. 🤝\n\nMuchas gracias por avisarnos con la anticipación debida (+2 hrs). Esperamos poder atenderte en una próxima ocasión. ¡Lindo día! 🐾`,
            estatus_envio: "Enviado",
            fecha_programada: new Date().toISOString(),
          };
          db.mensajes_automatizacion.unshift(msgCancRegistro as any);
          try {
            await supabase.from("mensajes_automatizacion").insert(msgCancRegistro);
          } catch (e) {
            console.warn("Error guardando aviso cancelacion en Supabase:", e);
          }
        }
      }

      // D) Detección de Elección de Método de Pago (1 = Efectivo, 2 = Transferencia SPEI)
      if (ultimaCita && (ultimaCita.estatus === "Confirmada" || ultimaCita.estatus === "Por Confirmar")) {
        let metodoElegido: "Efectivo" | "Transferencia SPEI" | null = null;
        if (/^(1|efectivo|cash)\b/i.test(cleanLower)) {
          metodoElegido = "Efectivo";
        } else if (/^(2|transferencia|spei|transfer)\b/i.test(cleanLower)) {
          metodoElegido = "Transferencia SPEI";
        }

        if (metodoElegido) {
          updateCitaInDb(ultimaCita.id, { metodo_pago: metodoElegido });
          const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
          const msgAgradecimientoPago = [
            `¡Perfecto, ${primerNombre}! 💳✨`,
            `Hemos anotado tu método de pago como *${metodoElegido}*.`,
            metodoElegido === "Transferencia SPEI"
              ? `El técnico te proporcionará los datos de transferencia al momento de concluir tu servicio.`
              : `Puedes pagar directamente en efectivo al técnico al finalizar la limpieza de tus muebles.`,
            ``,
            `¡Nos vemos pronto! 🐾🛋️`
          ].join("\n");

          await enviarMensajeChat(phoneParaResponder, msgAgradecimientoPago);

          const msgAgradeceRegistro = {
            id: `auto-${Date.now()}`,
            cita_id: ultimaCita.id,
            cliente_id: cliente.id,
            etapa: "1_confirmacion_inmediata",
            etapa_titulo: "Confirmación Método de Pago",
            destinatario_whatsapp: phoneParaResponder,
            contenido_mensaje: msgAgradecimientoPago,
            estatus_envio: "Enviado",
            fecha_programada: new Date().toISOString(),
          };
          db.mensajes_automatizacion.unshift(msgAgradeceRegistro as any);
          try {
            await supabase.from("mensajes_automatizacion").insert(msgAgradeceRegistro);
          } catch (e) {
            console.warn("Error guardando método de pago en Supabase:", e);
          }
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
