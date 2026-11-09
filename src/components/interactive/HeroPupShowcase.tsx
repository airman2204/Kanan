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
  RotateCcw,
  BedDouble,
  Sofa,
  CarFront,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RoomSpot {
  id: string;
  name: string;
  tool: string;
  badge: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  // Posiciones porcentuales sobre la maqueta
  btnX: number;
  btnY: number;
  highlightX: number;
  highlightY: number;
  highlightW: number;
  highlightH: number;
  fxType: "vacuum" | "uv" | "bubbles" | "steam";
}

const ROOM_SPOTS: Record<string, RoomSpot> = {
  salas: {
    id: "salas",
    name: "La Sala & Tapete",
    tool: "Inyección-Succión Kärcher",
    badge: "Secado Express en 3-4 hrs",
    tiempoSecado: "3 a 4 horas* (90% de humedad extraída)",
    tecnologia: "Turbina de alto vacío y desmanchador de pH neutro",
    descripcion:
      "Desincrustamos suciedad profunda del sillón azul y del tapete de huellas. Extracción inmediata de agua sucia sin encharcar el relleno.",
    btnX: 21,
    btnY: 62,
    highlightX: 7,
    highlightY: 42,
    highlightW: 34,
    highlightH: 48,
    fxType: "vacuum",
  },
  colchones: {
    id: "colchones",
    name: "La Recámara Principal",
    tool: "Inspección UV & Desinfección",
    badge: "Luz UV Germicida Antiácaros",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Lámpara UV-C 254nm + Succión profunda de ácaros",
    descripcion:
      "Eliminación total de ácaros microscópicos, células muertas y alérgenos en el colchón y almohadas para personas con asma o alergias.",
    btnX: 41,
    btnY: 23,
    highlightX: 23,
    highlightY: 10,
    highlightW: 40,
    highlightH: 38,
    fxType: "uv",
  },
  comedor: {
    id: "comedor",
    name: "El Comedor",
    tool: "Detallado de Sillas & Fibras",
    badge: "Cuidado Artesanal Fino",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Fórmulas biodegradables sin químicos agresivos",
    descripcion:
      "Lavado especializado para sillas de tela, terciopelo o vinipiel. Desmanchado de alimentos y protección antimanchas.",
    btnX: 54,
    btnY: 66,
    highlightX: 38,
    highlightY: 46,
    highlightW: 24,
    highlightH: 42,
    fxType: "bubbles",
  },
  autos: {
    id: "autos",
    name: "La Cochera / Auto",
    tool: "Detallado de Vestiduras",
    badge: "Unidad Móvil a Domicilio",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Extracción industrial directo en tu cochera",
    descripcion:
      "Restauramos los asientos, alfombra y cajuela de tu coche directo en tu casa, devolviendo el olor a nuevo sin mover el vehículo.",
    btnX: 80,
    btnY: 54,
    highlightX: 62,
    highlightY: 33,
    highlightW: 36,
    highlightH: 58,
    fxType: "steam",
  },
};

interface HeroPupShowcaseProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  cartItems: string[];
  onToggleCart: (roomId: string) => void;
}

