"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Check,
  CheckCheck,
  QrCode,
  RefreshCw,
  Search,
  Bot,
  UserCheck,
  Workflow,
  MessagesSquare,
  Smile,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  Zap,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Plus
} from "lucide-react";
import { Cliente, ServicioCita, MensajeAutomatizacion, EstatusCita } from "@/types/crm";
import { AgentFlowCanvas } from "./agent-flow/AgentFlowCanvas";
import { STICKERS_DISPONIBLES } from "@/types/agentFlow";
import { RESPUESTAS_RAPIDAS, RespuestaRapida } from "@/data/respuestasRapidas";
import { supabase } from "@/lib/supabase";
import { soundEngine } from "@/lib/audio/soundEffects";

interface ChatInboxProps {
  clientes: Cliente[];
  citas: ServicioCita[];
  mensajes: MensajeAutomatizacion[];
  onTriggerMessage: (mensajeId: string) => void;
  onRefresh?: () => void;
  onConfirmCita?: (citaId: string) => Promise<void>;
}

// Emoticones frecuentes para la mensajería
const EMOJIS_FRECUENTES = [
  "👋", "🐾", "🛋️", "✨", "🧼", "📅", "📍", "🚗", "💰", "💵", "⭐", "🎉", 
  "👍", "🙏", "💙", "⏱️", "📋", "💧", "🐶", "🐱", "✅", "⚠️", "😊", "🙌"
];

