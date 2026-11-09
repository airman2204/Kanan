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
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TowerHotspot {
  id: string;
  name: string;
  piso: string;
  servicio: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  // Coordenadas porcentuales sobre la torre vertical (ancho 864 x alto 1536)
  pinX: number;
  pinY: number;
}

const TOWER_SPOTS: Record<string, TowerHotspot> = {
  colchones: {
    id: "colchones",
    name: "La Recámara",
    piso: "PISO 3 (SUPERIOR)",
    servicio: "Sanitización Antiácaros de Colchón",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Luz UV Germicida 254nm + Succión HEPA",
    descripcion:
      "Eliminación total de ácaros microscópicos, bacterias y alérgenos en colchón y almohadas.",
    pinX: 48,
    pinY: 26,
  },
  salas: {
    id: "salas",
    name: "La Sala",
    piso: "PISO 2 (MEDIO IZQ)",
    servicio: "Limpieza Profunda de Salas y Sillones",
    tiempoSecado: "3 a 4 horas* (90% humedad extraída)",
    tecnologia: "Inyección-Succión Alemana Kärcher",
    descripcion:
      "Desincrustamos suciedad acumulada y manchas de alimentos extrayendo el agua sucia en tiempo real.",
    pinX: 30,
    pinY: 54,
  },
  comedor: {
    id: "comedor",
    name: "El Comedor",
    piso: "PISO 2 (MEDIO DER)",
    servicio: "Lavado de Sillas y Tapicería Fina",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Fórmulas biodegradables de pH neutro",
    descripcion:
      "Cuidado artesanal para sillas de comedor de tela, terciopelo o vinipiel sin decoloración.",
    pinX: 72,
    pinY: 53,
  },
  autos: {
    id: "autos",
    name: "La Cochera",
    piso: "PISO 1 (PLANTA BAJA)",
    servicio: "Detallado de Vestiduras Automotrices",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Unidad Móvil en tu Domicilio",
    descripcion:
      "Limpieza de asientos, alfombra y cajuela sin mover tu auto de casa. Restauramos aroma a nuevo.",
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
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* TARJETA CONTENEDORA DE LA TORRE (ESTILO MOCKUP GEMINI) */}
      <div className="relative w-full aspect-[9/16] max-h-[640px] rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(29,113,181,0.2)] border border-slate-200/90 bg-gradient-to-b from-[#F5F9FD] via-white to-[#EEF5FB] flex items-center justify-center p-2 sm:p-4">
        {/* Imagen de la Torre Vertical HD */}
        <div className="relative w-full h-full">
          <Image
            src="/assets/diorama/kanan-torre-vertical.png"
            alt="Torre Diorama Kanan Limpieza"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)]"
          />

          {/* PINES INTERACTIVOS CON PRECIO (IDÉNTICOS AL MOCKUP DE GEMINI) */}
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
                      isSelected ? "bg-amber-400" : isCarted ? "bg-emerald-400" : "bg-[#36A6DE]"
                    }`}
                  />

                  {/* Píldora de servicio / Pin flotante sin precios */}
                  <div
                    className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-xl border flex items-center gap-1.5 transition-all group-hover:scale-110 ${
                      isSelected
                        ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-200 scale-105"
                        : isCarted
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-white/95 text-[#0F2438] border-[#36A6DE]/60 hover:bg-[#36A6DE] hover:text-white"
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

        {/* TARJETA GLASSMORPHISM LATERAL AL TOCAR UN SERVICIO */}
        <AnimatePresence>
          {currentSpot && (
            <motion.div
              key={currentSpot.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-3 bottom-3 z-30 bg-white/95 backdrop-blur-xl text-slate-800 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.18)] border border-slate-200 space-y-2.5"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                    {currentSpot.piso}
                  </span>
                  <h4 className="font-heading text-sm font-extrabold text-[#0F2438] leading-tight">
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
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Agendar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leyenda de interacción inferior */}
      <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
        Toca las habitaciones en la maqueta para ver la tecnología y añadir a tu cotización.
      </p>
    </div>
  );
}
