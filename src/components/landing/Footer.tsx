"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  MessageCircle,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";
import { KANAN_WHATSAPP_NUMBER, KANAN_PHONE_CALL } from "@/lib/whatsapp/templates";

interface FooterProps {
  onOpenWizard: () => void;
}

export function Footer({ onOpenWizard }: FooterProps) {
  const directWaUrl = `https://wa.me/${KANAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola Kanan Servicios de Limpieza, visité su sitio web y me gustaría cotizar un servicio."
  )}`;

  return (
    <>
      <footer className="bg-kanan-deep text-white pt-14 pb-24 sm:pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            {/* Columna 1: Identidad Kanan */}
            <div className="space-y-4">
              <KananLogo variant="white" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                &ldquo;Protegemos lo que más tocas. Limpieza y desinfección profunda a
                domicilio.&rdquo; Especialistas en cuidado textil e inyección-succión
                en Tlajomulco, Zapopan, Guadalajara y Tlaquepaque.
              </p>
            </div>

            {/* Columna 2: Servicios */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-kanan-cyan">
                Servicios Especializados
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Lavado de Salas y Sillas
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Lavado Profundo de Tapetes
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Sanitización de Colchones
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Detallado de Vestiduras Auto
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Cobertura ZMG */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-kanan-cyan">
                Cobertura en Jalisco
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                  <span>Tlajomulco de Zúñiga</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                  <span>Zapopan</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                  <span>Guadalajara</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-kanan-cyan" />
                  <span>San Pedro Tlaquepaque</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto Directo */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-kanan-cyan">
                Contacto Directo
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-kanan-cyan" />
                  <a href={`tel:${KANAN_PHONE_CALL}`} className="hover:text-white">
                    33 4016 0684 (Llamadas)
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <a href={directWaUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    33 4335 9207 (WhatsApp)
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-kanan-cyan" />
                  <span>contacto@kananlimpieza.mx</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenWizard}
                  className="w-full py-2.5 px-4 rounded-xl bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-cyan-glow transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Cotizar en 4 Pasos</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Kanan Servicios de Limpieza. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/guia-cuidados" className="hover:text-white transition-colors">
                Guía Ante Derrames
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Mobile CTA Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <a
          href={`tel:${KANAN_PHONE_CALL}`}
          className="p-3 rounded-2xl bg-slate-100 text-kanan-deep font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200"
          title="Llamar"
        >
          <Phone className="w-4 h-4 text-kanan-cerulean" />
        </a>
        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
        </a>
        <button
          type="button"
          onClick={onOpenWizard}
          className="flex-1 py-3 px-4 rounded-2xl bg-kanan-cyan text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-cyan-glow"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Cotizar Ahora</span>
        </button>
      </div>
    </>
  );
}
