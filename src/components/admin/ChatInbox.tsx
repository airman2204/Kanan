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
  Sparkles
} from "lucide-react";
import { Cliente, ServicioCita, MensajeAutomatizacion } from "@/types/crm";
import { AgentFlowCanvas } from "./agent-flow/AgentFlowCanvas";
import { STICKERS_DISPONIBLES } from "@/types/agentFlow";

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
  mensajes,
  onTriggerMessage,
  onRefresh,
  onConfirmCita,
}: ChatInboxProps) {
  const [contactosLocales, setContactosLocales] = useState<Cliente[]>(clientes);
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"conversaciones" | "agente_flow">("conversaciones");
  const [inputMessage, setInputMessage] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modoIaActivo, setModoIaActivo] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState<"emojis" | "stickers" | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar clientes cuando cambie la prop
  useEffect(() => {
    setContactosLocales(clientes);
    if (!selectedClienteId && clientes.length > 0) {
      setSelectedClienteId(clientes[0].id);
    }
  }, [clientes, selectedClienteId]);

  // Estado del bridge
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
      if (data.ok) {
        setBridgeStatus(data.status || "disconnected");
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
    const interval = setInterval(() => {
      consultarStatus();
      if (onRefresh) onRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const clientesFiltrados = contactosLocales.filter((c) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.whatsapp.includes(q) ||
      c.municipio.toLowerCase().includes(q)
    );
  });

  const activeCliente = contactosLocales.find((c) => c.id === selectedClienteId) || contactosLocales[0];
  const activeCitas = citas.filter((c) => c.cliente_id === activeCliente?.id);

  // ORDEN CRONOLÓGICO NATURAL (WhatsApp Style):
  // Mensajes más viejos arriba -> Mensajes más nuevos abajo
  const activeMensajes = mensajes
    .filter((m) => m.cliente_id === activeCliente?.id)
    .sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime());

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

    setEnviando(true);
    setMostrarPicker(null);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: activeCliente.whatsapp,
          mensaje: textToSend,
          stickerUrl: stickerUrlCustom,
          cliente_id: activeCliente.id,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setInputMessage("");
        setModoIaActivo(false);
        if (onRefresh) onRefresh();
      } else {
        const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
        window.open(
          `https://wa.me/${fullPhone}?text=${encodeURIComponent(textToSend)}`,
          "_blank"
        );
        setInputMessage("");
      }
    } catch {
      const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
      window.open(
        `https://wa.me/${fullPhone}?text=${encodeURIComponent(textToSend)}`,
        "_blank"
      );
      setInputMessage("");
    } finally {
      setEnviando(false);
    }
  };

  const handleSendSticker = (stickerPath: string) => {
    handleSendMessage(undefined, stickerPath);
  };

  return (
    <div className="space-y-3">
      {/* Barra de Control Compacta y Limpia (Sin subtítulos redundantes) */}
      <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("conversaciones")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
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
        <div className="flex items-center gap-2.5">
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
        /* Bandeja de Chat con Estilo Moderno Limpio (Sin fondo amarillento) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-[660px] flex flex-col md:flex-row">
          
          {/* Columna Izquierda: Lista de Contactos */}
          <div className="w-full md:w-80 lg:w-88 border-r border-slate-200 flex flex-col bg-slate-50/70">
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
                const ultimosMensajes = mensajes.filter((m) => m.cliente_id === cli.id);
                const ultimoMsg = ultimosMensajes[ultimosMensajes.length - 1];

                return (
                  <button
                    key={cli.id}
                    type="button"
                    onClick={() => setSelectedClienteId(cli.id)}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                      isSelected 
                        ? "bg-white shadow-2xs border-l-3 border-[#1D71B5]" 
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1D71B5]/10 text-[#1D71B5] flex items-center justify-center shrink-0 font-bold text-xs">
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

          {/* Columna Derecha: Conversación */}
          <div className="flex-1 flex flex-col bg-white">
            {activeCliente ? (
              <>
                {/* Cabecera del Chat Activo */}
                <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1D71B5] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {activeCliente.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">
                        {activeCliente.nombre}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {activeCliente.whatsapp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                      const cleanContent = isClient
                        ? m.contenido_mensaje.replace("[Cliente]:", "").trim()
                        : m.contenido_mensaje;

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs space-y-1 shadow-2xs leading-relaxed ${
                              isClient
                                ? "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80"
                                : "bg-[#1D71B5] text-white rounded-tr-xs"
                            }`}
                          >
                            <p className="whitespace-pre-line font-sans">{cleanContent}</p>
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
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

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
                <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMostrarPicker(mostrarPicker === "emojis" ? null : "emojis")}
                    className={`p-2 rounded-xl transition ${
                      mostrarPicker === "emojis"
                        ? "bg-[#1D71B5] text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Emoticones"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostrarPicker(mostrarPicker === "stickers" ? null : "stickers")}
                    className={`p-2 rounded-xl transition ${
                      mostrarPicker === "stickers"
                        ? "bg-[#1D71B5] text-white shadow-2xs"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Stickers de Kanan"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D71B5]"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || enviando}
                    className="p-2 rounded-xl bg-[#1D71B5] hover:bg-[#175c94] text-white disabled:opacity-40 transition active:scale-95 shadow-2xs"
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
