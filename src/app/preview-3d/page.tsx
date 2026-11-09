"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CalendarCheck,
  Lock,
  MessageSquare,
} from "lucide-react";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";
import { MunicipioZMG } from "@/types/crm";
import { HeroPupShowcase } from "@/components/interactive/HeroPupShowcase";
import { CleanScanUVSection } from "@/components/interactive/CleanScanUVSection";
import { SatisfyingWashingSection } from "@/components/interactive/SatisfyingWashingSection";
import { HealthCheckupCalculator } from "@/components/interactive/HealthCheckupCalculator";
import confetti from "canvas-confetti";

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

  const generateWhatsAppUrl = () => {
    const text = `¡Hola Kanan Limpieza! 🐾 Estuve en la experiencia interactiva de Kanan y deseo agendar mi servicio.`;
    return `https://wa.me/523326154699?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* 1. BADGE FLOTANTE DE ENTORNO PRIVADO */}
      <div className="bg-[#07111D] text-white px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-heading sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">
            Laboratorio Interactivo Kanan: Maqueta HD + Escáner UV + Succión Satisfactoria + Checkup Salud
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
        {/* 1. HERO CON LA MAQUETA HD DE TUS PERRITOS (CALIDAD ÓPTICA 1:1)  */}
        {/* ============================================================== */}
        <section className="relative w-full min-h-[92vh] py-8 lg:py-12 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0A1828] via-[#0E243B] to-[#07111D] text-white">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-[#36A6DE]/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-[#1D71B5]/15 blur-[150px] pointer-events-none" />

          {/* Intro Titular */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 shadow-sm text-xs font-heading font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Diorama Interactivo Kanan • Toca cualquier habitación</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Protegemos lo que más tocas.{" "}
              <span className="block mt-1 bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                Limpieza y desinfección profunda a domicilio.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              Toca cada perrito para ver su tecnología de trabajo o agrega el área a tu cotización al instante.
            </p>
          </div>

          {/* Maqueta HD con Foco Dramático y Resplandor */}
          <div className="relative z-20 w-full max-w-5xl mx-auto px-4 my-4 flex items-center justify-center">
            <HeroPupShowcase
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              cartItems={cartItems}
              onToggleCart={toggleCart}
            />
          </div>

          {/* Botonera de control inferior del Hero */}
          <div className="relative z-30 max-w-4xl mx-auto px-4 w-full">
            <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all border cursor-pointer ${
                    selectedRoomId === null
                      ? "bg-slate-900 text-white border-slate-900 shadow"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Casa Completa
                </button>

                {[
                  { id: "salas", label: "🛋️ Sala" },
                  { id: "colchones", label: "🛏️ Recámara" },
                  { id: "comedor", label: "🍽️ Comedor" },
                  { id: "autos", label: "🚗 Auto" },
                ].map((item) => {
                  const isSelected = selectedRoomId === item.id;
                  const isCarted = cartItems.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRoomId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-[#1D71B5] text-white border-[#1D71B5] ring-2 ring-cyan-300 shadow scale-105"
                          : isCarted
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isCarted ? (
                        <span className="text-emerald-600 font-extrabold">✓</span>
                      ) : (
                        <span className="text-slate-400">+</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => scrollToWizard()}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white font-heading font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Agendar Cita</span>
                </button>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-heading font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp ({cartItems.length})</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. THE CLEAN SCAN™: ESCÁNER DE LUZ UV / RAYOS X                */}
        {/* ============================================================== */}
        <CleanScanUVSection />

        {/* ============================================================== */}
        {/* 3. SIMULADOR SATISFACTORIO DE INYECCIÓN-SUCCIÓN (SLIDER VIVO)  */}
        {/* ============================================================== */}
        <SatisfyingWashingSection />

        {/* ============================================================== */}
        {/* 4. CALCULADORA DE SALUD TEXTIL DIAGNÓSTICA                     */}
        {/* ============================================================== */}
        <HealthCheckupCalculator onOpenWizard={(catId) => scrollToWizard(catId)} />

        {/* ============================================================== */}
        {/* 5. RESTO DE LA LANDING DE KANAN ORIGINAL                      */}
        {/* ============================================================== */}
        <ServicesSection
          onSelectCategoryForWizard={(catId) => scrollToWizard(catId)}
        />

        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

        {/* WIZARD AGENTE CONCIERGE */}
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
