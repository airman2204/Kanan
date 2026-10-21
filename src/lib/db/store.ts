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
} from "@/types/crm";
import {
  generarSecuenciaPoservicio,
  generarMensajeCalificacionPoservicio,
} from "@/lib/whatsapp/templates";

const LOCAL_DB_PATH = path.join(process.cwd(), "src", "data", "kanan-crm-db.json");
const TMP_DB_PATH = path.join(os.tmpdir(), "kanan-crm-db.json");
let memoryFallbackDb: KananDatabase | null = null;

/**
 * Genera exactamente los 2 ejemplos de demostración solicitados por el usuario
 * para mostrar toda la funcionalidad del CRM (Kanban, Ficha 360°, Recurrencia y WhatsApp).
 */
export function getTwoDemoExamples(): KananDatabase {
  const clientes: Cliente[] = [
    {
      id: "cli-demo-01",
      nombre: "Mariana Gómez Villaseñor",
      whatsapp: "3314528910",
      direccion: "Av. Patria 1840, Col. Jardines del Valle",
      municipio: "Zapopan",
      mascotas: true,
      notas_especiales:
        "Hogar con 2 perritos Golden Retriever. Manchas orgánicas en sala gris en L y colchón King. Solicita desinfección profunda Pet-Friendly.",
      historico_gasto: 1650,
      fecha_registro: "2026-10-15T10:30:00.000Z",
    },
    {
      id: "cli-demo-02",
      nombre: "Carlos Eduardo Ramírez",
      whatsapp: "3338901124",
      direccion: "Calle Paseo de los Adobes 412, Lomas de San Agustín",
      municipio: "Tlajomulco",
      mascotas: false,
      notas_especiales:
        "Limpieza de vestiduras de camioneta SUV (5 asientos + cajuela) y 6 sillas de comedor. Acceso directo a cochera con toma de agua y luz.",
      historico_gasto: 1100,
      fecha_registro: "2026-10-19T16:15:00.000Z",
    },
  ];

  const servicios_citas: ServicioCita[] = [
    {
      id: "KAN-1001",
      cliente_id: "cli-demo-01",
      fecha: "2026-10-21",
      turno: "Matutino (09:00 - 13:00)",
      items_contratados: [
        {
          categoriaId: "salas",
          categoriaNombre: "Salas y Sillas",
          piezaId: "sala-l",
          piezaNombre: "Sala en L (Seccional)",
          cantidad: 1,
        },
        {
          categoriaId: "colchones",
          categoriaNombre: "Colchones",
          piezaId: "colchon-king",
          piezaNombre: "Colchón King Size",
          cantidad: 1,
        },
      ],
      monto_total: 1650,
      estatus: "Completada",
      tecnico_asignado: "Ing. Roberto Márquez (Unidad 01)",
      ruta_geografica: "Ruta Norte — Zapopan",
      notas_servicio: "Tiene 2 mascotas en casa. Se aplicó neutralizador enzimático 100% Pet-Friendly.",
      fotos_estado_actual: ["/assets/portfolio/antes-1.jpg"],
      fotos_antes_despues: [
        {
          antesUrl: "/assets/portfolio/antes-1.jpg",
          despuesUrl: "/assets/portfolio/despues-1.jpg",
          descripcion: "Sala Seccional — Eliminación de manchas y pelo de mascota",
        },
      ],
      calificacion: 5,
      ticket_soporte: false,
      created_at: "2026-10-15T10:35:00.000Z",
    },
    {
      id: "KAN-1002",
      cliente_id: "cli-demo-02",
      fecha: "2026-10-22",
      turno: "Vespertino (14:00 - 18:00)",
      items_contratados: [
        {
          categoriaId: "vestiduras",
          categoriaNombre: "Vestiduras de Autos",
          piezaId: "auto-suv",
          piezaNombre: "Camioneta SUV (Asientos + Alfombra + Cajuela)",
          cantidad: 1,
        },
        {
          categoriaId: "salas",
          categoriaNombre: "Salas y Sillas",
          piezaId: "silla-comedor",
          piezaNombre: "Sillas de Comedor Tapizadas",
          cantidad: 6,
        },
      ],
      monto_total: 1100,
      estatus: "Confirmada",
      tecnico_asignado: "Téc. Alejandro Silva (Unidad 02)",
      ruta_geografica: "Ruta Sur — Tlajomulco",
      notas_servicio: "Confirmado por WhatsApp. Requiere secado rápido de 3-4 horas para usar camioneta al día siguiente.",
      fotos_estado_actual: ["/assets/portfolio/antes-2.jpg"],
      fotos_antes_despues: [],
      calificacion: null,
      ticket_soporte: false,
      created_at: "2026-10-19T16:20:00.000Z",
    },
  ];

  const recurrencia: RegistroRecurrencia[] = [
    {
      id: "rec-demo-01",
      cliente_id: "cli-demo-01",
      cita_id: "KAN-1001",
      ultimo_servicio: "2026-10-21",
      disparador: "3 Meses (Mascotas)",
      proxima_fecha_contacto: "2027-01-21",
      estatus_contacto: "Programado",
    },
    {
      id: "rec-demo-02",
      cliente_id: "cli-demo-02",
      cita_id: "KAN-1002",
      ultimo_servicio: "2026-10-22",
      disparador: "6 Meses (Semestral)",
      proxima_fecha_contacto: "2027-04-22",
      estatus_contacto: "Programado",
    },
  ];

  const mensajes_automatizacion: MensajeAutomatizacion[] = [];

  // Generar secuencias para los 2 ejemplos
  for (const cita of servicios_citas) {
    const cli = clientes.find((c) => c.id === cita.cliente_id)!;
    const etapas = generarSecuenciaPoservicio(cita, cli);
    etapas.forEach((e, idx) => {
      mensajes_automatizacion.push({
        id: `msg-${cita.id}-${idx + 1}`,
        cita_id: cita.id,
        cliente_id: cli.id,
        etapa: e.etapa,
        etapa_titulo: e.etapa_titulo,
        destinatario_whatsapp: cli.whatsapp,
        contenido_mensaje: e.contenido_mensaje,
        estatus_envio:
          cita.estatus === "Completada" && idx < 4 ? "Enviado" : e.estatus_envio,
        fecha_programada: new Date(Date.now() + idx * 3600000).toISOString(),
      });
    });

    if (cita.calificacion === 5) {
      const msg5 = generarMensajeCalificacionPoservicio(cli, cita, 5);
      mensajes_automatizacion.push({
        id: `msg-${cita.id}-rating`,
        cita_id: cita.id,
        cliente_id: cli.id,
        etapa: msg5.etapa,
        etapa_titulo: msg5.etapa_titulo,
        destinatario_whatsapp: cli.whatsapp,
        contenido_mensaje: msg5.contenido_mensaje,
        estatus_envio: msg5.estatus_envio,
        fecha_programada: new Date().toISOString(),
      });
    }
  }

  return {
    clientes,
    servicios_citas,
    recurrencia,
    mensajes_automatizacion,
  };
}

