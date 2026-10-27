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
  email?: string;
}

export interface ServicioCita {
  id: string;
  cliente_id: string;
  fecha: string;
  turno: TurnoServicio;
  hora_especifica?: string;
  items_contratados: ItemContratado[];
  monto_total: number | null;
  estatus: EstatusCita;
  tecnico_asignado: string;
  ruta_geografica: string;
  notas_servicio: string;
  fotos_estado_actual: string[];
  fotos_antes_despues: FotoAntesDespues[];
  calificacion: number | null;
  ticket_soporte: boolean;
  origen?: "web" | "manual" | "whatsapp";
  created_at: string;
  cancelled_at?: string;
  cancel_reason?: string;
}

export interface RegistroRecurrencia {
  id: string;
  cliente_id: string;
  cita_id: string;
  ultimo_servicio: string;
  disparador: DisparadorRecurrencia;
  proxima_fecha_contacto: string;
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

export interface MetaConnection {
  conectado: boolean;
  app_id?: string;
  app_secret?: string;
  page_id?: string;
  page_name?: string;
  ig_account_name?: string;
  access_token?: string;
  connected_at?: string;
  metricas_reales?: {
    seguidores_fb: number;
    seguidores_ig: number;
    alcance_30d: number;
    impresiones_30d: number;
    interacciones_30d: number;
    clics_al_sitio: number;
    tasa_engagement: number;
    visitas_al_perfil: number;
  };
}

export interface GoogleAdsConnection {
  conectado: boolean;
  customer_id?: string;
  account_name?: string;
  connected_at?: string;
  metricas_reales?: {
    inversion_30d: number;
    impresiones: number;
    clics: number;
    cpc_promedio: number;
    ctr_promedio: number;
    conversiones: number;
    costo_por_conversion: number;
    campanias_activas: { nombre: string; presupuesto_diario: number; estado: string; conversiones: number }[];
  };
}

export interface SeoAnalytics {
  conectado: boolean;
  search_console_property?: string;
  metricas_reales?: {
    clics_organicos: number;
    impresiones_organicas: number;
    ctr_organico: number;
    posicion_promedio: number;
    top_consultas: { query: string; clics: number; impresiones: number; posicion: number }[];
    top_paginas: { url: string; clics: number }[];
  };
}

export interface MarketingMetrics {
  meta: MetaConnection;
  google_ads: GoogleAdsConnection;
  seo_sem: SeoAnalytics;
}

export interface KananConfig {
  modo_halloween: boolean;
  marketing?: MarketingMetrics;
}

export interface KananDatabase {
  clientes: Cliente[];
  servicios_citas: ServicioCita[];
  recurrencia: RegistroRecurrencia[];
  mensajes_automatizacion: MensajeAutomatizacion[];
  config?: KananConfig;
}
