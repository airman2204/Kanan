export type RedSocialDestino = "instagram" | "facebook" | "tiktok";

export type FormatoCreativo = 
  | "post_cuadrado"      // 1:1 (Feed IG / FB)
  | "story_reel"         // 9:16 (Stories / Reels / TikTok)
  | "banner_horizontal";  // 16:9 (Facebook Banner / Web)

export interface ArchivoMarcaHub {
  id: string;
  nombre: string;
  tipo: "mascota" | "foto_real" | "grafico" | "manual_pdf";
  url: string;
  sizeBytes?: number;
  subidoEn: string;
  descripcion?: string;
}

export interface ConfiguracionApiMarketing {
  gemini_api_key?: string;
  fal_key?: string;
  usar_flux: boolean;
  modelo_flux: "fal-ai/flux/schnell" | "fal-ai/flux/dev";
}

export interface CampanaGenerada {
  id: string;
  redSocial: RedSocialDestino;
  formato: FormatoCreativo;
  conceptoCampana: string;
  audienciaObjetivo: string;
  copywriting: {
    gancho_3_segundos: string;
    cuerpo_aida: string;
    llamado_a_la_accion: string;
    hashtags_estrategicos: string[];
  };
  promptFluxGenerado: string;
  imagenGeneradaUrl?: string;
  generadoEn: string;
  estado: "borrador" | "aprobado" | "publicado";
}
