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
  { tag: '{enlace_encuesta}', label: 'Link de Calificación', example: 'https://kananlimpieza.mx/calificar/KAN-8492' }
];

export const STICKERS_DISPONIBLES = [
  { id: 'agendado', nombre: 'Mascota Kanan con Libreta (Agendado)', path: '/assets/stickers/kanan-mascota-agendado.jpg' },
  { id: 'cotizacion', nombre: 'Mascota con Lupa de Precio (Cotización)', path: '/assets/stickers/kanan-sticker-cotizacion.jpg' },
  { id: 'confirmada', nombre: 'Mascota Pulgar Arriba (Confirmado)', path: '/assets/stickers/kanan-sticker-confirmada.jpg' },
  { id: 'en_camino', nombre: 'Kanan Móvil en Ruta (En Camino)', path: '/assets/stickers/kanan-sticker-en-camino.jpg' },
  { id: 'en_proceso_gral', nombre: 'En Proceso - Sala (General)', path: '/assets/stickers/kanan-sticker-en-proceso.jpg' },
  { id: 'en_proceso_colchon', nombre: 'En Proceso - Colchón Impecable', path: '/assets/stickers/kanan-proceso-colchones.jpg' },
  { id: 'en_proceso_autos', nombre: 'En Proceso - Vestiduras de Auto', path: '/assets/stickers/kanan-proceso-vestiduras.jpg' },
  { id: 'en_proceso_tapetes', nombre: 'En Proceso - Tapete y Alfombras', path: '/assets/stickers/kanan-proceso-tapetes.jpg' },
  { id: 'concluido_gral', nombre: 'Concluido - Sala Reluciente', path: '/assets/stickers/kanan-sticker-concluido.jpg' },
  { id: 'concluido_colchon', nombre: 'Concluido - Colchón Sanitizado', path: '/assets/stickers/kanan-concluido-colchones.jpg' },
  { id: 'concluido_autos', nombre: 'Concluido - Interior Auto Limpio', path: '/assets/stickers/kanan-concluido-vestiduras.jpg' },
  { id: 'concluido_tapetes', nombre: 'Concluido - Tapetes Impecables', path: '/assets/stickers/kanan-concluido-tapetes.jpg' },
];
