-- ====================================================================
-- TABLA DE PERSISTENCIA PERMANENTE PARA WHATSAPP (BAILEYS + SUPABASE)
-- Ejecutar en el SQL Editor de tu panel de Supabase:
-- https://supabase.com/dashboard/project/gkiqxexacyhnhjfbmvqw/sql
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  session_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, key)
);

-- Habilitar permisos de lectura y escritura para la clave API del backend
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total al backend" 
ON public.whatsapp_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Comentario informativo
COMMENT ON TABLE public.whatsapp_sessions IS 'Almacén persistente de credenciales de WhatsApp Baileys para evitar desvinculación tras reinicios.';
