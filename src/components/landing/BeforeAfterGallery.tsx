"use client";

import React, { useState } from "react";
import {
  MoveHorizontal,
  Sparkles,
  CalendarCheck,
  Clock,
  PawPrint,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface ComparisonItem {
  id: string;
  category: "salas" | "colchones" | "vestiduras";
  categoryLabel: string;
  zone: string;
  title: string;
  subtitle: string;
  stainType: string;
  dryingTime: string;
  formula: string;
  beforeImg: string;
  afterImg: string;
}

const COMPARISONS: ComparisonItem[] = [
  {
    id: "comp-1",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    zone: "Zapopan • Jardines del Valle",
    title: "Recuperación de Sala Seccional Familiar",
    subtitle:
      "Extracción profunda de manchas acumuladas por uso diario y neutralización de olores orgánicos.",
    stainType: "Tráfico alto + Mascotas",
    dryingTime: "3.5 horas",
    formula: "Enzimática 100% Pet-Friendly",
    beforeImg: "/assets/portfolio/antes-1.jpg",
    afterImg: "/assets/portfolio/despues-1.jpg",
  },
  {
    id: "comp-2",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    zone: "Guadalajara • Col. Providencia",
    title: "Desmanchado Textil sin Decoloración",
    subtitle:
      "Devolvemos el tono uniforme original de la tapicería mediante inyección-succión controlada.",
    stainType: "Derrames de bebidas y polvo",
    dryingTime: "3 horas",
    formula: "Oxi-Bioseguridad Textil",
    beforeImg: "/assets/portfolio/antes-2.jpg",
    afterImg: "/assets/portfolio/despues-2.jpg",
  },
  {
    id: "comp-3",
    category: "colchones",
    categoryLabel: "Colchones",
    zone: "Tlajomulco • Lomas de San Agustín",
    title: "Sanitización y Desmanchado de Colchón",
    subtitle:
      "Eliminación de aureolas, sudor, ácaros y alérgenos con cepillado suave de alta precisión.",
    stainType: "Aureolas + Ácaros",
    dryingTime: "3.5 horas",
    formula: "Hipoalergénica Anti-Ácaros",
    beforeImg: "/assets/portfolio/antes-3.jpg",
    afterImg: "/assets/portfolio/despues-3.jpg",
  },
  {
    id: "comp-4",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    zone: "Zapopan • Puerta de Hierro",
    title: "Limpieza Profunda Hogar Pet-Friendly",
    subtitle:
      "Extracción de pelo incrustado y manchas orgánicas dejando aroma fresco y fibras suaves.",
    stainType: "Huellas y grasa orgánica",
    dryingTime: "3 horas",
    formula: "Bio-Enzimática Kanan Dog",
    beforeImg: "/assets/portfolio/antes-4.jpg",
    afterImg: "/assets/portfolio/despues-4.jpg",
  },
  {
    id: "comp-5",
    category: "vestiduras",
    categoryLabel: "Vestiduras y Tapicería",
    zone: "Guadalajara • Chapalita",
    title: "Renovación de Tapicería en Tonos Claros",
    subtitle:
      "Restauración luminosa de tejidos claros sin dejar cercos de humedad gracias al alto vacío.",
    stainType: "Oscurecimiento por roce",
    dryingTime: "3.5 horas",
    formula: "Espuma Activa de Baja Humedad",
    beforeImg: "/assets/portfolio/antes-5.jpg",
    afterImg: "/assets/portfolio/despues-5.jpg",
  },
  {
    id: "comp-6",
    category: "colchones",
    categoryLabel: "Colchones y Descanso",
    zone: "Tlaquepaque • Residencial",
    title: "Restauración de Higiene para el Descanso",
    subtitle:
      "Desinfección integral que devuelve la blancura y frescura para dormir esa misma noche.",
    stainType: "Manchas profundas y polvo",
    dryingTime: "4 horas",
    formula: "Sanitizante Clínico Textil",
    beforeImg: "/assets/portfolio/antes-6.jpg",
    afterImg: "/assets/portfolio/despues-6.jpg",
  },
];

export function BeforeAfterGallery({ onOpenWizard }: { onOpenWizard: () => void }) {
  const [selectedCase, setSelectedCase] = useState<ComparisonItem>(COMPARISONS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <section
      id="antes-despues"
      className="py-16 sm:py-24 bg-gradient-to-b from-kanan-ice via-white to-kanan-ice border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Encabezado Fresco */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-kanan-cyan/30 text-kanan-cerulean font-heading font-bold text-xs uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
              Evidencia Real sin Filtros
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-kanan-deep mt-3 tracking-tight">
              Laboratorio Interactivo{" "}
              <span className="text-kanan-cyan">&ldquo;Antes y Después&rdquo;</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Desliza el comparador o selecciona un caso real en Guadalajara y Zapopan para ver la
              diferencia de nuestra extracción profunda.
            </p>
          </div>

          {/* Botones de posición rápida del deslizador */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSliderPos(85)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                sliderPos > 65
                  ? "bg-kanan-deep text-white"
                  : "text-slate-500 hover:text-kanan-deep"
              }`}
            >
              Ver Antes
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(50)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                sliderPos >= 35 && sliderPos <= 65
                  ? "bg-kanan-cyan text-white"
                  : "text-slate-500 hover:text-kanan-deep"
              }`}
            >
              50 / 50
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(15)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                sliderPos < 35
                  ? "bg-kanan-cerulean text-white"
                  : "text-slate-500 hover:text-kanan-deep"
              }`}
            >
              Ver Después
            </button>
          </div>
        </div>

        {/* Layout Showcase: Visor Principal Izquierdo (7 cols) + Selector y Ficha Técnica Derecha (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* VISOR INTERACTIVO PRINCIPAL */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-kanan-lg space-y-4">
            <div className="relative h-[300px] sm:h-[430px] w-full rounded-2xl overflow-hidden select-none bg-slate-900">
              {/* Imagen DESPUÉS (Fondo) */}
              <img
                src={selectedCase.afterImg}
                alt={`Después: ${selectedCase.title}`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* Imagen ANTES (Clip dinámico) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={selectedCase.beforeImg}
                  alt={`Antes: ${selectedCase.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Placas flotantes al 95% de opacidad */}
              <span className="absolute top-3.5 left-3.5 z-10 bg-kanan-deep/90 backdrop-blur-md text-white text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow">
                Antes del Servicio
              </span>
              <span className="absolute top-3.5 right-3.5 z-10 bg-white/95 backdrop-blur-md text-kanan-deep text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow border border-kanan-cyan/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-kanan-cyan" />
                Resultado Kanan
              </span>

              {/* Línea divisoria + Handle Cian Fresco */}
              <div
                className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.7)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-kanan-cyan text-white border-4 border-white shadow-cyan-glow flex items-center justify-center">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>

              {/* Input range táctil para celular y mouse */}
              <input
                type="range"
                min={2}
                max={98}
                value={sliderPos}
                aria-label="Deslizar para comparar antes y después"
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0"
              />
            </div>

            {/* Ficha Técnica Inferior del Caso Seleccionado */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-kanan-ice rounded-2xl p-3 sm:p-4 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kanan-cyan shrink-0 hidden sm:block" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Diagnóstico
                  </span>
                  <span className="font-heading font-bold text-xs text-kanan-deep">
                    {selectedCase.stainType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-kanan-cyan shrink-0 hidden sm:block" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Fórmula Aplicada
                  </span>
                  <span className="font-heading font-bold text-xs text-kanan-cerulean">
                    {selectedCase.formula}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-kanan-cyan shrink-0 hidden sm:block" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Tiempo de Secado
                  </span>
                  <span className="font-heading font-bold text-xs text-kanan-deep">
                    {selectedCase.dryingTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: SELECTOR DE CASOS REALES (6 Miniaturas Interactivas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-kanan space-y-4">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-kanan-cerulean">
                  {selectedCase.zone}
                </span>
                <h3 className="font-heading text-xl font-extrabold text-kanan-deep mt-1">
                  {selectedCase.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {selectedCase.subtitle}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400 block">
                  Explora otros casos reales ({COMPARISONS.length}):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                  {COMPARISONS.map((item, idx) => {
                    const active = selectedCase.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedCase(item);
                          setSliderPos(50);
                        }}
                        className={`group p-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          active
                            ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                            : "bg-kanan-ice hover:bg-white text-kanan-deep border-slate-200"
                        }`}
                      >
                        <img
                          src={item.afterImg}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/20"
                        />
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase block ${
                              active ? "text-kanan-cyan" : "text-kanan-cerulean"
                            }`}
                          >
                            Caso 0{idx + 1}
                          </span>
                          <p className="font-heading font-bold text-xs truncate">
                            {item.categoryLabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenWizard}
                className="w-full py-4 px-5 rounded-2xl bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-sm shadow-cyan-glow flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Quiero un Resultado Así en Casa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
