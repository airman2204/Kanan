import { ServicioCita, Cliente } from "@/types/crm";
import { enviarMensajeChat, enviarStickerChat, enviarMediaChat } from "./bridgeClient";

/**
 * Cálculo gratuito de ruta en tiempo real con OSRM (OpenStreetMap).
 * Añade un margen prudente de tráfico para la Zona Metropolitana de Guadalajara.
 */
export async function calcularTiempoRutaMinutos(
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number
): Promise<{ minutosAprox: number; rangoTexto: string }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origenLng},${origenLat};${destinoLng},${destinoLat}?overview=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "KananLimpieza/1.0 (contacto@kananlimpieza.mx)" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const duracionMin = Math.round(data.routes[0].duration / 60);
        // Margen de tráfico prudente para la ZMG (+5 a 8 min)
        const minInferior = Math.max(10, duracionMin);
        const minSuperior = minInferior + 7;
        return {
          minutosAprox: minInferior,
          rangoTexto: `${minInferior} a ${minSuperior} minutos`,
        };
      }
    }
  } catch {
    // Fallback silencioso si no hay conexión
  }
  return { minutosAprox: 25, rangoTexto: "20 a 30 minutos" };
}

/**
 * Formatea una fecha YYYY-MM-DD a un texto amigable en español (ej. Jueves 5 de Noviembre)
 */
export function formatearFechaEspanol(fechaStr: string): string {
  if (!fechaStr) return "";
  try {
    const parts = fechaStr.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const date = new Date(year, month, day);
      const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return `${dias[date.getDay()]} ${day} de ${meses[month]}`;
    }
  } catch {
    // fallback
  }
  return fechaStr;
}

/**
 * Limpia el texto del turno para mostrar sólo el horario exacto amigable
 */
export function formatearTurnoHorario(turnoStr: string): string {
  if (!turnoStr) return "";
  const match = turnoStr.match(/\((.*?)\)/);
  if (match && match[1]) {
    return `Horario: ${match[1]} hrs`;
  }
  return turnoStr;
}

/**
 * HITO 0: Notificación automática inmediata tras agendar en la Web
 */
export async function despacharConfirmacionReservaAutomatica(
  cita: ServicioCita,
  cliente: Cliente
) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];
  const itemsTexto = (cita.items_contratados || [])
    .map((item) => `• ${item.cantidad}x ${item.piezaNombre}`)
    .join("\n");

  const fechaAmigable = formatearFechaEspanol(cita.fecha);
  const horarioAmigable = formatearTurnoHorario(cita.turno);

  const mensaje = [
    `¡Hola ${primerNombre}! 👋🐾`,
    `Hemos recibido tu solicitud de cotización en *Kanan Servicios de Limpieza*.`,
    ``,
    `📋 *Folio de Servicio:* ${cita.id}`,
    `📅 *Fecha solicitada:* ${fechaAmigable} (${horarioAmigable})`,
    `📍 *Ubicación:* ${cliente.direccion}, ${cliente.municipio}`,
    ``,
    `🛋️ *Piezas registradas:*`,
    itemsTexto || "• Servicios varios",
    ``,
    `✨ *¿Qué sigue?*`,
    `Nuestro equipo administrativo está revisando las fotos y detalles de tus muebles para enviarte la cotización formal por este chat.`,
    ``,
    `ℹ️ *Política de cambios y cancelación:*`,
    `Cuentas con hasta *2 horas antes* del horario de tu cita para cancelar o reprogramar sin penalización respondiendo a este chat.`,
    ``,
    `¡Muchas gracias por tu preferencia! 💙✨`,
  ].join("\n");

  return await enviarMensajeChat(cleanPhone, mensaje);
}

/**
 * Envía el mensaje oficial de CITA CONFIRMADA cuando el admin aprueba la cita
 */
export async function despacharCitaConfirmada(
  cita: ServicioCita,
  cliente: Cliente
) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];
  const fechaAmigable = formatearFechaEspanol(cita.fecha);
  const horarioAmigable = cita.hora_especifica || formatearTurnoHorario(cita.turno);

  const mensaje = [
    `¡Hola ${primerNombre}! ✅🐾`,
    `Tu cita en *Kanan Servicios de Limpieza* ha sido *CONFIRMADA*.`,
    ``,
    `📋 *Folio:* ${cita.id}`,
    `📅 *Fecha:* ${fechaAmigable}`,
    `⏰ *Horario:* ${horarioAmigable}`,
    `📍 *Dirección:* ${cliente.direccion}, ${cliente.municipio}`,
    ``,
    `El día de tu servicio te avisaremos por aquí cuando nuestro técnico vaya en camino. ¡Gracias por confiar en Kanan! 💙✨`,
  ].join("\n");

  return await enviarMensajeChat(cleanPhone, mensaje);
}

