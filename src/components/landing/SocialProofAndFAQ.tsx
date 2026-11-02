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

        {/* BLOQUE 2: PASE DIGITAL DE RECOMENDACIONES Y PRÓXIMO SERVICIO */}
        <div className="bg-gradient-to-br from-kanan-navy via-kanan-deep to-[#0D1E30] text-white rounded-3xl p-6 sm:p-10 shadow-kanan-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-heading font-bold text-kanan-cyan">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pase Digital de Cliente</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
              Tarjeta de Recomendaciones y Próximo Servicio
            </h3>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Al finalizar cada servicio recibes tu tarjeta oficial y tu pase digital interactivo: incluye recomendaciones de cuidado textil para prolongar la limpieza, la fecha sugerida para tu próximo mantenimiento preventivo (6 meses) y acceso directo para calificar tu experiencia.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const nextDate = new Date(now.setMonth(now.getMonth() + 6));
                  const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
                  const start = formatDate(nextDate);
                  const end = formatDate(new Date(nextDate.getTime() + 60 * 60 * 1000));
                  const icsContent = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "PRODID:-//Kanan Limpieza//Mantenimiento Textil//ES",
                    "BEGIN:VEVENT",
                    `UID:kanan-${Date.now()}@kananlimpieza.mx`,
                    `DTSTAMP:${formatDate(new Date())}`,
                    `DTSTART:${start}`,
                    `DTEND:${end}`,
                    "SUMMARY:Próximo Mantenimiento Textil - Kanan Limpieza",
                    "DESCRIPTION:Recordatorio a 6 meses para renovación y desinfección profunda de salas y textiles con Kanan Limpieza. WhatsApp: 33 4335 9207",
                    "URL:https://kananlimpieza.mx",
                    "STATUS:CONFIRMED",
                    "END:VEVENT",
                    "END:VCALENDAR",
                  ].join("\r\n");

                  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
                  const link = document.createElement("a");
                  link.href = window.URL.createObjectURL(blob);
                  link.setAttribute("download", "recordatorio-kanan-6-meses.ics");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white text-xs font-heading font-bold px-4 py-2.5 rounded-full shadow-cyan-glow transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Guardar Recordatorio en Calendario (.ics)</span>
              </button>
              <a
                href={KANAN_GOOGLE_MAPS_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-heading font-bold px-4 py-2.5 rounded-full border border-white/20 transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Calificar en Google Maps</span>
              </a>
            </div>
          </div>

          {/* Visualización del Pase Digital tipo Wallet */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-b from-[#1D324F] to-[#0E1B2B]">
              {/* Header del Pase */}
              <div className="p-4 bg-gradient-to-r from-kanan-navy via-kanan-deep to-kanan-cerulean flex items-center justify-between border-b border-white/10">
                <KananLogo variant="white" className="scale-75 origin-left" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-cyan-200">
                  Digital Pass
                </span>
              </div>

              {/* Contenido del Pase */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Tipo de Cuidado
                    </span>
                    <p className="font-heading font-extrabold text-sm text-white mt-0.5">
                      Desinfección & Extracción Profunda
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Garantía
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-heading font-bold text-emerald-400">
                      ✓ Certificada
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fecha Servicio</span>
                    <span className="font-heading font-bold text-white">Registrado</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Siguiente Cita</span>
                    <span className="font-heading font-bold text-cyan-300">En 6 meses</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="font-heading font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
                    Recomendaciones de Cuidado:
                  </p>
                  <p className="leading-snug">
                    • Mantener buena ventilación en el área las primeras 3-4 horas.
                  </p>
                  <p className="leading-snug">
                    • Ante derrames accidentales, absorber de inmediato sin frotar bruscamente.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-white/10">
                  <span className="text-slate-400">Soporte y Citas:</span>
                  <a
                    href="tel:3340160684"
                    className="font-heading font-bold text-kanan-cyan hover:underline"
                  >
                    33 4016 0684
                  </a>
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
