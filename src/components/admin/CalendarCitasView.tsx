"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  DollarSign,
  X,
} from "lucide-react";
import { ServicioCita, Cliente, EstatusCita, TurnoServicio, MunicipioZMG } from "@/types/crm";

interface CalendarViewProps {
  citas: ServicioCita[];
  clientes: Cliente[];
  highlightStatus?: string | null;
  onClearHighlight?: () => void;
  onUpdateCita: (
    citaId: string,
    updates: {
      estatus?: EstatusCita;
      tecnico_asignado?: string;
      monto_total?: number | null;
      fecha?: string;
      turno?: TurnoServicio;
    }
  ) => Promise<void>;
  onCancelCita: (citaId: string, motivo?: string) => Promise<void>;
  onCreateCitaManual: (cita: {
    cliente_id?: string;
    cliente_data?: {
      nombre: string;
      whatsapp: string;
      direccion: string;
      municipio: MunicipioZMG;
      mascotas: boolean;
      notas_especiales?: string;
      email?: string;
    };
    fecha: string;
    turno: TurnoServicio;
    hora_especifica?: string;
    items_contratados: {
      categoriaId: string;
      categoriaNombre: string;
      piezaId: string;
      piezaNombre: string;
      cantidad: number;
    }[];
    monto_total?: number | null;
    tecnico_asignado?: string;
    notas_servicio?: string;
  }) => Promise<void>;
}

const ESTATUS_COLUMNS: EstatusCita[] = [
  "Por Confirmar",
  "Confirmada",
  "En Ruta",
  "En Proceso",
  "Completada",
  "Cancelada",
];

const TECNICOS_ZMG = [
  "Por asignar",
  "Ing. Roberto Márquez (Unidad 01)",
  "Téc. Alejandro Silva (Unidad 02)",
  "Téc. Daniel Orozco (Unidad 03)",
];

const MUNICIPIOS: MunicipioZMG[] = ["Guadalajara", "Zapopan", "Tlajomulco", "Tlaquepaque"];

