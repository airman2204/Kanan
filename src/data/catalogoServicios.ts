export interface ServicioItemCatalogo {
  id: string;
  categoriaId: string;
  categoriaNombre: string;
  piezaNombre: string;
  precioSugerido?: number;
}

export const CATALOGO_SERVICIOS_KANAN: ServicioItemCatalogo[] = [
  // 1. SALAS Y SILLAS
  {
    id: "sala-l",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Sala en L / Seccional (4-5 plazas)",
    precioSugerido: 1450,
  },
  {
    id: "sala-321",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Sala Tradicional (Juego 3-2-1)",
    precioSugerido: 1850,
  },
  {
    id: "sofa-3p",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Sofá de 3 Plazas / Sofá Cama",
    precioSugerido: 950,
  },
  {
    id: "loveseat-2p",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Loveseat (Sofá de 2 Plazas)",
    precioSugerido: 750,
  },
  {
    id: "sillon-individual",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Sillón Individual / Reposet / Reclinable",
    precioSugerido: 450,
  },
  {
    id: "sillas-comedor",
    categoriaId: "salas",
    categoriaNombre: "Salas y Sillas",
    piezaNombre: "Sillas de Comedor Tapizadas (por pieza)",
    precioSugerido: 120,
  },

  // 2. COLCHONES
  {
    id: "colchon-king",
    categoriaId: "colchones",
    categoriaNombre: "Colchones",
    piezaNombre: "Colchón King Size",
    precioSugerido: 1100,
  },
  {
    id: "colchon-queen",
    categoriaId: "colchones",
    categoriaNombre: "Colchones",
    piezaNombre: "Colchón Queen Size",
    precioSugerido: 950,
  },
  {
    id: "colchon-matrimonial",
    categoriaId: "colchones",
    categoriaNombre: "Colchones",
    piezaNombre: "Colchón Matrimonial",
    precioSugerido: 850,
  },
  {
    id: "colchon-individual",
    categoriaId: "colchones",
    categoriaNombre: "Colchones",
    piezaNombre: "Colchón Individual / Infantil",
    precioSugerido: 650,
  },

  // 3. VESTIDURAS AUTOMOTRICES
  {
    id: "auto-sedan",
    categoriaId: "vestiduras",
    categoriaNombre: "Vestiduras",
    piezaNombre: "Auto Sedán / Hatchback (5 Asientos)",
    precioSugerido: 1250,
  },
  {
    id: "auto-suv",
    categoriaId: "vestiduras",
    categoriaNombre: "Vestiduras",
    piezaNombre: "Camioneta SUV (5 Pasajeros)",
    precioSugerido: 1450,
  },
  {
    id: "auto-familiar",
    categoriaId: "vestiduras",
    categoriaNombre: "Vestiduras",
    piezaNombre: "Camioneta 3 Filas (7 Pasajeros) / Pick-Up",
    precioSugerido: 1750,
  },

  // 4. TAPETES Y ALFOMBRAS
  {
    id: "tapete-chico",
    categoriaId: "tapetes",
    categoriaNombre: "Tapetes",
    piezaNombre: "Tapete Mediano / Estándar (hasta 2x1.5m)",
    precioSugerido: 650,
  },
  {
    id: "tapete-grande",
    categoriaId: "tapetes",
    categoriaNombre: "Tapetes",
    piezaNombre: "Tapete Grande / Sala (más de 2x1.5m)",
    precioSugerido: 950,
  },
];
