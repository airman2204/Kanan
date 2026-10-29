import fs from "fs";
import os from "os";
import path from "path";
import {
  KananDatabase,
  Cliente,
  ServicioCita,
  RegistroRecurrencia,
  MensajeAutomatizacion,
  ItemContratado,
  MunicipioZMG,
  TurnoServicio,
  EstatusCita,
  MarketingMetrics,
  FotoAntesDespues,
} from "@/types/crm";
import {
  generarSecuenciaPoservicio,
  generarMensajeCalificacionPoservicio,
} from "@/lib/whatsapp/templates";

const LOCAL_DB_PATH = path.join(process.cwd(), "src", "data", "kanan-crm-db.json");
const TMP_DB_PATH = path.join(os.tmpdir(), "kanan-crm-db.json");
let memoryFallbackDb: KananDatabase | null = null;

const DEFAULT_MARKETING: MarketingMetrics = {
  meta: {
    conectado: false,
    page_name: "",
    ig_account_name: "",
    metricas_reales: {
      seguidores_fb: 0,
      seguidores_ig: 0,
      alcance_30d: 0,
      impresiones_30d: 0,
      interacciones_30d: 0,
      clics_al_sitio: 0,
      tasa_engagement: 0,
      visitas_al_perfil: 0,
    },
    analitica_avanzada: {
      reels_resumen: {
        total_reels_publicados: 0,
        reproducciones_totales_30d: 0,
        alcance_reels_30d: 0,
        guardados_totales_30d: 0,
        compartidos_totales_30d: 0,
        tiempo_promedio_general: 0,
      },
      top_reels: [],
      perfil_instagram: {
        visitas_al_perfil_30d: 0,
        clics_al_sitio_30d: 0,
        tasa_conversion_perfil: 0,
        seguidores_netos_30d: 0,
      },
      pagina_facebook: {
        visitas_a_la_pagina_30d: 0,
        clics_boton_contacto_30d: 0,
        alcance_organico_30d: 0,
        alcance_pagado_30d: 0,
        interacciones_publicaciones_30d: 0,
      },
    },
  },
  google_ads: {
    conectado: false,
    customer_id: "",
    account_name: "",
    metricas_reales: {
      inversion_30d: 0,
      impresiones: 0,
      clics: 0,
      cpc_promedio: 0,
      ctr_promedio: 0,
      conversiones: 0,
      costo_por_conversion: 0,
      campanias_activas: [],
    },
  },
  seo_sem: {
    conectado: false,
    search_console_property: "kananlimpieza.mx",
    metricas_reales: {
      clics_organicos: 0,
      impresiones_organicas: 0,
      ctr_organico: 0,
      posicion_promedio: 0,
      top_consultas: [],
      top_paginas: [],
    },
  },
};

export function getTwoDemoExamples(): KananDatabase {
  return {
    clientes: [],
    servicios_citas: [],
    recurrencia: [],
    mensajes_automatizacion: [],
    config: {
      modo_halloween: true,
      marketing: DEFAULT_MARKETING,
    },
  };
}

export function getDatabase(): KananDatabase {
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const raw = fs.readFileSync(TMP_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.config?.marketing) {
        parsed.config = { ...parsed.config, marketing: DEFAULT_MARKETING };
      }
      memoryFallbackDb = parsed;
      return memoryFallbackDb!;
    } catch {
      // continuar
    }
  }

  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.config?.marketing) {
        parsed.config = { ...parsed.config, marketing: DEFAULT_MARKETING };
      }
      memoryFallbackDb = parsed;
      return memoryFallbackDb!;
    } catch {
      // continuar
    }
  }

  if (memoryFallbackDb) {
    return memoryFallbackDb;
  }

  const initial = getTwoDemoExamples();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db: KananDatabase): void {
  if (!db.config?.marketing) {
    db.config = { ...db.config, marketing: DEFAULT_MARKETING, modo_halloween: db.config?.modo_halloween ?? true };
  }
  memoryFallbackDb = db;
  const payload = JSON.stringify(db, null, 2);

  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, payload, "utf-8");
  } catch {
    // Entorno read-only
  }

  try {
    fs.writeFileSync(TMP_DB_PATH, payload, "utf-8");
  } catch {
    // Continuar en memoria
  }
}

