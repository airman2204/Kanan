"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
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
  name: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSpot = selectedSpotId ? TOWER_SPOTS[selectedSpotId] : null;

  // Física de Tilt 2.5D reactiva al cursor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Inclinación suave (máximo 4 grados para no deformar)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]);
  const shadowX = useTransform(smoothMouseX, [-0.5, 0.5], [18, -18]);

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto select-none flex items-center justify-center py-2"
      style={{ perspective: 1200 }}
    >
      {/* CONTENEDOR 2.5D CON TILT E INCLINACIÓN SUAVE */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full aspect-[9/16] min-h-[560px] sm:min-h-[680px] lg:min-h-[740px] flex items-center justify-center"
      >
        {/* Sombra de contacto suave en el suelo con movimiento sutil */}
        <motion.div
          style={{ x: shadowX }}
          className="absolute -bottom-2 inset-x-12 h-8 bg-[#1D71B5]/12 blur-2xl rounded-full pointer-events-none -z-10"
        />

        {/* CONTENEDOR DE LEVITACIÓN / RESPIRACIÓN ORGÁNICA */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
          }}
          className="relative w-full h-full"
        >
          {/* Imagen de la Torre en PNG Transparente Flotante */}
          <Image
            src="/assets/diorama/kanan-torre-transparent.png"
            alt="Maqueta Kanan Limpieza"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 650px"
            className="object-contain drop-shadow-[0_20px_35px_rgba(29,113,181,0.16)] transition-all duration-300"
          />

          {/* PINES INTERACTIVOS (SIN DESTELLO PERMANENTE, SOLO AL DAR CLIC) */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSpot(isSelected ? null : spot.id);
                }}
              >
                <div className="relative group flex items-center justify-center">
                  {/* Animación efervescente de espuma / burbujas al hacer clic */}
                  <AnimatePresence>
                    {isSelected && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* 5 burbujas de espuma efervescente */}
                        {[
                          { x: -14, y: -20, delay: 0, size: 10 },
                          { x: 16, y: -22, delay: 0.1, size: 12 },
                          { x: -22, y: -8, delay: 0.15, size: 8 },
                          { x: 20, y: -6, delay: 0.05, size: 9 },
                          { x: 0, y: -28, delay: 0.2, size: 14 },
                        ].map((b, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0, opacity: 0.9, x: 0, y: 0 }}
                            animate={{
                              scale: [0, 1.2, 0.9],
                              opacity: [0.9, 0.8, 0],
                              x: b.x,
                              y: b.y,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, delay: b.delay, ease: "easeOut" }}
                            style={{ width: b.size, height: b.size }}
                            className="absolute rounded-full bg-white/90 border border-cyan-300 shadow-[0_0_8px_rgba(54,166,222,0.8)]"
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Píldora del Servicio */}
                  <div
                    className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-xl border flex items-center gap-1.5 transition-all group-hover:scale-105 whitespace-nowrap ${
                      isSelected
                        ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-200/90 scale-105 shadow-cyan-500/25"
                        : isCarted
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : "bg-white/95 text-[#0F2438] border-slate-200/90 hover:border-[#1D71B5] hover:text-[#1D71B5]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isSelected
                          ? "bg-cyan-300 animate-pulse"
                          : isCarted
                          ? "bg-white"
                          : "bg-[#36A6DE]"
                      }`}
                    />
                    <span>{spot.name}</span>
                    {isCarted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                    ) : isSelected ? (
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* TARJETA GLASSMORPHISM: SOLO APARECE AL DAR CLIC */}
        <AnimatePresence>
          {currentSpot && (
            <motion.div
              key={currentSpot.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSpot(null);
                  }}
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

              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const isAlreadyCarted = cartItems.includes(currentSpot.id);
                    if (isAlreadyCarted) {
                      // Si ya está agregado, al tocarlo abre directo el chat de cotización
                      onOpenWizard(currentSpot.id);
                    } else {
                      // Si no está agregado, lo añade a la selección
                      onToggleCart(currentSpot.id);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                    cartItems.includes(currentSpot.id)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                      : "bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white shadow-blue-500/25"
                  }`}
                >
                  {cartItems.includes(currentSpot.id) ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>✓ Agregado (Cotizar ahora →)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Añadir a mi cotización</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
