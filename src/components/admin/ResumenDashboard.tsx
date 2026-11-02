"use client";

import { useState, useMemo } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Receipt,
  Car,
  ChevronRight,
  Sofa,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowRight,
  BarChart2,
  CheckCircle2,
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
  const [showHojaRutaModal, setShowHojaRutaModal] = useState(false);
  const [copiadoRuta, setCopiadoRuta] = useState(false);
  const hoy = useMemo(() => new Date(), []);
  const hoyStr = useMemo(() => hoy.toISOString().split("T")[0], [hoy]);

  // 1. Cálculos Financieros y de Citas
  const citasActivas = useMemo(() => citas.filter((c) => c.estatus !== "Cancelada"), [citas]);
  const totalGanancias = useMemo(() => clientes.reduce((acc, c) => acc + (c.historico_gasto || 0), 0), [clientes]);
  const ticketPromedio = useMemo(() => {
    return citasActivas.length > 0 ? Math.round(totalGanancias / citasActivas.length) : 0;
  }, [totalGanancias, citasActivas]);

  // Comparativa Mes Actual vs Mes Anterior
  const comparativaMes = useMemo(() => {
    const mesActualNum = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const mesAnteriorNum = mesActualNum === 0 ? 11 : mesActualNum - 1;
    const anioAnterior = mesActualNum === 0 ? anioActual - 1 : anioActual;

    let totalMesActual = 0;
    let totalMesAnterior = 0;

    citasActivas.forEach((c) => {
      if (c.monto_total) {
        const d = new Date(c.fecha);
        if (d.getMonth() === mesActualNum && d.getFullYear() === anioActual) {
          totalMesActual += c.monto_total;
        } else if (d.getMonth() === mesAnteriorNum && d.getFullYear() === anioAnterior) {
          totalMesAnterior += c.monto_total;
        }
      }
    });

    let porcentaje = 0;
    if (totalMesAnterior > 0) {
      porcentaje = Math.round(((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100);
    } else if (totalMesActual > 0) {
      porcentaje = 100;
    }

    return {
      mesActual: totalMesActual,
      mesAnterior: totalMesAnterior,
      porcentaje,
    };
  }, [citasActivas, hoy]);

  // 2. Citas del Día de Hoy
  const citasHoy = useMemo(() => {
    return citasActivas.filter((c) => c.fecha === hoyStr);
  }, [citasActivas, hoyStr]);

  // 3. Alertas Operativas de Acción Rápida
  const citasPorConfirmar = useMemo(() => {
    return citasActivas.filter((c) => c.estatus === "Por Confirmar");
  }, [citasActivas]);

  // 4. Desglose DINÁMICO de Servicios por Municipio
  const distribucionMunicipios = useMemo(() => {
    const counts: Record<string, number> = {};
    citasActivas.forEach((c) => {
      const cli = clientes.find((cl) => cl.id === c.cliente_id);
      const mun = (cli?.municipio || "Sin Municipio").trim();
      counts[mun] = (counts[mun] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [citasActivas, clientes]);

  // 5. TOP PIEZAS / SERVICIOS MÁS SOLICITADOS
  const topServiciosSolicitados = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalPiezas = 0;

    citasActivas.forEach((c) => {
      c.items_contratados.forEach((item) => {
        const nombre = item.piezaNombre || "Servicio General";
        counts[nombre] = (counts[nombre] || 0) + item.cantidad;
        totalPiezas += item.cantidad;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        porcentaje: totalPiezas > 0 ? Math.round((cantidad / totalPiezas) * 100) : 0,
      }));
  }, [citasActivas]);

  const copiarRutaWhatsApp = () => {
    if (citasHoy.length === 0) return;
    const fechaTexto = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
    let texto = `*HOJA DE RUTA KANAN* 🚐\nFecha: ${fechaTexto}\nTotal servicios: ${citasHoy.length}\n`;
    texto += `------------------------------------\n\n`;

    citasHoy.forEach((cita, idx) => {
      const cli = clientes.find((c) => c.id === cita.cliente_id);
      const items = cita.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ");
      texto += `*PARADA ${idx + 1} (${cita.turno.includes("Matutino") ? "TURNO MAÑANA" : "TURNO TARDE"})*\n`;
      texto += `👤 Cliente: ${cli?.nombre || "Sin nombre"}\n`;
      texto += `📞 WhatsApp: ${cli?.whatsapp || "N/D"}\n`;
      texto += `📍 Dirección: ${cli?.direccion || "N/D"}, ${cli?.municipio || ""}${cli?.codigo_postal ? ` (CP ${cli.codigo_postal})` : ""}\n`;
      if (cita.instrucciones_acceso) {
        texto += `🔑 Acceso / Coto: ${cita.instrucciones_acceso}\n`;
      }
      texto += `🛋️ Items: ${items || "Limpieza general"}\n`;
      if (cita.tipo_tela) texto += `🧵 Tela: ${cita.tipo_tela}\n`;
      if (cita.cuenta_con_agua_y_luz !== undefined) {
        texto += `⚡ Agua/Luz: ${cita.cuenta_con_agua_y_luz ? "Sí disponible" : "No disponible"}\n`;
      }
      texto += `💰 Cobro: ${cita.monto_total ? `$${cita.monto_total.toLocaleString("es-MX")} MXN` : "Por cotizar en sitio"}`;
      if (cita.metodo_pago) texto += ` (${cita.metodo_pago})`;
      texto += `\n\n`;
    });

    texto += `Buen turno y a dejar todo impecable ✨`;
    navigator.clipboard.writeText(texto);
    setCopiadoRuta(true);
    setTimeout(() => setCopiadoRuta(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. BANDA DE ALERTAS DE ACCIÓN RÁPIDA (Estilo Linear / Apple banner) */}
      {citasPorConfirmar.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h4 className="font-heading font-bold text-amber-950 text-sm">
                  {citasPorConfirmar.length} {citasPorConfirmar.length === 1 ? "cita requiere confirmación" : "citas requieren confirmación"}
                </h4>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Verifica disponibilidad y asegura el turno del técnico para hoy o mañana en ZMG.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToCalendar("Por Confirmar")}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-heading font-bold rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm shadow-amber-600/20"
          >
            <span>Revisar Citas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. BENTO BOX KPIS (Apple / Linear Aesthetic Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Bento 1: Ganancias Totales */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Ganancias
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1D71B5] to-[#36A6DE] text-white flex items-center justify-center shadow-md shadow-[#1D71B5]/25 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${totalGanancias.toLocaleString("es-MX")}
            </p>
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                MXN Total
              </span>
              {comparativaMes.mesAnterior > 0 && (
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                  comparativaMes.porcentaje >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {comparativaMes.porcentaje >= 0 ? `+${comparativaMes.porcentaje}%` : `${comparativaMes.porcentaje}%`} vs mes anterior
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bento 2: Agenda de Hoy */}
        <div 
          onClick={() => onNavigateToCalendar(null)}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-blue-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Agenda de Hoy
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-[#36A6DE]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {citasHoy.length}
              </p>
              <span className="text-xs text-slate-400 font-medium">/ 2 slots máx</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                citasHoy.length >= 2 
                  ? "bg-rose-50 text-rose-700 border-rose-200" 
                  : citasHoy.length === 1 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {citasHoy.length >= 2 ? "Ruta Completa" : citasHoy.length === 1 ? "1 turno ocupado" : "Día disponible"}
              </span>
            </div>
          </div>
        </div>

        {/* Bento 3: Ticket Promedio */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${ticketPromedio.toLocaleString("es-MX")}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/70">
                Promedio por servicio
              </span>
            </div>
          </div>
        </div>

        {/* Bento 4: Clientes Registrados */}
        <div 
          onClick={() => {}}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Clientes Activos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {clientes.length}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                Base única en ZMG
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BLOQUE CENTRAL: MAPA DE JALISCO + AGENDA DE HOY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo (7 cols): Mapa interactivo de Jalisco */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D71B5] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Cobertura Activa en Jalisco (ZMG)
                </h3>
                <p className="text-xs text-slate-500">Distribución de servicios y domicilios en el mapa metropolitano</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#F4F7F9] px-3 py-1.5 rounded-full text-[#1D71B5] border border-slate-200">
              {citasActivas.length} citas
            </span>
          </div>

          <JaliscoServiceMap
            citas={citasActivas}
            clientes={clientes}
            onSelectCitaForCalendar={onNavigateToCalendar}
          />
        </div>

        {/* Lado Derecho (5 cols): Ruta de Hoy */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#36A6DE] flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    Ruta de Hoy
                  </h3>
                  <p className="text-xs text-slate-500">{new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}</p>
                </div>
              </div>

              {citasHoy.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copiarRutaWhatsApp}
                    title="Copiar ruta resumida para WhatsApp"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 text-xs font-bold"
                  >
                    {copiadoRuta ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowHojaRutaModal(true)}
                    title="Ver e Imprimir Hoja de Ruta"
                    className="p-2 rounded-xl bg-[#1D71B5] hover:bg-[#175c94] text-white transition flex items-center gap-1 text-xs font-bold"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Listado de paradas de hoy */}
            <div className="space-y-3">
              {citasHoy.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="font-heading font-bold text-sm text-slate-700">
                    No hay servicios programados para hoy
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Puedes agendar una nueva cita o revisar las pendientes de confirmación.
                  </p>
                  <button
                    onClick={() => onNavigateToCalendar(null)}
                    className="text-xs font-bold text-[#1D71B5] hover:underline pt-2 inline-block"
                  >
                    Ir al Calendario →
                  </button>
                </div>
              ) : (
                citasHoy.map((cita, idx) => {
                  const cliente = clientes.find((c) => c.id === cita.cliente_id);
                  const isMatutino = cita.turno.includes("Matutino");

                  return (
                    <div
                      key={cita.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#36A6DE]/60 hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isMatutino 
                            ? "bg-amber-100/80 text-amber-900 border border-amber-200/60" 
                            : "bg-blue-100/80 text-blue-900 border border-blue-200/60"
                        }`}>
                          Parada {idx + 1} • {isMatutino ? "Mañana (9:00 - 13:00)" : "Tarde (14:00 - 18:00)"}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          cita.estatus === "Completada"
                            ? "bg-emerald-100 text-emerald-800"
                            : cita.estatus === "En Ruta"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : "bg-slate-200 text-slate-700"
                        }`}>
                          {cita.estatus}
                        </span>
                      </div>

                      <div>
                        <p className="font-heading font-bold text-sm text-slate-900">
                          {cliente?.nombre || "Cliente sin registrar"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#36A6DE] shrink-0" />
                          <span className="truncate">{cliente?.direccion || "Sin dirección"}, {cliente?.municipio}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate max-w-[180px]">
                          {cita.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ") || "Limpieza General"}
                        </span>
                        <strong className="font-bold text-slate-900">
                          {cita.monto_total ? `$${cita.monto_total.toLocaleString("es-MX")} MXN` : "Por cotizar"}
                        </strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {citasHoy.length} {citasHoy.length === 1 ? "parada hoy" : "paradas hoy"}
            </span>
            <button
              onClick={() => onNavigateToCalendar(null)}
              className="text-xs font-bold text-[#1D71B5] hover:underline flex items-center gap-1"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BLOQUE INFERIOR: DEMANDA POR MUNICIPIO & TOP SERVICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Demanda por Municipio */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                Demanda por Zona (ZMG)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Total servicios</span>
          </div>

          <div className="space-y-3">
            {distribucionMunicipios.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aún no hay servicios registrados en la base de datos.</p>
            ) : (
              distribucionMunicipios.slice(0, 5).map(([municipio, count]) => {
                const pct = citasActivas.length > 0 ? Math.round((count / citasActivas.length) * 100) : 0;
                return (
                  <div key={municipio} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{municipio}</span>
                      <span className="text-slate-500">{count} servicios ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Piezas y Servicios Más Solicitados */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sofa className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                Servicios Más Solicitados
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Piezas totales</span>
          </div>

          <div className="space-y-3">
            {topServiciosSolicitados.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aún no hay detalles de piezas contratadas.</p>
            ) : (
              topServiciosSolicitados.map((item) => (
                <div key={item.nombre} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold truncate max-w-[200px]">{item.nombre}</span>
                    <span className="text-slate-500">{item.cantidad} u. ({item.porcentaje}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL HOJA DE RUTA IMPRIMIBLE */}
      {showHojaRutaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  Hoja de Ruta del Técnico
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setShowHojaRutaModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {citasHoy.map((cita, idx) => {
                const cli = clientes.find((c) => c.id === cita.cliente_id);
                return (
                  <div key={cita.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        PARADA {idx + 1} • {cita.turno}
                      </span>
                      <strong className="text-sm font-extrabold text-slate-900">
                        {cita.monto_total ? `$${cita.monto_total.toLocaleString("es-MX")} MXN` : "Por cotizar"}
                      </strong>
                    </div>

                    <div className="text-xs space-y-1">
                      <p><strong>Cliente:</strong> {cli?.nombre || "Sin nombre"}</p>
                      <p><strong>WhatsApp:</strong> {cli?.whatsapp || "N/D"}</p>
                      <p><strong>Dirección:</strong> {cli?.direccion || "N/D"}, {cli?.municipio || ""}</p>
                      {cita.instrucciones_acceso && (
                        <p className="text-amber-800"><strong>Acceso:</strong> {cita.instrucciones_acceso}</p>
                      )}
                      <p><strong>Items:</strong> {cita.items_contratados.map((it) => `${it.cantidad}x ${it.piezaNombre}`).join(", ")}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hoja</span>
              </button>
              <button
                onClick={() => setShowHojaRutaModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
