"use client";

import { useState } from "react";
import { 
  Instagram, 
  Share2, 
  BarChart3, 
  Search, 
  TrendingUp, 
  RefreshCw, 
  Settings2,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { MarketingMetrics, MetaConnection, GoogleAdsConnection, SeoAnalytics } from "@/types/crm";

interface MarketingAnalyticsViewProps {
  metrics?: MarketingMetrics;
  onRefresh?: () => void;
}

export function MarketingAnalyticsView({
  metrics,
  onRefresh,
}: MarketingAnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "meta" | "google_ads" | "seo">("overview");

  // Meta connection state
  const [metaConn, setMetaConn] = useState<MetaConnection>(
    metrics?.meta || {
      conectado: false,
      page_name: "",
      ig_account_name: "",
    }
  );

  // Google Ads connection state
  const [googleAdsConn, setGoogleAdsConn] = useState<GoogleAdsConnection>(
    metrics?.google_ads || {
      conectado: false,
      customer_id: "",
      account_name: "",
    }
  );

  // SEO / Search Console state
  const [seoConn, setSeoConn] = useState<SeoAnalytics>(
    metrics?.seo_sem || {
      conectado: false,
      search_console_property: "kananlimpieza.mx",
    }
  );

  // Connection Modals
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showGoogleAdsModal, setShowGoogleAdsModal] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);

  // Form Inputs
  const [metaForm, setMetaForm] = useState({
    pageName: metaConn.page_name || "",
    igHandle: metaConn.ig_account_name || "",
    accessToken: "",
  });

  const [googleForm, setGoogleForm] = useState({
    customerId: googleAdsConn.customer_id || "",
    accountName: googleAdsConn.account_name || "",
    developerToken: "",
  });

  const [seoForm, setSeoForm] = useState({
    siteUrl: seoConn.search_console_property || "kananlimpieza.mx",
    serviceAccountKey: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: MetaConnection = {
        conectado: Boolean(metaForm.pageName && metaForm.igHandle),
        page_name: metaForm.pageName,
        ig_account_name: metaForm.igHandle.replace("@", ""),
        connected_at: new Date().toISOString(),
        metricas_reales: metaConn.metricas_reales || {
          seguidores_fb: 0,
          seguidores_ig: 0,
          alcance_30d: 0,
          impresiones_30d: 0,
          interacciones_30d: 0,
          clics_al_sitio: 0,
          tasa_engagement: 0,
          visitas_al_perfil: 0,
        },
      };
      setMetaConn(updated);

      await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_MARKETING",
          marketing: { meta: updated },
        }),
      });

      setShowMetaModal(false);
      if (onRefresh) onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoogleAds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: GoogleAdsConnection = {
        conectado: Boolean(googleForm.customerId),
        customer_id: googleForm.customerId,
        account_name: googleForm.accountName || "Kanan Campañas",
        connected_at: new Date().toISOString(),
        metricas_reales: googleAdsConn.metricas_reales || {
          inversion_30d: 0,
          impresiones: 0,
          clics: 0,
          cpc_promedio: 0,
          ctr_promedio: 0,
          conversiones: 0,
          costo_por_conversion: 0,
          campanias_activas: [],
        },
      };
      setGoogleAdsConn(updated);

      await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_MARKETING",
          marketing: { google_ads: updated },
        }),
      });

      setShowGoogleAdsModal(false);
      if (onRefresh) onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: SeoAnalytics = {
        conectado: Boolean(seoForm.siteUrl),
        search_console_property: seoForm.siteUrl,
        metricas_reales: seoConn.metricas_reales || {
          clics_organicos: 0,
          impresiones_organicas: 0,
          ctr_organico: 0,
          posicion_promedio: 0,
          top_consultas: [],
          top_paginas: [],
        },
      };
      setSeoConn(updated);

      await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_MARKETING",
          marketing: { seo_sem: updated },
        }),
      });

      setShowSeoModal(false);
      if (onRefresh) onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const metaM = metaConn.metricas_reales;
  const adsM = googleAdsConn.metricas_reales;
  const seoM = seoConn.metricas_reales;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "overview"
                ? "bg-[#355581] text-white shadow-md shadow-[#355581]/20"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            Vista Ejecutiva
          </button>
          <button
            onClick={() => setActiveTab("meta")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "meta"
                ? "bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/20"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Share2 className="w-4 h-4" />
            Meta (Facebook & Instagram)
          </button>
          <button
            onClick={() => setActiveTab("google_ads")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "google_ads"
                ? "bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Google Ads (SEM)
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === "seo"
                ? "bg-[#10B981] text-white shadow-md shadow-[#10B981]/20"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            Google Search Console (SEO)
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Meta Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Meta Suite</h3>
                    <p className="text-xs text-slate-500">Facebook & Instagram</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    metaConn.conectado
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {metaConn.conectado ? "Conectado" : "Desconectado"}
                </span>
              </div>

              {metaConn.conectado ? (
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Página:</span>
                    <span className="text-slate-800 font-medium">{metaConn.page_name || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Instagram:</span>
                    <span className="text-slate-800 font-medium">@{metaConn.ig_account_name || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Alcance mensual:</span>
                    <span className="text-slate-800 font-medium">{(metaM?.alcance_30d || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Interacciones:</span>
                    <span className="text-slate-800 font-medium">{(metaM?.interacciones_30d || 0).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Sin credenciales configuradas
                </div>
              )}

              <button
                onClick={() => setShowMetaModal(true)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {metaConn.conectado ? "Administrar Conexión" : "Vincular Cuentas"}
              </button>
            </div>

            {/* Google Ads Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Google Ads</h3>
                    <p className="text-xs text-slate-500">Campañas SEM</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    googleAdsConn.conectado
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {googleAdsConn.conectado ? "Conectado" : "Desconectado"}
                </span>
              </div>

              {googleAdsConn.conectado ? (
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">ID de Cliente:</span>
                    <span className="text-slate-800 font-mono">{googleAdsConn.customer_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Clics:</span>
                    <span className="text-slate-800 font-medium">{(adsM?.clics || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">CTR:</span>
                    <span className="text-slate-800 font-medium">{adsM?.ctr_promedio || 0}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Inversión:</span>
                    <span className="text-slate-800 font-medium">${(adsM?.inversion_30d || 0).toLocaleString()} MXN</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Sin credenciales configuradas
                </div>
              )}

              <button
                onClick={() => setShowGoogleAdsModal(true)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {googleAdsConn.conectado ? "Administrar Campaña" : "Vincular Google Ads"}
              </button>
            </div>

            {/* SEO Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Google SEO</h3>
                    <p className="text-xs text-slate-500">Search Console</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    seoConn.conectado
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {seoConn.conectado ? "Conectado" : "Desconectado"}
                </span>
              </div>

              {seoConn.conectado ? (
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Propiedad:</span>
                    <span className="text-slate-800 font-medium">{seoConn.search_console_property}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Clics Orgánicos:</span>
                    <span className="text-slate-800 font-medium">{(seoM?.clics_organicos || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Impresiones:</span>
                    <span className="text-slate-800 font-medium">{(seoM?.impresiones_organicas || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Posición promedio:</span>
                    <span className="text-slate-800 font-medium">{seoM?.posicion_promedio || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Sin credenciales configuradas
                </div>
              )}

              <button
                onClick={() => setShowSeoModal(true)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {seoConn.conectado ? "Administrar Propiedad" : "Vincular Search Console"}
              </button>
            </div>
          </div>

          {/* Consolidated Performance Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-base mb-6">Métricas Globales de Adquisición</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Impresiones Totales
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {((adsM?.impresiones || 0) + (seoM?.impresiones_organicas || 0)).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">SEO + Google Ads</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <MousePointerClick className="w-4 h-4 text-emerald-500" />
                  Clics Totales al Sitio
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {((adsM?.clics || 0) + (seoM?.clics_organicos || 0)).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Tráfico calificado</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  Conversiones / Reservas
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {(adsM?.conversiones || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Agendadas desde pauta</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Inversión SEM
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${(adsM?.inversion_30d || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">MXN</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Gasto en anuncios</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* META TAB */}
      {activeTab === "meta" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#1877F2]" />
                Meta Business & Instagram Insights
              </h3>
            </div>
            <button
              onClick={() => setShowMetaModal(true)}
              className="px-4 py-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <Settings2 className="w-4 h-4" />
              {metaConn.conectado ? "Reconfigurar Conexión" : "Conectar Cuentas"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Página de Facebook</h4>
                    <p className="text-xs text-slate-500">{metaConn.page_name || "No vinculada"}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
                  {metaConn.conectado ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Seguidores</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {(metaM?.seguidores_fb || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Alcance de Publicaciones</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {(metaM?.alcance_30d || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Instagram Profesional</h4>
                    <p className="text-xs text-slate-500">@{metaConn.ig_account_name || "No vinculado"}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
                  {metaConn.conectado ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Seguidores</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {(metaM?.seguidores_ig || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Interacción Mensual</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {(metaM?.interacciones_30d || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE ADS TAB */}
      {activeTab === "google_ads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4285F4]" />
                Google Ads Performance (SEM)
              </h3>
            </div>
            <button
              onClick={() => setShowGoogleAdsModal(true)}
              className="px-4 py-2 bg-[#4285F4] hover:bg-[#4285F4]/90 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <Settings2 className="w-4 h-4" />
              {googleAdsConn.conectado ? "Configurar Parámetros" : "Vincular Cuenta"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Inversión del Período</div>
              <div className="text-2xl font-bold text-slate-900">
                ${(adsM?.inversion_30d || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">MXN</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Clics Generados</div>
              <div className="text-2xl font-bold text-slate-900">{(adsM?.clics || 0).toLocaleString()}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">CTR Promedio</div>
              <div className="text-2xl font-bold text-slate-900">{adsM?.ctr_promedio || 0}%</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Coste por Clic (CPC)</div>
              <div className="text-2xl font-bold text-slate-900">${adsM?.cpc_promedio || 0} MXN</div>
            </div>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#10B981]" />
                Google Search Console & SEO
              </h3>
            </div>
            <button
              onClick={() => setShowSeoModal(true)}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              <Settings2 className="w-4 h-4" />
              {seoConn.conectado ? "Configurar Propiedad" : "Conectar Dominio"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Clics Orgánicos</div>
              <div className="text-2xl font-bold text-slate-900">{(seoM?.clics_organicos || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Impresiones en Búsqueda</div>
              <div className="text-2xl font-bold text-slate-900">{(seoM?.impresiones_organicas || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Posición Media</div>
              <div className="text-2xl font-bold text-slate-900">{seoM?.posicion_promedio || 0}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-base mb-4">Palabras Clave Principales</h4>
            {seoM?.top_consultas && seoM.top_consultas.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {seoM.top_consultas.map((kw, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{kw.query}</span>
                    <div className="flex gap-6 text-slate-500">
                      <span>Clics: <strong className="text-slate-900">{kw.clics}</strong></span>
                      <span>Pos: <strong className="text-slate-900">#{kw.posicion}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Aún no hay términos registrados. Los datos se sincronizan directamente desde Google Search Console.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL META */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#1877F2]" />
              Configurar Meta Business Suite
            </h3>

            <form onSubmit={handleSaveMeta} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nombre de la Página de Facebook</label>
                <input
                  type="text"
                  placeholder="Kanan Limpieza Especializada"
                  value={metaForm.pageName}
                  onChange={(e) => setMetaForm({ ...metaForm, pageName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Usuario de Instagram (@)</label>
                <input
                  type="text"
                  placeholder="@kananlimpieza"
                  value={metaForm.igHandle}
                  onChange={(e) => setMetaForm({ ...metaForm, igHandle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Token de Acceso de Graph API (Opcional)</label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={metaForm.accessToken}
                  onChange={(e) => setMetaForm({ ...metaForm, accessToken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMetaModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-[#1877F2] hover:bg-[#1877F2]/90 rounded-xl font-semibold text-white transition disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Parámetros"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GOOGLE ADS */}
      {showGoogleAdsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4285F4]" />
              Configurar Google Ads (SEM)
            </h3>

            <form onSubmit={handleSaveGoogleAds} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">ID de Cliente de Google Ads</label>
                <input
                  type="text"
                  placeholder="123-456-7890"
                  value={googleForm.customerId}
                  onChange={(e) => setGoogleForm({ ...googleForm, customerId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#4285F4]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nombre de la Cuenta</label>
                <input
                  type="text"
                  placeholder="Kanan Limpieza Campañas"
                  value={googleForm.accountName}
                  onChange={(e) => setGoogleForm({ ...googleForm, accountName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Developer Token (Opcional)</label>
                <input
                  type="password"
                  placeholder="Token de API..."
                  value={googleForm.developerToken}
                  onChange={(e) => setGoogleForm({ ...googleForm, developerToken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleAdsModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-xl font-semibold text-white transition disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Parámetros"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SEO */}
      {showSeoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#10B981]" />
              Configurar Google Search Console
            </h3>

            <form onSubmit={handleSaveSeo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">URL o Dominio de la Propiedad</label>
                <input
                  type="text"
                  placeholder="https://kananlimpieza.mx o sc-domain:kananlimpieza.mx"
                  value={seoForm.siteUrl}
                  onChange={(e) => setSeoForm({ ...seoForm, siteUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-[#10B981]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Credencial JSON de Cuenta de Servicio (Opcional)</label>
                <textarea
                  placeholder='{"type": "service_account", ...}'
                  rows={3}
                  value={seoForm.serviceAccountKey}
                  onChange={(e) => setSeoForm({ ...seoForm, serviceAccountKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeoModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-[#10B981] hover:bg-[#10B981]/90 rounded-xl font-semibold text-white transition disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Propiedad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
