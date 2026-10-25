import { NextRequest, NextResponse } from "next/server";
import {
  getDatabase,
  createBookingFromWizard,
  updateCitaInDb,
  clearAllData,
  resetToTwoExamples,
  setModoHalloween,
  saveDatabase,
} from "@/lib/db/store";
import { generarMensajeWhatsAppReservaCliente, KANAN_WHATSAPP_NUMBER } from "@/lib/whatsapp/templates";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Acción especial: Borrar todos los ejemplos y dejar el CRM limpio
    if (body.action === "CLEAR_ALL") {
      const emptyDb = clearAllData();
      return NextResponse.json({
        ok: true,
        message: "Todos los datos de ejemplo han sido eliminados. CRM en blanco.",
        db: emptyDb,
      });
    }

    // Acción especial: Restaurar los 2 ejemplos de demostración
    if (body.action === "RESET_DEMO_2") {
      const demoDb = resetToTwoExamples();
      return NextResponse.json({
        ok: true,
        message: "Se han cargado los 2 ejemplos de demostración.",
        db: demoDb,
      });
    }

    // Acción especial: Alternar modo Halloween
    if (body.action === "TOGGLE_HALLOWEEN") {
      const updatedDb = setModoHalloween(Boolean(body.enabled));
      return NextResponse.json({
        ok: true,
        message: body.enabled ? "Modo Halloween activado 🎃🦇" : "Modo Halloween desactivado",
        modo_halloween: updatedDb.config?.modo_halloween ?? true,
        db: updatedDb,
      });
    }

    // Crear nueva cita desde el Wizard de 4 pasos
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
    const whatsappUrl = `https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      textoWhatsApp
    )}`;

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
    const body = await req.json();

    if (body.type === "UPDATE_CITA") {
      const updated = updateCitaInDb(body.citaId, {
        estatus: body.estatus,
        tecnico_asignado: body.tecnico_asignado,
        monto_total: body.monto_total,
        calificacion: body.calificacion,
        notas_servicio: body.notas_servicio,
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
