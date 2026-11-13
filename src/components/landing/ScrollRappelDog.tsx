"use client";

import React, { useEffect, useRef } from "react";

export function ScrollRappelDog() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dogRef = useRef<HTMLDivElement | null>(null);
  const ropeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let currentY = window.innerHeight * 0.18;
    let targetY = currentY;
    let isRunning = true;

    const computeTarget = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      const minY = window.innerHeight * 0.18;
      const maxY = window.innerHeight * 0.75;
      targetY = minY + progress * (maxY - minY);

      // Desvanecer suavemente al llegar al footer / botón flotante de chat
      if (containerRef.current) {
        const fadeOut = progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) / 0.1) : 1;
        containerRef.current.style.opacity = String(fadeOut);
      }
    };

    const tick = () => {
      if (!isRunning) return;
      currentY += (targetY - currentY) * 0.14;

      if (dogRef.current) {
        dogRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }
      if (ropeRef.current) {
        // Cuerda desde top-0 hasta las manos del perrito (~58px debajo del borde superior de la imagen)
        ropeRef.current.style.height = `${Math.max(0, currentY + 58).toFixed(2)}px`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    computeTarget();
    rafId = window.requestAnimationFrame(tick);

    window.addEventListener("scroll", computeTarget, { passive: true });
    window.addEventListener("resize", computeTarget, { passive: true });

    return () => {
      isRunning = false;
      window.removeEventListener("scroll", computeTarget);
      window.removeEventListener("resize", computeTarget);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 right-10 lg:right-14 z-30 pointer-events-none select-none transition-opacity duration-200"
      aria-hidden="true"
    >
      {/* Línea vertical oscura estilo cuerda anclada arriba hasta las manos del perrito */}
      <div
        ref={ropeRef}
        className="absolute top-0 left-[26%] w-[2.5px] bg-slate-800 rounded-full"
        style={{ height: "18vh" }}
      />

      {/* Perrito escalador con proporción igual al de la aspiradora */}
      <div
        ref={dogRef}
        className="relative w-44 lg:w-48 will-change-transform"
        style={{ transform: "translate3d(0, 18vh, 0)" }}
      >
        <img
          src="/images/kanan-escalador.png"
          alt="Kanan escalador"
          className="w-full h-auto object-contain drop-shadow-md"
        />
      </div>
    </div>
  );
}
