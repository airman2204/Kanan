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
  ChevronLeft,
  ChevronRight,
  Columns3,
  Bell,
  BellOff,
  Volume2,
} from "lucide-react";
import { soundEngine } from "@/lib/audio/soundEffects";
import { AdminToastContainer, AdminToast } from "@/components/admin/AdminToastContainer";
import {
  KananDatabase,
  ServicioCita,
  Cliente,
  EstatusCita,
  TurnoServicio,
  MunicipioZMG,
  MarketingMetrics,
} from "@/types/crm";
import { ChatInbox } from "@/components/admin/ChatInbox";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { ClientesTable } from "@/components/admin/ClientesTable";
import { CalendarCitasView } from "@/components/admin/CalendarCitasView";
import { MarketingAnalyticsView } from "@/components/admin/MarketingAnalyticsView";
import { ResumenDashboard } from "@/components/admin/ResumenDashboard";

type AdminSection = "resumen" | "kanban" | "calendario" | "clientes" | "chat" | "marketing" | "configuracion";

export default function AdminPage() {
  const router = useRouter();

  // Estados de sesión y base de datos
  const [authChecking, setAuthChecking] = useState(true);
  const [db, setDb] = useState<KananDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // Navegación en el Menú Lateral con persistencia ante refrescos F5
  const [activeSection, setActiveSectionState] = useState<AdminSection>("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restaurar sección activa desde la URL (?tab=chat) o localStorage al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlTab = (params.get("tab") || params.get("seccion")) as AdminSection | null;
    const validSections: AdminSection[] = [
      "resumen",
      "kanban",
      "calendario",
      "clientes",
      "chat",
      "marketing",
      "configuracion",
    ];

    if (urlTab && validSections.includes(urlTab)) {
      setActiveSectionState(urlTab);
      localStorage.setItem("kanan_admin_section", urlTab);
    } else {
      const saved = localStorage.getItem("kanan_admin_section") as AdminSection | null;
      if (saved && validSections.includes(saved)) {
        setActiveSectionState(saved);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", saved);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const setActiveSection = (section: AdminSection) => {
    setActiveSectionState(section);
    if (typeof window !== "undefined") {
      localStorage.setItem("kanan_admin_section", section);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", section);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Filtro de calendario y trigger de nueva cita
  const [calendarHighlightStatus, setCalendarHighlightStatus] = useState<string | null>(null);
  const [triggerNewCitaModal, setTriggerNewCitaModal] = useState(false);

  // Estados del sistema de Notificaciones Nativas y Sonidos
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [soundMuted, setSoundMuted] = useState(false);
  const [permisoNotificaciones, setPermisoNotificaciones] = useState<NotificationPermission>("default");

  // Referencias para detectar cambios en tiempo real
  const lastCitasCountRef = React.useRef<number | null>(null);
  const lastMensajesCountRef = React.useRef<number | null>(null);
  const lastCitasHashRef = React.useRef<Record<string, EstatusCita>>({});

  // Registrar Service Worker y cargar estado de sonido
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundMuted(soundEngine.isMuted());
      if ("Notification" in window) {
        setPermisoNotificaciones(Notification.permission);
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = useCallback((toast: Omit<AdminToast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [
      { ...toast, id },
      ...prev.slice(0, 3), // Mantener máximo 4 en pantalla
    ]);

    // Enviar notificación al sistema operativo si la pestaña está en segundo plano / pantalla apagada
    if (typeof document !== "undefined" && document.hidden && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        title: toast.titulo,
        options: {
          body: `${toast.clienteNombre ? toast.clienteNombre + ": " : ""}${toast.descripcion}`,
          tag: toast.tipo,
          data: { url: "/admin" },
        },
      });
    }

    // Auto-cerrar después de 7 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }, []);

  const toggleSound = () => {
    const nuevo = !soundMuted;
    setSoundMuted(nuevo);
    soundEngine.setMuted(nuevo);
    if (!nuevo) {
      soundEngine.playIncomingChatSound();
    }
  };

  const solicitarPermisoNotificaciones = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permiso = await Notification.requestPermission();
      setPermisoNotificaciones(permiso);
      if (permiso === "granted") {
        soundEngine.playConfirmationSound();
        addToast({
          tipo: "cita_confirmada",
          titulo: "¡Notificaciones activadas!",
          descripcion: "Recibirás avisos sonoros y alertas incluso con la pantalla bloqueada en tu tableta.",
        });
      }
    }
  };

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
    try {
      const res = await fetch("/api/crm");
      if (res.ok) {
        const data = (await res.json()) as KananDatabase;
        
        // DETECCIÓN DE EVENTOS PARA SONIDOS Y TOASTS EN VIVO
        if (lastCitasCountRef.current !== null && data.servicios_citas) {
          // 1. Detectar si hay una nueva cita agendada
          if (data.servicios_citas.length > lastCitasCountRef.current) {
            const nueva = data.servicios_citas[0];
            const cli = data.clientes.find((c) => c.id === nueva.cliente_id);
            soundEngine.playNewBookingSound();
            addToast({
              tipo: "cita_nueva",
              titulo: "¡Nueva Solicitud de Cita!",
              descripcion: `Servicio agendado para ${nueva.fecha} (${nueva.turno}). Piezas: ${nueva.items_contratados.length}`,
              clienteNombre: cli?.nombre || "Nuevo Cliente",
              folio: nueva.id,
              actionLabel: "Revisar en Calendario",
              onAction: () => setActiveSection("calendario"),
            });
          }

          // 2. Detectar cambios de estatus en citas existentes (Confirmada o Cancelada)
          data.servicios_citas.forEach((c) => {
            const estatusPrevio = lastCitasHashRef.current[c.id];
            if (estatusPrevio && estatusPrevio !== c.estatus) {
              const cli = data.clientes.find((cl) => cl.id === c.cliente_id);
              if (c.estatus === "Confirmada") {
                soundEngine.playConfirmationSound();
                addToast({
                  tipo: "cita_confirmada",
                  titulo: "Cita Confirmada",
                  descripcion: `El cliente confirmó la cotización de su servicio.`,
                  clienteNombre: cli?.nombre,
                  folio: c.id,
                  actionLabel: "Ver Ficha",
                  onAction: () => setActiveSection("calendario"),
                });
              } else if (c.estatus === "Cancelada") {
                soundEngine.playCancellationSound();
                addToast({
                  tipo: "cita_cancelada",
                  titulo: "Cita Cancelada",
                  descripcion: c.cancel_reason || `El servicio ha sido cancelado.`,
                  clienteNombre: cli?.nombre,
                  folio: c.id,
                  actionLabel: "Ver Historial",
                  onAction: () => setActiveSection("calendario"),
                });
              }
            }
          });
        }

        // 3. Detectar mensajes de chat entrantes
        if (lastMensajesCountRef.current !== null && data.mensajes_automatizacion) {
          if (data.mensajes_automatizacion.length > lastMensajesCountRef.current) {
            // Obtener todos los mensajes nuevos que entraron en este ciclo
            const nuevosMensajes = data.mensajes_automatizacion.slice(
              0,
              data.mensajes_automatizacion.length - lastMensajesCountRef.current
            );
            const msgCliente = nuevosMensajes.find(
              (m) =>
                m.contenido_mensaje.startsWith("[Cliente]:") ||
                m.etapa_titulo === "Mensaje Recibido Cliente"
            );
            if (msgCliente) {
              const cli = data.clientes.find((c) => c.id === msgCliente.cliente_id);
              const textoLimpio = msgCliente.contenido_mensaje.replace("[Cliente]:", "").trim();
              soundEngine.playIncomingChatSound();
              addToast({
                tipo: "mensaje_chat",
                titulo: "Nuevo Mensaje en Chat",
                descripcion: textoLimpio,
                clienteNombre: cli?.nombre || "Cliente WhatsApp",
                actionLabel: "Responder en Chat",
                onAction: () => setActiveSection("chat"),
              });
            }
          }
        }

        // Actualizar referencias históricas
        lastCitasCountRef.current = data.servicios_citas.length;
        lastMensajesCountRef.current = data.mensajes_automatizacion.length;
        const hash: Record<string, EstatusCita> = {};
        data.servicios_citas.forEach((c) => {
          hash[c.id] = c.estatus;
        });
        lastCitasHashRef.current = hash;

        setDb(data);
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    checkAuth();
    fetchCrmData();

    // Sincronización en vivo cada 6 segundos para detectar citas nuevas, sonar campana y actualizar sin recargar F5
    const interval = setInterval(() => {
      fetchCrmData();
    }, 6000);

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

  // Eliminar cita permanentemente del sistema
  const handleDeleteCita = async (citaId: string) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_CITA", citaId }),
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
      id: "kanban" as AdminSection,
      label: "Tablero Kanban",
      icon: Columns3,
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
      id: "chat" as AdminSection,
      label: "Chat",
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
    kanban: "Tablero Kanban en Vivo",
    calendario: "Calendario de citas",
    clientes: "Clientes",
    chat: "Bandeja de Chat",
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
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[#0F172A] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-20" : "md:w-64"} w-64`}
      >
        {/* Pestaña flotante para colapsar / desplegar sidebar (estilo tab en el borde derecho) */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-28 z-50 w-7 h-7 bg-[#1D71B5] hover:bg-[#36A6DE] text-white rounded-full items-center justify-center shadow-lg border-2 border-[#0F172A] transition-all hover:scale-110 active:scale-95"
          title={sidebarCollapsed ? "Desplegar menú" : "Colapsar menú"}
          aria-label={sidebarCollapsed ? "Desplegar menú" : "Colapsar menú"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          
          {/* Header con el Logo Original Kanan en Blanco */}
          <div className="p-6 pb-5 border-b border-white/10 flex items-center justify-between relative">
            <div className={`w-full flex justify-center items-center py-2 ${sidebarCollapsed ? "px-0" : "px-3"}`}>
              <img
                src="/assets/brand/kanan-logo-white.png"
                alt="Kanan"
                className={`w-auto object-contain transition-all duration-200 ${
                  sidebarCollapsed ? "h-10 max-w-[48px]" : "h-16 sm:h-20 max-w-[200px]"
                }`}
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
          <nav className="p-3 space-y-1.5 flex-1">
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
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-heading font-medium text-xs transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white shadow-[0_4px_16px_rgba(29,113,181,0.35)]"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-[#36A6DE]"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1 text-left font-bold">{item.label}</span>
                  )}

                  {!sidebarCollapsed && item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        item.badgeColor || "bg-slate-700 text-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip en modo colapsado */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl border border-slate-700/80 z-50">
                      {item.label}
                      {item.badge !== null && ` (${item.badge})`}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer de Sidebar */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <Link
              href="/"
              target="_blank"
              title="Ver Sitio Web"
              className={`flex items-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-800 ${
                sidebarCollapsed ? "justify-center" : "justify-center"
              }`}
            >
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              {!sidebarCollapsed && <span>Ver Sitio Web</span>}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className={`flex items-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 text-xs font-bold transition-colors border border-rose-500/20 ${
                sidebarCollapsed ? "justify-center" : "justify-center"
              }`}
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
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

          <div className="flex items-center gap-2">
            {/* Control de Sonidos y Alertas de Tableta */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-xl transition flex items-center gap-1.5 text-xs font-heading font-bold ${
                  soundMuted
                    ? "bg-slate-200 text-slate-500"
                    : "bg-white text-[#1D71B5] shadow-xs"
                }`}
                title={soundMuted ? "Sonidos silenciados" : "Sonidos activos"}
              >
                {soundMuted ? <BellOff className="w-4 h-4 text-slate-400" /> : <Bell className="w-4 h-4 text-[#1D71B5]" />}
                <span className="hidden sm:inline">{soundMuted ? "Silencio" : "Sonido"}</span>
              </button>

              {permisoNotificaciones !== "granted" && (
                <button
                  type="button"
                  onClick={solicitarPermisoNotificaciones}
                  className="px-2 py-1 rounded-xl text-[11px] font-heading font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center gap-1"
                  title="Activar alertas en segundo plano para tableta"
                >
                  <span>🔔 Activar Alertas 2do Plano</span>
                </button>
              )}
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
          </div>
        </header>

        {/* CONTENEDOR DE ALERTAS TOAST FLOTANTES INTEGRADO (SIN CUADROS NATIVOS) */}
        <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

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
              onNavigateToWhatsApp={() => setActiveSection("chat")}
            />
          )}

          {/* SECCIÓN 2: TABLERO KANBAN EN VIVO */}
          {activeSection === "kanban" && (
            <KanbanBoard
              citas={citas}
              clientes={clientes}
              onUpdateStatus={async (citaId, nuevoEstatus) => {
                await handleUpdateCita(citaId, { estatus: nuevoEstatus });
              }}
              onRefresh={fetchCrmData}
            />
          )}

          {/* SECCIÓN 3: CALENDARIO DE CITAS */}
          {activeSection === "calendario" && (
            <CalendarCitasView
              citas={citas}
              clientes={clientes}
              highlightStatus={calendarHighlightStatus}
              onClearHighlight={() => setCalendarHighlightStatus(null)}
              onUpdateCita={handleUpdateCita}
              onCancelCita={handleCancelCita}
              onDeleteCita={handleDeleteCita}
              onNavigateToChat={(clienteId) => {
                setActiveSection("chat");
              }}
              onCreateCitaManual={handleCreateCitaManual}
              autoOpenNewModal={triggerNewCitaModal}
              onResetAutoOpenNewModal={() => setTriggerNewCitaModal(false)}
            />
          )}

          {/* SECCIÓN 4: CLIENTES */}
          {activeSection === "clientes" && (
            <ClientesTable
              clientes={clientes}
              citas={citas}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
              onCreateClienteManual={handleCreateClienteManual}
            />
          )}

          {/* SECCIÓN 5: CHAT OFICIAL KANAN */}
          {activeSection === "chat" && (
            <ChatInbox
              clientes={clientes}
              citas={citas}
              mensajes={mensajes}
              onTriggerMessage={handleTriggerWhatsApp}
              onRefresh={fetchCrmData}
              onConfirmCita={async (citaId) => {
                await handleUpdateCita(citaId, { estatus: "Confirmada" });
              }}
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
