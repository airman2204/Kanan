import { AgentFlowConfig, FlowNode } from '@/types/agentFlow';

export const DEFAULT_AGENT_FLOW_CONFIG: AgentFlowConfig = {
  id: 'kanan_default_flow',
  version: 2,
  ultimaActualizacion: new Date().toISOString(),
  telefonoPruebas: '4421234567',
  nodos: {
    'nodo_reserva_web': {
      id: 'nodo_reserva_web',
      tipo: 'trigger',
      titulo: '1. Reserva en Web',
      subtitulo: 'Cliente completa formulario en kananlimpieza.mx',
      icono: 'Zap',
      enabled: true,
      x: 40,
      y: 200,
      siguienteNodoId: ['nodo_recepcion_cliente']
    },
    'nodo_recepcion_cliente': {
      id: 'nodo_recepcion_cliente',
      tipo: 'whatsapp_message',
      titulo: '2. Recepción y Folio',
      subtitulo: 'Aviso inmediato con folio y regla estricta de 2 horas',
      icono: 'MessageSquareText',
      enabled: true,
      x: 360,
      y: 200,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.jpg',
      delaySegundos: 2,
      mensajePlantilla: `👋 ¡Hola *{nombre}*! Recibimos con éxito tu solicitud de servicio en *Kanan Limpieza*.

📋 *Folio de Servicio:* {folio}
🛋️ *Servicio(s):* {piezas}
📅 *Fecha agendada:* {fecha} ({turno})
📍 *Dirección:* {direccion}

⏳ Nuestro equipo está revisando los detalles para enviarte tu cotización formal por este chat.
⚠️ *Importante:* Podrás reagendar o cancelar sin penalización con al menos *2 horas de anticipación* a tu horario programado.`,
      siguienteNodoId: ['nodo_admin_revision'],
      variablesDisponibles: ['{nombre}', '{folio}', '{piezas}', '{fecha}', '{turno}', '{direccion}']
    },
    'nodo_admin_revision': {
      id: 'nodo_admin_revision',
      tipo: 'admin_action',
      titulo: '3. Revisión de Admin',
      subtitulo: 'El administrador valida servicios y fija precio final',
      icono: 'UserCheck',
      enabled: true,
      x: 700,
      y: 200,
      siguienteNodoId: ['nodo_cotizacion_formal']
    },
    'nodo_cotizacion_formal': {
      id: 'nodo_cotizacion_formal',
      tipo: 'whatsapp_message',
      titulo: '4. Cotización Formal',
      subtitulo: 'Envío de monto total y solicitud de confirmación',
      icono: 'DollarSign',
      enabled: true,
      x: 1020,
      y: 200,
      stickerPath: '/assets/stickers/kanan-sticker-cotizacion.jpg',
      delaySegundos: 3,
      mensajePlantilla: `💰 ¡Hola *{nombre}*! Tu cotización para el folio *{folio}* está lista:

🏷️ *Servicios:* {piezas}
💵 *Monto Total:* *{precio}*
📅 *Fecha acordada:* {fecha} ({turno})

¿Nos confirmas tu cita para apartar el equipo técnico?
👉 Por favor responde con un *Sí* para confirmar o *No* para cancelar.`,
      siguienteNodoId: ['nodo_decision_cliente'],
      variablesDisponibles: ['{nombre}', '{folio}', '{piezas}', '{precio}', '{fecha}', '{turno}']
    },
    'nodo_decision_cliente': {
      id: 'nodo_decision_cliente',
      tipo: 'decision',
      titulo: '5. Decisión del Cliente',
      subtitulo: 'Respuesta vía WhatsApp detectada por IA / Webhook',
      icono: 'GitFork',
      enabled: true,
      x: 1360,
      y: 200,
      siguienteNodoId: ['nodo_cita_confirmada', 'nodo_cancelacion_cita']
    },
    'nodo_cita_confirmada': {
      id: 'nodo_cita_confirmada',
      tipo: 'whatsapp_message',
      titulo: '6. Cita Confirmada',
      subtitulo: 'Disparado cuando el cliente responde "Sí"',
      icono: 'CheckCircle2',
      enabled: true,
      x: 1680,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-listo.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🎉 ¡Excelente, *{nombre}*! Tu cita ha quedado *CONFIRMADA*.

📋 *Folio:* {folio}
📅 *Fecha:* {fecha} ({turno})
📍 *Dirección:* {direccion}

Nuestros técnicos acudirán en el horario programado. ¡Gracias por confiar en Kanan Limpieza! 🧼✨`,
      siguienteNodoId: ['nodo_recordatorio_24h'],
      variablesDisponibles: ['{nombre}', '{folio}', '{fecha}', '{turno}', '{direccion}']
    },
    'nodo_cancelacion_cita': {
      id: 'nodo_cancelacion_cita',
      tipo: 'whatsapp_message',
      titulo: 'Cancelación Solicitud',
      subtitulo: 'Disparado cuando el cliente responde "No" o cancela con >2h',
      icono: 'XCircle',
      enabled: true,
      x: 1680,
      y: 360,
      delaySegundos: 2,
      mensajePlantilla: `Entendido *{nombre}*, tu solicitud con folio *{folio}* ha sido cancelada. Esperamos servirte en una próxima ocasión. ¡Lindo día!`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{folio}']
    },
    // MEJORA 1: Recordatorio T-24h
    'nodo_recordatorio_24h': {
      id: 'nodo_recordatorio_24h',
      tipo: 'whatsapp_message',
      titulo: '7. Recordatorio (24h Antes)',
      subtitulo: 'Aviso un día antes para asegurar presencia del cliente',
      icono: 'Clock',
      enabled: true,
      x: 2020,
      y: 60,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🐾 ¡Hola *{nombre}*! Te recordamos que *mañana* es tu servicio de limpieza con Kanan Limpieza.

📅 *Horario estimado:* {fecha} ({turno})
📍 *Dirección:* {direccion}
🛋️ *Servicio(s):* {piezas}

¿Nos confirmas que todo sigue en pie para recibir a nuestro equipo? (Responde *Sí* o indícanos si requieres algún ajuste con tiempo).`,
      siguienteNodoId: ['nodo_recomendaciones_previas'],
      variablesDisponibles: ['{nombre}', '{fecha}', '{turno}', '{direccion}', '{piezas}']
    },
    // MEJORA 2: Recomendaciones Previas de Llegada
    'nodo_recomendaciones_previas': {
      id: 'nodo_recomendaciones_previas',
      tipo: 'whatsapp_message',
      titulo: '8. Tips Previos de Llegada',
      subtitulo: 'Preparación del área: mascotas y objetos delicados',
      icono: 'Sparkles',
      enabled: true,
      x: 2360,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-garantia.jpg',
      delaySegundos: 2,
      mensajePlantilla: `💡 *Tips rápidos antes de que llegue el Kanan Móvil:*

🐶 *Mascotas:* Asegura a tus perritos o gatitos en otra habitación para evitar que se asusten con el sonido del equipo de inyección-succión.
🛋️ *Área despejada:* Retira cojines decorativos, mantas o artículos frágiles de la sala.
⚡ *Tomas de luz y agua:* Necesitaremos acceso a una toma de corriente y llave de agua limpia.

¡Nos vemos en breve para dejar tus muebles como nuevos! 🧼✨`,
      siguienteNodoId: ['nodo_tecnico_en_camino'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_tecnico_en_camino': {
      id: 'nodo_tecnico_en_camino',
      tipo: 'whatsapp_message',
      titulo: '9. Técnico en Camino',
      subtitulo: 'Notificación con Kanan Móvil y bloqueo de cancelación',
      icono: 'Truck',
      enabled: true,
      x: 2700,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-en-camino.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🚗💨 ¡Hola *{nombre}*! Nuestro técnico *{tecnico}* va en camino a tu domicilio a bordo del *Kanan Móvil*.

📍 *Destino:* {direccion}
⏱️ *Estimado de llegada:* 15 a 30 minutos.

Por favor asegúrate de estar disponible para recibir al equipo. ¡Ya casi llegamos!`,
      siguienteNodoId: ['nodo_servicio_en_proceso'],
      variablesDisponibles: ['{nombre}', '{tecnico}', '{direccion}']
    },
    'nodo_servicio_en_proceso': {
      id: 'nodo_servicio_en_proceso',
      tipo: 'whatsapp_message',
      titulo: '10. Servicio en Proceso',
      subtitulo: 'Técnico inicia lavado con máquina de inyección-succión',
      icono: 'Sparkles',
      enabled: true,
      x: 3040,
      y: 60,
      stickerCategoriaEspecifica: true,
      stickerPath: '/assets/stickers/kanan-sticker-en-proceso.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🧼✨ ¡Hola *{nombre}*! Hemos comenzado con la limpieza profunda de tus muebles:

🛋️ *Servicios:* {piezas}
📋 *Folio:* {folio}

Estamos aplicando nuestro proceso de inyección-succión y desinfección profunda. Te avisaremos en cuanto esté 100% terminado.`,
      siguienteNodoId: ['nodo_servicio_concluido'],
      variablesDisponibles: ['{nombre}', '{piezas}', '{folio}']
    },
    'nodo_servicio_concluido': {
      id: 'nodo_servicio_concluido',
      tipo: 'whatsapp_message',
      titulo: '11. Concluido y Garantía',
      subtitulo: 'Entrega formal y activación de Garantía 100% Kanan',
      icono: 'Award',
      enabled: true,
      x: 3380,
      y: 60,
      stickerCategoriaEspecifica: true,
      stickerPath: '/assets/stickers/kanan-sticker-concluido.jpg',
      delaySegundos: 3,
      mensajePlantilla: `🌟 ¡Listo *{nombre}*! Tu servicio ha quedado impecable y concluido con éxito.

🛋️ *Servicio:* {piezas}
📋 *Folio:* {folio}
🛡️ Tu servicio cuenta con la *Garantía 100% Kanan*.

Por favor mantén las áreas bien ventiladas durante las próximas 3 a 4 horas para un secado óptimo.`,
      siguienteNodoId: ['nodo_filtro_satisfaccion'],
      variablesDisponibles: ['{nombre}', '{piezas}', '{folio}', '{tecnico}']
    },
    // MEJORA 3: Filtro Anti-Malas Reseñas (Google Maps vs Soporte)
    'nodo_filtro_satisfaccion': {
      id: 'nodo_filtro_satisfaccion',
      tipo: 'whatsapp_message',
      titulo: '12. Filtro de Satisfacción (1 al 5)',
      subtitulo: 'Pregunta previa para proteger reputación pública en Google',
      icono: 'GitFork',
      enabled: true,
      x: 3720,
      y: 60,
      delaySegundos: 3,
      mensajePlantilla: `¿Qué tal te pareció la atención de *{tecnico}* y el resultado de tu servicio?

Por favor califícanos respondiendo con un número del *1 al 5*:
⭐ *5:* ¡Excelente, me encantó!
⭐ *4:* Muy bueno
⭐ *1 al 3:* Tengo un detalle o no quedé conforme`,
      siguienteNodoId: ['nodo_google_review', 'nodo_soporte_garantia'],
      variablesDisponibles: ['{nombre}', '{tecnico}']
    },
    'nodo_google_review': {
      id: 'nodo_google_review',
      tipo: 'whatsapp_message',
      titulo: '⭐ 5 Estrellas en Google Maps',
      subtitulo: 'Se dispara si responde 4 o 5 (Impulsa tu reputación en Google)',
      icono: 'CheckCircle2',
      enabled: true,
      x: 4060,
      y: -30,
      stickerPath: '/assets/stickers/kanan-sticker-listo.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🎉 ¡Muchísimas gracias, *{nombre}*! Nos alegra enorme que hayas quedado encantado con el trabajo.

¿Nos apoyarías regalándonos tu reseña de 5 estrellas en Google? Nos ayuda muchísimo a que más familias conozcan Kanan:
👉 *Calificar en Google Maps:* {enlace_google}

¡Gracias de corazón por tu confianza! 💙🐾`,
      siguienteNodoId: ['nodo_seguimiento_secado'],
      variablesDisponibles: ['{nombre}', '{enlace_google}']
    },
    'nodo_soporte_garantia': {
      id: 'nodo_soporte_garantia',
      tipo: 'whatsapp_message',
      titulo: '⚠️ Atención de Inconformidad (Garantía)',
      subtitulo: 'Se dispara si responde 1, 2 o 3 (Retiene queja internamente)',
      icono: 'XCircle',
      enabled: true,
      x: 4060,
      y: 150,
      delaySegundos: 2,
      mensajePlantilla: `Lamentamos mucho que tu experiencia no haya sido perfecta, *{nombre}*. Tu satisfacción es nuestra prioridad #1.

He generado un ticket prioritario con folio *{folio}* para nuestro supervisor de calidad. En breve nos comunicaremos contigo para hacer válida tu *Garantía 100% Kanan* sin ningún costo extra.`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{folio}']
    },
    // MEJORA 4: Seguimiento Post-Secado (Mismo día por la tarde)
    'nodo_seguimiento_secado': {
      id: 'nodo_seguimiento_secado',
      tipo: 'whatsapp_message',
      titulo: '13. Seguimiento Post-Secado',
      subtitulo: 'Validación de resultado una vez que el tejido secó al 100%',
      icono: 'Clock',
      enabled: true,
      x: 4400,
      y: -30,
      delaySegundos: 4,
      mensajePlantilla: `👋 ¡Hola *{nombre}*! Esperamos que tus muebles ya estén completamente secos.

¿Qué tal se siente el tejido y el aroma limpio? Recuerda que estamos a tus órdenes ante cualquier duda. ¡Disfruta tu espacio renovado! ✨🛋️`,
      siguienteNodoId: ['nodo_reactivacion_6meses'],
      variablesDisponibles: ['{nombre}']
    },
    // MEJORA 5: Re-activación a los 6 Meses
    'nodo_reactivacion_6meses': {
      id: 'nodo_reactivacion_6meses',
      tipo: 'whatsapp_message',
      titulo: '14. Re-activación (6 Meses)',
      subtitulo: 'Campana automática de recompra y fidelización periódica',
      icono: 'DollarSign',
      enabled: true,
      x: 4740,
      y: -30,
      stickerPath: '/assets/stickers/kanan-sticker-cotizacion.jpg',
      delaySegundos: 3,
      mensajePlantilla: `🐾 ¡Hola *{nombre}*! Ha pasado un tiempo desde que consentimos tus muebles con Kanan Limpieza.

Los expertos recomiendan realizar limpieza profunda cada 6 meses para eliminar ácaros y prolongar la vida útil de tus telas.

🎁 Por ser cliente frecuente, tienes un *15% de descuento exclusivo* en tu siguiente servicio si agendas esta semana.
¿Te gustaría que te preparemos una cotización con descuento? Responde *Sí* y te atendemos con gusto.`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}']
    }
  }
};

const STORAGE_KEY = 'kanan_agent_flow_config_v2';

export function getAgentFlowConfig(): AgentFlowConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_AGENT_FLOW_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AGENT_FLOW_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AGENT_FLOW_CONFIG,
      ...parsed,
      nodos: {
        ...DEFAULT_AGENT_FLOW_CONFIG.nodos,
        ...(parsed.nodos || {})
      }
    };
  } catch {
    return DEFAULT_AGENT_FLOW_CONFIG;
  }
}

export function saveAgentFlowConfig(config: AgentFlowConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...config,
      version: (config.version || 2) + 1,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error al guardar configuración de agente:', err);
  }
}

export function resetAgentFlowConfig(): AgentFlowConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_AGENT_FLOW_CONFIG;
}
