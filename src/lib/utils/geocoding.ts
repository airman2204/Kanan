/**
 * Servicio de Geocodificación gratuito basado en OpenStreetMap / Photon / Nominatim.
 * Acotado a la Zona Metropolitana de Guadalajara (Jalisco, México).
 */

export interface ResultadoDireccionOSM {
  nombreCompleto: string;
  calle?: string;
  numero?: string;
  colonia?: string;
  municipio?: string;
  codigoPostal?: string;
  lat: number;
  lng: number;
}

// Bounding box aproximado de la ZMG (Guadalajara, Zapopan, Tlajomulco, Tlaquepaque)
// minLon, minLat, maxLon, maxLat
const ZMG_BBOX = "-103.65,20.40,-103.15,20.85";

/**
 * Autocompletado de calles en ZMG usando Photon (OpenStreetMap)
 */
export async function buscarCallesZMG(query: string): Promise<ResultadoDireccionOSM[]> {
  const clean = query.trim();
  if (clean.length < 3) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      clean + " Jalisco"
    )}&lat=20.6767&lon=-103.347&bbox=${ZMG_BBOX}&limit=5`;

    const res = await fetch(url, { headers: { "Accept-Language": "es" } });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) return [];

    return data.features.map((f: any) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [0, 0];
      const calle = p.street || p.name || "";
      const colonia = p.district || p.suburb || p.locality || "";
      const municipio = p.city || "";
      const cp = p.postcode || "";

      const partes = [calle];
      if (colonia) partes.push(colonia);
      if (municipio) partes.push(municipio);

      return {
        nombreCompleto: partes.filter(Boolean).join(", "),
        calle: p.street || p.name || "",
        numero: p.housenumber || "",
        colonia,
        municipio,
        codigoPostal: cp,
        lat: coords[1],
        lng: coords[0],
      };
    });
  } catch {
    return [];
  }
}

/**
 * Geocodificación inversa gratuita: Traduce Latitud/Longitud del GPS a Calle y Colonia en Jalisco.
 */
export async function geocodificarInverso(
  lat: number,
  lng: number
): Promise<ResultadoDireccionOSM | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "KananLimpieza-App/1.0 (contacto@kananlimpieza.mx)",
        "Accept-Language": "es",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.address) return null;

    const addr = data.address;
    const calle = addr.road || addr.pedestrian || addr.street || "";
    const numero = addr.house_number || "";
    const colonia = addr.suburb || addr.neighbourhood || addr.residential || "";
    const municipio = addr.city || addr.town || addr.municipality || "";
    const cp = addr.postcode || "";

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
