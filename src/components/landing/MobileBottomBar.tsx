"use client";

import React from "react";
import { MessageSquare, PhoneCall, Sparkles } from "lucide-react";

interface MobileBottomBarProps {
  onOpenWizard: () => void;
}

export function MobileBottomBar({ onOpenWizard }: MobileBottomBarProps) {
  const whatsappUrl =
    "https://wa.me/523326154699?text=Hola%20Kanan%2C%20me%20gustar%C3%ADa%20cotizar%20un%20servicio%20de%20limpieza.";
  const phoneUrl = "tel:3326154699";

  return (
    <aside
      aria-label="Acciones rápidas de contacto y cotización móvil"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2.5 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* 1. Botón Llamar */}
        <a
          href={phoneUrl}
          aria-label="Llamar directamente por teléfono"
          className="py-2.5 px-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-[11px] flex flex-col items-center justify-center gap-1 border border-slate-200/80 active:scale-95 transition-transform"
        >
          <PhoneCall className="w-4 h-4 text-[#1D71B5]" />
          <span>Llamar</span>
        </a>

        {/* 2. Botón WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir WhatsApp para atención inmediata"
          className="py-2.5 px-2 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-heading font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>

        {/* 3. Botón Cotizar con Kanan (Abre el chat del perrito) */}
        <button
          type="button"
          onClick={onOpenWizard}
          aria-label="Cotizar con el asistente Kanan"
          className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-transform relative overflow-hidden"
        >
          <div className="relative flex items-center gap-1">
            <span className="relative inline-flex">
              <span className="absolute -inset-0.5 rounded-full bg-cyan-200/70 animate-ping [animation-duration:4s]" />
              <img
                src="/assets/brand/kanan-dog.png"
                alt="Kanan"
                className="relative w-4 h-4 rounded-full border border-white/80 object-cover"
              />
            </span>
            <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
          </div>
          <span>Cotizar</span>
        </button>
      </div>
    </aside>
  );
}
