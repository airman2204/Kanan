"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Timer,
  Check,
  Plus,
  X,
  Maximize2,
  RotateCcw,
  BedDouble,
  Sofa,
  CarFront,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface Room2DInfo {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  // Coordenadas porcentuales para el pin interactivo y el encuadre de zoom
  pinX: number; // % desde la izquierda
  pinY: number; // % desde arriba
  zoomScale: number;
  originX: number; // % punto focal de zoom
  originY: number;
  sparkleX: number;
  sparkleY: number;
}

export const ROOMS_2D_CONFIG: Record<string, Room2DInfo> = {
  salas: {
    id: "salas",
    name: "La Sala de Estar",
    subtitle: "Limpieza Profunda de Salas y Tapetes",
    badge: "Inyección-Succión Alemana",
    tiempoSecado: "3 a 4 horas* (90% humedad extraída)",
    tecnologia: "Kärcher Puzzi Profesional",
    descripcion:
      "Desincrustamos suciedad profunda de sillones y alfombras con doble turbina de vacío. Cero residuos jabonosos.",
    pinX: 20,
    pinY: 62,
    zoomScale: 1.85,
    originX: 22,
    originY: 65,
    sparkleX: 20,
    sparkleY: 70,
  },
  colchones: {
    id: "colchones",
    name: "La Recámara Principal",
    subtitle: "Sanitización Antiácaros de Colchón",
    badge: "Luz UV Germicida + Alto Vacío",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Lámpara UV-C 254nm + Filtro HEPA",
    descripcion:
      "Eliminación total de ácaros, esporas, caspa y bacterias. Indispensable para personas con asma y alergias.",
    pinX: 41,
    pinY: 26,
    zoomScale: 1.9,
    originX: 42,
    originY: 28,
    sparkleX: 43,
    sparkleY: 24,
  },
  comedor: {
    id: "comedor",
    name: "El Comedor",
    subtitle: "Lavado de Sillas y Tapicería Fina",
    badge: "Detallado Manual y Fibras",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Fórmulas biodegradables con pH neutro",
    descripcion:
      "Cuidado artesanal para sillas de tela, terciopelo o vinipiel. Desmanchado sin decoloración.",
    pinX: 48,
    pinY: 68,
    zoomScale: 2.0,
    originX: 50,
    originY: 70,
    sparkleX: 46,
    sparkleY: 68,
  },
  autos: {
    id: "autos",
    name: "La Cochera / Auto",
    subtitle: "Detallado de Interiores y Cajuela",
    badge: "Unidad Móvil a Domicilio",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Vapor + Extracción Industrial Kanan",
    descripcion:
      "Asientos, alfombra, cielo y cajuela. Dejamos el interior de tu vehículo impecable y con aroma fresco directo en tu cochera.",
    pinX: 80,
    pinY: 52,
    zoomScale: 1.8,
    originX: 82,
    originY: 54,
    sparkleX: 85,
    sparkleY: 60,
  },
};

interface DioramaInteractive2DProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  cartItems: string[];
  onToggleCart: (roomId: string) => void;
}