export function ChatInbox({
  clientes,
  citas,
  mensajes: initialMensajes,
  onTriggerMessage,
  onRefresh,
  onConfirmCita,
}: ChatInboxProps) {
  const [contactosLocales, setContactosLocales] = useState<Cliente[]>(clientes);
  const [mensajesLocales, setMensajesLocales] = useState<MensajeAutomatizacion[]>(initialMensajes);
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || "");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversaciones" | "agente_flow">("conversaciones");
  const [inputMessage, setInputMessage] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modoIaActivo, setModoIaActivo] = useState(true);
  const [actualizandoIa, setActualizandoIa] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState<"emojis" | "stickers" | "respuestas_rapidas" | null>(null);
  const [mostrarPanelCita, setMostrarPanelCita] = useState(false);
  const [editandoMonto, setEditandoMonto] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar clientes y mensajes cuando cambie la prop
  useEffect(() => {
    setContactosLocales(clientes);
    if (!selectedClienteId && clientes.length > 0) {
      setSelectedClienteId(clientes[0].id);
    }
  }, [clientes, selectedClienteId]);

  useEffect(() => {
    setMensajesLocales(initialMensajes);
  }, [initialMensajes]);

  // SUSCRIPCIÓN EN TIEMPO REAL ULTRA RÁPIDA (Canal exclusivo y limpio de Chat)
  useEffect(() => {
    const channel = supabase
      .channel("kanan_chat_inbox_channel", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "nuevo_mensaje" }, (payload: any) => {
        const nuevoMsg = payload.payload?.mensaje as MensajeAutomatizacion;
        if (!nuevoMsg) return;

        setMensajesLocales((prev) => {
          if (prev.some((m) => m.id === nuevoMsg.id)) return prev;
          return [...prev, nuevoMsg];
        });

        if (onRefresh) onRefresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefresh]);

  // Consultar estado de IA del cliente seleccionado
  useEffect(() => {
    if (!selectedClienteId) return;
    const fetchIaStatus = async () => {
      try {
        const res = await fetch(`/api/chat/ia-control?clienteId=${selectedClienteId}`);
        const data = await res.json();
        if (data.ok && typeof data.modoIa === "boolean") {
          setModoIaActivo(data.modoIa);
        }
      } catch (e) {
        console.warn("Error cargando estado de IA:", e);
      }
    };
    fetchIaStatus();
  }, [selectedClienteId]);

  // Cambiar modo de IA para el cliente activo
  const handleToggleModoIa = async () => {
    if (!activeCliente || actualizandoIa) return;
    const nuevoEstado = !modoIaActivo;
    setModoIaActivo(nuevoEstado);
    setActualizandoIa(true);
    try {
      await fetch("/api/chat/ia-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: activeCliente.id,
          modoIa: nuevoEstado,
        }),
      });
    } catch (e) {
      console.warn("Error guardando switch IA:", e);
    } finally {
      setActualizandoIa(false);
    }
  };
  const [bridgeStatus, setBridgeStatus] = useState<"connected" | "qr_ready" | "connecting" | "disconnected">("connecting");
  const [bridgeQr, setBridgeQr] = useState<string | null>(null);
  const [mostrarModalQr, setMostrarModalQr] = useState(false);
  const [cargandoStatus, setCargandoStatus] = useState(false);

  // Consultar estado del bridge
  const consultarStatus = async () => {
    setCargandoStatus(true);
    try {
      const res = await fetch("/api/chat/status");
      const data = await res.json();
      if (data.ok && data.status) {
        setBridgeStatus(data.status);
        setBridgeQr(data.qr || null);
      } else {
        setBridgeStatus("disconnected");
      }
    } catch {
      setBridgeStatus("disconnected");
    } finally {
      setCargandoStatus(false);
    }
  };

  useEffect(() => {
    consultarStatus();
    // Consultar cada 10 segundos para feedback en tiempo real
    const interval = setInterval(() => {
      consultarStatus();
      if (onRefresh) onRefresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  // Deduplicar contactos para la lista de chats: agrupar clientes por número a 10 dígitos o por ID si es contacto LID
  const contactosDeduplicados = React.useMemo(() => {
    const map = new Map<string, Cliente>();
    for (const c of contactosLocales) {
      // Ignorar contactos corruptos o residuales vacíos sin mensajes
      if (c.nombre === "Kanan Servicios Limpieza" && (!c.whatsapp || c.whatsapp.startsWith("wa-"))) {
        continue;
      }
      const raw = c.whatsapp ? c.whatsapp.replace(/\D/g, "") : "";
      // Agrupar tanto por número a 10 dígitos como por nombre exacto normalizado
      const cleanNombre = c.nombre ? c.nombre.trim().toLowerCase() : "";
      const key = raw.length >= 10 
        ? raw.slice(-10) 
        : (cleanNombre.startsWith("mario alberto") || cleanNombre === "mario" ? "mario_alberto_group" : (c.whatsapp || c.id));
      if (!map.has(key)) {
        map.set(key, c);
      } else {
        const existing = map.get(key)!;
        if (c.nombre && c.nombre.length > existing.nombre.length) {
          map.set(key, { ...existing, nombre: c.nombre, direccion: c.direccion || existing.direccion });
        }
      }
    }
    return Array.from(map.values());
  }, [contactosLocales]);

  const clientesFiltrados = contactosDeduplicados.filter((c) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.whatsapp.includes(q) ||
      c.municipio.toLowerCase().includes(q)
    );
  });

  const activeCliente = contactosDeduplicados.find((c) => c.id === selectedClienteId) || contactosDeduplicados[0];

  // IDs de todos los clientes vinculados a este contacto (por teléfono a 10 dígitos o por su propio ID)
  const activeCliente10Digits = activeCliente?.whatsapp ? activeCliente.whatsapp.replace(/\D/g, "").slice(-10) : "";
  const linkedClienteIds = React.useMemo(() => {
    if (!activeCliente) return [];
    if (!activeCliente10Digits || activeCliente10Digits.length < 10) {
      return [activeCliente.id];
    }
    return contactosLocales
      .filter((c) => c.whatsapp && c.whatsapp.replace(/\D/g, "").slice(-10) === activeCliente10Digits)
      .map((c) => c.id);
  }, [contactosLocales, activeCliente10Digits, activeCliente]);

  const activeCitas = citas.filter((c) => linkedClienteIds.includes(c.cliente_id));

  // ORDEN CRONOLÓGICO NATURAL (WhatsApp Style):
  const activeMensajes = mensajesLocales
    .filter((m) => linkedClienteIds.includes(m.cliente_id) || (activeCliente && m.destinatario_whatsapp === activeCliente.whatsapp))
    .sort((a, b) => new Date(a.fecha_programada || (a as any).created_at || Date.now()).getTime() - new Date(b.fecha_programada || (b as any).created_at || Date.now()).getTime());

  // Auto-scroll al fondo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMensajes.length, selectedClienteId]);

  // Insertar emoji en el texto
  const handleInsertEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent, stickerUrlCustom?: string) => {
    if (e) e.preventDefault();
    const textToSend = inputMessage.trim();
    if ((!textToSend && !stickerUrlCustom) || !activeCliente || enviando) return;

    const contenidoGuardar = stickerUrlCustom ? `[Sticker]: ${stickerUrlCustom}` : textToSend;

    // Actualización optimista instantánea en la interfaz
    const msgOptimista: MensajeAutomatizacion = {
      id: `chat-opt-${Date.now()}`,
      cita_id: "manual",
      cliente_id: activeCliente.id,
      etapa: "1_confirmacion_inmediata",
      etapa_titulo: "Chat Manual Admin",
      destinatario_whatsapp: activeCliente.whatsapp,
      contenido_mensaje: contenidoGuardar,
      estatus_envio: "Enviado",
      fecha_programada: new Date().toISOString(),
    };

    setMensajesLocales((prev) => [...prev, msgOptimista]);
    setInputMessage("");
    setEnviando(true);
    setMostrarPicker(null);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: activeCliente.whatsapp,
          message: textToSend,
          stickerUrl: stickerUrlCustom,
          cliente_id: activeCliente.id,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setModoIaActivo(false);
        if (onRefresh) onRefresh();
      } else {
        const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
        window.open(
          `https://wa.me/${fullPhone}?text=${encodeURIComponent(textToSend)}`,
          "_blank"
        );
      }
    } catch {
      const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
      window.open(
        `https://wa.me/${fullPhone}?text=${encodeURIComponent(textToSend)}`,
        "_blank"
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleSendSticker = (stickerPath: string) => {
    handleSendMessage(undefined, stickerPath);
  };

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {/* Barra de Control Compacta y Limpia */}
      <div className="bg-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("conversaciones")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "conversaciones"
                ? "bg-[#1D71B5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agente_flow")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "agente_flow"
                ? "bg-[#1D71B5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Flujos del Agente</span>
          </button>
        </div>

        {/* Acciones y Conexión en una sola línea */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* Indicador de estado */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bridgeStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : bridgeStatus === "qr_ready"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-300"
              }`}
            />
            <span>
              {bridgeStatus === "connected"
                ? "Conectado"
                : bridgeStatus === "qr_ready"
                ? "Escanear QR"
                : "Desconectado"}
            </span>
            <button
              type="button"
              onClick={consultarStatus}
              disabled={cargandoStatus}
              className="p-1 hover:text-slate-900 text-slate-400"
              title="Refrescar"
            >
              <RefreshCw className={`w-3 h-3 ${cargandoStatus ? "animate-spin" : ""}`} />
            </button>
          </div>

          {bridgeStatus !== "connected" && (
            <button
              type="button"
              onClick={() => setMostrarModalQr(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1D71B5] font-bold text-xs hover:bg-blue-100 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Vincular</span>
            </button>
          )}

          {/* Switch IA vs Humano */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setModoIaActivo(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                modoIaActivo ? "bg-[#1D71B5] text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>IA</span>
            </button>
            <button
              type="button"
              onClick={() => setModoIaActivo(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                !modoIaActivo ? "bg-amber-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Código QR */}
      {mostrarModalQr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base text-slate-800">
                Vincular WhatsApp Kanan
              </h3>
              <p className="text-xs text-slate-500">
                Abre WhatsApp en tu teléfono &gt; Dispositivos vinculados y escanea el código.
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
              {bridgeQr ? (
                <img src={bridgeQr} alt="QR Code" className="w-52 h-52 rounded-xl shadow-md border border-slate-200 bg-white p-1" />
              ) : bridgeStatus === "connected" ? (
                <div className="space-y-1 text-center">
                  <span className="text-3xl block">✅</span>
                  <p className="text-xs font-bold text-emerald-700">¡Conectado!</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 animate-pulse">Generando código...</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={consultarStatus}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => setMostrarModalQr(false)}
                className="flex-1 py-2 rounded-xl bg-[#1D71B5] hover:bg-[#175c94] text-xs font-bold text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Flujos o Vista de Conversaciones */}
      {activeTab === "agente_flow" ? (
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl h-[720px] bg-slate-950">
          <AgentFlowCanvas />
        </div>
      ) : (
        /* Bandeja de Chat con Estilo Moderno Limpio (Sin fondo amarillento) y Responsivo Móvil */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-[640px] sm:h-[680px] flex flex-col md:flex-row relative">
          
          {/* Columna Izquierda: Lista de Contactos (Oculta en móvil si hay chat abierto) */}
          <div className={`w-full md:w-80 lg:w-88 border-r border-slate-200 flex flex-col bg-slate-50/70 h-full ${
            mobileChatOpen ? "hidden md:flex" : "flex"
          }`}>
            {/* Buscador */}
            <div className="p-3 border-b border-slate-200/80 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar chat..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D71B5]"
                />
              </div>
            </div>

            {/* Lista de Chats */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {clientesFiltrados.map((cli) => {
                const isSelected = cli.id === activeCliente?.id;
                const cliCitas = citas.filter((c) => c.cliente_id === cli.id);
                const ultimaCita = cliCitas[0];
                const ultimosMensajes = mensajesLocales.filter((m) => m.cliente_id === cli.id);
                const ultimoMsg = ultimosMensajes[ultimosMensajes.length - 1];

                return (
                  <button
                    key={cli.id}
                    type="button"
                    onClick={() => {
                      setSelectedClienteId(cli.id);
                      setMobileChatOpen(true);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors min-h-[58px] ${
                      isSelected 
                        ? "bg-white shadow-2xs border-l-3 border-[#1D71B5]" 
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1D71B5]/10 text-[#1D71B5] flex items-center justify-center shrink-0 font-bold text-xs">
                      {cli.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {cli.nombre}
                        </p>
                        {ultimoMsg && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(ultimoMsg.fecha_programada).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {ultimoMsg ? ultimoMsg.contenido_mensaje.replace("[Cliente]:", "") : cli.whatsapp}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Conversación (Ocupa pantalla completa en móvil cuando se selecciona chat) */}
          <div className={`flex-1 flex-col bg-white h-full ${
            mobileChatOpen ? "flex" : "hidden md:flex"
          }`}>
            {activeCliente ? (
              <>
                {/* Cabecera del Chat Activo con Botón Volver en móvil */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setMobileChatOpen(false)}
                      className="md:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                      title="Volver a la lista de contactos"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-[#1D71B5] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      {activeCliente.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <span>{activeCliente.nombre}</span>
                        {(!activeCliente.whatsapp || activeCliente.whatsapp.startsWith("wa-") || activeCliente.whatsapp.length > 13) && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            WhatsApp LID
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {activeCliente.whatsapp.startsWith("wa-") ? "Contacto WhatsApp" : activeCliente.whatsapp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Switch de Modo IA vs Modo Manual Operador */}
                    <button
                      type="button"
                      onClick={handleToggleModoIa}
                      disabled={actualizandoIa}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs border ${
                        modoIaActivo
                          ? "bg-blue-50 text-[#1D71B5] border-blue-200 hover:bg-blue-100"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                      title={modoIaActivo ? "La IA responde automáticamente. Clic para pasar a Modo Manual." : "Modo Manual activo (IA pausada). Clic para reactivar IA."}
                    >
                      {modoIaActivo ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-[#1D71B5] animate-pulse" />
                          <span className="hidden sm:inline">IA Activa</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden sm:inline">Manual</span>
                        </>
                      )}
                    </button>

                    {/* Botón rápido para ver/gestionar la cita activa */}
                    <button
                      type="button"
                      onClick={() => setMostrarPanelCita(!mostrarPanelCita)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition border ${
                        mostrarPanelCita
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                      title="Ver o editar cita del cliente"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cita</span>
                    </button>

                    {/* Botón rápido para confirmar si está pendiente */}
                    {(() => {
                      const citaPorConfirmar = activeCitas.find((c) => c.estatus === "Por Confirmar");
                      if (citaPorConfirmar && onConfirmCita) {
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              await onConfirmCita(citaPorConfirmar.id);
                              if (onRefresh) onRefresh();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Cita</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Hilo de Mensajes: Fondo Limpio Gris Claro Suave */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-[#f8fafc]">
                  {activeMensajes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1">
                      <p className="text-xs font-semibold text-slate-600">No hay mensajes previos.</p>
                      <p className="text-[11px]">Escribe abajo para comunicarte con el cliente.</p>
                    </div>
                  ) : (
                    activeMensajes.map((m) => {
                      const isClient = m.contenido_mensaje.startsWith("[Cliente]:");
                      const rawContent = isClient
                        ? m.contenido_mensaje.replace("[Cliente]:", "").trim()
                        : m.contenido_mensaje.trim();

                      // Detección de sticker
                      const isSticker = rawContent.startsWith("[Sticker]:") || rawContent.startsWith("/assets/stickers/");
                      const stickerSrc = isSticker
                        ? rawContent.replace("[Sticker]:", "").trim()
                        : null;

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}
                        >
                          {isSticker && stickerSrc ? (
                            <div className="p-1 rounded-2xl max-w-[200px] flex flex-col items-end">
                              <img
                                src={stickerSrc}
                                alt="Sticker Kanan"
                                className="w-36 h-36 object-contain drop-shadow-md hover:scale-105 transition-transform"
                              />
                              <span className="text-[9px] text-slate-400 mt-1">
                                {new Date(m.fecha_programada).toLocaleTimeString("es-MX", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs space-y-1 shadow-2xs leading-relaxed ${
                                isClient
                                  ? "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80"
                                  : "bg-[#1D71B5] text-white rounded-tr-xs"
                              }`}
                            >
                              <p className="whitespace-pre-line font-sans">{rawContent}</p>
                              <div className={`flex items-center justify-end gap-1 text-[9px] ${
                                isClient ? "text-slate-400" : "text-blue-100"
                              }`}>
                                <span>
                                  {new Date(m.fecha_programada).toLocaleTimeString("es-MX", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {!isClient && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Popover de Respuestas Rápidas (Plantillas de 1 Clic) */}
                {mostrarPicker === "respuestas_rapidas" && (
                  <div className="p-3 bg-white border-t border-slate-200 shadow-md animate-in fade-in">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Respuestas Rápidas Kanan (1 Clic)
                      </span>
                      <button
                        type="button"
                        onClick={() => setMostrarPicker(null)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {RESPUESTAS_RAPIDAS.map((rr) => (
                        <button
                          key={rr.id}
                          type="button"
                          onClick={() => {
                            setInputMessage(rr.mensaje);
                            setMostrarPicker(null);
                            if (inputRef.current) inputRef.current.focus();
                          }}
                          className="p-2 text-left rounded-xl border border-slate-200 hover:border-[#1D71B5] hover:bg-blue-50/50 transition flex flex-col gap-0.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-[#1D71B5]">
                              {rr.titulo}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {rr.atajo}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {rr.mensaje.replace(/\n/g, " ")}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drawer / Panel Desplegable de Cita del Cliente */}
                {mostrarPanelCita && (
                  <div className="p-3 bg-slate-50 border-t border-b border-slate-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1D71B5]" />
                        Ficha del Servicio Activo
                      </span>
                      <button
                        type="button"
                        onClick={() => setMostrarPanelCita(false)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>

                    {activeCitas[0] ? (
                      (() => {
                        const c = activeCitas[0];
                        return (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[#1D71B5]">Folio: {c.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.estatus === "Confirmada" ? "bg-emerald-100 text-emerald-700" :
                                c.estatus === "Por Confirmar" ? "bg-amber-100 text-amber-700" :
                                c.estatus === "Completada" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {c.estatus}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-400 block">Fecha y Turno:</span>
                                <span className="font-semibold text-slate-800">{c.fecha} ({c.turno})</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Técnico:</span>
                                <span className="font-semibold text-slate-800">{c.tecnico_asignado || "Por asignar"}</span>
                              </div>
                            </div>

                            <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Total Cotización:</span>
                                {editandoMonto ? (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                      type="number"
                                      value={nuevoMonto}
                                      onChange={(e) => setNuevoMonto(e.target.value)}
                                      placeholder={String(c.monto_total || 0)}
                                      className="w-20 px-2 py-0.5 border border-slate-300 rounded text-xs font-bold"
                                    />
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const valor = Number(nuevoMonto);
                                        if (isNaN(valor)) return;
                                        await fetch("/api/crm", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            action: "UPDATE_CITA",
                                            citaId: c.id,
                                            patch: { monto_total: valor },
                                          }),
                                        });
                                        setEditandoMonto(false);
                                        if (onRefresh) onRefresh();
                                      }}
                                      className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 text-sm">
                                      ${c.monto_total || 0} MXN
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNuevoMonto(String(c.monto_total || 0));
                                        setEditandoMonto(true);
                                      }}
                                      className="text-[10px] text-[#1D71B5] hover:underline font-semibold"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const textCotizacion = `¡Hola ${activeCliente.nombre.split(" ")[0]}! Te confirmo los detalles de tu cita en Kanan:\n🛋️ Folio: *${c.id}*\n📅 Fecha: *${c.fecha}* (${c.turno})\n💰 Total: *$${c.monto_total || 0} MXN*\n🚐 Técnico: ${c.tecnico_asignado || "Equipo Kanan"}`;
                                  setInputMessage(textCotizacion);
                                  setMostrarPanelCita(false);
                                  if (inputRef.current) inputRef.current.focus();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1D71B5] hover:bg-blue-100 font-bold text-[11px] transition"
                              >
                                Insertar en Chat
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                        <p className="text-xs">Este cliente aún no tiene citas agendadas.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Popover de Emojis */}
                {mostrarPicker === "emojis" && (
                  <div className="p-2.5 bg-white border-t border-slate-200 shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600">Emoticones</span>
                      <button
                        type="button"
                        onClick={() => setMostrarPicker(null)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS_FRECUENTES.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInsertEmoji(emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg active:scale-95 transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popover de Stickers */}
                {mostrarPicker === "stickers" && (
                  <div className="p-3 bg-white border-t border-slate-200 shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#1D71B5]" />
                        Stickers de Kanan
                      </span>
                      <button
                        type="button"
                        onClick={() => setMostrarPicker(null)}
                        className="text-xs text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                      {STICKERS_DISPONIBLES.map((stk) => (
                        <button
                          key={stk.id}
                          type="button"
                          onClick={() => handleSendSticker(stk.path)}
                          className="p-1 rounded-xl border border-slate-200 hover:border-[#1D71B5] hover:bg-blue-50 transition flex flex-col items-center gap-1 active:scale-95"
                          title={stk.nombre}
                        >
                          <img 
                            src={stk.path} 
                            alt={stk.nombre} 
                            className="w-12 h-12 object-contain rounded-md"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input de Mensaje Limpio con Botón de Emoticones y Stickers */}
                <form onSubmit={handleSendMessage} className="p-2 sm:p-2.5 bg-white border-t border-slate-200 flex items-center gap-1 sm:gap-1.5">
                  {/* Botón de Respuestas Rápidas (Plantillas) */}
                  <button
                    type="button"
                    onClick={() => setMostrarPicker(mostrarPicker === "respuestas_rapidas" ? null : "respuestas_rapidas")}
                    className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition ${
                      mostrarPicker === "respuestas_rapidas"
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                    }`}
                    title="Respuestas Rápidas y Plantillas (1 Clic)"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostrarPicker(mostrarPicker === "emojis" ? null : "emojis")}
                    className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition ${
                      mostrarPicker === "emojis"
                        ? "bg-[#1D71B5] text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Emoticones"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostrarPicker(mostrarPicker === "stickers" ? null : "stickers")}
                    className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition ${
                      mostrarPicker === "stickers"
                        ? "bg-[#1D71B5] text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Stickers de Kanan"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D71B5]"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || enviando}
                    className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-[#1D71B5] hover:bg-[#175c94] text-white disabled:opacity-40 transition active:scale-95 shadow-2xs shrink-0"
                    title="Enviar"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Selecciona una conversación.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
