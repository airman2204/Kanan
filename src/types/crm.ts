export type MunicipioZMG = string;

export type TurnoServicio =
  | "Matutino (09:00 - 13:00)"
  | "Vespertino (14:00 - 18:00)"
  | "Lunes a Viernes (09:00 - 14:00)"
  | "Sábado y Domingo (08:00 - 13:00)"
  | "Lunes a Domingo (09:00 - 16:00)"
  | string;

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
  municipio: string;
  codigo_postal?: string;
  colonia?: string;
  mascotas: boolean;
  notas_especiales: string;
  historico_gasto: number;
  fecha_registro: string;
  email?: string;
}

export type MetodoPago = "Efectivo" | "Transferencia SPEI" | "Tarjeta / Terminal" | "Pendiente";

export interface ServicioCita {
  id: string;
  cliente_id: string;
  fecha: string;
  turno: TurnoServicio;
  hora_especifica?: string;
  items_contratados: ItemContratado[];
  monto_total: number | null;
  metodo_pago?: MetodoPago;
  requiere_factura?: boolean;
  rfc_factura?: string;
  razon_social?: string;
  estatus: EstatusCita;
  tecnico_asignado: string;
  ruta_geografica: string;
  notas_servicio: string;
  // Especificaciones técnicas de la tela y acceso
  tipo_tela?: string;
  manchas_dificiles?: string[];
  instrucciones_acceso?: string;
  cuenta_con_agua_y_luz?: boolean;
  fotos_estado_actual: string[];
  fotos_antes_despues: FotoAntesDespues[];
  firma_conformidad?: string;
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

export interface ReelMetricItem {
  id: string;
  caption: string;
  thumbnail_url: string;
  permalink: string;
  timestamp: string;
  reproducciones: number;       // plays
  alcance: number;              // reach
  tasa_repeticion: number;      // plays / reach
  tiempo_medio_segundos: number;// ig_reels_avg_watch_time
  guardados: number;            // saved
  compartidos: number;          // shares
  likes: number;
  comentarios: number;
  engagement_rate: number;      // (likes + comments + saved + shares) / reach * 100
}

export interface MetaDetailedAnalytics {
  reels_resumen: {
    total_reels_publicados: number;
    reproducciones_totales_30d: number;
    alcance_reels_30d: number;
    guardados_totales_30d: number;
    compartidos_totales_30d: number;
    tiempo_promedio_general: number; // segundos
  };
  top_reels: ReelMetricItem[];
  perfil_instagram: {
    visitas_al_perfil_30d: number;
    clics_al_sitio_30d: number;
    tasa_conversion_perfil: number;
    seguidores_netos_30d: number;
  };
  pagina_facebook: {
    visitas_a_la_pagina_30d: number;
    clics_boton_contacto_30d: number;
    alcance_organico_30d: number;
    alcance_pagado_30d: number;
    interacciones_publicaciones_30d: number;
  };
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
  analitica_avanzada?: MetaDetailedAnalytics;
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
  pin_tecnico?: string;
  marketing?: MarketingMetrics;
}

export interface KananDatabase {
  clientes: Cliente[];
  servicios_citas: ServicioCita[];
  recurrencia: RegistroRecurrencia[];
  mensajes_automatizacion: MensajeAutomatizacion[];
  config?: KananConfig;
}
