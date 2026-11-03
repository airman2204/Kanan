/**
 * Servicio de Geocodificación y Validación de Calles basado en OpenStreetMap (Nominatim y Photon).
 * Acotado estrictamente a la Zona Metropolitana de Guadalajara (Jalisco, México).
 */

export interface ResultadoDireccionOSM {
  nombreCompleto: string;
  calle: string;
  numero?: string;
  colonia?: string;
  municipio?: string;
  codigoPostal?: string;
  lat: number;
  lng: number;
}

// Bounding box de la ZMG (Guadalajara, Zapopan, Tlajomulco, Tlaquepaque)
const ZMG_BBOX = "-103.65,20.40,-103.15,20.85";

/**
 * Autocompletado de calles en vivo en Jalisco
 */
export async function buscarCallesZMG(query: string, municipioHint?: string): Promise<ResultadoDireccionOSM[]> {
  const clean = query.trim();
  if (clean.length < 3) return [];

  try {
    // 1. Intentar con Nominatim estructurado
    const streetParam = encodeURIComponent(clean);
    const cityParam = municipioHint ? `&city=${encodeURIComponent(municipioHint)}` : "";
    const urlNominatim = `https://nominatim.openstreetmap.org/search?format=json&street=${streetParam}${cityParam}&state=Jalisco&country=Mexico&addressdetails=1&limit=5`;

    const res = await fetch(urlNominatim, {
      headers: {
        "User-Agent": "KananLimpiezaApp/1.0 (contacto@kananlimpieza.mx)",
        "Accept-Language": "es",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => {
          const addr = item.address || {};
          const nombreCalle = addr.road || addr.pedestrian || addr.street || item.name || clean;
          const colonia = addr.neighbourhood || addr.suburb || addr.residential || "";
          const muni = addr.city || addr.town || addr.county || municipioHint || "Guadalajara";
          const cp = addr.postcode || "";

          const partesDesc = [nombreCalle];
          if (colonia) partesDesc.push(`Col. ${colonia}`);
          if (muni) partesDesc.push(muni);

          return {
            nombreCompleto: partesDesc.join(", "),
            calle: nombreCalle,
            numero: addr.house_number || "",
            colonia,
            municipio: muni,
            codigoPostal: cp,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    }

    // 2. Fallback a Photon (Komoot OSM)
    const urlPhoton = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      clean + (municipioHint ? ` ${municipioHint}` : "") + " Jalisco"
    )}&lat=20.6767&lon=-103.347&bbox=${ZMG_BBOX}&limit=5`;

    const resPhoton = await fetch(urlPhoton, { headers: { "Accept-Language": "es" } });
    if (resPhoton.ok) {
      const dataPhoton = await resPhoton.json();
      if (dataPhoton.features && Array.isArray(dataPhoton.features)) {
        return dataPhoton.features.map((f: any) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const nombreCalle = p.street || p.name || clean;
          const colonia = p.district || p.suburb || p.locality || "";
          const muni = p.city || municipioHint || "";
          const cp = p.postcode || "";

          const partesDesc = [nombreCalle];
          if (colonia) partesDesc.push(`Col. ${colonia}`);
          if (muni) partesDesc.push(muni);

          return {
            nombreCompleto: partesDesc.join(", "),
            calle: nombreCalle,
            numero: p.housenumber || "",
            colonia,
            municipio: muni,
            codigoPostal: cp,
            lat: coords[1],
            lng: coords[0],
          };
        });
      }
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Geocodificación inversa: Al presionar "Detectar mi dirección por GPS",
 * extrae calle, colonia, municipio y código postal reales y comprobados.
 */
export async function geocodificarInverso(
  lat: number,
  lng: number
): Promise<ResultadoDireccionOSM | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "KananLimpiezaApp/1.0 (contacto@kananlimpieza.mx)",
        "Accept-Language": "es",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.address) return null;

    const addr = data.address;
    const calle = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || "";
    const numero = addr.house_number || "";
    const colonia = addr.neighbourhood || addr.suburb || addr.residential || "";
    let municipio = addr.city || addr.town || addr.municipality || addr.county || "";
    if (municipio.toLowerCase().includes("tlajomulco")) municipio = "Tlajomulco";
    else if (municipio.toLowerCase().includes("zapopan")) municipio = "Zapopan";
    else if (municipio.toLowerCase().includes("tlaquepaque")) municipio = "Tlaquepaque";
    else if (municipio.toLowerCase().includes("guadalajara")) municipio = "Guadalajara";

    const cp = addr.postcode ? addr.postcode.replace(/\D/g, "").slice(0, 5) : "";

    return {
      nombreCompleto: data.display_name || "",
      calle,
      numero,
      colonia,
      municipio,
      codigoPostal: cp,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}
