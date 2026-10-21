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
import { KANAN_WHATSAPP_NUMBER, KANAN_PHONE_DISPLAY } from "@/lib/whatsapp/templates";

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
                domicilio.&rdquo; Especialistas en bioseguridad textil y cultura 100% Pet-Friendly
                en Guadalajara, Zapopan y ZMG.
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
                    Sanitización de Colchones
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Limpieza de Vestiduras de Autos
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-white transition-colors">
                    Lavado de Tapetes (Recolección a domicilio)
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 3: Contacto Directo (Datos reales de servicioskanan.com) */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-kanan-cyan">
                Contacto y Cobertura
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-kanan-cyan shrink-0" />
                  <a href="tel:3340160684" className="hover:text-white">
                    ({KANAN_PHONE_DISPLAY.slice(0, 2)}) {KANAN_PHONE_DISPLAY.slice(3)}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-kanan-cyan shrink-0" />
                  <a href="mailto:info@servicioskanan.com" className="hover:text-white">
                    info@servicioskanan.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-kanan-cyan shrink-0 mt-0.5" />
                  <span>
                    Lomas de San Agustín, Tlajomulco de Zúñiga, Jalisco. Cobertura en Guadalajara,
                    Zapopan, Tlajomulco y Tlaquepaque.
                  </span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Plataforma, Redes y CRM */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-kanan-cyan">
                Plataforma &amp; Recursos
              </h3>
              <div className="flex flex-col space-y-2 text-xs sm:text-sm">
                <Link
                  href="/guia-cuidados"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-kanan-cyan transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-kanan-cyan" />
                  <span>Guía de Cuidados ante Derrames</span>
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-kanan-cyan transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-kanan-cyan" />
                  <span>Acceso a Panel Operativo CRM</span>
                </Link>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/KananGuadalajara"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com/kanan.serviciosgdl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Kanan Servicios de Limpieza. Todos los derechos reservados.</p>
            <p>Sistema de Marca, Plataforma Web &amp; CRM Operativo • ZMG</p>
          </div>
        </div>
      </footer>

      {/* Barra Flotante Inferior Exclusiva para Móviles (Conversión en 1 Toque) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-[0_-8px_24px_rgba(15,36,56,0.12)] flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenWizard}
          className="flex-1 py-3 px-4 rounded-xl bg-kanan-cyan text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <CalendarCheck className="w-4 h-4 shrink-0" />
          <span>Agendar en 4 Pasos</span>
        </button>
        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 px-4 rounded-xl bg-[#25D366] text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
}
