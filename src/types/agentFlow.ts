export type FlowNodeType =
  | 'trigger'
  | 'whatsapp_message'
  | 'admin_action'
  | 'decision'
  | 'technician_action';

export interface FlowNodeVariable {
  tag: string;
  label: string;
  example: string;
}

export interface FlowNode {
  id: string;
  tipo: FlowNodeType;
  titulo: string;
  subtitulo: string;
  icono: string;
  enabled: boolean;
  x: number;
  y: number;
  mensajePlantilla?: string;
  stickerPath?: string;
  stickerCategoriaEspecifica?: boolean;
  delaySegundos?: number;
  siguienteNodoId?: string[];
  permiteRespuestaCliente?: boolean;
  variablesDisponibles?: string[];
}

export interface AgentFlowConfig {
  id: string;
  version: number;
  ultimaActualizacion: string;
  telefonoPruebas?: string;
  nodos: Record<string, FlowNode>;
}

export const VARIABLES_SISTEMA: FlowNodeVariable[] = [
  { tag: '{nombre}', label: 'Nombre Cliente', example: 'Carlos Mendoza' },
  { tag: '{folio}', label: 'Folio Cita', example: 'KAN-8492' },
  { tag: '{precio}', label: 'Precio Total ($)', example: '$1,350 MXN' },
  { tag: '{piezas}', label: 'Detalle de Servicios', example: '1 Sala Modular + 1 Colchón Queen' },
  { tag: '{fecha}', label: 'Fecha Agendada', example: 'Viernes 8 Nov' },
  { tag: '{turno}', label: 'Turno', example: 'Mañana (09:00 - 13:00)' },
  { tag: '{direccion}', label: 'Dirección', example: 'Av. Las Palmas 402, Juriquilla' },
  { tag: '{tecnico}', label: 'Nombre del Técnico', example: 'Mariano R.' },
  { tag: '{enlace_encuesta}', label: 'Link de Calificación', example: 'https://kananlimpieza.mx/calificar/KAN-8492' },
  { tag: '{enlace_google}', label: 'Google Maps Review', example: 'https://g.page/r/kananlimpieza/review' }
];

export const STICKERS_DISPONIBLES = [
  { id: 'agendado', nombre: 'Mascota Kanan con Libreta (Agendado)', path: '/assets/stickers/kanan-mascota-agendado.png' },
  { id: 'cotizacion', nombre: 'Mascota con Lupa de Precio (Cotización)', path: '/assets/stickers/kanan-sticker-cotizacion.png' },
  { id: 'listo', nombre: 'Técnico ¡Listo para la Acción! (Confirmado)', path: '/assets/stickers/kanan-sticker-listo.png' },
  { id: 'en_camino', nombre: 'Kanan Móvil en Ruta (En Camino)', path: '/assets/stickers/kanan-sticker-en-camino.png' },
  { id: 'en_proceso_gral', nombre: 'En Proceso - Sala (Lavado con Máquina)', path: '/assets/stickers/kanan-sticker-en-proceso.png' },
  { id: 'en_proceso_colchon', nombre: 'En Proceso - Colchón Sanitizado', path: '/assets/stickers/kanan-proceso-colchones.png' },
  { id: 'en_proceso_autos', nombre: 'En Proceso - Vestiduras de Auto', path: '/assets/stickers/kanan-proceso-vestiduras.png' },
  { id: 'en_proceso_tapetes', nombre: 'En Proceso - Tapete y Alfombras', path: '/assets/stickers/kanan-proceso-tapetes.png' },
  { id: 'concluido_gral', nombre: 'Garantía 100% Kanan (Concluido Salas)', path: '/assets/stickers/kanan-sticker-concluido.png' },
  { id: 'concluido_colchon', nombre: 'Concluido - Colchón Impecable ✨', path: '/assets/stickers/kanan-concluido-colchones.png' },
  { id: 'concluido_autos', nombre: 'Concluido - Interior Auto Reluciente ✨', path: '/assets/stickers/kanan-concluido-vestiduras.png' },
  { id: 'concluido_tapetes', nombre: 'Concluido - Tapete Restaurado ✨', path: '/assets/stickers/kanan-concluido-tapetes.png' },
  { id: 'garantia_pizarron', nombre: 'Pizarrón Recomendaciones / Garantía', path: '/assets/stickers/kanan-sticker-garantia.png' },
];
