import { AgentFlowConfig, FlowNode } from '@/types/agentFlow';

export const DEFAULT_AGENT_FLOW_CONFIG: AgentFlowConfig = {
  id: 'kanan_default_flow',
  version: 3,
  ultimaActualizacion: new Date().toISOString(),
  telefonoPruebas: '3326154699',
  nodos: {
    // -------------------------------------------------------------
    // RAMA A: ENTRADA DESDE LA WEB (TORRE INTERACTIVA / AGENTE WEB)
    // -------------------------------------------------------------
    'nodo_reserva_web': {
      id: 'nodo_reserva_web',
      tipo: 'trigger',
      titulo: '1A. Selección en Web / Torre',
      subtitulo: 'Cliente elige áreas y sube fotos en kananlimpieza.mx',
      icono: 'Zap',
      enabled: true,
      x: 40,
      y: 200,
      siguienteNodoId: ['nodo_recepcion_cliente']
    },

    // -------------------------------------------------------------
    // RAMA B: ENTRADA DIRECTA POR WHATSAPP (CLIENTE ESCRIBE "HOLA")
    // -------------------------------------------------------------
    'nodo_inbound_whatsapp': {
      id: 'nodo_inbound_whatsapp',
      tipo: 'trigger',
      titulo: '1B. Entrada Directa WhatsApp',
      subtitulo: 'Cliente escribe mensaje libre o "Hola" a la línea oficial',
      icono: 'MessageSquareText',
      enabled: true,
      x: 40,
      y: 450,
      siguienteNodoId: ['nodo_wa_pedir_cp']
    },
    'nodo_wa_pedir_cp': {
      id: 'nodo_wa_pedir_cp',
      tipo: 'whatsapp_message',
      titulo: '2B. Solicitar CP (Jalisco)',
      subtitulo: 'Valida cobertura ZMG y calcula ventana de ruta',
      icono: 'Clock',
      enabled: true,
      x: 360,
      y: 450,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.png',
      delaySegundos: 2,
      mensajePlantilla: `¡Hola! 👋 Bienvenido a *Kanan Limpieza y Desinfección Profunda a Domicilio* 🐾✨

Para validar la cobertura en tu zona y verificar disponibilidad de técnicos en Jalisco:
¿Cuál es tu *Código Postal (5 dígitos)*?`,
      siguienteNodoId: ['nodo_wa_lista_colonias'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_wa_lista_colonias': {
      id: 'nodo_wa_lista_colonias',
      tipo: 'whatsapp_message',
      titulo: '3B. Lista Interactiva de Colonias',
      subtitulo: 'Menú desplegable nativo de WhatsApp (Opción A)',
      icono: 'GitFork',
      enabled: true,
      x: 680,
      y: 450,
      delaySegundos: 2,
      mensajePlantilla: `📍 *Cobertura confirmada en Jalisco.*

Por favor toca el botón de abajo y selecciona tu colonia o fraccionamiento:
[📋 Seleccionar Colonia]`,
      siguienteNodoId: ['nodo_wa_pedir_fotos'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_wa_pedir_fotos': {
      id: 'nodo_wa_pedir_fotos',
      tipo: 'whatsapp_message',
      titulo: '4B. Solicitud de Fotos y Manchas',
      subtitulo: 'Inspección de tejido y manchas antes de cotizar',
      icono: 'Sparkles',
      enabled: true,
      x: 1000,
      y: 450,
      delaySegundos: 2,
      mensajePlantilla: `¡Colonia registrada! 🐶

Para que nuestro técnico especialista evalúe el tipo de tela y grado de manchas:
📸 Por favor envíanos aquí de *1 a 3 fotos claras* de tus muebles o vestiduras.`,
      siguienteNodoId: ['nodo_wa_pedir_horario'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_wa_pedir_horario': {
      id: 'nodo_wa_pedir_horario',
      tipo: 'whatsapp_message',
      titulo: '5B. Selección de Día y Horario',
      subtitulo: 'Lista interactiva de slots libres del calendario',
      icono: 'CalendarCheck',
      enabled: true,
      x: 1320,
      y: 450,
      delaySegundos: 2,
      mensajePlantilla: `¡Fotos recibidas y cargadas a tu expediente! 📸

¿Qué día y horario te gustaría que acuda el especialista a tu domicilio?
Toca el botón para elegir tu horario:
[⏰ Ver Horarios Disponibles]`,
      siguienteNodoId: ['nodo_recepcion_cliente'],
      variablesDisponibles: ['{nombre}']
    },

    // -------------------------------------------------------------
    // RAMA C: CITA MANUAL CREADA POR EL DUEÑO/ADMIN EN CRM
    // -------------------------------------------------------------
    'nodo_cita_manual_admin': {
      id: 'nodo_cita_manual_admin',
      tipo: 'trigger',
      titulo: '1C. Cita Manual (Admin)',
      subtitulo: 'Agendada desde Calendario / CRM con confirmación directa',
      icono: 'CalendarCheck',
      enabled: true,
      x: 40,
      y: -60,
      siguienteNodoId: ['nodo_confirmacion_manual_admin']
    },
    'nodo_confirmacion_manual_admin': {
      id: 'nodo_confirmacion_manual_admin',
      tipo: 'whatsapp_message',
      titulo: '2C. Confirmación Inmediata',
      subtitulo: 'Notificación directa con folio, fecha, horario y monto pactado',
      icono: 'CheckCircle2',
      enabled: true,
      x: 360,
      y: -60,
      stickerPath: '/assets/stickers/kanan-sticker-listo.png',
      delaySegundos: 2,
      mensajePlantilla: `¡Hola {nombre}! 👋

Te confirmamos que tu cita ha sido agendada con éxito por nuestro equipo de *Kanan Servicios de Limpieza*:

📋 *Folio:* {folio}
🛋️ *Servicio:* {piezas}
📅 *Fecha:* {fecha}
⏰ *Horario estimado:* {turno}
💰 *Total pactado:* {precio}
📍 *Dirección:* {direccion}

🚐 *¿Qué sigue?*
El día de tu servicio, nuestro técnico te enviará un mensaje por este medio en cuanto vaya en camino a tu domicilio.

ℹ️ *Política de cambios:*
Recuerda que cuentas con hasta *2 horas antes* del horario de tu servicio para avisarnos por este medio ante cualquier cambio o reprogramación.

¡Muchas gracias por tu preferencia en *Kanan*! 🐾✨`,
      siguienteNodoId: ['nodo_recordatorio_24h'],
      variablesDisponibles: ['{nombre}', '{folio}', '{piezas}', '{fecha}', '{turno}', '{precio}', '{direccion}']
    },

    // -------------------------------------------------------------
    // CONVERGENCIA: EXPEDIENTE CREADO Y NOTIFICACIÓN DE FOLIO
    // -------------------------------------------------------------
    'nodo_recepcion_cliente': {
      id: 'nodo_recepcion_cliente',
      tipo: 'whatsapp_message',
      titulo: '2. Recepción y Folio',
      subtitulo: 'Aviso inmediato con folio e inspección de fotos en curso',
      icono: 'MessageSquareText',
      enabled: true,
      x: 1640,
      y: 200,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.png',
      delaySegundos: 2,
      mensajePlantilla: `👋 ¡Hola *{nombre}*! Recibimos con éxito tu solicitud y fotos en *Kanan Limpieza*.

📋 *Folio de Servicio:* {folio}
🛋️ *Servicio(s):* {piezas}
📅 *Fecha agendada:* {fecha} ({turno})
📍 *Dirección:* {direccion}

⏳ Nuestro técnico especialista está inspeccionando el tejido de tus fotos para enviarte tu cotización formal por este chat.
⚠️ *Importante:* Podrás reagendar o cancelar sin penalización con al menos *2 horas de anticipación*.`,
      siguienteNodoId: ['nodo_admin_revision'],
      variablesDisponibles: ['{nombre}', '{folio}', '{piezas}', '{fecha}', '{turno}', '{direccion}']
    },
    'nodo_admin_revision': {
      id: 'nodo_admin_revision',
      tipo: 'admin_action',
      titulo: '3. Inspección del Técnico',
      subtitulo: 'Técnico evalúa fotos de manchas y fija precio final',
      icono: 'UserCheck',
      enabled: true,
      x: 1980,
      y: 200,
      siguienteNodoId: ['nodo_cotizacion_formal']
    },
    'nodo_cotizacion_formal': {
      id: 'nodo_cotizacion_formal',
      tipo: 'whatsapp_message',
      titulo: '4. Cotización Formal',
      subtitulo: 'Envío de cotización con precio exacto y solicitud de confirmación',
      icono: 'DollarSign',
      enabled: true,
      x: 2300,
      y: 200,
      stickerPath: '/assets/stickers/kanan-sticker-cotizacion.png',
      delaySegundos: 3,
      mensajePlantilla: `¡Hola {nombre}! 👋

Ya revisamos las fotos de tus muebles en *Kanan Servicios de Limpieza*:
🛋️ *Servicio:* {piezas}
📅 *Fecha:* {fecha}
⏰ *Horario estimado:* {turno}
💰 *Total de tu cotización:* {precio}

¿Deseas confirmar tu servicio? Responde a este mensaje con un *"Sí"* para apartar tu turno o *"No"* si prefieres cancelarlo. 🐾✨`,
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
      x: 2640,
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
      x: 2980,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-listo.png',
      delaySegundos: 2,
      mensajePlantilla: `¡Excelente, {nombre}! 🎉

Tu cita ha quedado *Confirmada* con éxito con folio *{folio}*.

🚐 *¿Qué sigue?*
Nuestro técnico asignado te enviará una notificación por este mismo chat en cuanto vaya en camino a tu domicilio el día de tu servicio.

ℹ️ *Política de cambios y cancelaciones:*
Recuerda que cuentas con hasta *2 horas antes* del horario de tu servicio para avisarnos por este medio ante cualquier cambio.

¡Muchas gracias por tu confianza en *Kanan*! 🐾✨`,
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
      x: 2980,
      y: 360,
      delaySegundos: 2,
      mensajePlantilla: `Entendido, {nombre}. 🤝

Hemos cancelado tu solicitud de servicio conforme a lo solicitado.

Si en el futuro requieres de nuestros servicios de limpieza y desinfección profunda, con gusto estaremos a tus órdenes por este mismo chat.

¡Que tengas un excelente día! 🐾✨`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{folio}']
    },

    // -------------------------------------------------------------
    // RECORDATORIOS Y OPERACIÓN TÉCNICA
    // -------------------------------------------------------------
    'nodo_recordatorio_24h': {
      id: 'nodo_recordatorio_24h',
      tipo: 'whatsapp_message',
      titulo: '7. Recordatorio (24h Antes)',
      subtitulo: 'Aviso un día antes para asegurar presencia del cliente',
      icono: 'Clock',
      enabled: true,
      x: 3320,
      y: 60,
      stickerPath: '/assets/stickers/kanan-mascota-agendado.png',
      delaySegundos: 2,
      mensajePlantilla: `🐾 ¡Hola *{nombre}*! Te recordamos que *mañana* es tu servicio de limpieza con Kanan Limpieza.

📅 *Horario estimado:* {fecha} ({turno})
📍 *Dirección:* {direccion}
🛋️ *Servicio(s):* {piezas}

¿Nos confirmas que todo sigue en pie para recibir a nuestro equipo? (Responde *Sí* o indícanos si requieres algún ajuste con tiempo).`,
      siguienteNodoId: ['nodo_recomendaciones_previas'],
      variablesDisponibles: ['{nombre}', '{fecha}', '{turno}', '{direccion}', '{piezas}']
    },
    'nodo_recomendaciones_previas': {
      id: 'nodo_recomendaciones_previas',
      tipo: 'whatsapp_message',
      titulo: '8. Tips Previos de Llegada',
      subtitulo: 'Preparación del área: mascotas y tomas de agua/luz',
      icono: 'Sparkles',
      enabled: true,
      x: 3660,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-garantia.png',
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
      x: 4000,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-en-camino.png',
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
      x: 4340,
      y: 60,
      stickerCategoriaEspecifica: true,
      stickerPath: '/assets/stickers/kanan-sticker-en-proceso.png',
      delaySegundos: 2,
      mensajePlantilla: `✨🧼 *¡Servicio en Marcha!*
Nuestro especialista ha iniciado la limpieza profunda de tus muebles con tecnología de inyección-succión y desinfección UV.

⏱️ Tiempo aproximado de labor: 1.5 a 2.5 horas.`,
      siguienteNodoId: ['nodo_servicio_completado'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_servicio_completado': {
      id: 'nodo_servicio_completado',
      tipo: 'whatsapp_message',
      titulo: '11. Servicio Concluido y Garantía',
      subtitulo: 'Póliza digital de 7 días y tiempo de secado',
      icono: 'CheckCircle2',
      enabled: true,
      x: 4680,
      y: 60,
      stickerPath: '/assets/stickers/kanan-sticker-garantia.png',
      delaySegundos: 2,
      mensajePlantilla: `🎉 ¡Listo, *{nombre}*! Tu servicio ha concluido exitosamente.

🛡️ *Garantía de Satisfacción Kanan (7 días):*
Cuentas con 7 días naturales de respaldo ante cualquier detalle en el secado de tus telas.

⏱️ *Recomendación de secado:* Mantén ventilada la habitación durante las próximas 3 a 4 horas.

¡Muchas gracias por confiar en Kanan Servicios de Limpieza! 🐾🛋️`,
      siguienteNodoId: ['nodo_encuesta_satisfaccion'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_encuesta_satisfaccion': {
      id: 'nodo_encuesta_satisfaccion',
      tipo: 'whatsapp_message',
      titulo: '12. Encuesta Post-Servicio (3h)',
      subtitulo: 'Calificación 1-5 estrellas con stickers dinámicos',
      icono: 'Sparkles',
      enabled: true,
      x: 5020,
      y: 60,
      delaySegundos: 10800, // 3 horas
      mensajePlantilla: `🐾 ¡Hola *{nombre}*!
Tus muebles ya deben estar completamente secos y listos para disfrutarse.

¿Qué tal quedó la limpieza y atención de nuestro técnico?
Por favor califícanos respondiendo con un número del *1 al 5*:

⭐ 1 = Muy insatisfecho
⭐⭐ 2 = Regular
⭐⭐⭐ 3 = Bueno
⭐⭐⭐⭐ 4 = Muy bueno
⭐⭐⭐⭐⭐ 5 = ¡Excelente servicio!`,
      siguienteNodoId: ['nodo_decision_calificacion'],
      variablesDisponibles: ['{nombre}']
    },
    'nodo_decision_calificacion': {
      id: 'nodo_decision_calificacion',
      tipo: 'decision',
      titulo: '13. Evaluación Calificación',
      subtitulo: 'Bifurcación: 5 estrellas va a Google Maps, <4 a Soporte',
      icono: 'GitFork',
      enabled: true,
      x: 5360,
      y: 60,
      siguienteNodoId: ['nodo_google_maps_review', 'nodo_alerta_soporte']
    },
    'nodo_google_maps_review': {
      id: 'nodo_google_maps_review',
      tipo: 'whatsapp_message',
      titulo: '14. Reseña Google Maps (5★)',
      subtitulo: 'Invitación a compartir experiencia pública',
      icono: 'Award',
      enabled: true,
      x: 5700,
      y: -40,
      stickerPath: '/assets/stickers/kanan-sticker-excelente.png',
      delaySegundos: 2,
      mensajePlantilla: `🌟 ¡Muchísimas gracias por tu calificación de 5 estrellas, *{nombre}*! Nos alegra enorme haber dejado tus muebles impecables.

¿Nos apoyarías compartiendo tu reseña en Google Maps? Solo te tomará 1 minuto y nos ayuda a que más familias conozcan nuestro trabajo:
👉 {enlace_google}

¡Kanan siempre a tu servicio! 🐾❤️`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}', '{enlace_google}']
    },
    'nodo_alerta_soporte': {
      id: 'nodo_alerta_soporte',
      tipo: 'whatsapp_message',
      titulo: '14B. Soporte y Garantía (<4★)',
      subtitulo: 'Intervención inmediata de calidad',
      icono: 'XCircle',
      enabled: true,
      x: 5700,
      y: 160,
      delaySegundos: 2,
      mensajePlantilla: `Lamentamos mucho que tu experiencia no haya sido perfecta, *{nombre}*. En Kanan nos tomamos muy en serio tu satisfacción.

Un supervisor de calidad se pondrá en contacto contigo de inmediato para revisar tu garantía de 7 días y solucionar cualquier detalle sin costo adicional. 🤝`,
      siguienteNodoId: [],
      variablesDisponibles: ['{nombre}']
    }
  }
};

const STORAGE_KEY = 'kanan_agent_flow_config_v7';

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
      version: (config.version || 3) + 1,
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

export function getMensajeDesdeFlujo(
  nodoId: string,
  variables: Record<string, string | number | undefined | null>,
  fallbackMensaje?: string
): string {
  const config = getAgentFlowConfig();
  const nodo = config.nodos[nodoId];

  let plantilla = nodo?.mensajePlantilla || fallbackMensaje || '';
  if (!plantilla) return '';

  for (const [key, val] of Object.entries(variables)) {
    const token = `{${key}}`;
    const valorReemplazo = val !== undefined && val !== null ? String(val) : '';
    plantilla = plantilla.split(token).join(valorReemplazo);
  }

  return plantilla;
}