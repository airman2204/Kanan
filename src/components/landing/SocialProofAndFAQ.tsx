"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  MapPin,
  QrCode,
  ExternalLink,
  HelpCircle,
  Calendar,
  Smartphone,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import { KANAN_GOOGLE_MAPS_REVIEW_URL } from "@/lib/whatsapp/templates";
import { KananLogo } from "@/components/brand/KananLogo";

const GOOGLE_REVIEWS = [
  {
    id: "rev-1",
    author: "Fernanda Castañeda",
    date: "Cliente Verificado",
    rating: 5,
    service: "Sala Seccional + Colchón Matrimonial",
    text: "Excelente servicio. Mi sala clara tenía manchas acumuladas que creí imposibles. Llegaron súper puntuales, uniformados y en pocas horas ya estaba seca y oliendo riquísimo.",
  },
  {
    id: "rev-2",
    author: "Arq. Jorge Luis Morales",
    date: "Cliente Verificado",
    rating: 5,
    service: "Sala 3 piezas + 8 Sillas de Comedor",
    text: "Muy profesionales. Utilizan maquinaria industrial de inyección-succión que realmente saca toda la suciedad acumulada. Además entregan tarjeta con recomendaciones al terminar.",
  },
  {
    id: "rev-3",
    author: "Valeria Orozco",
    date: "Cliente Verificado",
    rating: 5,
    service: "Vestiduras de Camioneta SUV + Tapete",
    text: "Dejaron los asientos y la alfombra de mi camioneta impecables. Se llevaron mi tapete de sala y en 3 días hábiles me lo entregaron perfecto. 100% recomendados.",
  },
];

const FAQS = [
  {
    q: "¿Cuánto tiempo tardan en secar mis muebles, colchones o vestiduras?",
    a: "Gracias a nuestras máquinas profesionales de inyección-succión de alta potencia, extraemos hasta el 90% de la humedad durante el proceso. El tiempo promedio de secado es de 3 a 4 horas a temperatura ambiente (este tiempo dependerá de la ventilación y las condiciones del clima), listos para usarse el mismo día.",
  },
  {
    q: "¿Qué productos utilizan para la limpieza y desinfección?",
    a: "Utilizamos limpiadores y desinfectantes biodegradables de grado profesional e industrial que disuelven grasa, ácaros y olores de raíz sin dejar residuos tóxicos ni dañar los tejidos de tus muebles.",
  },
  {
    q: "¿Qué necesito tener listo en casa para el servicio?",
    a: "Únicamente necesitamos acceso a una toma de agua común, un contacto de luz eléctrica cercano y, en la medida de lo posible, despejar objetos delicados alrededor del área donde están tus muebles o vehículo.",
  },
  {
    q: "¿Cómo funciona el lavado de tapetes a domicilio?",
    a: "Para garantizar un secado controlado y libre de humedad, recolectamos tu tapete en tu domicilio, lo trasladamos a nuestro taller especializado donde se realiza despolvado mecánico, lavado por inmersión y centrifugado, y te lo entregamos empacado y perfumado en 3 días hábiles.",
  },
  {
    q: "¿Qué cubre la Garantía de Satisfacción?",
    a: "Al finalizar cada servicio, nuestro técnico realiza la revisión de calidad junto contigo y entrega nuestra Tarjeta de Recomendaciones y Próximo Servicio. Si al secarse por completo notas algún detalle pendiente, acudimos a revisarlo sin costo adicional.",
  },
];

