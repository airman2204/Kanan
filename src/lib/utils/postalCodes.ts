import { MunicipioZMG } from "@/types/crm";

export interface InfoCodigoPostal {
  valido: boolean;
  municipio?: MunicipioZMG;
  colonias?: string[];
  mensajeError?: string;
}

// Mapeo detallado de los códigos postales más comunes en Jalisco (cobertura Kanan)
const CODIGOS_POSTALES_KANAN: Record<string, { municipio: MunicipioZMG; colonias: string[] }> = {
  // GUADALAJARA (44xxx)
  "44100": { municipio: "Guadalajara", colonias: ["Americana", "Centro", "Barranquitas"] },
  "44110": { municipio: "Guadalajara", colonias: ["Ladrón de Guevara", "Arcos Vallarta"] },
  "44130": { municipio: "Guadalajara", colonias: ["Moderna", "Mexicaltzingo"] },
  "44140": { municipio: "Guadalajara", colonias: ["La Perla", "San Juan de Dios"] },
  "44150": { municipio: "Guadalajara", colonias: ["Oblatos", "Talpita"] },
  "44160": { municipio: "Guadalajara", colonias: ["Santa Teresita", "Villaseñor"] },
  "44200": { municipio: "Guadalajara", colonias: ["Colinas de La Normal", "Alcalde Barranquitas"] },
  "44220": { municipio: "Guadalajara", colonias: ["Jardines Alcalde", "Independencia"] },
  "44240": { municipio: "Guadalajara", colonias: ["Miraflores", "Rancho Nuevo"] },
  "44300": { municipio: "Guadalajara", colonias: ["Huentitán El Alto", "Panorámica"] },
  "44330": { municipio: "Guadalajara", colonias: ["Santa Cecilia", "San Vicente"] },
  "44410": { municipio: "Guadalajara", colonias: ["La Joya", "San Antonio"] },
  "44440": { municipio: "Guadalajara", colonias: ["Ferrocarril", "Atlas"] },
  "44460": { municipio: "Guadalajara", colonias: ["Las Juntas", "El Rosario"] },
  "44500": { municipio: "Guadalajara", colonias: ["Jardines del Bosque", "Arcos Sur"] },
  "44510": { municipio: "Guadalajara", colonias: ["Chapalita Oriente", "Residencial Victoria"] },
  "44520": { municipio: "Guadalajara", colonias: ["Verde Valle", "Jardines de la Cruz"] },
  "44530": { municipio: "Guadalajara", colonias: ["Bosques de la Victoria", "Faro"] },
  "44540": { municipio: "Guadalajara", colonias: ["Colón Industrial", "Echeverría"] },
  "44600": { municipio: "Guadalajara", colonias: ["Providencia 1a Secc", "Providencia 2a Secc", "Lomas de Guevara"] },
  "44610": { municipio: "Guadalajara", colonias: ["Monraz", "Terrazas Providencia"] },
  "44620": { municipio: "Guadalajara", colonias: ["Colinas de San Javier", "Prados Providencia"] },
  "44630": { municipio: "Guadalajara", colonias: ["Italia Providencia", "Providencia 3a Secc"] },
  "44650": { municipio: "Guadalajara", colonias: ["Circunvalación Vallarta", "Ladrón de Guevara"] },
  "44670": { municipio: "Guadalajara", colonias: ["Lomas del Valle", "San Bernardo"] },
  "44680": { municipio: "Guadalajara", colonias: ["Country Club", "Jardines del Country"] },
  "44700": { municipio: "Guadalajara", colonias: ["Tetlán", "Lagos de Oriente"] },
  "44800": { municipio: "Guadalajara", colonias: ["San Pedro", "Blanco y Cuéllar"] },
  "44810": { municipio: "Guadalajara", colonias: ["Jardines de San Francisco", "Hermosa Provincia"] },
  "44840": { municipio: "Guadalajara", colonias: ["Jardines de La Paz", "San Rafael"] },
  "44900": { municipio: "Guadalajara", colonias: ["Polanco", "8 de Julio"] },
  "44920": { municipio: "Guadalajara", colonias: ["Polanquito", "Lomas de Polanco"] },
  "44950": { municipio: "Guadalajara", colonias: ["Higuerillas", "Miravalle"] },

  // ZAPOPAN (450xx - 452xx)
  "45010": { municipio: "Zapopan", colonias: ["La Estancia", "Camino Real"] },
  "45020": { municipio: "Zapopan", colonias: ["Arcos de Zapopan", "Rinconada de La Calma"] },
  "45030": { municipio: "Zapopan", colonias: ["Ciudad Granja", "Rinconada del Parque"] },
  "45040": { municipio: "Zapopan", colonias: ["Residencial Moctezuma", "Paseos del Sol"] },
  "45050": { municipio: "Zapopan", colonias: ["Ciudad del Sol", "Prados Tepeyac"] },
  "45060": { municipio: "Zapopan", colonias: ["La Calma", "Las Águilas"] },
  "45070": { municipio: "Zapopan", colonias: ["Loma Bonita", "El Campanario"] },
  "45080": { municipio: "Zapopan", colonias: ["Arboledas", "El Mante"] },
  "45100": { municipio: "Zapopan", colonias: ["Zapopan Centro", "Seattle", "El Capullo"] },
  "45110": { municipio: "Zapopan", colonias: ["Puerta de Hierro", "Andares", "Lomas Acueducto", "Santa Margarita"] },
  "45116": { municipio: "Zapopan", colonias: ["Jardines Universidad", "Vallarta Universidad"] },
  "45118": { municipio: "Zapopan", colonias: ["Villa Universitaria", "Colinas Virreyes"] },
  "45120": { municipio: "Zapopan", colonias: ["San Isidro Ejidal", "Constitución"] },
  "45130": { municipio: "Zapopan", colonias: ["Tabachines", "La Martinica"] },
  "45136": { municipio: "Zapopan", colonias: ["Paseos del Briseño", "Miramar"] },
  "45138": { municipio: "Zapopan", colonias: ["Arenales Tapatíos", "Mariano Otero"] },
  "45140": { municipio: "Zapopan", colonias: ["Villas de Guadalupe", "La Higuera"] },
  "45150": { municipio: "Zapopan", colonias: ["Jardines del Vergel", "Auditorio"] },
  "45157": { municipio: "Zapopan", colonias: ["Valle Real", "Jardines del Valle", "Real Center"] },
  "45160": { municipio: "Zapopan", colonias: ["San José del Bajío", "Rinconada de San Isidro"] },
  "45180": { municipio: "Zapopan", colonias: ["Cañadas", "Bosques de San Isidro"] },
  "45200": { municipio: "Zapopan", colonias: ["Tesistán Centro", "Santa Lucía"] },
  "45220": { municipio: "Zapopan", colonias: ["Nextipac", "La Venta del Astillero"] },
  "45235": { municipio: "Zapopan", colonias: ["El Fortín", "Foresta", "Luna Bosque"] },
  "45236": { municipio: "Zapopan", colonias: ["Bugambilias", "Palomar Secc Zapopan", "El Manantial"] },
  "45239": { municipio: "Zapopan", colonias: ["Santa Ana Tepetitlán", "Agrícola"] },

  // TLAJOMULCO DE ZÚÑIGA (4564x - 4569x)
  "45640": {
    municipio: "Tlajomulco",
    colonias: [
      "San Agustín",
      "Santa Anita",
      "Club de Golf Santa Anita",
      "El Palomar",
      "Bosques de Santa Anita",
      "La Tijera",
      "Provenza Residencial",
      "Buenavista",
      "Santa Cruz de las Flores",
      "La Cofradía",
      "Campo Sur",
      "Bosques de la Esperanza",
      "Banús",
      "Arcos de la Cruz",
      "Balcones de Tlajomulco",
      "Los Mezquites",
      "El Cortijo",
      "Vista Sur Residencial",
    ],
  },
  "45643": {
    municipio: "Tlajomulco",
    colonias: [
      "El Palomar",
      "Cielo Country Club",
      "Las Villas",
      "San Martín del Tajo",
      "Jockey Club El Palomar",
      "Cañadas El Palomar",
      "Balcones El Palomar",
    ],
  },
  "45644": {
    municipio: "Tlajomulco",
    colonias: [
      "Santa Cruz de la Loma (Tepetates)",
      "Soledad de Cruz Vieja",
    ],
  },
  "45645": {
    municipio: "Tlajomulco",
    colonias: [
      "Punto Sur",
      "Nueva Galicia",
      "La Rioja",
      "El Cielo",
      "San Martín del Tajo",
      "La Cima",
      "Villa California",
      "Los Manantiales",
      "Camino Real a Colima",
      "Altea",
      "Arbolada Bosques de Santa Anita",
      "Bellaterra",
      "Bonanza Residencial",
      "Bosque Real",
      "Bosques de las Moras",
      "Bosques de Santa Anita",
      "Club de Golf Santa Anita",
      "Cortijo de San Agustín",
      "Del Pilar Residencial",
      "El Manantial",
      "El Oro",
      "Hacienda San Agustín",
      "La Loma Residencial",
      "Lomas de Santa Anita",
      "Los Gavilanes",
      "Naturezza",
      "Nueva Galicia Residencial",
      "Pueblo Bonito",
      "Quintas Santa Anita",
      "Rinconada Santa Anita",
      "San Agustín (Pueblo)",
      "Santa Isabel",
      "Sendero las Moras",
      "Villas de Santa Anita",
    ],
  },
  "45646": {
    municipio: "Tlajomulco",
    colonias: [
      "Senderos de Monte Verde",
      "Acueducto San Agustín",
      "Acueducto San Javier",
      "Adamar",
      "El Renacimiento",
      "Hacienda Mirage",
      "Haciendas del Sur",
      "Jardines de Santa Anita",
      "Privanza Camino Real",
      "Residencial Bambú",
      "Residencial Boskia",
      "Rincón de los Copales",
      "Villas Camino Real de Colima",
      "Villas Santa Sofía",
    ],
  },
  "45647": {
    municipio: "Tlajomulco",
    colonias: [
      "La Tijera",
      "Las Moras",
      "Senderos de Monte Verde",
      "Casa Fuerte",
      "Banús Residencial",
      "Monte Verde",
      "Hacienda La Tijera",
      "Tulipanes",
      "Jardín de Las Moras",
      "Las Amapas",
      "Villas de La Tijera",
      "Cuatro Camichines de La Tijera",
    ],
  },
  "45650": {
    municipio: "Tlajomulco",
    colonias: [
      "Tlajomulco Centro",
      "San Sebastián el Grande",
      "Adamar",
      "Alta California",
      "Balcones de Santa Anita",
      "Colinas del Roble",
      "Colinas del Valle",
      "El Arroyo",
      "El Chirimoyo",
      "El Colibrí",
      "El Ojo de Agua",
      "El Paraíso",
      "Hacienda Los Eucaliptos",
      "Huertas Productivas de Jalisco",
      "Jardines de San Sebastián",
      "Jardines de Verano",
      "La Fresa",
      "La Roca",
      "Las Casas de San Sebastián",
      "Lomas de San Agustín",
      "Lomas del Sur",
      "Los Abedúles",
      "Los Arcos de San Sebastián",
      "Rinconada de San Sebastián",
      "San Miguel Residencial",
      "San Pablo",
      "Valle de San Sebastián",
      "Villas de San Sebastián",
      "Villas de Zapotepec",
      "Villas del Edén",
    ],
  },
  "45653": {
    municipio: "Tlajomulco",
    colonias: [
      "Santa Cruz de las Flores",
      "Cofradía",
      "Bellavista",
      "San Miguel Cuyutlán",
    ],
  },
  "45655": {
    municipio: "Tlajomulco",
    colonias: [
      "Los Gavilanes",
      "Rancho Santa Fe",
      "Hacienda San José",
    ],
  },
  "45680": {
    municipio: "Tlajomulco",
    colonias: [
      "Chulavista",
      "Lomas del Mirador",
      "Cantares",
      "Real del Sol",
    ],
  },
  "45690": {
    municipio: "Tlajomulco",
    colonias: [
      "Santa Fe",
      "Hacienda Santa Fe",
    ],
  },

  // SAN PEDRO TLAQUEPAQUE (455xx - 4563x)
  "45500": { municipio: "Tlaquepaque", colonias: ["San Pedro Centro", "El Parían", "Álamo"] },
  "45520": { municipio: "Tlaquepaque", colonias: ["Miravalle Tlaquepaque", "Fray Antonio Alcalde"] },
  "45540": { municipio: "Tlaquepaque", colonias: ["El Cerrito", "San Juan Evangelista"] },
  "45560": { municipio: "Tlaquepaque", colonias: ["San Pedrito", "Colinas de Santa Anita"] },
  "45570": { municipio: "Tlaquepaque", colonias: ["Colonia Hidalgo", "Buenos Aires"] },
  "45580": { municipio: "Tlaquepaque", colonias: ["Santa Anita Tlaquepaque", "Las Huertas"] },
  "45600": { municipio: "Tlaquepaque", colonias: ["Santa María Tequepexpan", "El Mante Sur"] },
  "45610": { municipio: "Tlaquepaque", colonias: ["Las Pintas", "Las Pintitas"] },
  "45620": { municipio: "Tlaquepaque", colonias: ["San Martín de las Flores", "La Guadalupana"] },
  "45630": { municipio: "Tlaquepaque", colonias: ["Valle de la Misericordia", "Toluquilla"] },
};

