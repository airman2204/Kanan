"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

interface MobileBottomBarProps {
  onOpenWizard: () => void;
}

const KANAN_WHATSAPP_URL =
  "https://wa.me/523343359207?text=Hola%20Kanan%2C%20me%20gustar%C3%ADa%20cotizar%20un%20servicio%20de%20limpieza.";

export function MobileBottomBar({ onOpenWizard }: MobileBottomBarProps) {
  return (
    <aside
      className="md:hidden fixed bottom-3 inset-x-3 z-50 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/60 grid grid-cols-3 gap-2"
      aria-label="Acciones rápidas móviles"
    >
      {/* 1. Botón Llamar */}
      <a
        href="tel:+523343359207"
        className="py-2.5 px-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-[#0B2239] font-heading font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
      >
        <Phone className="w-4 h-4 text-[#1976D2]" />
        <span>Llamar</span>
      </a>

      {/* 2. Botón WhatsApp */}
      <a
        href={KANAN_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="py-2.5 px-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>WhatsApp</span>
      </a>

      {/* 3. Botón Cotizar en azul marino con avatar del perrito asomándose */}
      <button
        type="button"
        onClick={onOpenWizard}
        aria-label="Cotizar con el asistente Kanan"
        className="relative py-2.5 px-2 rounded-xl bg-[#0E2942] hover:bg-[#0B2239] text-white font-heading font-extrabold text-xs flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
      >
        <img
          src="/assets/brand/kanan-dog.png"
          alt="Kanan"
          className="absolute -top-8 right-2 w-11 h-11 rounded-full border-2 border-[#0E2942] bg-[#1976D2] shadow-md object-cover pointer-events-none"
        />
        <span className="pr-3">Cotizar</span>
      </button>
    </aside>
  );
}
