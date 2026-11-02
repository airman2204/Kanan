import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/store";

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      ok: true,
      modo_halloween: Boolean(db.config?.modo_halloween),
    });
  } catch {
    return NextResponse.json({
      ok: true,
      modo_halloween: false,
    });
  }
}
