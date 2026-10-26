"use client";

import React, { useState } from "react";
import { Send, Phone, User, Check, CheckCheck, Sparkles, MessageCircle } from "lucide-react";
import { Cliente, ServicioCita, MensajeAutomatizacion } from "@/types/crm";

interface WhatsAppFoxdropProps {
  clientes: Cliente[];
  citas: ServicioCita[];
  mensajes: MensajeAutomatizacion[];
  onTriggerMessage: (mensajeId: string) => void;
}

export function WhatsAppFoxdrop({
  clientes,
  citas,
  mensajes,
  onTriggerMessage,
}: WhatsAppFoxdropProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || "");
  const [inputMessage, setInputMessage] = useState("");

  const activeCliente = clientes.find((c) => c.id === selectedClienteId) || clientes[0];
  const activeCitas = citas.filter((c) => c.cliente_id === activeCliente?.id);
  const activeMensajes = mensajes.filter((m) => m.cliente_id === activeCliente?.id);

  const handleSendCustomMessage = () => {
    if (!inputMessage.trim() || !activeCliente) return;
    const cleanPhone = activeCliente.whatsapp.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(inputMessage.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setInputMessage("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-[680px] flex flex-col md:flex-row">
      
      {/* Columna Izquierda: Lista de Chats */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-[#F8FAFC]">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-heading font-extrabold text-base text-[#355581]">
            Mensajes
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {clientes.map((cli) => {
            const isSelected = cli.id === activeCliente?.id;
            const cliCitas = citas.filter((c) => c.cliente_id === cli.id);
            const ultimaCita = cliCitas[0];

            return (
              <button
                key={cli.id}
                type="button"
                onClick={() => setSelectedClienteId(cli.id)}
                className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                  isSelected ? "bg-white shadow-sm border-l-4 border-[#355581]" : "hover:bg-slate-100/70"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#355581] text-white font-heading font-bold flex items-center justify-center shrink-0">
                  {cli.nombre.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-heading font-bold text-sm text-[#355581] truncate">
                      {cli.nombre}
                    </span>
                    {ultimaCita && (
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {ultimaCita.fecha}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {cli.whatsapp} • {cli.municipio}
                  </p>
                  {ultimaCita && (
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-[#F4F7F9] px-2 py-0.5 rounded text-slate-600">
                      {ultimaCita.id} ({ultimaCita.estatus})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Área Central: Conversación Estilo Foxdrop */}
      <div className="flex-1 flex flex-col bg-[#EFEAE2]/30 relative">
        {activeCliente ? (
          <>
            {/* Header del Chat */}
            <div className="p-3.5 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1D71B5] text-white font-heading font-bold flex items-center justify-center">
                  {activeCliente.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#355581]">
                    {activeCliente.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{activeCliente.whatsapp}</span>
                    <span>•</span>
                    <span>{activeCliente.municipio}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeCliente.whatsapp}`}
                  className="p-2 rounded-xl bg-[#F4F7F9] hover:bg-slate-200 text-[#355581]"
                  aria-label="Llamar"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Accesos rápidos a Plantillas Oficiales */}
            <div className="p-2.5 px-4 bg-white/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-heading font-bold uppercase text-slate-400 shrink-0">
                Plantillas:
              </span>
              {activeMensajes.slice(0, 4).map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => onTriggerMessage(msg.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#F4F7F9] hover:bg-[#355581] hover:text-white text-slate-700 text-xs font-medium whitespace-nowrap border border-slate-200 transition-colors shrink-0"
                >
                  {msg.etapa_titulo.split("—")[0].trim()}
                </button>
              ))}
            </div>

            {/* Lista de Mensajes del Cliente */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeMensajes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Sin mensajes registrados
                </div>
              ) : (
                activeMensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className="max-w-lg ml-auto bg-[#DCF8C6] text-slate-800 p-3.5 rounded-2xl rounded-tr-none shadow-sm space-y-2 border border-emerald-200"
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] font-bold text-[#1D71B5] border-b border-emerald-300/40 pb-1">
                      <span>{msg.etapa_titulo}</span>
                      <span className="text-slate-500">{msg.estatus_envio}</span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
                      {msg.contenido_mensaje}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.fecha_programada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => onTriggerMessage(msg.id)}
                        className="text-[11px] font-heading font-bold text-[#1D71B5] hover:text-[#355581] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Abrir en WhatsApp</span>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Inferior para Redactar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un mensaje para WhatsApp..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCustomMessage()}
                className="flex-1 px-4 py-2.5 bg-[#F4F7F9] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#36A6DE]"
              />
              <button
                type="button"
                onClick={handleSendCustomMessage}
                className="p-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl shadow-sm transition-transform active:scale-95"
                aria-label="Enviar a WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecciona un cliente para ver la conversación
          </div>
        )}
      </div>
    </div>
  );
}
