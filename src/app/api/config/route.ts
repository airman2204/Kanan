import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/store";

export async function GET() {
  try {
    const db = getDatabase();

    // Entregar únicamente slots ocupados (fecha, turno, hora y municipio) para semáforo de disponibilidad sin exponer datos personales
    const slotsOcupados = (db.servicios_citas || [])
      .filter((c) => c.estatus !== "Cancelada")
      .map((c) => ({
        fecha: c.fecha,
        turno: c.turno,
        hora_especifica: c.hora_especifica,
        municipio: (db.clientes || []).find((cl) => cl.id === c.cliente_id)?.municipio || "",
      }));

    return NextResponse.json({
      ok: true,
      modo_halloween: Boolean(db.config?.modo_halloween),
      slotsOcupados,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      modo_halloween: false,
      slotsOcupados: [],
    });
  }
}
