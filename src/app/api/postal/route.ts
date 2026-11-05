import { NextRequest, NextResponse } from "next/server";
import { consultarCodigoPostal, InfoCodigoPostal } from "@/lib/utils/postalCodes";
import { MunicipioZMG } from "@/types/crm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get("cp")?.trim().replace(/\D/g, "") || "";

  if (cp.length !== 5) {
    return NextResponse.json({
      valido: false,
      mensajeError: "El código postal debe tener 5 dígitos.",
    });
  }

  // 1. Primero intentar en catálogo local ultra rápido
  const localInfo = consultarCodigoPostal(cp);
  if (localInfo.valido && localInfo.colonias && localInfo.colonias.length > 0) {
    return NextResponse.json(localInfo);
  }

  // 2. Si no tiene colonias en catálogo local o queremos consultar la base oficial de SEPOMEX en vivo
  try {
    const apiRes = await fetch(
      `https://sepomex.kurenn.dev/api/v1/zip_codes?zip_code=${cp}&per_page=200`,
      {
        next: { revalidate: 86400 }, // Caché de 24 horas en Next.js
      }
    );

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.zip_codes && data.zip_codes.length > 0) {
        const first = data.zip_codes[0];
        const estado = first.d_estado || "";
        const mnpioRaw = first.d_mnpio || "";

        // Validar que pertenezca a Jalisco
        if (!estado.toLowerCase().includes("jalisco")) {
          return NextResponse.json({
            valido: false,
            mensajeError: "Por el momento nuestro servicio a domicilio opera únicamente en Jalisco (Guadalajara, Zapopan, Tlajomulco y Tlaquepaque).",
          });
        }

        // Mapear municipio a MunicipioZMG
        let municipio: MunicipioZMG | null = null;
        const mnpioLower = mnpioRaw.toLowerCase();
        if (mnpioLower.includes("guadalajara")) municipio = "Guadalajara";
        else if (mnpioLower.includes("zapopan")) municipio = "Zapopan";
        else if (mnpioLower.includes("tlajomulco")) municipio = "Tlajomulco";
        else if (mnpioLower.includes("tlaquepaque")) municipio = "Tlaquepaque";

        if (!municipio) {
          return NextResponse.json({
            valido: false,
            mensajeError: `El código postal pertenece a ${mnpioRaw}, Jalisco, fuera de nuestra zona de cobertura metropolitana autorizada (Guadalajara, Zapopan, Tlajomulco y Tlaquepaque).`,
          });
        }

        // Extraer lista única y limpia de colonias / asentamientos
        const colonias = Array.from(
          new Set(
            data.zip_codes
              .map((z: any) => z.d_asenta?.trim())
              .filter(Boolean)
          )
        ) as string[];

        return NextResponse.json({
          valido: true,
          municipio,
          colonias,
        });
      }
    }
  } catch (err) {
    console.error("Error al consultar SEPOMEX API:", err);
  }

  // 3. Fallback al resultado heurístico local
  return NextResponse.json(localInfo);
}
