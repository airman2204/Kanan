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
      {/* Top Pill Bar — Fresca y Luminosa */}
      <div className="bg-gradient-to-r from-kanan-ice via-[#E6F7FB] to-kanan-ice border-b border-kanan-cyan/20 text-kanan-deep text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-white text-kanan-cerulean font-heading font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-kanan-cyan/30 shrink-0">
              <span className="w-2 h-2 rounded-full bg-kanan-cyan animate-ping" />
              Bioseguridad Textil
            </span>
            {isHalloweenMode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-heading font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-300/40 shrink-0 animate-pulse">
                🦇 Modo Halloween 🎃
              </span>
            )}
            <span className="truncate font-medium text-slate-600">
              Unidades móviles hoy en <strong className="text-kanan-deep">{selectedMunicipio}</strong> • Secado en 3-4h
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/guia-cuidados"
              className="hidden md:inline-flex items-center gap-1 font-semibold text-kanan-cerulean hover:text-kanan-deep transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-kanan-cyan" />
              <span>Guía Ante Derrames</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-kanan-deep hover:text-white text-kanan-deep px-3 py-0.5 rounded-full font-heading font-bold transition-all border border-slate-200 shadow-sm"
            >
              <LayoutDashboard className="w-3 h-3 text-kanan-cyan" />
              <span>CRM</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar con Logo Grande */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-3">
          {/* Imagotipo Oficial en Tamaño Grande */}
          <a
            href="#inicio"
            className="shrink-0 focus:outline-none"
            aria-label="Kanan Servicios de Limpieza"
          >
            <KananLogo variant="color" layout="horizontal" size="md" />
          </a>

          {/* Selector de Cobertura Tipo Cápsula Flotante (Desktop) */}
          <div className="hidden lg:flex items-center bg-kanan-ice/90 p-1 rounded-full border border-slate-200/80 shadow-inner">
            <div className="flex items-center gap-1 px-2.5 text-xs font-heading font-bold text-kanan-cerulean">
              <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
              <span>ZMG:</span>
            </div>
            {MUNICIPIOS.map((mun) => {
              const active = selectedMunicipio === mun;
              return (
                <button
                  key={mun}
                  type="button"
                  onClick={() => onSelectMunicipio(mun)}
                  className={`px-3 py-1.5 rounded-full text-xs font-heading font-bold transition-all ${
                    active
                      ? "bg-white text-kanan-deep shadow-sm border border-kanan-cyan/30"
                      : "text-slate-500 hover:text-kanan-deep"
                  }`}
                >
                  {active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-kanan-cyan mr-1.5 align-middle" />}
                  {mun}
                </button>
              );
            })}
          </div>

          {/* Navegación Moderna */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-heading font-bold text-slate-600">
            <a href="#servicios" className="hover:text-kanan-cyan transition-colors">
              Tecnología &amp; Servicios
            </a>
            <a href="#antes-despues" className="hover:text-kanan-cyan transition-colors">
              Resultados Reales
            </a>
            <a href="#agendar" className="hover:text-kanan-cyan transition-colors">
              Cotizador 4 Pasos
            </a>
            <a href="#opiniones" className="hover:text-kanan-cyan transition-colors">
              Garantía &amp; FAQ
            </a>
          </nav>

          {/* Botones de Contacto Rápido y CTA */}
          <div className="flex items-center gap-2">
            {/* Botón de Llamada Telefónica Directa */}
            <a
              href={`tel:${KANAN_PHONE_CALL}`}
              className="hidden md:inline-flex items-center gap-1.5 bg-kanan-ice hover:bg-slate-200/80 text-kanan-deep font-heading font-bold text-xs px-3.5 py-2.5 rounded-full border border-slate-200 transition-all shadow-sm active:scale-95"
              title="Llamar al 33 4016 0684"
            >
              <PhoneCall className="w-3.5 h-3.5 text-kanan-cerulean" />
              <span>33 4016 0684</span>
            </a>

            {/* Botón de WhatsApp Directo */}
            <a
              href={`https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Kanan Limpieza, deseo cotizar un servicio a domicilio.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-xs px-3.5 py-2.5 rounded-full shadow-sm transition-all active:scale-95"
              title="Chat en WhatsApp: 33 4335 9207"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onOpenWizard}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-kanan-cyan to-kanan-cerulean hover:from-[#009ec0] hover:to-kanan-navy text-white font-heading font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-cyan-glow transition-all active:scale-95"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Agendar Cita</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden inline-flex items-center justify-center p-2.5 rounded-2xl text-kanan-deep bg-kanan-ice hover:bg-slate-200/70 border border-slate-200/80"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Selector horizontal de chips para Móvil (Ultra rápido y fresco) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-heading font-bold text-slate-400 flex items-center gap-1 shrink-0 pr-1">
            <MapPin className="w-3 h-3 text-kanan-cyan" />
            Tu zona:
          </span>
          {MUNICIPIOS.map((mun) => {
            const active = selectedMunicipio === mun;
            return (
              <button
                key={mun}
                type="button"
                onClick={() => onSelectMunicipio(mun)}
                className={`px-3 py-1 rounded-full text-xs font-heading font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  active
                    ? "bg-kanan-cyan/15 text-kanan-cerulean border border-kanan-cyan/40"
                    : "bg-kanan-ice text-slate-500 border border-transparent"
                }`}
              >
                {active && <Check className="w-3 h-3 text-kanan-cyan" />}
                <span>{mun}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 pt-4 pb-6 space-y-4 shadow-2xl">
          <nav className="grid grid-cols-1 gap-1.5 text-sm font-heading font-bold text-kanan-deep">
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-ice/70 hover:bg-kanan-ice flex items-center justify-between"
            >
              <span>✨ Tecnología y Servicios</span>
              <Sparkles className="w-4 h-4 text-kanan-cyan" />
            </a>
            <a
              href="#antes-despues"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-ice/70 hover:bg-kanan-ice flex items-center justify-between"
            >
              <span>🔍 Comparador Antes y Después</span>
            </a>
            <a
              href="#agendar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-ice/70 hover:bg-kanan-ice flex items-center justify-between"
            >
              <span>🐾 Agendar en 4 Pasos con Kanan Dog</span>
            </a>
            <a
              href="#opiniones"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-ice/70 hover:bg-kanan-ice flex items-center justify-between"
            >
              <span>⭐ Reseñas Google Maps y FAQ</span>
            </a>
            <Link
              href="/guia-cuidados"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-cyan/10 text-kanan-cerulean flex items-center justify-between"
            >
              <span>📘 Guía Digital Ante Derrames</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-kanan-deep text-white flex items-center justify-between"
            >
              <span>📊 Panel Operativo CRM (2 Ejemplos)</span>
              <span className="text-[10px] bg-kanan-cyan text-white px-2 py-0.5 rounded-full">
                Abrir
              </span>
            </Link>
          </nav>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href={`https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Kanan Limpieza, deseo cotizar un servicio a domicilio.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${KANAN_PHONE_CALL}`}
              className="py-3 px-3 rounded-2xl bg-kanan-ice text-kanan-deep font-heading font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <PhoneCall className="w-4 h-4 text-kanan-cerulean" />
              <span>33 4016 0684</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
