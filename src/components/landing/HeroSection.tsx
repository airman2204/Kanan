"use client";

import React from "react";
import {
  Timer,
  PawPrint,
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
      {/* Orbes luminosos de frescura (Cian Fresco y Cerúleo suaves) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-kanan-cyan/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-kanan-cerulean/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Tipografía Aireada, Selector Rápido y 3 Pilares */}
          <div className="lg:col-span-6 space-y-6">
            {/* Píldora de Ubicación & Calificación */}
            <div className="inline-flex flex-wrap items-center gap-2 bg-white border border-kanan-cyan/30 rounded-full pl-3 pr-4 py-1.5 shadow-sm">
              <span className="inline-flex items-center gap-1 text-xs font-heading font-bold text-kanan-cerulean">
                <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                {selectedMunicipio}, ZMG
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9 ★ en Google Maps
              </span>
            </div>

            {/* Tagline Oficial con Diseño Fresco y Luminoso */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-kanan-deep tracking-tight leading-[1.08]">
                Protegemos lo que más tocas.{" "}
                <span className="bg-gradient-to-r from-kanan-cerulean via-kanan-cyan to-kanan-navy bg-clip-text text-transparent">
                  Limpieza y desinfección profunda a domicilio.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Transformamos la higiene de tu hogar con tecnología industrial de{" "}
                <strong className="text-kanan-deep">inyección-succión ultrasónica</strong> y
                bioseguridad textil <strong className="text-kanan-cerulean">100% Pet-Friendly</strong>.
                Eliminamos el 99.9% de ácaros, manchas difíciles y olores desde la primera sesión.
              </p>
            </div>

            {/* Selector Interactivo Instantáneo "¿Qué deseas renovar hoy?" */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-kanan space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-kanan-navy flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
                  ¿Qué deseas limpiar y desinfectar hoy?
                </span>
                <span className="text-[11px] font-semibold text-kanan-cyan">
                  Paso 1 de 4 →
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "salas", label: "Salas y Sillas", icon: Sofa },
                  { id: "colchones", label: "Colchones", icon: BedDouble },
                  { id: "vestiduras", label: "Vestiduras Auto", icon: CarFront },
                  { id: "tapetes", label: "Tapetes", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onOpenWizard(item.id)}
                      className="group p-3 rounded-2xl bg-kanan-ice hover:bg-kanan-cyan hover:text-white text-kanan-deep border border-slate-200/80 hover:border-kanan-cyan transition-all flex flex-col items-center justify-center gap-1.5 text-center shadow-sm active:scale-95"
                    >
                      <Icon className="w-5 h-5 text-kanan-cyan group-hover:text-white transition-colors" />
                      <span className="font-heading font-bold text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenWizard()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-cyan-glow transition-all active:scale-95"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>Agendar Cita a Domicilio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#antes-despues"
                  className="inline-flex items-center justify-center gap-1.5 bg-kanan-ice hover:bg-slate-200/70 text-kanan-deep font-heading font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl border border-slate-200 transition-all"
                >
                  <span>Ver Antes y Después</span>
                </a>
              </div>
            </div>

            {/* 3 Pilares de Valor (Tarjetas Frescas y Luminosas) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-kanan-cyan/15 text-kanan-cyan flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    Secado en 3-4 horas
                  </h2>
                  <p className="text-[11px] text-slate-500">Usa tus muebles hoy mismo</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    100% Pet-Friendly
                  </h2>
                  <p className="text-[11px] text-slate-500">Seguro para mascotas y bebés</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-kanan-cerulean/15 text-kanan-cerulean flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                    Garantía por escrito
                  </h2>
                  <p className="text-[11px] text-slate-500">Sello oficial poservicio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Bento Grid Editorial & Fresco */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
              {/* Tarjeta Principal Bento (12 cols): Fotografía Editorial Luminosa */}
              <div className="col-span-12 relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-kanan-lg bg-white group">
                <img
                  src="/assets/services/hero-fresh.jpg"
                  alt="Sala impecable y luminosa con mascota Golden Retriever y bioseguridad Kanan"
                  className="w-full h-[270px] sm:h-[360px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Placa Blanca al 95% de Opacidad (Regla Estricta Manual Pág. 2) */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-slate-200/80">
                  <KananLogo variant="color" className="scale-90 origin-left" />
                </div>

                {/* Píldora flotante derecha: Bioseguridad Activa */}
                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-kanan-deep rounded-full px-3 py-1.5 shadow-md border border-kanan-cyan/30 flex items-center gap-1.5 text-xs font-heading font-bold">
                  <ShieldCheck className="w-4 h-4 text-kanan-cyan" />
                  <span>99.9% Libre de Ácaros</span>
                </div>
              </div>

              {/* Sub-tarjeta Bento Izquierda (7 cols): Kanan Dog Compromiso Pet-Friendly */}
              <div className="col-span-12 sm:col-span-7 bg-white rounded-3xl p-4 border border-slate-200/90 shadow-kanan flex items-center gap-3.5">
                <img
                  src="/assets/brand/kanan-dog.png"
                  alt="Kanan Dog — Mascota Oficial"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-kanan-ice rounded-2xl p-1.5 border border-kanan-cyan/30 shrink-0"
                />
                <div className="min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-kanan-cyan/15 text-kanan-cerulean font-heading font-bold text-[10px] uppercase tracking-wider">
                    Aprobado por Kanan Dog &ldquo;OK&rdquo;
                  </span>
                  <h3 className="font-heading font-extrabold text-sm text-kanan-deep mt-1">
                    Cultura 100% Pet-Friendly
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    Neutralizamos olores orgánicos y pelo de mascota con enzimas naturales sin
                    químicos agresivos.
                  </p>
                </div>
              </div>

              {/* Sub-tarjeta Bento Derecha (5 cols): Indicador de Secado Ultrarrápido */}
              <div className="col-span-12 sm:col-span-5 bg-gradient-to-br from-kanan-navy to-kanan-deep text-white rounded-3xl p-4 shadow-kanan flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-kanan-cyan">
                    Turbina Industrial
                  </span>
                  <Timer className="w-4 h-4 text-kanan-cyan" />
                </div>
                <div className="my-2">
                  <p className="font-heading text-2xl font-extrabold text-white leading-none">
                    3 a 4 hrs
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Extracción del 90% de humedad al instante
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
