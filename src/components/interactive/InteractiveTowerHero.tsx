"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Timer,
  Check,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";

interface TowerHotspot {
  id: string;
  name: string; // Nombre amigable y profesional
  badge: string;
  servicio: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  pinX: number;
  pinY: number;
}

const TOWER_SPOTS: Record<string, TowerHotspot> = {
  colchones: {
    id: "colchones",
    name: "Colchones & Cunas",
    badge: "Sanitización Antiácaros UV",
    servicio: "Desinfección Profunda de Colchón",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Luz UV Germicida 254nm + Succión HEPA",
    descripcion:
      "Eliminación total de ácaros microscópicos, bacterias y alérgenos en colchón y almohadas.",
    pinX: 48,
    pinY: 26,
  },
  salas: {
    id: "salas",
    name: "Salas & Sillones",
    badge: "Inyección-Succión Alemana",
    servicio: "Lavado de Salas y Tapicería",
    tiempoSecado: "3 a 4 horas* (90% humedad extraída)",
    tecnologia: "Kärcher Industrial de Doble Turbina",
    descripcion:
      "Desincrustamos suciedad acumulada y manchas de alimentos extrayendo el agua sucia en tiempo real.",
    pinX: 30,
    pinY: 54,
  },
  comedor: {
    id: "comedor",
    name: "Sillas de Comedor",
    badge: "Cuidado Fino de Fibras",
    servicio: "Lavado Artesanal de Sillas",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Fórmulas biodegradables de pH neutro",
    descripcion:
      "Cuidado artesanal para sillas de tela, terciopelo o vinipiel sin decolorar las fibras.",
    pinX: 72,
    pinY: 53,
  },
  autos: {
    id: "autos",
    name: "Vestiduras de Auto",
    badge: "Unidad Móvil a Domicilio",
    servicio: "Detallado de Interiores de Auto",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Extracción industrial en tu cochera",
    descripcion:
      "Limpieza de asientos, alfombra y cajuela sin mover tu auto de casa. Frescura y aroma a nuevo.",
    pinX: 52,
    pinY: 82,
  },
};

interface InteractiveTowerHeroProps {
  selectedSpotId: string | null;
  onSelectSpot: (id: string | null) => void;
  cartItems: string[];
  onToggleCart: (id: string) => void;
  onOpenWizard: (categoryId?: string) => void;
}

export function InteractiveTowerHero({
  selectedSpotId,
  onSelectSpot,
  cartItems,
  onToggleCart,
  onOpenWizard,
}: InteractiveTowerHeroProps) {
  const currentSpot = selectedSpotId ? TOWER_SPOTS[selectedSpotId] : null;

  return (
    <div className="relative w-full max-w-xl mx-auto select-none flex items-center justify-center">
      {/* MAQUETA TOTALMENTE LIBRE SIN CUADRO GRIS Y MÁS GRANDE (CON TRANSPARENCIA NATIVA) */}
      <div className="relative w-full aspect-[9/16] min-h-[560px] sm:min-h-[680px] lg:min-h-[740px] flex items-center justify-center">
        {/* Sombra de contacto suave en el suelo */}
        <div className="absolute bottom-2 inset-x-12 h-10 bg-black/15 blur-2xl rounded-full pointer-events-none -z-10" />

        {/* Imagen de la Torre en PNG Transparente Flotante */}
        <div className="relative w-full h-full">
          <Image
            src="/assets/diorama/kanan-torre-transparent.png"
            alt="Maqueta Kanan Limpieza"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 650px"
            className="object-contain drop-shadow-[0_20px_35px_rgba(29,113,181,0.18)] transition-transform duration-300"
          />

          {/* PINES FLOTANTES CON NOMBRES DE SERVICIOS */}
          {Object.values(TOWER_SPOTS).map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            const isCarted = cartItems.includes(spot.id);

            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.pinX}%`,
                  top: `${spot.pinY}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onClick={() => onSelectSpot(isSelected ? null : spot.id)}
              >
                <div className="relative group flex items-center justify-center">
                  {/* Pulso animado */}
                  <span
                    className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${
                      isSelected ? "bg-cyan-300" : isCarted ? "bg-emerald-400" : "bg-[#36A6DE]"
                    }`}
                  />

                  {/* Píldora del Servicio */}
                  <div
                    className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-xl border flex items-center gap-1.5 transition-all group-hover:scale-110 whitespace-nowrap ${
                      isSelected
                        ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-200 scale-105"
                        : isCarted
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-white/95 text-[#0F2438] border-[#36A6DE]/50 hover:bg-[#1D71B5] hover:text-white hover:border-[#1D71B5]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{spot.name}</span>
                    {isCarted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-[#36A6DE] group-hover:text-white" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TARJETA GLASSMORPHISM AL SELECCIONAR UNA HABITACIÓN */}
        <AnimatePresence>
          {currentSpot && (
            <motion.div
              key={currentSpot.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-2 sm:inset-x-6 bottom-2 z-30 bg-white/95 backdrop-blur-xl text-slate-800 p-4 sm:p-5 rounded-3xl shadow-[0_20px_45px_rgba(29,113,181,0.22)] border border-white space-y-2.5"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                    {currentSpot.badge}
                  </span>
                  <h4 className="font-heading text-sm sm:text-base font-extrabold text-[#0F2438] leading-tight">
                    {currentSpot.servicio}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSpot(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 font-medium">
                  <Timer className="w-3.5 h-3.5 text-[#36A6DE] shrink-0" />
                  <span className="font-bold text-slate-800">Secado:</span> {currentSpot.tiempoSecado}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">{currentSpot.descripcion}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onToggleCart(currentSpot.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                    cartItems.includes(currentSpot.id)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#1D71B5] hover:bg-[#355581] text-white"
                  }`}
                >
                  {cartItems.includes(currentSpot.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Agregado a tu selección</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir a mi cotización</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenWizard(currentSpot.id)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Agendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
