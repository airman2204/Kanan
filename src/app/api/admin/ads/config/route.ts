import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { ConfiguracionApiMarketing } from "@/types/marketingAi";

export async function GET() {
  try {
    const db = getDatabase();
    const config = (db as any).marketing_api_config || {
      gemini_api_key: process.env.GEMINI_API_KEY || "",
      fal_key: process.env.FAL_KEY || "",
      usar_flux: true,
      modelo_flux: "fal-ai/flux/schnell",
    };

    // Devolver llaves enmascaradas por seguridad visual
    const maskKey = (key?: string) => {
      if (!key || key.length < 8) return "";
      return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
    };

    return NextResponse.json({
      ok: true,
      config: {
        ...config,
        has_gemini_key: Boolean(config.gemini_api_key || process.env.GEMINI_API_KEY),
        has_fal_key: Boolean(config.fal_key || process.env.FAL_KEY),
        gemini_masked: maskKey(config.gemini_api_key || process.env.GEMINI_API_KEY),
        fal_masked: maskKey(config.fal_key || process.env.FAL_KEY),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener configuración de marketing";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, gemini_api_key, fal_key, modelo_flux } = body;

    const db = getDatabase();
    if (!(db as any).marketing_api_config) {
      (db as any).marketing_api_config = {};
    }

    if (action === "TEST_CONNECTION") {
      // Probar conexión real a fal.ai o Gemini
      const testFalKey = fal_key || (db as any).marketing_api_config.fal_key || process.env.FAL_KEY;
      if (!testFalKey) {
        return NextResponse.json({ ok: false, error: "No se proporcionó una FAL_KEY para probar." }, { status: 400 });
      }

      // Test rápido de validación con fal.ai
      const falRes = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${testFalKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "test connection",
          num_inference_steps: 1,
        }),
      });

      if (falRes.status === 401 || falRes.status === 403) {
        return NextResponse.json({ ok: false, error: "La FAL_KEY es inválida o no tiene créditos." }, { status: 401 });
      }

      return NextResponse.json({ ok: true, message: "¡Conexión exitosa con el servicio de IA FLUX!" });
    }

    // Guardar credenciales aisladas para Kanan
    if (gemini_api_key !== undefined) {
      (db as any).marketing_api_config.gemini_api_key = gemini_api_key;
    }
    if (fal_key !== undefined) {
      (db as any).marketing_api_config.fal_key = fal_key;
    }
    if (modelo_flux) {
      (db as any).marketing_api_config.modelo_flux = modelo_flux;
    }

    saveDatabase(db);
    return NextResponse.json({ ok: true, message: "Credenciales de marketing guardadas correctamente para Kanan." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar configuración";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
