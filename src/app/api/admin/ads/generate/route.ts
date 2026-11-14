import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { RedSocialDestino, FormatoCreativo, CampanaGenerada } from "@/types/marketingAi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      redSocial = "instagram",
      formato = "post_cuadrado",
      objetivo = "reactivacion_mascotas", // o "servicio_profundo", "temporada_calor"
      instruccionesUsuario = "",
      usarMascota = true,
    } = body;

    const db = getDatabase();
    const apiConfig = (db as any).marketing_api_config || {};
    const falKey = process.env.FAL_KEY || apiConfig.fal_key;
    const geminiKey = apiConfig.gemini_api_key || process.env.GEMINI_API_KEY;

    // 1. Redacción Estratégica Adaptada al Negocio Kanan Limpieza
    const redLabels: Record<RedSocialDestino, string> = {
      instagram: "Instagram (Enfoque Estético, Reels y Testimonios)",
      facebook: "Facebook (Enfoque Familias ZMG, Confianza y Garantía)",
      tiktok: "TikTok (Enfoque Dinámico, Hooks de 3 Segundos y Antes/Después)",
    };

    // Prompt base para FLUX.1 hiperrealista con el perro Kanan y equipo Kärcher
    const aspectRatios: Record<FormatoCreativo, { falRatio: string; desc: string }> = {
      post_cuadrado: { falRatio: "1:1", desc: "square aspect ratio 1:1" },
      story_reel: { falRatio: "9:16", desc: "vertical 9:16 mobile story reel format" },
      banner_horizontal: { falRatio: "16:9", desc: "horizontal landscape banner 16:9" },
    };

    const ratioInfo = aspectRatios[formato as FormatoCreativo] || aspectRatios.post_cuadrado;

    // Generar prompt fotográfico hiperrealista
    const promptFlux = [
      `Award-winning professional photography of a modern high-end living room in Guadalajara Mexico`,
      `clean elegant interior with warm natural lighting through floor-to-ceiling windows`,
      usarMascota ? `a friendly adorable fluffy golden dog mascot wearing a small vibrant cyan collar sitting happily next to a spotlessly clean luxury sofa` : `a pristine luxury light-beige sofa looking brand new after deep professional upholstery steam extraction`,
      `modern German cleaning extraction equipment subtly in the background`,
      `ultra realistic 8k resolution, crisp clean fabric weave textures, no dirt, zero stains, cinematic lighting, architectural digest style`,
      ratioInfo.desc,
    ].join(", ");

    // Simular o invocar FLUX si hay FAL_KEY configurada
    let imagenGeneradaUrl = "/assets/services/hero-fresh.jpg";
    if (falKey) {
      try {
        const falRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: {
            Authorization: `Key ${falKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: promptFlux,
            image_size: formato === "story_reel" ? "portrait_16_9" : formato === "banner_horizontal" ? "landscape_16_9" : "square_hd",
            num_inference_steps: 4,
            enable_safety_checker: true,
          }),
        });

        if (falRes.ok) {
          const falData = await falRes.json();
          if (falData.images && falData.images[0]?.url) {
            imagenGeneradaUrl = falData.images[0].url;
          }
        }
      } catch (e) {
        console.warn("FAL.ai invocation fallback:", e);
      }
    }

    // Copywriting específico con metodología AIDA y Hook de 3 segundos
    const campana: CampanaGenerada = {
      id: `camp-${Date.now()}`,
      redSocial: redSocial as RedSocialDestino,
      formato: formato as FormatoCreativo,
      conceptoCampana: `Campaña ${redLabels[redSocial as RedSocialDestino]} - ${objetivo.toUpperCase()}`,
      audienciaObjetivo: "Familias, dueños de mascotas y profesionistas en Zapopan, Guadalajara y Tlajomulco",
      copywriting: {
        gancho_3_segundos: "🐶 ¿Amas a tus perritos pero no el olor acumulado en tu sala?",
        cuerpo_aida: [
          "ATENCIÓN: Tu sala acumula más de 200,000 ácaros, polvo profundo y restos orgánicos por cada mes sin mantenimiento.",
          "INTERÉS: En Kanan Limpieza no tapamos los olores con perfume. Usamos tecnología alemana de inyección-succión que extrae el 90% de la humedad y desincrusta la suciedad desde el fondo de las fibras.",
          "DESEO: Tus muebles quedan limpios, con secado express en 3-4 horas y seguros para tus niños y mascotas con fórmula biodegradable grado hospitalario.",
          "ACCIÓN: Agenda en menos de 2 minutos y recibe 15% de beneficio en tu primera cita con garantía por escrito.",
        ].join("\n\n"),
        llamado_a_la_accion: "👉 Toca el botón de cotizar o envíanos un WhatsApp para agendar tu fecha.",
        hashtags_estrategicos: [
          "#KananLimpieza",
          "#LimpiezaDeSalasGDL",
          "#Zapopan",
          "#PetFriendlyGDL",
          "#TapiceriaLimpia",
          "#HogarSaludable",
        ],
      },
      promptFluxGenerado: promptFlux,
      imagenGeneradaUrl,
      generadoEn: new Date().toISOString(),
      estado: "borrador",
    };

    // Guardar en la DB
    if (!(db as any).campanas_marketing) {
      (db as any).campanas_marketing = [];
    }
    (db as any).campanas_marketing.unshift(campana);
    saveDatabase(db);

    return NextResponse.json({ ok: true, campana });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al generar campaña de marketing";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
