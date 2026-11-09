"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Dog, Bed, ShieldAlert } from "lucide-react";

export function HealthCheckupCalculator({ onOpenWizard }: { onOpenWizard: (catId?: string) => void }) {
  const [monthsWithoutWash, setMonthsWithoutWash] = useState<number>(12);
  const [hasPets, setHasPets] = useState<boolean>(true);
  const [hasAllergies, setHasAllergies] = useState<boolean>(true);

  // Cálculo de índice de riesgo textil (0 a 100)
  const calculateRisk = () => {
    let score = Math.min(monthsWithoutWash * 5, 55);
    if (hasPets) score += 25;
    if (hasAllergies) score += 20;
    return Math.min(score, 98);
  };

  const riskScore = calculateRisk();

  const getRiskLevel = () => {
    if (riskScore >= 70) return { label: "ALTO RIESGO", color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/40" };
    if (riskScore >= 45) return { label: "MODERADO", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/40" };
    return { label: "LEVE", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40" };
  };

  const risk = getRiskLevel();

  return (
    <section className="py-16 sm:py-24 bg-[#0A1828] text-white relative overflow-hidden border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-4 py-1 text-xs font-heading font-extrabold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Checkup Diagnóstico Textil</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¿Qué tan saludable está tu sala o colchón?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base">
            Responde 3 preguntas rápidas y conoce tu índice de acumulación de alérgenos en tiempo real:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          {/* Cuestionario Interactivo (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pregunta 1: Meses sin lavar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-heading font-bold">
                <span className="text-slate-200">¿Hace cuánto tiempo no lavas tus muebles?</span>
                <span className="text-cyan-300 text-base">{monthsWithoutWash} {monthsWithoutWash === 1 ? "mes" : "meses"}</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                step="1"
                value={monthsWithoutWash}
                onChange={(e) => setMonthsWithoutWash(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#36A6DE]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 mes</span>
                <span>1 año</span>
                <span>2 años</span>
                <span>3+ años</span>
              </div>
            </div>

            {/* Pregunta 2: Mascotas */}
            <div className="space-y-2">
              <span className="text-sm font-heading font-bold text-slate-200 block">
                ¿Tus mascotas se suben a los sillones o duermen contigo?
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasPets(true)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 border transition-all ${
                    hasPets
                      ? "bg-[#1D71B5] text-white border-[#36A6DE] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Dog className="w-4 h-4" />
                  <span>Sí, tengo mascotas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHasPets(false)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 border transition-all ${
                    !hasPets
                      ? "bg-[#1D71B5] text-white border-[#36A6DE] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span>No tengo mascotas</span>
                </button>
              </div>
            </div>

            {/* Pregunta 3: Alergias o congestión */}
            <div className="space-y-2">
              <span className="text-sm font-heading font-bold text-slate-200 block">
                ¿Alguien en casa sufre de alergias, estornudos o asma?
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasAllergies(true)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 border transition-all ${
                    hasAllergies
                      ? "bg-[#1D71B5] text-white border-[#36A6DE] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span>Sí, frecuentemente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHasAllergies(false)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 border transition-all ${
                    !hasAllergies
                      ? "bg-[#1D71B5] text-white border-[#36A6DE] shadow-md"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span>No, ninguno</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resultado Clínico (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0B1E32] to-[#071320] p-6 rounded-2xl border border-white/15 space-y-5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-heading font-extrabold text-slate-400">
                Índice de Acumulación
              </span>
              <span className={`text-xs font-heading font-extrabold px-3 py-1 rounded-full border ${risk.bg} ${risk.color}`}>
                {risk.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-5xl text-white">{riskScore}%</span>
              <span className="text-xs text-slate-400">saturación estimada</span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${riskScore}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-500 rounded-full"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {riskScore >= 70
                ? "Se recomienda desinfección urgente por Inyección-Succión Alemana + Luz UV para eliminar ácaros incrustados."
                : "Tus muebles tienen acumulación moderada de polvo y células muertas. Un lavado preventivo protegerá los tejidos."}
            </p>

            <button
              type="button"
              onClick={() => onOpenWizard("salas")}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] hover:from-[#355581] hover:to-[#1D71B5] text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Aplicar Tratamiento Recomendado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