function ensureDbFile(): KananDatabase {
  // 1. Si ya existe en /tmp (entorno Serverless como Vercel tras una escritura), leer de ahí
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const raw = fs.readFileSync(TMP_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw) as KananDatabase;
      memoryFallbackDb = parsed;
      return parsed;
    } catch {
      // continuar
    }
  }

  // 2. Si existe en archivo local del proyecto
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw) as KananDatabase;
      memoryFallbackDb = parsed;
      return parsed;
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
  memoryFallbackDb = db;
  const payload = JSON.stringify(db, null, 2);

  // Intentar escribir primero en src/data (entorno local) y siempre respaldar en /tmp (Vercel)
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, payload, "utf-8");
  } catch {
    // En Vercel el directorio del proyecto es read-only; escribimos en /tmp
  }

  try {
    fs.writeFileSync(TMP_DB_PATH, payload, "utf-8");
  } catch {
    // Fallback en memoria ya actualizado
  }
}

export function getDatabase(): KananDatabase {
  return ensureDbFile();
}

export function clearAllData(): KananDatabase {
  const emptyDb: KananDatabase = {
    clientes: [],
    servicios_citas: [],
    recurrencia: [],
    mensajes_automatizacion: [],
  };
  saveDatabase(emptyDb);
  return emptyDb;
}

