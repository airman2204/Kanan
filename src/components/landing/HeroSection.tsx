"use client";

import React, { useRef, useState } from "react";
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
import { HeroScrollSequence } from "@/components/landing/HeroScrollSequence";

interface HeroSectionProps {
  selectedMunicipio: MunicipioZMG;
  onOpenWizard: (categoryId?: string) => void;
}

export function HeroSection({ selectedMunicipio, onOpenWizard }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
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
      ref={sectionRef}
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-[#F0F5FA] via-white to-[#F4F7F9] pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28"
    >
      {/* Secuencia de video controlada por scroll en el fondo */}
      <HeroScrollSequence sectionRef={sectionRef} />

      {/* Luces difusas de fondo (Glow Glassmorphism) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#36A6DE]/20 to-[#1D71B5]/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#355581]/15 to-[#36A6DE]/10 blur-3xl pointer-events-none -z-0" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <div className="space-y-6">
          {/* Badges de Cobertura */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#36A6DE]/40 rounded-full px-3.5 py-1.5 shadow-sm text-xs font-heading font-bold text-[#1D71B5]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <MapPin className="w-3.5 h-3.5 text-[#36A6DE]" />
              <span>Servicio a domicilio en Guadalajara y ZMG</span>
            </div>
          </div>

          {/* Titular Principal de Alto Impacto */}
          <div className="space-y-4">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#355581] tracking-tight leading-[1.08]">
              Limpieza y desinfección profunda{" "}
              <span className="block mt-1 bg-gradient-to-r from-[#1D71B5] via-[#36A6DE] to-[#355581] bg-clip-text text-transparent">
                para tus salas, colchones y auto a domicilio.
              </span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Lavado profundo por{" "}
              <strong className="text-[#355581] font-bold">inyección-succión</strong>{" "}
              que elimina manchas, ácaros y malos olores. Extraemos la mayor parte de la humedad para que tus muebles queden limpios, frescos y listos el mismo día.
            </p>
          </div>

          {/* Botón Central de Conversión Rápida */}
          <div className="max-w-md mx-auto space-y-3">
            <button
              type="button"
              onClick={() => onOpenWizard()}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <CalendarCheck className="w-5 h-5 shrink-0" />
              <span>Cotizar y Agendar en Línea</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Cotización al instante y sin compromiso
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#1D71B5] shrink-0" />
                Productos biodegradables seguros para niños y mascotas
              </span>
            </div>
          </div>

          {/* 3 Pilares de Confianza y Calidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 max-w-3xl mx-auto text-left">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-[#36A6DE] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D71B5] flex items-center justify-center mb-2.5">
                <Timer className="w-5 h-5 text-[#36A6DE]" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#355581]">
                Secado rápido el mismo día
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                Vuelve a usar tus muebles en pocas horas gracias a nuestro sistema de extracción profunda.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-emerald-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#355581]">
                Desinfección segura
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                Fórmulas biodegradables libres de cloro y químicos tóxicos. Cuidamos a tu familia y mascotas.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-[#1D71B5] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#36A6DE] flex items-center justify-center mb-2.5">
                <FileCheck2 className="w-5 h-5 text-[#1D71B5]" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#355581]">
                Servicio 100% a domicilio
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                Llevamos todo el equipo necesario hasta tu hogar con puntualidad y total cuidado de tus espacios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
