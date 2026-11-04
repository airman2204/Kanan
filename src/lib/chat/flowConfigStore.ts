import { AgentFlowConfig, FlowNode } from '@/types/agentFlow';

export const DEFAULT_AGENT_FLOW_CONFIG: AgentFlowConfig = {
  id: 'kanan_default_flow',
  version: 1,
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
      y: 180,
      siguienteNodoId: ['nodo_recepcion_cliente']
    },
    'nodo_recepcion_cliente': {
      id: 'nodo_recepcion_cliente',
      tipo: 'whatsapp_message',
      titulo: '2. Recepción y Folio',
      subtitulo: 'Aviso inmediato con folio y regla de 2 horas',
      icono: 'MessageSquareText',
      enabled: true,
      x: 360,
      y: 180,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.jpg',
      delaySegundos: 2,
      mensajePlantilla: `👋 ¡Hola *{nombre}*! Recibimos con éxito tu solicitud de servicio en *Kanan Limpieza*.

📋 *Folio de Servicio:* {folio}
🛋️ *Servicio(s):* {piezas}
📅 *Fecha agendada:* {fecha} ({turno})
📍 *Dirección:* {direccion}

⏳ Nuestro equipo está revisando los detalles para enviarte tu cotización formal.
⚠️ *Importante:* Podrás reagendar o cancelar sin costo con al menos *2 horas de anticipación* a tu horario programado.`,
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
      y: 180,
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
      y: 180,
      stickerPath: '/assets/stickers/kanan-sticker-cotizacion.jpg',
      delaySegundos: 3,
      mensajePlantilla: `💰 ¡Hola *{nombre}*! Tu cotización para el folio *{folio}* está lista:

🏷️ *Servicios:* {piezas}
💵 *Monto Total:* *{precio}*
📅 *Fecha acordada:* {fecha} ({turno})

¿Nos confirmas tu cita para agendar el equipo técnico?
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
      y: 180,
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
      stickerPath: '/assets/stickers/kanan-sticker-confirmada.jpg',
      delaySegundos: 2,
      mensajePlantilla: `🎉 ¡Excelente, *{nombre}*! Tu cita ha quedado *CONFIRMADA*.

📋 *Folio:* {folio}
📅 *Fecha:* {fecha} ({turno})
📍 *Dirección:* {direccion}

Nuestros técnicos acudirán en el horario programado. ¡Gracias por confiar en Kanan Limpieza! 🧼✨`,
      siguienteNodoId: ['nodo_tecnico_en_camino'],
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
      y: 300,
      delaySegundos: 2,
      mensajePlantilla: `Entendido *{nombre}*, tu solicitud con folio *{folio}* ha sido cancelada. Esperamos servirte en una próxima ocasión. ¡Lindo día!`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{folio}']
    },
    'nodo_tecnico_en_camino': {
      id: 'nodo_tecnico_en_camino',
      tipo: 'whatsapp_message',
      titulo: '7. Técnico en Camino',
      subtitulo: 'Notificación con Kanan Móvil y bloqueo de cancelación',
      icono: 'Truck',
      enabled: true,
      x: 2020,
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
      titulo: '8. Servicio en Proceso',
      subtitulo: 'Técnico inicia lavado. Sticker inteligente según ítem',
      icono: 'Sparkles',
      enabled: true,
      x: 2360,
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
      titulo: '9. Servicio Concluido',
      subtitulo: 'Finalización, entrega de garantía y encuesta de satisfacción',
      icono: 'Award',
      enabled: true,
      x: 2700,
      y: 60,
      stickerCategoriaEspecifica: true,
      stickerPath: '/assets/stickers/kanan-sticker-concluido.jpg',
      delaySegundos: 3,
      mensajePlantilla: `🌟 ¡Listo *{nombre}*! Tu servicio ha quedado impecable y concluido con éxito.

🛋️ *Servicio:* {piezas}
📋 *Folio:* {folio}

Tu opinión es vital para nosotros. ¿Nos regalas 30 segundos para calificar el trabajo de *{tecnico}*?
⭐ *Evalúa aquí tu servicio:* {enlace_encuesta}

¡Muchas gracias por elegir Kanan Limpieza!`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{piezas}', '{folio}', '{tecnico}', '{enlace_encuesta}']
    }
  }
};

const STORAGE_KEY = 'kanan_agent_flow_config_v1';

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
      version: (config.version || 1) + 1,
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
