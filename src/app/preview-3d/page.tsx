"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Timer,
  Plus,
  Check,
  X,
  MessageSquare,
  BedDouble,
  Sofa,
  CarFront,
  RotateCcw,
  Sparkle,
  PhoneCall,
  MapPin,
  Lock,
} from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";
import confetti from "canvas-confetti";

// Cargar el visor WebGL sin SSR
const RealGlbViewer = dynamic(
  () => import("@/components/diorama/RealGlbViewer").then((mod) => mod.RealGlbViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300 gap-3">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#36A6DE] border-t-transparent animate-spin" />
        <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-300">
          Iniciando WebGL 3D...
        </span>
      </div>
    ),
  }
);

interface RoomDetails {
  id: string;
  label: string;
  nombreServicio: string;
  tiempoSecado: string;
  tecnologia: string;
  descripcion: string;
  icono: any;
}

const ROOMS_INFO: Record<string, RoomDetails> = {
  salas: {
    id: "salas",
    label: "LA SALA DE ESTAR",
    nombreServicio: "Limpieza Profunda de Salas y Sillones",
    tiempoSecado: "3 a 4 horas* (90% de humedad extraída)",
    tecnologia: "Inyección-Succión Alemana Kärcher",
    descripcion:
      "Desincrusta polvo acumulado, manchas de alimentos y olores orgánicos sin dañar el tejido.",
    icono: Sofa,
  },
  colchones: {
    id: "colchones",
    label: "LA RECÁMARA PRINCIPAL",
    nombreServicio: "Sanitización Antiácaros de Colchones",
    tiempoSecado: "Listo para dormir el mismo día",
    tecnologia: "Luz UV Germicida + Extracción Profunda",
    descripcion:
      "Eliminación de ácaros, bacterias y células muertas. Esencial para alergias y salud respiratoria.",
    icono: BedDouble,
  },
  tapetes: {
    id: "tapetes",
    label: "EL COMEDOR Y PASILLOS",
    nombreServicio: "Lavado de Sillas y Tapetes Decorativos",
    tiempoSecado: "Recolección a taller (3 días)",
    tecnologia: "Inmersión controlada y centrifugado",
    descripcion:
      "Cuidado delicado para fibras finas, desmanchado profundo y perfumado textil.",
    icono: Sparkles,
  },
  autos: {
    id: "autos",
    label: "LA COCHERA / EXTERIOR",
    nombreServicio: "Detallado de Vestiduras Automotrices",
    tiempoSecado: "2 a 3 horas*",
    tecnologia: "Unidad Móvil a Domicilio en tu cochera",
    descripcion:
      "Limpieza de asientos, cielo y alfombra de autos y camionetas directo en tu domicilio.",
    icono: CarFront,
  },
};

export default function Preview3DLabPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("salas");
  const [cartItems, setCartItems] = useState<string[]>(["salas"]);

  const toggleCart = (id: string) => {
    setCartItems((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: { y: 0.9 },
            colors: ["#36A6DE", "#1D71B5", "#25D366"],
          });
        } catch {}
      }
      return next;
    });
  };

  const currentRoom = selectedRoomId ? ROOMS_INFO[selectedRoomId] : null;

  const generateWhatsAppUrl = () => {
    const items = cartItems.map((id) => ROOMS_INFO[id]?.nombreServicio).filter(Boolean).join(", ");
    const text = `¡Hola Kanan Limpieza! 🐾 Estuve en la vista previa del Hogar 3D (.GLB) y deseo cotizar: ${items}`;
    return `https://wa.me/523326154699?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#081320] via-[#0E2034] to-[#050C14] text-white select-none flex flex-col justify-between">
      {/* HEADER DE PRUEBA PRIVADO */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <KananLogo variant="white" size="sm" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-heading font-extrabold border border-emerald-400/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Entorno Privado: Visor 3D (.GLB Meshy)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 hidden sm:inline-block">
            Modelo: <strong className="text-cyan-300">kanan-house.glb</strong>
          </span>
          <a
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-heading font-bold text-slate-200 transition-colors"
          >
            ← Volver al sitio público
          </a>
        </div>
      </header>

      {/* ÁREA CENTRAL DE RENDER 3D REAL WEBGL */}
      <div className="relative flex-1 w-full h-full">
        <RealGlbViewer
          onSelectRoom={(id) => setSelectedRoomId(id)}
          selectedRoom={selectedRoomId}
        />

        {/* Indicador de ayuda */}
        <div className="absolute top-4 left-4 sm:left-8 z-20 pointer-events-none flex items-center gap-2 text-slate-300 text-xs bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
          <RotateCcw className="w-3.5 h-3.5 text-[#36A6DE] animate-spin" style={{ animationDuration: "8s" }} />
          <span>Haz clic y arrastra con el ratón o el dedo para girar tu modelo 3D en 360°</span>
        </div>

        {/* TARJETA GLASSMORPHISM LATERAL */}
        <AnimatePresence>
          {currentRoom && (
            <motion.div
              key={currentRoom.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-4 sm:left-8 z-30 max-w-sm w-[90vw] sm:w-auto bg-white/95 backdrop-blur-xl text-slate-800 p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/60 space-y-3"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#1D71B5] block">
                    {currentRoom.label}
                  </span>
                  <h3 className="font-heading text-base font-extrabold text-[#0F2438] leading-tight">
                    {currentRoom.nombreServicio}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-[#36A6DE] shrink-0" />
                  <span className="font-bold">Secado:</span>
                  <span>{currentRoom.tiempoSecado}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold">Tecnología:</span>
                  <span className="truncate">{currentRoom.tecnologia}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  {currentRoom.descripcion}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleCart(currentRoom.id)}
                className={`w-full py-2.5 px-3 rounded-2xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  cartItems.includes(currentRoom.id)
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-[#1D71B5] hover:bg-[#355581] text-white"
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
                    <span>Añadir a mi Cotización</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BARRA INFERIOR HUD */}
      <footer className="relative z-30 w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
        <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-[0_16px_50px_rgba(0,0,0,0.5)] border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <span className="text-xs font-heading font-extrabold text-[#0F2438] border-r border-slate-200 pr-3 hidden sm:inline-block">
              Tu Selección ({cartItems.length}):
            </span>

            {Object.values(ROOMS_INFO).map((room) => {
              const active = cartItems.includes(room.id);
              const IconComp = room.icono;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    toggleCart(room.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition-all border ${
                    active
                      ? "bg-[#1D71B5] text-white border-[#1D71B5] shadow-sm ring-2 ring-cyan-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{room.label.replace("LA ", "").replace("EL ", "").split(" ")[0]}</span>
                  {active ? <span className="text-cyan-200">✓</span> : <span className="text-slate-400">+</span>}
                </button>
              );
            })}
          </div>

          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7569] text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all shrink-0"
          >
            <MessageSquare className="w-4 h-4 fill-white text-white" />
            <span>Enviar a Kanan Dog por WhatsApp</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
