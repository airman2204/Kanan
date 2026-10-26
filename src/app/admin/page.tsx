"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Star,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { KananDatabase, ServicioCita, Cliente, EstatusCita } from "@/types/crm";
import { JaliscoServiceMap } from "@/components/admin/JaliscoServiceMap";
import { WhatsAppFoxdrop } from "@/components/admin/WhatsAppFoxdrop";

const ESTATUS_COLUMNS: EstatusCita[] = [
  "Por Confirmar",
  "Confirmada",
  "En Ruta",
  "En Proceso",
  "Completada",
];

const TECNICOS_ZMG = [
  "Por asignar",
  "Ing. Roberto Márquez (Unidad 01)",
  "Téc. Alejandro Silva (Unidad 02)",
  "Téc. Daniel Orozco (Unidad 03)",
];

export default function AdminPage() {
  const router = useRouter();

  // Estados de sesión y datos
  const [authChecking, setAuthChecking] = useState(true);
  const [db, setDb] = useState<KananDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // Navegación en el Menú Lateral
  const [activeSection, setActiveSection] = useState<"resumen" | "calendario" | "clientes" | "whatsapp">("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tráfico simulado en tiempo real
  const [onlineVisitors, setOnlineVisitors] = useState(7);

  // Filtro de calendario
  const [calendarHighlightStatus, setCalendarHighlightStatus] = useState<string | null>(null);

  // Comprobar autenticación segura
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!data.authenticated) {
        router.push("/admin/login");
        return;
      }
      if (data.mustChangePassword) {
        router.push("/admin/login");
        return;
      }
      setAuthChecking(false);
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchCrmData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm");
      const data = (await res.json()) as KananDatabase;
      setDb(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCrmData();

    // Actualizar visitantes en tiempo real sutilmente
    const interval = setInterval(() => {
      setOnlineVisitors((prev) => Math.max(3, Math.min(18, prev + Math.floor(Math.random() * 3) - 1)));
    }, 8000);

    return () => clearInterval(interval);
  }, [checkAuth, fetchCrmData]);

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    router.push("/admin/login");
  };

  const handleToggleHalloween = async (enabled: boolean) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_HALLOWEEN", enabled }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  const handleUpdateCita = async (
    citaId: string,
    updates: {
      estatus?: EstatusCita;
      tecnico_asignado?: string;
      monto_total?: number | null;
      calificacion?: number | null;
    }
  ) => {
    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "UPDATE_CITA",
        citaId,
        ...updates,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  const handleTriggerWhatsApp = async (mensajeId: string) => {
    const res = await fetch("/api/webhooks/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TRIGGER_MESSAGE", mensajeId }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      window.open(data.waLink, "_blank", "noopener,noreferrer");
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#355581] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const clientes = db?.clientes || [];
  const citas = db?.servicios_citas || [];
  const mensajes = db?.mensajes_automatizacion || [];

  // Cálculos Financieros
  const totalGanancias = clientes.reduce((acc, c) => acc + (c.historico_gasto || 0), 0);
  const totalServicios = citas.length;
  const serviciosCompletados = citas.filter((c) => c.estatus === "Completada").length;

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col md:flex-row antialiased text-slate-800">
      
      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-72 bg-gradient-to-b from-[#101F33] via-[#162D4A] to-[#0D1A2B] text-white flex flex-col justify-between p-6 shadow-2xl border-r border-white/5 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          {/* Logo en tamaño grande y perfectamente centrado */}
          <div className="flex flex-col items-center justify-center pb-5 border-b border-white/10 relative">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-0 right-0 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/assets/brand/kanan-logo-white.png"
              alt="Kanan"
              className="h-16 sm:h-20 w-auto object-contain mx-auto"
            />
          </div>

          {/* Navegación Principal */}
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setActiveSection("resumen");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-heading font-bold text-sm transition-all duration-200 ${
                activeSection === "resumen"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeSection === "resumen" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("calendario");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-heading font-bold text-sm transition-all duration-200 ${
                activeSection === "calendario"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className={`w-5 h-5 ${activeSection === "calendario" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Calendario de citas</span>
              {citas.filter((c) => c.estatus === "Por Confirmar").length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36A6DE] text-white">
                  {citas.filter((c) => c.estatus === "Por Confirmar").length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("clientes");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-heading font-bold text-sm transition-all duration-200 ${
                activeSection === "clientes"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className={`w-5 h-5 ${activeSection === "clientes" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("whatsapp");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-heading font-bold text-sm transition-all duration-200 ${
                activeSection === "whatsapp"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${activeSection === "whatsapp" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>WhatsApp</span>
            </button>
          </nav>
        </div>

        {/* Pie de Menú Lateral */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          {/* Switch Modo Halloween */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <span className="text-xs font-heading font-bold flex items-center gap-2 text-orange-300">
              <span className="text-base">🎃</span>
              <span>Modo Halloween</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={db?.config?.modo_halloween ?? true}
              onClick={() => handleToggleHalloween(!(db?.config?.modo_halloween ?? true))}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                (db?.config?.modo_halloween ?? true) ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  (db?.config?.modo_halloween ?? true) ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-heading font-bold text-white transition-all border border-white/10"
          >
            <span>Ver Sitio Web</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-heading font-bold text-rose-200 hover:text-white transition-all border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior Móvil */}
        <div className="md:hidden bg-[#101F33] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-white/10">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/assets/brand/kanan-logo-white.png"
            alt="Kanan"
            className="h-12 w-auto object-contain"
          />
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* SECCIÓN 1: RESUMEN (PÁGINA PRINCIPAL) */}
          {activeSection === "resumen" && (
            <div className="space-y-8">
              
              {/* Tarjetas de Métricas de Alto Nivel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Ganancias */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(53,85,129,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(53,85,129,0.12)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-heading font-extrabold text-[#355581]/70 tracking-wider uppercase">
                      Ganancias
                    </span>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1D71B5] to-[#36A6DE] text-white shadow-md shadow-[#1D71B5]/25">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading text-3xl font-extrabold text-[#1e293b] tracking-tight">
                      ${totalGanancias.toLocaleString("es-MX")}
                    </p>
                    <span className="inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      MXN
                    </span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#36A6DE]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#36A6DE]/10 transition-colors" />
                </div>

                {/* Servicios */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(53,85,129,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(53,85,129,0.12)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-heading font-extrabold text-[#355581]/70 tracking-wider uppercase">
                      Servicios
                    </span>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#355581] to-[#1D71B5] text-white shadow-md shadow-[#355581]/25">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading text-3xl font-extrabold text-[#1e293b] tracking-tight">
                      {totalServicios}
                    </p>
                    <span className="inline-block text-[11px] font-bold text-[#1D71B5] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      Total histórico
                    </span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#1D71B5]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#1D71B5]/10 transition-colors" />
                </div>

                {/* Citas Agendadas */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(53,85,129,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(53,85,129,0.12)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-heading font-extrabold text-[#355581]/70 tracking-wider uppercase">
                      Citas Agendadas
                    </span>
                    <div className="p-3 rounded-2xl bg-[#0F172A] text-white shadow-md shadow-slate-900/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading text-3xl font-extrabold text-[#1e293b] tracking-tight">
                      {citas.filter((c) => c.estatus !== "Cancelada").length}
                    </p>
                    <span className="inline-block text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                      Activas
                    </span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-slate-400/20 transition-colors" />
                </div>

                {/* Tráfico en Vivo */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 rounded-[24px] p-6 border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(53,85,129,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(53,85,129,0.12)] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-heading font-extrabold text-emerald-800/70 tracking-wider uppercase">
                      Tráfico en Vivo
                    </span>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-heading text-3xl font-extrabold text-emerald-600 tracking-tight">
                        {onlineVisitors}
                      </p>
                      <span className="text-xs font-bold text-slate-500">en línea</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Tiempo real
                    </span>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                </div>
              </div>

              {/* MAPA DE JALISCO DE ALTA CALIDAD CON CALLES Y PINES */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#36A6DE]" />
                    <h2 className="font-heading font-extrabold text-lg text-[#355581]">
                      Mapa de Servicios en Jalisco
                    </h2>
                  </div>
                  <span className="text-xs font-bold bg-[#F4F7F9] px-3 py-1 rounded-full text-[#1D71B5] border border-slate-200">
                    {citas.length} pines registrados
                  </span>
                </div>

                {/* Componente del Mapa con Leaflet & Calles */}
                <JaliscoServiceMap
                  citas={citas}
                  clientes={clientes}
                  onSelectCitaForCalendar={(status) => {
                    setCalendarHighlightStatus(status);
                    setActiveSection("calendario");
                  }}
                />
              </div>
            </div>
          )}

          {/* SECCIÓN 2: CALENDARIO DE CITAS */}
          {activeSection === "calendario" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                  Calendario de citas
                </h1>
                {calendarHighlightStatus && (
                  <button
                    type="button"
                    onClick={() => setCalendarHighlightStatus(null)}
                    className="text-xs font-bold text-[#1D71B5] underline"
                  >
                    Mostrar todas las columnas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
                {ESTATUS_COLUMNS.map((colStatus) => {
                  const isHighlighted = calendarHighlightStatus === colStatus;
                  const colCitas = citas.filter((c) => c.estatus === colStatus);

                  return (
                    <div
                      key={colStatus}
                      className={`bg-slate-100 rounded-3xl p-3.5 border transition-all space-y-3 ${
                        isHighlighted ? "border-[#36A6DE] ring-2 ring-[#36A6DE]/30 bg-[#36A6DE]/5" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#355581]">
                          {colStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-[#355581] font-bold text-xs border border-slate-200">
                          {colCitas.length}
                        </span>
                      </div>

                      {colCitas.length === 0 ? (
                        <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400">
                          Sin citas
                        </div>
                      ) : (
                        colCitas.map((cita) => {
                          const cli = clientes.find((c) => c.id === cita.cliente_id);

                          return (
                            <div
                              key={cita.id}
                              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-extrabold text-xs text-[#1D71B5] bg-[#F4F7F9] px-2.5 py-1 rounded-lg">
                                  {cita.id}
                                </span>
                                {cli?.mascotas && (
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                    🐾 Pet
                                  </span>
                                )}
                              </div>

                              <div>
                                <p className="font-heading font-bold text-sm text-[#355581]">
                                  {cli?.nombre || "Cliente"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  📍 {cita.ruta_geografica}
                                </p>
                              </div>

                              <div className="bg-[#F4F7F9] rounded-xl p-2.5 text-xs space-y-1 text-[#355581]">
                                <p className="font-semibold">{cita.fecha} ({cita.turno})</p>
                                <div className="pt-1 border-t border-slate-200/80">
                                  {cita.items_contratados.map((it, idx) => (
                                    <p key={idx} className="truncate">
                                      • {it.cantidad}x {it.piezaNombre}
                                    </p>
                                  ))}
                                </div>
                              </div>

                              {/* Asignar Técnico */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">
                                  Técnico:
                                </label>
                                <select
                                  value={cita.tecnico_asignado}
                                  onChange={(e) =>
                                    handleUpdateCita(cita.id, {
                                      tecnico_asignado: e.target.value,
                                    })
                                  }
                                  className="w-full text-xs rounded-lg border border-slate-200 bg-[#F4F7F9] px-2 py-1.5 font-medium text-[#355581]"
                                >
                                  {TECNICOS_ZMG.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Monto Cotizado */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">
                                  Monto (MXN):
                                </label>
                                <input
                                  type="number"
                                  placeholder="Cotizar"
                                  defaultValue={cita.monto_total ?? ""}
                                  onBlur={(e) => {
                                    const val = e.target.value === "" ? null : Number(e.target.value);
                                    if (val !== cita.monto_total) {
                                      handleUpdateCita(cita.id, { monto_total: val });
                                    }
                                  }}
                                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold text-[#355581]"
                                />
                              </div>

                              {/* Cambiar Estatus */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">
                                  Estatus:
                                </label>
                                <select
                                  value={cita.estatus}
                                  onChange={(e) =>
                                    handleUpdateCita(cita.id, {
                                      estatus: e.target.value as EstatusCita,
                                    })
                                  }
                                  className="w-full text-xs rounded-lg border border-[#355581]/30 bg-white px-2 py-1.5 font-bold text-[#355581]"
                                >
                                  {ESTATUS_COLUMNS.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: CLIENTES */}
          {activeSection === "clientes" && (
            <div className="space-y-6">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                Clientes ({clientes.length})
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes.map((cli) => {
                  const cliCitas = citas.filter((c) => c.cliente_id === cli.id);

                  return (
                    <div
                      key={cli.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-full bg-[#355581] text-white font-heading font-bold text-base flex items-center justify-center">
                          {cli.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        {cli.mascotas && (
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                            🐾 Hogar Pet-Friendly
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-base text-[#355581]">
                          {cli.nombre}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          📍 {cli.direccion}, {cli.municipio}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          📱 {cli.whatsapp}
                        </p>
                      </div>

                      <div className="p-3 bg-[#F4F7F9] rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-slate-500">Histórico de gasto:</span>
                        <span className="font-heading font-bold text-[#355581]">
                          ${cli.historico_gasto.toLocaleString("es-MX")} MXN
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-3 space-y-1.5">
                        <span className="text-[10px] font-heading font-bold uppercase text-slate-400">
                          Servicios ({cliCitas.length}):
                        </span>
                        {cliCitas.map((c) => (
                          <div key={c.id} className="text-xs flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
                            <span className="font-bold text-[#1D71B5]">{c.id}</span>
                            <span className="text-slate-500">{c.fecha}</span>
                            <span className="text-[11px] font-semibold text-slate-700">{c.estatus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 4: WHATSAPP (ESTILO FOXDROP) */}
          {activeSection === "whatsapp" && (
            <div className="space-y-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                WhatsApp
              </h1>
              <WhatsAppFoxdrop
                clientes={clientes}
                citas={citas}
                mensajes={mensajes}
                onTriggerMessage={handleTriggerWhatsApp}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
