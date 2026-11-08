"use client";

import React, { useState } from "react";
import {
  MoveHorizontal,
  CalendarCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface ComparisonItem {
  id: string;
  category: "salas" | "colchones" | "vestiduras" | "tapetes";
  categoryLabel: string;
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
    title: "Sofá Cama Terracota",
    subtitle:
      "Extracción profunda de suciedad, polvo incrustado y aureolas oscuras en tapicería de microfibra.",
    stainType: "Uso diario y polvo profundo",
    dryingTime: "3 a 4 hrs*",
    formula: "Inyección-Succión Industrial",
    beforeImg: "/assets/portfolio/sofacama-antes.jpg",
    afterImg: "/assets/portfolio/sofacama-despues.jpg",
  },
  {
    id: "comp-2",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    title: "Sillón Loveseat Café",
    subtitle:
      "Desmanchado textil en cojines de asiento y respaldo capitonado devolviendo el color uniforme.",
    stainType: "Aureolas y roce continuo",
    dryingTime: "3 a 4 hrs*",
    formula: "Limpieza Profunda",
    beforeImg: "/assets/portfolio/sillon-cafe-antes.jpg",
    afterImg: "/assets/portfolio/sillon-cafe-despues.jpg",
  },
  {
    id: "comp-3",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    title: "Silla de Comedor con Brazos de Madera",
    subtitle:
      "Restauración completa de tapicería clara en asiento y respaldo sin dejar cercos de humedad.",
    stainType: "Manchas por alimentos y polvo",
    dryingTime: "3 a 4 hrs*",
    formula: "Espuma Activa Kärcher",
    beforeImg: "/assets/portfolio/silla-madera-antes.jpg",
    afterImg: "/assets/portfolio/silla-madera-despues.jpg",
  },
  {
    id: "comp-4",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    title: "Silla de Comedor Respaldo Alto",
    subtitle:
      "Extracción profunda en tejido fino eliminando manchas oscuras por fricción y polvo.",
    stainType: "Suciedad concentrada y grasa",
    dryingTime: "3 a 4 hrs*",
    formula: "Inyección-Succión Kanan",
    beforeImg: "/assets/portfolio/silla-alta-antes.jpg",
    afterImg: "/assets/portfolio/silla-alta-despues.jpg",
  },
  {
    id: "comp-5",
    category: "salas",
    categoryLabel: "Salas y Sillas",
    title: "Banca Capitonada Gris",
    subtitle:
      "Limpieza profunda en tapicería gris con botones capitonados eliminando aureolas y suciedad.",
    stainType: "Oscurecimiento por uso",
    dryingTime: "3 a 4 hrs*",
    formula: "Limpieza Profunda",
    beforeImg: "/assets/portfolio/banca-antes.jpg",
    afterImg: "/assets/portfolio/banca-despues.jpg",
  },
  {
    id: "comp-6",
    category: "vestiduras",
    categoryLabel: "Vestiduras Auto",
    title: "Asientos Automotrices de Tela",
    subtitle:
      "Extracción profunda de sudor, polvo y derrames en vestiduras automotrices dejándolas limpias y frescas.",
    stainType: "Tráfico vehicular y polvo",
    dryingTime: "3 a 4 hrs*",
    formula: "Baja Humedad Cabina",
    beforeImg: "/assets/portfolio/antes-4.jpg",
    afterImg: "/assets/portfolio/despues-4.jpg",
  },
  {
    id: "comp-7",
    category: "tapetes",
    categoryLabel: "Tapetes",
    title: "Tapete Decorativo Geométrico",
    subtitle:
      "Lavado profundo por inmersión y centrifugado en taller devolviendo brillo y textura a las fibras.",
    stainType: "Tráfico de calzado y polvo",
    dryingTime: "Secado en Taller (3 días)",
    formula: "Sanitizante Especializado",
    beforeImg: "/assets/portfolio/antes-6.jpg",
    afterImg: "/assets/portfolio/despues-6.jpg",
  },
];

