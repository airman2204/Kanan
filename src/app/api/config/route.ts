import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/store";

export async function GET() {
  try {
    const db = getDatabase();

    // Entregar únicamente slots ocupados (fecha y turno) para semáforo de disponibilidad sin exponer datos personales
    const slotsOcupados = (db.servicios_citas || [])
      .filter((c) => c.estatus !== "Cancelada")
      .map((c) => ({
        fecha: c.fecha,
        turno: c.turno,
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
