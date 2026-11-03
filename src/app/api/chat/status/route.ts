import { NextResponse } from "next/server";
import { obtenerEstadoBridge, obtenerQrBridge } from "@/lib/chat/bridgeClient";

export async function GET() {
  try {
    const estado = await obtenerEstadoBridge();
    if (estado.status === "qr_ready" || estado.status === "connecting" || !estado.ok) {
      const qrRes = await obtenerQrBridge();
      return NextResponse.json({
        ok: true,
        status: qrRes.status || estado.status || "disconnected",
        qr: qrRes.qr || null,
        phone: estado.status === "connected" ? estado.message : null,
      });
    }

    return NextResponse.json({
      ok: true,
      status: estado.status,
      phone: estado.message || null,
      qr: null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al consultar estado de chat";
    return NextResponse.json({ ok: false, error: msg, status: "disconnected" }, { status: 500 });
  }
}
