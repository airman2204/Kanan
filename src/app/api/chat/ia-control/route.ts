import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get("clienteId");

    if (clienteId) {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("value")
        .eq("session_id", "ia_settings")
        .eq("key", clienteId)
        .single();

      const modoIa = data?.value?.modo_ia !== false; // por defecto activo true
      return NextResponse.json({ ok: true, clienteId, modoIa });
    }

    const { data } = await supabase
      .from("whatsapp_sessions")
      .select("key, value")
      .eq("session_id", "ia_settings");

    const settingsMap: Record<string, boolean> = {};
    if (data) {
      data.forEach((row) => {
        settingsMap[row.key] = row.value?.modo_ia !== false;
      });
    }

    return NextResponse.json({ ok: true, settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clienteId, modoIa } = body;

    if (!clienteId || typeof modoIa !== "boolean") {
      return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
    }

    await supabase.from("whatsapp_sessions").upsert(
      {
        session_id: "ia_settings",
        key: clienteId,
        value: { modo_ia: modoIa },
      },
      { onConflict: "session_id,key" }
    );

    return NextResponse.json({ ok: true, clienteId, modoIa });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
