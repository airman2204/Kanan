"use client";

import React, { useState } from "react";
import {
  Share2,
  TrendingUp,
  Search,
  Globe,
  Instagram,
  Facebook,
  Video,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Target,
  Users,
  Eye,
  MousePointer,
} from "lucide-react";
import { MarketingMetrics } from "@/types/crm";

interface MarketingAnalyticsViewProps {
  metrics: MarketingMetrics;
  onUpdateMarketing: (updates: Partial<MarketingMetrics>) => Promise<void>;
}

export function MarketingAnalyticsView({
  metrics,
  onUpdateMarketing,
}: MarketingAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<"redes" | "google_ads" | "seo_sem">("redes");
  const [linkingPlatform, setLinkingPlatform] = useState<string | null>(null);

  const redes = metrics.redes || [];
  const googleAds = metrics.google_ads;
  const seoSem = metrics.seo_sem;

  const totalSeguidores = redes.reduce((acc, r) => acc + (r.conectado ? r.seguidores : 0), 0);
  const totalAlcance = redes.reduce((acc, r) => acc + (r.conectado ? r.alcance_30d : 0), 0);
  const totalInteracciones = redes.reduce((acc, r) => acc + (r.conectado ? r.interacciones_30d : 0), 0);

  const handleToggleConnect = async (platform: "facebook" | "instagram" | "tiktok") => {
    setLinkingPlatform(platform);
    setTimeout(async () => {
      const updatedRedes = redes.map((r) => {
        if (r.red === platform) {
          const nextState = !r.conectado;
          return {
            ...r,
            conectado: nextState,
            nombre_cuenta: nextState
              ? platform === "instagram"
                ? "@servicioskanan.gdl"
                : platform === "facebook"
                ? "Kanan Servicios Guadalajara"
                : "@kananlimpieza.mx"
              : undefined,
            seguidores: nextState ? (platform === "tiktok" ? 1850 : r.seguidores || 2400) : 0,
            alcance_30d: nextState ? (platform === "tiktok" ? 12400 : r.alcance_30d || 15000) : 0,
            interacciones_30d: nextState ? (platform === "tiktok" ? 950 : r.interacciones_30d || 1100) : 0,
            clics_web_30d: nextState ? (platform === "tiktok" ? 310 : r.clics_web_30d || 250) : 0,
          };
        }
        return r;
      });

      await onUpdateMarketing({ redes: updatedRedes });
      setLinkingPlatform(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Pestañas de Navegación */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl w-fit text-xs font-heading font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("redes")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "redes" ? "bg-white text-[#355581] shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Redes Sociales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("google_ads")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "google_ads" ? "bg-white text-[#355581] shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Google Ads & SEM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo_sem")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "seo_sem" ? "bg-white text-[#355581] shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tráfico Web & SEO
        </button>
      </div>

      {/* PESTAÑA 1: REDES SOCIALES */}
      {activeTab === "redes" && (
        <div className="space-y-6">
          {/* Métricas Globales Redes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Comunidad Total
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
                {totalSeguidores.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">seguidores activos en redes</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Alcance Mensual (30d)
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1D71B5]">
                {totalAlcance.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">personas alcanzadas en Jalisco</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Interacciones (30d)
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {totalInteracciones.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">likes, comentarios y mensajes</span>
            </div>
          </div>

          {/* Tarjetas de Vinculación de Redes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {redes.map((r) => {
              const isFb = r.red === "facebook";
              const isIg = r.red === "instagram";
              const isTt = r.red === "tiktok";

              return (
                <div
                  key={r.red}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                            isFb ? "bg-[#1877F2]" : isIg ? "bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4]" : "bg-black"
                          }`}
                        >
                          {isFb && <Facebook className="w-5 h-5" />}
                          {isIg && <Instagram className="w-5 h-5" />}
                          {isTt && <Video className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm text-slate-800 capitalize">
                            {r.red}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {r.conectado ? r.nombre_cuenta : "Sin vincular"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.conectado
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {r.conectado ? "Conectado" : "Desconectado"}
                      </span>
                    </div>

                    {r.conectado ? (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Seguidores</span>
                          <span className="font-bold text-slate-800">{r.seguidores.toLocaleString("es-MX")}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Alcance (30d)</span>
                          <span className="font-bold text-slate-800">{r.alcance_30d.toLocaleString("es-MX")}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Interacciones</span>
                          <span className="font-bold text-slate-800">{r.interacciones_30d.toLocaleString("es-MX")}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Clics al sitio</span>
                          <span className="font-bold text-slate-800">{r.clics_web_30d.toLocaleString("es-MX")}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-4">
                        Vincula tu cuenta oficial para sincronizar seguidores, alcance e interacciones de anuncios y contenido orgánico.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={linkingPlatform === r.red}
                    onClick={() => handleToggleConnect(r.red)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-bold transition-all shadow-xs ${
                      r.conectado
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-[#355581] hover:bg-[#1D71B5] text-white"
                    }`}
                  >
                    {linkingPlatform === r.red
                      ? "Conectando..."
                      : r.conectado
                      ? "Desvincular cuenta"
                      : "Vincular cuenta"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GOOGLE ADS & SEM */}
      {activeTab === "google_ads" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Inversión mensual
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
                ${googleAds.inversion_mes.toLocaleString("es-MX")} <span className="text-xs text-slate-400">MXN</span>
              </p>
              <span className="text-[11px] text-slate-400">Campañas activas en ZMG</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Impresiones en Búsqueda
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1D71B5]">
                {googleAds.impresiones.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">Veces mostrado en Google</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Clics Calificados
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-indigo-600">
                {googleAds.clics.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">CPC Promedio: ${googleAds.cpc_promedio} MXN</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Conversiones / Leads
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {googleAds.conversiones}
              </p>
              <span className="text-[11px] text-slate-400">Clientes que cotizaron o agendaron</span>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: SEO Y TRÁFICO WEB */}
      {activeTab === "seo_sem" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Tráfico Orgánico (SEO)
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
                {seoSem.visitas_organicas.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">visitas sin pagar anuncios</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Tráfico de Anuncios (SEM)
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1D71B5]">
                {seoSem.visitas_pagadas.toLocaleString("es-MX")}
              </p>
              <span className="text-[11px] text-slate-400">visitas impulsadas por Google Ads</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-heading font-extrabold text-[#355581]/70 uppercase tracking-wider">
                Posición Promedio en Google
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600">
                #{seoSem.posicion_promedio}
              </p>
              <span className="text-[11px] text-slate-400">en búsquedas locales de Jalisco</span>
            </div>
          </div>

          {/* Tabla de Palabras Clave Principales */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#355581] uppercase tracking-wider">
              Palabras clave mejor posicionadas en ZMG
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Palabra Clave</th>
                    <th className="py-2.5 px-3 text-center">Posición en Google</th>
                    <th className="py-2.5 px-3 text-right">Búsquedas mensuales (Volumen)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seoSem.palabras_clave_top.map((kw, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {kw.keyword}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#1D71B5] border border-blue-200">
                          Top #{kw.posicion}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                        {kw.volumen.toLocaleString("es-MX")} búsquedas/mes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
