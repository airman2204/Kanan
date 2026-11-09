"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Timer,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Lock,
  MessageSquare,
  BedDouble,
  Sofa,
  CarFront,
  Check,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";
import { MunicipioZMG } from "@/types/crm";
import confetti from "canvas-confetti";

// Cargar el visor WebGL Scrollytelling
const DioramaScroller = dynamic(
  () => import("@/components/diorama/DioramaScroller").then((mod) => mod.DioramaScroller),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300 gap-3">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#36A6DE] border-t-transparent animate-spin" />
        <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-300">
          Cargando Experiencia 3D...
        </span>
      </div>
    ),
  }
);

interface RoomDetails {
  id: string;
  stepIndex: number;
  label: string;
  nombreServicio: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  icono: any;
}

const ROOMS_STORY: RoomDetails[] = [
  {
    id: "salas",
    stepIndex: 1,
    label: "1. LA SALA DE ESTAR",
    nombreServicio: "Limpieza Profunda de Salas y Sillones",
    tiempoSecado: "3 a 4 horas* (90% de humedad extraída)",
    tecnologia: "Inyección-Succión Alemana Kärcher",
    descripcion:
      "Desincrustamos polvo acumulado, manchas de alimentos y olores orgánicos sin maltratar las fibras ni alterar los colores originales.",
    icono: Sofa,
  },
  {
    id: "colchones",
    stepIndex: 2,
    label: "2. LA RECÁMARA PRINCIPAL",
    nombreServicio: "Sanitización Antiácaros de Colchones",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Luz UV Germicida + Extracción de Alto Vacío",
    descripcion:
      "Eliminación profunda de ácaros, bacterias y alérgenos invisibles. Indispensable para personas con alergias y salud infantil.",
    icono: BedDouble,
  },
  {
    id: "tapetes",
    stepIndex: 3,
    label: "3. EL COMEDOR Y ÁREAS COMUNES",
    nombreServicio: "Lavado de Sillas y Tapetes Finos",
    tiempoSecado: "Taller especializado (3 días con recolección)",
    tecnologia: "Inmersión controlada y centrifugado",
    descripcion:
      "Tratamiento exclusivo para lana, seda y fibras sintéticas. Lavado con agua desmineralizada y perfumado textil duradero.",
    icono: Sparkles,
  },
  {
    id: "autos",
    stepIndex: 4,
    label: "4. LA COCHERA Y VESTIDURAS",
    nombreServicio: "Detallado de Interiores de Autos y SUVs",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Unidad Móvil Autónoma directo en tu cochera",
    descripcion:
      "Asientos de tela y piel, alfombra, cajuela y cielo. Restauramos la frescura y aroma de tu vehículo sin moverlo de casa.",
    icono: CarFront,
  },
];