/**
 * Valida un código postal de 5 dígitos y determina si pertenece a la cobertura de Kanan en Jalisco
 */
export function consultarCodigoPostal(cp: string): InfoCodigoPostal {
  const cleanCP = cp.trim().replace(/\D/g, "");
  
  if (cleanCP.length !== 5) {
    return { valido: false };
  }

  const cpNum = parseInt(cleanCP, 10);

  // Validación 1: Verificar si está fuera de Jalisco (Jalisco en SEPOMEX está entre 44000 y 49999)
  if (cpNum < 44000 || cpNum > 49999) {
    return {
      valido: false,
      mensajeError: "Por el momento nuestro servicio a domicilio opera únicamente en Jalisco (Guadalajara, Zapopan, Tlajomulco y Tlaquepaque).",
    };
  }

  // Validación 2: Coincidencia exacta en nuestro catálogo de colonias de alta demanda
  if (CODIGOS_POSTALES_KANAN[cleanCP]) {
    const data = CODIGOS_POSTALES_KANAN[cleanCP];
    return {
      valido: true,
      municipio: data.municipio,
      colonias: data.colonias,
    };
  }

  // Validación 3: Rango heurístico oficial de SEPOMEX para los 4 municipios
  if (cpNum >= 44100 && cpNum <= 44990) {
    return {
      valido: true,
      municipio: "Guadalajara",
      colonias: [],
    };
  }

  if (cpNum >= 45010 && cpNum <= 45245) {
    return {
      valido: true,
      municipio: "Zapopan",
      colonias: [],
    };
  }

  if (cpNum >= 45640 && cpNum <= 45695) {
    return {
      valido: true,
      municipio: "Tlajomulco",
      colonias: [],
    };
  }

  if (cpNum >= 45500 && cpNum <= 45638) {
    return {
      valido: true,
      municipio: "Tlaquepaque",
      colonias: [],
    };
  }

  // Si es Jalisco pero es un municipio fuera de la zona metropolitana autorizada (ej. Puerto Vallarta o Lagos de Moreno)
  return {
    valido: false,
    mensajeError: "Este código postal pertenece a Jalisco pero se encuentra fuera de nuestra zona de cobertura actual (Tlajomulco, Zapopan, Guadalajara y Tlaquepaque).",
  };
}
