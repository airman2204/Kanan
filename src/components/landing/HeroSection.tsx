"use client";

import React, { useState } from "react";
import {
  Timer,
  FileCheck2,
  CalendarCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Zap,
  Activity,
  Award,
} from "lucide-react";
import { MunicipioZMG } from "@/types/crm";
import { KananLogo } from "@/components/brand/KananLogo";

interface HeroSectionProps {
  selectedMunicipio: MunicipioZMG;
  onOpenWizard: (categoryId?: string) => void;
}

export function HeroSection({ selectedMunicipio, onOpenWizard }: HeroSectionProps) {
  const [activeTabVisual, setActiveTabVisual] = useState<"salas" | "colchones" | "tapetes">("salas");

  const VISUALS = {
    salas: {
      image: "/assets/services/hero-fresh.jpg",
      title: "Salas & Sillones",
      badge: "Inyección-Succión Profunda",
      stat: "3 a 4 hrs*",
      statDesc: "Secado express con turbina de alto vacío",
    },
    colchones: {
      image: "/assets/services/mattress-fresh.jpg",
      title: "Colchones & Cunas",
      badge: "Sanitización UV y Fibras",
      stat: "100%",
      statDesc: "Extracción profunda de ácaros y sudor",
    },
    tapetes: {
      image: "/assets/services/rug-fresh.jpg",
      title: "Tapetes Decorativos",
      badge: "Lavado y Taller",
      stat: "3 días",
      statDesc: "Recolección y entrega a domicilio gratis",
    },
  };

  const currentVisual = VISUALS[activeTabVisual];

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FA] via-white to-[#F4F7F9] pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28"
    >
      {/* Luces difusas de fondo (Glow Glassmorphism) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#36A6DE]/20 to-[#1D71B5]/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#355581]/15 to-[#36A6DE]/10 blur-3xl pointer-events-none -z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* COLUMNA IZQUIERDA: COPYWRITING & CONVERSIÓN */}
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
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#355581] tracking-tight leading-[1.08]">
                Protegemos lo que más tocas.{" "}
                <span className="block mt-1 bg-gradient-to-r from-[#1D71B5] via-[#36A6DE] to-[#355581] bg-clip-text text-transparent">
                  Limpieza y desinfección profunda a domicilio.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl">
                Renovamos tus salas, colchones y vestiduras con tecnología alemana de{" "}
                <strong className="text-[#355581] font-bold">inyección-succión industrial</strong>.
                Eliminamos el 90% de la humedad, manchas profundas y ácaros en minutos.
              </p>
            </div>

            {/* Caja de Conversión Rápida (Estilo Linear/Apple) */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_12px_40px_-10px_rgba(29,113,181,0.12)] space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onOpenWizard()}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  <CalendarCheck className="w-5 h-5 shrink-0" />
                  <span>Cotizar y Agendar en Línea</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center gap-2 bg-[#F4F7F9] hover:bg-slate-200/80 text-[#355581] font-heading font-bold text-sm px-6 py-4 rounded-2xl border border-slate-200 transition-all text-center"
                >
                  <span>Ver Precios y Catálogo</span>
                </a>
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

            {/* 3 Pilares de Confianza y Calidad */}
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

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-[#1D71B5] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#36A6DE] flex items-center justify-center mb-2.5">
                  <FileCheck2 className="w-5 h-5 text-[#1D71B5]" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#355581]">
                  Garantía Kanan Card
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug mt-1">
                  Tarjeta digital con Wallet y 15% de beneficio permanente.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: BENTO GRID EDITORIAL INTERACTIVO */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tabs rápidos para cambiar la muestra fotográfica */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTabVisual("salas")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTabVisual === "salas"
                    ? "bg-[#1D71B5] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salas
              </button>
              <button
                type="button"
                onClick={() => setActiveTabVisual("colchones")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTabVisual === "colchones"
                    ? "bg-[#1D71B5] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Colchones
              </button>
              <button
                type="button"
                onClick={() => setActiveTabVisual("tapetes")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTabVisual === "tapetes"
                    ? "bg-[#1D71B5] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tapetes
              </button>
            </div>

            {/* Card Principal con Imagen y Badges Flotantes */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-white group">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-slate-100">
                <img
                  src={currentVisual.image}
                  alt={currentVisual.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#355581]/80 via-transparent to-black/10" />

                {/* Badge Superior Izquierdo */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-1.5 shadow-md border border-slate-100 flex items-center gap-1.5">
                  <KananLogo variant="color" className="h-5 w-auto" />
                </div>

                {/* Badge Superior Derecho */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#355581] rounded-full px-3 py-1 shadow-md border border-[#36A6DE]/30 flex items-center gap-1.5 text-xs font-heading font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#36A6DE]" />
                  <span>{currentVisual.badge}</span>
                </div>

                {/* Overlay Inferior */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div>
                    <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-cyan-300">
                      Mobiliario Renovado
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-extrabold leading-tight">
                      {currentVisual.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenWizard(activeTabVisual)}
                    className="p-3 rounded-2xl bg-white text-[#1D71B5] hover:bg-cyan-50 transition-colors shadow-lg active:scale-95 shrink-0"
                    title="Cotizar esta categoría"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sub-tarjeta Inferior Integrada */}
              <div className="p-4 bg-gradient-to-r from-[#355581] to-[#1D71B5] text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Timer className="w-5 h-5 text-[#36A6DE]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">
                      Potencia de Extracción
                    </span>
                    <p className="font-heading text-base font-extrabold leading-none mt-0.5">
                      {currentVisual.stat}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-white/80 text-right max-w-[180px] leading-tight">
                  {currentVisual.statDesc}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
