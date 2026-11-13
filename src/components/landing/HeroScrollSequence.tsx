"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroScrollSequenceProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

export function HeroScrollSequence({ sectionRef }: HeroScrollSequenceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateFromScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = Math.max(rect.height, 1);
      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.min(1, Math.max(0, rawProgress));

      setScrollProgress(progress);

      if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = progress * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.015) {
          video.currentTime = targetTime;
        }
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateFromScroll();
      });
    };

    const onLoadedMetadata = () => {
      updateFromScroll();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });
    updateFromScroll();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateFromScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sectionRef]);

  // Descenso del perrito escalador en el Hero (0px arriba -> 280px abajo)
  const climberY = Math.round(scrollProgress * 280);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Video optimizado con keyframes en cada fotograma (-g 1) */}
      <video
        ref={videoRef}
        src="/videos/hero-sofa-kanan.mp4"
        poster="/images/hero-sofa-kanan.webp"
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 98%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 98%)",
        }}
      />

      {/* Degradado radial blanco suave en el centro para lectura perfecta */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.48)_55%,rgba(244,247,249,0.25)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F4F7F9]" />

      {/* Capa flotante derecha: perrito escalador unido a cuerda vertical */}
      <div className="hidden sm:block absolute top-0 right-4 md:right-10 z-20 pointer-events-none">
        {/* Línea vertical delgada estilo cuerda desde la parte superior */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-slate-400 via-[#1D71B5] to-slate-700 rounded-full"
          style={{
            height: `${climberY + 46}px`,
          }}
        />

        {/* Activo del perrito escalador animado con translate3d */}
        <div
          className="relative w-16 md:w-20 will-change-transform"
          style={{
            transform: `translate3d(0, ${climberY}px, 0)`,
          }}
        >
          <img
            src="/images/kanan-escalador.png"
            alt="Kanan escalador"
            className="w-full h-auto object-contain drop-shadow-[0_10px_18px_rgba(15,36,56,0.22)]"
          />
        </div>
      </div>
    </div>
  );
}
