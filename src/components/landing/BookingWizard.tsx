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
  AlertCircle,
  Building2,
  Check,
  Lock,
} from "lucide-react";
import {
  MunicipioZMG,
  TurnoServicio,
  ItemContratado,
} from "@/types/crm";
import { consultarCodigoPostal } from "@/lib/utils/postalCodes";
import {
  validarDireccion,
  validarDetalleManchas,
  validarNombre,
  validarWhatsApp,
  sanitizeInput,
} from "@/lib/utils/securityValidation";

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
        descripcion: "Lavado con cepillos suaves y secado en 3-4h*",
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
    nombre: "Vestiduras",
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
];

const KANAN_DOG_TIPS: Record<number, { title: string; tip: string }> = {
  1: {
    title: "Paso 1 de 4: Selecciona tus muebles 🛋️",
    tip: "Elige las salas, tapetes, colchones o vestiduras que deseas limpiar y desinfectar. Al final te daremos atención y cotización personalizada.",
  },
  2: {
    title: "Paso 2 de 4: Ubicación verificada y fotos de tus piezas 📷",
    tip: "Ingresa tu código postal para validar la cobertura en Jalisco. Adjunta fotos y describe las manchas para asignarte el técnico y químico adecuado.",
  },
  3: {
    title: "Paso 3 de 4: Elige tu fecha y turno ideal ⏰",
    tip: "Recuerda que nuestro proceso de inyección-succión permite un secado rápido en solo 3 a 4 horas (sujeto a ventilación y clima).",
  },
  4: {
    title: "Paso 4 de 4: Confirmación del servicio ✅",
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

  // Paso 2: Ubicación Inteligente por Código Postal y Fotos
  const [codigoPostal, setCodigoPostal] = useState("");
  const [cpValido, setCpValido] = useState(false);
  const [municipioAutollenado, setMunicipioAutollenado] = useState<MunicipioZMG | null>(null);
  const [colonia, setColonia] = useState("");
  const [coloniasDisponibles, setColoniasDisponibles] = useState<string[]>([]);
  const [calleNumero, setCalleNumero] = useState("");
  const [calleError, setCalleError] = useState<string | null>(null);
  const [cpError, setCpError] = useState<string | null>(null);
  const [direccion, setDireccion] = useState("");
  const [notasServicio, setNotasServicio] = useState("");
  const [notasError, setNotasError] = useState<string | null>(null);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [fotosError, setFotosError] = useState<string | null>(null);

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

  // Manejar búsqueda automática y validación de Código Postal
  const handleCodigoPostalChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 5);
    setCodigoPostal(clean);
    setCpError(null);

    if (clean.length < 5) {
      setCpValido(false);
      setMunicipioAutollenado(null);
      setColoniasDisponibles([]);
      setColonia("");
      return;
    }

    if (clean.length === 5) {
      const info = consultarCodigoPostal(clean);
      if (!info.valido) {
        setCpValido(false);
        setMunicipioAutollenado(null);
        setCpError(info.mensajeError || "Código postal fuera de nuestra zona de cobertura en Jalisco.");
        setColoniasDisponibles([]);
        setColonia("");
      } else {
        setCpValido(true);
        if (info.municipio) {
          setMunicipioAutollenado(info.municipio);
          onSelectMunicipio(info.municipio);
        }
        if (info.colonias && info.colonias.length > 0) {
          setColoniasDisponibles(info.colonias);
          setColonia(info.colonias[0]);
        } else {
          setColoniasDisponibles([]);
          setColonia("");
        }
      }
    }
  };

  const handleCalleChange = (val: string) => {
    // Sanitizar sin eliminar el espacio que el usuario acaba de teclear
    const sanitized = sanitizeInput(val, false);
    setCalleNumero(sanitized);

    // Solo mostrar error si el usuario ya escribió suficiente o si borró todo
    if (sanitized.trim().length === 0) {
      setCalleError(null);
    } else if (sanitized.trim().length >= 8) {
      const v = validarDireccion(sanitized);
      setCalleError(v.valida ? null : (v.error || null));
    } else {
      // Mientras esté escribiendo las primeras letras no mostrar error agresivo
      setCalleError(null);
    }
  };

  const handleCalleBlur = () => {
    if (calleNumero.trim().length > 0) {
      const v = validarDireccion(calleNumero);
      setCalleError(v.valida ? null : (v.error || null));
    }
  };

  const handleNotasChange = (val: string) => {
    // Sanitizar sin eliminar espacios en blanco
    const sanitized = sanitizeInput(val, false);
    setNotasServicio(sanitized);

    if (sanitized.trim().length === 0) {
      setNotasError(null);
    } else if (sanitized.trim().length >= 6) {
      const v = validarDetalleManchas(sanitized);
      setNotasError(v.valida ? null : (v.error || null));
    } else {
      setNotasError(null);
    }
  };

  const handleNotasBlur = () => {
    if (notasServicio.trim().length > 0) {
      const v = validarDetalleManchas(notasServicio);
      setNotasError(v.valida ? null : (v.error || null));
    }
  };

  // Mantener sincronizado el campo direccion completo
  useEffect(() => {
    const partes = [];
    if (calleNumero.trim()) partes.push(calleNumero.trim());
    if (colonia.trim()) partes.push(`Col. ${colonia.trim()}`);
    if (codigoPostal.trim()) partes.push(`CP ${codigoPostal.trim()}`);
    partes.push(selectedMunicipio);
    setDireccion(partes.join(", "));
  }, [calleNumero, colonia, codigoPostal, selectedMunicipio]);
  const obtenerTurnosPorMunicipioYFecha = (): { turno: TurnoServicio; horario: string; secadoInfo: string }[] => {
    const muniLower = selectedMunicipio.toLowerCase();
    // Determinar día de la semana a partir de la fecha (0 = Domingo, 6 = Sábado)
    let esFinDeSemana = false;
    if (fecha) {
      const parts = fecha.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const dayOfWeek = d.getDay();
        esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6;
      }
    }

    if (muniLower.includes("tlajomulco")) {
      return [
        {
          turno: "Lunes a Domingo (09:00 - 16:00)",
          horario: "09:00 am a 4:00 pm",
          secadoInfo: "Secado listo esa misma tarde-noche*",
        },
      ];
    }

    // Guadalajara y Zapopan (y Tlaquepaque como parte de ZMG central)
    if (esFinDeSemana) {
      return [
        {
          turno: "Sábado y Domingo (08:00 - 13:00)",
          horario: "08:00 am a 1:00 pm (Fin de Semana)",
          secadoInfo: "Secado listo entre 1:00 PM y 4:00 PM*",
        },
      ];
    }

    return [
      {
        turno: "Lunes a Viernes (09:00 - 14:00)",
        horario: "09:00 am a 2:00 pm (Entre Semana)",
        secadoInfo: "Secado listo entre 2:00 PM y 5:00 PM*",
      },
    ];
  };

  const turnosDisponibles = obtenerTurnosPorMunicipioYFecha();

  // Mantener la categoría sincronizada con la que el usuario eligió en las tarjetas de servicios
  useEffect(() => {
    if (preselectedCategory) {
      setActiveCategory(preselectedCategory);
      // Asignar 1 pieza por defecto de esa categoría si no tiene seleccionadas
      const cat = CATALOGO_KANAN.find((c) => c.id === preselectedCategory);
      if (cat && cat.piezas.length > 0) {
        const firstPiezaId = cat.piezas[0].id;
        setQuantities((prev) => {
          // Si ya tiene ítems de esta categoría, conservarlos
          const hasCurrent = cat.piezas.some((p) => (prev[p.id] || 0) > 0);
          if (hasCurrent) return prev;
          return { [firstPiezaId]: 1 };
        });
      }
    }
  }, [preselectedCategory]);
  useEffect(() => {
    if (turnosDisponibles.length > 0) {
      const existe = turnosDisponibles.some((t) => t.turno === turno);
      if (!existe) {
        setTurno(turnosDisponibles[0].turno);
      }
    }
  }, [selectedMunicipio, fecha]);

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
    setFotosError(null);
    Array.from(files)
      .slice(0, 3)
      .forEach((file) => {
        // Validar tamaño máximo 5MB por foto
        if (file.size > 5 * 1024 * 1024) {
          setFotosError("Cada foto debe pesar menos de 5MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setFotosPreview((prev) => [...prev.slice(0, 2), reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const validarPaso2 = (): boolean => {
    if (!cpValido || !municipioAutollenado) {
      setCpError("Ingresa un Código Postal válido de 5 dígitos con cobertura en Jalisco.");
      return false;
    }
    const resDir = validarDireccion(calleNumero);
    if (!resDir.valida) {
      setCalleError(resDir.error || "Dirección incompleta o inválida.");
      return false;
    }
    const resNotas = validarDetalleManchas(notasServicio);
    if (!resNotas.valida) {
      setNotasError(resNotas.error || "Por favor describe las manchas o tipo de tela.");
      return false;
    }
    if (fotosPreview.length === 0) {
      setFotosError("Es obligatorio adjuntar al menos 1 foto del estado actual de tus piezas.");
      return false;
    }
    return true;
  };

  const handleContinuarAPaso3 = () => {
    if (validarPaso2()) {
      setStep(3);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedItems.length === 0) {
      setErrorMsg("Selecciona al menos una pieza para limpiar en el Paso 1.");
      setStep(1);
      return;
    }
    const validNombre = validarNombre(nombre);
    if (!validNombre.valida) {
      setErrorMsg(validNombre.error || "Nombre inválido");
      return;
    }
    const validTel = validarWhatsApp(whatsapp);
    if (!validTel.valida) {
      setErrorMsg(validTel.error || "WhatsApp inválido (deben ser 10 dígitos)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sanitizeInput(nombre),
          whatsapp: whatsapp.replace(/\D/g, ""),
          direccion: direccion.trim() || `Domicilio en ${selectedMunicipio}`,
          calleNumero: sanitizeInput(calleNumero),
          municipio: selectedMunicipio,
          mascotas,
          fecha,
          turno,
          items_contratados: selectedItems,
          notas_servicio: sanitizeInput(notasServicio),
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
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-kanan-deep">
            Agenda tu Servicio en 4 Pasos
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Selecciona tus muebles, ubicación y horario. Sin cobros por adelantado: confirmamos tu
            cita y cotización directamente por WhatsApp.
          </p>
        </div>

        {/* Tarjeta Principal del Wizard */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-kanan-lg overflow-hidden">
          {/* Barra Superior del Wizard: Guía Visual Kanan Dog (Manual Pág. 3) */}
          <div className="bg-kanan-deep text-white p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 border-b border-white/10">
            <div className="relative shrink-0">
              <img
                src="/assets/brand/kanan-dog-agenda.png"
                alt="Kanan Dog Agendando Citas"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white rounded-2xl p-1 border-2 border-kanan-cyan shadow-md"
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
                      {/* Nota especial para Colchones */}
                      {activeCategory === "colchones" && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
                          <span className="text-base shrink-0">⚠️</span>
                          <div>
                            <strong className="font-heading font-bold block">Nota importante para colchones:</strong>
                            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                              En caso de que el colchón sea <strong>doble vista</strong>, el precio aumentará dependiendo del tamaño del colchón.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Nota especial para Vestiduras */}
                      {activeCategory === "vestiduras" && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
                          <span className="text-base shrink-0">⚠️</span>
                          <div>
                            <strong className="font-heading font-bold block">Nota importante para vestiduras:</strong>
                            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                              En caso de que las vestiduras sean de <strong>piel</strong>, el precio incrementará dependiendo del modelo y del color.
                            </p>
                          </div>
                        </div>
                      )}

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

                {/* PASO 2: UBICACIÓN INTELIGENTE POR CÓDIGO POSTAL Y FOTOS (SEGURO Y VALIDADO) */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Bloque 1: Código Postal que desbloquea Municipio y Colonia */}
                    <div className="bg-kanan-ice/70 rounded-3xl p-5 sm:p-6 border border-slate-200/90 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label
                            htmlFor="wizard-cp"
                            className="block font-heading font-extrabold text-sm sm:text-base text-kanan-deep"
                          >
                            1. Ingresa tu Código Postal (5 dígitos) *
                          </label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Al ingresarlo se verificará tu municipio y colonias oficiales en Jalisco.
                          </p>
                        </div>
                        <span className="text-[11px] font-heading font-bold text-kanan-cerulean bg-white px-3 py-1 rounded-full border border-kanan-cyan/30 self-start sm:self-auto">
                          📍 Cobertura exclusiva Jalisco
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Input Código Postal */}
                        <div className="sm:col-span-4">
                          <div className="relative">
                            <input
                              id="wizard-cp"
                              type="text"
                              maxLength={5}
                              value={codigoPostal}
                              onChange={(e) => handleCodigoPostalChange(e.target.value)}
                              placeholder="Ej. 44600"
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-heading font-bold text-kanan-deep tracking-wider focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                            />
                            {cpValido && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-3.5 top-3.5" />
                            )}
                          </div>
                        </div>

                        {/* Municipio Detectado (Solo se llena si el CP es válido) */}
                        <div className="sm:col-span-4">
                          <div
                            className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm flex items-center min-h-[46px] transition-all ${
                              cpValido && municipioAutollenado
                                ? "bg-white border-emerald-300 shadow-sm"
                                : "bg-slate-100/80 border-slate-200 text-slate-400"
                            }`}
                          >
                            <span className="text-slate-400 font-medium shrink-0">Municipio:&nbsp;</span>
                            {cpValido && municipioAutollenado ? (
                              <span className="font-heading font-extrabold text-kanan-deep inline-flex items-center gap-1">
                                {municipioAutollenado}
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            ) : (
                              <span className="italic text-slate-400 text-xs flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" /> Esperando C.P...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Colonia (Select si hay catálogo, o input libre - Desbloqueado solo con CP válido) */}
                        <div className="sm:col-span-4">
                          {!cpValido ? (
                            <div className="px-4 py-3 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-400 min-h-[46px] flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Colonia (requiere C.P.)</span>
                            </div>
                          ) : coloniasDisponibles.length > 0 ? (
                            <select
                              value={colonia}
                              onChange={(e) => setColonia(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-xs sm:text-sm font-semibold text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                            >
                              {coloniasDisponibles.map((col) => (
                                <option key={col} value={col}>
                                  {col}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={colonia}
                              onChange={(e) => setColonia(sanitizeInput(e.target.value))}
                              placeholder="Colonia o Fraccionamiento *"
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm text-kanan-deep focus:outline-none focus:ring-2 focus:ring-kanan-cyan"
                            />
                          )}
                        </div>
                      </div>

                      {/* Alerta si el CP está fuera de cobertura */}
                      {cpError && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <p className="leading-snug">{cpError}</p>
                        </div>
                      )}
                    </div>

                    {/* Bloque 2: Dirección y Detalle de Manchas (Desbloqueados solo tras validar CP) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Calle y Número con Validación de Dirección Real */}
                      <div>
                        <label
                          htmlFor="wizard-calle"
                          className="block font-heading font-bold text-sm text-kanan-deep mb-1.5 flex items-center justify-between"
                        >
                          <span>2. Calle y Número Exterior / Interior *</span>
                          <span className="text-[11px] font-semibold text-rose-600">Requerido</span>
                        </label>
                        <input
                          id="wizard-calle"
                          type="text"
                          disabled={!cpValido}
                          value={calleNumero}
                          onChange={(e) => handleCalleChange(e.target.value)}
                          onBlur={handleCalleBlur}
                          placeholder={
                            cpValido
                              ? "Ej. Av. Providencia 2340, Depto 4B"
                              : "Ingresa primero un Código Postal válido"
                          }
                          className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all focus:outline-none ${
                            !cpValido
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : calleError
                              ? "bg-white border-rose-300 focus:ring-2 focus:ring-rose-400 text-kanan-deep"
                              : "bg-white border-slate-300 focus:ring-2 focus:ring-kanan-cyan text-kanan-deep"
                          }`}
                        />
                        {calleError ? (
                          <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {calleError}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Debe incluir nombre de calle y número exterior (mínimo 8 caracteres).
                          </p>
                        )}
                      </div>

                      {/* Detalles de Manchas o Tela (Requerido) */}
                      <div>
                        <label
                          htmlFor="wizard-notas"
                          className="block font-heading font-bold text-sm text-kanan-deep mb-1.5 flex items-center justify-between"
                        >
                          <span>3. Detalle de manchas o tipo de tela *</span>
                          <span className="text-[11px] font-semibold text-rose-600">Requerido</span>
                        </label>
                        <input
                          id="wizard-notas"
                          type="text"
                          disabled={!cpValido}
                          value={notasServicio}
                          onChange={(e) => handleNotasChange(e.target.value)}
                          onBlur={handleNotasBlur}
                          placeholder={
                            cpValido
                              ? "Ej. Manchas de café en cojines, tela lino gris claro"
                              : "Ingresa primero un Código Postal válido"
                          }
                          className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all focus:outline-none ${
                            !cpValido
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : notasError
                              ? "bg-white border-rose-300 focus:ring-2 focus:ring-rose-400 text-kanan-deep"
                              : "bg-white border-slate-300 focus:ring-2 focus:ring-kanan-cyan text-kanan-deep"
                          }`}
                        />
                        {notasError ? (
                          <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {notasError}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Nos permite preparar los químicos y solventes neutros adecuados.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bloque 3: Carga Requerida de Fotos del Estado Actual (Desbloqueado tras validar CP) */}
                    <div
                      className={`rounded-2xl p-4 sm:p-5 border border-dashed transition-all ${
                        !cpValido
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : fotosPreview.length > 0
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-kanan-ice border-kanan-cerulean/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              fotosPreview.length > 0
                                ? "bg-emerald-600 text-white"
                                : "bg-kanan-cyan/15 text-kanan-cerulean"
                            }`}
                          >
                            <Camera className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading font-bold text-sm text-kanan-deep">
                                Fotos del Estado Actual de tus Piezas *
                              </h4>
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                Requerido
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Adjunta de 1 a 3 fotos claras para que el técnico verifique el tipo de tejido y severidad de manchas antes de acudir.
                            </p>
                          </div>
                        </div>

                        {cpValido ? (
                          <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-kanan-navy hover:bg-[#062445] text-white border border-transparent font-heading font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0">
                            <Camera className="w-4 h-4 text-kanan-cyan" />
                            <span>{fotosPreview.length > 0 ? "Agregar más fotos" : "Tomar / Subir Fotos *"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-200/60 px-3 py-2 rounded-xl">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Requiere CP</span>
                          </div>
                        )}
                      </div>

                      {fotosError && (
                        <p className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fotosError}
                        </p>
                      )}

                      {fotosPreview.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-200">
                          {fotosPreview.map((src, idx) => (
                            <div
                              key={idx}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-sm"
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
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                                aria-label="Eliminar foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botones de navegación del Paso 2 */}
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
                        disabled={
                          !cpValido ||
                          !municipioAutollenado ||
                          !calleNumero.trim() ||
                          calleNumero.trim().length < 8 ||
                          Boolean(calleError) ||
                          !notasServicio.trim() ||
                          notasServicio.trim().length < 6 ||
                          Boolean(notasError) ||
                          fotosPreview.length === 0
                        }
                        onClick={handleContinuarAPaso3}
                        className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] disabled:bg-slate-300 disabled:shadow-none text-white font-heading font-bold text-sm px-6 py-3.5 rounded-2xl shadow-cyan-glow transition-all"
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
                          2. Turno y Horario Disponible para {selectedMunicipio}
                        </label>
                        <div className="space-y-2.5">
                          {turnosDisponibles.map((item) => {
                            const active = turno === item.turno;
                            return (
                              <button
                                key={item.turno}
                                type="button"
                                onClick={() => setTurno(item.turno)}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                  active
                                    ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                                    : "bg-kanan-ice text-kanan-deep border-slate-200 hover:bg-slate-200/70"
                                }`}
                              >
                                <div>
                                  <p className="font-heading font-bold text-xs sm:text-sm">
                                    ⏰ {item.horario}
                                  </p>
                                  <p
                                    className={`text-[11px] mt-0.5 ${
                                      active ? "text-kanan-cyan" : "text-slate-500"
                                    }`}
                                  >
                                    {item.secadoInfo}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
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
                        <p className="text-[10px] text-slate-400 mt-2">
                          *El tiempo de secado dependerá de la ventilación y las condiciones del clima.
                        </p>
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
                            Incluye <strong>Garantía de Satisfacción</strong> y secado
                            rápido de 3 a 4 horas (sujeto a ventilación y clima).
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 text-center sm:text-left">
                      Al confirmar tu cita, aceptas el tratamiento de tus datos personales conforme a nuestro{" "}
                      <a
                        href="/aviso-de-privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-kanan-cerulean underline font-semibold hover:text-kanan-deep"
                      >
                        Aviso de Privacidad
                      </a>
                      , utilizados exclusivamente para fines de cotización y servicio a domicilio.
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
