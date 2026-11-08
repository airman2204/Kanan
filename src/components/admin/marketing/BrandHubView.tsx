"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Trash2,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";
import { ArchivoMarcaHub } from "@/types/marketingAi";

export function BrandHubView() {
  const [archivos, setArchivos] = useState<ArchivoMarcaHub[]>([
    {
      id: "hub-1",
      nombre: "Mascota Oficial Kanan (Perrito Peluche Guinda)",
      tipo: "mascota",
      url: "/assets/brand/kanan-mascot.png",
      subidoEn: "2026-11-06",
      descripcion: "Personaje 3D oficial para pautas publicitarias y stickers",
    },
    {
      id: "hub-2",
      nombre: "Manual de Limpieza y Garantía Kanan.pdf",
      tipo: "manual_pdf",
      url: "/assets/docs/manual-kanan.pdf",
      subidoEn: "2026-11-05",
      descripcion: "Procesos técnicos de inyección-succión, pH y tiempos de secado",
    },
    {
      id: "hub-3",
      nombre: "Fotografía Real Sala Microfibra Antes y Después",
      tipo: "foto_real",
      url: "/assets/portfolio/sofacama-despues.jpg",
      subidoEn: "2026-11-07",
      descripcion: "Evidencia de extracción profunda en Guadalajara",
    },
  ]);

  const [falKeyInput, setFalKeyInput] = useState("");
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch("/api/admin/ads/config");
      const data = await res.json();
      if (data.ok && data.config) {
        if (data.config.fal_masked) setFalKeyInput(data.config.fal_masked);
        if (data.config.gemini_masked) setGeminiKeyInput(data.config.gemini_masked);
      }
    } catch {
      // Ignorar error de carga inicial
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleGuardarCredenciales = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingConfig(true);
      setStatusMessage(null);
      const res = await fetch("/api/admin/ads/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fal_key: falKeyInput.includes("••••") ? undefined : falKeyInput,
          gemini_api_key: geminiKeyInput.includes("••••") ? undefined : geminiKeyInput,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage({ type: "success", text: "Credenciales de Kanan guardadas con éxito y aisladas de otros proyectos." });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Error al guardar." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Error de red al conectar con el servidor." });
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleProbarConexion = async () => {
    try {
      setTestingConnection(true);
      setStatusMessage(null);
      const res = await fetch("/api/admin/ads/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_CONNECTION",
          fal_key: falKeyInput.includes("••••") ? undefined : falKeyInput,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage({ type: "success", text: "¡Prueba exitosa! FLUX.1 Schnell respondió correctamente." });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Fallo en la prueba de conexión a fal.ai." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "No se pudo completar la prueba de conexión." });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: CREDENCIALES AISLADAS DE KANAN */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1D71B5] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#355581]">
                Credenciales Exclusivas de Kanan (FLUX.1 & Gemini)
              </h3>
              <p className="text-xs text-slate-500">
                Aislamiento completo: estas llaves no se comparten con FoxDrop ni proyectos externos.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Entorno Kanan Seguro
          </span>
        </div>

        <form onSubmit={handleGuardarCredenciales} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-bold text-slate-700 mb-1">
                FAL_KEY (fal.ai para FLUX.1 Schnell 8K)
              </label>
              <input
                type="password"
                value={falKeyInput}
                onChange={(e) => setFalKeyInput(e.target.value)}
                placeholder="fal_key_..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#1D71B5] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Genera fotografía de salas, colchones y la mascota sin límites.
              </span>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-slate-700 mb-1">
                GEMINI_API_KEY (Google AI Studio)
              </label>
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#1D71B5] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Redacta hooks de 3 segundos, textos AIDA y copys para Instagram, FB y TikTok.
              </span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleProbarConexion}
              disabled={testingConnection}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {testingConnection ? <Loader2 className="w-4 h-4 animate-spin text-[#1D71B5]" /> : null}
              <span>Probar Conexión FLUX</span>
            </button>
            <button
              type="submit"
              disabled={loadingConfig}
              className="px-5 py-2.5 rounded-xl bg-[#1D71B5] hover:bg-[#355581] text-white text-xs font-heading font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              Guardar Credenciales Kanan
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: BRAND ASSETS HUB (FOTOS, MASCOTA Y PDFS) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#355581]">
              Brand Assets Hub (Conocimiento de Marca Kanan)
            </h3>
            <p className="text-xs text-slate-500">
              Archivos, fotos reales y manuales técnicos que el Agente de IA consulta para no inventar servicios.
            </p>
          </div>
          <label className="px-4 py-2 rounded-xl bg-blue-50 text-[#1D71B5] hover:bg-[#1D71B5] hover:text-white text-xs font-heading font-bold transition-all border border-blue-200 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Nuevo Gráfico o PDF</span>
            <input type="file" className="hidden" />
          </label>
        </div>

        {/* Grid de Activos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {archivos.map((arc) => (
            <div
              key={arc.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#1D71B5] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1D71B5] border border-blue-100">
                  {arc.tipo}
                </span>
                <span className="text-[10px] text-slate-400">{arc.subidoEn}</span>
              </div>

              <div className="h-28 rounded-xl bg-slate-200/70 overflow-hidden flex items-center justify-center border border-slate-200">
                {arc.tipo === "manual_pdf" ? (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <FileText className="w-8 h-8 text-[#1D71B5]" />
                    <span className="text-[10px] font-bold">Documento PDF</span>
                  </div>
                ) : (
                  <img
                    src={arc.url}
                    alt={arc.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div>
                <h4 className="font-heading font-bold text-xs text-slate-800 line-clamp-1">
                  {arc.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {arc.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
