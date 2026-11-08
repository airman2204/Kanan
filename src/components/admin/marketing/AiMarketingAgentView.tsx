"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Instagram,
  Facebook,
  Video,
  Copy,
  CheckCircle2,
  RefreshCw,
  Send,
  Sliders,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { RedSocialDestino, FormatoCreativo, CampanaGenerada } from "@/types/marketingAi";

export function AiMarketingAgentView() {
  const [redSocial, setRedSocial] = useState<RedSocialDestino>("instagram");
  const [formato, setFormato] = useState<FormatoCreativo>("post_cuadrado");
  const [objetivo, setObjetivo] = useState("reactivacion_mascotas");
  const [usarMascota, setUsarMascota] = useState(true);
  const [promptUsuario, setPromptUsuario] = useState("");
  const [generando, setGenerando] = useState(false);
  const [campanaActual, setCampanaActual] = useState<CampanaGenerada | null>(null);
  const [copiadoCopy, setCopiadoCopy] = useState(false);

  const handleGenerarCampana = async () => {
    try {
      setGenerando(true);
      const res = await fetch("/api/admin/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redSocial,
          formato,
          objetivo,
          instruccionesUsuario: promptUsuario,
          usarMascota,
        }),
      });
      const data = await res.json();
      if (data.ok && data.campana) {
        setCampanaActual(data.campana);
      } else {
        alert("Error al generar la campaña: " + (data.error || "Intenta nuevamente"));
      }
    } catch {
      alert("Error de conexión con el agente de marketing.");
    } finally {
      setGenerando(false);
    }
  };

  const handleCopiarTexto = () => {
    if (!campanaActual) return;
    const fullText = [
      campanaActual.copywriting.gancho_3_segundos,
      "",
      campanaActual.copywriting.cuerpo_aida,
      "",
      campanaActual.copywriting.llamado_a_la_accion,
      "",
      campanaActual.copywriting.hashtags_estrategicos.join(" "),
    ].join("\n");

    navigator.clipboard.writeText(fullText);
    setCopiadoCopy(true);
    setTimeout(() => setCopiadoCopy(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* PANEL ESTRATÉGICO / GRILL-ME DEL AGENTE */}
      <div className="bg-gradient-to-br from-[#355581] via-[#1D71B5] to-[#36A6DE] rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-heading font-extrabold">
                Agente Estratégico de Marketing Kanan (FLUX.1 + Gemini)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase">
                Modo Consultor
              </span>
            </div>
            <p className="text-xs text-white/90">
              Aprende de los servicios reales de tapicería en GDL y genera creatividades de alto impacto sin fotos genéricas.
            </p>
          </div>
        </div>

        {/* Formulario de Configuración de la Campaña */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Red Social */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Red Social
              </label>
              <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRedSocial("instagram")}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    redSocial === "instagram" ? "bg-white text-[#1D71B5]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" /> IG
                </button>
                <button
                  type="button"
                  onClick={() => setRedSocial("facebook")}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    redSocial === "facebook" ? "bg-white text-[#1D71B5]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" /> FB
                </button>
                <button
                  type="button"
                  onClick={() => setRedSocial("tiktok")}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    redSocial === "tiktok" ? "bg-white text-[#1D71B5]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> TT
                </button>
              </div>
            </div>

            {/* Formato */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Formato Creativo
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as FormatoCreativo)}
                className="w-full bg-white/20 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none border border-white/20"
              >
                <option value="post_cuadrado" className="text-slate-900">Post Cuadrado 1:1 (Feed)</option>
                <option value="story_reel" className="text-slate-900">Reel / Story / TikTok 9:16</option>
                <option value="banner_horizontal" className="text-slate-900">Banner Horizontal 16:9</option>
              </select>
            </div>

            {/* Ángulo o Core */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Objetivo del Anuncio
              </label>
              <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="w-full bg-white/20 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none border border-white/20"
              >
                <option value="reactivacion_mascotas" className="text-slate-900">Hogares con Mascotas (Olores/Pelo)</option>
                <option value="servicio_profundo" className="text-slate-900">Salas y Sofás (Secado en 3-4 hrs)</option>
                <option value="salud_colchones" className="text-slate-900">Colchones y Ácaros (Alergias)</option>
                <option value="tapetes_taller" className="text-slate-900">Tapetes (Recolección a Domicilio)</option>
              </select>
            </div>
          </div>

          {/* Opciones Adicionales */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input
                type="checkbox"
                checked={usarMascota}
                onChange={(e) => setUsarMascota(e.target.checked)}
                className="rounded accent-white"
              />
              <span>Integrar a la mascota oficial Kanan en la composición FLUX</span>
            </label>

            <button
              type="button"
              onClick={handleGenerarCampana}
              disabled={generando}
              className="px-6 py-2.5 rounded-xl bg-white text-[#1D71B5] hover:bg-slate-100 font-heading font-extrabold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {generando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#36A6DE]" />}
              <span>{generando ? "Diseñando y Redactando..." : "Crear Campaña con IA"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESULTADO GENERADO */}
      {campanaActual && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#1D71B5] bg-blue-50 px-2 py-0.5 rounded-md">
                {campanaActual.redSocial.toUpperCase()} • {campanaActual.formato}
              </span>
              <h3 className="font-heading font-extrabold text-base text-slate-800 mt-1">
                {campanaActual.conceptoCampana}
              </h3>
            </div>
            <button
              onClick={handleCopiarTexto}
              className="px-4 py-2 rounded-xl bg-blue-50 text-[#1D71B5] hover:bg-[#1D71B5] hover:text-white text-xs font-heading font-bold flex items-center gap-1.5 transition-all border border-blue-200"
            >
              {copiadoCopy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiadoCopy ? "¡Copiado!" : "Copiar Texto Completo"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Generado con FLUX.1 */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-heading font-bold text-slate-700 block">
                Visual Renderizado (FLUX.1 Schnell 8K)
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square relative shadow-inner">
                {campanaActual.imagenGeneradaUrl ? (
                  <img
                    src={campanaActual.imagenGeneradaUrl}
                    alt="Anuncio generado"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">
                Prompt FLUX: {campanaActual.promptFluxGenerado}
              </p>
            </div>

            {/* Copywriting AIDA + Hook */}
            <div className="lg:col-span-7 space-y-4">
              {/* Hook 3s */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  Hook de 3 Segundos (Para Reel / Video / Story):
                </span>
                <p className="text-xs font-heading font-bold text-amber-950 mt-1">
                  {campanaActual.copywriting.gancho_3_segundos}
                </p>
              </div>

              {/* Cuerpo AIDA */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Cuerpo del Copy (Fórmula AIDA):
                </span>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {campanaActual.copywriting.cuerpo_aida}
                </p>
              </div>

              {/* CTA & Hashtags */}
              <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <p className="text-xs font-bold text-[#1D71B5]">
                  {campanaActual.copywriting.llamado_a_la_accion}
                </p>
                <div className="flex flex-wrap gap-1">
                  {campanaActual.copywriting.hashtags_estrategicos.map((h, i) => (
                    <span key={i} className="text-[11px] text-slate-500 font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