/**
 * HITO 1: Notificación de técnico en camino + Sticker de Kanan Móvil
 */
export async function despacharEventoEnCamino(
  cita: ServicioCita,
  cliente: Cliente,
  rangoTiempoCustom?: string
) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];
  const tiempoEstimado = rangoTiempoCustom || "20 a 30 minutos";

  const mensaje = [
    `¡Hola ${primerNombre}! 🚗✨`,
    `Tu técnico especializado de *Kanan* ya va en camino a tu domicilio en *${cliente.direccion}*.`,
    ``,
    `⏱️ *Tiempo estimado de llegada (según ruta):* ${tiempoEstimado}.`,
    `Por favor asegúrate de tener despejada el área de tus muebles para comenzar con agilidad.`,
    ``,
    `¡Nos vemos en un momento! 🐾`,
  ].join("\n");

  await enviarMensajeChat(cleanPhone, mensaje);
  // Intentar enviar el sticker oficial en webp
  await enviarStickerChat(cleanPhone, "assets/stickers/kanan-sticker-en-camino.webp");
}

/**
 * Determina el sticker específico según los ítems contratados de la cita
 */
function resolverStickerPorCategoria(cita: ServicioCita, tipo: "proceso" | "concluido"): string {
  const items = cita.items_contratados || [];
  const categorias = items.map((it) => (it.categoriaId || it.categoriaNombre || "").toLowerCase());

  if (categorias.some((cat) => cat.includes("colchon"))) {
    return tipo === "proceso"
      ? "assets/stickers/kanan-proceso-colchones.webp"
      : "assets/stickers/kanan-concluido-colchones.webp";
  }

  if (categorias.some((cat) => cat.includes("auto") || cat.includes("vestidura"))) {
    return tipo === "proceso"
      ? "assets/stickers/kanan-proceso-vestiduras.webp"
      : "assets/stickers/kanan-concluido-vestiduras.webp";
  }

  if (categorias.some((cat) => cat.includes("tapete") || cat.includes("alfombra"))) {
    return tipo === "proceso"
      ? "assets/stickers/kanan-proceso-tapetes.webp"
      : "assets/stickers/kanan-concluido-tapetes.webp";
  }

  // Por defecto: Salas y Sillas
  return tipo === "proceso"
    ? "assets/stickers/kanan-proceso-salas.webp"
    : "assets/stickers/kanan-concluido-salas.webp";
}

/**
 * HITO 2: Notificación de inicio de servicio y tratamiento de desinfección
 */
export async function despacharEventoInicioServicio(cita: ServicioCita, cliente: Cliente) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];

  const mensaje = [
    `🧼 *¡Iniciando tu servicio de limpieza profunda!*`,
    `Hola ${primerNombre}, nuestro técnico ha comenzado con la desinfección e inyección-succión de tus piezas.`,
    ``,
    `Aplicaremos fórmulas neutras que cuidan tus tejidos, remueven suciedad profunda y neutralizan olores.`,
    `Cualquier detalle especial que desees indicarle al técnico, está totalmente a tu servicio.`,
  ].join("\n");

  await enviarMensajeChat(cleanPhone, mensaje);
  // Enviar sticker específico según la categoría contratada
  const stickerPath = resolverStickerPorCategoria(cita, "proceso");
  await enviarStickerChat(cleanPhone, stickerPath);
}

/**
 * HITO 3: Notificación de fin de servicio + Secado + Tarjeta Digital + Encuesta
 */
