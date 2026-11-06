"use client";

import React, { useState, useEffect } from "react";
import { ServicioCita, Cliente, EstatusCita, TurnoServicio } from "@/types/crm";
import {
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Car,
  Sparkles,
  Phone,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
} from "lucide-react";

interface KanbanBoardProps {
  citas: ServicioCita[];
  clientes: Cliente[];
  onUpdateStatus: (citaId: string, nuevoEstatus: EstatusCita) => Promise<void>;
  onRefresh: () => void;
}

interface ColumnaKanban {
  id: EstatusCita;
  titulo: string;
  emoji: string;
  colorBorde: string;
  colorBadge: string;
  colorBg: string;
}

const COLUMNAS: ColumnaKanban[] = [
  {
    id: "Por Confirmar",
    titulo: "Por Confirmar",
    emoji: "📋",
    colorBorde: "border-slate-300",
    colorBadge: "bg-slate-100 text-slate-700",
    colorBg: "bg-slate-50/60",
  },
  {
    id: "Confirmada",
    titulo: "Confirmadas",
    emoji: "🗓️",
    colorBorde: "border-blue-300",
    colorBadge: "bg-blue-100 text-blue-800",
    colorBg: "bg-blue-50/30",
  },
  {
    id: "En Ruta",
    titulo: "En Ruta",
    emoji: "🚗",
    colorBorde: "border-amber-300",
    colorBadge: "bg-amber-100 text-amber-800",
    colorBg: "bg-amber-50/30",
  },
  {
    id: "En Proceso",
    titulo: "En Proceso",
    emoji: "🧼",
    colorBorde: "border-cyan-400",
    colorBadge: "bg-cyan-100 text-cyan-900",
    colorBg: "bg-cyan-50/40",
  },
  {
    id: "Completada",
    titulo: "Completadas",
    emoji: "✅",
    colorBorde: "border-emerald-300",
    colorBadge: "bg-emerald-100 text-emerald-800",
    colorBg: "bg-emerald-50/30",
  },
];

