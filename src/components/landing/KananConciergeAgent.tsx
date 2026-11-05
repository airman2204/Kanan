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
  descripcion: string;
  categoriaId: string;
  categoriaNombre: string;
}

const PIEZAS_CATALOGO: CatalogPiece[] = [
  // Salas
  { id: "sala-l", nombre: "Sala en L / Seccional", descripcion: "Inyección-succión profunda y desinfección", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sala-321", nombre: "Sala Tradicional (3-2-1)", descripcion: "Juego completo de 3 piezas", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "loveseat-sofa", nombre: "Sofá 2 o 3 Plazas / Sofá Cama", descripcion: "Limpieza y remoción de olores", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "sillon-individual", nombre: "Sillón Individual / Reclinable", descripcion: "Desmanchado textil profundo", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  { id: "silla-comedor", nombre: "Sillas de Comedor (por pieza)", descripcion: "Asiento y respaldo tapizados", categoriaId: "salas", categoriaNombre: "Salas y Sillas" },
  // Tapetes
  { id: "tapete-chico", nombre: "Tapete Chico (hasta 1.5x1m)", descripcion: "Recolección y entrega a domicilio", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-mediano", nombre: "Tapete Mediano (hasta 2x1.5m)", descripcion: "Despolvado mecánico e inmersión", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  { id: "tapete-grande", nombre: "Tapete Grande (hasta 3x2m)", descripcion: "Tratamiento bactericida y secado", categoriaId: "tapetes", categoriaNombre: "Tapetes" },
  // Colchones
  { id: "colchon-ind", nombre: "Colchón Individual", descripcion: "Eliminación de ácaros y alérgenos", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-mat", nombre: "Colchón Matrimonial", descripcion: "Sanitización profunda en seco/húmedo", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-queen", nombre: "Colchón Queen Size", descripcion: "Extracción profunda de humedad y polvo", categoriaId: "colchones", categoriaNombre: "Colchones" },
  { id: "colchon-king", nombre: "Colchón King Size", descripcion: "Doble cara con desinfección total", categoriaId: "colchones", categoriaNombre: "Colchones" },
  // Autos
  { id: "auto-sedan", nombre: "Auto Sedán / Hatchback", descripcion: "Asientos, alfombra y cajuela", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-suv", nombre: "SUV / Camioneta (2 Filas)", descripcion: "Limpieza de tapicería y cielo", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
  { id: "auto-3filas", nombre: "Camioneta Familiar (3 Filas)", descripcion: "Sanitización de cabina completa", categoriaId: "autos", categoriaNombre: "Vestiduras de Autos" },
];

const CATEGORIAS = [
  { id: "salas", label: "🛋️ Salas y Sofás", icon: "🛋️" },
  { id: "tapetes", label: "✨ Tapetes", icon: "✨" },
  { id: "colchones", label: "🛏️ Colchones", icon: "🛏️" },
  { id: "autos", label: "🚗 Autos", icon: "🚗" },
];

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text?: string;
  component?: "categories" | "pieces" | "location" | "datetime" | "contact" | "summary" | "confirmed";
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
  // Carrito limpio estricto (cero piezas default)
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeCat, setActiveCat] = useState<string>("salas");

  // Ubicación
  const [codigoPostal, setCodigoPostal] = useState("");
  const [colonia, setColonia] = useState("");
  const [coloniasDisponibles, setColoniasDisponibles] = useState<string[]>([]);
  const [calleNumero, setCalleNumero] = useState("");
  const [cpValido, setCpValido] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);

  // Fecha y Turno (México GMT-6)
  const getTomorrow = () => {
    const now = new Date();
    const tzOffsetMs = -6 * 60 * 60 * 1000;
    const mxNow = new Date(now.getTime() + tzOffsetMs + now.getTimezoneOffset() * 60000);
    const tom = new Date(mxNow.getTime() + 86400000);
    return tom.toISOString().split("T")[0];
  };

  const [fecha, setFecha] = useState(getTomorrow());
  const [turno, setTurno] = useState<TurnoServicio>("Matutino (09:00 - 13:00)");

  // Datos Cliente
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mascotas, setMascotas] = useState(true);
  const [notas, setNotas] = useState("");

  // Estado del flujo conversacional
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<"pieces" | "location" | "datetime" | "contact" | "completed">("pieces");
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ folio: string; whatsappUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };

  // Mensaje de bienvenida inicial
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: "msg-welcome-1",
        sender: "agent",
        text: `¡Hola! 👋 Soy Kanan Concierge, tu asistente especializado de Kanan Servicios de Limpieza.`,
        time: getCurrentTime(),
      },
      {
        id: "msg-welcome-2",
        sender: "agent",
        text: `Con gusto preparo tu cotización formal y reservo el turno del Kanan Móvil a tu domicilio. 🐾✨\n\n¿Qué piezas o muebles te gustaría que limpiemos y desinfectemos hoy?`,
        component: "pieces",
        time: getCurrentTime(),
      },
    ];
    setMessages(initialMessages);

    if (preselectedCategory) {
      setActiveCat(preselectedCategory);
    }
  }, [preselectedCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep, quantities]);

  // Manejar cantidades de piezas
  const updatePieceQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[id];
      } else {
        copy[id] = next;
      }
      return copy;
    });
  };

  const selectedItems: ItemContratado[] = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const pieza = PIEZAS_CATALOGO.find((p) => p.id === id);
      return {
        categoriaId: pieza?.categoriaId || "varios",
        categoriaNombre: pieza?.categoriaNombre || "Servicio",
        piezaId: id,
        piezaNombre: pieza?.nombre || id,
        cantidad: qty,
      };
    });

  const totalPiezasCount = selectedItems.reduce((acc, i) => acc + i.cantidad, 0);

  // Paso 1 completado -> Pasar a Ubicación
  const handleConfirmPieces = () => {
    if (selectedItems.length === 0) return;

    const piezasTexto = selectedItems.map((i) => `${i.cantidad}x ${i.piezaNombre}`).join(", ");
    
    setMessages((prev) => [
      ...prev,
      {
        id: `user-pieces-${Date.now()}`,
        sender: "user",
        text: `Deseo cotizar: ${piezasTexto}`,
        time: getCurrentTime(),
      },
      {
        id: `agent-loc-${Date.now()}`,
        sender: "agent",
        text: `¡Excelente elección! 🧼 Dejaremos tus muebles relucientes.\n\nAhora, para asignarte la ruta técnica más rápida en la Zona Metropolitana de Guadalajara, ¿cuál es tu Código Postal y dirección?`,
        component: "location",
        time: getCurrentTime(),
      },
    ]);
    setCurrentStep("location");
  };

  // Buscar CP
  const handleCpChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 5);
    setCodigoPostal(clean);
    setCpError(null);

    if (clean.length === 5) {
      const res = consultarCodigoPostal(clean);
      if (res.valido && res.municipio) {
        setCpValido(true);
        onSelectMunicipio(res.municipio);
        setColoniasDisponibles(res.colonias || []);
        if (res.colonias && res.colonias.length > 0) {
          setColonia(res.colonias[0]);
        }
      } else {
        setCpValido(false);
        setCpError("Código Postal fuera de cobertura ZMG (Guadalajara, Zapopan, Tlajomulco o Tlaquepaque).");
      }
    } else {
      setCpValido(false);
    }
  };

  // Paso 2 completado -> Pasar a Fecha y Horario
  const handleConfirmLocation = () => {
    if (!cpValido) {
      setCpError("Ingresa un Código Postal válido.");
      return;
    }
    const valDir = validarDireccion(calleNumero);
    if (!valDir.valida) {
      setCpError(valDir.error || "Dirección incompleta");
      return;
    }

    const dirResumen = `${calleNumero}, Col. ${colonia || "S/N"}, CP ${codigoPostal}, ${selectedMunicipio}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-loc-${Date.now()}`,
        sender: "user",
        text: `Mi dirección es: ${dirResumen}`,
        time: getCurrentTime(),
      },
      {
        id: `agent-date-${Date.now()}`,
        sender: "agent",
        text: `¡Perfecto! Tenemos cobertura con Kanan Móvil en ${selectedMunicipio}. 🚐💨\n\n¿Qué día y turno te viene mejor para recibir a nuestro equipo? (Recuerda que con inyección-succión secan en solo 3 a 4 horas).`,
        component: "datetime",
        time: getCurrentTime(),
      },
    ]);
    setCurrentStep("datetime");
  };

  // Paso 3 completado -> Pasar a Contacto
  const handleConfirmDateTime = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-date-${Date.now()}`,
        sender: "user",
        text: `Para el ${fecha} en horario ${turno}`,
        time: getCurrentTime(),
      },
      {
        id: `agent-contact-${Date.now()}`,
        sender: "agent",
        text: `¡Casi listo! 🎉 Para generar tu folio y enviarte la cotización formal por WhatsApp, ¿a nombre de quién registramos el servicio y cuál es tu WhatsApp a 10 dígitos?`,
        component: "contact",
        time: getCurrentTime(),
      },
    ]);
    setCurrentStep("contact");
  };

  // Paso 4: Envío y Registro en CRM
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valNom = validarNombre(nombre);
    if (!valNom.valida) {
      alert(valNom.error || "Nombre no válido");
      return;
    }
    const valTel = validarWhatsApp(whatsapp);
    if (!valTel.valida) {
      alert(valTel.error || "Ingresa tu WhatsApp a 10 dígitos");
      return;
    }

    setSubmitting(true);
    const fullDir = `${calleNumero}, Col. ${colonia}, CP ${codigoPostal}, ${selectedMunicipio}`;

    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sanitizeInput(nombre),
          whatsapp: whatsapp.replace(/\D/g, ""),
          direccion: fullDir,
          calleNumero: sanitizeInput(calleNumero),
          codigo_postal: codigoPostal,
          colonia,
          municipio: selectedMunicipio,
          mascotas,
          fecha,
          turno,
          items_contratados: selectedItems,
          notas_servicio: sanitizeInput(notas || "Solicitud vía Kanan Concierge"),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al registrar cita");
      }

      const folio = data.cita?.id || `KAN-${Date.now().toString().slice(-4)}`;
      const waUrl = data.whatsappUrl || `https://wa.me/523343359207?text=${encodeURIComponent(`Hola Kanan Limpieza, registré mi solicitud con folio ${folio}.`)}`;

      setBookingResult({ folio, whatsappUrl: waUrl });
      setCurrentStep("completed");

      setMessages((prev) => [
        ...prev,
        {
          id: `user-contact-${Date.now()}`,
          sender: "user",
          text: `Mi nombre es ${nombre} y mi WhatsApp es ${whatsapp}.`,
          time: getCurrentTime(),
        },
        {
          id: `agent-done-${Date.now()}`,
          sender: "agent",
          text: `🎉 ¡Solicitud recibida con éxito!\n\n📋 **Tu Folio de Servicio es:** *${folio}*\n\nNuestro administrador ya recibió tus datos en el panel y en menos de 5 minutos te enviará tu cotización formal a tu WhatsApp (${whatsapp}).\n\n¿Quieres abrir la conversación de WhatsApp ahora mismo?`,
          component: "confirmed",
          time: getCurrentTime(),
        },
      ]);
    } catch (err: any) {
      alert(err.message || "Error de conexión al enviar la cita");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetChat = () => {
    setQuantities({});
    setBookingResult(null);
    setCurrentStep("pieces");
    setNombre("");
    setWhatsapp("");
    setCodigoPostal("");
    setCalleNumero("");
    setMessages([
      {
        id: "msg-welcome-restart",
        sender: "agent",
        text: `¡Hola de nuevo! 🐾 Empecemos una nueva cotización. ¿Qué muebles deseas limpiar?`,
        component: "pieces",
        time: getCurrentTime(),
      },
    ]);
  };

  return (
    <section id="agendar" className="py-12 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Cabecera del Agente */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Kanan Concierge • Asistente Inteligente de Citas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cotiza y Agenda tu Servicio a Domicilio
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Conversa con nuestro asistente. Te guía en 1 minuto, sin precios sorpresa ni servicios duplicados.
          </p>
        </div>

        {/* Ventana de Chat del Agente Especializado */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Header del Chat */}
          <div className="bg-slate-950/90 border-b border-slate-800 p-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  🐾
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Kanan Concierge
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
                    OFICIAL
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Atención personalizada • Respuesta instantánea</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition flex items-center gap-1.5"
              title="Reiniciar cotización limpia"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="p-4 sm:p-6 space-y-5 min-h-[420px] max-h-[620px] overflow-y-auto bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]">
            {messages.map((msg) => {
              const isAgent = msg.sender === "agent";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? "items-start" : "items-end"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isAgent
                        ? "bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/80"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* COMPONENTES INTERACTIVOS INCRUSTADOS EN EL CHAT */}

                    {/* 1. SELECCIÓN DE PIEZAS (CERO DEFAULT) */}
                    {msg.component === "pieces" && currentStep === "pieces" && (
                      <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-4">
                        {/* Selector de Categorías */}
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORIAS.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveCat(cat.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                activeCat === cat.id
                                  ? "bg-cyan-500 text-slate-950 shadow-md"
                                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-700"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Piezas Disponibles */}
                        <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                          {PIEZAS_CATALOGO.filter((p) => p.categoriaId === activeCat).map((pieza) => {
                            const qty = quantities[pieza.id] || 0;
                            return (
                              <div
                                key={pieza.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                              >
                                <div className="pr-2">
                                  <p className="text-xs font-bold text-white">{pieza.nombre}</p>
                                  <p className="text-[11px] text-slate-400">{pieza.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updatePieceQuantity(pieza.id, -1)}
                                    disabled={qty === 0}
                                    className="w-7 h-7 rounded-lg bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 flex items-center justify-center text-xs font-bold"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold font-mono text-cyan-300">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updatePieceQuantity(pieza.id, 1)}
                                    className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Botón de Confirmación de Piezas */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-400">
                            Piezas seleccionadas: <strong className="text-cyan-400">{totalPiezasCount}</strong>
                          </span>
                          <button
                            type="button"
                            disabled={selectedItems.length === 0}
                            onClick={handleConfirmPieces}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
                          >
                            <span>Continuar con mi selección ({totalPiezasCount})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. UBICACIÓN Y DIRECCIÓN */}
                    {msg.component === "location" && currentStep === "location" && (
                      <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Código Postal (ZMG):
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              value={codigoPostal}
                              onChange={(e) => handleCpChange(e.target.value)}
                              placeholder="Ej. 45010"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          {coloniasDisponibles.length > 0 && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                                Colonia:
                              </label>
                              <select
                                value={colonia}
                                onChange={(e) => setColonia(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                              >
                                {coloniasDisponibles.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Calle, Número Exterior e Interior / Coto:
                          </label>
                          <input
                            type="text"
                            value={calleNumero}
                            onChange={(e) => setCalleNumero(e.target.value)}
                            placeholder="Ej. Av. Vallarta 1234, Coto Fresno Casa 12"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {cpError && (
                          <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                            ⚠️ {cpError}
                          </p>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={!cpValido || !calleNumero.trim()}
                            onClick={handleConfirmLocation}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
                          >
                            <span>Confirmar Dirección</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. FECHA Y TURNO */}
                    {msg.component === "datetime" && currentStep === "datetime" && (
                      <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Fecha sugerida:
                            </label>
                            <input
                              type="date"
                              value={fecha}
                              min={getTomorrow()}
                              onChange={(e) => setFecha(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Turno preferido:
                            </label>
                            <select
                              value={turno}
                              onChange={(e) => setTurno(e.target.value as TurnoServicio)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                            >
                              <option value="Matutino (09:00 - 13:00)">Mañana (09:00 - 13:00 hrs)</option>
                              <option value="Vespertino (14:00 - 18:00)">Tarde (14:00 - 18:00 hrs)</option>
                              <option value="Lunes a Domingo (09:00 - 16:00)">Turno Abierto (09:00 - 16:00 hrs)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleConfirmDateTime}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
                          >
                            <span>Confirmar Horario</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. DATOS DE CONTACTO (WHATSAPP + NOMBRE) */}
                    {msg.component === "contact" && currentStep === "contact" && (
                      <form onSubmit={handleFinalSubmit} className="mt-4 pt-3 border-t border-slate-700/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Tu Nombre Completo:
                            </label>
                            <input
                              type="text"
                              required
                              value={nombre}
                              onChange={(e) => setNombre(e.target.value)}
                              placeholder="Ej. Mario González"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              WhatsApp (10 dígitos):
                            </label>
                            <input
                              type="tel"
                              required
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              placeholder="Ej. 3312345678"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="pet-friendly-check"
                            checked={mascotas}
                            onChange={(e) => setMascotas(e.target.checked)}
                            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                          />
                          <label htmlFor="pet-friendly-check" className="text-xs text-slate-300 cursor-pointer">
                            🐶 ¿Tienes mascotas en casa? (Aplicaremos sanitización bactericida pet-friendly)
                          </label>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-lg flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <span>Registrando solicitud...</span>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Enviar y Recibir Cotización en WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* 5. CITA CONFIRMADA */}
                    {msg.component === "confirmed" && bookingResult && (
                      <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-3">
                        <a
                          href={bookingResult.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-98"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Abrir Chat de WhatsApp Directo con Folio {bookingResult.folio}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                    {msg.time}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer del Asistente */}
          <div className="bg-slate-950 p-3 sm:px-6 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía 100% Kanan • Secado rápido en 3-4 horas</span>
            </span>
            <span className="text-slate-500 font-mono">
              Atención en ZMG (Guadalajara, Zapopan, Tlajomulco, Tlaquepaque)
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
