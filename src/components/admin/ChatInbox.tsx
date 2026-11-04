"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Cliente, ServicioCita, MensajeAutomatizacion } from "@/types/crm";
import { AgentFlowCanvas } from "./agent-flow/AgentFlowCanvas";

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

  // Sincronizar clientes cuando cambie la prop
  useEffect(() => {
    setContactosLocales(clientes);
    if (!selectedClienteId && clientes.length > 0) {
      setSelectedClienteId(clientes[0].id);
    }
  }, [clientes]);

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
  const activeMensajes = mensajes.filter((m) => m.cliente_id === activeCliente?.id);

  // Enviar mensaje manual a través de la API de Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCliente || enviando) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: activeCliente.whatsapp,
          message: inputMessage.trim(),
          cliente_id: activeCliente.id,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setInputMessage("");
        // Al enviar un mensaje manual, se conmuta a control humano para no interferir con la IA
        setModoIaActivo(false);
        if (onRefresh) onRefresh();
      } else {
        // Fallback: abrir enlace web directo si el bridge local está desconectado
        const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
        const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
        window.open(
          `https://wa.me/${fullPhone}?text=${encodeURIComponent(inputMessage.trim())}`,
          "_blank"
        );
        setInputMessage("");
      }
    } catch {
      // Fallback
      const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
      window.open(
        `https://wa.me/${fullPhone}?text=${encodeURIComponent(inputMessage.trim())}`,
        "_blank"
      );
      setInputMessage("");
    } finally {
      setEnviando(false);
    }
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>WhatsApp Conectado</span>
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
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                bridgeStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : bridgeStatus === "qr_ready"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-300"
              }`}
            ></span>
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
          {/* Botón para ver/escanear QR */}
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

          {/* Switch de Modo IA / Modo Humano */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setModoIaActivo(true)}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition ${
                modoIaActivo
                  ? "bg-[#1D71B5] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Modo IA Activo</span>
            </button>
            <button
              type="button"
              onClick={() => setModoIaActivo(false)}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition ${
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base text-slate-800">
                Vincular Chat Oficial Kanan
              </h3>
              <p className="text-xs text-slate-500">
                Abre la app de mensajería en tu teléfono, ve a Dispositivos Vinculados y escanea este código.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] text-center space-y-2">
              {bridgeQr ? (
                <>
                  <img src={bridgeQr} alt="QR Code" className="w-52 h-52 rounded-xl shadow-md border border-slate-200 bg-white p-1" />
                  <p className="text-[11px] font-bold text-[#1D71B5] mt-1">
                    ⚡ Escanea este código desde Dispositivos Vinculados
                  </p>
                </>
              ) : bridgeStatus === "connected" ? (
                <div className="space-y-1">
                  <span className="text-3xl block">✅</span>
                  <p className="text-xs font-bold text-emerald-700">¡Dispositivo vinculado y conectado!</p>
                  <p className="text-[11px] text-slate-400">Listo para enviar y recibir mensajes.</p>
                </div>
              ) : bridgeStatus === "disconnected" ? (
                <div className="space-y-2 max-w-xs">
                  <span className="text-2xl block">🔌</span>
                  <p className="text-xs font-heading font-extrabold text-slate-700">Microservicio de Chat no detectado</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Igual que en FoxDrop, el puente <strong>chat-bridge</strong> debe correr en un servidor persistente (ej. Render.com gratuito o en tu PC con <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">npm start</code>).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 animate-pulse">Conectando con el servicio de Chat...</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={consultarStatus}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-heading font-bold text-slate-700"
              >
                Actualizar QR
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

      {/* Bandeja de Chat Principal */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs h-[640px] flex flex-col md:flex-row">
        {/* Columna Izquierda: Lista de Conversaciones */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-[#F8FAFC]">
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-[#355581]">
                Bandeja de Conversaciones
              </h2>
              <span className="text-[11px] font-bold text-slate-400">{contactosLocales.length}</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D71B5]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {clientesFiltrados.map((cli) => {
              const isSelected = cli.id === activeCliente?.id;
              const cliCitas = citas.filter((c) => c.cliente_id === cli.id);
              const ultimaCita = cliCitas[0];

              return (
                <button
                  key={cli.id}
                  type="button"
                  onClick={() => setSelectedClienteId(cli.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? "bg-white shadow-xs border-l-4 border-[#1D71B5]" : "hover:bg-slate-100/70"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#1D71B5]/10 flex items-center justify-center shrink-0 text-[#1D71B5] font-heading font-extrabold text-xs">
                    {cli.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-heading font-extrabold text-xs text-slate-900 truncate">
                        {cli.nombre}
                      </p>
                      {ultimaCita && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {ultimaCita.id}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <span>{cli.municipio}</span>
                      <span>·</span>
                      <span>{cli.whatsapp}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Hilo de Mensajes y Caja de Envío */}
        <div className="flex-1 flex flex-col bg-white">
          {activeCliente ? (
            <>
              {/* Encabezado del Chat */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D71B5] to-cyan-600 text-white flex items-center justify-center font-heading font-extrabold text-sm shadow-xs">
                    {activeCliente.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <span>{activeCliente.nombre}</span>
                      {activeCliente.mascotas && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🐾 Con Mascotas
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {activeCliente.whatsapp} · {activeCliente.direccion}, {activeCliente.municipio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón rápido para Confirmar Cita desde el Chat */}
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
                          <span>Confirmar Cita ({citaPorConfirmar.id})</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <span className={`text-[11px] font-heading font-bold px-2.5 py-1 rounded-xl border ${
                    modoIaActivo
                      ? "bg-blue-50 text-[#1D71B5] border-blue-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {modoIaActivo ? "🤖 IA Respondiendo" : "👤 Control Manual"}
                  </span>
                </div>
              </div>

              {/* Hilo de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                {activeCliente.nombre.includes("🧪") && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs flex items-center gap-2">
                    <span className="text-base">🧪</span>
                    <p className="font-medium">
                      <strong>Canal de Prueba Seguro:</strong> Estás conectado a tu propio WhatsApp ({activeCliente.whatsapp}). Puedes enviar mensajes libremente para verificar el chat.
                    </p>
                  </div>
                )}
                {activeMensajes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-medium">No hay mensajes previos en esta conversación.</p>
                    <p className="text-[11px] text-slate-400">
                      Escribe un mensaje abajo para iniciar la conversación en directo.
                    </p>
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
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                            isClient
                              ? "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                              : "bg-[#1D71B5] text-white rounded-tr-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{cleanContent}</p>
                          <div className={`flex items-center justify-end gap-1 text-[10px] ${
                            isClient ? "text-slate-400" : "text-blue-100"
                          }`}>
                            <span>
                              {new Date(m.fecha_programada).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {!isClient && <CheckCheck className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Caja de Redacción de Mensaje */}
              <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje al cliente..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D71B5]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || enviando}
                  className="p-2.5 rounded-2xl bg-[#1D71B5] hover:bg-[#175c94] text-white disabled:opacity-40 transition active:scale-95 shadow-xs"
                  title="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
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