export function SocialProofAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cardTilt, setCardTilt] = useState({ rotateX: 2, rotateY: -8, glowX: 50, glowY: 30 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 2, rotateY: -8, glowX: 50, glowY: 30 });
  };

  return (
    <section id="opiniones" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* BLOQUE 1: PRUEBA SOCIAL REAL */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>4.9 / 5.0 Calificación en Google</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-kanan-deep mt-3">
                Opiniones de Clientes Satisfechos
              </h2>
            </div>

            <a
              href={KANAN_GOOGLE_MAPS_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-kanan-cerulean hover:text-kanan-navy bg-kanan-ice px-4 py-2.5 rounded-full border border-slate-200 self-start md:self-auto"
            >
              <MapPin className="w-4 h-4 text-kanan-cyan" />
              <span>Ver reseñas en Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GOOGLE_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-kanan-ice rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">{rev.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-heading font-bold text-kanan-deep">{rev.author}</p>
                    <p className="text-[11px] text-slate-500">{rev.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 2: TARJETA DE GARANTÍA Y SERVICIOS */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F0F7FB] via-white to-[#E8F4FA] p-6 sm:p-12 border border-kanan-cyan/25 shadow-kanan-lg grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Orbes sutiles luminosos de fondo */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-kanan-cyan/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-kanan-cerulean/10 blur-3xl pointer-events-none" />

          <div className="relative lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-kanan-cyan/30 text-xs font-heading font-bold text-kanan-cerulean shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
              <span>Respaldo Oficial Kanan</span>
            </div>

            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-kanan-deep leading-tight tracking-tight">
              Garantía por Escrito y Control de Servicio
            </h3>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Al concluir tu servicio recibes tu certificado digital con las recomendaciones clave de cuidado y la fecha sugerida para mantener tu garantía vigente.
            </p>

            <ul className="space-y-3 pt-1">
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Garantía de satisfacción:</strong>{" "}
                  Revisión sin costo si surge algún detalle al secar.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Cuidado post-servicio:</strong>{" "}
                  Guía clara para conservar tus tapicerías.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Precio de cliente frecuente:</strong>{" "}
                  Tarifa preferencial en mantenimiento cada 6 meses.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="#faq"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-[#1D71B5] hover:text-[#355581] transition-colors"
              >
                <span>Conoce los términos de nuestra garantía →</span>
              </a>
            </div>
          </div>

          {/* Tarjeta Digital 3D VIP con doble marco dorado metálico */}
          <div
            className="relative lg:col-span-6 flex justify-center py-4"
            style={{ perspective: "1000px" }}
          >
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="relative w-full max-w-[350px] sm:max-w-[385px] rounded-2xl bg-[#0B2239] text-white shadow-[0_28px_60px_-15px_rgba(11,34,57,0.55)] border-2 border-[#D4AF37] p-1.5 overflow-hidden transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: `rotateY(${cardTilt.rotateY}deg) rotateX(${cardTilt.rotateX}deg)`,
              }}
            >
              {/* Brillo diagonal / holográfico dorado sutil */}
              <div
                className="pointer-events-none absolute inset-0 opacity-35 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(212,175,55,0.45) 0%, rgba(255,255,255,0.12) 28%, transparent 65%)`,
                }}
              />

              {/* Filete interior dorado sutil */}
              <div className="relative rounded-xl border border-[#D4AF37]/45 overflow-hidden bg-[#0B2239]/95">
                {/* Header: Logo blanco a la izquierda + perrito a la derecha */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-heading text-2xl font-black tracking-tight text-white block leading-none">
                      KANAN
                    </span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C767]">
                      Servicios de Limpieza
                    </p>
                  </div>
                  <img
                    src="/images/kanan-escalador.png"
                    alt="Mascota Kanan"
                    className="w-16 h-16 object-contain drop-shadow-md"
                  />
                </div>

                {/* Cintillo con borde dorado */}
                <div className="bg-gradient-to-r from-[#00A8B5]/90 via-[#00A8B5] to-[#00A8B5]/90 border-y border-[#D4AF37]/70 px-4 py-2 text-center">
                  <p className="text-[10.5px] font-heading font-extrabold uppercase tracking-[0.15em] text-white">
                    CERTIFICADO DE SERVICIO Y GARANTÍA
                  </p>
                </div>

                {/* Cuerpo */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                        Cliente
                      </span>
                      <span className="font-bold text-white">Juan Pérez</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                        Folio
                      </span>
                      <span className="font-bold text-[#E6C767]">#KAN-9821</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                        Servicio
                      </span>
                      <span className="font-bold text-cyan-200">
                        Lavado de Sala y Desinfección
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                        Próximo mantenimiento
                      </span>
                      <span className="font-bold text-emerald-300">Mayo 2027</span>
                    </div>
                  </div>

                  {/* Caja interna oscura con las 3 recomendaciones */}
                  <div className="rounded-xl bg-[#071728] border border-[#D4AF37]/25 p-3 space-y-1.5">
                    <p className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#E6C767]">
                      Recomendaciones post-servicio
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-200 leading-snug">
                      <li>• Dejar ventilar 3-4 horas hasta secado completo</li>
                      <li>• No aplicar químicos caseros sobre manchas</li>
                      <li>• Agenda cada 6 meses para tu descuento de cliente frecuente</li>
                    </ul>
                  </div>
                </div>

                {/* Pie de tarjeta: QR limpio en SVG + WhatsApp */}
                <div className="bg-[#071728]/80 border-t border-[#D4AF37]/30 px-4 py-3 flex items-center gap-3.5">
                  <div className="bg-white p-1.5 rounded-lg shrink-0">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-10 h-10 text-[#0B2239]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 2h12v12H2V2zm3 3v6h6V5H5zm2 2h2v2H7V7zM22 2h12v12H22V2zm3 3v6h6V5h-6zm2 2h2v2h-2V7zM2 22h12v12H2V22zm3 3v6h6v-6H5zm2 2h2v2H7v-2zM16 4h4v4h-4V4zm0 6h2v4h-2v-4zm4 4h2v2h-2v-2zm-4 4h4v2h-4v-2zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-6 6h2v4h-2v-4zm4 2h4v2h-4v-2zm2 4h4v4h-4v-4zm-6 2h4v2h-4v-2z" />
                    </svg>
                  </div>
                  <div className="text-xs leading-snug">
                    <p className="text-slate-300 text-[11px]">
                      ¿Necesitas aplicar tu garantía?
                    </p>
                    <p className="font-heading font-extrabold text-white text-sm mt-0.5">
                      WhatsApp: <span className="text-[#E6C767]">33 4335 9207</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: PREGUNTAS FRECUENTES (FAQ) */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-kanan-deep">
              Preguntas Frecuentes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Resolvemos tus dudas sobre nuestros procesos, tiempos y logística en Guadalajara y municipios.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-heading font-bold text-xs sm:text-sm text-kanan-deep hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-kanan-cyan shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-kanan-cerulean" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