export function CalendarCitasView({
  citas,
  clientes,
  highlightStatus,
  onClearHighlight,
  onUpdateCita,
  onCancelCita,
  onCreateCitaManual,
}: CalendarViewProps) {
  // Modo de vista: "dia" o "kanban"
  const [viewMode, setViewMode] = useState<"dia" | "kanban">("dia");

  // Fecha seleccionada para la vista por día (por defecto: hoy en formato YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Modal Nueva Cita
  const [showNewModal, setShowNewModal] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Datos para cliente nuevo si no existe
  const [newNombre, setNewNombre] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newMunicipio, setNewMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [newMascotas, setNewMascotas] = useState(false);

  // Datos de la cita
  const [newFecha, setNewFecha] = useState(new Date().toISOString().split("T")[0]);
  const [newTurno, setNewTurno] = useState<TurnoServicio>("Matutino (09:00 - 13:00)");
  const [newHora, setNewHora] = useState("10:00 AM");
  const [newTecnico, setNewTecnico] = useState("Por asignar");
  const [newMonto, setNewMonto] = useState<number | "">("");
  const [newPiezaNombre, setNewPiezaNombre] = useState("Sala en L (4-5 Plazas)");
  const [newPiezaCantidad, setNewPiezaCantidad] = useState(1);
  const [newNotasServicio, setNewNotasServicio] = useState("");

  // Modal Confirmar Cancelación
  const [cancellingCita, setCancellingCita] = useState<ServicioCita | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState("");

  // Citas del día seleccionado
  const citasDelDia = citas.filter((c) => c.fecha === selectedDate);

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = [
      {
        categoriaId: "servicio_manual",
        categoriaNombre: "Servicio",
        piezaId: "pieza_manual",
        piezaNombre: newPiezaNombre,
        cantidad: Number(newPiezaCantidad) || 1,
      },
    ];

    if (isExistingClient) {
      if (!selectedClientId) return;
      await onCreateCitaManual({
        cliente_id: selectedClientId,
        fecha: newFecha,
        turno: newTurno,
        hora_especifica: newHora,
        items_contratados: items,
        monto_total: newMonto === "" ? null : Number(newMonto),
        tecnico_asignado: newTecnico,
        notas_servicio: newNotasServicio,
      });
    } else {
      await onCreateCitaManual({
        cliente_data: {
          nombre: newNombre,
          whatsapp: newWhatsapp,
          email: newEmail || undefined,
          direccion: newDireccion,
          municipio: newMunicipio,
          mascotas: newMascotas,
        },
        fecha: newFecha,
        turno: newTurno,
        hora_especifica: newHora,
        items_contratados: items,
        monto_total: newMonto === "" ? null : Number(newMonto),
        tecnico_asignado: newTecnico,
        notas_servicio: newNotasServicio,
      });
    }

    setShowNewModal(false);
    // Limpiar formulario
    setNewNombre("");
    setNewWhatsapp("");
    setNewDireccion("");
    setNewMonto("");
    setNewNotasServicio("");
  };

  const handleConfirmCancel = async () => {
    if (!cancellingCita) return;
    await onCancelCita(cancellingCita.id, cancelMotivo || "Cancelada por administración");
    setCancellingCita(null);
    setCancelMotivo("");
  };

  return (
    <div className="space-y-6">
      {/* Barra de Controles Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Selector de Modos y Fecha */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 text-xs font-heading font-bold">
            <button
              type="button"
              onClick={() => setViewMode("dia")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === "dia"
                  ? "bg-white text-[#355581] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Citas del día
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#355581] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tablero Kanban
            </button>
          </div>

          {viewMode === "dia" && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-heading font-bold text-slate-700 bg-transparent px-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1 text-[11px] font-bold text-[#1D71B5] hover:bg-blue-50 rounded-xl"
              >
                Hoy
              </button>
            </div>
          )}
        </div>

        {/* Botón Nueva Cita */}
        <button
          type="button"
          onClick={() => {
            if (clientes.length > 0) {
              setSelectedClientId(clientes[0].id);
            }
            setShowNewModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white font-heading font-bold text-xs rounded-2xl transition-all shadow-md active:scale-[0.99] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar cita manual</span>
        </button>
      </div>

      {highlightStatus && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-[#1D71B5]">
          <span>Mostrando citas con estatus: <strong>{highlightStatus}</strong></span>
          <button
            type="button"
            onClick={onClearHighlight}
            className="text-xs font-bold underline"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* VISTA 1: CITAS AL DÍA */}
      {viewMode === "dia" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {citasDelDia.length} servicio(s) programados para esta fecha
            </span>
          </div>

          {citasDelDia.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-heading font-bold text-sm text-slate-700">
                No hay servicios agendados para este día
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewFecha(selectedDate);
                  setShowNewModal(true);
                }}
                className="text-xs font-bold text-[#1D71B5] hover:underline"
              >
                + Agendar un servicio para esta fecha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {citasDelDia.map((cita) => {
                const cliente = clientes.find((c) => c.id === cita.cliente_id);

                return (
                  <div
                    key={cita.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden"
                  >
                    {/* Encabezado Cita */}
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-xs text-[#1D71B5] bg-blue-50 px-2.5 py-1 rounded-xl">
                        {cita.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          cita.estatus === "Completada"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : cita.estatus === "Cancelada"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {cita.estatus}
                      </span>
                    </div>

                    {/* Cliente y Dirección */}
                    <div>
                      <p className="font-heading font-bold text-sm text-slate-800">
                        {cliente?.nombre || "Cliente"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{cliente?.municipio} — {cliente?.direccion}</span>
                      </p>
                    </div>

                    {/* Turno y Hora */}
                    <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1.5 border border-slate-100">
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#36A6DE]" />
                          <span>{cita.hora_especifica || cita.turno}</span>
                        </span>
                        <span>${(cita.monto_total || 0).toLocaleString("es-MX")} MXN</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                        {cita.items_contratados.map((it, idx) => (
                          <p key={idx} className="truncate">
                            • {it.cantidad}x {it.piezaNombre}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Técnico Asignado */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Técnico responsable:
                      </label>
                      <select
                        value={cita.tecnico_asignado}
                        onChange={(e) =>
                          onUpdateCita(cita.id, { tecnico_asignado: e.target.value })
                        }
                        className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700"
                      >
                        {TECNICOS_ZMG.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Acciones de Estatus y Cancelar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <select
                        value={cita.estatus}
                        onChange={(e) =>
                          onUpdateCita(cita.id, { estatus: e.target.value as EstatusCita })
                        }
                        className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-700"
                      >
                        {ESTATUS_COLUMNS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      {cita.estatus !== "Cancelada" && (
                        <button
                          type="button"
                          onClick={() => setCancellingCita(cita)}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          Cancelar cita
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: TABLERO KANBAN */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {ESTATUS_COLUMNS.map((colName) => {
            const colCitas = citas.filter((c) => c.estatus === colName);

            return (
              <div
                key={colName}
                className="bg-slate-100/70 rounded-3xl p-3 space-y-3 flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="font-heading font-bold text-xs text-[#355581] truncate">
                    {colName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-slate-600 shadow-xs">
                    {colCitas.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colCitas.map((cita) => {
                    const cli = clientes.find((c) => c.id === cita.cliente_id);

                    return (
                      <div
                        key={cita.id}
                        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-extrabold text-[10px] text-[#1D71B5] bg-blue-50 px-1.5 py-0.5 rounded">
                            {cita.id}
                          </span>
                          <span className="text-[10px] text-slate-400">{cita.fecha}</span>
                        </div>

                        <p className="font-heading font-bold text-slate-800 truncate">
                          {cli?.nombre || "Cliente"}
                        </p>

                        <div className="text-[10px] text-slate-500 truncate">
                          {cita.items_contratados.map((it) => it.piezaNombre).join(", ")}
                        </div>

                        <select
                          value={cita.estatus}
                          onChange={(e) =>
                            onUpdateCita(cita.id, { estatus: e.target.value as EstatusCita })
                          }
                          className="w-full text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-slate-700"
                        >
                          {ESTATUS_COLUMNS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ALTA MANUAL DE CITA */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-[#355581]">
                Agendar cita manual
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Selector de Tipo de Cliente */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsExistingClient(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                    isExistingClient
                      ? "bg-white text-[#355581] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cliente ya existente
                </button>
                <button
                  type="button"
                  onClick={() => setIsExistingClient(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                    !isExistingClient
                      ? "bg-white text-[#355581] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Nuevo cliente
                </button>
              </div>

              {isExistingClient ? (
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Seleccionar cliente
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.whatsapp}) — {c.municipio}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-[#1D71B5] uppercase tracking-wider">
                    Información del nuevo cliente
                  </span>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del cliente"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Teléfono</label>
                      <input
                        type="tel"
                        required
                        placeholder="3312345678"
                        value={newWhatsapp}
                        onChange={(e) => setNewWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Municipio</label>
                      <select
                        value={newMunicipio}
                        onChange={(e) => setNewMunicipio(e.target.value as MunicipioZMG)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        {MUNICIPIOS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Dirección</label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, número y colonia"
                      value={newDireccion}
                      onChange={(e) => setNewDireccion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="cita-mascotas"
                      checked={newMascotas}
                      onChange={(e) => setNewMascotas(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1D71B5]"
                    />
                    <label htmlFor="cita-mascotas" className="text-xs font-semibold text-slate-700">
                      Tiene mascotas
                    </label>
                  </div>
                </div>
              )}

              {/* Parámetros de la Cita */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Fecha</label>
                  <input
                    type="date"
                    required
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Turno</label>
                  <select
                    value={newTurno}
                    onChange={(e) => setNewTurno(e.target.value as TurnoServicio)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Matutino (09:00 - 13:00)">Matutino</option>
                    <option value="Vespertino (14:00 - 18:00)">Vespertino</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Hora</label>
                  <input
                    type="text"
                    value={newHora}
                    onChange={(e) => setNewHora(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Servicio y Monto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Servicio / Pieza</label>
                  <input
                    type="text"
                    required
                    value={newPiezaNombre}
                    onChange={(e) => setNewPiezaNombre(e.target.value)}
                    placeholder="Ej: Sala 3 plazas, Colchón..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Monto cotizado (MXN)</label>
                  <input
                    type="number"
                    value={newMonto}
                    onChange={(e) => setNewMonto(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ej: 1450"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">Notas u observaciones</label>
                <textarea
                  rows={2}
                  value={newNotasServicio}
                  onChange={(e) => setNewNotasServicio(e.target.value)}
                  placeholder="Detalles del acceso, tipo de tela, requerimientos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#355581] hover:bg-[#1D71B5] text-white text-xs font-heading font-bold shadow-md transition-colors"
                >
                  Agendar y registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR CANCELACIÓN POR ADMINISTRADOR */}
      {cancellingCita && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-800">
                ¿Cancelar cita {cancellingCita.id}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                El estatus cambiará a Cancelada y no se contabilizará en las ganancias proyectadas.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-heading font-bold text-slate-700">
                Motivo de cancelación (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: Cliente reprogramó, fuerza mayor..."
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingCita(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-heading font-bold shadow-md transition-colors"
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