export function KanbanBoard({
  citas,
  clientes,
  onUpdateStatus,
  onRefresh,
}: KanbanBoardProps) {
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [draggedCitaId, setDraggedCitaId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<EstatusCita | null>(null);

  // Auto-refresco cada 12 segundos para mantener sincronía con el técnico
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 12000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  // Filtrado de citas
  const citasFiltradas = citas.filter((c) => {
    if (c.estatus === "Cancelada") return false;
    const cliente = clientes.find((cl) => cl.id === c.cliente_id);

    if (filtroMunicipio !== "todos" && cliente?.municipio !== filtroMunicipio) {
      return false;
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchFolio = c.id.toLowerCase().includes(q);
      const matchNombre = cliente?.nombre.toLowerCase().includes(q) || false;
      const matchDir = cliente?.direccion.toLowerCase().includes(q) || false;
      if (!matchFolio && !matchNombre && !matchDir) return false;
    }

    return true;
  });

  const cambiarEstadoCita = async (citaId: string, nuevoEstatus: EstatusCita) => {
    setActualizandoId(citaId);
    try {
      await onUpdateStatus(citaId, nuevoEstatus);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Herramientas */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, folio o calle..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D71B5]"
            />
          </div>

          <select
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D71B5]"
          >
            <option value="todos">Todos los municipios</option>
            <option value="Guadalajara">Guadalajara</option>
            <option value="Zapopan">Zapopan</option>
            <option value="Tlajomulco">Tlajomulco</option>
            <option value="Tlaquepaque">Tlaquepaque</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-heading font-bold transition active:scale-95"
            title="Refrescar en tiempo real"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
          <span className="text-[11px] font-heading font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sincronía en Vivo</span>
          </span>
        </div>
      </div>

      {/* Tablero Kanban (Scroll horizontal natural en tablet y móvil para evitar columnas aplastadas) */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4 pt-1 snap-x no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        {COLUMNAS.map((col) => {
          const citasColumna = citasFiltradas.filter((c) => c.estatus === col.id);
          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverColId !== col.id) setDragOverColId(col.id);
              }}
              onDragLeave={() => {
                if (dragOverColId === col.id) setDragOverColId(null);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOverColId(null);
                const citaId = e.dataTransfer.getData("text/plain") || draggedCitaId;
                if (citaId) {
                  const targetCita = citas.find((c) => c.id === citaId);
                  if (targetCita && targetCita.estatus !== col.id) {
                    await cambiarEstadoCita(citaId, col.id);
                  }
                }
                setDraggedCitaId(null);
              }}
              className={`rounded-3xl border ${
                isOver ? "border-[#1D71B5] bg-blue-50/70 ring-2 ring-[#1D71B5]/30 shadow-md" : `${col.colorBorde} ${col.colorBg}`
              } p-3.5 flex flex-col min-h-[460px] sm:min-h-[480px] w-[280px] sm:w-[300px] md:w-auto shrink-0 snap-start space-y-3 transition shadow-xs`}
            >
              {/* Encabezado de Columna */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-1.5 font-heading font-extrabold text-xs text-slate-800">
                  <span>{col.emoji}</span>
                  <span>{col.titulo}</span>
                </div>
                <span className={`text-[10px] font-heading font-black px-2 py-0.5 rounded-full ${col.colorBadge}`}>
                  {citasColumna.length}
                </span>
              </div>

              {/* Lista de Tarjetas de Cita */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[640px]">
                {citasColumna.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">
                    Sin citas
                  </div>
                ) : (
                  citasColumna.map((cita) => {
                    const cliente = clientes.find((cl) => cl.id === cita.cliente_id);
                    const estaActualizando = actualizandoId === cita.id;
                    const isDraggingThis = draggedCitaId === cita.id;

                    return (
                      <div
                        key={cita.id}
                        draggable={!estaActualizando}
                        onDragStart={(e) => {
                          setDraggedCitaId(cita.id);
                          e.dataTransfer.setData("text/plain", cita.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggedCitaId(null);
                          setDragOverColId(null);
                        }}
                        className={`bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5 transition hover:shadow-md cursor-grab active:cursor-grabbing ${
                          estaActualizando ? "opacity-50 pointer-events-none" : ""
                        } ${isDraggingThis ? "opacity-40 scale-95 border-dashed border-[#1D71B5]" : ""}`}
                      >
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-heading font-black text-xs text-[#1D71B5]">
                            {cita.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {cita.turno.startsWith("Matutino") ? "☀️ Mañana" : "🌤️ Tarde"}
                          </span>
                        </div>

                        {/* Datos del Cliente */}
                        <div className="space-y-0.5">
                          <p className="font-heading font-extrabold text-xs text-slate-900 leading-tight">
                            {cliente?.nombre || "Cliente"}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{cliente?.colonia || cliente?.municipio}</span>
                          </p>
                        </div>

                        {/* Items contratados */}
                        <div className="bg-[#F8FAFC] p-2 rounded-xl text-[11px] text-slate-700 font-medium line-clamp-2 border border-slate-100">
                          {cita.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ")}
                        </div>

                        {/* Indicador de Tiempo Real si está En Proceso */}
                        {cita.estatus === "En Proceso" && (
                          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-2 text-center text-[11px] font-heading font-extrabold text-cyan-900 flex items-center justify-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            <span>
                              {cita.hora_inicio
                                ? `Inició ${new Date(cita.hora_inicio).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`
                                : "Limpieza activa"}
                            </span>
                          </div>
                        )}

                        {/* Duración registrada si está completada */}
                        {cita.estatus === "Completada" && cita.duracion_minutos && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-1.5 text-center text-[10px] font-heading font-bold text-emerald-800">
                            ⏱️ Duración: {cita.duracion_minutos} min
                            {cita.calificacion_estrellas ? ` · ${cita.calificacion_estrellas}⭐` : ""}
                          </div>
                        )}

                        {/* Acciones de cambio de estado rápido */}
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">
                            Mover a:
                          </span>
                          <div className="flex items-center gap-1">
                            {col.id !== "Confirmada" && col.id === "Por Confirmar" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoCita(cita.id, "Confirmada")}
                                className="text-[10px] font-heading font-bold px-2 py-1 rounded-lg bg-blue-50 text-[#1D71B5] hover:bg-blue-100 transition"
                              >
                                Confirmar
                              </button>
                            )}
                            {col.id === "Confirmada" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoCita(cita.id, "En Ruta")}
                                className="text-[10px] font-heading font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                              >
                                En Ruta 🚗
                              </button>
                            )}
                            {col.id === "En Ruta" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoCita(cita.id, "En Proceso")}
                                className="text-[10px] font-heading font-bold px-2 py-1 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition"
                              >
                                Iniciar 🧼
                              </button>
                            )}
                            {col.id === "En Proceso" && (
                              <button
                                type="button"
                                onClick={() => cambiarEstadoCita(cita.id, "Completada")}
                                className="text-[10px] font-heading font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                              >
                                Concluir ✅
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
