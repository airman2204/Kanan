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
  ShieldCheck
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

  // Comparativa Mes Actual vs Mes Anterior (Opción 2)
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

  // 5. TOP PIEZAS / SERVICIOS MÁS SOLICITADOS (Opción 4)
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

      {/* 2. FILA DE TARJETAS DE ALTO NIVEL (KPIS REALES CON COMPARATIVA DE MES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Ganancias Totales con Comparativa vs Mes Anterior */}
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
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                MXN Cobrado
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
              <div className="flex items-center gap-2">
                {citasHoy.length > 0 && (
                  <button
                    onClick={() => setShowHojaRutaModal(true)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1D71B5] text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-blue-200/80"
                    title="Ver hoja de ruta para imprimir o enviar"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Hoja de Ruta</span>
                  </button>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                </span>
              </div>
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

      {/* 4. FILA INFERIOR: DEMANDA POR ZONAS + TOP SERVICIOS MÁS SOLICITADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Módulo A: Top Muebles / Servicios Más Solicitados (Opción 4) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sofa className="w-5 h-5 text-[#1D71B5]" />
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                Top Servicios Más Solicitados
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Por volumen de piezas</span>
          </div>

          {topServiciosSolicitados.length > 0 ? (
            <div className="space-y-3 pt-1">
              {topServiciosSolicitados.map((srv, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-slate-100 text-[#1D71B5] flex items-center justify-center font-mono font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      {srv.nombre}
                    </span>
                    <span className="font-bold text-slate-800">
                      {srv.cantidad} <span className="text-slate-400 font-normal">({srv.porcentaje}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1D71B5] to-[#36A6DE] h-1.5 rounded-full"
                      style={{ width: `${srv.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Aún no hay servicios registrados en la base de datos.
            </div>
          )}
        </div>

        {/* Módulo B: Distribución Dinámica por Zonas / Municipios */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                Demanda por Municipio y Zona
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {distribucionMunicipios.length} {distribucionMunicipios.length === 1 ? "zona" : "zonas"}
            </span>
          </div>

          {distribucionMunicipios.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {distribucionMunicipios.map(([muni, count]) => {
                const pct = citasActivas.length > 0 ? Math.round((count / citasActivas.length) * 100) : 0;
                return (
                  <div key={muni} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate mr-2" title={muni}>{muni}</span>
                      <span className="font-semibold text-slate-400 shrink-0">{pct}%</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {count} <span className="text-[11px] font-normal text-slate-500">servicios</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#1D71B5] h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Las zonas aparecerán conforme se registren servicios con su código postal.
            </div>
          )}
        </div>
      </div>

      {/* MODAL HOJA DE RUTA DEL DÍA (OPTIMIZADO PARA 1 TÉCNICO EN CALLE / IMPRESIÓN / WHATSAPP) */}
      {showHojaRutaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative my-8 print:p-0 print:border-none print:shadow-none print:max-w-none">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:border-b-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl text-[#355581] tracking-tight">KANAN</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1D71B5] border border-blue-200">
                    Hoja de Ruta de Campo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={copiarRutaWhatsApp}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
                >
                  {copiadoRuta ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiadoRuta ? "¡Copiado!" : "Copiar para WhatsApp"}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setShowHojaRutaModal(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resumen Superior */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Técnico Operativo</p>
                <p className="text-xs font-extrabold text-slate-800">1 Unidad Móvil Kanan</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Paradas</p>
                <p className="text-xs font-extrabold text-[#1D71B5]">{citasHoy.length} asignadas</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Monto Estimado</p>
                <p className="text-xs font-extrabold text-emerald-600">
                  ${citasHoy.reduce((acc, c) => acc + (c.monto_total || 0), 0).toLocaleString("es-MX")} MXN
                </p>
              </div>
            </div>

            {/* Listado de Paradas de la Ruta */}
            <div className="space-y-4">
              {citasHoy.map((cita, idx) => {
                const cli = clientes.find((c) => c.id === cita.cliente_id);
                return (
                  <div
                    key={cita.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white space-y-3 shadow-sm break-inside-avoid"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#355581] text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-900">
                          {cita.turno}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cita.estatus === "Completada" ? "bg-emerald-50 text-emerald-700" :
                        cita.estatus === "Confirmada" ? "bg-blue-50 text-blue-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {cita.estatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Cliente y Contacto</p>
                        <p className="font-bold text-slate-900">{cli?.nombre || "Sin nombre"}</p>
                        <p className="text-slate-600 font-mono flex items-center gap-1">
                          📞 {cli?.whatsapp || "N/D"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Dirección y Zona</p>
                        <p className="font-semibold text-slate-800">
                          📍 {cli?.direccion || "N/D"}
                        </p>
                        <p className="text-slate-500">
                          {cli?.municipio} {cli?.codigo_postal ? `· CP ${cli.codigo_postal}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Especificaciones de coto y acceso */}
                    {cita.instrucciones_acceso && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Acceso / Coto / Vigilancia:</span> {cita.instrucciones_acceso}
                        </div>
                      </div>
                    )}

                    {/* Piezas y Servicios */}
                    <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Servicios Contratados</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cita.items_contratados.map((it, itIdx) => (
                          <span key={itIdx} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium text-slate-800">
                            {it.cantidad}x {it.piezaNombre}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-500">
                        {cita.tipo_tela && <span>🧵 <strong className="text-slate-700">Tela:</strong> {cita.tipo_tela}</span>}
                        {cita.cuenta_con_agua_y_luz !== undefined && (
                          <span>⚡ <strong className="text-slate-700">Agua/Luz:</strong> {cita.cuenta_con_agua_y_luz ? "Sí" : "No"}</span>
                        )}
                        <span>💰 <strong className="text-slate-700">Cobro:</strong> {cita.monto_total ? `$${cita.monto_total.toLocaleString("es-MX")} MXN` : "Por cotizar"} {cita.metodo_pago ? `(${cita.metodo_pago})` : ""}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              Kanan Limpieza Especializada · Hoja de ruta para el personal de campo · Guía operativa ZMG
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
