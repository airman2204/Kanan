-- ==============================================================================
-- KANAN SERVICIOS DE LIMPIEZA - SCHEMA COMPLETO SUPABASE
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Tabla de Usuarios Administradores y Seguridad
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  mfa_secret TEXT NOT NULL,
  mfa_configured BOOLEAN DEFAULT false,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  direccion TEXT NOT NULL,
  municipio TEXT NOT NULL,
  mascotas BOOLEAN DEFAULT false,
  notas_especiales TEXT DEFAULT '',
  historico_gasto NUMERIC(10, 2) DEFAULT 0,
  fecha_registro TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Citas y Servicios
CREATE TABLE IF NOT EXISTS public.servicios_citas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES public.clientes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  turno TEXT NOT NULL,
  items_contratados JSONB DEFAULT '[]'::jsonb,
  monto_total NUMERIC(10, 2),
  estatus TEXT NOT NULL DEFAULT 'Por Confirmar',
  tecnico_asignado TEXT DEFAULT 'Por asignar',
  ruta_geografica TEXT DEFAULT '',
  notas_servicio TEXT DEFAULT '',
  fotos_estado_actual JSONB DEFAULT '[]'::jsonb,
  fotos_antes_despues JSONB DEFAULT '[]'::jsonb,
  calificacion INT,
  ticket_soporte BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Mensajes / Automatizaciones WhatsApp
CREATE TABLE IF NOT EXISTS public.mensajes_automatizacion (
  id TEXT PRIMARY KEY,
  cita_id TEXT,
  cliente_id TEXT,
  etapa TEXT NOT NULL,
  etapa_titulo TEXT NOT NULL,
  destinatario_whatsapp TEXT NOT NULL,
  contenido_mensaje TEXT NOT NULL,
  estatus_envio TEXT NOT NULL DEFAULT 'Programado',
  fecha_programada TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Configuración de Plataforma (Modo Halloween, etc.)
CREATE TABLE IF NOT EXISTS public.kanan_config (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  modo_halloween BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios_citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_automatizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanan_config ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura seguras
CREATE POLICY "Allow service and public operations on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service and public operations on clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service and public operations on servicios_citas" ON public.servicios_citas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service and public operations on mensajes_automatizacion" ON public.mensajes_automatizacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service and public operations on kanan_config" ON public.kanan_config FOR ALL USING (true) WITH CHECK (true);

-- Insertar Usuario Administrador Inicial
INSERT INTO public.admin_users (email, password_hash, salt, mfa_secret, mfa_configured, must_change_password)
VALUES (
  'magc2204@gmail.com',
  '849469f2051db84969b136d2cde20e3fcc7ece351765a4ff7c145be4e0153f0b68c95faffafa951fb1388db2519df32235bb395056d8fa6c3ee260362db38495',
  '461fa021efc302bc3aa519b10ae1e7df',
  'JBSWY3DPEHPK3PXP',
  false,
  false
)
ON CONFLICT (email) DO NOTHING;

-- Insertar Configuración Inicial
INSERT INTO public.kanan_config (id, modo_halloween)
VALUES ('global_config', true)
ON CONFLICT (id) DO NOTHING;
