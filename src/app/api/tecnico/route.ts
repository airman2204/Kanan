import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getDatabaseAsync, updateCitaInDb, sincronizarCitaConSupabase } from "@/lib/db/store";
import { ServicioCita, Cliente } from "@/types/crm";
import {
  despacharEventoEnCamino,
  despacharEventoInicioServicio,
  despacharEventoFinServicio,
} from "@/lib/chat/dispatcher";

function getPinConfigurado(): string {
  const db = getDatabase();
  return db.config?.pin_tecnico || process.env.PIN_TECNICO || "2026";
}

export async function GET(req: NextRequest) {
  try {
    const pinValido = getPinConfigurado();
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const cookiePin = req.cookies.get("kanan_pin_tecnico")?.value;

    if (pin !== pinValido && cookiePin !== pinValido) {
      return NextResponse.json(
        { ok: false, error: "PIN incorrecto o sesión no autorizada." },
        { status: 401 }
      );
    }

    const db = await getDatabaseAsync();
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoyStr = new Date().toISOString().split("T")[0];

    // Citas activas para hoy (no canceladas)
    const citasHoy = db.servicios_citas.filter(
      (c) => c.fecha === hoyStr && c.estatus !== "Cancelada"
    );

    // Mapear cada cita con los datos de su cliente
    const citasConCliente = citasHoy.map((cita) => {
      const cliente = db.clientes.find((cl) => cl.id === cita.cliente_id) || null;
      return {
        ...cita,
        cliente,
      };
    });

    const res = NextResponse.json({
      ok: true,
      fecha: hoyStr,
      citas: citasConCliente,
    });

    // Asegurar cookie de 30 días para que el técnico no tenga que volver a escribir el PIN
    res.cookies.set("kanan_pin_tecnico", pinValido, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      httpOnly: true,
      sameSite: "lax",
    });

    return res;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al consultar ruta técnica";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pinValido = getPinConfigurado();
    const body = await req.json();

    // Verificación de PIN para login
    if (body.action === "VERIFY_PIN") {
      if (body.pin === pinValido) {
        const res = NextResponse.json({ ok: true, message: "PIN correcto" });
        res.cookies.set("kanan_pin_tecnico", pinValido, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: true,
          sameSite: "lax",
        });
        return res;
      }
      return NextResponse.json({ ok: false, error: "El PIN ingresado no es válido." }, { status: 401 });
    }

    return NextResponse.json({ ok: false, error: "Acción no reconocida." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al procesar solicitud técnica";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const pinValido = getPinConfigurado();
    const cookiePin = req.cookies.get("kanan_pin_tecnico")?.value;
    const body = await req.json();

    if (cookiePin !== pinValido && body.pin !== pinValido) {
      return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
    }

    const {
      citaId,
      accion,
      estatus,
      metodo_pago,
      firma_conformidad,
      fotos_antes_despues,
      monto_total,
      duracion_minutos,
      rango_tiempo,
    } = body;
    if (!citaId) {
      return NextResponse.json({ ok: false, error: "Falta citaId." }, { status: 400 });
    }

    const db = getDatabase();
    const citaActual = db.servicios_citas.find((c) => c.id === citaId);
    const cliente = citaActual ? db.clientes.find((cl) => cl.id === citaActual.cliente_id) : null;

    let nuevoEstatus = estatus || citaActual?.estatus;
    const nowIso = new Date().toISOString();
    const updatePayload: any = {
      estatus: nuevoEstatus,
      metodo_pago,
      firma_conformidad,
      fotos_antes_despues,
      monto_total,
      duracion_minutos,
    };

    if (accion === "INICIAR_RUTA" || estatus === "En Ruta") {
      nuevoEstatus = "En Ruta";
      updatePayload.estatus = "En Ruta";
      updatePayload.hora_en_camino = nowIso;
      if (citaActual && cliente) {
        despacharEventoEnCamino(citaActual, cliente, rango_tiempo).catch(console.warn);
      }
    } else if (accion === "INICIAR_SERVICIO" || estatus === "En Proceso") {
      nuevoEstatus = "En Proceso";
      updatePayload.estatus = "En Proceso";
      updatePayload.hora_inicio = nowIso;
      if (citaActual && cliente) {
        despacharEventoInicioServicio(citaActual, cliente).catch(console.warn);
      }
    } else if (accion === "CONCLUIR_SERVICIO" || estatus === "Completada") {
      nuevoEstatus = "Completada";
      updatePayload.estatus = "Completada";
      updatePayload.hora_fin = nowIso;
      if (citaActual && cliente) {
        const citasPrevias = db.servicios_citas.filter((c) => c.cliente_id === cliente.id && c.estatus === "Completada");
        const esClienteNuevo = citasPrevias.length <= 1;
        despacharEventoFinServicio(citaActual, cliente, duracion_minutos || 90, esClienteNuevo).catch(console.warn);
      }
    }

    const updated = updateCitaInDb(citaId, updatePayload);
    if (updated) {
      sincronizarCitaConSupabase(updated, cliente).catch((e) => console.error("Error sync Supabase Tecnico:", e));
    }

    return NextResponse.json({
      ok: Boolean(updated),
      cita: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al actualizar servicio en campo";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
