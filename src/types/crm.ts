export type MunicipioZMG = "Guadalajara" | "Zapopan" | "Tlajomulco" | "Tlaquepaque";

export type TurnoServicio = "Matutino (09:00 - 13:00)" | "Vespertino (14:00 - 18:00)";

export type EstatusCita =
  | "Por Confirmar"
  | "Confirmada"
  | "En Ruta"
  | "En Proceso"
  | "Completada"
  | "Cancelada";

export type DisparadorRecurrencia =
  | "3 Meses (Mascotas)"
  | "6 Meses (Semestral)"
  | "12 Meses (Anual)";

export type EstatusRecurrencia =
  | "Programado"
  | "Mensaje Enviado"
  | "Reactivado"
  | "Pospuesto";

export type EtapaWhatsApp =
  | "1_confirmacion_inmediata"
  | "2_recordatorio_24h_antes"
  | "3_encuesta_3h_poservicio"
  | "3a_invitacion_google_maps_5_estrellas"
  | "3b_alerta_soporte_menor_4_estrellas"
  | "4_guia_derrames_24h_poservicio"
  | "5_checkin_mes_3_mascotas"
  | "6_reactivacion_mes_6_semestral";

export interface ItemContratado {
  categoriaId: string;
  categoriaNombre: string;
  piezaId: string;
  piezaNombre: string;
  cantidad: number;
  detalles?: string;
}

export interface FotoAntesDespues {
  antesUrl: string;
  despuesUrl: string;
  descripcion: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string;
  direccion: string;
  municipio: MunicipioZMG;
  mascotas: boolean;
  notas_especiales: string;
  historico_gasto: number;
  fecha_registro: string;
}

export interface ServicioCita {
  id: string; // Ej: KAN-1001
  cliente_id: string;
  fecha: string; // YYYY-MM-DD
  turno: TurnoServicio;
  items_contratados: ItemContratado[];
  monto_total: number | null; // Null hasta que se cotice en CRM/WhatsApp
  estatus: EstatusCita;
  tecnico_asignado: string;
  ruta_geografica: string;
  notas_servicio: string;
  fotos_estado_actual: string[];
  fotos_antes_despues: FotoAntesDespues[];
  calificacion: number | null; // 1 - 5
  ticket_soporte: boolean;
  created_at: string;
}

export interface RegistroRecurrencia {
  id: string;
  cliente_id: string;
  cita_id: string;
  ultimo_servicio: string; // YYYY-MM-DD
  disparador: DisparadorRecurrencia;
  proxima_fecha_contacto: string; // YYYY-MM-DD
  estatus_contacto: EstatusRecurrencia;
}

export interface MensajeAutomatizacion {
  id: string;
  cita_id: string;
  cliente_id: string;
  etapa: EtapaWhatsApp;
  etapa_titulo: string;
  destinatario_whatsapp: string;
  contenido_mensaje: string;
  estatus_envio: "Enviado" | "Programado" | "Alerta Soporte";
  fecha_programada: string;
}

export interface KananConfig {
  modo_halloween: boolean;
}

export interface KananDatabase {
  clientes: Cliente[];
  servicios_citas: ServicioCita[];
  recurrencia: RegistroRecurrencia[];
  mensajes_automatizacion: MensajeAutomatizacion[];
  config?: KananConfig;
}
