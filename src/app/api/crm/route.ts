import { NextRequest, NextResponse } from "next/server";
import {
  getDatabase,
  createBookingFromWizard,
  createClienteManual,
  createCitaManual,
  updateCitaInDb,
  cancelCita,
  deleteCliente,
  clearAllData,
  resetToTwoExamples,
  setModoHalloween,
  updateMarketingConfig,
  saveDatabase,
} from "@/lib/db/store";
import { generarMensajeWhatsAppReservaCliente, KANAN_WHATSAPP_NUMBER } from "@/lib/whatsapp/templates";
import { verifySessionToken } from "@/lib/auth/security";

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
  const db = getDatabase();
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
      body.action === "TOGGLE_HALLOWEEN"
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
      return NextResponse.json({ ok: true, cita, cliente, db: getDatabase() });
    }

    if (body.action === "ADMIN_CANCEL_CITA") {
      const res = cancelCita(body.citaId, false, body.motivo);
      return NextResponse.json({ ok: true, cita: res.cita, db: getDatabase() });
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

    // 3. Crear nueva cita desde el Wizard público
    const { cita, cliente } = createBookingFromWizard({
      nombre: body.nombre,
      whatsapp: body.whatsapp,
      direccion: body.direccion,
      municipio: body.municipio,
      mascotas: Boolean(body.mascotas),
      fecha: body.fecha,
      turno: body.turno,
      items_contratados: body.items_contratados || [],
      notas_servicio: body.notas_servicio || "",
      fotos_estado_actual: body.fotos_estado_actual || [],
    });

    const textoWhatsApp = generarMensajeWhatsAppReservaCliente(cita, cliente);
    const whatsappUrl = `https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(textoWhatsApp)}`;

    return NextResponse.json({
      ok: true,
      cita,
      cliente,
      whatsappUrl,
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
        fecha: body.fecha,
        turno: body.turno,
        hora_especifica: body.hora_especifica,
      });
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
