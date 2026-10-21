"use client";

import React, { useState } from "react";
import {
  Sofa,
  BedDouble,
  CarFront,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  Truck,
  Droplets,
  Wind,
  PawPrint,
  CheckCircle2,
} from "lucide-react";

interface ServicesSectionProps {
  onSelectCategoryForWizard: (categoryId: string) => void;
}

const SERVICES = [
  {
    id: "salas",
    tag: "Hogar & Convivencia",
    title: "Salas, Sofás y Sillas Tapizadas",
    badge: "Secado en 3-4 horas",
    badgeIcon: Clock,
    image: "/assets/services/hero-fresh.jpg",
    icon: Sofa,
    metrics: [
      { label: "Extracción de Humedad", value: "90%" },
      { label: "Fórmula Enzimática", value: "100% Pet-Friendly" },
      { label: "Tiempo de Secado", value: "3 a 4 hrs" },
    ],
    description:
      "Renovación profunda mediante inyección-succión ultrasónica que desincrusta grasa corporal, manchas de alimentos, accidentes de mascotas y polvo profundo sin maltratar las fibras.",
    chips: ["Salas en L", "Salas 3-2-1", "Sofá Cama", "Sillón Reclinable", "Sillas de Comedor"],
  },
  {
    id: "colchones",
    tag: "Descanso & Salud Respiratoria",
    title: "Sanitización Profunda de Colchones",
    badge: "99.9% Anti-Ácaros",
    badgeIcon: ShieldCheck,
    image: "/assets/services/mattress-fresh.jpg",
    icon: BedDouble,
    metrics: [
      { label: "Eliminación de Ácaros", value: "99.9%" },
      { label: "Bioseguridad", value: "Hipoalergénico" },
      { label: "Listo para Dormir", value: "Mismo día" },
    ],
    description:
      "Dormir en un colchón higienizado mejora tu descanso y previene alergias. Desinfectamos a profundidad eliminando sudor, aureolas, células muertas y olores con cepillado suave.",
    chips: ["Individual", "Matrimonial", "Queen Size", "King Size", "Cunas e Infantiles"],
  },
  {
    id: "vestiduras",
    tag: "Movilidad Impecable",
    title: "Detallado y Desinfección de Vestiduras",
    badge: "Auto & Camioneta SUV",
    badgeIcon: CarFront,
    image: "/assets/services/car-fresh.jpg",
    icon: CarFront,
    metrics: [
      { label: "Alcance Interior", value: "Cabina + Cajuela" },
      { label: "Neutralización Olores", value: "Activa" },
      { label: "Tiempo de Secado", value: "3 a 4 hrs" },
    ],
    description:
      "Llevamos nuestro equipo móvil hasta tu cochera para devolverle el aroma y la limpieza de agencia a los asientos, cabeceras, alfombra, tapetes y cajuela de tu vehículo.",
    chips: ["Auto Sedán / Hatchback", "Camioneta SUV 5 Pasajeros", "SUV 3 Filas (7 Pasajeros)", "Pick-up"],
  },
  {
    id: "tapetes",
    tag: "Taller Especializado",
    title: "Lavado Profundo de Tapetes a Domicilio",
    badge: "Recolección + Entrega (3 días)",
    badgeIcon: Truck,
    image: "/assets/services/rug-fresh.jpg",
    icon: Sparkles,
    metrics: [
      { label: "Logística ZMG", value: "Recolección Gratis" },
      { label: "Secado en Taller", value: "Controlado" },
      { label: "Tiempo de Entrega", value: "3 días hábiles" },
    ],
    description:
      "Recolectamos tu tapete en tu domicilio, realizamos despolvado mecánico, lavado por inmersión controlada y centrifugado, y te lo entregamos empacado y perfumado en 3 días hábiles.",
    chips: ["Tapete Pelo Corto", "Tapete Shaggy / Pelo Largo", "Tapetes Decorativos", "Fibras Delicadas"],
  },
];

