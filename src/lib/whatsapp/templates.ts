import { Cliente, ServicioCita, EtapaWhatsApp } from "@/types/crm";

export const KANAN_WHATSAPP_NUMBER = "523340160684";
export const KANAN_PHONE_DISPLAY = "33 4016 0684";
export const KANAN_GOOGLE_MAPS_REVIEW_URL = "https://www.google.com/maps/search/?api=1&query=Kanan+Servicios+de+Limpieza+Guadalajara";

export function generarMensajeWhatsAppReservaCliente(
  cita: ServicioCita,
  cliente: Cliente
): string {
  const resumenPiezas = cita.items_contratados
    .map((item) => `• ${item.cantidad}x ${item.piezaNombre} (${item.categoriaNombre})`)
    .join("\n");

  return [
    `¡Hola equipo *Kanan Servicios de Limpieza*! 🐾✨`,
    `Acabo de registrar mi solicitud de cita en la web con folio *${cita.id}*:`,
    ``,
    `👤 *Nombre:* ${cliente.nombre}`,
    `📍 *Ubicación:* ${cliente.direccion}, ${cliente.municipio}`,
    `📅 *Fecha y Turno:* ${cita.fecha} — ${cita.turno}`,
    `🐶 *Hogar con mascotas:* ${cliente.mascotas ? "Sí (100% Pet-Friendly)" : "No"}`,
    ``,
    `🛋️ *Piezas a limpiar y desinfectar:*`,
    resumenPiezas,
    cita.notas_servicio ? `\n📝 *Notas adicionales:* ${cita.notas_servicio}` : ``,
    cita.fotos_estado_actual.length > 0
      ? `📷 *Fotos adjuntas en plataforma:* ${cita.fotos_estado_actual.length} foto(s)`
      : ``,
    ``,
    `Quedo atento(a) a la confirmación de mi cita y cotización. ¡Gracias!`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generarSecuenciaPoservicio(
  cita: ServicioCita,
  cliente: Cliente
): {
  etapa: EtapaWhatsApp;
  etapa_titulo: string;
  contenido_mensaje: string;
  estatus_envio: "Enviado" | "Programado" | "Alerta Soporte";
  offset_descripcion: string;
}[] {
  const resumenCorto = cita.items_contratados
    .map((i) => `${i.cantidad}x ${i.piezaNombre}`)
    .join(", ");

  return [
    {
      etapa: "1_confirmacion_inmediata",
      etapa_titulo: "1. Inmediato a la Reserva — Confirmación",
      estatus_envio: "Enviado",
      offset_descripcion: "Inmediato (0 min)",
      contenido_mensaje: `¡Hola ${cliente.nombre}! 🛡️ Tu reserva *${cita.id}* en *Kanan Servicios de Limpieza* ha sido registrada.\n• *Servicio:* ${resumenCorto}\n• *Fecha y Turno:* ${cita.fecha} (${cita.turno})\n• *Técnico asignado:* ${cita.tecnico_asignado}\n• *Zona:* ${cliente.municipio}\nSi necesitas modificar algún dato, responde a este mensaje.`,
    },
    {
      etapa: "2_recordatorio_24h_antes",
      etapa_titulo: "2. 24 Horas Antes — Recordatorio y Preparación",
      estatus_envio: "Programado",
      offset_descripcion: "-24 horas antes de la cita",
      contenido_mensaje: `¡Hola ${cliente.nombre}! 🐾 Kanan Dog y nuestro equipo te recuerdan tu cita de mañana (${cita.fecha}, turno ${cita.turno}).\n\n*Recomendaciones previas:*\n1️⃣ Despejar el área alrededor de tus muebles.\n2️⃣ Tener accesible una toma de agua y contacto de luz.\n¡Recuerda que nuestros productos son 100% Pet-Friendly y el secado toma solo 3 a 4 horas!`,
    },
    {
      etapa: "3_encuesta_3h_poservicio",
      etapa_titulo: "3. +3 Horas Poservicio — Encuesta 1-5 Estrellas",
      estatus_envio: "Programado",
      offset_descripcion: "+3 horas tras finalizar",
      contenido_mensaje: `¡Hola ${cliente.nombre}! Gracias por confiar en *Kanan*. Tus muebles están en proceso final de secado.\n\nDel *1 al 5* (donde 5 es Excelente 🌟), ¿cómo calificarías el resultado y la atención de ${cita.tecnico_asignado}?`,
    },
    {
      etapa: "4_guia_derrames_24h_poservicio",
      etapa_titulo: "4. +24 Horas Poservicio — Guía Ante Derrames",
      estatus_envio: "Programado",
      offset_descripcion: "+24 horas poservicio",
      contenido_mensaje: `¡Hola ${cliente.nombre}! 🐶✨ Para que tus muebles se mantengan impecables por más tiempo, te regalamos nuestra *"Guía Digital de Cuidados Rápidos ante Derrames Accidentales"* aprobada por Kanan Dog:\n👉 https://servicioskanan.com/guia-cuidados`,
    },
    ...(cliente.mascotas
      ? [
          {
            etapa: "5_checkin_mes_3_mascotas" as EtapaWhatsApp,
            etapa_titulo: "5. Mes 3 — Check-in Preventivo (Hogar con Mascotas)",
            estatus_envio: "Programado" as const,
            offset_descripcion: "+90 días (Filtro: Mascotas = Sí)",
            contenido_mensaje: `¡Hola ${cliente.nombre}! 🐾 Sabemos que compartir casa con mascotas es increíble, pero el pelo y los alérgenos se acumulan cada trimestre. Han pasado 3 meses desde tu servicio (${cita.id}). ¿Te gustaría agendar un mantenimiento preventivo Pet-Friendly esta semana?`,
          },
        ]
      : []),
    {
      etapa: "6_reactivacion_mes_6_semestral",
      etapa_titulo: "6. Mes 6 — Campaña de Reactivación y Beneficio Semestral",
      estatus_envio: "Programado",
      offset_descripcion: "+180 días (Mantenimiento Semestral)",
      contenido_mensaje: `¡Hola ${cliente.nombre}! 🛡️ En *Kanan* protegemos lo que más tocas. Se cumplen 6 meses desde la desinfección profunda de tus muebles (${resumenCorto}). Agenda tu mantenimiento semestral este mes y recibe un *15% de beneficio exclusivo de cliente recurrente*. ¡Escríbenos para reservar tu turno!`,
    },
  ];
}

export function generarMensajeCalificacionPoservicio(
  cliente: Cliente,
  cita: ServicioCita,
  estrellas: number
): {
  etapa: EtapaWhatsApp;
  etapa_titulo: string;
  contenido_mensaje: string;
  estatus_envio: "Enviado" | "Alerta Soporte";
} {
  if (estrellas === 5) {
    return {
      etapa: "3a_invitacion_google_maps_5_estrellas",
      etapa_titulo: "3A. [5 Estrellas] → Invitación Directa a Google Maps",
      estatus_envio: "Enviado",
      contenido_mensaje: `¡Muchísimas gracias por tus 5 estrellas, ${cliente.nombre}! 🌟🐾 Nos ayudas enormemente compartiendo tu experiencia de 30 segundos en nuestro Google Maps oficial:\n👉 ${KANAN_GOOGLE_MAPS_REVIEW_URL}`,
    };
  }

  return {
    etapa: "3b_alerta_soporte_menor_4_estrellas",
    etapa_titulo: `3B. [${estrellas} Estrellas] → Alerta Prioritaria a Soporte y Garantía`,
    estatus_envio: "Alerta Soporte",
    contenido_mensaje: `Hola ${cliente.nombre}, lamentamos que tu experiencia en el folio *${cita.id}* no haya sido de 5 estrellas. Hemos activado un *Ticket Prioritario de Garantía por Escrito*; nuestro supervisor de calidad te contactará en breve para resolver cualquier detalle sin costo.`,
  };
}
