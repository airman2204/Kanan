"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Kanban,
  Users,
  Repeat,
  MessageSquareShare,
  ArrowLeft,
  Trash2,
  RotateCcw,
  PawPrint,
  MapPin,
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  DollarSign,
  FileText,
  Sparkles,
} from "lucide-react";
import { KananLogo } from "@/components/brand/KananLogo";
import {
  KananDatabase,
  ServicioCita,
  Cliente,
  EstatusCita,
  EstatusRecurrencia,
} from "@/types/crm";

const ESTATUS_COLUMNS: EstatusCita[] = [
  "Por Confirmar",
  "Confirmada",
  "En Ruta",
  "En Proceso",
  "Completada",
];

const TECNICOS_ZMG = [
  "Por asignar",
  "Ing. Roberto Márquez (Unidad 01)",
  "Téc. Alejandro Silva (Unidad 02)",
  "Téc. Daniel Orozco (Unidad 03)",
];

export default function AdminCRMPage() {
  const [db, setDb] = useState<KananDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "despacho" | "clientes360" | "recurrencia" | "whatsapp"
  >("despacho");
  const [selectedMunicipioFilter, setSelectedMunicipioFilter] = useState<string>("Todos");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const fetchCrmData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm");
      const data = (await res.json()) as KananDatabase;
      setDb(data);
      if (data.clientes.length > 0 && !selectedClienteId) {
        setSelectedClienteId(data.clientes[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedClienteId]);

  useEffect(() => {
    fetchCrmData();
  }, [fetchCrmData]);

  const showNotice = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const handleClearAllExamples = async () => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CLEAR_ALL" }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      setSelectedClienteId(null);
      showNotice("🗑️ Todos los ejemplos han sido borrados. El CRM está completamente limpio.");
    }
  };

  const handleRestoreTwoExamples = async () => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESET_DEMO_2" }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      if (data.db.clientes.length > 0) {
        setSelectedClienteId(data.db.clientes[0].id);
      }
      showNotice("✅ Se han restaurado los 2 ejemplos de demostración.");
    }
  };

  const handleToggleHalloween = async (enabled: boolean) => {
    const res = await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TOGGLE_HALLOWEEN", enabled }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      showNotice(
        enabled
          ? "🎃 Modo Halloween activado en la página pública (Murciélagos y Papel Picado visibles)."
          : "🍂 Modo Halloween desactivado (Diseño original limpio restablecido)."
      );
    }
  };

  const handleUpdateCita = async (
    citaId: string,
    updates: {
      estatus?: EstatusCita;
      tecnico_asignado?: string;
      monto_total?: number | null;
      calificacion?: number | null;
    }
  ) => {
    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "UPDATE_CITA",
        citaId,
        ...updates,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      showNotice(`Cita ${citaId} actualizada correctamente.`);
    }
  };

  const handleUpdateRecurrencia = async (
    recurrenciaId: string,
    estatus_contacto: EstatusRecurrencia
  ) => {
    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "UPDATE_RECURRENCIA",
        recurrenciaId,
        estatus_contacto,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      showNotice("Estatus de recurrencia actualizado.");
    }
  };

  const handleTriggerWhatsApp = async (mensajeId: string) => {
    const res = await fetch("/api/webhooks/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "TRIGGER_MESSAGE", mensajeId }),
    });
    const data = await res.json();
    if (data.ok) {
      setDb(data.db);
      window.open(data.waLink, "_blank", "noopener,noreferrer");
    }
  };

  const clientes = db?.clientes || [];
  const citas = db?.servicios_citas || [];
  const recurrencias = db?.recurrencia || [];
  const mensajes = db?.mensajes_automatizacion || [];

  const getClienteById = (id: string): Cliente | undefined =>
    clientes.find((c) => c.id === id);

  const citasFiltradas =
    selectedMunicipioFilter === "Todos"
      ? citas
      : citas.filter((c) => {
          const cli = getClienteById(c.cliente_id);
          return cli?.municipio === selectedMunicipioFilter;
        });

  const activeCliente360 =
    clientes.find((c) => c.id === selectedClienteId) || clientes[0] || null;

  return (
    <div className="min-h-screen bg-kanan-ice flex flex-col">
      {/* Header Corporativo del CRM */}
      <header className="bg-kanan-deep text-white border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KananLogo variant="white" />
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-kanan-cyan/20 text-kanan-cyan font-heading font-bold text-xs border border-kanan-cyan/30">
              CRM Operativo &amp; Automatización ZMG
            </span>
          </div>

          {/* Botones de Acción Rápida: Switch Halloween / Volver a Web / Limpiar ejemplos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Switch Selector Modo Halloween */}
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/15 transition-colors">
              <span className="text-xs font-heading font-bold flex items-center gap-1 text-orange-400">
                <span>🎃</span>
                <span className="hidden sm:inline">Modo Halloween</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={db?.config?.modo_halloween ?? true}
                onClick={() => handleToggleHalloween(!(db?.config?.modo_halloween ?? true))}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (db?.config?.modo_halloween ?? true) ? "bg-orange-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    (db?.config?.modo_halloween ?? true) ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {(db?.config?.modo_halloween ?? true) ? "ON" : "OFF"}
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-kanan-cyan" />
              <span>Ver Sitio</span>
            </Link>

            {clientes.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAllExamples}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white text-xs font-heading font-bold shadow transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Ejemplos (Dejar en Blanco)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestoreTwoExamples}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-kanan-cyan hover:bg-[#009ec0] text-white text-xs font-heading font-bold shadow transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cargar 2 Ejemplos Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Navegación del CRM (Adaptada a Móviles con scroll horizontal) */}
        <div className="bg-kanan-navy border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
            {[
              {
                id: "despacho",
                label: `1. Calendario & Despacho Kanban (${citas.length})`,
                icon: Kanban,
              },
              {
                id: "clientes360",
                label: `2. Ficha 360° del Cliente (${clientes.length})`,
                icon: Users,
              },
              {
                id: "recurrencia",
                label: `3. Recurrencia 3/6/12m (${recurrencias.length})`,
                icon: Repeat,
              },
              {
                id: "whatsapp",
                label: `4. Secuencia WhatsApp API (${mensajes.length})`,
                icon: MessageSquareShare,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id as "despacho" | "clientes360" | "recurrencia" | "whatsapp"
                    )
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-kanan-cyan text-white shadow-sm"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Contenido Principal del CRM */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {bannerMsg && (
          <div className="bg-kanan-deep text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm border border-kanan-cyan/40">
            <span>{bannerMsg}</span>
            <button
              type="button"
              onClick={() => setBannerMsg(null)}
              className="text-kanan-cyan font-bold ml-4"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* KPIs Superiores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Servicios Activos / Totales
            </span>
            <p className="font-heading text-2xl font-extrabold text-kanan-deep mt-1">
              {citas.length}
            </p>
            <p className="text-xs text-kanan-cerulean mt-0.5">
              {citas.filter((c) => c.estatus === "Completada").length} completados
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clientes en Base ZMG
            </span>
            <p className="font-heading text-2xl font-extrabold text-kanan-deep mt-1">
              {clientes.length}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {clientes.filter((c) => c.mascotas).length} hogares Pet-Friendly 🐾
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Facturación Registrada
            </span>
            <p className="font-heading text-2xl font-extrabold text-kanan-deep mt-1">
              $
              {clientes
                .reduce((acc, c) => acc + (c.historico_gasto || 0), 0)
                .toLocaleString("es-MX")}{" "}
              <span className="text-xs font-normal text-slate-500">MXN</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Histórico acumulado</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Automatización WhatsApp
            </span>
            <p className="font-heading text-2xl font-extrabold text-kanan-deep mt-1">
              {mensajes.length}
            </p>
            <p className="text-xs text-kanan-cyan font-semibold mt-0.5">
              {mensajes.filter((m) => m.estatus_envio === "Enviado").length} enviados /{" "}
              {mensajes.filter((m) => m.estatus_envio === "Programado").length} en cola
            </p>
          </div>
        </div>

        {/* Estado vacío cuando se borran los ejemplos */}
        {!loading && citas.length === 0 && clientes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-kanan-ice text-kanan-cerulean flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-kanan-deep">
              El CRM está limpio y listo para producción
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Se han eliminado los datos de prueba. Cualquier cita nueva que se agende desde el
              Wizard de 4 pasos en la página web aparecerá aquí en tiempo real, o puedes volver a
              cargar los 2 ejemplos de demostración.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link
                href="/#agendar"
                className="px-5 py-3 rounded-xl bg-kanan-cyan text-white font-heading font-bold text-xs sm:text-sm"
              >
                Probar Agendar Cita en la Web
              </Link>
              <button
                type="button"
                onClick={handleRestoreTwoExamples}
                className="px-5 py-3 rounded-xl bg-kanan-ice text-kanan-deep font-heading font-bold text-xs sm:text-sm border border-slate-200"
              >
                Restaurar los 2 Ejemplos de Demostración
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PESTAÑA 1: VISTA CALENDARIO / DESPACHO KANBAN */}
            {activeTab === "despacho" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-extrabold text-base sm:text-lg text-kanan-deep">
                      Vista Calendario y Despacho Kanban por Rutas ZMG
                    </h2>
                    <p className="text-xs text-slate-500">
                      Asigna técnico, define el monto cotizado, actualiza el estatus o registra la
                      calificación poservicio (1-5 ★).
                    </p>
                  </div>

                  {/* Filtro por Ruta Geográfica / Municipio */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {["Todos", "Guadalajara", "Zapopan", "Tlajomulco", "Tlaquepaque"].map(
                      (mun) => (
                        <button
                          key={mun}
                          type="button"
                          onClick={() => setSelectedMunicipioFilter(mun)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap ${
                            selectedMunicipioFilter === mun
                              ? "bg-kanan-navy text-white"
                              : "bg-kanan-ice text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {mun}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Columnas Kanban (Responsivas: Grid en Desktop, Stack/Scroll en Móvil) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  {ESTATUS_COLUMNS.map((colStatus) => {
                    const colCitas = citasFiltradas.filter((c) => c.estatus === colStatus);
                    return (
                      <div
                        key={colStatus}
                        className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/90 flex flex-col space-y-3"
                      >
                        <div className="flex items-center justify-between px-1">
                          <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-kanan-deep">
                            {colStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-kanan-navy font-bold text-xs border border-slate-200">
                            {colCitas.length}
                          </span>
                        </div>

                        {colCitas.length === 0 ? (
                          <div className="bg-white/60 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                            Sin citas en esta etapa
                          </div>
                        ) : (
                          colCitas.map((cita: ServicioCita) => {
                            const cli = getClienteById(cita.cliente_id);
                            return (
                              <div
                                key={cita.id}
                                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-heading font-extrabold text-xs text-kanan-cerulean bg-kanan-ice px-2.5 py-1 rounded-lg">
                                    {cita.id}
                                  </span>
                                  {cli?.mascotas && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      <PawPrint className="w-3 h-3" />
                                      Pet-Friendly
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (cli) {
                                        setSelectedClienteId(cli.id);
                                        setActiveTab("clientes360");
                                      }
                                    }}
                                    className="font-heading font-bold text-sm text-kanan-deep hover:text-kanan-cerulean text-left"
                                  >
                                    {cli?.nombre || "Cliente"}
                                  </button>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-kanan-cyan shrink-0" />
                                    <span>{cita.ruta_geografica}</span>
                                  </p>
                                </div>

                                <div className="bg-kanan-ice rounded-xl p-2.5 text-[11px] space-y-1 text-kanan-deep">
                                  <p className="font-semibold flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-kanan-cerulean" />
                                    {cita.fecha}
                                  </p>
                                  <p className="text-slate-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-kanan-cerulean" />
                                    {cita.turno}
                                  </p>
                                  <div className="pt-1 border-t border-slate-200/80">
                                    {cita.items_contratados.map((it, idx) => (
                                      <p key={idx} className="truncate">
                                        • <strong>{it.cantidad}x</strong> {it.piezaNombre}
                                      </p>
                                    ))}
                                  </div>
                                </div>

                                {/* Selector de Técnico Asignado */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    Técnico Asignado:
                                  </label>
                                  <select
                                    aria-label={`Asignar técnico a ${cita.id}`}
                                    value={cita.tecnico_asignado}
                                    onChange={(e) =>
                                      handleUpdateCita(cita.id, {
                                        tecnico_asignado: e.target.value,
                                      })
                                    }
                                    className="w-full text-xs rounded-lg border border-slate-200 bg-kanan-ice px-2 py-1.5 font-medium text-kanan-deep"
                                  >
                                    {TECNICOS_ZMG.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Monto Cotizado en CRM */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Monto Cotizado (MXN):
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Sin cotizar aún"
                                    defaultValue={cita.monto_total ?? ""}
                                    onBlur={(e) => {
                                      const val =
                                        e.target.value === "" ? null : Number(e.target.value);
                                      if (val !== cita.monto_total) {
                                        handleUpdateCita(cita.id, { monto_total: val });
                                      }
                                    }}
                                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-kanan-deep"
                                  />
                                </div>

                                {/* Cambio de Estatus Kanban */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase text-slate-400">
                                    Mover a Etapa:
                                  </label>
                                  <select
                                    aria-label={`Cambiar estatus de ${cita.id}`}
                                    value={cita.estatus}
                                    onChange={(e) =>
                                      handleUpdateCita(cita.id, {
                                        estatus: e.target.value as EstatusCita,
                                      })
                                    }
                                    className="w-full text-xs rounded-lg border border-kanan-cerulean/40 bg-white px-2 py-1.5 font-bold text-kanan-navy"
                                  >
                                    {ESTATUS_COLUMNS.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Calificación Poservicio (Dispara 5★ Google Maps o <4★ Alerta Soporte) */}
                                <div className="pt-2 border-t border-slate-100">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                    Encuesta Poservicio (+3h):
                                  </span>
                                  <div className="flex items-center justify-between gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                          handleUpdateCita(cita.id, { calificacion: star })
                                        }
                                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-0.5 ${
                                          cita.calificacion === star
                                            ? star === 5
                                              ? "bg-amber-400 text-kanan-deep border-amber-500"
                                              : star < 4
                                              ? "bg-red-600 text-white border-red-600"
                                              : "bg-kanan-navy text-white border-kanan-navy"
                                            : "bg-kanan-ice text-slate-600 border-slate-200 hover:bg-slate-200"
                                        }`}
                                      >
                                        <span>{star}</span>
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                  {cita.ticket_soporte && (
                                    <div className="mt-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-[11px] font-semibold flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Alerta a Soporte activa (&lt;4★)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: FICHA 360° DEL CLIENTE */}
            {activeTab === "clientes360" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lista lateral de clientes */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3 self-start">
                  <h2 className="font-heading font-extrabold text-base text-kanan-deep">
                    Directorio de Clientes ({clientes.length})
                  </h2>
                  <div className="space-y-2">
                    {clientes.map((c) => {
                      const active = activeCliente360?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedClienteId(c.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                            active
                              ? "bg-kanan-navy text-white border-kanan-navy shadow-sm"
                              : "bg-kanan-ice text-kanan-deep border-slate-200 hover:bg-slate-200/70"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-sm truncate">{c.nombre}</p>
                            <p
                              className={`text-xs truncate ${
                                active ? "text-kanan-cyan" : "text-slate-500"
                              }`}
                            >
                              📍 {c.municipio} • 📱 {c.whatsapp}
                            </p>
                          </div>
                          {c.mascotas && (
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs shrink-0">
                              🐾
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detalle 360° del Cliente Seleccionado */}
                <div className="lg:col-span-8 space-y-6">
                  {activeCliente360 && (
                    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-kanan-ice text-kanan-cerulean font-heading font-bold text-xs">
                              Ficha 360° del Cliente
                            </span>
                            {activeCliente360.mascotas ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                                <PawPrint className="w-3.5 h-3.5" />
                                Hogar con Mascotas (Sí)
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                                Mascotas: No
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading text-2xl font-extrabold text-kanan-deep mt-2">
                            {activeCliente360.nombre}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            📍 {activeCliente360.direccion}, <strong>{activeCliente360.municipio}</strong>{" "}
                            • WhatsApp: <strong>{activeCliente360.whatsapp}</strong>
                          </p>
                        </div>

                        <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 text-left sm:text-right shrink-0">
                          <span className="text-[11px] font-bold uppercase text-slate-400">
                            Histórico de Gasto
                          </span>
                          <p className="font-heading text-2xl font-extrabold text-kanan-navy">
                            ${activeCliente360.historico_gasto.toLocaleString("es-MX")} MXN
                          </p>
                        </div>
                      </div>

                      {/* Notas Especiales (Manchas difíciles, mascotas, etc.) */}
                      <div className="bg-kanan-ice rounded-2xl p-4 border border-slate-200 space-y-1.5">
                        <span className="text-xs font-heading font-bold text-kanan-deep flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-kanan-cyan" />
                          Notas Especiales de Operación (Manchas difíciles / Mascotas):
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {activeCliente360.notas_especiales ||
                            "Sin notas especiales registradas."}
                        </p>
                      </div>

                      {/* Historial de Servicios y Fotos Antes/Después */}
                      <div className="space-y-3">
                        <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-400">
                          Historial de Servicios Recibidos
                        </h4>
                        {citas
                          .filter((c) => c.cliente_id === activeCliente360.id)
                          .map((cita) => (
                            <div
                              key={cita.id}
                              className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-extrabold text-xs bg-kanan-navy text-white px-2.5 py-1 rounded-lg">
                                    {cita.id}
                                  </span>
                                  <span className="text-xs font-semibold text-kanan-deep">
                                    {cita.fecha} — {cita.turno}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-kanan-cerulean">
                                  Estatus: {cita.estatus}
                                </span>
                              </div>

                              <div className="text-xs text-slate-600 space-y-1">
                                <p>
                                  <strong>Piezas:</strong>{" "}
                                  {cita.items_contratados
                                    .map((i) => `${i.cantidad}x ${i.piezaNombre}`)
                                    .join(", ")}
                                </p>
                                <p>
                                  <strong>Técnico:</strong> {cita.tecnico_asignado} •{" "}
                                  <strong>Monto:</strong>{" "}
                                  {cita.monto_total
                                    ? `$${cita.monto_total.toLocaleString("es-MX")} MXN`
                                    : "Por cotizar"}
                                </p>
                              </div>

                              {cita.fotos_antes_despues.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                  <div className="rounded-xl overflow-hidden border border-slate-200">
                                    <span className="block bg-slate-800 text-white text-[10px] font-bold px-2 py-1">
                                      Evidencia ANTES
                                    </span>
                                    <img
                                      src={cita.fotos_antes_despues[0].antesUrl}
                                      alt="Antes"
                                      className="h-32 w-full object-cover"
                                    />
                                  </div>
                                  <div className="rounded-xl overflow-hidden border border-slate-200">
                                    <span className="block bg-kanan-cyan text-white text-[10px] font-bold px-2 py-1">
                                      Evidencia DESPUÉS
                                    </span>
                                    <img
                                      src={cita.fotos_antes_despues[0].despuesUrl}
                                      alt="Después"
                                      className="h-32 w-full object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: TABLA RECURRENCIA (3 / 6 / 12 MESES) */}
            {activeTab === "recurrencia" && (
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-kanan-deep">
                    Tabla de Recurrencia y Mantenimiento Preventivo (3, 6 y 12 Meses)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Relación 1 a 1 con cada servicio para impulsar la recompra trimestral (hogares
                    con mascotas) y semestral (descuento de reactivación).
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-kanan-ice text-kanan-navy font-heading font-bold">
                        <th className="p-3.5 rounded-tl-xl">Cliente / Folio</th>
                        <th className="p-3.5">Último Servicio</th>
                        <th className="p-3.5">Disparador</th>
                        <th className="p-3.5">Próximo Contacto</th>
                        <th className="p-3.5 rounded-tr-xl">Estatus de Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recurrencias.map((rec) => {
                        const cli = getClienteById(rec.cliente_id);
                        return (
                          <tr key={rec.id} className="hover:bg-kanan-ice/40">
                            <td className="p-3.5">
                              <p className="font-heading font-bold text-kanan-deep">
                                {cli?.nombre || "Cliente"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Folio: {rec.cita_id} • {cli?.municipio}
                              </p>
                            </td>
                            <td className="p-3.5 font-medium">{rec.ultimo_servicio}</td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  rec.disparador.includes("Mascotas")
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-kanan-cyan/15 text-kanan-cerulean"
                                }`}
                              >
                                {rec.disparador}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-kanan-navy">
                              {rec.proxima_fecha_contacto}
                            </td>
                            <td className="p-3.5">
                              <select
                                aria-label="Cambiar estatus de recurrencia"
                                value={rec.estatus_contacto}
                                onChange={(e) =>
                                  handleUpdateRecurrencia(
                                    rec.id,
                                    e.target.value as EstatusRecurrencia
                                  )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-kanan-deep"
                              >
                                <option value="Programado">Programado</option>
                                <option value="Mensaje Enviado">Mensaje Enviado</option>
                                <option value="Reactivado">Reactivado ✓</option>
                                <option value="Pospuesto">Pospuesto</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: AUTOMATIZACIÓN Y SECUENCIA POSERVICIO (WHATSAPP API) */}
            {activeTab === "whatsapp" && (
              <div className="space-y-6">
                <div className="bg-kanan-deep text-white rounded-3xl p-5 sm:p-7 border border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-kanan-cyan">
                        Integración Make / Meta Cloud API
                      </span>
                      <h2 className="font-heading text-lg sm:text-2xl font-extrabold mt-1">
                        Secuencia Poservicio Automatizada de WhatsApp
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        1. Inmediato → 2. Recordatorio (-24h) → 3. Encuesta (+3h: 5★ a Google Maps /
                        &lt;4★ Alerta Soporte) → 4. Guía Derrames (+24h) → 5. Mes 3 (Mascotas) → 6.
                        Mes 6 (Reactivación).
                      </p>
                    </div>
                    <img
                      src="/assets/brand/kanan-dog.png"
                      alt="Kanan Dog"
                      className="w-16 h-16 object-contain bg-white rounded-2xl p-1 shrink-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mensajes.map((msg) => {
                    const cli = getClienteById(msg.cliente_id);
                    return (
                      <div
                        key={msg.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-heading font-extrabold text-kanan-cerulean">
                              {msg.etapa_titulo}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                msg.estatus_envio === "Enviado"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : msg.estatus_envio === "Alerta Soporte"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {msg.estatus_envio === "Enviado" ? (
                                <span className="inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Enviado
                                </span>
                              ) : (
                                msg.estatus_envio
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500">
                            Cliente: <strong>{cli?.nombre}</strong> ({msg.destinatario_whatsapp}) •
                            Folio: <strong>{msg.cita_id}</strong>
                          </p>

                          <pre className="whitespace-pre-wrap font-body text-xs bg-kanan-ice p-3.5 rounded-xl border border-slate-200 text-kanan-deep leading-relaxed">
                            {msg.contenido_mensaje}
                          </pre>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleTriggerWhatsApp(msg.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white font-heading font-bold text-xs shadow-sm transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Probar / Enviar por WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
