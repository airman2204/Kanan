"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

export interface KananPassCardProps {
  clientName?: string;
  folio?: string;
  serviceType?: string;
  serviceDate?: string;
  nextMaintenanceDate?: string;
  isActive?: boolean;
}

export function KananPassCard({
  clientName = "Juan Pérez",
  folio = "#KAN-9821",
  serviceType = "Lavado de Sala y Desinfección",
  serviceDate = "12 Nov 2026",
  nextMaintenanceDate = "Mayo 2027",
  isActive = true,
}: KananPassCardProps) {
  const [cardTilt, setCardTilt] = useState({
    rotateX: 2,
    rotateY: -8,
    glowX: 50,
    glowY: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCardTilt({
      rotateY: (x - 0.5) * 18,
      rotateX: (0.5 - y) * 14,
      glowX: Math.round(x * 100),
      glowY: Math.round(y * 100),
    });
  };

  const handleMouseLeave = () => {
    setCardTilt({ rotateX: 2, rotateY: -8, glowX: 50, glowY: 30 });
  };

  const formattedFolio = folio.startsWith("#") ? folio : `#${folio}`;

  return (
    <div className="w-full flex justify-center py-4" style={{ perspective: "1000px" }}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[355px] sm:max-w-[390px] rounded-2xl bg-[#0B2239] text-white shadow-[0_28px_60px_-15px_rgba(11,34,57,0.55)] border-2 border-[#D4AF37] overflow-hidden transition-transform duration-200 ease-out will-change-transform after:content-[''] after:pointer-events-none after:absolute after:inset-1 after:rounded-[12px] after:border after:border-[#FFDF73]/40"
        style={{
          transform: `rotateY(${cardTilt.rotateY}deg) rotateX(${cardTilt.rotateX}deg)`,
        }}
      >
        {/* Brillo dorado suave al mover el mouse */}
        <div
          className="pointer-events-none absolute inset-0 opacity-35 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(255,223,115,0.45) 0%, rgba(212,175,55,0.14) 30%, transparent 65%)`,
          }}
        />

        {/* Cabecera: Logo blanco KANAN a la izquierda + perrito Kanan a la derecha */}
        <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-heading text-2xl sm:text-[26px] font-black tracking-tight text-white block leading-none">
              KANAN
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFDF73]">
              Servicios de Limpieza
            </p>
          </div>
          <img
            src="/images/kanan-certificado-mascota.jpg"
            alt="Mascota Kanan"
            className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/50 shadow-md"
          />
        </div>

        {/* Cintillo verde azulado con filete dorado */}
        <div className="relative z-10 bg-gradient-to-r from-[#008C99] via-[#00A8B5] to-[#008C99] border-y border-[#D4AF37]/80 px-4 py-2 text-center">
          <p className="text-[10.5px] font-heading font-extrabold uppercase tracking-[0.15em] text-white">
            CERTIFICADO DE SERVICIO Y GARANTÍA
          </p>
        </div>

        {/* Datos estructurados */}
        <div className="relative z-10 p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Cliente
              </span>
              <span className="font-bold text-white">{clientName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Folio
              </span>
              <span className="font-bold text-[#FFDF73]">{formattedFolio}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Servicio
              </span>
              <span className="font-bold text-cyan-200">{serviceType}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Próximo mantenimiento
              </span>
              <span className="font-bold text-emerald-300">
                {nextMaintenanceDate}
              </span>
            </div>
          </div>

          {serviceDate && (
            <div className="text-[10.5px] text-slate-400">
              Fecha de servicio:{" "}
              <span className="text-slate-200 font-semibold">{serviceDate}</span>
            </div>
          )}

          {/* Caja de recomendaciones post-servicio */}
          <div className="rounded-xl bg-[#071728] border border-[#D4AF37]/30 p-3 space-y-1.5">
            <p className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#FFDF73]">
              Recomendaciones post-servicio
            </p>
            <ul className="space-y-1 text-[11px] text-slate-200 leading-snug">
              <li>• Dejar ventilar 3-4 horas hasta secado completo</li>
              <li>• No aplicar químicos caseros sobre manchas</li>
              <li>• Agenda cada 6 meses para tu descuento de cliente frecuente</li>
            </ul>
          </div>
        </div>

        {/* Pie de tarjeta limpio (sin código QR): Escudo dorado + GARANTÍA ACTIVA a la izquierda, WhatsApp a la derecha */}
        <div className="relative z-10 bg-[#071728]/90 border-t border-[#D4AF37]/40 px-5 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFDF73] to-[#B8860B] flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0B2239]" />
            </div>
            <span className="font-heading font-extrabold text-[11px] uppercase tracking-wider text-[#FFDF73]">
              {isActive ? "GARANTÍA ACTIVA" : "GARANTÍA VENCIDA"}
            </span>
          </div>
          <span className="font-heading font-bold text-xs text-white whitespace-nowrap">
            WhatsApp: <span className="text-cyan-300">33 4335 9207</span>
          </span>
        </div>
      </div>
    </div>
  );
}
