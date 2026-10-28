"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  Menu,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  KananDatabase,
  ServicioCita,
  Cliente,
  EstatusCita,
  TurnoServicio,
  MunicipioZMG,
  MarketingMetrics,
} from "@/types/crm";
import { JaliscoServiceMap } from "@/components/admin/JaliscoServiceMap";
import { WhatsAppFoxdrop } from "@/components/admin/WhatsAppFoxdrop";
import { ClientesTable } from "@/components/admin/ClientesTable";
import { CalendarCitasView } from "@/components/admin/CalendarCitasView";
import { MarketingAnalyticsView } from "@/components/admin/MarketingAnalyticsView";
import { ResumenDashboard } from "@/components/admin/ResumenDashboard";

export default function AdminPage() {
  const router = useRouter();

  // Estados de sesión y base de datos
  const [authChecking, setAuthChecking] = useState(true);
  const [db, setDb] = useState<KananDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // Navegación en el Menú Lateral
  const [activeSection, setActiveSection] = useState<
    "resumen" | "calendario" | "clientes" | "whatsapp" | "marketing" | "configuracion"
  >("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (res.ok) {
        const data = (await res.json()) as KananDatabase;
        setDb(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCrmData();
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

  // Crear cliente manual
  const handleCreateClienteManual = async (cliente: {
    nombre: string;
    whatsapp: string;
    direccion: string;
    municipio: MunicipioZMG;
    mascotas: boolean;
    notas_especiales?: string;
    email?: string;
    historico_gasto?: number;
  }) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_CLIENTE_MANUAL", cliente }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  // Actualizar cliente
  const handleUpdateCliente = async (clienteId: string, updates: Partial<Cliente>) => {
    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "UPDATE_CLIENTE", clienteId, ...updates }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  // Eliminar cliente
  const handleDeleteCliente = async (clienteId: string) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_CLIENTE", clienteId }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  // Crear cita manual
  const handleCreateCitaManual = async (citaData: any) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_CITA_MANUAL", cita: citaData }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  // Actualizar cita
  const handleUpdateCita = async (
    citaId: string,
    updates: {
      estatus?: EstatusCita;
      tecnico_asignado?: string;
      monto_total?: number | null;
      fecha?: string;
      turno?: TurnoServicio;
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

  // Cancelar cita por administrador
  const handleCancelCita = async (citaId: string, motivo?: string) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADMIN_CANCEL_CITA", citaId, motivo }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
    }
  };

  // Actualizar configuración de marketing
  const handleUpdateMarketing = async (updates: Partial<MarketingMetrics>) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_MARKETING", marketing: updates }),
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
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#355581] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const clientes = db?.clientes || [];
  const citas = db?.servicios_citas || [];
  const mensajes = db?.mensajes_automatizacion || [];
  const marketing: MarketingMetrics = db?.config?.marketing || {
    meta: {
      conectado: false,
      page_name: "",
      ig_account_name: "",
    },
    google_ads: {
      conectado: false,
      customer_id: "",
      account_name: "",
    },
    seo_sem: {
      conectado: false,
      search_console_property: "kananlimpieza.mx",
    },
  };

  // Cálculos Financieros
  const totalGanancias = clientes.reduce((acc, c) => acc + (c.historico_gasto || 0), 0);
  const totalServicios = citas.length;

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
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveSection("resumen");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "resumen"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeSection === "resumen" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("calendario");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "calendario"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeSection === "calendario" ? "text-white" : "text-[#36A6DE]"}`} />
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
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "clientes"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className={`w-4 h-4 ${activeSection === "clientes" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("whatsapp");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "whatsapp"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeSection === "whatsapp" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("marketing");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "marketing"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeSection === "marketing" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Métricas & Marketing</span>
            </button>

            {/* SECCIÓN CONFIGURACIÓN EN LA PARTE INFERIOR DEL MENÚ */}
            <button
              type="button"
              onClick={() => {
                setActiveSection("configuracion");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-bold text-xs transition-all duration-200 ${
                activeSection === "configuracion"
                  ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_8px_20px_rgba(29,113,181,0.4)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className={`w-4 h-4 ${activeSection === "configuracion" ? "text-white" : "text-[#36A6DE]"}`} />
              <span>Configuración</span>
            </button>
          </nav>
        </div>

        {/* Pie de Menú Lateral */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-heading font-bold text-white transition-all border border-white/10"
          >
            <span>Ver Sitio Web</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-heading font-bold text-rose-200 hover:text-white transition-all border border-rose-500/30"
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
          
          {/* SECCIÓN 1: RESUMEN */}
          {activeSection === "resumen" && (
            <ResumenDashboard
              clientes={clientes}
              citas={citas}
              onNavigateToCalendar={(status) => {
                setCalendarHighlightStatus(status || null);
                setActiveSection("calendario");
              }}
              onNavigateToWhatsApp={() => setActiveSection("whatsapp")}
            />
          )}

          {/* SECCIÓN 2: CALENDARIO DE CITAS */}
          {activeSection === "calendario" && (
            <div className="space-y-6">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                Calendario de citas
              </h1>
              <CalendarCitasView
                citas={citas}
                clientes={clientes}
                highlightStatus={calendarHighlightStatus}
                onClearHighlight={() => setCalendarHighlightStatus(null)}
                onUpdateCita={handleUpdateCita}
                onCancelCita={handleCancelCita}
                onCreateCitaManual={handleCreateCitaManual}
              />
            </div>
          )}

          {/* SECCIÓN 3: CLIENTES EN TABLA ESTRUCTURADA */}
          {activeSection === "clientes" && (
            <div className="space-y-6">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                Clientes ({clientes.length})
              </h1>
              <ClientesTable
                clientes={clientes}
                citas={citas}
                onUpdateCliente={handleUpdateCliente}
                onDeleteCliente={handleDeleteCliente}
                onCreateClienteManual={handleCreateClienteManual}
              />
            </div>
          )}

          {/* SECCIÓN 4: WHATSAPP */}
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

          {/* SECCIÓN 5: MÉTRICAS Y MARKETING DIGITAL */}
          {activeSection === "marketing" && (
            <div className="space-y-6">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                Métricas & Marketing
              </h1>
              <MarketingAnalyticsView
                metrics={marketing}
                onRefresh={fetchCrmData}
              />
            </div>
          )}

          {/* SECCIÓN 6: CONFIGURACIÓN (UBICADA AL FINAL) */}
          {activeSection === "configuracion" && (
            <div className="space-y-6">
              <h1 className="font-heading font-extrabold text-2xl text-[#355581]">
                Configuración
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ajustes de Campaña Temporal (Modo Halloween) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                      🎃
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-800">
                        Campaña de Temporada
                      </h3>
                      <p className="text-xs text-slate-400">
                        Efectos visuales en el sitio web público
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Modo Halloween & Papel Picado</p>
                      <p className="text-[11px] text-slate-500">Muestra los murciélagos y decoración temática</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={db?.config?.modo_halloween ?? true}
                      onClick={() => handleToggleHalloween(!(db?.config?.modo_halloween ?? true))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        (db?.config?.modo_halloween ?? true) ? "bg-orange-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          (db?.config?.modo_halloween ?? true) ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Políticas Operativas y Cancelaciones */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1D71B5] flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-800">
                        Políticas de Cancelación
                      </h3>
                      <p className="text-xs text-slate-400">
                        Reglas automáticas para clientes
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800">
                      Regla de cancelación de 2 Horas:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Los clientes pueden auto-cancelar sus servicios desde WhatsApp o enlace directo hasta 2 horas antes de la cita. Pasado ese tiempo, solo el administrador puede autorizar la cancelación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