export default function Preview3DScrollyPage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>(["salas"]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0); // 0 = Intro, 1 = Sala, 2 = Cama, 3 = Comedor, 4 = Auto, 5 = Outro

  // Detección responsive para usar el modelo móvil especializado
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Referencia al contenedor de scroll del Scrollytelling (400vh de altura para viaje suave)
  const scrollyContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollyContainerRef,
    offset: ["start start", "end end"],
  });

  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setProgressVal(latest);

      // Calcular la sección activa según el progreso
      if (latest < 0.15) {
        setActiveStoryIndex(0); // Intro
      } else if (latest < 0.35) {
        setActiveStoryIndex(1); // Sala
      } else if (latest < 0.55) {
        setActiveStoryIndex(2); // Recámara
      } else if (latest < 0.75) {
        setActiveStoryIndex(3); // Comedor
      } else if (latest < 0.92) {
        setActiveStoryIndex(4); // Auto
      } else {
        setActiveStoryIndex(5); // Outro -> Listo para el Wizard
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const toggleCart = (id: string) => {
    setCartItems((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: { y: 0.8 },
            colors: ["#36A6DE", "#1D71B5", "#25D366"],
          });
        } catch {}
      }
      return next;
    });
  };

  const scrollToWizard = (categoryId?: string) => {
    if (categoryId) {
      setPreselectedCategory(categoryId);
    }
    const el = document.getElementById("agendar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generateWhatsAppUrl = () => {
    const names = cartItems.map((id) => {
      const found = ROOMS_STORY.find((r) => r.id === id);
      return found ? found.nombreServicio : id;
    });
    const text = `¡Hola Kanan Limpieza! 🐾 Estuve en la experiencia interactiva 3D y deseo agendar: ${names.join(", ")}`;
    return `https://wa.me/523326154699?text=${encodeURIComponent(text)}`;
  };

  // Fondos dinámicos suaves: desde un amanecer premium hasta un azul clínico fresco
  const bgGradients = [
    "from-[#0B1B2F] via-[#0E243D] to-[#0A1626]", // Intro
    "from-[#0A1B2A] via-[#102B45] to-[#0D2135]", // Sala
    "from-[#0F1E33] via-[#173553] to-[#0C1A2B]", // Recámara
    "from-[#0D2133] via-[#12314E] to-[#0A1A28]", // Comedor
    "from-[#091C2D] via-[#14324E] to-[#0A1724]", // Auto
    "from-[#0B1E32] via-[#0D263F] to-white",     // Transición final hacia el sitio
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* 1. BADGE FLOTANTE DE ENTORNO PRIVADO */}
      <div className="bg-[#07111D] text-white px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-heading sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">
            Scrollytelling 3D Kanan (Estilo Apple) • {isMobile ? "Modelo Móvil Activo" : "Modelo Desktop Activo"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-cyan-300 font-bold transition-colors"
          >
            ← Ir al Sitio Público
          </a>
        </div>
      </div>

      {/* 2. HEADER OFICIAL DE KANAN */}
      <StickyHeader
        selectedMunicipio={selectedMunicipio}
        onSelectMunicipio={setSelectedMunicipio}
        onOpenWizard={() => scrollToWizard()}
        isHalloweenMode={false}
      />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* SECCIÓN SCROLLYTELLING 3D INTERACTIVA (350vh DE PROFUNDIDAD)   */}
        {/* ============================================================== */}
        <section
          ref={scrollyContainerRef}
          className="relative h-[380vh] w-full"
        >
          {/* VISOR 3D STICKY FIJO EN PANTALLA MIENTRAS HACES SCROLL */}
          <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between transition-colors duration-700">
            {/* Fondo con gradiente dinámico sincronizado */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${bgGradients[activeStoryIndex]} transition-all duration-1000 -z-10`}
            />

            {/* VISOR 3D WEBGL A PANTALLA COMPLETA */}
            <div className="absolute inset-0 z-0">
              <DioramaScroller
                progress={progressVal}
                isMobile={isMobile}
                onSelectRoom={(id) => {
                  const item = ROOMS_STORY.find((r) => r.id === id);
                  if (item) setActiveStoryIndex(item.stepIndex);
                  toggleCart(id);
                }}
                selectedRoom={ROOMS_STORY[activeStoryIndex - 1]?.id || null}
              />
            </div>

            {/* Viñeta sutil de legibilidad izquierda */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10 w-full lg:w-1/2" />

            {/* BARRA SUPERIOR: INDICADOR DE PROGRESO DE HABITACIONES */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-heading font-bold">
                  {activeStoryIndex === 0
                    ? "Vista General del Hogar"
                    : activeStoryIndex === 5
                    ? "¡Hogar Completamente Renovado!"
                    : ROOMS_STORY[activeStoryIndex - 1]?.label}
                </span>
              </div>

              {/* Steps pills */}
              <div className="pointer-events-auto hidden sm:flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs">
                {ROOMS_STORY.map((room) => {
                  const isActive = activeStoryIndex === room.stepIndex;
                  const isChecked = cartItems.includes(room.id);
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => toggleCart(room.id)}
                      className={`px-3 py-1 rounded-full font-heading text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#36A6DE] text-white shadow-lg"
                          : isChecked
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {isChecked && "✓ "}
                      {room.label.replace(/^\d+\.\s*/, "").split(" ")[1]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTENIDO CENTRAL: TARJETAS SEGÚN EL SCROLL (Framer Motion) */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex items-center pointer-events-none">
              <div className="w-full max-w-lg pointer-events-auto">
                <AnimatePresence mode="wait">
                  {/* FASE 0: HERO INICIAL */}
                  {activeStoryIndex === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 text-xs font-heading font-bold text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Recorrido 3D Interactivo • Desliza hacia abajo</span>
                      </div>

                      <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md">
                        Protegemos lo que más tocas.{" "}
                        <span className="block mt-1 bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                          Limpieza y desinfección profunda a domicilio.
                        </span>
                      </h1>

                      <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                        Acompaña a nuestro equipo en un viaje por cada rincón de la casa y descubre cómo restauramos la pureza de tus muebles.
                      </p>

                      <div className="pt-2 flex items-center gap-3 text-cyan-300 font-heading font-bold text-xs animate-bounce">
                        <ChevronDown className="w-4 h-4" />
                        <span>Desliza para comenzar el recorrido por las habitaciones</span>
                      </div>
                    </motion.div>
                  )}

                  {/* FASES 1 A 4: CADA HABITACIÓN */}
                  {activeStoryIndex >= 1 && activeStoryIndex <= 4 && (
                    <motion.div
                      key={`step-${activeStoryIndex}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white/95 backdrop-blur-xl text-slate-800 p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/80 space-y-4"
                    >
                      {(() => {
                        const room = ROOMS_STORY[activeStoryIndex - 1];
                        const Icon = room.icono;
                        const isAdded = cartItems.includes(room.id);

                        return (
                          <>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1D71B5] to-[#36A6DE] text-white flex items-center justify-center shadow-md">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                                    {room.label}
                                  </span>
                                  <h2 className="font-heading text-lg font-extrabold text-[#0F2438] leading-tight">
                                    {room.nombreServicio}
                                  </h2>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {room.descripcion}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo de Secado</span>
                                <span className="font-heading font-bold text-[#1D71B5]">{room.tiempoSecado}</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tecnología</span>
                                <span className="font-heading font-bold text-emerald-600 truncate block">{room.tecnologia.split(" ")[0]} Profunda</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleCart(room.id)}
                              className={`w-full py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                                isAdded
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>¡Agregado a tu Cotización!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4" />
                                  <span>Agregar {room.label.replace(/^\d+\.\s*/, "").split(" ")[1]} al Servicio</span>
                                </>
                              )}
                            </button>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* FASE 5: OUTRO -> HOGAR LIMPIO Y LLAMADO AL WIZARD */}
                  {activeStoryIndex === 5 && (
                    <motion.div
                      key="step-5"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white/95 backdrop-blur-xl text-slate-800 p-6 rounded-3xl shadow-2xl border border-white/80 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-emerald-600 font-heading font-bold text-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>¡Recorrido 3D Completado con Éxito!</span>
                      </div>

                      <h2 className="font-heading text-2xl font-extrabold text-[#0F2438] leading-tight">
                        Tu casa merece sentirse como nueva hoy mismo.
                      </h2>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tienes <strong>{cartItems.length} {cartItems.length === 1 ? "servicio seleccionado" : "servicios seleccionados"}</strong>. Agenda la fecha y hora de tu cita con confirmación inmediata:
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => scrollToWizard()}
                          className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Agendar en Línea Ahora</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <a
                          href={generateWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* BARRA HUD INFERIOR */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-4 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs text-slate-200">
                <span>Tu selección: <strong className="text-cyan-300 font-bold">{cartItems.length} {cartItems.length === 1 ? "servicio" : "servicios"}</strong></span>
                <button
                  type="button"
                  onClick={() => scrollToWizard()}
                  className="font-heading font-bold text-cyan-300 hover:text-white underline cursor-pointer"
                >
                  Continuar al Wizard ↓
                </button>
              </div>

              <div className="pointer-events-auto hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantía de Satisfacción 100% Kanan</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* RESTO DE LA LANDING OFICIAL DE KANAN                           */}
        {/* ============================================================== */}
        <ServicesSection
          onSelectCategoryForWizard={(catId) => scrollToWizard(catId)}
        />

        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

        {/* AGENTE WIZARD CONCIERGE DE RESERVAS */}
        <KananConciergeAgent
          selectedMunicipio={selectedMunicipio}
          onSelectMunicipio={setSelectedMunicipio}
          preselectedCategory={preselectedCategory}
        />

        <SocialProofAndFAQ />
      </main>

      <Footer onOpenWizard={() => scrollToWizard()} />
      <MobileBottomBar onOpenWizard={() => scrollToWizard()} />
    </div>
  );
}
