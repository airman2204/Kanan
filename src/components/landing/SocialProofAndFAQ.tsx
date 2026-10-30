"use client";

import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  MapPin,
  ShieldCheck,
  QrCode,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { KANAN_GOOGLE_MAPS_REVIEW_URL } from "@/lib/whatsapp/templates";
import { KananLogo } from "@/components/brand/KananLogo";

const GOOGLE_REVIEWS = [
  {
    id: "rev-1",
    author: "Fernanda Castañeda",
    zone: "Zapopan, Jal.",
    date: "Hace 1 semana",
    rating: 5,
    service: "Sala en L + Colchón King Size",
    text: "Excelente servicio. Tengo dos perritos y mi sala clara tenía manchas que creí imposibles. Llegaron súper puntuales, uniformados y en 3 horas y media ya estaba seca y oliendo riquísimo.",
  },
  {
    id: "rev-2",
    author: "Arq. Jorge Luis Morales",
    zone: "Guadalajara (Providencia)",
    date: "Hace 2 semanas",
    rating: 5,
    service: "Sala 3 piezas + 8 Sillas de Comedor",
    text: "Muy profesionales. Utilizan maquinaria industrial de inyección-succión que realmente saca toda la tierra acumulada. Además entregan tarjeta con recomendaciones y garantía de satisfacción al terminar.",
  },
  {
    id: "rev-3",
    author: "Valeria Orozco",
    zone: "Tlajomulco (Lomas de San Agustín)",
    date: "Hace 3 semanas",
    rating: 5,
    service: "Vestiduras de Camioneta SUV + Tapete",
    text: "Dejaron los asientos y la alfombra de mi camioneta como agencia. Se llevaron mi tapete de sala y en 3 días hábiles me lo entregaron impecable. 100% recomendados.",
  },
];

const FAQS = [
  {
    q: "¿Cuánto tiempo tardan en secar mis muebles, colchones o vestiduras?",
    a: "Gracias a nuestras máquinas profesionales de inyección-succión de alta potencia, extraemos hasta el 90% de la humedad durante el proceso. El tiempo promedio de secado es de 3 a 4 horas a temperatura ambiente (este tiempo dependerá de la ventilación y las condiciones del clima), listos para usarse el mismo día.",
  },
  {
    q: "¿Los productos que utilizan son seguros para mis mascotas y niños?",
    a: "Sí, nuestro compromiso es 100% Pet-Friendly. Utilizamos limpiadores enzimáticos y desinfectantes biodegradables de grado profesional que eliminan ácaros, bacterias y olores de raíz sin dejar residuos tóxicos para perros, gatos o bebés.",
  },
  {
    q: "¿Qué necesito tener listo en casa para el servicio?",
    a: "Únicamente necesitamos acceso a una toma de agua común, un contacto de luz eléctrica cercano y, en la medida de lo posible, despejar objetos delicados alrededor del área donde están tus muebles o vehículo.",
  },
  {
    q: "¿Cómo funciona el lavado de tapetes a domicilio?",
    a: "En el caso de tapetes decorativos, nuestro equipo acude a tu domicilio para recolectarlos, realizamos el lavado profundo y secado controlado en taller, y te los entregamos limpios, desinfectados y listos para usarse en 3 días hábiles.",
  },
  {
    q: "¿Qué cubre la Garantía de Satisfacción?",
    a: "Al finalizar cada servicio, nuestro técnico realiza la revisión de calidad junto contigo y entrega nuestra Tarjeta Kanan con recomendaciones y fecha sugerida para tu próximo mantenimiento. Si al secarse por completo notas algún detalle pendiente, acudimos a revisarlo sin costo adicional.",
  },
  {
    q: "¿En qué zonas tienen cobertura a domicilio?",
    a: "Cubrimos toda la Zona Metropolitana de Guadalajara (ZMG): Tlajomulco de Zúñiga, Zapopan, Guadalajara y San Pedro Tlaquepaque.",
  },
];

export function SocialProofAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="opiniones" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* BLOQUE 1: PRUEBA SOCIAL Y GOOGLE MAPS */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>4.9 / 5.0 Calificación en Google Maps</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-kanan-deep mt-3">
                Lo que opinan las familias en Guadalajara y ZMG
              </h2>
            </div>

            <a
              href={KANAN_GOOGLE_MAPS_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-kanan-cerulean hover:text-kanan-navy bg-kanan-ice px-4 py-2.5 rounded-full border border-slate-200 self-start md:self-auto"
            >
              <MapPin className="w-4 h-4 text-kanan-cyan" />
              <span>Ver perfil en Google Maps</span>
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

                  <p className="text-xs sm:text-sm text-kanan-deep leading-relaxed">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-heading font-bold text-xs sm:text-sm text-kanan-deep">
                      {rev.author}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rev.zone} • {rev.service}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-kanan-cerulean border border-slate-200">
                    Verificada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 2: TARJETA POSERVICIO & RECOMPRA (Manual de Marca Pág. 4) */}
        <div className="bg-gradient-to-r from-kanan-deep to-kanan-navy rounded-3xl p-6 sm:p-10 text-white shadow-kanan-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kanan-cyan/20 text-kanan-cyan text-xs font-heading font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Respaldo Oficial Kanan
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                Tarjeta de Recomendaciones y Próximo Servicio
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Al finalizar cada visita entregamos nuestra tarjeta física oficial con recomendaciones
                de cuidado y la sugerencia de fecha para tu próximo mantenimiento preventivo (6 meses o
                trimestral si tienes mascotas en casa).
              </p>
            </div>

            {/* Visualización de la Tarjeta Poservicio (Frente y Vuelta según Manual Pág. 4) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Frente: Logotipo sobre fondo Azul Principal mate (#355581) */}
              <div className="bg-[#355581] border border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[170px] shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-kanan-cyan font-bold mb-2">
                  Frente — Acabado Mate
                </span>
                <KananLogo variant="white" />
                <p className="text-[11px] text-slate-300 mt-3 italic">
                  &ldquo;Protegemos lo que más tocas.&rdquo;
                </p>
              </div>

              {/* Vuelta: Sello de garantía, fecha, próximo mantenimiento 6 meses y QR */}
              <div className="bg-white text-kanan-deep rounded-2xl p-5 flex flex-col justify-between min-h-[170px] shadow-lg border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-kanan-cerulean">
                      Recomendaciones y Cuidado
                    </span>
                    <p className="font-heading font-bold text-xs text-kanan-deep mt-0.5">
                      Sello de Calidad Kanan ✓
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-kanan-ice border border-slate-200">
                    <QrCode className="w-7 h-7 text-kanan-navy" />
                  </div>
                </div>

                <div className="my-2 bg-kanan-ice rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha Servicio:</span>
                    <span className="font-bold text-kanan-deep"> Verificada en CRM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Próximo Mantenimiento:</span>
                    <span className="font-bold text-kanan-cerulean">+6 Meses (15% Off)</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center">
                  Escanea el QR para evaluar en Google Reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: PREGUNTAS FRECUENTES (FAQ INTERACTIVO) */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-kanan-ice text-kanan-cerulean font-heading font-bold text-xs uppercase tracking-wider border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-kanan-cyan" />
              Resolvemos tus dudas
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-kanan-deep mt-3">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-kanan-ice/60 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-kanan-ice"
                  >
                    <span className="font-heading font-bold text-sm sm:text-base text-kanan-deep">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-kanan-cerulean shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 pt-3 bg-white">
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
