"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Droplets, Wind, ArrowDown } from "lucide-react";

export function CinematicSofaScroll() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Textos cinemáticos que se activan por fases
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const phase4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    gsap.registerPlugin(ScrollTrigger);

    // 1. Inicializar Lenis dinámicamente solo en el cliente
    let lenisInstance: any = null;
    let rafId: number | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisInstance.on("scroll", ScrollTrigger.update);

      function raf(time: number) {
        if (lenisInstance) lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }).catch((e) => console.warn("Lenis skipped:", e));

    // 2. Preparar el Canvas y las imágenes para la transición
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cargar imagen de Sillón Antes y Después de forma segura
    const imgDirty = new Image();
    const imgClean = new Image();
    let imagesLoaded = 0;

    const checkLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        renderFrame(0);
      }
    };

    imgDirty.onload = checkLoaded;
    imgClean.onload = checkLoaded;
    imgDirty.src = "/assets/portfolio/sillon-cafe-antes.jpg";
    imgClean.src = "/assets/portfolio/sillon-cafe-despues.jpg";

    const renderFrame = (progress: number) => {
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Dibujar imagen limpia de base
      ctx.drawImage(imgClean, 0, 0, w, h);

      // Dibujar capa sucia encima con máscara
      if (progress < 1) {
        ctx.save();
        const splitX = w * (1 - progress);

        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();
        ctx.drawImage(imgDirty, 0, 0, w, h);
        ctx.restore();

        // Efecto visual: Línea de vapor
        if (progress > 0.02 && progress < 0.98) {
          ctx.save();
          const grad = ctx.createLinearGradient(splitX - 30, 0, splitX + 30, 0);
          grad.addColorStop(0, "rgba(56, 189, 248, 0)");
          grad.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
          grad.addColorStop(1, "rgba(56, 189, 248, 0)");

          ctx.fillStyle = grad;
          ctx.fillRect(splitX - 25, 0, 50, h);

          for (let i = 0; i < 15; i++) {
            const py = (h * ((i * 7 + progress * 50) % 100)) / 100;
            const radius = 3 + (i % 4) * 2;
            ctx.beginPath();
            ctx.arc(splitX + Math.sin(py) * 15, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(224, 242, 254, 0.4)";
            ctx.fill();
          }
          ctx.restore();
        }
      }
    };

    const scrollObj = { progress: 0 };

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(scrollObj.progress);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let stInstance: any = null;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollObj.progress = self.progress;
          renderFrame(self.progress);
        },
      },
    });
    stInstance = tl.scrollTrigger;

    tl.to(phase1Ref.current, { opacity: 0, y: -40, duration: 0.5 }, 0.2)
      .fromTo(phase2Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
      .to(phase2Ref.current, { opacity: 0, y: -40, duration: 0.5 }, 0.6)
      .fromTo(phase3Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, 0.7)
      .to(phase3Ref.current, { opacity: 0, y: -40, duration: 0.5 }, 1.1)
      .fromTo(phase4Ref.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }, 1.3);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (stInstance) stInstance.kill();
      tl.kill();
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#030712] overflow-hidden select-none">
      {/* Canvas cinematográfico */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Capa de atmósfera oscura cinematográfica con viñeta de lente */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/85 pointer-events-none" />

      {/* Indicador de Barra Cinemática (Cinemascope 21:9 Letterbox) */}
      <div className="absolute top-0 inset-x-0 h-10 sm:h-14 bg-black/80 backdrop-blur-md z-30 flex items-center justify-between px-6 sm:px-12 border-b border-white/10">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Cinematic Experience • Kanan Deep Clean</span>
        </div>
        <span className="font-mono text-xs text-slate-400 hidden sm:inline">
          4K ULTRA EXTRACTION SYSTEM
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-10 sm:h-14 bg-black/80 backdrop-blur-md z-30 flex items-center justify-between px-6 sm:px-12 border-t border-white/10 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          Haz scroll para iniciar la desinfección
        </span>
        <span className="font-mono text-slate-500">INYECCIÓN-SUCCIÓN ALEMANA 2026</span>
      </div>

      {/* TEXTOS CINEMÁTICOS SINCRONIZADOS */}
      <div className="relative z-20 h-full flex items-center justify-center pointer-events-none px-6">
        {/* FASE 1: Estado Inicial */}
        <div ref={phase1Ref} className="text-center max-w-2xl space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Estado 01 • Suciedad & Ácaros
          </span>
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
            Años de uso acumulados en la fibra.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light max-w-lg mx-auto">
            Polvo microscópico, sudor y bacterias quedan atrapados bajo la superficie. Desliza para transformar.
          </p>
        </div>

        {/* FASE 2: Inyección de Vapor y Fórmulas */}
        <div ref={phase2Ref} className="absolute text-center max-w-2xl space-y-3 opacity-0">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit mx-auto">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            Estado 02 • Inyección Hidrostática
          </span>
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
            Vapor a alta presión desintegra la mancha.
          </h2>
          <p className="text-cyan-100 text-sm sm:text-base font-light max-w-lg mx-auto">
            Fórmulas bio-enzimáticas neutralizan olores y despegan el residuo sin desgastar el tejido.
          </p>
        </div>

        {/* FASE 3: Succión Doble Turbina */}
        <div ref={phase3Ref} className="absolute text-center max-w-2xl space-y-3 opacity-0">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400 bg-sky-950/60 border border-sky-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit mx-auto">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            Estado 03 • Succión 90% en Seco
          </span>
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
            El agua oscura se va en segundos.
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-light max-w-lg mx-auto">
            Turbinas de alto vacío extraen la suciedad líquida al instante. Muebles listos para disfrutarse hoy.
          </p>
        </div>

        {/* FASE 4: Resultado Impecable Final */}
        <div ref={phase4Ref} className="absolute text-center max-w-2xl space-y-4 opacity-0">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Resultado Final • 100% Desinfectado
          </span>
          <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-none drop-shadow-2xl">
            Como el día que lo compraste.
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base font-light max-w-lg mx-auto">
            Textura suave renovada, aroma fresco y protección antiácaros certificada para toda la familia.
          </p>
        </div>
      </div>
    </div>
  );
}