export function DioramaInteractive2D({
  selectedRoomId,
  onSelectRoom,
  cartItems,
  onToggleCart,
}: DioramaInteractive2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sistema de Tilt 3D reactivo al mouse (Physics Springs para fluidez cinematográfica)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Amortiguación ultra-suave
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Rotaciones 3D sutiles para emular perspectiva
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const translateShadowX = useTransform(smoothMouseX, [-0.5, 0.5], [15, -15]);
  const translateShadowY = useTransform(smoothMouseY, [-0.5, 0.5], [15, -15]);

  // Manejo de movimiento del mouse sobre el contenedor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentRoom = selectedRoomId ? ROOMS_2D_CONFIG[selectedRoomId] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ perspective: 1200 }}
    >
      {/* Glow de Iluminación Ambiental que se mueve sutilmente */}
      <motion.div
        style={{
          x: useTransform(smoothMouseX, [-0.5, 0.5], [-30, 30]),
          y: useTransform(smoothMouseY, [-0.5, 0.5], [-30, 30]),
        }}
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#36A6DE]/15 to-[#1D71B5]/25 blur-3xl pointer-events-none -z-10"
      />

      {/* CONTENEDOR 3D FLOTANTE CON TILT */}
      <motion.div
        style={{
          rotateX: selectedRoomId ? 0 : rotateX,
          rotateY: selectedRoomId ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 100 }}
        className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center p-2 sm:p-6"
      >
        {/* Sombra de contacto 3D proyectada en el piso */}
        <motion.div
          style={{
            x: translateShadowX,
            y: translateShadowY,
          }}
          className="absolute inset-x-8 -bottom-6 h-12 bg-black/40 blur-2xl rounded-[100%] pointer-events-none -z-10 scale-95"
        />

        {/* LIENZO DE LA ILUSTRACIÓN 2D CON ZOOM DINÁMICO */}
        <motion.div
          animate={{
            scale: currentRoom ? currentRoom.zoomScale : 1,
            originX: currentRoom ? currentRoom.originX / 100 : 0.5,
            originY: currentRoom ? currentRoom.originY / 100 : 0.5,
          }}
          transition={{ type: "spring", damping: 28, stiffness: 120 }}
          className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#0F2438]/40 via-transparent to-[#0A1626]/60 backdrop-blur-sm cursor-grab active:cursor-grabbing"
        >
          {/* Imagen Render 2D en Alta Definición */}
          <Image
            src="/assets/diorama/kanan-house-2d.png"
            alt="Diorama de Limpieza Kanan"
            fill
            priority
            className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transition-transform duration-300"
          />

          {/* ============================================================== */}
          {/* EFECTOS MOTION EN VIVO: SPARKLES, SUCCIÓN & LUZ UV             */}
          {/* ============================================================== */}

          {/* 1. Ondas de Succión Dinámicas en la Aspiradora de la Sala */}
          <div
            className="absolute pointer-events-none"
            style={{ left: "15%", top: "72%" }}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping" />
              <span className="w-4 h-4 rounded-full bg-cyan-300/60 shadow-lg shadow-cyan-400" />
            </div>
          </div>

          {/* 2. Haz de Luz UV Germicida en la Cama Matrimonial */}
          <div
            className="absolute pointer-events-none overflow-hidden"
            style={{ left: "41%", top: "22%", width: "100px", height: "80px" }}
          >
            <div className="w-full h-full bg-gradient-to-b from-purple-500/25 via-blue-500/15 to-transparent rounded-full blur-md animate-pulse" />
          </div>

          {/* 3. Partículas de Destellos de Limpieza (Sparkles doradas / azules) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Sparkle Sala */}
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4], rotate: [0, 90, 180] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute left-[24%] top-[68%] text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            >
              ✦
            </motion.div>

            {/* Sparkle Recámara */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5], rotate: [0, -90, -180] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: 0.5 }}
              className="absolute left-[38%] top-[24%] text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]"
            >
              ✦
            </motion.div>

            {/* Sparkle Comedor */}
            <motion.div
              animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.3, 0.9, 0.3] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 1 }}
              className="absolute left-[54%] top-[72%] text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            >
              ✦
            </motion.div>

            {/* Sparkle Auto */}
            <motion.div
              animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.5, 1, 0.5], rotate: [0, 120, 240] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 1.2 }}
              className="absolute left-[88%] top-[62%] text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.9)]"
            >
              ✦
            </motion.div>
          </div>

          {/* ============================================================== */}
          {/* PINES INTERACTIVOS PULSANTES SOBRE CADA HABITACIÓN             */}
          {/* ============================================================== */}
          {Object.values(ROOMS_2D_CONFIG).map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isCarted = cartItems.includes(room.id);

            return (
              <div
                key={room.id}
                style={{
                  left: `${room.pinX}%`,
                  top: `${room.pinY}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoom(isSelected ? null : room.id);
                }}
              >
                <div className="relative group flex items-center justify-center">
                  {/* Onda de pulso expansiva */}
                  <span
                    className={`absolute w-9 h-9 rounded-full animate-ping opacity-75 ${
                      isSelected ? "bg-amber-400" : isCarted ? "bg-emerald-400" : "bg-[#36A6DE]"
                    }`}
                  />

                  {/* Botón central del Pin */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 transition-transform duration-200 group-hover:scale-125 ${
                      isSelected
                        ? "bg-[#1D71B5] border-white text-white scale-110 ring-4 ring-cyan-300"
                        : isCarted
                        ? "bg-emerald-600 border-white text-white"
                        : "bg-white/95 border-[#36A6DE] text-[#0F2438] hover:bg-[#36A6DE] hover:text-white"
                    }`}
                  >
                    {isCarted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  {/* Etiqueta flotante del Pin */}
                  <div
                    className={`absolute left-full ml-2 px-2.5 py-1 rounded-xl font-heading font-extrabold text-[11px] whitespace-nowrap shadow-lg backdrop-blur-md border transition-all pointer-events-none ${
                      isSelected
                        ? "bg-[#1D71B5] text-white border-white scale-105"
                        : "bg-black/75 text-white border-white/20 opacity-90 group-hover:opacity-100"
                    }`}
                  >
                    {room.name}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ============================================================== */}
      {/* TARJETA GLASSMORPHISM LATERAL CUANDO HAY UNA HABITACIÓN ACTIVA */}
      {/* ============================================================== */}
      <AnimatePresence>
        {currentRoom && (
          <motion.div
            key={currentRoom.id}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-6 right-4 sm:right-8 z-30 max-w-sm w-[90vw] sm:w-auto bg-white/95 backdrop-blur-2xl text-slate-800 p-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/80 space-y-3.5"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                  {currentRoom.badge}
                </span>
                <h3 className="font-heading text-lg font-extrabold text-[#0F2438] leading-tight">
                  {currentRoom.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{currentRoom.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectRoom(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRoom.descripcion}
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#36A6DE] shrink-0" />
                <span className="font-bold text-slate-800">Secado:</span>
                <span className="text-slate-600">{currentRoom.tiempoSecado}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">Tecnología:</span>
                <span className="text-slate-600 truncate">{currentRoom.tecnologia}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onToggleCart(currentRoom.id)}
                className={`flex-1 py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  cartItems.includes(currentRoom.id)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] text-white"
                }`}
              >
                {cartItems.includes(currentRoom.id) ? (
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
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
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
