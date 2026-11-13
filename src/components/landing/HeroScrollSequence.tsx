"use client";

import React, { useEffect, useRef } from "react";

const TOTAL_FRAMES = 95;

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(3, "0");
  return `/hero-sequence/frame_${num}.webp`;
}

interface HeroScrollSequenceProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

export function HeroScrollSequence({ sectionRef }: HeroScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(TOTAL_FRAMES).fill(null)
  );
  const currentFrameRef = useRef<number>(TOTAL_FRAMES - 1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isMounted = true;

    const drawFrame = (frameIndex: number) => {
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(1, Math.floor(rect.width * dpr));
      const targetH = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      // Simular object-cover en canvas
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = targetW / targetH;

      let drawW = targetW;
      let drawH = targetH;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawW = targetW;
        drawH = targetW / imgRatio;
        offsetY = (targetH - drawH) / 2;
      } else {
        drawH = targetH;
        drawW = targetH * imgRatio;
        offsetX = (targetW - drawW) / 2;
      }

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // Cargar el frame inicial inmediatamente (último frame = arriba)
    const initialFrame = TOTAL_FRAMES - 1;
    const firstImg = new Image();
    firstImg.src = getFramePath(initialFrame);
    firstImg.onload = () => {
      if (!isMounted) return;
      imagesRef.current[initialFrame] = firstImg;
      drawFrame(currentFrameRef.current);
    };

    // Precargar el resto de frames en segundo plano
    for (let i = 0; i < TOTAL_FRAMES - 1; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (!isMounted) return;
        imagesRef.current[i] = img;
        if (currentFrameRef.current === i) {
          drawFrame(i);
        }
      };
    }

    const updateFrameFromScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = Math.max(rect.height, 1);
      // Progreso 0 cuando el hero está arriba, 1 cuando termina de salir de pantalla
      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.min(1, Math.max(0, rawProgress));

      const targetFrame = Math.max(
        0,
        TOTAL_FRAMES - 1 - Math.floor(progress * (TOTAL_FRAMES - 1))
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        drawFrame(targetFrame);
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateFrameFromScroll();
      });
    };

    const onResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
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
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Velo suave para mantener legibilidad del texto del hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/65 to-[#F4F7F9]/85" />
    </div>
  );
}