export function ServicesSection({ onSelectCategoryForWizard }: ServicesSectionProps) {
  const [activeId, setActiveId] = useState<string>("salas");

  return (
    <section id="servicios" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Encabezado Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-kanan-cyan/15 text-kanan-cerulean font-heading font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-kanan-cyan" />
              Ingeniería de Limpieza Residencial
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-kanan-deep mt-3 tracking-tight">
              No solo lavamos por encima:{" "}
              <span className="text-kanan-cerulean">extraemos desde la raíz.</span>
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-md">
            Nuestro protocolo de 3 etapas renueva la textura y bioseguridad de tus textiles sin
            dejar humedad ni residuos jabonosos.
          </p>
        </div>

        {/* Barra de Tecnología Kanan (3 Pasos de Bioseguridad) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-kanan-ice p-4 sm:p-6 rounded-3xl border border-slate-200/80">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-kanan-navy text-kanan-cyan font-heading font-extrabold text-sm flex items-center justify-center shrink-0">
              01
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-kanan-deep flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-kanan-cyan" />
                Aspirado Turbinado
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Remoción en seco de polvo fino, pelo de mascota y ácaros alojados hasta 10 cm dentro
                de la espuma.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-kanan-cerulean text-white font-heading font-extrabold text-sm flex items-center justify-center shrink-0">
              02
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-kanan-deep flex items-center gap-1.5">
                <PawPrint className="w-4 h-4 text-kanan-cyan" />
                Fórmula Enzimática Pet-Friendly
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Biodegradación activa de manchas orgánicas, sudor y olores sin tóxicos ni aromas
                artificiales pesados.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-kanan-cyan text-white font-heading font-extrabold text-sm flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-kanan-deep flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-kanan-cyan" />
                Inyección-Succión (3-4h)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Enjuague profundo y succión de alto vacío que deja tus muebles listos para usarse esa
                misma tarde.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid de los 4 Servicios Especializados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SERVICES.map((srv) => {
            const IconComponent = srv.icon;
            const BadgeIcon = srv.badgeIcon;
            const isSelected = activeId === srv.id;
            return (
              <div
                key={srv.id}
                onMouseEnter={() => setActiveId(srv.id)}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col bg-white ${
                  isSelected
                    ? "border-kanan-cyan shadow-kanan-lg"
                    : "border-slate-200/90 shadow-kanan hover:border-kanan-cerulean/50"
                }`}
              >
                {/* Imagen Editorial Luminosa + Badges Flotantes */}
                <div className="relative h-60 sm:h-64 overflow-hidden bg-kanan-ice">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kanan-deep/70 via-kanan-deep/10 to-transparent" />

                  {/* Placa Blanca al 95% de Opacidad (Regla Manual Pág. 2) */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-kanan-deep px-3.5 py-1.5 rounded-full text-xs font-heading font-bold flex items-center gap-1.5 shadow-md">
                    <BadgeIcon className="w-3.5 h-3.5 text-kanan-cyan" />
                    <span>{srv.badge}</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-kanan-cyan">
                        {srv.tag}
                      </span>
                      <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-white leading-tight mt-0.5">
                        {srv.title}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white/95 text-kanan-navy flex items-center justify-center shadow-lg shrink-0">
                      <IconComponent className="w-5 h-5 text-kanan-cyan" />
                    </div>
                  </div>
                </div>

                {/* Cuerpo Técnico & Chips */}
                <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Mini Métricas */}
                    <div className="grid grid-cols-3 gap-2 bg-kanan-ice rounded-2xl p-3 border border-slate-200/70">
                      {srv.metrics.map((m, idx) => (
                        <div key={idx} className="text-center">
                          <p className="font-heading font-extrabold text-xs sm:text-sm text-kanan-deep">
                            {m.value}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {srv.description}
                    </p>

                    {/* Chips de Piezas */}
                    <div className="flex flex-wrap gap-1.5">
                      {srv.chips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-kanan-ice text-kanan-navy text-xs font-semibold border border-slate-200/80"
                        >
                          <CheckCircle2 className="w-3 h-3 text-kanan-cyan" />
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCategoryForWizard(srv.id)}
                    className="w-full py-3.5 px-5 rounded-2xl bg-kanan-ice group-hover:bg-kanan-cyan text-kanan-deep group-hover:text-white font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 group-hover:border-kanan-cyan group-hover:shadow-cyan-glow active:scale-[0.99]"
                  >
                    <span>Elegir {srv.title.split(" ")[0]} en el Cotizador</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
