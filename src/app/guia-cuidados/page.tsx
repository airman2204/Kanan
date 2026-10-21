import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Droplets,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  PawPrint,
  CalendarCheck,
} from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";

export default function GuiaCuidadosPage() {
  return (
    <div className="min-h-screen bg-kanan-ice text-kanan-deep py-8 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-kanan-lg overflow-hidden">
        {/* Cabecera Oficial Kanan */}
        <div className="bg-kanan-deep text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <KananLogo variant="white" />
            <span className="inline-block px-3 py-0.5 rounded-full bg-kanan-cyan/20 text-kanan-cyan text-xs font-bold uppercase tracking-wider">
              Recurso Exclusivo Poservicio (+24h)
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight pt-1">
              Guía de Cuidados Rápidos ante Derrames Accidentales
            </h1>
          </div>

          <img
            src="/assets/brand/kanan-dog.png"
            alt="Kanan Dog"
            className="w-24 h-24 object-contain bg-white rounded-2xl p-2 border-2 border-kanan-cyan shrink-0"
          />
        </div>

        {/* Contenido de la Guía */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            ¡Tus muebles acaban de recibir una limpieza y desinfección profunda con{" "}
            <strong>Kanan Servicios de Limpieza</strong>! Si ocurre un derrame accidental de café,
            vino, refresco o algún accidente de tu mascota, sigue estos{" "}
            <strong>4 pasos de oro aprobados por Kanan Dog</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-kanan-navy font-heading font-bold text-sm">
                <Droplets className="w-5 h-5 text-kanan-cyan" />
                <span>1. Absorbe en los primeros 60 seg (No frotes)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coloca una toalla blanca limpia o papel absorbente presionando suavemente hacia
                abajo. <strong>Nunca talles en círculos</strong>, ya que eso abre la fibra y fija la
                mancha más profundo.
              </p>
            </div>

            <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-kanan-navy font-heading font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-kanan-cyan" />
                <span>2. Evita el cloro y jabones de trastes</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Los detergentes de cocina dejan residuos pegajosos que atraen el doble de polvo en
                pocos días. Usa únicamente agua tibia ligeramente humedecida en un paño de
                microfibra blanco.
              </p>
            </div>

            <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-kanan-navy font-heading font-bold text-sm">
                <PawPrint className="w-5 h-5 text-kanan-cyan" />
                <span>3. Accidentes de Mascotas (Pet-Friendly)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Después de absorber el líquido con toalla de papel, aplica una mezcla ligera de 80%
                agua purificada y 20% vinagre blanco con atomizador y vuelve a secar a toquecitos.
              </p>
            </div>

            <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-kanan-navy font-heading font-bold text-sm">
                <Sparkles className="w-5 h-5 text-kanan-cyan" />
                <span>4. Mantenimiento Preventivo (3 a 6 meses)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aspira en seco una vez por semana y agenda tu desinfección profunda Kanan cada{" "}
                <strong>3 meses</strong> si tienes mascotas en casa o cada{" "}
                <strong>6 meses</strong> en uso residencial normal.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>¿Necesitas apoyo profesional de emergencia?</strong> Como cliente Kanan,
              escríbenos al WhatsApp <strong>33 4016 0684</strong> con una foto del derrame y te
              orientaremos de inmediato.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-kanan-ice hover:bg-slate-200 text-kanan-deep font-heading font-bold text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Sitio Principal</span>
            </Link>

            <Link
              href="/#agendar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-kanan-cyan hover:bg-[#009ec0] text-white font-heading font-bold text-xs sm:text-sm shadow-cyan-glow"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Agendar Mantenimiento</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