export function BeforeAfterGallery({ onOpenWizard }: { onOpenWizard: () => void }) {
  const [selectedCase, setSelectedCase] = useState<ComparisonItem>(COMPARISONS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [mostrarTodosMovil, setMostrarTodosMovil] = useState(false);

  return (
    <section
      id="antes-despues"
      className="py-16 sm:py-24 bg-gradient-to-b from-kanan-ice via-white to-kanan-ice border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Encabezado Limpio */}
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-kanan-deep tracking-tight">
            Antes y Después
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Desliza las flechas sobre la foto para ver los resultados reales de nuestra extracción profunda.
          </p>
        </div>

        {/* Layout Showcase: Visor Principal Izquierdo (7 cols) + Selector y Ficha Técnica Derecha (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* VISOR INTERACTIVO PRINCIPAL (SIN BOTONES 50/50, SOLO SLIDER TÁCTIL) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-kanan-lg space-y-4">
            <div className="relative h-[320px] sm:h-[450px] w-full rounded-2xl overflow-hidden select-none bg-slate-900">
              
              {/* Imagen DESPUÉS (Fondo) */}
              <img
                src={selectedCase.afterImg}
                alt={`Después: ${selectedCase.title}`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* Imagen ANTES (Clip dinámico con el slider) */}
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

              {/* Placas indicadoras sutiles */}
              <span className="absolute top-3.5 left-3.5 z-10 bg-kanan-deep/90 backdrop-blur-md text-white text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow">
                Antes
              </span>
              <span className="absolute top-3.5 right-3.5 z-10 bg-white/95 backdrop-blur-md text-kanan-deep text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow border border-kanan-cyan/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-kanan-cyan" />
                Después
              </span>

              {/* Línea divisoria interactiva con flechas */}
              <div
                className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.7)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-kanan-cyan text-white border-4 border-white shadow-cyan-glow flex items-center justify-center">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>

              {/* Input range táctil invisible para deslizar suavemente en móvil y mouse */}
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

            {/* Tira Horizontal de Miniaturas Rápidas para Móvil y Desktop */}
            <div className="pt-1">
              <span className="text-[11px] font-heading font-bold text-slate-400 block mb-2 px-1">
                Toca cualquier foto para comparar:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                      className={`shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all ${
                        active
                          ? "bg-kanan-navy text-white border-kanan-navy shadow-md ring-2 ring-kanan-cyan/50"
                          : "bg-kanan-ice hover:bg-white text-kanan-deep border-slate-200 hover:border-kanan-cyan/40"
                      }`}
                    >
                      <img
                        src={item.afterImg}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="text-left">
                        <span
                          className={`text-[9px] font-bold uppercase block ${
                            active ? "text-kanan-cyan" : "text-kanan-cerulean"
                          }`}
                        >
                          Caso 0{idx + 1}
                        </span>
                        <p className="font-heading font-bold text-xs whitespace-nowrap">
                          {item.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha Técnica Inferior del Caso Seleccionado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-kanan-ice rounded-2xl p-3 sm:p-4 border border-slate-200/80">
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
                <div className="w-2 h-2 rounded-full bg-kanan-cyan shrink-0 hidden sm:block" />
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
                  <span className="block text-[9px] text-slate-400 leading-tight">
                    *Sujeto a ventilación y clima
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: SELECTOR DE CASOS REALES */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-kanan space-y-4">
              <div>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-kanan-cerulean">
                  {selectedCase.categoryLabel}
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
                  Resultados Reales ({COMPARISONS.length}):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                  {(mostrarTodosMovil ? COMPARISONS : COMPARISONS.slice(0, 4)).map((item, idx) => {
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
                            {item.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!mostrarTodosMovil && COMPARISONS.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setMostrarTodosMovil(true)}
                    className="w-full py-2 text-xs font-heading font-bold text-[#1D71B5] hover:text-[#355581] border border-blue-200 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                  >
                    Ver los {COMPARISONS.length} casos completos
                  </button>
                )}
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
