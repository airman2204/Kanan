"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Eye, Zap, Info } from "lucide-react";

export function CleanScanUVSection() {
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  return (
    <section className="py-16 sm:py-24 bg-[#07111D] text-white relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-4 py-1.5 text-xs font-heading font-extrabold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>The Clean Scan™ • Inspección Ultravioleta en Vivo</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Lo que tus ojos no ven,{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              tu cuerpo sí lo respira.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pasa la <strong>linterna de luz UV germicida</strong> sobre el colchón para revelar la acumulación microscópica de ácaros, polvo y bacterias que extraemos en cada servicio.
          </p>
        </div>

        {/* Lente UV interactivo */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchMove={handleTouchMove}
            onTouchStart={() => setIsHovering(true)}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20 cursor-crosshair select-none bg-slate-900"
          >
            {/* Capa Base: Colchón Limpio Prístino */}
            <Image
              src="/assets/services/mattress-fresh.jpg"
              alt="Colchón sanitizado Kanan"
              fill
              className="object-cover"
            />

            {/* Capa UV Reveladora (Máscara circular recortada sobre la posición de la linterna) */}
            <div
              style={{
                clipPath: `circle(110px at ${lensPos.x}% ${lensPos.y}%)`,
              }}
              className="absolute inset-0 bg-[#0B031A] mix-blend-hard-light transition-[clip-path] duration-75 pointer-events-none"
            >
              {/* Filtro UV de suciedad invisible */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/90 via-violet-950/80 to-indigo-900/90" />
              
              {/* Simulación microscópica de alérgenos y ácaros fluorescentes */}
              <div className="absolute inset-0 opacity-80 mix-blend-screen bg-[radial-gradient(#C084FC_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
              <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(#F43F5E_2.5px,transparent_2.5px)] [background-size:36px_36px]" />
            </div>

            {/* Aro de la linterna UV física */}
            <div
              style={{
                left: `${lensPos.x}%`,
                top: `${lensPos.y}%`,
              }}
              className="absolute w-[220px] h-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-400/90 shadow-[0_0_35px_rgba(192,132,252,0.8),inset_0_0_25px_rgba(168,85,247,0.4)] pointer-events-none flex items-center justify-center transition-[left,top] duration-75"
            >
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-purple-200 bg-purple-950/90 px-2 py-0.5 rounded-full border border-purple-400/50 shadow">
                UV-C 254nm • Scan Activo
              </span>
            </div>

            {/* Badge de ayuda */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-xs text-slate-200 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Mueve el cursor o tu dedo sobre el colchón</span>
            </div>
          </div>
        </div>

        {/* 3 Datos Clínicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="font-heading font-extrabold text-2xl text-purple-300 block">2 Millones</span>
            <span className="text-xs text-slate-400 mt-1 block">de ácaros promedio habitan un colchón con 1 año sin lavar</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="font-heading font-extrabold text-2xl text-cyan-300 block">99.8%</span>
            <span className="text-xs text-slate-400 mt-1 block">de virus, ácaros y bacterias eliminados con luz UV + succión</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="font-heading font-extrabold text-2xl text-emerald-400 block">0 Químicos</span>
            <span className="text-xs text-slate-400 mt-1 block">fórmulas seguras para bebés y mascotas que duermen contigo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
