// Utilidad para resolver Municipio y Colonia a partir del Código Postal mexicano (Jalisco / ZMG)

export interface CpData {
  municipio: string;
  colonias: string[];
}

// Prefijos de CP en Jalisco / ZMG comunes
const CP_PREFIX_MAP: Record<string, string> = {
  // Guadalajara: 44100 - 44990
  "44": "Guadalajara",
  // Zapopan: 45000 - 45245
  "450": "Zapopan",
  "451": "Zapopan",
  "452": "Zapopan",
  // Tlaquepaque: 45500 - 45638
  "455": "San Pedro Tlaquepaque",
  "456": "San Pedro Tlaquepaque",
  // Tlajomulco: 45640 - 45679
  "4564": "Tlajomulco de Zúñiga",
  "4565": "Tlajomulco de Zúñiga",
  "4566": "Tlajomulco de Zúñiga",
  "4567": "Tlajomulco de Zúñiga",
  // Tonalá: 45400 - 45429
  "454": "Tonalá",
  // El Salto: 45680 - 45698
  "4568": "El Salto",
  "4569": "El Salto",
};

export async function lookupPostalCode(cp: string): Promise<CpData | null> {
  const cleanCp = cp.trim().replace(/\D/g, "");
  if (cleanCp.length !== 5) return null;

  try {
    // Consulta a la API pública abierta de Zippopotam para códigos postales de México
    const res = await fetch(`https://api.zippopotam.us/mx/${cleanCp}`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      const places = data.places || [];
      if (places.length > 0) {
        // En Zippopotam, 'state' es el estado y 'place name' suele ser colonia o municipio
        const state = places[0].state || "";
        const colonias = places.map((p: any) => p["place name"]);
        
        // Determinar municipio por prefijo o nombre de lugar
        let municipio = "";
        for (const [prefix, mun] of Object.entries(CP_PREFIX_MAP)) {
          if (cleanCp.startsWith(prefix)) {
            municipio = mun;
            break;
          }
        }
        if (!municipio) {
          municipio = places[0]["place name"] || state;
        }

        return {
          municipio,
          colonias,
        };
      }
    }
  } catch {
    // Si no hay conexión o falla la API externa, usamos el mapa estático de Jalisco
  }

  // Fallback local por prefijos
  for (const [prefix, mun] of Object.entries(CP_PREFIX_MAP)) {
    if (cleanCp.startsWith(prefix)) {
      return {
        municipio: mun,
        colonias: [],
      };
    }
  }

  return null;
}
