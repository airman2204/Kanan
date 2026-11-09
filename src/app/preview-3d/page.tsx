"use client";

import React, { useState } from "react";
import {
  Timer,
  CalendarCheck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Award,
  Zap,
  Lock,
} from "lucide-react";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";
import { MunicipioZMG } from "@/types/crm";
import { InteractiveTowerHero } from "@/components/interactive/InteractiveTowerHero";
import confetti from "canvas-confetti";

export default function Preview3DPage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]); // Inicia sin nada seleccionado (sin botones verdes por defecto)

  const toggleCart = (id: string) => {
    setCartItems((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: { y: 0.7 },
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

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* 1. BADGE FLOTANTE DE ENTORNO PRIVADO */}
      <div className="bg-[#07111D] text-white px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-heading sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">
            Propuesta Visual 1 Gemini: Hero Principal de Kanan con Torre Vertical Interactiva
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
        {/* HERO OFICIAL DE KANAN CON LA TORRE VERTICAL A LA DERECHA       */}
        {/* ============================================================== */}
        <section
          id="inicio"
          className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FA] via-white to-[#F4F7F9] pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28"
        >
          {/* Luces difusas de fondo (Glow Glassmorphism original de Kanan) */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#36A6DE]/20 to-[#1D71B5]/10 blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#355581]/15 to-[#36A6DE]/10 blur-3xl pointer-events-none -z-0" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* COLUMNA IZQUIERDA: COPYWRITING & CONVERSIÓN OFICIAL DE KANAN */}
              <div className="lg:col-span-7 space-y-6">
                {/* Badges de Cobertura y Actividad en Vivo */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#36A6DE]/40 rounded-full px-3.5 py-1.5 shadow-sm text-xs font-heading font-bold text-[#1D71B5]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <MapPin className="w-3.5 h-3.5 text-[#36A6DE]" />
                    <span>Rutas activas hoy en {selectedMunicipio}</span>
                  </div>

                  <a
                    href="#opiniones"
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-full px-3.5 py-1.5 shadow-sm text-xs font-semibold text-amber-700 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span>4.9 / 5 en Google Maps</span>
                  </a>
                </div>

                {/* Titular Principal de Alto Impacto */}
                <div className="space-y-4">
                  <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#355581] tracking-tight leading-[1.08]">
                    Protegemos lo que más tocas.{" "}
                    <span className="block mt-1 bg-gradient-to-r from-[#1D71B5] via-[#36A6DE] to-[#355581] bg-clip-text text-transparent">
                      Limpieza y desinfección profunda a domicilio.
                    </span>
                  </h1>
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                    Renovamos tus salas, colchones y vestiduras con tecnología alemana de{" "}
                    <strong className="text-[#355581] font-bold">inyección-succión industrial</strong>.
                    Eliminamos el 90% de la humedad, manchas profundas y ácaros en minutos.
                  </p>
                </div>

                {/* Caja de Conversión Rápida - Limpia, directa y sin botones redundantes */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_12px_40px_-10px_rgba(29,113,181,0.12)] space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => scrollToWizard()}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CalendarCheck className="w-5 h-5 shrink-0" />
                      <span>{cartItems.length > 0 ? `Cotizar mi Selección (${cartItems.length} ${cartItems.length === 1 ? "área" : "áreas"})` : "Cotizar y Agendar en Línea"}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Cotización al instante sin llamadas forzadas
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#1D71B5] shrink-0" />
                      Garantía de satisfacción por escrito
                    </span>
                  </div>
                </div>

                {/* 3 Pilares de Confianza */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-[#36A6DE] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D71B5] flex items-center justify-center mb-2.5">
                      <Timer className="w-5 h-5 text-[#36A6DE]" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[#355581]">
                      Secado en 3-4 horas*
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-1">
                      Usa tus muebles el mismo día con alto poder de extracción de vacío.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-emerald-400 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[#355581]">
                      Desinfección Hospitalaria
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-1">
                      Fórmulas biodegradables sin residuos químicos tóxicos ni cloro.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-purple-400 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[#355581]">
                      Luz UV Antiácaros
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-1">
                      Sanitización germicida para personas con alergias y asma.
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: LA TORRE VERTICAL INTERACTIVA (PROPUESTA 1 GEMINI) */}
              <div className="lg:col-span-5 flex justify-center">
                <InteractiveTowerHero
                  selectedSpotId={selectedSpotId}
                  onSelectSpot={setSelectedSpotId}
                  cartItems={cartItems}
                  onToggleCart={toggleCart}
                  onOpenWizard={scrollToWizard}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PASO DIRECTO A RESULTADOS REALES Y PRUEBA SOCIAL (SIN REPETIR SERVICIOS) */}
        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

        <KananConciergeAgent
          selectedMunicipio={selectedMunicipio}
          onSelectMunicipio={setSelectedMunicipio}
          preselectedCategory={preselectedCategory}
          preselectedCategories={cartItems}
        />

        <SocialProofAndFAQ />
      </main>

      <Footer onOpenWizard={() => scrollToWizard()} />
      <MobileBottomBar onOpenWizard={() => scrollToWizard()} />
    </div>
  );
}
