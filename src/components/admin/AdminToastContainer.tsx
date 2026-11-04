"use client";

import React from "react";
import { X, Calendar, MessageCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export interface AdminToast {
  id: string;
  tipo: "cita_nueva" | "mensaje_chat" | "cita_confirmada" | "cita_cancelada";
  titulo: string;
  descripcion: string;
  clienteNombre?: string;
  folio?: string;
  onAction?: () => void;
  actionLabel?: string;
}

interface AdminToastContainerProps {
  toasts: AdminToast[];
  onDismiss: (id: string) => void;
}

export function AdminToastContainer({ toasts, onDismiss }: AdminToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCitaNueva = toast.tipo === "cita_nueva";
        const isChat = toast.tipo === "mensaje_chat";
        const isConfirmada = toast.tipo === "cita_confirmada";
        const isCancelada = toast.tipo === "cita_cancelada";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-3xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-slideInRight flex flex-col gap-2.5 ${
              isCitaNueva
                ? "bg-white/95 border-emerald-300/80 text-slate-800 ring-2 ring-emerald-500/10"
                : isChat
                ? "bg-white/95 border-blue-300/80 text-slate-800 ring-2 ring-blue-500/10"
                : isConfirmada
                ? "bg-white/95 border-emerald-400 text-slate-800"
                : "bg-white/95 border-rose-300 text-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isCitaNueva
                      ? "bg-emerald-500 text-white"
                      : isChat
                      ? "bg-[#1D71B5] text-white"
                      : isConfirmada
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {isCitaNueva && <Calendar className="w-5 h-5" />}
                  {isChat && <MessageCircle className="w-5 h-5" />}
                  {isConfirmada && <CheckCircle2 className="w-5 h-5" />}
                  {isCancelada && <AlertTriangle className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-xs text-slate-900">
                      {toast.titulo}
                    </span>
                    {toast.folio && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {toast.folio}
                      </span>
                    )}
                  </div>
                  {toast.clienteNombre && (
                    <p className="text-[11px] font-bold text-slate-500 truncate max-w-[200px]">
                      {toast.clienteNombre}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Cerrar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-snug pl-11">
              {toast.descripcion}
            </p>

            {toast.onAction && toast.actionLabel && (
              <div className="pt-2 pl-11 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-heading font-extrabold text-[#1D71B5] hover:text-blue-800 transition"
                >
                  <span>{toast.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
