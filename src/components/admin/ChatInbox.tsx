"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Check,
  CheckCheck,
  Sparkles,
  MessageCircle,
  QrCode,
  RefreshCw,
  Search,
  Bot,
  UserCheck,
  Clock,
  Phone,
  ShieldCheck,
  Workflow,
  MessagesSquare,
  Smile,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Calendar,
  MapPin,
  ChevronDown
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
  const [mostrarStickersPicker, setMostrarStickersPicker] = useState(false);

  // Referencia para auto-scroll hacia el mensaje más nuevo (fondo del chat)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll al fondo cada vez que cambie la conversación o lleguen nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMensajes.length, selectedClienteId]);

  // Enviar mensaje manual a través de la API de Chat
  const handleSendMessage = async (e?: React.FormEvent, stickerUrlCustom?: string) => {
    if (e) e.preventDefault();
    const textToSend = inputMessage.trim();
    if ((!textToSend && !stickerUrlCustom) || !activeCliente || enviando) return;

    setEnviando(true);
    setMostrarStickersPicker(false);
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
        // Fallback web
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
    <div className="space-y-4">
      {/* Selector Principal de Vista: Bandeja vs Configuración de Agente estilo n8n */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("conversaciones")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "conversaciones"
                ? "bg-[#1D71B5] text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Bandeja de Conversaciones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agente_flow")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "agente_flow"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Configuración de Agente (Flujo n8n)</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30 font-mono">
              IA
            </span>
          </button>
        </div>

        {activeTab === "conversaciones" && (
          <div className="hidden sm:flex items-center gap-2 pr-2 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${bridgeStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{bridgeStatus === "connected" ? "WhatsApp Conectado" : "Esperando Conexión"}</span>
          </div>
        )}
      </div>

      {activeTab === "agente_flow" ? (
        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[720px] bg-slate-950">
          <AgentFlowCanvas />
        </div>
      ) : (
        <>
          {/* Barra Superior: Estado de Conexión del Chat y Switch IA */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    bridgeStatus === "connected"
                      ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-100"
                      : bridgeStatus === "qr_ready"
                      ? "bg-amber-400 animate-ping"
                      : "bg-slate-300"
                  }`}
                />
                <span className="font-heading font-extrabold text-sm text-slate-800">
                  {bridgeStatus === "connected"
                    ? "Chat Autónomo Kanan Activo"
                    : bridgeStatus === "qr_ready"
                    ? "Código QR Listo para Vincular"
                    : "Chat en Espera de Conexión"}
                </span>
              </div>

              <button
                type="button"
                onClick={consultarStatus}
                disabled={cargandoStatus}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                title="Refrescar estado"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargandoStatus ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {bridgeStatus !== "connected" && (
                <button
                  type="button"
                  onClick={() => setMostrarModalQr(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1D71B5] font-heading font-bold text-xs hover:bg-blue-100 transition shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Vincular con Código QR</span>
                </button>
              )}

              {/* Switch IA vs Control Humano */}
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModoIaActivo(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold flex items-center gap-1.5 transition ${
                    modoIaActivo
                      ? "bg-[#1D71B5] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>IA Activa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoIaActivo(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold flex items-center gap-1.5 transition ${
                    !modoIaActivo
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Control Humano</span>
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
                    Vincular Chat Oficial Kanan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea este código.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] text-center space-y-2">
                  {bridgeQr ? (
                    <>
                      <img src={bridgeQr} alt="QR Code" className="w-52 h-52 rounded-xl shadow-md border border-slate-200 bg-white p-1" />
                      <p className="text-[11px] font-bold text-[#1D71B5] mt-1">
                        ⚡ Escanea este código desde WhatsApp
                      </p>
                    </>
                  ) : bridgeStatus === "connected" ? (
                    <div className="space-y-1">
                      <span className="text-3xl block">✅</span>
                      <p className="text-xs font-bold text-emerald-700">¡WhatsApp Vinculado y Activo!</p>
                      <p className="text-[11px] text-slate-400">Listo para enviar y recibir mensajes.</p>
                    </div>
                  ) : bridgeStatus === "disconnected" ? (
                    <div className="space-y-2 max-w-xs">
                      <span className="text-2xl block">🔌</span>
                      <p className="text-xs font-heading font-extrabold text-slate-700">Servicio de Chat no detectado</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        El puente chat-bridge debe estar iniciado para generar el código QR.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 animate-pulse">Generando código de vinculación...</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={consultarStatus}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-heading font-bold text-slate-700"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarModalQr(false)}
                    className="flex-1 py-2 rounded-xl bg-[#1D71B5] hover:bg-[#175c94] text-xs font-heading font-bold text-white"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bandeja de Chat Rediseñada estilo WhatsApp Web */}
          <div className="bg-[#efeae2] rounded-3xl border border-slate-300 overflow-hidden shadow-lg h-[680px] flex flex-col md:flex-row">
            {/* Columna Izquierda: Lista de Conversaciones */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white">
              {/* Header Conversaciones */}
              <div className="p-3.5 border-b border-slate-200 bg-[#f0f2f5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <MessagesSquare className="w-4 h-4 text-[#1D71B5]" />
                    <span>Chats Kanan</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {contactosLocales.length}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar o empezar un nuevo chat..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D71B5] shadow-2xs"
                  />
                </div>
              </div>

              {/* Lista Scrollable de Contactos */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
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
                          ? "bg-[#f0f2f5] border-l-4 border-[#1D71B5]" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D71B5] to-cyan-700 flex items-center justify-center shrink-0 text-white font-heading font-extrabold text-xs shadow-xs">
                        {cli.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-heading font-extrabold text-xs text-slate-900 truncate">
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
                          {ultimoMsg ? (
                            ultimoMsg.contenido_mensaje.replace("[Cliente]:", "👤 ")
                          ) : (
                            `${cli.municipio} · ${cli.whatsapp}`
                          )}
                        </p>
                        {ultimaCita && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              ultimaCita.estatus === "Confirmada" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {ultimaCita.id} ({ultimaCita.estatus})
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Ventana de Conversación estilo WhatsApp */}
            <div className="flex-1 flex flex-col bg-[#efeae2]">
              {activeCliente ? (
                <>
                  {/* Encabezado del Chat */}
                  <div className="p-3 border-b border-slate-300 flex items-center justify-between bg-[#f0f2f5] shadow-2xs z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D71B5] to-cyan-600 text-white flex items-center justify-center font-heading font-extrabold text-sm shadow-xs">
                        {activeCliente.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <span>{activeCliente.nombre}</span>
                          {activeCliente.mascotas && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🐾 Con Mascotas
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{activeCliente.whatsapp}</span>
                          <span>·</span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{activeCliente.direccion}, {activeCliente.municipio}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Confirmar cita directa si está pendiente */}
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
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Confirmar Cita ({citaPorConfirmar.id})</span>
                            </button>
                          );
                        }
                        return null;
                      })()}

                      <span className={`text-[11px] font-heading font-bold px-2.5 py-1 rounded-xl border ${
                        modoIaActivo
                          ? "bg-blue-100 text-[#1D71B5] border-blue-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {modoIaActivo ? "🤖 IA Activa" : "👤 Humano"}
                      </span>
                    </div>
                  </div>

                  {/* Hilo de Mensajes: ORDEN WHATSAPP (Antiguos Arriba -> Nuevos Abajo) */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:20px_20px]"
                  >
                    {/* Badge Canal de Prueba si aplica */}
                    {activeCliente.nombre.includes("🧪") && (
                      <div className="mx-auto max-w-md p-2.5 bg-purple-100 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2 shadow-2xs">
                        <span className="text-base">🧪</span>
                        <p className="font-medium text-[11px]">
                          <strong>Canal de Prueba:</strong> Estás conectado a tu propio WhatsApp ({activeCliente.whatsapp}). Los mensajes se enviarán directamente a tu celular.
                        </p>
                      </div>
                    )}

                    {activeMensajes.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-[#1D71B5]" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">No hay mensajes previos en esta conversación.</p>
                        <p className="text-[11px] text-slate-500">
                          Escribe abajo o envía un sticker oficial de Kanan para iniciar la plática.
                        </p>
                      </div>
                    ) : (
                      activeMensajes.map((m) => {
                        const isClient = m.contenido_mensaje.startsWith("[Cliente]:");
                        const cleanContent = isClient
                          ? m.contenido_mensaje.replace("[Cliente]:", "").trim()
                          : m.contenido_mensaje;

                        // Detección de sticker en el mensaje
                        const tieneSticker = cleanContent.includes("[Sticker]") || cleanContent.includes("/assets/stickers/");

                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isClient ? "items-start" : "items-end"} animate-in fade-in duration-150`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                                isClient
                                  ? "bg-white text-slate-800 rounded-tl-xs border border-slate-200/60"
                                  : "bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/50"
                              }`}
                            >
                              {/* Si contiene miniatura de sticker oficial */}
                              {tieneSticker && (
                                <div className="p-1 rounded-xl bg-white/80 border border-emerald-300/40 w-fit mb-1 shadow-2xs">
                                  <img 
                                    src="/assets/stickers/kanan-mascota-agendado.jpg" 
                                    alt="Sticker Kanan" 
                                    className="w-24 h-24 object-contain rounded-lg"
                                  />
                                </div>
                              )}

                              <p className="whitespace-pre-line leading-relaxed font-sans">{cleanContent}</p>
                              
                              <div className={`flex items-center justify-end gap-1 text-[10px] ${
                                isClient ? "text-slate-400" : "text-emerald-700"
                              }`}>
                                <span>
                                  {new Date(m.fecha_programada).toLocaleTimeString("es-MX", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {!isClient && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {/* Elemento ancla para auto-scroll inferior */}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Selector Flotante de Stickers Oficiales Kanan */}
                  {mostrarStickersPicker && (
                    <div className="p-3 bg-white border-t border-slate-300 shadow-xl animate-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#1D71B5]" />
                          Enviar Sticker Oficial de Kanan
                        </span>
                        <button
                          type="button"
                          onClick={() => setMostrarStickersPicker(false)}
                          className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                        {STICKERS_DISPONIBLES.map((stk) => (
                          <button
                            key={stk.id}
                            type="button"
                            onClick={() => handleSendSticker(stk.path)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:border-[#1D71B5] hover:bg-blue-50 transition flex flex-col items-center gap-1 group active:scale-95"
                            title={stk.nombre}
                          >
                            <img 
                              src={stk.path} 
                              alt={stk.nombre} 
                              className="w-14 h-14 object-contain rounded-lg group-hover:scale-105 transition"
                            />
                            <span className="text-[9px] text-slate-600 line-clamp-1 text-center font-medium">
                              {stk.nombre.split("(")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Barra Inferior de Entrada (WhatsApp Footer) */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-[#f0f2f5] border-t border-slate-300 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarStickersPicker(!mostrarStickersPicker)}
                      className={`p-2.5 rounded-full transition ${
                        mostrarStickersPicker 
                          ? "bg-[#1D71B5] text-white shadow" 
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                      }`}
                      title="Enviar sticker de Kanan"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      placeholder="Escribe un mensaje aquí..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-2xl border-none bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D71B5] shadow-xs"
                    />

                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || enviando}
                      className="p-2.5 rounded-full bg-[#1D71B5] hover:bg-[#175c94] text-white disabled:opacity-40 transition active:scale-95 shadow-xs"
                      title="Enviar mensaje"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Selecciona una conversación de la lista.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
