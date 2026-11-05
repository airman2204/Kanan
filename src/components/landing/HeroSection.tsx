"use client";

import React from "react";
import {
  Timer,
  FileCheck2,
  CalendarCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  Sofa,
  BedDouble,
  CarFront,
  ShieldCheck,
  Star,
  CheckCircle2,
} from "lucide-react";
import { MunicipioZMG } from "@/types/crm";
import { KananLogo } from "@/components/brand/KananLogo";

interface HeroSectionProps {
  selectedMunicipio: MunicipioZMG;
  onOpenWizard: (categoryId?: string) => void;
}

export function HeroSection({ selectedMunicipio, onOpenWizard }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-[#F4F7F9] via-white to-[#F4F7F9] pt-6 pb-14 sm:py-14 lg:py-20"
    >
      {/* Orbes luminosos de frescura */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-kanan-cyan/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-kanan-cerulean/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Tipografía, Selector Rápido y Pilares */}
          <div className="lg:col-span-6 space-y-6">
            {/* Píldora de Ubicación & Calificación */}
            <div className="inline-flex flex-wrap items-center gap-2 bg-white border border-kanan-cyan/30 rounded-full pl-3 pr-4 py-1.5 shadow-sm">
              <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-kanan-cerulean">
                <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                Cobertura en {selectedMunicipio} y municipios
              </span>
              <span className="text-slate-300">•</span>
              <a
                href="#opiniones"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9 ★ en Google Maps
              </a>
            </div>

            {/* Tagline Oficial */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-kanan-deep tracking-tight leading-[1.08]">
                Protegemos lo que más tocas.{" "}
                <span className="bg-gradient-to-r from-kanan-cerulean via-kanan-cyan to-kanan-navy bg-clip-text text-transparent">
                  Limpieza y desinfección profunda a domicilio.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Transformamos la higiene de tus muebles con tecnología industrial de{" "}
                <strong className="text-kanan-deep">inyección-succión profunda</strong> y desinfección profesional de telas.
                Remoción profunda de polvo, suciedad acumulada, manchas comunes y olores desde la primera sesión.
              </p>
            </div>

            {/* Acciones Principales y Claras */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-kanan space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onOpenWizard()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-cyan-glow transition-all active:scale-95"
                >
                  <CalendarCheck className="w-5 h-5 shrink-0" />
                  <span>Cotizar y Agendar a Domicilio</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center gap-1.5 bg-kanan-ice hover:bg-slate-200/70 text-kanan-deep font-heading font-bold text-sm px-6 py-4 rounded-2xl border border-slate-200 transition-all text-center"
                >
                  <span>Ver Servicios y Precios</span>
                </a>
              </div>
              <p className="text-xs text-slate-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Cotización instantánea en menos de 2 minutos • Sin compromiso
              </p>
            </div>

            {/* 3 Pilares de Valor (Sin Pet-Friendly, Garantía de Satisfacción y Secado con Clima) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-kanan-cyan/15 text-kanan-cyan flex items-center justify-center shrink-0 mt-0.5">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    Secado en 3-4 horas*
                  </h2>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Usa tus muebles hoy mismo. *Este tiempo dependerá de la ventilación y las condiciones del clima.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    Desinfección Profunda
                  </h2>
                  <p className="text-[11px] text-slate-500">Sanitización profunda de fibras y telas</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-kanan-cerulean/15 text-kanan-cerulean flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    Garantía de Satisfacción
                  </h2>
                  <p className="text-[11px] text-slate-500">Revisión junto contigo al terminar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Bento Grid con Fotografía Editorial y Extracción */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
              
              {/* Tarjeta Principal Bento */}
              <div className="col-span-12 relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-kanan-lg bg-white group">
                <img
                  src="/assets/services/hero-fresh.jpg"
                  alt="Sala limpia y renovada por Kanan Limpieza"
                  className="w-full h-[270px] sm:h-[360px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />

                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-slate-200/80">
                  <KananLogo variant="color" className="scale-90 origin-left" />
                </div>

                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-kanan-deep rounded-full px-3 py-1.5 shadow-md border border-kanan-cyan/30 flex items-center gap-1.5 text-xs font-heading font-bold">
                  <ShieldCheck className="w-4 h-4 text-kanan-cyan" />
                  <span>Sanitización Profunda</span>
                </div>
              </div>

              {/* Sub-tarjeta Bento Izquierda: Protocolo Textil de Alto Vacío */}
              <div className="col-span-12 sm:col-span-7 bg-white rounded-3xl p-4 border border-slate-200/90 shadow-kanan flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-kanan-ice flex items-center justify-center text-kanan-cerulean shrink-0 border border-kanan-cyan/30">
                  <ShieldCheck className="w-6 h-6 text-kanan-cyan" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-extrabold text-sm text-kanan-deep">
                    Cuidado Especializado de Telas
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    Fórmulas biodegradables que neutralizan suciedad y olores acumulados sin maltratar tejidos ni dejar residuos químicos.
                  </p>
                </div>
              </div>

              {/* Sub-tarjeta Bento Derecha: Indicador de Secado */}
              <div className="col-span-12 sm:col-span-5 bg-gradient-to-br from-kanan-navy to-kanan-deep text-white rounded-3xl p-4 shadow-kanan flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-kanan-cyan">
                    Turbina Industrial
                  </span>
                  <Timer className="w-4 h-4 text-kanan-cyan" />
                </div>
                <div className="my-2">
                  <p className="font-heading text-2xl font-extrabold text-white leading-none">
                    3 a 4 hrs*
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Extracción del 90% de humedad al instante
                  </p>
                  <p className="text-[10px] text-cyan-200/90 mt-1 leading-snug">
                    *Este tiempo dependerá de la ventilación y las condiciones del clima.
                  </p>
                </div>
                <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                  <div className="bg-kanan-cyan h-full w-[90%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
