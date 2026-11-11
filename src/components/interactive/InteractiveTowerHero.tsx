"use client";

import React, { useRef, useState } from "react";
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
  extraccionHumedad: string;
  esterilizacionAcaros: string;
  pinX: number;
  pinY: number;
}

const TOWER_SPOTS: Record<string, TowerHotspot> = {
  colchones: {
    id: "colchones",
    name: "Colchones & Cunas",
    badge: "Sanitización Antiácaros UV",
    servicio: "Desinfección Profunda de Colchón",
    tiempoSecado: "Listo para dormir hoy",
    tecnologia: "Luz UV Germicida 254nm + Succión HEPA",
    descripcion:
      "Eliminación total de ácaros microscópicos, bacterias y alérgenos en colchón y almohadas sin químicos agresivos.",
    extraccionHumedad: "92% succión en seco",
    esterilizacionAcaros: "100% esterilizado UV",
    pinX: 48,
    pinY: 26,
  },
  salas: {
    id: "salas",
    name: "Salas & Sillones",
    badge: "Inyección-Succión Alemana",
    servicio: "Lavado de Salas y Tapicería",
    tiempoSecado: "3 a 4 horas*",
    tecnologia: "Kärcher Industrial de Doble Turbina",
    descripcion:
      "Desincrustamos suciedad acumulada y manchas de alimentos extrayendo el agua sucia en tiempo real a alta presión.",
    extraccionHumedad: "90% humedad extraída",
    esterilizacionAcaros: "99.8% biocida neutro",
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
    extraccionHumedad: "88% humedad extraída",
    esterilizacionAcaros: "100% libre de residuos",
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
    extraccionHumedad: "90% humedad extraída",
    esterilizacionAcaros: "100% aroma a nuevo",
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

  const [boardActiveZone, setBoardActiveZone] = useState<"top" | "left" | "right" | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    // Distancias relativas a los 3 bordes donde se asoma el perro
    const distTop = ny;
    const distLeft = nx;
    const distRight = 1 - nx;

    const minDist = Math.min(distTop, distLeft, distRight);

    if (minDist === distTop) {
      setBoardActiveZone("top");
    } else if (minDist === distLeft) {
      setBoardActiveZone("left");
    } else {
      setBoardActiveZone("right");
    }
  };

  const handleBoardMouseLeave = () => {
    setBoardActiveZone(null);
  };

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
      {/* ENCABEZADO DE LA SECCIÓN DE LA CASA */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#355581] tracking-tight">
          Explora cada área de tu casa
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Toca cualquier punto en la casa para descubrir nuestra tecnología de inyección-succión y tiempos de secado sin complicaciones.
        </p>
      </div>

      {/* CONTENEDOR SPLIT EN 2 MITADES: IZQUIERDA MAQUETA 3D, DERECHA FICHA INTERACTIVA */}
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

        {/* MITAD DERECHA: TABLERO DE DIAGNÓSTICO TÉCNICO KANAN (PROPUESTA B CON PERRITO ASOMADO QUE SIGUE AL CURSOR) */}
        <div
          ref={boardRef}
          onMouseMove={handleBoardMouseMove}
          onMouseLeave={handleBoardMouseLeave}
          className="lg:col-span-6 relative flex items-center justify-center min-h-[580px] lg:min-h-[660px]"
        >
          {/* PERRITO ASOMADO DETRÁS DE LA TARJETA (Z-INDEX 0) */}
          
          {/* 1. ASOMADO POR ARRIBA */}
          <motion.div
            initial={false}
            animate={{
              y: boardActiveZone === "top" ? -110 : 40,
              opacity: boardActiveZone === "top" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute top-0 left-12 z-0 pointer-events-none w-40 sm:w-44 select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          >
            {/* Colita en el lado izquierdo inferior/espalda con punta hacia arriba */}
            <motion.div
              animate={{ rotate: [-6, 12, -6] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute -left-6 bottom-3 w-14 sm:w-16 origin-bottom-right -z-10"
            >
              <img
                src="/images/mascot-peek-tail.png"
                alt="Cola alegre"
                className="w-full h-auto object-contain scale-x-[-1]"
              />
            </motion.div>

            <img
              src="/images/mascot-peek-top.png"
              alt="Kanan asomándose arriba"
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* 2. ASOMADO POR LA IZQUIERDA (Más arriba y más compacto para que quede al borde de la ficha) */}
          <motion.div
            initial={false}
            animate={{
              x: boardActiveZone === "left" ? 0 : 50,
              opacity: boardActiveZone === "left" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute right-full top-32 sm:top-36 z-0 pointer-events-none w-32 sm:w-36 select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.16)] flex justify-end"
          >
            <img
              src="/images/mascot-peek-left.png"
              alt="Kanan asomándose izquierda"
              className="w-full h-auto object-contain translate-x-1"
            />
          </motion.div>

          {/* 3. ASOMADO POR LA DERECHA (Más arriba y más compacto para que quede al borde de la ficha) */}
          <motion.div
            initial={false}
            animate={{
              x: boardActiveZone === "right" ? 0 : -50,
              opacity: boardActiveZone === "right" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute left-full top-32 sm:top-36 z-0 pointer-events-none w-32 sm:w-36 select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.16)] flex justify-start"
          >
            <img
              src="/images/mascot-peek-right.png"
              alt="Kanan asomándose derecha"
              className="w-full h-auto object-contain -translate-x-1"
            />
          </motion.div>

          {/* TARJETA PRINCIPAL DEL EXPEDIENTE (Z-INDEX 10 PARA QUE TAPE EL CUERPO DEL PERRITO) */}
          <div className="w-full relative z-10 bg-gradient-to-b from-white via-slate-50/90 to-blue-50/30 rounded-3xl p-6 sm:p-7 border-t-2 border-l-2 border-white/90 border-r border-b border-slate-200/80 shadow-[0_30px_70px_-15px_rgba(29,113,181,0.2),0_15px_30px_-10px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] flex flex-col justify-between overflow-hidden">
            
            {/* Resplandor biselado superior */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

            {/* CABECERA COMPACTA */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 bg-white/60 -mx-6 -mt-6 px-6 pt-5 rounded-t-3xl backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-50 to-blue-50 p-1 border border-cyan-200 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#1D71B5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#1D71B5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Técnico Especialista Kanan
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      En Línea
                    </span>
                  </div>
                  <h4 className="font-heading text-sm sm:text-base font-extrabold text-[#0F2438] leading-tight mt-0.5">
                    Expediente Técnico de Limpieza
                  </h4>
                </div>
              </div>

              {currentSpot && (
                <button
                  type="button"
                  onClick={() => onSelectSpot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
                  title="Cerrar diagnóstico"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* CONTENIDO INTERACTIVO: ESTADO VACÍO (INSPECCIÓN) VS DIAGNÓSTICO DEL ÁREA SELECCIONADA */}
            <div className="my-4 flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {currentSpot ? (
                  /* REPORTE TÉCNICO DEL SERVICIO TOCADO EN LA CASA */
                  <motion.div
                    key={currentSpot.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    {/* Título del servicio y badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-cyan-700 block">
                          {currentSpot.badge}
                        </span>
                        <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#0F2438] leading-tight mt-0.5">
                          {currentSpot.servicio}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                        {currentSpot.name}
                      </span>
                    </div>

                    {/* METRICAS DE DIAGNÓSTICO (HUMEDAD + ÁCAROS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Medidor 1: Extracción de Humedad */}
                      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5 text-cyan-700">
                            <ShieldCheck className="w-4 h-4 text-cyan-600" />
                            Extracción de Humedad
                          </span>
                          <span className="text-cyan-600 font-extrabold font-mono">90%</span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "90%" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-cyan-400 to-[#1D71B5] rounded-full"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {currentSpot.extraccionHumedad}
                        </p>
                      </div>

                      {/* Medidor 2: Esterilización UV y Desinfección */}
                      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5 text-purple-700">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Esterilización y Alérgenos
                          </span>
                          <span className="text-purple-600 font-extrabold font-mono">100%</span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {currentSpot.esterilizacionAcaros}
                        </p>
                      </div>
                    </div>

                    {/* ESPECIFICACIONES TÉCNICAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Maquinaria Certificada
                        </span>
                        <p className="font-heading font-bold text-slate-800 text-xs sm:text-sm mt-0.5">
                          {currentSpot.tecnologia}
                        </p>
                      </div>

                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Tiempo Estimado de Secado
                        </span>
                        <p className="font-heading font-bold text-slate-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-[#36A6DE]" />
                          {currentSpot.tiempoSecado}
                        </p>
                      </div>
                    </div>

                    {/* Descripción de proceso */}
                    <div className="bg-white/90 rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Alcance del Tratamiento
                      </span>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                        {currentSpot.descripcion}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ESTADO INICIAL: CHECKLIST DE INSPECCIÓN DEL HOGAR */
                  <motion.div
                    key="checklist-placeholder"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 py-2"
                  >
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1.5 text-center">
                      <h4 className="font-heading text-base sm:text-lg font-extrabold text-[#355581]">
                        ¿Qué área de tu casa deseas renovar hoy?
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                        Toca las píldoras en la maqueta 3D para desplegar el diagnóstico de fibras, maquinaria alemana y nivel de extracción.
                      </p>
                    </div>

                    {/* Checklist interactivo de áreas inspeccionables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.values(TOWER_SPOTS).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectSpot(s.id)}
                          className="p-3 rounded-2xl bg-white hover:bg-cyan-50/80 border border-slate-200/80 hover:border-cyan-300 text-left transition-all active:scale-[0.98] shadow-2xs cursor-pointer group flex items-start gap-2.5"
                        >
                          <div className="w-7 h-7 rounded-xl bg-cyan-50 group-hover:bg-[#1D71B5] group-hover:text-white text-[#1D71B5] flex items-center justify-center shrink-0 transition-colors text-xs font-bold">
                            ✓
                          </div>
                          <div>
                            <span className="font-heading font-extrabold text-xs block text-slate-800 group-hover:text-[#1D71B5]">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {s.badge}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTONES DE ACCIÓN: SUMAR AL PEDIDO Y COTIZAR */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {currentSpot ? (
                <>
                  <button
                    type="button"
                    onClick={() => onToggleCart(currentSpot.id)}
                    className={`flex-1 py-3 px-4 rounded-2xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      cartItems.includes(currentSpot.id)
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 shadow-sm"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
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
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#1D71B5] via-[#36A6DE] to-[#355581] hover:from-[#165a91] hover:to-[#1D71B5] text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/30 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Cotizar ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenWizard()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#165a91] hover:to-[#1D71B5] text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Cotizar mi casa completa en línea</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
