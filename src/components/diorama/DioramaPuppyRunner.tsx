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
  ArrowRight,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RoomTarget {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  // Sticker especializado 2048x2048 en ultra alta definición
  stickerImg: string;
  // Posición de acción dentro de la maqueta (% relativo al lienzo)
  x: number;
  y: number;
  scale: number;
}

const ROOM_TARGETS: Record<string, RoomTarget> = {
  salas: {
    id: "salas",
    name: "La Sala de Estar",
    subtitle: "Limpieza Profunda de Sillones y Tapicería",
    badge: "Inyección-Succión Alemana",
    tiempoSecado: "3 a 4 horas* (90% humedad extraída)",
    tecnologia: "Kärcher Puzzi con Doble Turbina",
    descripcion:
      "Desincrustamos polvo acumulado, manchas de grasa y olores orgánicos sin dañar el tejido.",
    stickerImg: "/assets/stickers/kanan-proceso-salas.png",
    x: 18,
    y: 54,
    scale: 0.32,
  },
  colchones: {
    id: "colchones",
    name: "La Recámara Principal",
    subtitle: "Sanitización Antiácaros de Colchón",
    badge: "Luz UV Germicida + Alto Vacío",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Lámpara UV-C y Filtro HEPA",
    descripcion:
      "Eliminación total de ácaros, caspa y bacterias. Indispensable para alergias y descanso reparador.",
    stickerImg: "/assets/stickers/kanan-proceso-colchones.png",
    x: 36,
    y: 14,
    scale: 0.30,
  },
  comedor: {
    id: "comedor",
    name: "El Comedor y Tapetes",
    subtitle: "Lavado de Sillas y Fibras Finas",
    badge: "Taller Especializado y Detallado",
    tiempoSecado: "Recolección a taller (3 días)",
    tecnologia: "Inmersión controlada y centrifugado",
    descripcion:
      "Lavado artesanal para tapetes orientales, lana y sillas de comedor con fórmulas neutras biodegradables.",
    stickerImg: "/assets/stickers/kanan-proceso-tapetes.png",
    x: 44,
    y: 56,
    scale: 0.30,
  },
  autos: {
    id: "autos",
    name: "La Cochera / Auto",
    subtitle: "Detallado de Vestiduras Automotrices",
    badge: "Unidad Móvil en tu Domicilio",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Extracción Industrial en Cochera",
    descripcion:
      "Limpieza de asientos, alfombra y cajuela sin mover tu auto de casa. Frescura total garantizada.",
    stickerImg: "/assets/stickers/kanan-proceso-vestiduras.png",
    x: 74,
    y: 42,
    scale: 0.32,
  },
};

interface DioramaPuppyRunnerProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  cartItems: string[];
  onToggleCart: (roomId: string) => void;
}

export function DioramaPuppyRunner({
  selectedRoomId,
  onSelectRoom,
  cartItems,
  onToggleCart,
}: DioramaPuppyRunnerProps) {
  const currentTarget = selectedRoomId ? ROOM_TARGETS[selectedRoomId] : null;

  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] mx-auto select-none">
      {/* 1. LIENZO BASE DE LA CASA (DIORAMA LIMPIO) */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#0F2438]/50 via-[#0E2034]/70 to-[#0A1626]/80 backdrop-blur-md">
        {/* Imagen de la maqueta de fondo con render nítido */}
        <Image
          src="/assets/diorama/kanan-house-2d.png"
          alt="Maqueta Kanan Limpieza"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
        />

        {/* 2. PINES CIRCULARES DE CADA HABITACIÓN PARA LLAMAR AL PERRITO */}
        {Object.values(ROOM_TARGETS).map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isCarted = cartItems.includes(room.id);

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom(isSelected ? null : room.id)}
              style={{ left: `${room.x + 6}%`, top: `${room.y + 12}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {/* Onda de pulso */}
                <span
                  className={`absolute w-10 h-10 rounded-full animate-ping opacity-60 ${
                    isSelected ? "bg-cyan-300" : isCarted ? "bg-emerald-400" : "bg-white"
                  }`}
                />

                {/* Pin Badge */}
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

                {/* Tooltip con nombre de habitación */}
                <span className="absolute -bottom-7 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-black/80 text-white border border-white/20 whitespace-nowrap shadow-lg opacity-85 group-hover:opacity-100 transition-opacity">
                  {room.name}
                </span>
              </div>
            </button>
          );
        })}

        {/* 3. ANIMACIÓN DEL PERRITO EN ACCIÓN (CORRE Y LLEGA AL LUGAR) */}
        <AnimatePresence>
          {currentTarget && (
            <motion.div
              key={currentTarget.id}
              // Entra corriendo rápidamente con inercia elástica desde la entrada
              initial={{
                x: 120,
                y: 80,
                scale: 0.1,
                opacity: 0,
                rotate: 15,
              }}
              animate={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              exit={{
                x: -60,
                y: 40,
                scale: 0.2,
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 18,
                mass: 0.8,
              }}
              style={{
                left: `${currentTarget.x}%`,
                top: `${currentTarget.y}%`,
                width: `${currentTarget.scale * 100}%`,
              }}
              className="absolute z-30 pointer-events-none aspect-square drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)]"
            >
              {/* Sticker 2048x2048 cristalino con la pose exacta de trabajo */}
              <div className="relative w-full h-full">
                <Image
                  src={currentTarget.stickerImg}
                  alt={`Perrito Kanan trabajando en ${currentTarget.name}`}
                  fill
                  className="object-contain"
                />

                {/* Destellos de limpieza alrededor del perrito */}
                <motion.div
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute -top-2 -right-2 text-cyan-300 text-lg drop-shadow-[0_0_10px_rgba(103,232,249,0.9)]"
                >
                  ✦
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.9, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }}
                  className="absolute -bottom-2 -left-2 text-amber-300 text-base drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                >
                  ✦
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. BANNER VACÍO DE BIENVENIDA SI NO HAY NINGUNO SELECCIONADO */}
        {!currentTarget && (
          <div className="absolute inset-x-4 bottom-4 pointer-events-none flex justify-center">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>Haz clic en cualquier habitación o botón para ver al perrito correr a trabajar</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. TARJETA GLASSMORPHISM LATERAL AL LLEGAR A LA HABITACIÓN */}
      <AnimatePresence>
        {currentTarget && (
          <motion.div
            key={currentTarget.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-4 right-4 sm:right-6 z-40 max-w-sm w-[90vw] sm:w-auto bg-white/95 backdrop-blur-2xl text-slate-800 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/80 space-y-3"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                  {currentTarget.badge}
                </span>
                <h3 className="font-heading text-lg font-extrabold text-[#0F2438] leading-tight">
                  {currentTarget.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{currentTarget.subtitle}</p>
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
              {currentTarget.descripcion}
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#36A6DE] shrink-0" />
                <span className="font-bold text-slate-800">Secado:</span>
                <span className="text-slate-600">{currentTarget.tiempoSecado}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">Tecnología:</span>
                <span className="text-slate-600 truncate">{currentTarget.tecnologia}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onToggleCart(currentTarget.id)}
                className={`flex-1 py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  cartItems.includes(currentTarget.id)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white"
                }`}
              >
                {cartItems.includes(currentTarget.id) ? (
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
                title="Quitar perrito y ver casa limpia"
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
