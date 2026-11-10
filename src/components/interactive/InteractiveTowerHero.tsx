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
  MousePointerClick,
  Info,
  CalendarCheck,
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
      "Eliminación total de ácaros microscópicos, bacterias y alérgenos en colchón y almohadas sin químicos agresivos.",
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
      "Desincrustamos suciedad acumulada y manchas de alimentos extrayendo el agua sucia en tiempo real a alta presión.",
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
      "Cuidado artesanal para sillas de tela, terciopelo o vinipiel sin decolorar las fibras ni dejar cercos de humedad.",
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
      "Limpieza de asientos, alfombra y cajuela sin mover tu auto de casa. Restauramos la frescura y el aroma a nuevo.",
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

  // EFECTO TILT 3D PARALELO Y PROFUNDIDAD MULTICAPA
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Rotaciones dinámicas
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  
  // Parallax multicapa en profundidad
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const pedestalX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const haloX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const haloY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);

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
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* ENCABEZADO DE LA SECCIÓN DE LA MAQUETA */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-[#1D71B5]/10 to-blue-500/10 border border-[#36A6DE]/30 rounded-full px-4 py-1.5 shadow-xs text-xs font-heading font-extrabold text-[#1D71B5]">
          <Sparkles className="w-4 h-4 text-[#36A6DE]" />
          <span>Maqueta Interactiva de Limpieza a Domicilio</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#355581] tracking-tight">
          Explora cada área de tu hogar
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Toca cualquier punto en la torre vertical para descubrir nuestra tecnología de inyección-succión, tiempos de secado y precios transparentes.
        </p>
      </div>

      {/* CONTENEDOR SPLIT EN 2 MITADES: IZQUIERDA TORRE GRANDE, DERECHA FICHA GIGANTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* MITAD IZQUIERDA: LA TORRE VERTICAL EN FORMATO GRANDE CON PROFUNDIDAD 3D */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-lg select-none flex items-center justify-center py-4"
            style={{ perspective: 1400 }}
          >
            {/* Halo de luz volumétrica posterior en contra-movimiento (Backdrop Depth) */}
            <motion.div
              style={{ x: haloX, y: haloY }}
              className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#36A6DE]/25 via-[#1D71B5]/20 to-emerald-400/15 blur-3xl pointer-events-none -z-20"
            />

            {/* CONTENEDOR 3D CON PERSPECTIVA Y TILT */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full aspect-[9/16] min-h-[540px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center"
            >
              {/* PEDESTAL / BASE ISOMÉTRICA ILUMINADA CON REFLEJO EN EL SUELO */}
              <motion.div
                style={{
                  x: pedestalX,
                  transform: "translateZ(-40px) rotateX(65deg)",
                }}
                className="absolute -bottom-6 inset-x-8 h-28 rounded-[100%] bg-gradient-to-b from-cyan-400/20 via-[#1D71B5]/20 to-transparent blur-md border-2 border-cyan-300/30 shadow-[0_20px_50px_rgba(29,113,181,0.35)] pointer-events-none -z-10"
              />

              {/* Sombra de contacto suave en el suelo con movimiento sutil */}
              <motion.div
                style={{ x: shadowX, y: shadowY }}
                className="absolute -bottom-4 inset-x-12 h-10 bg-slate-900/30 blur-2xl rounded-full pointer-events-none -z-10"
              />

              {/* CONTENEDOR DE LEVITACIÓN / RESPIRACIÓN ORGÁNICA */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.8,
                  ease: "easeInOut",
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full h-full"
              >
                {/* 1. Capa Posterior de Oclusión / Sombra de Silueta proyectada */}
                <div
                  style={{ transform: "translateZ(-20px) scale(0.98)" }}
                  className="absolute inset-0 pointer-events-none opacity-40 blur-sm brightness-50"
                >
                  <Image
                    src="/assets/diorama/kanan-torre-transparent.png"
                    alt=""
                    fill
                    aria-hidden="true"
                    sizes="(max-width: 768px) 100vw, 550px"
                    className="object-contain"
                  />
                </div>

                {/* 2. Capa Principal: Imagen de la Torre en PNG Transparente con Iluminación Especular */}
                <div
                  style={{ transform: "translateZ(10px)" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src="/assets/diorama/kanan-torre-transparent.png"
                    alt="Torre Vertical Kanan Limpieza 3D"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 550px"
                    className="object-contain drop-shadow-[0_30px_50px_rgba(29,113,181,0.28)] transition-all duration-300"
                  />
                </div>

                {/* 3. PINES INTERACTIVOS FLOTANDO EN EL EJE Z (+35px de profundidad real) */}
                {Object.values(TOWER_SPOTS).map((spot) => {
                  const isSelected = selectedSpotId === spot.id;
                  const isCarted = cartItems.includes(spot.id);

                  return (
                    <div
                      key={spot.id}
                      style={{
                        left: `${spot.pinX}%`,
                        top: `${spot.pinY}%`,
                        transform: "translate(-50%, -50%) translateZ(40px)",
                      }}
                      className="absolute z-20 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Abrir o cerrar la ficha técnica sin forzar el agregado automático
                        onSelectSpot(isSelected ? null : spot.id);
                      }}
                    >
                      <div className="relative group flex items-center justify-center">
                        {/* Halo brillante en 3D bajo el pin */}
                        <div
                          className={`absolute -inset-1 rounded-full blur-xs transition-opacity duration-300 pointer-events-none ${
                            isSelected
                              ? "bg-cyan-400 opacity-90 scale-125"
                              : isCarted
                              ? "bg-emerald-400 opacity-80"
                              : "bg-blue-400 opacity-40 group-hover:opacity-75"
                          }`}
                        />

                        {/* Animación efervescente de espuma / burbujas al hacer clic */}
                        <AnimatePresence>
                          {isSelected && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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

                        {/* Píldora del Servicio con efecto flotante Glass 3D */}
                        <div
                          className={`px-3.5 py-2 rounded-full font-heading font-extrabold text-xs shadow-2xl border flex items-center gap-2 transition-all duration-200 group-hover:scale-110 whitespace-nowrap backdrop-blur-md ${
                            isSelected
                              ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-200/90 scale-105 shadow-cyan-500/35"
                              : isCarted
                              ? "bg-emerald-600 text-white border-emerald-300 shadow-emerald-600/30"
                              : "bg-white/95 text-[#0F2438] border-slate-200/90 hover:border-[#1D71B5] hover:text-[#1D71B5] hover:shadow-blue-500/20"
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
                            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* MITAD DERECHA: FICHA EN VOLUMEN 3D CON ELEVACIÓN Y RELIEVE */}
        <div className="lg:col-span-6 flex items-center justify-center min-h-[460px]">
          <AnimatePresence mode="wait">
            {currentSpot ? (
              <motion.div
                key={currentSpot.id}
                initial={{ opacity: 0, x: 30, y: 15, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, y: -15, scale: 0.94 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full relative bg-gradient-to-b from-white via-white to-slate-50/90 rounded-3xl p-6 sm:p-8 lg:p-10 border-t-2 border-l-2 border-white/90 border-r border-b border-slate-200/80 shadow-[0_30px_70px_-15px_rgba(29,113,181,0.22),0_15px_30px_-10px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6 overflow-hidden"
              >
                {/* Resplandor biselado 3D superior */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

                {/* Cabecera de la ficha */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                        {currentSpot.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2438] leading-tight mt-1">
                      {currentSpot.servicio}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectSpot(null)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs border border-slate-200/60"
                    title="Cerrar detalle"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Especificaciones Técnicas Destacadas con Relieve 3D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>Tecnología Aplicada</span>
                    </div>
                    <p className="font-heading font-bold text-slate-900 text-sm">
                      {currentSpot.tecnologia}
                    </p>
                  </div>

                  <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-1">
                      <Timer className="w-4 h-4 text-[#36A6DE] shrink-0" />
                      <span>Tiempo de Secado</span>
                    </div>
                    <p className="font-heading font-bold text-slate-900 text-sm">
                      {currentSpot.tiempoSecado}
                    </p>
                  </div>
                </div>

                {/* Descripción Detallada */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ¿Qué incluye este servicio?
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {currentSpot.descripcion}
                  </p>
                </div>

                {/* Acciones principales con Botones con Relieve Físico */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onToggleCart(currentSpot.id)}
                    className={`flex-1 py-3.5 px-5 rounded-2xl font-heading font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      cartItems.includes(currentSpot.id)
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 shadow-[0_4px_14px_rgba(225,29,72,0.18)]"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45)]"
                    }`}
                  >
                    {cartItems.includes(currentSpot.id) ? (
                      <>
                        <X className="w-4 h-4 stroke-[3] text-rose-600" />
                        <span>Quitar de mi cotización</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>+ Añadir al pedido</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!cartItems.includes(currentSpot.id)) {
                        onToggleCart(currentSpot.id);
                      }
                      onOpenWizard(currentSpot.id);
                    }}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1D71B5] via-[#36A6DE] to-[#355581] hover:from-[#165a91] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_10px_25px_-5px_rgba(29,113,181,0.4)] active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Cotizar ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* TARJETA INICIAL CON ENFOQUE AL CLIENTE Y VOLUMEN 3D */
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="w-full relative bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 rounded-3xl p-8 sm:p-12 border-t-2 border-l-2 border-white border-r border-b border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(29,113,181,0.16),0_10px_25px_-5px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] text-center space-y-6 flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Resplandor suave */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/15 to-blue-500/10 text-[#1D71B5] border border-cyan-200/80 flex items-center justify-center shadow-[0_8px_16px_rgba(54,166,222,0.15)]">
                  <Sparkles className="w-8 h-8 text-[#36A6DE]" />
                </div>

                <div className="space-y-3 max-w-md">
                  <span className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-[#1D71B5] bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200/60">
                    Tu hogar impecable
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#355581] leading-tight">
                    ¿Qué área de tu casa deseas renovar hoy?
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Toca en la maqueta el mueble o espacio que te gustaría limpiar para conocer nuestro proceso especializado y sumarlo a tu cotización a domicilio.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
