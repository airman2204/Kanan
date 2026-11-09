"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Sparkles, MoveHorizontal, CheckCircle2, ShieldCheck, Timer } from "lucide-react";

export function SatisfyingWashingSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#07111D] via-[#0B1E34] to-[#0A1828] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs font-heading font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador de Inyección-Succión Alemana</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Arrastra para limpiar.{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
              La satisfacción de ver la suciedad desaparecer.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Nuestras turbinas extraen el <strong>90% de la humedad</strong> en el mismo instante en que inyectan el desinfectante. Comprueba el poder del antes y después:
          </p>
        </div>

        {/* COMPARADOR SLIDER INTERACTIVO */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            onMouseMove={(e) => handleMove(e.clientX)}
            onTouchMove={(e) => e.touches[0] && handleMove(e.touches[0].clientX)}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 cursor-ew-resize select-none"
          >
            {/* 1. Imagen DESPUÉS (Limpia) */}
            <Image
              src="/assets/portfolio/despues-1.jpg"
              alt="Sillón impecable limpio Kanan"
              fill
              className="object-cover"
            />
            <span className="absolute top-4 right-4 z-10 bg-emerald-500/90 text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
              ✓ DESPUÉS (Kanan)
            </span>

            {/* 2. Imagen ANTES (Sucia) - Recortada según sliderPos */}
            <div
              style={{ width: `${sliderPos}%` }}
              className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.7)]"
            >
              <div className="relative w-full h-full min-w-[700px] sm:min-w-[896px]">
                <Image
                  src="/assets/portfolio/antes-1.jpg"
                  alt="Sillón sucio antes de lavar"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute top-4 left-4 bg-slate-900/90 text-slate-200 text-xs font-heading font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                ANTES (Manchas & Polvo)
              </span>
            </div>

            {/* LÍNEA DIVISORA Y BOQUILLA DE SUCCIÓN */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center justify-center"
            >
              {/* Botón Circular con flechas */}
              <div className="w-11 h-11 rounded-full bg-white text-[#1D71B5] shadow-2xl flex items-center justify-center border-2 border-cyan-400">
                <MoveHorizontal className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Hint inferior */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs text-slate-200 flex items-center gap-2">
              <MoveHorizontal className="w-4 h-4 text-cyan-300" />
              <span>Desliza a la izquierda o derecha para comparar</span>
            </div>
          </div>
        </div>

        {/* 3 Promesas Kanan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <Timer className="w-6 h-6 text-[#36A6DE] shrink-0" />
            <div>
              <span className="font-heading font-bold text-sm block">Secado en 3 a 4 hrs</span>
              <span className="text-[11px] text-slate-400">Usas tus muebles el mismo día</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="font-heading font-bold text-sm block">Sin Olor a Humedad</span>
              <span className="text-[11px] text-slate-400">Fórmulas textiles aromatizadas</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <span className="font-heading font-bold text-sm block">Garantía por Escrito</span>
              <span className="text-[11px] text-slate-400">100% de satisfacción asegurada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
