"use client";

import React, { useState } from "react";
import { ShieldCheck, MessageCircle } from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";

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
  nextMaintenanceDate = "Mayo 2027",
  isActive = true,
}: KananPassCardProps) {
  const [cardTilt, setCardTilt] = useState({
    rotateX: 3,
    rotateY: -14,
    glowX: 50,
    glowY: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCardTilt({
      rotateY: -14 + (x - 0.5) * 12,
      rotateX: 3 + (0.5 - y) * 10,
      glowX: Math.round(x * 100),
      glowY: Math.round(y * 100),
    });
  };

  const handleMouseLeave = () => {
    setCardTilt({ rotateX: 3, rotateY: -14, glowX: 50, glowY: 30 });
  };

  const formattedFolio = folio.startsWith("#") ? folio : `#${folio}`;

  return (
    <div className="w-full flex justify-center py-1 sm:py-4" style={{ perspective: "1000px" }}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[320px] md:w-full md:max-w-[340px] scale-[0.65] -my-20 md:scale-100 md:my-0 p-[3.5px] rounded-2xl bg-gradient-to-br from-[#FCE79C] via-[#C89D3C] to-[#8C6214] border-r-[6px] border-[#071524] shadow-[18px_22px_40px_rgba(11,34,57,0.35)] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `perspective(1000px) rotateY(${cardTilt.rotateY}deg) rotateX(${cardTilt.rotateX}deg)`,
        }}
      >
        {/* Fondo azul marino oscuro */}
        <div className="relative bg-[#0B2239] text-white rounded-[13px] overflow-hidden">
          {/* Brillo dorado suave al mover el mouse */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(252,231,156,0.45) 0%, rgba(212,175,55,0.12) 30%, transparent 65%)`,
            }}
          />

          {/* Segundo marco dorado interior separado */}
          <div className="relative z-10 m-2 rounded-xl border-[1.5px] border-[#D4AF37]/85 overflow-hidden">
            {/* Cabecera grande: Isotipo K + KANAN a la izquierda + Perrito grande a la derecha */}
            <div className="px-4 pt-3 pb-0 flex items-end justify-between">
              <div className="pb-4 flex flex-col items-start">
                <KananLogo variant="white" size="md" className="h-16 w-auto" />
              </div>
              <img
                src="/images/kanan-mascot.png"
                alt="Mascota Kanan"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain object-bottom -mb-1 drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
              />
            </div>

            {/* Cintillo verde petróleo profundo con filetes dorados */}
            <div className="bg-[#164A46] border-y-[1.5px] border-[#D4AF37] py-1.5 px-3">
              <p className="text-xs font-bold tracking-wider text-white text-center uppercase">
                CERTIFICADO DE SERVICIO Y GARANTÍA
              </p>
            </div>

            {/* Datos en 1 sola columna con mayor tamaño */}
            <div className="p-4 space-y-3">
              <div className="text-[13px] leading-snug space-y-1.5">
                <div>
                  <span className="text-slate-300">CLIENTE:</span>{" "}
                  <strong className="text-white font-semibold">{clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-300">FOLIO:</span>{" "}
                  <strong className="text-white font-semibold">{formattedFolio}</strong>
                </div>
                <div>
                  <span className="text-slate-300">SERVICIO:</span>{" "}
                  <strong className="text-white font-semibold">{serviceType}</strong>
                </div>
                <div>
                  <strong className="text-white font-bold">PRÓXIMO MANTENIMIENTO:</strong>{" "}
                  <strong className="text-[#F2C94C] font-bold">{nextMaintenanceDate}</strong>
                </div>
              </div>

              {/* Caja de Recomendaciones */}
              <div className="border border-[#D4AF37]/60 rounded-lg bg-[#08192B]/90 px-3 py-2 space-y-1">
                <p className="text-[11px] font-bold text-[#F2C94C] uppercase tracking-wide">
                  RECOMENDACIONES POST-SERVICIO
                </p>
                <ul className="space-y-0.5 text-[11px] text-white leading-snug">
                  <li>• Dejar ventilar 3-4 horas hasta secado completo</li>
                  <li>• No aplicar químicos caseros sobre manchas</li>
                  <li>• Agenda cada 6 meses para tu descuento frecuente</li>
                </ul>
              </div>

              {/* Pie de tarjeta exacto (sin línea divisoria arriba) */}
              <div className="pt-1 flex items-end justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-11 rounded-xl bg-gradient-to-br from-[#FCE79C] via-[#D4AF37] to-[#8C6214] flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#0B2239]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#F2C94C] leading-tight uppercase">
                      {isActive ? (
                        <>
                          GARANTÍA
                          <br />
                          ACTIVA
                        </>
                      ) : (
                        <>
                          GARANTÍA
                          <br />
                          VENCIDA
                        </>
                      )}
                    </span>
                    <span className="w-5 h-[1.5px] bg-[#D4AF37] inline-block" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-white text-xs font-bold whitespace-nowrap pb-0.5">
                  <span>WhatsApp: 33 4335 9207</span>
                  <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3 h-3 text-white fill-white" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
