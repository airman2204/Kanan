"use client";

import React, { useEffect, useRef } from "react";

interface HeroScrollSequenceProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

export function HeroScrollSequence({ sectionRef }: HeroScrollSequenceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

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

      {/* Degradado radial asimétrico: protege texto central y deja nítido al perrito de la izquierda */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 52% 45%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 38%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F4F7F9]" />
    </div>
  );
}
