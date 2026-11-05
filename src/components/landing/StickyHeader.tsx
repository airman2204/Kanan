"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  PhoneCall,
  MessageSquare,
  BookOpen,
  Check,
} from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";
import { MunicipioZMG } from "@/types/crm";
import { KANAN_PHONE_CALL, KANAN_WHATSAPP_NUMBER } from "@/lib/whatsapp/templates";

const MUNICIPIOS: MunicipioZMG[] = [
  "Tlajomulco",
  "Zapopan",
  "Guadalajara",
  "Tlaquepaque",
];

interface StickyHeaderProps {
  selectedMunicipio: MunicipioZMG;
  onSelectMunicipio: (m: MunicipioZMG) => void;
  onOpenWizard: () => void;
  isHalloweenMode?: boolean;
}

export function StickyHeader({
  selectedMunicipio,
  onSelectMunicipio,
  onOpenWizard,
  isHalloweenMode = false,
}: StickyHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-kanan-cyan/15 shadow-[0_4px_24px_-6px_rgba(15,36,56,0.06)]">
      {/* Top Banner de Anuncio Dinámico Tipo Marquee */}
      <div className="bg-gradient-to-r from-kanan-deep via-kanan-cerulean to-kanan-deep text-white text-[11px] sm:text-xs py-1.5 overflow-hidden border-b border-kanan-cyan/30">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap cursor-pointer" onClick={onOpenWizard}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5 font-heading font-extrabold uppercase tracking-wider text-cyan-200">
                <Sparkles className="w-3.5 h-3.5 text-kanan-cyan animate-spin" style={{ animationDuration: "6s" }} />
                ¡Agenda tu cita a domicilio hoy mismo!
              </span>
              <span className="text-white/40">•</span>
              <span className="font-medium text-slate-100">
                Unidades móviles activas en <strong className="text-cyan-300 font-bold">{selectedMunicipio}</strong> y municipios
              </span>
              <span className="text-white/40">•</span>
              <span className="font-semibold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                Secado rápido en 3 a 4 horas*
              </span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                WhatsApp: 33 4335 9207
              </span>
              <span className="text-white/40">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navbar con Logo Grande */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-24">
          {/* Imagotipo Oficial: Centrado o a la izquierda en móvil, visible y nítido */}
          <a
            href="#inicio"
            className="shrink-0 focus:outline-none flex items-center"
            aria-label="Kanan Servicios de Limpieza"
          >
            <KananLogo variant="color" layout="horizontal" size="md" />
          </a>

          {/* Botones de Contacto Rápido y CTA Directos (Visibles ÚNICAMENTE en Desktop/Tablet; en móvil se usa la barra fija inferior) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
            {/* Botón de Llamada Telefónica Directa */}
            <a
              href={`tel:${KANAN_PHONE_CALL}`}
              className="inline-flex items-center justify-center gap-1.5 bg-kanan-ice hover:bg-slate-200/80 text-kanan-deep font-heading font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-slate-200 transition-all shadow-sm active:scale-95 h-11"
              title="Llamar directamente al 33 4016 0684"
            >
              <PhoneCall className="w-4 h-4 text-kanan-cerulean shrink-0" />
              <span>Llamar</span>
            </a>

            {/* Botón de WhatsApp Directo */}
            <a
              href={`https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Kanan Limpieza, deseo cotizar un servicio a domicilio.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-sm transition-all active:scale-95 h-11"
              title="Chat en WhatsApp: 33 4335 9207"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Botón de Cotizar y Agendar Cita */}
            <button
              type="button"
              onClick={onOpenWizard}
              className="group inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-kanan-cyan to-kanan-cerulean hover:from-[#009ec0] hover:to-kanan-navy text-white font-heading font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-cyan-glow transition-all active:scale-95 h-11"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Cotizar y Agendar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
