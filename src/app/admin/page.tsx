"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Menu,
  X,
  Shield,
  Sparkles,
  Plus,
  ExternalLink,
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
import { WhatsAppFoxdrop } from "@/components/admin/WhatsAppFoxdrop";
import { ClientesTable } from "@/components/admin/ClientesTable";
import { CalendarCitasView } from "@/components/admin/CalendarCitasView";
import { MarketingAnalyticsView } from "@/components/admin/MarketingAnalyticsView";
import { ResumenDashboard } from "@/components/admin/ResumenDashboard";

type AdminSection = "resumen" | "calendario" | "clientes" | "whatsapp" | "marketing" | "configuracion";

export default function AdminPage() {
  const router = useRouter();

  // Estados de sesión y base de datos
  const [authChecking, setAuthChecking] = useState(true);
  const [db, setDb] = useState<KananDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // Navegación en el Menú Lateral
  const [activeSection, setActiveSection] = useState<AdminSection>("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtro de calendario y trigger de nueva cita
  const [calendarHighlightStatus, setCalendarHighlightStatus] = useState<string | null>(null);
  const [triggerNewCitaModal, setTriggerNewCitaModal] = useState(false);

  // Comprobar autenticación segura
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!data.authenticated || data.mustChangePassword) {
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

  // Actualizar PIN de campo para la app del técnico
  const handleUpdatePinTecnico = async (nuevoPin: string) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SET_PIN_TECNICO", pin: nuevoPin }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      alert("✅ PIN del técnico actualizado a: " + nuevoPin);
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

  const clientes = useMemo(() => db?.clientes || [], [db]);
  const citas = useMemo(() => db?.servicios_citas || [], [db]);
  const mensajes = useMemo(() => db?.mensajes_automatizacion || [], [db]);
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

  const citasPendientes = useMemo(() => citas.filter((c) => c.estatus === "Por Confirmar"), [citas]);

  const navItems = [
    {
      id: "resumen" as AdminSection,
      label: "Resumen",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "calendario" as AdminSection,
      label: "Calendario de citas",
      icon: Calendar,
      badge: citasPendientes.length > 0 ? citasPendientes.length : null,
      badgeColor: "bg-[#36A6DE] text-white",
    },
    {
      id: "clientes" as AdminSection,
      label: "Clientes",
      icon: Users,
      badge: null,
    },
    {
      id: "whatsapp" as AdminSection,
      label: "WhatsApp",
      icon: MessageSquare,
      badge: null,
    },
    {
      id: "marketing" as AdminSection,
      label: "Métricas & Marketing",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "configuracion" as AdminSection,
      label: "Configuración",
      icon: Settings,
      badge: null,
    },
  ];

  const sectionTitles: Record<AdminSection, string> = {
    resumen: "Resumen",
    calendario: "Calendario de citas",
    clientes: "Clientes",
    whatsapp: "WhatsApp",
    marketing: "Métricas & Marketing",
    configuracion: "Configuración",
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#36A6DE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex antialiased text-slate-800">
      
      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          
          {/* Header con el Logo Original Kanan en Blanco (Sin recuadros artificiales) */}
          <div className="p-6 pb-5 border-b border-white/10 flex items-center justify-between relative">
            <div className="w-full flex justify-center items-center py-1">
              <img
                src="/assets/brand/kanan-logo-white.png"
                alt="Kanan"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Botón cerrar en móvil */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute right-4 top-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación Principal */}
          <nav className="p-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-medium text-xs transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_4px_16px_rgba(29,113,181,0.35)]"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-[#36A6DE]"
                    }`}
                  />
                  <span className="truncate flex-1 text-left font-bold">{item.label}</span>

                  {item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        item.badgeColor || "bg-slate-700 text-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer de Sidebar */}
          <div className="p-4 border-t border-slate-800/80 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-800"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver Sitio Web</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 text-xs font-bold transition-colors border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* BARRA SUPERIOR FIJA */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_1px_6px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="font-heading font-extrabold text-lg sm:text-xl text-[#355581] truncate">
              {sectionTitles[activeSection]}
            </h1>
          </div>

          {/* Botón Nueva Cita de Acción Rápida */}
          <button
            type="button"
            onClick={() => {
              setActiveSection("calendario");
              setTriggerNewCitaModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#175c94] hover:to-[#2c8fc0] text-white font-heading font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
        </header>

        {/* CONTENEDOR DE PÁGINA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
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
            <CalendarCitasView
              citas={citas}
              clientes={clientes}
              highlightStatus={calendarHighlightStatus}
              onClearHighlight={() => setCalendarHighlightStatus(null)}
              onUpdateCita={handleUpdateCita}
              onCancelCita={handleCancelCita}
              onCreateCitaManual={handleCreateCitaManual}
              autoOpenNewModal={triggerNewCitaModal}
              onResetAutoOpenNewModal={() => setTriggerNewCitaModal(false)}
            />
          )}

          {/* SECCIÓN 3: CLIENTES */}
          {activeSection === "clientes" && (
            <ClientesTable
              clientes={clientes}
              citas={citas}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
              onCreateClienteManual={handleCreateClienteManual}
            />
          )}

          {/* SECCIÓN 4: WHATSAPP */}
          {activeSection === "whatsapp" && (
            <WhatsAppFoxdrop
              clientes={clientes}
              citas={citas}
              mensajes={mensajes}
              onTriggerMessage={handleTriggerWhatsApp}
            />
          )}

          {/* SECCIÓN 5: MÉTRICAS Y MARKETING DIGITAL */}
          {activeSection === "marketing" && (
            <MarketingAnalyticsView
              metrics={marketing}
              onRefresh={fetchCrmData}
            />
          )}

          {/* SECCIÓN 6: CONFIGURACIÓN */}
          {activeSection === "configuracion" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Ajustes de Campaña Temporal (Modo Halloween) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                      🎃
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-800">
                        Campaña de Temporada
                      </h3>
                      <p className="text-xs text-slate-400">
                        Efectos temáticos en el sitio web público
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
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
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5">
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

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800">
                      Regla de cancelación de 2 Horas:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Los clientes pueden auto-cancelar sus servicios desde WhatsApp o enlace directo hasta 2 horas antes de la cita. Pasado ese tiempo, solo el administrador puede autorizar la cancelación.
                    </p>
                  </div>
                </div>

                {/* Administración del PIN y App Móvil del Técnico */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-5 md:col-span-2">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1D71B5] flex items-center justify-center text-lg">
                        🚐
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-slate-800">
                          App Móvil del Técnico de Campo
                        </h3>
                        <p className="text-xs text-slate-400">
                          Control de acceso seguro para la unidad en ruta (/tecnico)
                        </p>
                      </div>
                    </div>

                    <a
                      href="/tecnico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#1D71B5] font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Abrir App Técnico</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800">PIN Numérico de Acceso en Campo</p>
                        <p className="text-[11px] text-slate-500">
                          Código de 4 a 6 dígitos que el técnico teclea en su celular para ver su ruta y tomar firmas.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          defaultValue={db?.config?.pin_tecnico || "2026"}
                          id="inputPinTecnico"
                          className="w-28 px-3 py-2 text-center font-mono font-extrabold text-sm bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D71B5]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (document.getElementById("inputPinTecnico") as HTMLInputElement)?.value;
                            if (val) handleUpdatePinTecnico(val);
                          }}
                          className="px-4 py-2 bg-[#1D71B5] hover:bg-[#175c94] text-white text-xs font-bold rounded-xl shadow-sm transition"
                        >
                          Guardar PIN
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>URL para el celular del técnico: <strong className="text-slate-700">admin.kananlimpieza.mx/tecnico</strong> (o kananlimpieza.mx/tecnico)</span>
                    </div>
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