export async function despacharEventoFinServicio(
  cita: ServicioCita,
  cliente: Cliente,
  duracionMinutos: number,
  esClienteNuevo: boolean
) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];

  // 1. Mensaje de entrega y secado
  const mensajeEntrega = [
    `✅ *¡Servicio Concluido con Éxito!*`,
    `Muchas gracias por confiar en Kanan Limpieza, ${primerNombre}.`,
    ``,
    `🌬️ *Recomendación clave de secado:*`,
    `Tus piezas secarán completamente en un lapso de *3 a 4 horas*. Mantén la habitación con buena ventilación o ventanas abiertas para acelerar el secado.`,
    cita.firma_conformidad ? `📄 Tu firma de conformidad ha quedado debidamente registrada.` : ``,
  ]
    .filter(Boolean)
    .join("\n");

  await enviarMensajeChat(cleanPhone, mensajeEntrega);
  // Enviar sticker específico de servicio concluido según la categoría
  const stickerPath = resolverStickerPorCategoria(cita, "concluido");
  await enviarStickerChat(cleanPhone, stickerPath);

  // 2. Tarjeta Digital de Lealtad y Garantía Personalizada
  const urlTarjeta = `https://kananlimpieza.mx/api/garantia/${cita.id}`;
  const mensajeTarjeta = [
    `🎁 *¡Tu Tarjeta de Garantía y Beneficios Kanan está lista!*`,
    `Nombre: *${cliente.nombre}*`,
    `Folio: *${cita.id}*`,
    `Próximo servicio sugerido: *${cliente.mascotas ? "3 meses (Mascotas 🐾)" : "6 meses (Semestral ✨)"}*`,
    ``,
    `Puedes consultar, descargar y agregar tu tarjeta a tu Wallet en este enlace exclusivo:`,
    `👉 ${urlTarjeta}`,
    ``,
    `Presentando este folio obtienes *15% de descuento directo* en tu próxima solicitud.`
  ].join("\n");

  await enviarMensajeChat(cleanPhone, mensajeTarjeta);

  // 3. Encuesta de Satisfacción Interactiva
  const encuesta = [
    `⭐ *¿Cómo calificarías el servicio y la atención hoy?*`,
    `Tu opinión nos ayuda a mantener la máxima calidad en Guadalajara.`,
    ``,
    `Responde a este chat únicamente con un número del 1 al 5:`,
    `5️⃣ — ¡Excelente, me encantó!`,
    `4️⃣ — Bueno`,
    `3️⃣ — Regular`,
    `2️⃣ — Malo`,
    `1️⃣ — Pésimo`,
  ].join("\n");

  await enviarMensajeChat(cleanPhone, encuesta);
}

/**
 * Procesar respuesta numérica de la encuesta (Filtro inteligente de Google Reviews)
 */
export async function procesarRespuestaEncuesta(
  cliente: Cliente,
  cita: ServicioCita,
  estrellas: number
) {
  const cleanPhone = cliente.whatsapp.replace(/\D/g, "");
  const primerNombre = cliente.nombre.split(" ")[0];

  if (estrellas === 5) {
    const googleDirectLink =
      "https://search.google.com/local/writereview?placeid=ChIJrwbO27bXKYQRn078yH7zCio";
    const mensaje5Estrellas = [
      `¡Muchísimas gracias, ${primerNombre}! 🌟🎉`,
      `Tu calificación de 5 estrellas significa el mundo para todo el equipo de Kanan.`,
      ``,
      `¿Nos apoyarías con 15 segundos para compartir tu experiencia en Google Maps? Abre directo la ventana con las 5 estrellas listas:`,
      `👉 ${googleDirectLink}`,
      ``,
      `¡Que disfrutes tus muebles limpios y desinfectados! 🐾🛋️`,
    ].join("\n");

    await enviarMensajeChat(cleanPhone, mensaje5Estrellas);
  } else if (estrellas <= 3) {
    const mensajeSoporte = [
      `Lamentamos mucho que tu experiencia no haya sido perfecta, ${primerNombre}.`,
      `En Kanan tu satisfacción es lo más importante. Tu reporte ha sido canalizado a nuestra coordinación para hacer válida nuestra Garantía de Satisfacción. Nos comunicaremos contigo en breve.`,
    ].join("\n");

    await enviarMensajeChat(cleanPhone, mensajeSoporte);
  } else {
    // 4 estrellas
    const mensajeAgradecimiento = [
      `¡Muchas gracias por tus comentarios, ${primerNombre}!`,
      `Seguiremos trabajando día a día para que tu próxima experiencia sea de 5 estrellas. ¡Que tengas un excelente día! ✨`,
    ].join("\n");

    await enviarMensajeChat(cleanPhone, mensajeAgradecimiento);
  }
}
