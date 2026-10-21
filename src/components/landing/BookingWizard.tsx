"use client";

import React, { useState, useEffect } from "react";
import {
  Sofa,
  BedDouble,
  CarFront,
  Sparkles,
  Plus,
  Minus,
  MapPin,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  PawPrint,
  MessageCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import {
  MunicipioZMG,
  TurnoServicio,
  ItemContratado,
} from "@/types/crm";

interface CatalogPiece {
  id: string;
  nombre: string;
  descripcion: string;
}

interface CatalogCategory {
  id: string;
  nombre: string;
  icon: React.ElementType;
  piezas: CatalogPiece[];
}

const CATALOGO_KANAN: CatalogCategory[] = [
  {
    id: "salas",
    nombre: "Salas y Sillas",
    icon: Sofa,
    piezas: [
      {
        id: "sala-l",
        nombre: "Sala en L / Seccional",
        descripcion: "Aspirado profundo, desmanchado e inyección-succión",
      },
      {
        id: "sala-321",
        nombre: "Sala Tradicional (3-2-1 piezas)",
        descripcion: "Juego completo de 3 piezas tapizadas",
      },
      {
        id: "loveseat-sofa",
        nombre: "Sofá de 2 o 3 Plazas / Sofá Cama",
        descripcion: "Limpieza y desinfección individual",
      },
      {
        id: "sillon-individual",
        nombre: "Sillón Individual / Reclinable / Reposet",
        descripcion: "Desmanchado textil y eliminación de olores",
      },
      {
        id: "silla-comedor",
        nombre: "Sillas de Comedor Tapizadas (por pieza)",
        descripcion: "Asiento y respaldo desinfectados",
      },
    ],
  },
  {
    id: "colchones",
    nombre: "Colchones",
    icon: BedDouble,
    piezas: [
      {
        id: "colchon-individual",
        nombre: "Colchón Individual / Infantil",
        descripcion: "Eliminación de ácaros, polvo y manchas",
      },
      {
        id: "colchon-matrimonial",
        nombre: "Colchón Matrimonial",
        descripcion: "Desinfección profunda por ambos lados",
      },
      {
        id: "colchon-queen",
        nombre: "Colchón Queen Size",
        descripcion: "Lavado con cepillos suaves y secado en 3-4h",
      },
      {
        id: "colchon-king",
        nombre: "Colchón King Size",
        descripcion: "Sanitización anti-alérgenos de máxima cobertura",
      },
    ],
  },
  {
    id: "vestiduras",
    nombre: "Vestiduras de Autos",
    icon: CarFront,
    piezas: [
      {
        id: "auto-sedan",
        nombre: "Auto Sedán / Hatchback (5 asientos)",
        descripcion: "Asientos, cabeceras, alfombra, tapetes y cajuela",
      },
      {
        id: "auto-suv",
        nombre: "Camioneta SUV (5 pasajeros)",
        descripcion: "Limpieza integral de vestiduras, alfombra y cajuela",
      },
      {
        id: "auto-familiar",
        nombre: "Camioneta 3 Filas (7 pasajeros) / Pick-up",
        descripcion: "Servicio completo de cabina y cajuela",
      },
    ],
  },
  {
    id: "tapetes",
    nombre: "Tapetes (Recolección a Domicilio)",
    icon: Sparkles,
    piezas: [
      {
        id: "tapete-chico",
        nombre: "Tapete Mediano / Estándar (hasta 2x1.5m)",
        descripcion: "Recolección y entrega en 3 días hábiles",
      },
      {
        id: "tapete-grande",
        nombre: "Tapete Grande / Sala (más de 2x1.5m)",
        descripcion: "Lavado profundo y entrega en 3 días hábiles",
      },
    ],
  },
];

const KANAN_DOG_TIPS: Record<number, { title: string; tip: string }> = {
  1: {
    title: "Paso 1 de 4: ¡Hola! Soy Kanan Dog 🐾",
    tip: "Selecciona los muebles, colchones o vestiduras que deseas limpiar y desinfectar. ¡No te preocupes por el precio ahora! Al final te daremos atención y cotización exacta.",
  },
  2: {
    title: "Paso 2 de 4: Tu ubicación y fotos opcionales 📷",
    tip: "Indícanos en qué municipio de la ZMG estás y, si gustas, sube una foto del estado actual de tus muebles para preparar el equipo ideal.",
  },
  3: {
    title: "Paso 3 de 4: Elige tu fecha y turno ideal ⏰",
    tip: "Recuerda que nuestro proceso de inyección-succión permite un secado rápido en solo 3 a 4 horas.",
  },
  4: {
    title: "Paso 4 de 4: Confirmación y Sello Pet-Friendly ✅",
    tip: "Revisa tu resumen. Al confirmar, registraremos tu cita en nuestro sistema y te conectaremos directo por WhatsApp con tu folio.",
  },
};

interface BookingWizardProps {
  selectedMunicipio: MunicipioZMG;
  onSelectMunicipio: (m: MunicipioZMG) => void;
  preselectedCategory: string | null;
}

export function BookingWizard({
  selectedMunicipio,
  onSelectMunicipio,
  preselectedCategory,
}: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeCategory, setActiveCategory] = useState<string>("salas");
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "sala-l": 1,
  });

  // Paso 2: Ubicación y Fotos
  const [direccion, setDireccion] = useState("");
  const [notasServicio, setNotasServicio] = useState("");
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);

  // Paso 3: Fecha y Turno
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [fecha, setFecha] = useState<string>(tomorrowStr);
  const [turno, setTurno] = useState<TurnoServicio>("Matutino (09:00 - 13:00)");

  // Paso 4: Datos del Cliente
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mascotas, setMascotas] = useState<boolean>(true);

  // Estado de envío
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    folio: string;
    whatsappUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedCategory) {
      setActiveCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  const updatePieceQuantity = (piezaId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[piezaId] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[piezaId];
      } else {
        copy[piezaId] = next;
      }
      return copy;
    });
  };

  // Construir arreglo de items seleccionados
  const selectedItems: ItemContratado[] = [];
  for (const cat of CATALOGO_KANAN) {
    for (const pieza of cat.piezas) {
      const qty = quantities[pieza.id] || 0;
      if (qty > 0) {
        selectedItems.push({
          categoriaId: cat.id,
          categoriaNombre: cat.nombre,
          piezaId: pieza.id,
          piezaNombre: pieza.nombre,
          cantidad: qty,
        });
      }
    }
  }

  const totalPiezasCount = selectedItems.reduce((acc, i) => acc + i.cantidad, 0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files)
      .slice(0, 3)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setFotosPreview((prev) => [...prev.slice(0, 2), reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedItems.length === 0) {
      setErrorMsg("Selecciona al menos una pieza para limpiar en el Paso 1.");
      setStep(1);
      return;
    }
    if (!nombre.trim() || whatsapp.replace(/\D/g, "").length < 8) {
      setErrorMsg("Por favor ingresa tu nombre y un número de WhatsApp válido (10 dígitos).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          whatsapp,
          direccion: direccion.trim() || `Domicilio en ${selectedMunicipio}`,
          municipio: selectedMunicipio,
          mascotas,
          fecha,
          turno,
          items_contratados: selectedItems,
          notas_servicio: notasServicio,
          fotos_estado_actual: fotosPreview,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo registrar la cita");
      }

      setBookingResult({
        folio: data.cita.id,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const dogGuide = KANAN_DOG_TIPS[step];

  return (
    <section
      id="agendar"
      className="py-14 sm:py-20 bg-gradient-to-b from-kanan-ice to-white border-t border-slate-200/70"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-kanan-navy text-kanan-cyan font-heading font-bold text-xs uppercase tracking-wider">
            <PawPrint className="w-3.5 h-3.5" />
            Asistente Guiado por Kanan Dog
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-kanan-deep mt-3">
            Agenda tu Servicio en 4 Pasos Simples
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Selecciona tus muebles, ubicación y horario. Sin cobros por adelantado: confirmamos tu
            cita y cotización personalizada directamente por WhatsApp.
          </p>
        </div>

        {/* Tarjeta Principal del Wizard */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-kanan-lg overflow-hidden">
          {/* Barra Superior del Wizard: Guía Visual Kanan Dog (Manual Pág. 3) */}
          <div className="bg-kanan-deep text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 border-b border-white/10">
            <div className="relative shrink-0">
              <img
                src="/assets/brand/kanan-dog.png"
                alt="Técnico Especialista Kanan Dog"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white rounded-2xl p-1.5 border-2 border-kanan-cyan shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-kanan-cyan text-white text-[10px] font-heading font-bold px-2 py-0.5 rounded-full shadow">
                OK ✓
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-kanan-cyan">
                {dogGuide.title}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                &ldquo;{dogGuide.tip}&rdquo;
              </p>

              {/* Stepper de 4 Pasos */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { num: 1, label: "1. Muebles" },
                  { num: 2, label: "2. Ubicación" },
                  { num: 3, label: "3. Horario" },
                  { num: 4, label: "4. Confirmar" },
                ].map((item) => {
                  const isCurrent = step === item.num;
                  const isDone = step > item.num || Boolean(bookingResult);
                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => !bookingResult && setStep(item.num as 1 | 2 | 3 | 4)}
                      className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs font-heading font-bold transition-all flex items-center justify-center gap-1 ${
                        isCurrent
                          ? "bg-kanan-cyan text-white shadow-sm"
                          : isDone
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-white/10 text-slate-300 hover:bg-white/15"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contenido Dinámico del Wizard */}
          <div className="p-4 sm:p-8">
            {errorMsg && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {bookingResult ? (
              /* Vista de Éxito tras Confirmar Reserva */
              <div className="py-6 text-center max-w-xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-11 h-11" />
                </div>

                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-kanan-ice border border-slate-200 text-kanan-navy font-heading font-bold text-xs uppercase tracking-wider">
                    Folio Registrado en CRM: {bookingResult.folio}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-kanan-deep mt-3">
                    ¡Solicitud Lista, {nombre}! 🐾
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base mt-2">
                    Tu cita para el <strong>{fecha}</strong> ({turno}) en{" "}
                    <strong>{selectedMunicipio}</strong> ya quedó guardada en nuestro Panel
                    Operativo CRM y activó la secuencia de atención Kanan.
                  </p>
                </div>

                <div className="bg-kanan-ice rounded-2xl p-4 text-left border border-slate-200 space-y-2 text-xs sm:text-sm">
                  <p className="font-heading font-bold text-kanan-deep">
                    Piezas registradas ({totalPiezasCount}):
                  </p>
                  <ul className="space-y-1 text-slate-700">
                    {selectedItems.map((it) => (
                      <li key={it.piezaId}>
                        • <strong>{it.cantidad}x</strong> {it.piezaNombre} ({it.categoriaNombre})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href={bookingResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-heading font-bold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Enviar Resumen por WhatsApp y Recibir Cotización</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingResult(null);
                      setStep(1);
                    }}
                    className="inline-flex items-center justify-center px-5 py-4 rounded-2xl bg-kanan-ice hover:bg-slate-200 text-kanan-deep font-semibold text-sm transition-colors"
                  >
                    Agendar otro servicio
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* PASO 1: SELECCIÓN DE SERVICIOS Y PIEZAS (SIN PRECIOS) */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Pestañas de Categoría */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATALOGO_KANAN.map((cat) => {
                        const Icon = cat.icon;
                        const active = activeCategory === cat.id;
                        const countInCat = cat.piezas.reduce(
                          (acc, p) => acc + (quantities[p.id] || 0),
                          0
                        );
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                              active
                                ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                                : "bg-kanan-ice text-kanan-deep border-slate-200 hover:bg-slate-200/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  active ? "text-kanan-cyan" : "text-kanan-cerulean"
                                }`}
                              />
                              <span className="font-heading font-bold text-xs sm:text-sm truncate">
                                {cat.nombre.split(" ")[0]}
                              </span>
                            </div>
                            {countInCat > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-kanan-cyan text-white shrink-0">
                                {countInCat}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lista de Piezas de la Categoría Activa */}
                    <div className="space-y-3">
                      {CATALOGO_KANAN.find((c) => c.id === activeCategory)?.piezas.map((pieza) => {
                        const qty = quantities[pieza.id] || 0;
                        return (
                          <div
                            key={pieza.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              qty > 0
                                ? "bg-kanan-cyan/5 border-kanan-cyan shadow-sm"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="font-heading font-bold text-sm sm:text-base text-kanan-deep">
                                {pieza.nombre}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">{pieza.descripcion}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => updatePieceQuantity(pieza.id, -1)}
                                disabled={qty === 0}
                                aria-label={`Disminuir ${pieza.nombre}`}
                                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-kanan-deep disabled:opacity-30 hover:bg-kanan-ice active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-7 text-center font-heading font-extrabold text-sm sm:text-base text-kanan-deep">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updatePieceQuantity(pieza.id, 1)}
                                aria-label={`Agregar ${pieza.nombre}`}
                                className="w-9 h-9 rounded-xl bg-kanan-cyan text-white flex items-center justify-center shadow-sm hover:bg-[#009ec0] active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen de piezas seleccionadas en Paso 1 */}
                    <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-kanan-cerulean">
                          Piezas Seleccionadas ({totalPiezasCount})
                        </p>
                        {selectedItems.length === 0 ? (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Usa el botón (+) para agregar las piezas que deseas limpiar.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {selectedItems.map((item) => (
                              <span
                                key={item.piezaId}
                                className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-xs font-semibold text-kanan-deep"
                              >
                                {item.cantidad}x {item.piezaNombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={selectedItems.length === 0}
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-kanan-cyan disabled:bg-slate-300 text-white font-heading font-bold text-sm px-6 py-3.5 rounded-2xl shadow-cyan-glow transition-all"
                      >
                        <span>Continuar a Ubicación</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 2: UBICACIÓN Y CARGA OPCIONAL DE FOTOS DEL ESTADO ACTUAL */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block font-heading font-bold text-sm text-kanan-deep mb-2">
                        1. Selecciona tu Municipio en la ZMG
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(
                          [
                            "Guadalajara",
                            "Zapopan",
                            "Tlajomulco",
                            "Tlaquepaque",
                          ] as MunicipioZMG[]
                        ).map((mun) => {
                          const active = selectedMunicipio === mun;
                          return (
                            <button
                              key={mun}
                              type="button"
                              onClick={() => onSelectMunicipio(mun)}
                              className={`py-3 px-3 rounded-2xl border font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                                active
                                  ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                                  : "bg-kanan-ice text-kanan-deep border-slate-200 hover:bg-slate-200/70"
                              }`}
                            >
                              <MapPin className="w-4 h-4 text-kanan-cyan shrink-0" />
                              <span>{mun}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="wizard-direccion"
                          className="block font-heading font-bold text-sm text-kanan-deep mb-1.5"
                        >
                          2. Colonia y Calle / Coto
                        </label>
                        <input
                          id="wizard-direccion"
                          type="text"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          placeholder={`Ej. Col. Providencia / Av. Patria, ${selectedMunicipio}`}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="wizard-notas"
                          className="block font-heading font-bold text-sm text-kanan-deep mb-1.5"
                        >
                          3. Detalles de manchas o tela (Opcional)
                        </label>
                        <input
                          id="wizard-notas"
                          type="text"
                          value={notasServicio}
                          onChange={(e) => setNotasServicio(e.target.value)}
                          placeholder="Ej. Sala color beige, manchas de mascota o café"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                        />
                      </div>
                    </div>

                    {/* Carga Opcional de Fotos del Estado Actual */}
                    <div className="bg-kanan-ice rounded-2xl p-4 sm:p-5 border border-dashed border-kanan-cerulean/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-kanan-cyan/15 text-kanan-cerulean flex items-center justify-center shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-sm text-kanan-deep">
                              Carga Opcional de Fotos del Estado Actual
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Sube hasta 3 fotos desde tu celular para que el técnico prepare los
                              desmanchadores específicos para tu tela.
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-kanan-navy border border-slate-300 font-heading font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0">
                          <Camera className="w-4 h-4 text-kanan-cyan" />
                          <span>Tomar / Subir Fotos</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {fotosPreview.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-200">
                          {fotosPreview.map((src, idx) => (
                            <div
                              key={idx}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white"
                            >
                              <img
                                src={src}
                                alt={`Foto estado actual ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setFotosPreview((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow"
                                aria-label="Eliminar foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-kanan-ice text-kanan-deep font-semibold text-sm hover:bg-slate-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-sm px-6 py-3.5 rounded-2xl shadow-cyan-glow"
                      >
                        <span>Elegir Fecha y Turno</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: SELECCIÓN DE FECHA Y TURNO EN TIEMPO REAL */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="wizard-fecha"
                          className="block font-heading font-bold text-sm text-kanan-deep mb-2"
                        >
                          <Calendar className="w-4 h-4 inline mr-1.5 text-kanan-cyan" />
                          1. Selecciona el Día del Servicio
                        </label>
                        <input
                          id="wizard-fecha"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Disponibilidad en tiempo real para ruta en{" "}
                          <strong className="text-kanan-navy">{selectedMunicipio}</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-sm text-kanan-deep mb-2">
                          <Clock className="w-4 h-4 inline mr-1.5 text-kanan-cyan" />
                          2. Elige tu Turno Preferido
                        </label>
                        <div className="space-y-2.5">
                          {(
                            [
                              "Matutino (09:00 - 13:00)",
                              "Vespertino (14:00 - 18:00)",
                            ] as TurnoServicio[]
                          ).map((t) => {
                            const active = turno === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTurno(t)}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                  active
                                    ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                                    : "bg-kanan-ice text-kanan-deep border-slate-200 hover:bg-slate-200/70"
                                }`}
                              >
                                <div>
                                  <p className="font-heading font-bold text-xs sm:text-sm">{t}</p>
                                  <p
                                    className={`text-[11px] mt-0.5 ${
                                      active ? "text-kanan-cyan" : "text-slate-500"
                                    }`}
                                  >
                                    {t.startsWith("Matutino")
                                      ? "Secado listo entre 1:00 PM y 4:00 PM"
                                      : "Secado listo esa misma noche"}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    active
                                      ? "bg-kanan-cyan text-white"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  Disponible
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-kanan-ice text-kanan-deep font-semibold text-sm hover:bg-slate-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-sm px-6 py-3.5 rounded-2xl shadow-cyan-glow"
                      >
                        <span>Ir a Confirmación</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 4: DATOS DE CONFIRMACIÓN Y RESUMEN DEL SERVICIO */}
                {step === 4 && (
                  <form onSubmit={handleConfirmBooking} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Datos de Contacto */}
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="wizard-nombre"
                            className="block font-heading font-bold text-sm text-kanan-deep mb-1.5"
                          >
                            Tu Nombre Completo *
                          </label>
                          <input
                            id="wizard-nombre"
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Ana Sofía Hernández"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="wizard-whatsapp"
                            className="block font-heading font-bold text-sm text-kanan-deep mb-1.5"
                          >
                            Tu WhatsApp (10 dígitos) *
                          </label>
                          <input
                            id="wizard-whatsapp"
                            type="tel"
                            required
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="Ej. 33 1234 5678"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                          />
                        </div>

                        {/* Selector Hogar Pet-Friendly (Alimenta CRM + Automatización Mes 3) */}
                        <div className="bg-kanan-ice p-4 rounded-2xl border border-slate-200">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mascotas}
                              onChange={(e) => setMascotas(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-kanan-cyan focus:ring-kanan-cyan"
                            />
                            <div>
                              <span className="font-heading font-bold text-xs sm:text-sm text-kanan-deep flex items-center gap-1.5">
                                <PawPrint className="w-4 h-4 text-kanan-cyan" />
                                Tengo mascotas en casa (Protocolo Pet-Friendly)
                              </span>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Aplicaremos neutralizador enzimático 100% seguro para mascotas y
                                activaremos tus tips de cuidado trimestral.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Resumen del Servicio (Sin precios en el wizard) */}
                      <div className="bg-kanan-ice rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                            <span className="font-heading font-extrabold text-sm text-kanan-deep">
                              Resumen de tu Solicitud
                            </span>
                            <span className="text-xs font-bold text-kanan-cerulean bg-white px-2.5 py-1 rounded-full border border-slate-200">
                              {totalPiezasCount} pieza(s)
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-xs sm:text-sm text-kanan-deep">
                            {selectedItems.map((it) => (
                              <li key={it.piezaId} className="flex justify-between gap-2">
                                <span>
                                  <strong>{it.cantidad}x</strong> {it.piezaNombre}
                                </span>
                                <span className="text-slate-500 text-xs">{it.categoriaNombre}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                            <p>
                              📍 <strong>Zona:</strong> {selectedMunicipio}{" "}
                              {direccion ? `— ${direccion}` : ""}
                            </p>
                            <p>
                              📅 <strong>Fecha y Turno:</strong> {fecha} ({turno})
                            </p>
                            <p>
                              🐾 <strong>Protocolo Pet-Friendly:</strong>{" "}
                              {mascotas ? "Activado" : "Estándar"}
                            </p>
                            {fotosPreview.length > 0 && (
                              <p>
                                📷 <strong>Fotos adjuntas:</strong> {fotosPreview.length} foto(s)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center gap-2.5 text-xs text-kanan-navy">
                          <ShieldCheck className="w-5 h-5 text-kanan-cyan shrink-0" />
                          <span>
                            Incluye <strong>Garantía de Satisfacción por Escrito</strong> y secado
                            rápido de 3 a 4 horas.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl bg-kanan-ice text-kanan-deep font-semibold text-sm hover:bg-slate-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Cambiar Horario</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] disabled:opacity-50 text-white font-heading font-bold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-cyan-glow transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>
                          {submitting
                            ? "Registrando en CRM..."
                            : "Confirmar Reserva y Cotizar por WhatsApp"}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
