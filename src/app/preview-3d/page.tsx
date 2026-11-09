"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Timer,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  Award,
  Lock,
  RotateCcw,
  MessageSquare,
  BedDouble,
  Sofa,
  CarFront,
  Check,
  Plus,
  X,
  PhoneCall,
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

// Cargar el visor WebGL 3D sin SSR
const RealGlbViewer = dynamic(
  () => import("@/components/diorama/RealGlbViewer").then((mod) => mod.RealGlbViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300 gap-3">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#36A6DE] border-t-transparent animate-spin" />
        <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-300">
          Cargando Casa 3D Kanan...
        </span>
      </div>
    ),
  }
);

interface RoomDetails {
  id: string;
  label: string;
  nombreServicio: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  icono: any;
}

const ROOMS_INFO: Record<string, RoomDetails> = {
  salas: {
    id: "salas",
    label: "LA SALA DE ESTAR",
    nombreServicio: "Limpieza Profunda de Salas y Sillones",
    tiempoSecado: "3 a 4 horas* (90% de humedad extraída)",
    tecnologia: "Inyección-Succión Alemana Kärcher",
    descripcion:
      "Desincrusta polvo acumulado, manchas de alimentos y olores orgánicos sin dañar el tejido.",
    icono: Sofa,
  },
  colchones: {
    id: "colchones",
    label: "LA RECÁMARA PRINCIPAL",
    nombreServicio: "Sanitización Antiácaros de Colchones",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Luz UV Germicida + Extracción Profunda",
    descripcion:
      "Eliminación de ácaros, bacterias y células muertas. Esencial para alergias y salud respiratoria.",
    icono: BedDouble,
  },
  tapetes: {
    id: "tapetes",
    label: "EL COMEDOR Y PASILLOS",
    nombreServicio: "Lavado de Sillas y Tapetes Decorativos",
    tiempoSecado: "Recolección a taller (3 días)",
    tecnologia: "Inmersión controlada y centrifugado",
    descripcion:
      "Cuidado delicado para fibras finas, desmanchado profundo y perfumado textil.",
    icono: Sparkles,
  },
  autos: {
    id: "autos",
    label: "LA COCHERA / EXTERIOR",
    nombreServicio: "Detallado de Vestiduras Automotrices",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Unidad Móvil a Domicilio en tu cochera",
    descripcion:
      "Limpieza de asientos, cielo y alfombra de autos y camionetas directo en tu domicilio.",
    icono: CarFront,
  },
};

