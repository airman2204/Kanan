"use client";

import { useMemo } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Receipt,
  Car,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Cliente, ServicioCita } from "@/types/crm";
import { JaliscoServiceMap } from "@/components/admin/JaliscoServiceMap";

interface ResumenDashboardProps {
  clientes: Cliente[];
  citas: ServicioCita[];
  onNavigateToCalendar: (status?: string | null) => void;
  onNavigateToWhatsApp?: () => void;
}

export function ResumenDashboard({
  clientes,
  citas,
  onNavigateToCalendar,
  onNavigateToWhatsApp,
}: ResumenDashboardProps) {
  const hoyStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // 1. Cálculos Financieros y de Citas
  const citasActivas = useMemo(() => citas.filter((c) => c.estatus !== "Cancelada"), [citas]);
  const totalGanancias = useMemo(() => clientes.reduce((acc, c) => acc + (c.historico_gasto || 0), 0), [clientes]);
  const ticketPromedio = useMemo(() => {
    return citasActivas.length > 0 ? Math.round(totalGanancias / citasActivas.length) : 0;
  }, [totalGanancias, citasActivas]);

  // 2. Citas del Día de Hoy
  const citasHoy = useMemo(() => {
    return citasActivas.filter((c) => c.fecha === hoyStr);
  }, [citasActivas, hoyStr]);

  // 3. Alertas Operativas de Acción Rápida
  const citasPorConfirmar = useMemo(() => {
    return citasActivas.filter((c) => c.estatus === "Por Confirmar");
  }, [citasActivas]);

  // 4. Desglose DINÁMICO de Servicios por Municipio
  // Solo se listan los municipios que realmente tienen servicios registrados
  const distribucionMunicipios = useMemo(() => {
    const counts: Record<string, number> = {};
    citasActivas.forEach((c) => {
      const cli = clientes.find((cl) => cl.id === c.cliente_id);
      const mun = (cli?.municipio || "Sin Municipio").trim();
      counts[mun] = (counts[mun] || 0) + 1;
    });
    // Ordenar de mayor a menor volumen
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [citasActivas, clientes]);

  return (
    <div className="space-y-6">
      {/* 1. BANDA DE ALERTAS DE ACCIÓN RÁPIDA (Solo visible si hay pendientes) */}
      {citasPorConfirmar.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                Atención requerida: {citasPorConfirmar.length} {citasPorConfirmar.length === 1 ? "cita pendiente" : "citas pendientes"} de confirmación
              </h4>
              <p className="text-[11px] text-amber-800">
                Verifica la disponibilidad con el cliente para asegurar el turno y el técnico asignado.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToCalendar("Por Confirmar")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Revisar Citas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FILA DE TARJETAS DE ALTO NIVEL (KPIS REALES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Ganancias Totales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#355581]/70 tracking-wider uppercase">
              Ganancias
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1D71B5] to-[#36A6DE] text-white shadow-md shadow-[#1D71B5]/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
              ${totalGanancias.toLocaleString("es-MX")}
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              MXN Cobrado
            </span>
          </div>
        </div>

        {/* Citas de Hoy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#355581]/70 tracking-wider uppercase">
              Agenda de Hoy
            </span>
            <div className="p-2.5 rounded-xl bg-[#0F172A] text-white shadow-md shadow-slate-900/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
              {citasHoy.length}
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              Servicios programados
            </span>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#355581]/70 tracking-wider uppercase">
              Ticket Promedio
            </span>
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
              ${ticketPromedio.toLocaleString("es-MX")}
            </p>
            <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
              Por servicio cerrado
            </span>
          </div>
        </div>

        {/* Clientes Registrados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-emerald-800/70 tracking-wider uppercase">
              Clientes Registrados
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {clientes.length}
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Base de datos única
            </span>
          </div>
        </div>
      </div>

      {/* 3. BLOQUE CENTRAL: MAPA DE JALISCO + AGENDA DE HOY (LADO A LADO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Izquierdo (7 cols): Mapa de Jalisco */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#36A6DE]" />
              <h3 className="font-heading font-extrabold text-base text-[#355581]">
                Cobertura Activa en Jalisco (ZMG)
              </h3>
            </div>
            <span className="text-xs font-bold bg-[#F4F7F9] px-3 py-1 rounded-full text-[#1D71B5] border border-slate-200">
              {citasActivas.length} servicios en mapa
            </span>
          </div>

          <JaliscoServiceMap
            citas={citasActivas}
            clientes={clientes}
            onSelectCitaForCalendar={onNavigateToCalendar}
          />
        </div>

        {/* Lado Derecho (5 cols): Ruta y Agenda de Hoy */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#1D71B5]" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Ruta de Hoy
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>

            {citasHoy.length > 0 ? (
              <div className="divide-y divide-slate-100 mt-2 max-h-[360px] overflow-y-auto">
                {citasHoy.map((cita) => {
                  const cliente = clientes.find((c) => c.id === cita.cliente_id);
                  return (
                    <div key={cita.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {cliente?.nombre || "Cliente"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            {cliente?.municipio}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cita.turno}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {cita.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ")}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          cita.estatus === "Completada" ? "bg-emerald-50 text-emerald-700" :
                          cita.estatus === "Confirmada" ? "bg-blue-50 text-blue-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {cita.estatus}
                        </span>
                        {cliente?.whatsapp && (
                          <a
                            href={`https://wa.me/52${cliente.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                            title="Chat de WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Sin citas para hoy</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Las citas agendadas para la fecha actual aparecerán listadas aquí con su turno y zona.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToCalendar()}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <span>Ver Calendario Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. FILA INFERIOR: DISTRIBUCIÓN DINÁMICA DE SERVICIOS POR ZONA / MUNICIPIO */}
      {distribucionMunicipios.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                Demanda por Municipio y Zona
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {distribucionMunicipios.length} {distribucionMunicipios.length === 1 ? "zona registrada" : "zonas registradas"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {distribucionMunicipios.map(([muni, count]) => {
              const pct = citasActivas.length > 0 ? Math.round((count / citasActivas.length) * 100) : 0;
              return (
                <div key={muni} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 truncate mr-2" title={muni}>{muni}</span>
                    <span className="font-semibold text-slate-400 shrink-0">{pct}%</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {count} <span className="text-xs font-normal text-slate-500">servicios</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#1D71B5] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