export function HeroPupShowcase({
  selectedRoomId,
  onSelectRoom,
  cartItems,
  onToggleCart,
}: HeroPupShowcaseProps) {
  const activeSpot = selectedRoomId ? ROOM_SPOTS[selectedRoomId] : null;

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none">
      {/* CONTENEDOR MAQUETA CON EFECTO FOCO DRAMÁTICO */}
      <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/20 bg-[#091524]">
        {/* IMAGEN NÍTIDA HD (SIN ESCALADO QUE PIXELE) */}
        <Image
          src="/assets/diorama/kanan-house-hd.png"
          alt="Diorama Kanan Mascotas en Acción"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className={`object-contain transition-all duration-500 ${
            activeSpot ? "brightness-90 contrast-105" : "brightness-100"
          }`}
        />

        {/* MÁSCARA DE OSCURECIMIENTO SUAVE CUANDO HAY UNA HABITACIÓN ACTIVA */}
        {activeSpot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black pointer-events-none z-10 transition-opacity"
          />
        )}

        {/* RESPLANDOR FOCAL EN EL ÁREA SELECCIONADA */}
        {activeSpot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              left: `${activeSpot.highlightX}%`,
              top: `${activeSpot.highlightY}%`,
              width: `${activeSpot.highlightW}%`,
              height: `${activeSpot.highlightH}%`,
            }}
            className="absolute rounded-3xl border-2 border-cyan-300/80 bg-gradient-to-tr from-cyan-400/20 via-sky-300/10 to-transparent shadow-[0_0_50px_rgba(54,166,222,0.45)] pointer-events-none z-20"
          >
            {/* EFECTOS DINÁMICOS VIVOS SEGÚN EL SERVICIO */}
            {activeSpot.fxType === "vacuum" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-16 h-16 rounded-full bg-cyan-400/40 animate-ping" />
                <span className="w-6 h-6 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/80" />
              </div>
            )}

            {activeSpot.fxType === "uv" && (
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/35 via-blue-500/25 to-transparent rounded-2xl animate-pulse pointer-events-none">
                <span className="absolute top-2 left-2 text-xs text-purple-200 font-mono font-bold bg-purple-900/80 px-2 py-0.5 rounded-full border border-purple-400/50">
                  Luz UV Activa 254nm
                </span>
              </div>
            )}

            {activeSpot.fxType === "bubbles" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl animate-bounce">🫧</span>
                <span className="text-sm animate-pulse ml-2">🫧</span>
              </div>
            )}

            {activeSpot.fxType === "steam" && (
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-200/20 via-transparent to-transparent rounded-2xl animate-pulse pointer-events-none" />
            )}
          </motion.div>
        )}

        {/* PINES INTERACTIVOS CON PULSO */}
        {Object.values(ROOM_SPOTS).map((spot) => {
          const isSelected = selectedRoomId === spot.id;
          const isCarted = cartItems.includes(spot.id);

          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelectRoom(isSelected ? null : spot.id)}
              style={{ left: `${spot.btnX}%`, top: `${spot.btnY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {/* Pulso */}
                <span
                  className={`absolute w-10 h-10 rounded-full animate-ping opacity-60 ${
                    isSelected ? "bg-cyan-300" : isCarted ? "bg-emerald-400" : "bg-white"
                  }`}
                />

                {/* Botón */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-extrabold text-xs shadow-2xl border-2 transition-all group-hover:scale-125 ${
                    isSelected
                      ? "bg-[#1D71B5] border-white text-white ring-4 ring-cyan-300 scale-110"
                      : isCarted
                      ? "bg-emerald-600 border-white text-white"
                      : "bg-white/95 border-[#36A6DE] text-[#0F2438] hover:bg-[#36A6DE] hover:text-white"
                  }`}
                >
                  {isCarted ? "✓" : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Etiqueta */}
                <span className="absolute -bottom-7 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-black/85 text-white border border-white/20 whitespace-nowrap shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
                  {spot.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* TARJETA GLASSMORPHISM LATERAL AL ACTIVAR UN ÁREA */}
      <AnimatePresence>
        {activeSpot && (
          <motion.div
            key={activeSpot.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-4 right-4 sm:right-6 z-40 max-w-sm w-[90vw] sm:w-auto bg-white/95 backdrop-blur-2xl text-slate-800 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/80 space-y-3"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                  {activeSpot.badge}
                </span>
                <h3 className="font-heading text-lg font-extrabold text-[#0F2438] leading-tight">
                  {activeSpot.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{activeSpot.tool}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectRoom(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeSpot.descripcion}
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#36A6DE] shrink-0" />
                <span className="font-bold text-slate-800">Secado:</span>
                <span className="text-slate-600">{activeSpot.tiempoSecado}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">Tecnología:</span>
                <span className="text-slate-600 truncate">{activeSpot.tecnologia}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onToggleCart(activeSpot.id)}
                className={`flex-1 py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  cartItems.includes(activeSpot.id)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white"
                }`}
              >
                {cartItems.includes(activeSpot.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado a tu selección!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Agregar este servicio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectRoom(null)}
                title="Ver casa completa"
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
