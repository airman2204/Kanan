"use client";

import React from "react";
import { MessageSquare, Calendar, PhoneCall } from "lucide-react";

interface MobileBottomBarProps {
  onOpenWizard: () => void;
}

export function MobileBottomBar({ onOpenWizard }: MobileBottomBarProps) {
  const whatsappUrl = "https://wa.me/523326154699?text=Hola%20Kanan%2C%20me%20gustar%C3%ADa%20cotizar%20un%20servicio%20de%20limpieza.";

  return (
    <aside
      aria-label="Acciones rápidas de contacto y cotización móvil"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir WhatsApp para atención inmediata"
          className="flex-1 py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onOpenWizard}
          aria-label="Cotizar y agendar servicio de limpieza en línea"
          className="flex-[1.5] py-2.5 px-3 rounded-2xl bg-[#1D71B5] hover:bg-[#355581] text-white font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Calendar className="w-4 h-4 text-[#36A6DE]" />
          <span>Cotizar en Línea</span>
        </button>
      </div>
    </aside>
  );
}