export function resetToTwoExamples(): KananDatabase {
  const demoDb = getTwoDemoExamples();
  saveDatabase(demoDb);
  return demoDb;
}

function obtenerRutaPorMunicipio(municipio: MunicipioZMG): string {
  switch (municipio) {
    case "Zapopan":
      return "Ruta Norte-Poniente — Zapopan";
    case "Guadalajara":
      return "Ruta Centro — Guadalajara";
    case "Tlajomulco":
      return "Ruta Sur — Tlajomulco";
    case "Tlaquepaque":
      return "Ruta Oriente — Tlaquepaque";
  }
}

function calcularFechaFutura(fechaBase: string, meses: number): string {
  const d = new Date(`${fechaBase}T12:00:00`);
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + meses);
    return fallback.toISOString().split("T")[0];
  }
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().split("T")[0];
}

export function createBookingFromWizard(payload: {
  nombre: string;
  whatsapp: string;
  direccion: string;
  municipio: MunicipioZMG;
  mascotas: boolean;
  fecha: string;
  turno: TurnoServicio;
  items_contratados: ItemContratado[];
  notas_servicio?: string;
  fotos_estado_actual?: string[];
}): { cita: ServicioCita; cliente: Cliente } {
  const db = getDatabase();
  const cleanPhone = payload.whatsapp.replace(/\D/g, "");

  // 1. Buscar o crear cliente
  let cliente = db.clientes.find(
    (c) => c.whatsapp.replace(/\D/g, "") === cleanPhone && cleanPhone.length >= 8
  );

  if (!cliente) {
    cliente = {
      id: `cli-${Date.now()}`,
      nombre: payload.nombre.trim(),
      whatsapp: payload.whatsapp.trim(),
      direccion: payload.direccion.trim(),
      municipio: payload.municipio,
      mascotas: payload.mascotas,
      notas_especiales: payload.notas_servicio?.trim() || "",
      historico_gasto: 0,
      fecha_registro: new Date().toISOString(),
    };
    db.clientes.unshift(cliente);
  } else {
    cliente.nombre = payload.nombre.trim();
    cliente.direccion = payload.direccion.trim();
    cliente.municipio = payload.municipio;
    cliente.mascotas = payload.mascotas;
    if (payload.notas_servicio?.trim()) {
      cliente.notas_especiales = payload.notas_servicio.trim();
    }
  }

  // 2. Generar folio consecutivo
  const nextNumber = 1001 + db.servicios_citas.length;
  const citaId = `KAN-${nextNumber}`;

  const nuevaCita: ServicioCita = {
    id: citaId,
    cliente_id: cliente.id,
    fecha: payload.fecha,
    turno: payload.turno,
    items_contratados: payload.items_contratados,
    monto_total: null, // Sin precios en el wizard; se cotiza y asigna en CRM
    estatus: "Por Confirmar",
    tecnico_asignado: "Por asignar",
    ruta_geografica: obtenerRutaPorMunicipio(payload.municipio),
    notas_servicio: payload.notas_servicio?.trim() || "",
    fotos_estado_actual: payload.fotos_estado_actual || [],
    fotos_antes_despues: [],
    calificacion: null,
    ticket_soporte: false,
    created_at: new Date().toISOString(),
  };

  db.servicios_citas.unshift(nuevaCita);

  // 3. Crear registro 1 a 1 en Tabla Recurrencia
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

  // 4. Programar secuencia poservicio de WhatsApp
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
    calificacion?: number | null;
    notas_servicio?: string;
  }
): ServicioCita | null {
  const db = getDatabase();
  const cita = db.servicios_citas.find((c) => c.id === citaId);
  if (!cita) return null;

  const cliente = db.clientes.find((c) => c.id === cita.cliente_id);

  if (updates.estatus !== undefined) cita.estatus = updates.estatus;
  if (updates.tecnico_asignado !== undefined)
    cita.tecnico_asignado = updates.tecnico_asignado;
  if (updates.notas_servicio !== undefined)
    cita.notas_servicio = updates.notas_servicio;

  if (updates.monto_total !== undefined) {
    cita.monto_total = updates.monto_total;
    // Recalcular histórico de gasto del cliente
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
    // Eliminar mensaje previo de calificación si existía
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
