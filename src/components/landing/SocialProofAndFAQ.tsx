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
import { KananPassCard } from "@/components/brand/KananPassCard";

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

          <div
            className="flex md:grid md:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-4 pb-2 md:overflow-visible md:pb-0 touch-pan-x no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {GOOGLE_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="min-w-[85%] md:min-w-0 snap-center bg-kanan-ice rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-4"
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F0F7FB] via-white to-[#E8F4FA] p-4 sm:p-12 border border-kanan-cyan/25 shadow-kanan-lg grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-12 items-center">
          {/* Orbes sutiles luminosos de fondo */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-kanan-cyan/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-kanan-cerulean/10 blur-3xl pointer-events-none" />

          <div className="relative order-2 lg:order-1 lg:col-span-6 space-y-3 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-kanan-cyan/30 text-[11px] sm:text-xs font-heading font-bold text-kanan-cerulean shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
              <span>Respaldo Digital Kanan</span>
            </div>

            <h3 className="font-heading text-xl sm:text-4xl font-extrabold text-kanan-deep leading-tight tracking-tight">
              Tu Garantía y Beneficios Siempre a la Mano
            </h3>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
              Al concluir tu servicio te enviamos por WhatsApp el enlace a tu certificado digital oficial con tu folio, fecha de garantía y guía de cuidados para consultarlo o guardarlo en tu celular.
            </p>

            <ul className="space-y-2 sm:space-y-3 pt-0.5">
              <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Garantía por escrito siempre a la mano:</strong>{" "}
                  Tu folio, fecha de servicio y respaldo directo desde tu enlace personal.
                </span>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Guía de cuidado rápido:</strong>{" "}
                  Recomendaciones de secado y conservación post-servicio.
                </span>
              </li>
              <li className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8B5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-kanan-deep">Beneficio de cliente frecuente:</strong>{" "}
                  Tarifa preferencial presentando tu folio al agendar tu mantenimiento cada 6 meses.
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

          {/* Columna Derecha — Tarjeta 3D VIP (KananPassCard) - primero en móvil */}
          <div className="relative order-1 lg:order-2 lg:col-span-6 flex justify-center">
            <div className="scale-[0.75] origin-top h-[350px] md:scale-100 md:h-auto flex justify-center">
              <KananPassCard />
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
