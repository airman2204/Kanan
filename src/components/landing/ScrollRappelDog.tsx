"use client";

import React, { useEffect, useRef, useState } from "react";

export function ScrollRappelDog() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const hero = document.getElementById("inicio");
      const heroHeight = hero ? hero.offsetHeight : 500;
      const startScroll = Math.max(120, heroHeight * 0.45);
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, startScroll + 1);

      const visible = window.scrollY >= startScroll;
      setIsVisible(visible);

      const next = Math.min(
        1,
        Math.max(0, (window.scrollY - startScroll) / (maxScroll - startScroll))
      );
      setProgress(next);
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Posición vertical del perrito: de 8vh arriba hasta ~76vh abajo
  const topPercent = 8 + progress * 68;
  // Balanceo suave de rappel ligado al scroll
  const swayDeg = Math.sin(progress * Math.PI * 8) * 3.5;

  return (
    <div
      className={`fixed right-3 sm:right-10 lg:right-[11%] top-0 bottom-0 z-30 pointer-events-none select-none transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Cable vertical que se alarga desde arriba hasta las patitas del perrito */}
      <div
        className="absolute top-0 left-[18px] sm:left-[26px] lg:left-[34px] w-[2.5px] bg-gradient-to-b from-slate-400 via-[#1D71B5] to-slate-700 rounded-full shadow-xs"
        style={{
          height: `calc(${topPercent}vh + 34px)`,
        }}
      />

      {/* Perrito bajando por el cable con balanceo suave */}
      <div
        className="relative w-14 sm:w-20 lg:w-28 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translateY(${topPercent}vh) rotate(${swayDeg}deg)`,
        }}
      >
        <img
          src="/images/kanan-rappel.png"
          alt="Kanan bajando por el cable"
          className="w-full h-auto object-contain drop-shadow-[0_8px_16px_rgba(15,36,56,0.22)]"
        />
      </div>
    </div>
  );
}
