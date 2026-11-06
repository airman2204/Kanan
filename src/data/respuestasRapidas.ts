export interface RespuestaRapida {
  id: string;
  atajo: string; // ej. /precios, /cuenta, /secado
  titulo: string;
  categoria: "cotizacion" | "pago" | "servicio" | "ubicacion" | "garantia";
  mensaje: string;
}

export const RESPUESTAS_RAPIDAS: RespuestaRapida[] = [
  {
    id: "rr-precios-salas",
    atajo: "/precios",
    titulo: "Tarifas de Limpieza de Salas",
    categoria: "cotizacion",
    mensaje: `¡Hola! Con gusto te comparto nuestras tarifas oficiales de inyección-succión profunda para salas:

🛋️ Sillón individual / reclinable: $600 MXN
🛋️ Love Seat (2 plazas): $850 MXN
🛋️ Sala estándar (3 piezas / 3-2-1): $1,400 MXN
🛋️ Sala Seccional / Escuadra (hasta 4-5 plazas): $1,650 MXN
🛋️ Sala Seccional Grande (con Chaise Lounge): $1,850 MXN

Incluye:
✨ Desinfección antibacteriana de grado hospitalario
🧼 Eliminación de ácaros y malos olores
🐾 Fórmula enzimática especial para mascotas (sin químicos agresivos)`
  },
  {
    id: "rr-cuenta-spei",
    atajo: "/cuenta",
    titulo: "Datos Bancarios para Transferencia SPEI",
    categoria: "pago",
    mensaje: `¡Claro que sí! Con gusto te proporciono los datos para transferencia SPEI:

🏦 Banco: BBVA Bancomer
👤 Beneficiario: Kanan Servicios de Limpieza
💳 CLABE Interbancaria: 012 320 015 892 458 921
🔢 Concepto / Referencia: Tu nombre o folio de servicio

Por favor envíanos la captura de tu comprobante por este mismo chat en cuanto realices tu pago para anexarlo a tu póliza de servicio. 🧾✨`
  },
  {
    id: "rr-tiempo-secado",
    atajo: "/secado",
    titulo: "Tiempo y Proceso de Secado",
    categoria: "servicio",
    mensaje: `Gracias a nuestro sistema industrial de inyección y extracción profunda de alta succión:

⏱️ El tiempo promedio de secado es de tan solo *2 a 4 horas* (en lugar de días enteros con métodos convencionales).
💨 Recomendamos mantener una ventilación natural o ventilador de techo durante la primera hora para acelerar aún más el proceso.
🐾 Al secarse, las telas quedan totalmente suaves, desinfectadas y seguras para niños y mascotas.`
  },
  {
    id: "rr-garantia",
    atajo: "/garantia",
    titulo: "Garantía de Satisfacción Kanan",
    categoria: "garantia",
    mensaje: `En *Kanan* tu tranquilidad es lo más importante:

🛡️ Contamos con *Garantía de Satisfacción Total*: si al secar notas alguna zona que requiera un repaso adicional o no quedas 100% satisfecho, nuestro técnico regresa sin ningún costo adicional dentro de los primeros 7 días naturales.
🐾 Emitimos tu certificado de servicio digital directamente al concluir el trabajo.`
  },
  {
    id: "rr-cuidados-tela",
    atajo: "/cuidados",
    titulo: "Recomendaciones después del Servicio",
    categoria: "servicio",
    mensaje: `Te compartimos estas breves recomendaciones para mantener tus muebles impecables por más tiempo:

1. Permite que el mueble termine de ventilarse completamente antes de colocarle cojines o cobijas.
2. Ante cualquier derrame accidental de líquidos, absorbe inmediatamente presionando una toalla de microfibra limpia sin frotar.
3. Puedes consultar nuestra guía digital completa de cuidados en: https://kanan-mx.vercel.app/guia-cuidados`
  },
  {
    id: "rr-cobertura-zmg",
    atajo: "/cobertura",
    titulo: "Zona de Cobertura sin Costo de Traslado",
    categoria: "ubicacion",
    mensaje: `Cubrimos toda el Área Metropolitana de Guadalajara sin costo extra de traslado:

📍 Guadalajara
📍 Zapopan
📍 Tlaquepaque
📍 Tonalá
📍 Tlajomulco de Zúñiga (incluyendo zona López Mateos Sur, Santa Anita, Punto Sur, El Manantial y Alta California)

Nuestras unidades móviles van equipadas con todo lo necesario hasta tu domicilio. 🚐✨`
  }
];