export default function Preview3DPage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("salas");
  const [cartItems, setCartItems] = useState<string[]>(["salas"]);

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

  const currentRoom = selectedRoomId ? ROOMS_INFO[selectedRoomId] : null;

  const generateWhatsAppUrl = () => {
    const items = cartItems.map((id) => ROOMS_INFO[id]?.nombreServicio).filter(Boolean).join(", ");
    const text = `¡Hola Kanan Limpieza! 🐾 Estuve en la casa 3D interactiva y deseo cotizar: ${items}`;
    return `https://wa.me/523326154699?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* BANNER INDICADOR DE PRUEBA PRIVADA */}
      <div className="bg-[#0A1626] text-white px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-heading">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">Vista Previa Privada: Casa 3D Inmersiva con Diseño Original Kanan</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">Sitio oficial intacto</span>
          <a
            href="/"
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-cyan-300 font-bold transition-colors"
          >
            ← Ir al Sitio Público
          </a>
        </div>
      </div>

      {/* HEADER OFICIAL DE KANAN */}
      <StickyHeader
        selectedMunicipio={selectedMunicipio}
        onSelectMunicipio={setSelectedMunicipio}
        onOpenWizard={() => scrollToWizard()}
        isHalloweenMode={false}
      />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* HERO MONUMENTAL CON CASA 3D A PANTALLA COMPLETA                */}
        {/* ============================================================== */}
        <section className="relative w-full h-[88vh] min-h-[640px] max-h-[920px] overflow-hidden bg-gradient-to-b from-[#0B1B2F] via-[#0E243D] to-[#0A1626]">
          {/* 1. VISOR 3D COMO FONDO TOTAL INTERACTIVO */}
          <div className="absolute inset-0 z-0">
            <RealGlbViewer
              onSelectRoom={(id) => setSelectedRoomId(id)}
              selectedRoom={selectedRoomId}
            />
          </div>

          {/* Sutil viñeta para asegurar legibilidad */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0B1B2F]/90 via-[#0B1B2F]/30 to-transparent z-10 w-full lg:w-3/5" />
          <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#0A1626] to-transparent z-10" />

          {/* 2. OVERLAY SUPERIOR: BADGE Y TIP 3D */}
          <div className="absolute top-4 left-4 sm:left-8 z-20 pointer-events-none flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full border border-white/15">
              <RotateCcw className="w-3.5 h-3.5 text-[#36A6DE] animate-spin" style={{ animationDuration: "10s" }} />
              <span>Gira la casa en 360° o toca a cada perrito</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1.5 rounded-full border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Rutas activas hoy en {selectedMunicipio}</span>
            </div>
          </div>

          {/* 3. COLUMNA IZQUIERDA: COPYWRITING ORIGINAL DE KANAN */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pointer-events-none">
            <div className="max-w-xl space-y-5 pointer-events-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 shadow-sm text-xs font-heading font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Hogar Limpio e Interactivo Kanan</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
                Protegemos lo que más tocas.{" "}
                <span className="block mt-1 bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                  Limpieza y desinfección profunda a domicilio.
                </span>
              </h1>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed drop-shadow">
                Renovamos tus salas, colchones y vestiduras con tecnología alemana de{" "}
                <strong className="text-white font-bold">inyección-succión industrial</strong>.
                Eliminamos el 90% de la humedad, manchas profundas y ácaros en minutos.
              </p>

              {/* Botonera de Acción Rápida */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToWizard()}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 shrink-0" />
                  <span>Cotizar y Agendar en Línea</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-heading font-bold text-sm px-5 py-3.5 rounded-2xl border border-white/20 transition-all text-center"
                >
                  <span>Ver Precios y Catálogo</span>
                </a>
              </div>

              {/* Mini garantías */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Secado express 3 a 4 hrs*
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                  Garantía de satisfacción
                </span>
              </div>
            </div>
          </div>

          {/* 4. TARJETA FLOTANTE GLASSMORPHISM CUANDO SE TOCA UN PERRITO */}
          <AnimatePresence>
            {currentRoom && (
              <motion.div
                key={currentRoom.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute top-20 right-4 sm:right-8 z-30 max-w-xs w-[85vw] sm:w-auto bg-white/95 backdrop-blur-xl text-slate-800 p-4 rounded-3xl shadow-2xl border border-white/80 space-y-2.5 pointer-events-auto"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                      {currentRoom.label}
                    </span>
                    <h3 className="font-heading text-sm font-extrabold text-[#0F2438] leading-tight">
                      {currentRoom.nombreServicio}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRoomId(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-[#36A6DE]" />
                    <span className="font-bold text-slate-800">Secado:</span> {currentRoom.tiempoSecado}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">{currentRoom.descripcion}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCart(currentRoom.id)}
                  className={`w-full py-2 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                    cartItems.includes(currentRoom.id)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#1D71B5] hover:bg-[#355581] text-white"
                  }`}
                >
                  {cartItems.includes(currentRoom.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Agregado a selección</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar servicio</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. BARRA HUD INFERIOR DEL HERO: SELECCIÓN RÁPIDA + WHATSAPP */}
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-30 pointer-events-none flex justify-center">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-xl text-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/80 flex flex-wrap items-center justify-between gap-3 max-w-3xl w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-heading font-extrabold text-[#0F2438] pr-2 hidden sm:inline-block border-r border-slate-200">
                  Habitaciones:
                </span>
                {Object.values(ROOMS_INFO).map((room) => {
                  const active = cartItems.includes(room.id);
                  const IconComp = room.icono;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        toggleCart(room.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition-all border ${
                        active
                          ? "bg-[#1D71B5] text-white border-[#1D71B5] ring-2 ring-cyan-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{room.label.replace("LA ", "").replace("EL ", "").split(" ")[0]}</span>
                      {active ? <span>✓</span> : <span>+</span>}
                    </button>
                  );
                })}
              </div>

              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7569] text-white font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all ml-auto"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                <span>Cotizar Selección ({cartItems.length})</span>
              </a>
            </div>
          </div>
        </section>

        {/* RESTO DEL DISEÑO COMPLETO ORIGINAL DE KANAN */}
        <ServicesSection
          onSelectCategoryForWizard={(catId) => scrollToWizard(catId)}
        />

        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

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
