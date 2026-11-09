"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CalendarCheck,
  Lock,
  MessageSquare,
  ShieldCheck,
  Timer,
  ArrowRight,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";
import { MunicipioZMG } from "@/types/crm";
import { CleanScanUVSection } from "@/components/interactive/CleanScanUVSection";
import { SatisfyingWashingSection } from "@/components/interactive/SatisfyingWashingSection";
import { HealthCheckupCalculator } from "@/components/interactive/HealthCheckupCalculator";

export default function Preview3DPage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);

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
            Versión Premium & Clean: Escáner UV + Simulador Succión + Checkup Salud (Sin Ilustraciones de Perritos)
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
        {/* HERO LIMPIO, PROFESIONAL Y ELEGANTE (SIN DIBUJOS)              */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1828] via-[#0E243B] to-[#07111D] text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#36A6DE]/15 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-[#1D71B5]/20 blur-[130px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 shadow-sm text-xs font-heading font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Tecnología Alemana de Inyección-Succión a Domicilio</span>
              </div>

              {/* Titular */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
                Protegemos lo que más tocas.{" "}
                <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                  Limpieza y desinfección profunda con secado express.
                </span>
              </h1>

              {/* Descripción */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Renovamos tus salas, colchones y vestiduras extrayendo el <strong className="text-white font-bold">90% de la humedad</strong> y eliminando ácaros, bacterias y manchas profundas en minutos.
              </p>

              {/* Botones de Conversión */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToWizard()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 shrink-0" />
                  <span>Cotizar y Agendar en Línea</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href="#servicios"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-heading font-bold text-sm sm:text-base px-6 py-4 rounded-2xl border border-white/20 transition-all text-center"
                >
                  <span>Ver Precios y Catálogo</span>
                </a>
              </div>

              {/* 3 Pilares Clínicos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 text-left max-w-3xl mx-auto">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
                    <Timer className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white">Secado en 3 a 4 hrs*</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Usa tus muebles el mismo día sin olor a humedad.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white">Grado Hospitalario</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fórmulas biodegradables sin cloro ni tóxicos.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white">Luz UV Antiácaros</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Especial para alergias, asma y hogares con bebés.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 1. THE CLEAN SCAN™: ESCÁNER DE LUZ UV / RAYOS X                */}
        {/* ============================================================== */}
        <CleanScanUVSection />

        {/* ============================================================== */}
        {/* 2. SIMULADOR SATISFACTORIO DE SUCCIÓN ALEMANA                  */}
        {/* ============================================================== */}
        <SatisfyingWashingSection />

        {/* ============================================================== */}
        {/* 3. CALCULADORA DIAGNÓSTICA DE SALUD TEXTIL                     */}
        {/* ============================================================== */}
        <HealthCheckupCalculator onOpenWizard={(catId) => scrollToWizard(catId)} />

        {/* ============================================================== */}
        {/* 4. CATÁLOGO DE SERVICIOS Y GALERÍA ANTES/DESPUÉS REAL         */}
        {/* ============================================================== */}
        <ServicesSection
          onSelectCategoryForWizard={(catId) => scrollToWizard(catId)}
        />

        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

        {/* 5. AGENTE CONCIERGE WIZARD DE AGENDADO */}
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
