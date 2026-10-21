-- ============================================================================
-- KANAN SERVICIOS DE LIMPIEZA - ARQUITECTURA DE DATOS CRM & AUTOMATIZACIÓN
-- Relación: [Clientes] 1 --- N [Servicios/Citas] 1 --- 1 [Recurrencia]
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL UNIQUE,
  direccion TEXT NOT NULL,
  municipio TEXT NOT NULL CHECK (municipio IN ('Guadalajara', 'Zapopan', 'Tlajomulco', 'Tlaquepaque')),
  mascotas BOOLEAN NOT NULL DEFAULT FALSE,
  notas_especiales TEXT DEFAULT '',
  historico_gasto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla Servicios / Citas
CREATE TABLE IF NOT EXISTS servicios_citas (
  id TEXT PRIMARY KEY, -- Folio comercial ej. KAN-1001
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('Matutino (09:00 - 13:00)', 'Vespertino (14:00 - 18:00)')),
  items_contratados JSONB NOT NULL DEFAULT '[]'::jsonb,
  monto_total NUMERIC(10, 2) DEFAULT NULL, -- Se define en cotización / CRM (Wizard no muestra precios)
  estatus TEXT NOT NULL DEFAULT 'Por Confirmar' CHECK (estatus IN (
    'Por Confirmar',
    'Confirmada',
    'En Ruta',
    'En Proceso',
    'Completada',
    'Cancelada'
  )),
  tecnico_asignado TEXT DEFAULT 'Sin asignar',
  ruta_geografica TEXT NOT NULL,
  notas_servicio TEXT DEFAULT '',
  fotos_estado_actual JSONB DEFAULT '[]'::jsonb,
  fotos_antes_despues JSONB DEFAULT '[]'::jsonb,
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  ticket_soporte BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla Recurrencia (Relación 1 a 1 con Servicio Completado / Cliente)
CREATE TABLE IF NOT EXISTS recurrencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  cita_id TEXT UNIQUE REFERENCES servicios_citas(id) ON DELETE CASCADE,
  ultimo_servicio DATE NOT NULL,
  disparador TEXT NOT NULL CHECK (disparador IN ('3 Meses (Mascotas)', '6 Meses (Semestral)', '12 Meses (Anual)')),
  proxima_fecha_contacto DATE NOT NULL,
  estatus_contacto TEXT NOT NULL DEFAULT 'Programado' CHECK (estatus_contacto IN (
    'Programado',
    'Mensaje Enviado',
    'Reactivado',
    'Pospuesto'
  ))
);

-- 4. Tabla Secuencia Poservicio WhatsApp API (Make / Meta Cloud API)
CREATE TABLE IF NOT EXISTS mensajes_automatizacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id TEXT NOT NULL REFERENCES servicios_citas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL CHECK (etapa IN (
    '1_confirmacion_inmediata',
    '2_recordatorio_24h_antes',
    '3_encuesta_3h_poservicio',
    '3a_invitacion_google_maps_5_estrellas',
    '3b_alerta_soporte_menor_4_estrellas',
    '4_guia_derrames_24h_poservicio',
    '5_checkin_mes_3_mascotas',
    '6_reactivacion_mes_6_semestral'
  )),
  destinatario_whatsapp TEXT NOT NULL,
  contenido_mensaje TEXT NOT NULL,
  estatus_envio TEXT NOT NULL DEFAULT 'Programado' CHECK (estatus_envio IN ('Enviado', 'Programado', 'Alerta Soporte')),
  fecha_programada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
