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

        {/* BLOQUE 2: TARJETA OFICIAL DE GARANTÍA Y SERVICIOS (PASE DIGITAL DINÁMICO) */}
        <div className="bg-gradient-to-br from-[#102235] via-kanan-deep to-[#0A1724] text-white rounded-3xl p-6 sm:p-10 shadow-kanan-lg grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border border-white/10">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kanan-cyan/15 border border-kanan-cyan/30 text-xs font-heading font-bold text-kanan-cyan">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pase Digital Oficial en tu Teléfono</span>
            </div>
            
            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Tarjeta de Garantía y Servicios Kanan
            </h3>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Al concluir tu primer servicio recibes tu tarjeta física oficial y tu pase digital para <strong className="text-white">Apple Wallet</strong> y <strong className="text-white">Google Wallet</strong>.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs sm:text-sm">
                <div className="w-7 h-7 rounded-xl bg-kanan-cyan/20 text-kanan-cyan flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-heading">1 Cliente = 1 Sola Tarjeta Permanente</strong>
                  <span className="text-slate-300 text-xs leading-snug">
                    No necesitas guardar una tarjeta nueva en cada servicio. Se vincula a tu número y se actualiza sola automáticamente en tu teléfono.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs sm:text-sm">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-heading">Recordatorio de Mantenimiento Sugerido</strong>
                  <span className="text-slate-300 text-xs leading-snug">
                    Calcula automáticamente tu siguiente revisión preventiva a los 6 meses para proteger tu garantía y conservar tu tarifa preferencial.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={KANAN_GOOGLE_MAPS_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-kanan-cyan hover:bg-[#009ec0] text-white text-xs sm:text-sm font-heading font-bold px-5 py-3 rounded-full shadow-cyan-glow transition-all active:scale-95"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Calificar Servicio en Google Maps</span>
              </a>
              <a
                href="tel:3340160684"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-heading font-bold px-4 py-3 rounded-full border border-white/20 transition-all"
              >
                <span>Llamar a Soporte</span>
              </a>
            </div>
          </div>

          {/* Visualización de la Tarjeta Oficial de Garantía y Servicios (Diseño Oficial de Kanan) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] sm:max-w-[370px] rounded-[28px] overflow-hidden shadow-2xl border border-white/25 bg-[#0F2338] text-white transition-all hover:scale-[1.01] duration-300">
              
              {/* Header: Logo Oficial Kanan Blanco + Kanan Dog con Uniforme */}
              <div className="pt-6 pb-4 px-6 flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <KananLogo variant="white" className="scale-90 origin-left" />
                </div>
                <div className="relative w-24 h-24 shrink-0">
                  <img
                    src="/assets/brand/kanan-dog-active.png"
                    alt="Kanan Dog Oficial"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
              </div>

              {/* Barra Distintiva Cian */}
              <div className="bg-[#00B4D8] py-2 px-4 text-center">
                <h4 className="font-heading font-extrabold text-xs sm:text-[13px] tracking-wide text-white uppercase">
                  TARJETA DE GARANTÍA Y SERVICIOS
                </h4>
              </div>

              {/* Cuerpo de Datos del Cliente */}
              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-[13px]">
                <div className="space-y-1.5">
                  <p>
                    <span className="font-heading font-extrabold tracking-wide text-white">CLIENTE: </span>
                    <span className="font-bold text-cyan-300">Juan Pérez</span>
                  </p>
                  <p>
                    <span className="font-heading font-extrabold tracking-wide text-white">ÚLTIMO SERVICIO: </span>
                    <span className="font-semibold text-cyan-200">12 Nov 2026</span>
                  </p>
                  <div>
                    <p>
                      <span className="font-heading font-extrabold tracking-wide text-white">PRÓXIMO SERVICIO </span>
                      <span className="text-[11px] text-slate-300">(Sugerido): </span>
                      <strong className="text-[#36A6DE] font-bold text-sm">Mayo 2027</strong>
                    </p>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      Sugerido para mantener garantía
                    </span>
                  </div>
                  <p className="pt-0.5">
                    <span className="font-heading font-extrabold tracking-wide text-white">TIPO DE SERVICIO: </span>
                    <span className="text-cyan-200 font-medium">Lavado de Sala y Desinfección</span>
                  </p>
                </div>

                {/* Caja de Recomendaciones Post-Servicio */}
                <div className="rounded-2xl border border-cyan-400/40 bg-white/5 p-3.5 space-y-1.5 text-[11px] sm:text-xs">
                  <p className="font-heading font-extrabold tracking-wide text-white text-center sm:text-left">
                    RECOMENDACIONES POST-SERVICIO
                  </p>
                  <ul className="space-y-1 text-slate-200 leading-snug">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-300">•</span>
                      <span>Dejar ventilar <strong className="text-white">3-4 horas</strong> hasta secado completo</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-300">•</span>
                      <span>No aplicar químicos caseros sobre manchas</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-300">•</span>
                      <span>Agenda cada 6 meses para conservar tu descuento de cliente frecuente</span>
                    </li>
                  </ul>
                </div>

                {/* Código de Identificador Oficial */}
                <div className="pt-1 flex flex-col items-center justify-center space-y-1">
                  {/* Simulación visual de código de barras de alta densidad */}
                  <div className="h-8 flex items-center justify-center gap-[2px] opacity-90 px-4 py-1 bg-white rounded-md">
                    {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 1, 3, 2, 4, 1].map((w, i) => (
                      <span
                        key={i}
                        className="bg-slate-900 h-6 block"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-mono tracking-widest text-slate-300 font-bold">
                    ID: KAN-9821-XP
                  </p>
                </div>

                {/* Footer de la Tarjeta con Enlace Directo */}
                <div className="pt-2 border-t border-white/10 text-center text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                  <p className="font-semibold text-white">¡Conserva tu garantía!</p>
                  <p>
                    Llámanos al{" "}
                    <a href="tel:3340160684" className="text-cyan-300 font-bold hover:underline">
                      33 4016 0684
                    </a>{" "}
                    o por WhatsApp al{" "}
                    <a
                      href={`https://wa.me/523343359207?text=${encodeURIComponent("Hola Kanan Limpieza, deseo consultar mi Tarjeta de Garantía ID: KAN-9821-XP")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      33 4335 9207
                    </a>
                  </p>
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
