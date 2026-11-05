"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Image as ImageIcon,
  Check,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";
import { MunicipioZMG, TurnoServicio, ItemContratado } from "@/types/crm";
import { consultarCodigoPostal } from "@/lib/utils/postalCodes";
import {
  validarNombre,
  validarWhatsApp,
  validarDireccion,
  sanitizeInput
} from "@/lib/utils/securityValidation";

interface CatalogPiece {
  id: string;
  nombre: string;
  categoriaId: string;
  categoriaNombre: string;
}

const PIEZAS_CATALOGO: CatalogPiece[] = [
  // Salas
  { id: "sala-l", nombre: "Sala en L / Seccional", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sala-321", nombre: "Sala Tradicional (3-2-1)", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "loveseat-sofa", nombre: "Sofá 2 o 3 Plazas / Sofá Cama", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sillon-individual", nombre: "Sillón Individual / Reclinable", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "silla-comedor", nombre: "Sillas de Comedor Tapizadas", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  // Tapetes
  { id: "tapete-chico", nombre: "Tapete Chico (hasta 1.5x1m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-mediano", nombre: "Tapete Mediano (hasta 2x1.5m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-grande", nombre: "Tapete Grande (hasta 3x2m)", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  // Colchones
  { id: "colchon-ind", nombre: "Colchón Individual", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-mat", nombre: "Colchón Matrimonial", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-queen", nombre: "Colchón Queen Size", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-king", nombre: "Colchón King Size", categoriaId: "colchones", categoriaNombre: "Colchones" },
  // Autos
  { id: "auto-sedan", nombre: "Auto Sedán / Hatchback", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-suv", nombre: "SUV / Camioneta (2 Filas)", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-3filas", nombre: "Camioneta Familiar (3 Filas)", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
];

const CATEGORIAS = [
  { id: "salas", label: "🛋️ Salas y Sofás" },
  { id: "tapetes", label: "✨ Tapetes" },
  { id: "colchones", label: "🛏️ Colchones" },
  { id: "autos", label: "🚗 Autos" },
];

type StepId =
  | "ask_category"
  | "ask_piece"
  | "ask_cp"
  | "ask_address"
  | "ask_date"
  | "ask_name"
  | "ask_phone"
  | "finished";

interface MessageItem {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
}

interface KananConciergeAgentProps {
  selectedMunicipio: MunicipioZMG;
  onSelectMunicipio: (m: MunicipioZMG) => void;
  preselectedCategory?: string | null;
}

export function KananConciergeAgent({
  selectedMunicipio,
  onSelectMunicipio,
  preselectedCategory,
}: KananConciergeAgentProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [step, setStep] = useState<StepId>("ask_category");

  // Estado acumulado del cliente
  const [selectedCat, setSelectedCat] = useState<string>("salas");
  const [selectedPiece, setSelectedPiece] = useState<CatalogPiece | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [codigoPostal, setCodigoPostal] = useState<string>("");
  const [colonia, setColonia] = useState<string>("");
  const [coloniasDisponibles, setColoniasDisponibles] = useState<string[]>([]);
  const [direccion, setDireccion] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [turno, setTurno] = useState<string>("Mañana (09:00 - 13:00)");
  const [nombre, setNombre] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");

  // Input de texto general
  const [inputText, setInputText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<{ folio: string; whatsappUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // Inicializar conversación
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "m-1",
          sender: "agent",
          text: "¡Hola! 👋 Soy Kanan asistente.",
          time: getCurrentTime(),
        },
        {
          id: "m-2",
          sender: "agent",
          text: "¿Qué muebles o piezas te gustaría que consintamos hoy?",
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);

      if (preselectedCategory) {
        setSelectedCat(preselectedCategory);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [preselectedCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, step]);

  // Helper para simular respuesta natural del asistente con indicador de escritura
  const appendAgentMessage = (text: string, nextStep: StepId, delayMs = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text,
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
      setStep(nextStep);
    }, delayMs);
  };

  // 1. Elección de Categoría
  const handleSelectCategory = (catId: string, label: string) => {
    setSelectedCat(catId);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: label,
        time: getCurrentTime(),
      },
    ]);

    const catName = catId === "salas" ? "salas" : catId === "colchones" ? "colchones" : catId === "tapetes" ? "tapetes" : "autos";
    appendAgentMessage(`¡Excelente! Para ${catName}, ¿cuál de estas opciones se adapta mejor a tu necesidad?`, "ask_piece");
  };

  // 2. Elección de Pieza
  const handleSelectPiece = (piece: CatalogPiece) => {
    setSelectedPiece(piece);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: piece.nombre,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Anotado! 🐶 ${piece.nombre}.\n\nPara calcular tu ruta en Guadalajara o municipios vecinos, ¿cuál es tu Código Postal?`,
      "ask_cp"
    );
  };

  // 3. Envío de Código Postal
  const handleSubmitCp = (cpVal: string) => {
    const cleanCp = cpVal.replace(/\D/g, "").slice(0, 5);
    if (cleanCp.length < 5) return;

    setCodigoPostal(cleanCp);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: cleanCp,
        time: getCurrentTime(),
      },
    ]);
    setInputText("");

    const res = consultarCodigoPostal(cleanCp);
    if (res.valido && res.municipio) {
      onSelectMunicipio(res.municipio);
      setColoniasDisponibles(res.colonias || []);
      const primeraColonia = res.colonias && res.colonias.length > 0 ? res.colonias[0] : "";
      setColonia(primeraColonia);

      appendAgentMessage(
        `¡Tenemos Kanan Móvil cerca en ${res.municipio}! 🚐💨\n\n¿Cuál es tu calle, número exterior y coto o privada?`,
        "ask_address"
      );
    } else {
      appendAgentMessage(
        `Detecté el CP ${cleanCp}. ¿Podrías indicarme tu calle, número exterior, colonia y municipio para verificar la ruta?`,
        "ask_address"
      );
    }
  };

  // 4. Envío de Dirección
  const handleSubmitAddress = (addrVal: string) => {
    if (!addrVal.trim()) return;
    setDireccion(addrVal.trim());
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: addrVal.trim(),
        time: getCurrentTime(),
      },
    ]);
    setInputText("");

    const tom = getTomorrowDate();
    setFecha(tom);

    appendAgentMessage(
      `¡Perfecto! Llegamos directo a tu puerta.\n\n¿Qué fecha y turno te viene mejor? (Nuestro secado rápido toma de 3 a 4 horas).`,
      "ask_date"
    );
  };

  // 5. Envío de Fecha y Turno
  const handleSubmitDateTurno = (fechaVal: string, turnoVal: string) => {
    const textResp = `Para el día ${fechaVal} (${turnoVal})`;
    setFecha(fechaVal);
    setTurno(turnoVal);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: textResp,
        time: getCurrentTime(),
      },
    ]);

    appendAgentMessage(
      `¡Listo para apartarlo! 📅\n\nPor favor compárteme tu Nombre Completo para preparar tu ficha formal de servicio.`,
      "ask_name"
    );
  };

  // 6. Envío de Nombre
  const handleSubmitName = (nombreVal: string) => {
    if (!nombreVal.trim()) return;
    setNombre(nombreVal.trim());

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: nombreVal.trim(),
        time: getCurrentTime(),
      },
    ]);
    setInputText("");

    appendAgentMessage(
      `Mucho gusto, ${nombreVal.trim().split(" ")[0]}! 🐾\n\nPor último, ¿cuál es tu número de WhatsApp a 10 dígitos para enviarte de inmediato tu folio y cotización formal?`,
      "ask_phone"
    );
  };

  // 7. Envío de Teléfono y Guardado en CRM
  const handleSubmitPhone = async (telVal: string) => {
    const cleanTel = telVal.replace(/\D/g, "");
    if (cleanTel.length < 10) return;
    setWhatsapp(cleanTel);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: cleanTel,
        time: getCurrentTime(),
      },
    ]);
    setInputText("");

    setIsTyping(true);
    setSubmitting(true);

    const items: ItemContratado[] = [
      {
        categoriaId: selectedPiece?.categoriaId || "salas",
        categoriaNombre: selectedPiece?.categoriaNombre || "Salas y Sillas",
        piezaId: selectedPiece?.id || "pieza_manual",
        piezaNombre: selectedPiece?.nombre || "Servicio Kanan",
        cantidad: cantidad || 1,
      },
    ];

    const dirCompleta = `${direccion}${colonia ? `, Col. ${colonia}` : ""}${codigoPostal ? `, CP ${codigoPostal}` : ""}, ${selectedMunicipio}`;

    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sanitizeInput(nombre),
          whatsapp: cleanTel,
          direccion: dirCompleta,
          calleNumero: sanitizeInput(direccion),
          codigo_postal: codigoPostal,
          colonia,
          municipio: selectedMunicipio,
          mascotas: true,
          fecha: fecha || getTomorrowDate(),
          turno: turno || "Matutino (09:00 - 13:00)",
          items_contratados: items,
          notas_servicio: "Solicitud registrada a través de Kanan asistente",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo registrar la solicitud");
      }

      const folio = data.cita?.id || `KAN-${Date.now().toString().slice(-4)}`;
      const waUrl = data.whatsappUrl || `https://wa.me/523343359207?text=${encodeURIComponent(`Hola Kanan Limpieza, registré mi solicitud con folio ${folio}.`)}`;

      setBookingResult({ folio, whatsappUrl: waUrl });
      setIsTyping(false);
      setStep("finished");

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-done-${Date.now()}`,
          sender: "agent",
          text: `🎉 ¡Excelente, ${nombre.split(" ")[0]}! Tu solicitud ha sido registrada.\n\n📋 *Folio de Servicio:* **${folio}**\n🛋️ *Pieza:* ${items[0].cantidad}x ${items[0].piezaNombre}\n📅 *Fecha tentativa:* ${fecha}\n\nNuestro administrador ya recibió tus datos en el panel y en breve te enviará tu cotización formal por WhatsApp. ✨`,
          time: getCurrentTime(),
        },
      ]);
    } catch (err: any) {
      setIsTyping(false);
      appendAgentMessage(
        "Tuvimos un detalle de conexión, pero no te preocupes. Haz clic en el botón de abajo para conectarte directo con nuestro equipo por WhatsApp.",
        "finished"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setStep("ask_category");
    setSelectedPiece(null);
    setCodigoPostal("");
    setDireccion("");
    setNombre("");
    setWhatsapp("");
    setBookingResult(null);

    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          id: "m-reset-1",
          sender: "agent",
          text: "¡Hola de nuevo! 👋 Soy Kanan asistente.",
          time: getCurrentTime(),
        },
        {
          id: "m-reset-2",
          sender: "agent",
          text: "¿Qué muebles o piezas te gustaría que consintamos hoy?",
          time: getCurrentTime(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <section id="agendar" className="py-8 sm:py-16 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Ventana de Conversación estilo Mensajería Limpia */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_-10px_rgba(15,36,56,0.12)] overflow-hidden flex flex-col">
          
          {/* Header de la Conversación */}
          <div className="bg-white border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/assets/brand/kanan-dog.png"
                  alt="Kanan asistente"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-cyan-200 shadow-sm bg-cyan-50"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/30" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Kanan asistente
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">en línea</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetConversation}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Globos de Conversación */}
          <div className="p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[520px] overflow-y-auto bg-[#F7F9FB]">
            {messages.map((m) => {
              const isAgent = m.sender === "agent";

              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2.5 ${isAgent ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                >
                  {isAgent && (
                    <img
                      src="/assets/brand/kanan-dog.png"
                      alt="Kanan"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-cyan-200 bg-cyan-50"
                    />
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAgent
                        ? "bg-white text-slate-800 rounded-bl-xs border border-slate-200/80"
                        : "bg-gradient-to-r from-kanan-cyan to-kanan-cerulean text-white rounded-br-xs font-medium shadow-cyan-glow/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span
                      className={`block text-[10px] text-right mt-1 font-sans ${
                        isAgent ? "text-slate-400" : "text-white/80"
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Indicador de "Escribiendo..." */}
            {isTyping && (
              <div className="flex items-center gap-2.5 justify-start animate-in fade-in">
                <img
                  src="/assets/brand/kanan-dog.png"
                  alt="Kanan"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-cyan-200 bg-cyan-50"
                />
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Área Interactiva de Respuesta (Opciones Rápidas / Input) */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100 space-y-3">
            
            {/* 1. Chips de Categorías */}
            {step === "ask_category" && !isTyping && (
              <div className="flex flex-wrap gap-2 animate-in fade-in">
                {CATEGORIAS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id, c.label)}
                    className="px-3.5 py-2 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* 2. Chips de Piezas Específicas */}
            {step === "ask_piece" && !isTyping && (
              <div className="flex flex-wrap gap-2 animate-in fade-in">
                {PIEZAS_CATALOGO.filter((p) => p.categoriaId === selectedCat).map((piece) => (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => handleSelectPiece(piece)}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 border border-slate-200 hover:border-cyan-300 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs"
                  >
                    + {piece.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* 3. Input de Código Postal */}
            {step === "ask_cp" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCp(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  maxLength={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe tu Código Postal (ej. 45010)"
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={inputText.replace(/\D/g, "").length < 5}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 4. Input de Dirección (Calle y Número) */}
            {step === "ask_address" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitAddress(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Calle, número exterior y coto..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 5. Selector de Fecha y Turno */}
            {step === "ask_date" && !isTyping && (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={fecha || getTomorrowDate()}
                    onChange={(e) => setFecha(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmitDateTurno(fecha || getTomorrowDate(), "Mañana (09:00 - 13:00)")}
                    className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs font-bold transition shadow-xs"
                  >
                    ☀️ Mañana (9-13h)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitDateTurno(fecha || getTomorrowDate(), "Tarde (14:00 - 18:00)")}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-xs"
                  >
                    🌤️ Tarde (14-18h)
                  </button>
                </div>
              </div>
            )}

            {/* 6. Input de Nombre */}
            {step === "ask_name" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitName(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe tu Nombre Completo..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 7. Input de WhatsApp */}
            {step === "ask_phone" && !isTyping && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitPhone(inputText);
                }}
                className="flex items-center gap-2 animate-in fade-in"
              >
                <input
                  type="tel"
                  maxLength={10}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="WhatsApp a 10 dígitos (ej. 3312345678)"
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submitting || inputText.replace(/\D/g, "").length < 10}
                  className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white transition active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 8. Botón Directo a WhatsApp si ya terminó */}
            {step === "finished" && bookingResult && (
              <div className="pt-1 animate-in fade-in">
                <a
                  href={bookingResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat de WhatsApp con Folio {bookingResult.folio}</span>
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
