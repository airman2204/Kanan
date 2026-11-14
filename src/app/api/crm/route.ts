import { NextRequest, NextResponse } from "next/server";
import {
  getDatabase,
  getDatabaseAsync,
  createBookingFromWizard,
  createClienteManual,
  createCitaManual,
  updateCitaInDb,
  sincronizarCitaConSupabase,
  cancelCita,
  deleteCitaFromDb,
  deleteCliente,
  clearAllData,
  resetToTwoExamples,
  setModoHalloween,
  setPinTecnico,
  updateMarketingConfig,
  saveDatabase,
} from "@/lib/db/store";
import { generarMensajeWhatsAppReservaCliente, KANAN_WHATSAPP_NUMBER } from "@/lib/whatsapp/templates";
import { despacharConfirmacionReservaAutomatica, despacharCitaConfirmada } from "@/lib/chat/dispatcher";
import { verifySessionToken } from "@/lib/auth/security";
import {
  validarDireccion,
  validarDetalleManchas,
  validarNombre,
  validarWhatsApp,
  sanitizeInput,
} from "@/lib/utils/securityValidation";
import { consultarCodigoPostal } from "@/lib/utils/postalCodes";
import { supabase } from "@/lib/supabase";

function isAuthenticatedAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get("kanan_admin_session")?.value;
  if (!cookie) return false;
  const session = verifySessionToken(cookie);
  return Boolean(session && session.mfaVerified);
}

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "No autorizado. Sesión de administrador requerida." },
      { status: 401 }
    );
  }
  const db = await getDatabaseAsync();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Cancelación de cita por el cliente (pública, con regla de 2 horas)
    if (body.action === "CLIENT_CANCEL_CITA") {
      const res = cancelCita(body.citaId, true, body.motivo);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, cita: res.cita, message: "Cita cancelada con éxito." });
    }

    // 2. Acciones del Administrador (requieren autenticación)
    if (
      body.action === "CREATE_CLIENTE_MANUAL" ||
      body.action === "CREATE_CITA_MANUAL" ||
      body.action === "ADMIN_CANCEL_CITA" ||
      body.action === "DELETE_CLIENTE" ||
      body.action === "UPDATE_MARKETING" ||
      body.action === "CLEAR_ALL" ||
      body.action === "RESET_DEMO_2" ||
      body.action === "TOGGLE_HALLOWEEN" ||
      body.action === "SET_PIN_TECNICO"
    ) {
      if (!isAuthenticatedAdmin(req)) {
        return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
      }
    }

    if (body.action === "CREATE_CLIENTE_MANUAL") {
      const cliente = createClienteManual(body.cliente);
      return NextResponse.json({ ok: true, cliente, db: getDatabase() });
    }

    if (body.action === "CREATE_CITA_MANUAL") {
      const { cita, cliente } = createCitaManual(body.cita);

      // Si se solicitó enviar confirmación automática por WhatsApp
      if (body.enviarWhatsApp !== false && cliente.whatsapp) {
        try {
          const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
          const { getMensajeDesdeFlujo } = await import("@/lib/chat/flowConfigStore");

          const piezasStr = (cita.items_contratados || []).map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ");
          
          let horarioLimpio = "09:00 a 16:00 hrs";
          if (cita.hora_especifica) {
            horarioLimpio = `${cita.hora_especifica} hrs`;
          } else if (cita.turno) {
            const match = cita.turno.match(/\((.*?)\)/);
            if (match && match[1]) {
              horarioLimpio = `${match[1].replace("-", "a")} hrs`;
            } else if (cita.turno.includes("Matutino")) {
              horarioLimpio = "09:00 a 13:00 hrs (Turno Mañana)";
            } else if (cita.turno.includes("Vespertino")) {
              horarioLimpio = "14:00 a 18:00 hrs (Turno Tarde)";
            }
          }

          const fallbackMsg = [
            `¡Hola ${cliente.nombre}! 👋`,
            ``,
            `Te confirmamos que tu cita ha sido agendada con éxito por nuestro equipo de *Kanan Servicios de Limpieza*:`,
            ``,
            `📋 *Folio:* ${cita.id}`,
            `🛋️ *Servicio:* ${piezasStr || "Limpieza y desinfección profunda"}`,
            `📅 *Fecha:* ${cita.fecha}`,
            `⏰ *Horario estimado:* ${horarioLimpio}`,
            `💰 *Total pactado:* $${cita.monto_total || 0} MXN`,
            `📍 *Dirección:* ${cliente.direccion}`,
            ``,
            `🚐 *¿Qué sigue?*`,
            `El día de tu servicio, nuestro técnico te enviará un mensaje por este medio en cuanto vaya en camino a tu domicilio.`,
            ``,
            `ℹ️ *Política de cambios:*`,
            `Recuerda que cuentas con hasta *2 horas antes* del horario de tu servicio para avisarnos por este medio ante cualquier cambio o reprogramación.`,
            ``,
            `¡Muchas gracias por tu preferencia en *Kanan*! 🐾✨`
          ].join("\n");

          const msgConfirmacion = getMensajeDesdeFlujo(
            "nodo_confirmacion_manual_admin",
            {
              nombre: cliente.nombre,
              folio: cita.id,
              piezas: piezasStr || "Limpieza y desinfección profunda",
              fecha: cita.fecha,
              turno: horarioLimpio,
              precio: `$${cita.monto_total || 0} MXN`,
              direccion: cliente.direccion
            },
            fallbackMsg
          );

          await enviarMensajeChat(cliente.whatsapp, msgConfirmacion);
        } catch (errWa) {
          console.warn("[CRM] No se pudo enviar WhatsApp automático de cita manual:", errWa);
        }
      }

      return NextResponse.json({ ok: true, cita, cliente, db: getDatabase() });
    }

    if (body.action === "ADMIN_CANCEL_CITA") {
      const res = cancelCita(body.citaId, false, body.motivo);
      return NextResponse.json({ ok: true, cita: res.cita, db: getDatabase() });
    }

    if (body.action === "DELETE_CITA") {
      const ok = deleteCitaFromDb(body.citaId);
      return NextResponse.json({ ok, db: getDatabase() });
    }

    if (body.action === "DELETE_CLIENTE") {
      const ok = deleteCliente(body.clienteId);
      return NextResponse.json({ ok, db: getDatabase() });
    }

    if (body.action === "UPDATE_MARKETING") {
      const db = updateMarketingConfig(body.marketing);
      return NextResponse.json({ ok: true, db });
    }

    if (body.action === "CLEAR_ALL") {
      const emptyDb = clearAllData();
      return NextResponse.json({ ok: true, message: "CRM en blanco.", db: emptyDb });
    }

    if (body.action === "RESET_DEMO_2") {
      const demoDb = resetToTwoExamples();
      return NextResponse.json({ ok: true, message: "Se cargaron los 2 ejemplos de demostración.", db: demoDb });
    }

    if (body.action === "TOGGLE_HALLOWEEN") {
      const updatedDb = setModoHalloween(Boolean(body.enabled));
      return NextResponse.json({
        ok: true,
        message: body.enabled ? "Modo Halloween activado" : "Modo Halloween desactivado",
        modo_halloween: updatedDb.config?.modo_halloween ?? true,
        db: updatedDb,
      });
    }

    if (body.action === "SET_PIN_TECNICO") {
      const updatedDb = setPinTecnico(body.pin || "2026");
      return NextResponse.json({
        ok: true,
        message: "PIN del técnico actualizado con éxito.",
        pin_tecnico: updatedDb.config?.pin_tecnico || "2026",
        db: updatedDb,
      });
    }

    // 3. Crear nueva cita desde el Asistente Conversacional o Wizard con validaciones completas y seguras
    const validNombre = validarNombre(body.nombre || "");
    if (!validNombre.valida) {
      return NextResponse.json({ ok: false, error: validNombre.error }, { status: 400 });
    }

    const validTel = validarWhatsApp(body.whatsapp || "");
    if (!validTel.valida) {
      return NextResponse.json({ ok: false, error: validTel.error }, { status: 400 });
    }

    const validDir = validarDireccion(body.calleNumero || body.direccion || "");
    if (!validDir.valida) {
      return NextResponse.json({ ok: false, error: validDir.error }, { status: 400 });
    }

    const validManchas = validarDetalleManchas(body.notas_servicio || "");
    if (!validManchas.valida) {
      return NextResponse.json({ ok: false, error: validManchas.error }, { status: 400 });
    }

    if (!Array.isArray(body.fotos_estado_actual) || body.fotos_estado_actual.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Es requerido adjuntar al menos 1 foto del estado de tus muebles para preparar el desmanchado." },
        { status: 400 }
      );
    }

    // Validación de código postal con cobertura en Jalisco
    if (body.codigo_postal) {
      const infoCp = consultarCodigoPostal(body.codigo_postal);
      if (!infoCp.valido) {
        return NextResponse.json(
          { ok: false, error: infoCp.mensajeError || "Código postal fuera de nuestra zona de cobertura en Jalisco." },
          { status: 400 }
        );
      }
    }

    // Validación de municipio permitido
    const municipiosPermitidos = ["Guadalajara", "Zapopan", "Tlajomulco", "Tlaquepaque"];
    if (!municipiosPermitidos.includes(body.municipio)) {
      return NextResponse.json(
        { ok: false, error: "Municipio no válido o fuera de zona autorizada de Jalisco." },
        { status: 400 }
      );
    }

    const sanitizedNombre = sanitizeInput(body.nombre);
    const sanitizedDireccion = sanitizeInput(body.direccion || body.calleNumero);
    const sanitizedNotas = sanitizeInput(body.notas_servicio);

    const { cita, cliente } = createBookingFromWizard({
      nombre: sanitizedNombre,
      whatsapp: body.whatsapp,
      direccion: sanitizedDireccion,
      municipio: body.municipio,
      codigo_postal: body.codigo_postal,
      colonia: body.colonia,
      calle: body.calle,
      numero_exterior: body.numero_exterior,
      coto_interior: body.coto_interior,
      coordenadas: body.coordenadas,
      mascotas: Boolean(body.mascotas),
      fecha: body.fecha,
      turno: body.turno,
      hora_especifica: body.hora_especifica,
      items_contratados: body.items_contratados || [],
      notas_servicio: sanitizedNotas,
      fotos_estado_actual: body.fotos_estado_actual || [],
    });

    const textoWhatsApp = generarMensajeWhatsAppReservaCliente(cita, cliente);
    const whatsappUrl = `https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(textoWhatsApp)}`;

    // Sincronizar de forma persistente en Supabase (evita pérdida de citas en Vercel Serverless)
    try {
      await sincronizarCitaConSupabase(cita, cliente);
    } catch (syncErr) {
      console.error("Error al sincronizar con Supabase en POST /api/crm:", syncErr);
    }

    // Registrar explícitamente en el historial del chat la solicitud generada desde la WEB
    const msgSolicitudWeb = {
      id: `web-${Date.now()}`,
      cita_id: cita.id,
      cliente_id: cliente.id,
      etapa: "1_confirmacion_inmediata",
      etapa_titulo: "Cotización Web / Maqueta 3D",
      destinatario_whatsapp: cliente.whatsapp,
      contenido_mensaje: `[Cliente]: ${textoWhatsApp}`,
      estatus_envio: "Enviado",
      fecha_programada: new Date().toISOString(),
    };
    const dbInstancia = getDatabase();
    dbInstancia.mensajes_automatizacion.unshift(msgSolicitudWeb as any);
    try {
      await supabase.from("mensajes_automatizacion").insert(msgSolicitudWeb);
      
      // Notificar al Inbox en tiempo real para que aparezca al instante en el CRM
      const chInbox = supabase.channel("kanan_chat_inbox_channel", { config: { broadcast: { ack: false } } });
      await chInbox.send({
        type: "broadcast",
        event: "nuevo_mensaje",
        payload: {
          mensaje: msgSolicitudWeb,
          cliente: {
            id: cliente.id,
            nombre: cliente.nombre,
            whatsapp: cliente.whatsapp,
          },
        },
      });
    } catch (errWebMsg) {
      console.warn("Error registrando mensaje web en automatización:", errWebMsg);
    }

    // Envío automático al WhatsApp del cliente vía servicio de Chat
    // Mandamos el mensaje formal de la reserva hacia el WhatsApp para que tanto tú como el cliente tengan el desglose completo en el chat
    let autoEnviado = false;
    try {
      const { enviarMensajeChat } = await import("@/lib/chat/bridgeClient");
      // Enviar el detalle formal de la solicitud generada en la web directamente al WhatsApp
      await enviarMensajeChat(cliente.whatsapp, textoWhatsApp);
      autoEnviado = true;
    } catch (chatErr) {
      console.error("No se pudo autodespachar el mensaje de reserva:", chatErr);
    }

    return NextResponse.json({
      ok: true,
      cita,
      cliente,
      whatsappUrl,
      autoEnviado,
      db: getDatabase(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar solicitud";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(req)) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Sesión de administrador requerida." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.type === "UPDATE_CITA") {
      await getDatabaseAsync();
      const updated = updateCitaInDb(body.citaId, {
        estatus: body.estatus,
        tecnico_asignado: body.tecnico_asignado,
        monto_total: body.monto_total,
        metodo_pago: body.metodo_pago,
        requiere_factura: body.requiere_factura,
        rfc_factura: body.rfc_factura,
        razon_social: body.razon_social,
        calificacion: body.calificacion,
        notas_servicio: body.notas_servicio,
        tipo_tela: body.tipo_tela,
        manchas_dificiles: body.manchas_dificiles,
        instrucciones_acceso: body.instrucciones_acceso,
        cuenta_con_agua_y_luz: body.cuenta_con_agua_y_luz,
        fotos_antes_despues: body.fotos_antes_despues,
        firma_conformidad: body.firma_conformidad,
        fecha: body.fecha,
        turno: body.turno,
        hora_especifica: body.hora_especifica,
      });

      if (updated) {
        const db = getDatabase();
        const cli = db.clientes.find((c) => c.id === updated.cliente_id);
        await sincronizarCitaConSupabase(updated, cli).catch((e) => console.error("Error sync Supabase PATCH:", e));
        if (body.estatus === "Confirmada" && cli) {
          await despacharCitaConfirmada(updated, cli).catch((e) =>
            console.error("Error despachando cita confirmada:", e)
          );
        }
      }

      return NextResponse.json({
        ok: Boolean(updated),
        cita: updated,
        db: getDatabase(),
      });
    }

    if (body.type === "UPDATE_CLIENTE") {
      const db = getDatabase();
      const cli = db.clientes.find((c) => c.id === body.clienteId);
      if (cli) {
        if (body.nombre !== undefined) cli.nombre = body.nombre.trim();
        if (body.whatsapp !== undefined) cli.whatsapp = body.whatsapp.replace(/\D/g, "");
        if (body.direccion !== undefined) cli.direccion = body.direccion.trim();
        if (body.municipio !== undefined) cli.municipio = body.municipio;
        if (body.email !== undefined) cli.email = body.email.trim();
        if (body.notas_especiales !== undefined) cli.notas_especiales = body.notas_especiales;
        if (body.mascotas !== undefined) cli.mascotas = Boolean(body.mascotas);
        saveDatabase(db);
      }
      return NextResponse.json({ ok: true, db });
    }

    if (body.type === "UPDATE_RECURRENCIA") {
      const db = getDatabase();
      const rec = db.recurrencia.find((r) => r.id === body.recurrenciaId);
      if (rec && body.estatus_contacto) {
        rec.estatus_contacto = body.estatus_contacto;
        saveDatabase(db);
      }
      return NextResponse.json({ ok: true, db });
    }

    return NextResponse.json({ ok: false, error: "Tipo de actualización no válido" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar registro";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
