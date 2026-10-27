"use client";

import { useState } from "react";
import { 
  Instagram, 
  Share2, 
  BarChart3, 
  Search, 
  RefreshCw, 
  Settings2,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check
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
      app_id: "",
      app_secret: "",
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
    appId: metaConn.app_id || "",
    appSecret: metaConn.app_secret || "",
    pageName: metaConn.page_name || "",
    igHandle: metaConn.ig_account_name || "",
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

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);

  const copyRedirectUri = () => {
    navigator.clipboard.writeText("https://admin.kananlimpieza.mx/api/auth/meta/callback");
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isConnected = Boolean(metaForm.appId && metaForm.appSecret);
      const updated: MetaConnection = {
        conectado: isConnected,
        app_id: metaForm.appId,
        app_secret: metaForm.appSecret,
        page_name: metaForm.pageName || "Kanan Limpieza",
        ig_account_name: metaForm.igHandle.replace("@", ""),
        connected_at: isConnected ? new Date().toISOString() : undefined,
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
                  {metaConn.conectado ? "Conectado" : "Pendiente"}
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
                <div className="py-4 text-center">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Requiere App ID de Meta</p>
                  <p className="text-[11px] text-slate-400">Configura tus credenciales para activar la sincronización oficial.</p>
                </div>
              )}

              <button
                onClick={() => setShowMetaModal(true)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {metaConn.conectado ? "Administrar Conexión" : "Vincular Meta Suite"}
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
                  {googleAdsConn.conectado ? "Conectado" : "Pendiente"}
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
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Sin Customer ID</p>
                  <p className="text-[11px] text-slate-400">Ingresa tu identificador de cuenta de Google Ads.</p>
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
                  {seoConn.conectado ? "Conectado" : "Pendiente"}
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
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Sin Dominio Vinculado</p>
                  <p className="text-[11px] text-slate-400">Verifica la propiedad de kananlimpieza.mx.</p>
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
          {/* INSTRUCCIONES GUÍA PARA EL CLIENTE: SOLO SE MUESTRAN SI NO ESTÁ CONECTADO */}
          {!metaConn.conectado ? (
            <div className="bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">
                      Instrucciones para Vincular Facebook e Instagram
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sigue estos sencillos pasos para que tu CRM lea automáticamente las métricas reales. Una vez vinculado, esta guía desaparecerá.
                    </p>
                  </div>
                </div>

                <a
                  href="https://developers.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-heading font-bold text-xs transition shadow-md shadow-blue-500/20 w-fit"
                >
                  <span>Abrir Meta Developers</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1877F2] font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Crear tu App en Meta</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Entra a <strong>developers.facebook.com</strong> con tu cuenta administradora. Da clic en <strong>Mis apps</strong> &gt; <strong>Crear app</strong> y elige la opción <strong>Negocio</strong>.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1877F2] font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Configuración Básica</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En el menú lateral ve a <strong>Configuración de la app &gt; Básica</strong>. En <i>Dominio</i> escribe <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">admin.kananlimpieza.mx</code>.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1877F2] font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Copiar tus Claves</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Copia el <strong>Identificador de la app (App ID)</strong> y la <strong>Clave secreta (App Secret)</strong> y pégalos en el botón de abajo.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tus claves se resguardan de forma segura y solo se usan para leer tus alcances e interacciones.</span>
                </div>
                <button
                  onClick={() => setShowMetaModal(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white font-heading font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  Ingresar Claves de Meta
                </button>
              </div>
            </div>
          ) : (
            /* BANNER DE CONEXIÓN ACTIVA CUANDO YA ESTÁ VINCULADO */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Meta Business Suite Conectado</h4>
                  <p className="text-xs text-emerald-800">Sincronizado con Graph API oficial. Las métricas se actualizan de forma continua.</p>
                </div>
              </div>
              <button
                onClick={() => setShowMetaModal(true)}
                className="px-4 py-2 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl transition"
              >
                Reconfigurar Claves
              </button>
            </div>
          )}

          {/* TARJETAS DE FACEBOOK E INSTAGRAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Página de Facebook</h4>
                    <p className="text-xs text-slate-500">{metaConn.page_name || "Kanan Limpieza Especializada"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  metaConn.conectado 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {metaConn.conectado ? "Sincronizada" : "Sin vincular"}
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
                    <p className="text-xs text-slate-500">@{metaConn.ig_account_name || "kananlimpieza"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  metaConn.conectado 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {metaConn.conectado ? "Sincronizada" : "Sin vincular"}
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

      {/* MODAL CONFIGURACIÓN META */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#1877F2]" />
                Credenciales de Meta Developers
              </h3>
              <button
                type="button"
                onClick={() => setShowMetaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Identificador de la App (App ID) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 148294829104829"
                  value={metaForm.appId}
                  onChange={(e) => setMetaForm({ ...metaForm, appId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clave secreta de la App (App Secret) *
                </label>
                <input
                  type="password"
                  placeholder="Ej: a9f8e7d6c5b4..."
                  value={metaForm.appSecret}
                  onChange={(e) => setMetaForm({ ...metaForm, appSecret: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#1877F2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre Página FB</label>
                  <input
                    type="text"
                    placeholder="Kanan Limpieza Especializada"
                    value={metaForm.pageName}
                    onChange={(e) => setMetaForm({ ...metaForm, pageName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Usuario Instagram (@)</label>
                  <input
                    type="text"
                    placeholder="@kananlimpieza"
                    value={metaForm.igHandle}
                    onChange={(e) => setMetaForm({ ...metaForm, igHandle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
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
                  className="w-1/2 py-2.5 bg-[#1877F2] hover:bg-blue-600 rounded-xl font-semibold text-white transition disabled:opacity-50 shadow-md shadow-blue-500/20"
                >
                  {saving ? "Guardando..." : "Guardar y Vincular"}
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
