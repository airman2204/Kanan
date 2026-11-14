"use client";

import React from "react";

interface HeroScrollSequenceProps {
  sectionRef?: React.RefObject<HTMLElement | null>;
}

export function HeroScrollSequence({}: HeroScrollSequenceProps) {
  return (
    <div
      className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Video en reproducción automática continua (sin depender del scroll) */}
      <video
        src="/videos/hero-sofa-kanan.mp4"
        poster="/images/hero-sofa-kanan.webp"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-left opacity-100"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 98%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 98%)",
        }}
      />

      {/* Degradado horizontal asimétrico en desktop: deja el lado izquierdo 100% vivo y protege el texto central */}
      <div className="hidden md:block absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0.88)_45%,rgba(255,255,255,0.88)_65%,rgba(255,255,255,0.25)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F4F7F9]" />
    </div>
  );
}