export function clearAllData(): KananDatabase {
  const emptyDb: KananDatabase = {
    clientes: [],
    servicios_citas: [],
    recurrencia: [],
    mensajes_automatizacion: [],
    config: {
      modo_halloween: false,
      marketing: DEFAULT_MARKETING,
    },
  };
  saveDatabase(emptyDb);
  return emptyDb;
}

export function resetToTwoExamples(): KananDatabase {
  const demoDb = getTwoDemoExamples();
  saveDatabase(demoDb);
  return demoDb;
}

export function setModoHalloween(enabled: boolean): KananDatabase {
  const db = getDatabase();
  db.config = {
    ...(db.config || { marketing: DEFAULT_MARKETING }),
    modo_halloween: enabled,
  };
  saveDatabase(db);
  return db;
}

export function updateMarketingConfig(updates: Partial<MarketingMetrics>): KananDatabase {
  const db = getDatabase();
  db.config = {
    ...(db.config || { modo_halloween: true }),
    marketing: {
      ...(db.config?.marketing || DEFAULT_MARKETING),
      ...updates,
    },
  };
  saveDatabase(db);
  return db;
}

function calcularFechaFutura(fechaIso: string, meses: number): string {
  const d = new Date(fechaIso);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().split("T")[0];
}

// 1. Dar de alta cliente manual
export function createClienteManual(payload: {
  nombre: string;
  whatsapp: string;
  direccion: string;
  municipio: MunicipioZMG;
  mascotas: boolean;
  notas_especiales?: string;
  email?: string;
  historico_gasto?: number;
}): Cliente {
  const db = getDatabase();
  const cleanPhone = payload.whatsapp.replace(/\D/g, "");

  // Verificar si ya existe por teléfono
  let cliente = db.clientes.find((c) => c.whatsapp.replace(/\D/g, "") === cleanPhone);
  if (!cliente) {
    cliente = {
      id: `cli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nombre: payload.nombre.trim(),
      whatsapp: cleanPhone,
      direccion: payload.direccion.trim(),
      municipio: payload.municipio,
      mascotas: Boolean(payload.mascotas),
      notas_especiales: payload.notas_especiales?.trim() || "",
      historico_gasto: payload.historico_gasto || 0,
      fecha_registro: new Date().toISOString(),
      email: payload.email?.trim() || undefined,
    };
    db.clientes.unshift(cliente);
  } else {
    // Actualizar datos existentes
    cliente.nombre = payload.nombre.trim();
    cliente.direccion = payload.direccion.trim();
    cliente.municipio = payload.municipio;
    cliente.mascotas = Boolean(payload.mascotas);
    if (payload.notas_especiales) cliente.notas_especiales = payload.notas_especiales;
    if (payload.email) cliente.email = payload.email;
    if (payload.historico_gasto !== undefined) cliente.historico_gasto = payload.historico_gasto;
  }

  saveDatabase(db);
  return cliente;
}

// 2. Dar de alta cita manual (con vinculación o creación de cliente)
export function createCitaManual(payload: {
  cliente_id?: string;
  cliente_data?: {
    nombre: string;
    whatsapp: string;
    direccion: string;
    municipio: MunicipioZMG;
    mascotas: boolean;
    notas_especiales?: string;
    email?: string;
  };
  fecha: string;
  turno: TurnoServicio;
  hora_especifica?: string;
  items_contratados: ItemContratado[];
  monto_total?: number | null;
  metodo_pago?: any;
  tipo_tela?: string;
  manchas_dificiles?: string[];
  instrucciones_acceso?: string;
  cuenta_con_agua_y_luz?: boolean;
  tecnico_asignado?: string;
  ruta_geografica?: string;
  notas_servicio?: string;
}): { cita: ServicioCita; cliente: Cliente } {
  const db = getDatabase();
  let cliente: Cliente | undefined;

  if (payload.cliente_id) {
    cliente = db.clientes.find((c) => c.id === payload.cliente_id);
  }

  if (!cliente && payload.cliente_data) {
    cliente = createClienteManual(payload.cliente_data);
  }

  if (!cliente) {
    throw new Error("No se especificó ni encontró el cliente para la cita.");
  }

  const nextNum = db.servicios_citas.length + 1001;
  const nuevaCita: ServicioCita = {
    id: `KAN-${nextNum}`,
    cliente_id: cliente.id,
    fecha: payload.fecha,
    turno: payload.turno,
    hora_especifica: payload.hora_especifica || (payload.turno.startsWith("Matutino") ? "10:00 AM" : "03:30 PM"),
    items_contratados: payload.items_contratados || [],
    monto_total: payload.monto_total ?? null,
    metodo_pago: payload.metodo_pago || "Pendiente",
    tipo_tela: payload.tipo_tela || "",
    manchas_dificiles: payload.manchas_dificiles || [],
    instrucciones_acceso: payload.instrucciones_acceso || "",
    cuenta_con_agua_y_luz: payload.cuenta_con_agua_y_luz ?? true,
    estatus: "Confirmada",
    tecnico_asignado: payload.tecnico_asignado || "Técnico 1 (Ruta ZMG)",
    ruta_geografica: payload.ruta_geografica || `Ruta ${cliente.municipio}`,
    notas_servicio: payload.notas_servicio || "",
    fotos_estado_actual: [],
    fotos_antes_despues: [],
    calificacion: null,
    ticket_soporte: false,
    origen: "manual",
    created_at: new Date().toISOString(),
  };

  db.servicios_citas.unshift(nuevaCita);

  if (payload.monto_total) {
    cliente.historico_gasto = (cliente.historico_gasto || 0) + payload.monto_total;
  }

  saveDatabase(db);
  return { cita: nuevaCita, cliente };
}

// 3. Crear cita desde el Wizard público
export function createBookingFromWizard(payload: {
  nombre: string;
  whatsapp: string;
  direccion: string;
  municipio: MunicipioZMG;
  mascotas: boolean;
  fecha: string;
  turno: TurnoServicio;
  items_contratados: ItemContratado[];
  notas_servicio: string;
  fotos_estado_actual?: string[];
}): { cita: ServicioCita; cliente: Cliente } {
  const db = getDatabase();
  const cleanPhone = payload.whatsapp.replace(/\D/g, "");

  let cliente = db.clientes.find((c) => c.whatsapp.replace(/\D/g, "") === cleanPhone);

  if (!cliente) {
    cliente = {
      id: `cli-${Date.now()}`,
      nombre: payload.nombre.trim(),
      whatsapp: cleanPhone,
      direccion: payload.direccion.trim(),
      municipio: payload.municipio,
      mascotas: payload.mascotas,
      notas_especiales: "",
      historico_gasto: 0,
      fecha_registro: new Date().toISOString(),
    };
    db.clientes.unshift(cliente);
  } else {
    cliente.direccion = payload.direccion.trim();
    cliente.municipio = payload.municipio;
    cliente.mascotas = payload.mascotas;
  }

  const nextNum = db.servicios_citas.length + 1001;
  const nuevaCita: ServicioCita = {
    id: `KAN-${nextNum}`,
    cliente_id: cliente.id,
    fecha: payload.fecha,
    turno: payload.turno,
    hora_especifica: payload.turno.startsWith("Matutino") ? "10:00 AM" : "03:30 PM",
    items_contratados: payload.items_contratados,
    monto_total: null,
    estatus: "Por Confirmar",
    tecnico_asignado: "Por asignar",
    ruta_geografica: `Ruta ${payload.municipio}`,
    notas_servicio: payload.notas_servicio,
    fotos_estado_actual: payload.fotos_estado_actual || [],
    fotos_antes_despues: [],
    calificacion: null,
    ticket_soporte: false,
    origen: "web",
    created_at: new Date().toISOString(),
  };

  db.servicios_citas.unshift(nuevaCita);

  const mesesDisparador = cliente.mascotas ? 3 : 6;
  const nuevoRegistroRecurrencia: RegistroRecurrencia = {
    id: `rec-${Date.now()}`,
    cliente_id: cliente.id,
    cita_id: nuevaCita.id,
    ultimo_servicio: payload.fecha,
    disparador: cliente.mascotas ? "3 Meses (Mascotas)" : "6 Meses (Semestral)",
    proxima_fecha_contacto: calcularFechaFutura(payload.fecha, mesesDisparador),
    estatus_contacto: "Programado",
  };
  db.recurrencia.unshift(nuevoRegistroRecurrencia);

  const secuencia = generarSecuenciaPoservicio(nuevaCita, cliente);
  secuencia.forEach((etapaItem, idx) => {
    db.mensajes_automatizacion.unshift({
      id: `msg-${nuevaCita.id}-${idx + 1}-${Date.now()}`,
      cita_id: nuevaCita.id,
      cliente_id: cliente!.id,
      etapa: etapaItem.etapa,
      etapa_titulo: etapaItem.etapa_titulo,
      destinatario_whatsapp: cliente!.whatsapp,
      contenido_mensaje: etapaItem.contenido_mensaje,
      estatus_envio: etapaItem.estatus_envio,
      fecha_programada: new Date(Date.now() + idx * 3600000).toISOString(),
    });
  });

  saveDatabase(db);
  return { cita: nuevaCita, cliente };
}

export function updateCitaInDb(
  citaId: string,
  updates: {
    estatus?: EstatusCita;
    tecnico_asignado?: string;
    monto_total?: number | null;
    metodo_pago?: any;
    requiere_factura?: boolean;
    rfc_factura?: string;
    razon_social?: string;
    calificacion?: number | null;
    notas_servicio?: string;
    tipo_tela?: string;
    manchas_dificiles?: string[];
    instrucciones_acceso?: string;
    cuenta_con_agua_y_luz?: boolean;
    fotos_antes_despues?: FotoAntesDespues[];
    fecha?: string;
    turno?: TurnoServicio;
    hora_especifica?: string;
  }
): ServicioCita | null {
  const db = getDatabase();
  const cita = db.servicios_citas.find((c) => c.id === citaId);
  if (!cita) return null;

  const cliente = db.clientes.find((c) => c.id === cita.cliente_id);

  if (updates.estatus !== undefined) cita.estatus = updates.estatus;
  if (updates.tecnico_asignado !== undefined) cita.tecnico_asignado = updates.tecnico_asignado;
  if (updates.notas_servicio !== undefined) cita.notas_servicio = updates.notas_servicio;
  if (updates.tipo_tela !== undefined) cita.tipo_tela = updates.tipo_tela;
  if (updates.manchas_dificiles !== undefined) cita.manchas_dificiles = updates.manchas_dificiles;
  if (updates.instrucciones_acceso !== undefined) cita.instrucciones_acceso = updates.instrucciones_acceso;
  if (updates.cuenta_con_agua_y_luz !== undefined) cita.cuenta_con_agua_y_luz = updates.cuenta_con_agua_y_luz;
  if (updates.metodo_pago !== undefined) cita.metodo_pago = updates.metodo_pago;
  if (updates.requiere_factura !== undefined) cita.requiere_factura = updates.requiere_factura;
  if (updates.rfc_factura !== undefined) cita.rfc_factura = updates.rfc_factura;
  if (updates.razon_social !== undefined) cita.razon_social = updates.razon_social;
  if (updates.fotos_antes_despues !== undefined) cita.fotos_antes_despues = updates.fotos_antes_despues;
  if (updates.fecha !== undefined) cita.fecha = updates.fecha;
  if (updates.turno !== undefined) cita.turno = updates.turno;
  if (updates.hora_especifica !== undefined) cita.hora_especifica = updates.hora_especifica;

  if (updates.monto_total !== undefined) {
    cita.monto_total = updates.monto_total;
    if (cliente) {
      const totalCliente = db.servicios_citas
        .filter((c) => c.cliente_id === cliente.id && c.estatus !== "Cancelada")
        .reduce((acc, item) => acc + (item.monto_total || 0), 0);
      cliente.historico_gasto = totalCliente;
    }
  }

  if (updates.calificacion !== undefined && updates.calificacion !== null && cliente) {
    cita.calificacion = updates.calificacion;
    cita.ticket_soporte = updates.calificacion < 4;

    const msgCalif = generarMensajeCalificacionPoservicio(
      cliente,
      cita,
      updates.calificacion
    );
    db.mensajes_automatizacion = db.mensajes_automatizacion.filter(
      (m) =>
        !(
          m.cita_id === cita.id &&
          (m.etapa === "3a_invitacion_google_maps_5_estrellas" ||
            m.etapa === "3b_alerta_soporte_menor_4_estrellas")
        )
    );
    db.mensajes_automatizacion.unshift({
      id: `msg-${cita.id}-rating-${Date.now()}`,
      cita_id: cita.id,
      cliente_id: cliente.id,
      etapa: msgCalif.etapa,
      etapa_titulo: msgCalif.etapa_titulo,
      destinatario_whatsapp: cliente.whatsapp,
      contenido_mensaje: msgCalif.contenido_mensaje,
      estatus_envio: msgCalif.estatus_envio,
      fecha_programada: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return cita;
}

export function cancelCita(citaId: string, isClientRequest = false, motivo?: string): { ok: boolean; error?: string; cita?: ServicioCita } {
  const db = getDatabase();
  const cita = db.servicios_citas.find((c) => c.id === citaId);
  if (!cita) return { ok: false, error: "Cita no encontrada." };

  if (cita.estatus === "Cancelada") {
    return { ok: true, cita };
  }

  if (isClientRequest) {
    // Validar regla de 2 horas antes
    const horaAprox = cita.turno.startsWith("Matutino") ? "09:00:00" : "14:00:00";
    const citaDate = new Date(`${cita.fecha}T${horaAprox}`);
    const now = new Date();
    const diffMs = citaDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 2) {
      return {
        ok: false,
        error: "Las citas solo pueden cancelarse con al menos 2 horas de anticipación. Por favor comunícate directamente con soporte para asistirte.",
      };
    }
  }

  cita.estatus = "Cancelada";
  cita.cancelled_at = new Date().toISOString();
  cita.cancel_reason = motivo || (isClientRequest ? "Cancelada por cliente vía WhatsApp/Web" : "Cancelada por administración");

  // Recalcular gasto del cliente
  const cliente = db.clientes.find((c) => c.id === cita.cliente_id);
  if (cliente) {
    cliente.historico_gasto = db.servicios_citas
      .filter((c) => c.cliente_id === cliente.id && c.estatus !== "Cancelada")
      .reduce((acc, it) => acc + (it.monto_total || 0), 0);
  }

  saveDatabase(db);
  return { ok: true, cita };
}

export function deleteCliente(clienteId: string): boolean {
  const db = getDatabase();
  const index = db.clientes.findIndex((c) => c.id === clienteId);
  if (index === -1) return false;

  db.clientes.splice(index, 1);
  // Eliminar citas y mensajes asociados
  db.servicios_citas = db.servicios_citas.filter((c) => c.cliente_id !== clienteId);
  db.recurrencia = db.recurrencia.filter((r) => r.cliente_id !== clienteId);
  db.mensajes_automatizacion = db.mensajes_automatizacion.filter((m) => m.cliente_id !== clienteId);

  saveDatabase(db);
  return true;
}
