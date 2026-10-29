"use client";

import React, { useState, useRef } from "react";
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
  CreditCard,
  Camera,
  Image as ImageIcon,
  KeyRound,
  Droplets,
  Zap,
  Info,
  Sparkles,
  Layers,
  PenTool,
  RotateCcw
} from "lucide-react";
import { ServicioCita, Cliente, EstatusCita, TurnoServicio, MunicipioZMG, MetodoPago, FotoAntesDespues } from "@/types/crm";
import { CATALOGO_SERVICIOS_KANAN, ServicioItemCatalogo } from "@/data/catalogoServicios";

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
      metodo_pago?: MetodoPago;
      requiere_factura?: boolean;
      rfc_factura?: string;
      razon_social?: string;
      calificacion?: number | null;
      notas_servicio?: string;
      tipo_tela?: string;
      manchas_dificiles?: string[];
      instrucciones_acceso?: string;
      cuenta_con_agua_y_luz?: boolean;
      fotos_antes_despues?: FotoAntesDespues[];
      firma_conformidad?: string;
      fecha?: string;
      turno?: TurnoServicio;
      hora_especifica?: string;
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
    metodo_pago?: MetodoPago;
    tipo_tela?: string;
    manchas_dificiles?: string[];
    instrucciones_acceso?: string;
    cuenta_con_agua_y_luz?: boolean;
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

const TIPOS_TELA = [
  "Lino / Algodón",
  "Terciopelo / Velvet",
  "Microfibra / Gamuzina",
  "Piel natural / Cuero",
  "Vinil / Tactopiel",
  "Poliéster estándar / Chenille",
];

const MANCHAS_COMUNES = [
  "Orina de mascota / Fluidos",
  "Vino / Jugos oscuros",
  "Grasa corporal / Sudor",
  "Café / Chocolate",
  "Tinta / Plumón",
  "Moho / Humedad",
];

const METODOS_PAGO: MetodoPago[] = [
  "Efectivo",
  "Transferencia SPEI",
  "Tarjeta / Terminal",
  "Pendiente",
];

export function CalendarCitasView({
  citas,
  clientes,
  highlightStatus,
  onClearHighlight,
  onUpdateCita,
  onCancelCita,
  onCreateCitaManual,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"dia" | "kanban">("dia");
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
  const [newTecnico, setNewTecnico] = useState("Técnico 1 (Ruta ZMG)");
  const [selectedCatalogoId, setSelectedCatalogoId] = useState<string>(CATALOGO_SERVICIOS_KANAN[0].id);
  const [newPiezaNombre, setNewPiezaNombre] = useState(CATALOGO_SERVICIOS_KANAN[0].piezaNombre);
  const [newMonto, setNewMonto] = useState<number | "">(CATALOGO_SERVICIOS_KANAN[0].precioSugerido || "");
  const [newPiezaCantidad, setNewPiezaCantidad] = useState(1);
  const [newMetodoPago, setNewMetodoPago] = useState<MetodoPago>("Pendiente");
  const [newTipoTela, setNewTipoTela] = useState("Lino / Algodón");
  const [newManchas, setNewManchas] = useState<string[]>([]);
  const [newAcceso, setNewAcceso] = useState("");
  const [newAguaLuz, setNewAguaLuz] = useState(true);
  const [newNotasServicio, setNewNotasServicio] = useState("");

  // Modal Detalle Cita / Edición / Fotos
  const [selectedCitaDetalle, setSelectedCitaDetalle] = useState<ServicioCita | null>(null);
  const [fotoAntesUrl, setFotoAntesUrl] = useState("");
  const [fotoDespuesUrl, setFotoDespuesUrl] = useState("");

  // Firma Digital en Pantalla
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignatureDrawn, setHasSignatureDrawn] = useState(false);

  // Modal Confirmar Cancelación
  const [cancellingCita, setCancellingCita] = useState<ServicioCita | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState("");

  // Citas del día seleccionado
  const citasDelDia = citas.filter((c) => c.fecha === selectedDate);
  const citasMatutino = citasDelDia.filter((c) => c.turno.startsWith("Matutino") && c.estatus !== "Cancelada");
  const citasVespertino = citasDelDia.filter((c) => c.turno.startsWith("Vespertino") && c.estatus !== "Cancelada");

  // Validación de semáforo de capacidad para la fecha que se está seleccionando en el formulario
  const citasFechaForm = citas.filter((c) => c.fecha === newFecha && c.estatus !== "Cancelada");
  const matutinoOcupado = citasFechaForm.some((c) => c.turno.startsWith("Matutino"));
  const vespertinoOcupado = citasFechaForm.some((c) => c.turno.startsWith("Vespertino"));
  const capacidadCompleta = matutinoOcupado && vespertinoOcupado;

  // Alerta de choque de zona
  const choqueZonaAdvertencia = (() => {
    if (citasFechaForm.length === 0) return null;
    const citaExistente = citasFechaForm[0];
    const cliExistente = clientes.find((cl) => cl.id === citaExistente.cliente_id);
    const munExistente = cliExistente?.municipio;

    let munNuevo = newMunicipio;
    if (isExistingClient && selectedClientId) {
      const cliSel = clientes.find((cl) => cl.id === selectedClientId);
      if (cliSel) munNuevo = cliSel.municipio;
    }

    if (munExistente && munNuevo && munExistente !== munNuevo) {
      return `⚠️ Alerta de ruta: La otra cita de este día está en ${munExistente}. Agendar en ${munNuevo} aumentará el tiempo de traslado del técnico.`;
    }
    return null;
  })();

  const handleSelectCatalogoItem = (itemId: string) => {
    setSelectedCatalogoId(itemId);
    const item = CATALOGO_SERVICIOS_KANAN.find((c) => c.id === itemId);
    if (item) {
      setNewPiezaNombre(item.piezaNombre);
      if (item.precioSugerido) {
        setNewMonto(item.precioSugerido);
      }
    }
  };

  const toggleMancha = (mancha: string) => {
    setNewManchas((prev) =>
      prev.includes(mancha) ? prev.filter((m) => m !== mancha) : [...prev, mancha]
    );
  };

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
        piezaId: selectedCatalogoId || "pieza_manual",
        piezaNombre: newPiezaNombre,
        cantidad: Number(newPiezaCantidad) || 1,
      },
    ];

    const payloadBase = {
      fecha: newFecha,
      turno: newTurno,
      hora_especifica: newHora,
      items_contratados: items,
      monto_total: newMonto === "" ? null : Number(newMonto),
      metodo_pago: newMetodoPago,
      tipo_tela: newTipoTela,
      manchas_dificiles: newManchas,
      instrucciones_acceso: newAcceso,
      cuenta_con_agua_y_luz: newAguaLuz,
      tecnico_asignado: newTecnico,
      notas_servicio: newNotasServicio,
    };

    if (isExistingClient) {
      if (!selectedClientId) return;
      await onCreateCitaManual({
        cliente_id: selectedClientId,
        ...payloadBase,
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
        ...payloadBase,
      });
    }

    setShowNewModal(false);
    // Limpiar formulario
    setNewNombre("");
    setNewWhatsapp("");
    setNewDireccion("");
    setNewMonto("");
    setNewNotasServicio("");
    setNewAcceso("");
    setNewManchas([]);
  };

  const handleGuardarFotos = async (citaId: string) => {
    if (!fotoAntesUrl && !fotoDespuesUrl) return;
    const nuevasFotos: FotoAntesDespues[] = [
      ...(selectedCitaDetalle?.fotos_antes_despues || []),
      {
        antesUrl: fotoAntesUrl || "/assets/services/hero-fresh.jpg",
        despuesUrl: fotoDespuesUrl || "/assets/services/hero-fresh.jpg",
        descripcion: `Evidencia técnica - ${new Date().toLocaleDateString("es-MX")}`,
      },
    ];

    await onUpdateCita(citaId, {
      fotos_antes_despues: nuevasFotos,
    });

    if (selectedCitaDetalle) {
      setSelectedCitaDetalle({
        ...selectedCitaDetalle,
        fotos_antes_despues: nuevasFotos,
      });
    }
    setFotoAntesUrl("");
    setFotoDespuesUrl("");
  };

  // Métodos para Canvas de Firma Digital
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
    setIsDrawing(true);
    setHasSignatureDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawn(false);
  };

  const handleGuardarFirma = async (citaId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const firmaDataUrl = canvas.toDataURL("image/png");

    await onUpdateCita(citaId, {
      firma_conformidad: firmaDataUrl,
      estatus: "Completada"
    });

    if (selectedCitaDetalle) {
      setSelectedCitaDetalle({
        ...selectedCitaDetalle,
        firma_conformidad: firmaDataUrl,
        estatus: "Completada"
      });
    }
    clearSignatureCanvas();
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

      {/* SEMÁFORO DE CAPACIDAD DEL DÍA EN PANTALLA (Para 1 solo técnico) */}
      {viewMode === "dia" && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              citasDelDia.filter((c) => c.estatus !== "Cancelada").length >= 2
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : citasDelDia.filter((c) => c.estatus !== "Cancelada").length === 1
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}>
              {citasDelDia.filter((c) => c.estatus !== "Cancelada").length}/2
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                Capacidad del Técnico para este Día
              </h4>
              <p className="text-[11px] text-slate-500">
                {citasDelDia.filter((c) => c.estatus !== "Cancelada").length >= 2
                  ? "Día Completo (2 de 2 turnos ocupados). No se recomienda agendar más para evitar demoras."
                  : citasDelDia.filter((c) => c.estatus !== "Cancelada").length === 1
                  ? "Capacidad Media (1 turno ocupado, 1 turno libre)."
                  : "Día Totalmente Disponible (Ambos turnos libres para agendar)."}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              citasMatutino.length > 0
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${citasMatutino.length > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
              Mañana (9-1pm): {citasMatutino.length > 0 ? "Ocupado" : "Libre"}
            </span>

            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              citasVespertino.length > 0
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${citasVespertino.length > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
              Tarde (2-6pm): {citasVespertino.length > 0 ? "Ocupado" : "Libre"}
            </span>
          </div>
        </div>
      )}

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
                    onClick={() => setSelectedCitaDetalle(cita)}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden cursor-pointer hover:border-[#1D71B5] hover:shadow-md transition group"
                  >
                    {/* Encabezado Cita */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-extrabold text-[#355581] bg-slate-100 px-2.5 py-1 rounded-xl">
                        {cita.id}
                      </span>
                      <span
                        className={`text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-full border ${
                          cita.estatus === "Completada"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : cita.estatus === "Confirmada"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : cita.estatus === "En Ruta" || cita.estatus === "En Proceso"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : cita.estatus === "Cancelada"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {cita.estatus}
                      </span>
                    </div>

                    {/* Cliente Info */}
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-sm text-slate-800">
                        {cliente?.nombre || "Cliente no encontrado"}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cliente?.municipio} - {cliente?.direccion}</span>
                      </p>
                      {cliente?.whatsapp && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cliente.whatsapp}</span>
                        </p>
                      )}
                    </div>

                    {/* Horario y Detalles */}
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

                      {/* Método de pago e info de tela */}
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                        <span>Pago: <strong className="text-slate-800">{cita.metodo_pago || "Pendiente"}</strong></span>
                        {cita.tipo_tela && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                            {cita.tipo_tela}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCitaDetalle(cita)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#1D71B5] hover:bg-blue-50 rounded-xl transition"
                        >
                          Ver ficha
                        </button>
                        {cita.estatus !== "Cancelada" && (
                          <button
                            type="button"
                            onClick={() => setCancellingCita(cita)}
                            className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {ESTATUS_COLUMNS.map((colEstatus) => {
            const citasCol = citas.filter((c) => c.estatus === colEstatus);
            return (
              <div
                key={colEstatus}
                className="bg-slate-100/70 rounded-3xl p-3 space-y-3 min-w-[240px] border border-slate-200/60 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <h3 className="font-heading font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                      {colEstatus}
                    </h3>
                    <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      {citasCol.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {citasCol.map((cita) => {
                      const cliente = clientes.find((c) => c.id === cita.cliente_id);
                      return (
                        <div
                          key={cita.id}
                          onClick={() => setSelectedCitaDetalle(cita)}
                          className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-[#1D71B5] transition"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#355581]">{cita.id}</span>
                            <span className="text-slate-400">{cita.fecha}</span>
                          </div>
                          <p className="font-heading font-bold text-xs text-slate-800 line-clamp-1">
                            {cliente?.nombre || "Cliente"}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {cita.items_contratados.map((it) => it.piezaNombre).join(", ")}
                          </p>
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                            <span>{cita.turno.split(" ")[0]}</span>
                            <strong className="text-slate-800">${(cita.monto_total || 0).toLocaleString("es-MX")}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: FICHA DETALLADA DE LA CITA + FOTOS ANTES/DESPUÉS + PAGO */}
      {selectedCitaDetalle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400">Detalles de la Cita</span>
                <h3 className="font-heading font-extrabold text-lg text-[#355581] flex items-center gap-2">
                  <span>{selectedCitaDetalle.id}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {selectedCitaDetalle.estatus}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitaDetalle(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bloque 1: Cliente y Domicilio */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              {(() => {
                const cli = clientes.find((c) => c.id === selectedCitaDetalle.cliente_id);
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Cliente:</span>
                      <strong className="text-slate-800 text-sm">{cli?.nombre}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Teléfono / WhatsApp:</span>
                      <strong className="text-slate-800">{cli?.whatsapp}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dirección y Municipio:</span>
                      <strong className="text-slate-800 text-right">{cli?.direccion} ({cli?.municipio})</strong>
                    </div>
                    {selectedCitaDetalle.instrucciones_acceso && (
                      <div className="pt-2 border-t border-slate-200 text-amber-800 bg-amber-50/50 p-2 rounded-xl flex items-start gap-2">
                        <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px]">Acceso a Coto / Privada / Edificio:</strong>
                          <span>{selectedCitaDetalle.instrucciones_acceso}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Bloque 2: Información Técnica del Mueble y Servicios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Datos Técnicos del Mueble</span>
                <p><strong>Tipo de tela:</strong> {selectedCitaDetalle.tipo_tela || "No especificada"}</p>
                <p>
                  <strong>Manchas críticas:</strong>{" "}
                  {selectedCitaDetalle.manchas_dificiles && selectedCitaDetalle.manchas_dificiles.length > 0
                    ? selectedCitaDetalle.manchas_dificiles.join(", ")
                    : "Ninguna reportada"}
                </p>
                <p>
                  <strong>Agua y Luz confirmados:</strong>{" "}
                  {selectedCitaDetalle.cuenta_con_agua_y_luz !== false ? "✅ Sí" : "❌ Requiere verificar"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Cobro y Método de Pago</span>
                <p className="text-lg font-extrabold text-emerald-700">
                  ${(selectedCitaDetalle.monto_total || 0).toLocaleString("es-MX")} MXN
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Método de pago:</span>
                  <select
                    value={selectedCitaDetalle.metodo_pago || "Pendiente"}
                    onChange={async (e) => {
                      const nuevo = e.target.value as MetodoPago;
                      await onUpdateCita(selectedCitaDetalle.id, { metodo_pago: nuevo });
                      setSelectedCitaDetalle({ ...selectedCitaDetalle, metodo_pago: nuevo });
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700"
                  >
                    {METODOS_PAGO.map((mp) => (
                      <option key={mp} value={mp}>
                        {mp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bloque 3: Evidencia Fotográfica Antes y Después */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#1D71B5]" />
                  Evidencia Fotográfica Antes y Después
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedCitaDetalle.fotos_antes_despues?.length || 0} fotos registradas
                </span>
              </div>

              {selectedCitaDetalle.fotos_antes_despues && selectedCitaDetalle.fotos_antes_despues.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedCitaDetalle.fotos_antes_despues.map((foto, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 space-y-1">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Antes</span>
                          <img src={foto.antesUrl} alt="Antes" className="w-full h-20 object-cover rounded-lg" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 block">Después</span>
                          <img src={foto.despuesUrl} alt="Después" className="w-full h-20 object-cover rounded-lg" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{foto.descripcion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  Aún no se han adjuntado fotos de antes y después para este servicio.
                </p>
              )}

              {/* Formulario rápido para agregar URL de fotos */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="URL Foto Antes (ej. /assets/antes.jpg)"
                  value={fotoAntesUrl}
                  onChange={(e) => setFotoAntesUrl(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5"
                />
                <input
                  type="text"
                  placeholder="URL Foto Después (ej. /assets/despues.jpg)"
                  value={fotoDespuesUrl}
                  onChange={(e) => setFotoDespuesUrl(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5"
                />
              </div>
              {(fotoAntesUrl || fotoDespuesUrl) && (
                <button
                  type="button"
                  onClick={() => handleGuardarFotos(selectedCitaDetalle.id)}
                  className="w-full py-1.5 bg-[#1D71B5] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition"
                >
                  Guardar Evidencia Fotográfica
                </button>
              )}
            </div>

            {/* Bloque 4: Firma Digital de Conformidad del Cliente */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-slate-800 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#1D71B5]" />
                  Firma Digital de Conformidad del Servicio
                </span>
                {selectedCitaDetalle.firma_conformidad ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Firmado por el cliente
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Pendiente de firma
                  </span>
                )}
              </div>

              {selectedCitaDetalle.firma_conformidad ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1">
                  <img
                    src={selectedCitaDetalle.firma_conformidad}
                    alt="Firma del cliente"
                    className="max-h-24 mx-auto object-contain"
                  />
                  <p className="text-[10px] text-slate-400">
                    El cliente avaló la entrega del servicio en óptimas condiciones.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-1 relative">
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={130}
                      className="w-full touch-none cursor-crosshair rounded-lg bg-slate-50/50"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasSignatureDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">
                        Firmar aquí con el dedo o puntero
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={clearSignatureCanvas}
                      disabled={!hasSignatureDrawn}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar trazo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuardarFirma(selectedCitaDetalle.id)}
                      disabled={!hasSignatureDrawn}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guardar Firma y Finalizar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCitaDetalle(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CITA MANUAL (COMPLETO CON SEMÁFORO, TELA, ACCESOS Y PAGO) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-[#355581]">
                Agendar nueva cita de servicio
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
              {/* Selección de Tipo de Cliente */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-heading font-bold">
                <button
                  type="button"
                  onClick={() => setIsExistingClient(true)}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    isExistingClient ? "bg-white text-[#355581] shadow-sm" : "text-slate-600"
                  }`}
                >
                  Cliente existente
                </button>
                <button
                  type="button"
                  onClick={() => setIsExistingClient(false)}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    !isExistingClient ? "bg-white text-[#355581] shadow-sm" : "text-slate-600"
                  }`}
                >
                  Cliente nuevo
                </button>
              </div>

              {isExistingClient ? (
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Seleccionar Cliente</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    required
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.whatsapp}) - {c.municipio}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-[#355581] block">Datos del Nuevo Cliente</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nombre completo"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="WhatsApp (10 dígitos)"
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Dirección y colonia"
                      value={newDireccion}
                      onChange={(e) => setNewDireccion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Municipio (ej. Zapopan)"
                      value={newMunicipio}
                      onChange={(e) => setNewMunicipio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Fecha y Turno con Semáforo de Capacidad */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#355581] block">Fecha y Turno del Técnico</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Fecha del Servicio</label>
                    <input
                      type="date"
                      required
                      value={newFecha}
                      onChange={(e) => setNewFecha(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Turno de Atención</label>
                    <select
                      value={newTurno}
                      onChange={(e) => setNewTurno(e.target.value as TurnoServicio)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value="Matutino (09:00 - 13:00)">
                        Matutino (09:00 - 13:00) {matutinoOcupado ? "⚠️ Ocupado" : "🟢 Libre"}
                      </option>
                      <option value="Vespertino (14:00 - 18:00)">
                        Vespertino (14:00 - 18:00) {vespertinoOcupado ? "⚠️ Ocupado" : "🟢 Libre"}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Hora sugerida</label>
                    <input
                      type="text"
                      value={newHora}
                      onChange={(e) => setNewHora(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Advertencia de Choque de Zona si aplica */}
                {choqueZonaAdvertencia && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    {choqueZonaAdvertencia}
                  </p>
                )}
              </div>

              {/* Catálogo de Servicios y Monto */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#355581] block">Servicio del Catálogo y Cotización</span>
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Seleccionar Servicio</label>
                  <select
                    value={selectedCatalogoId}
                    onChange={(e) => handleSelectCatalogoItem(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <optgroup label="Salas y Sillas">
                      {CATALOGO_SERVICIOS_KANAN.filter((s) => s.categoriaId === "salas").map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.piezaNombre} {s.precioSugerido ? `($${s.precioSugerido} MXN)` : ""}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Colchones">
                      {CATALOGO_SERVICIOS_KANAN.filter((s) => s.categoriaId === "colchones").map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.piezaNombre} {s.precioSugerido ? `($${s.precioSugerido} MXN)` : ""}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Vestiduras Automotrices">
                      {CATALOGO_SERVICIOS_KANAN.filter((s) => s.categoriaId === "vestiduras").map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.piezaNombre} {s.precioSugerido ? `($${s.precioSugerido} MXN)` : ""}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tapetes y Alfombras">
                      {CATALOGO_SERVICIOS_KANAN.filter((s) => s.categoriaId === "tapetes").map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.piezaNombre} {s.precioSugerido ? `($${s.precioSugerido} MXN)` : ""}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Descripción o Edición</label>
                    <input
                      type="text"
                      required
                      value={newPiezaNombre}
                      onChange={(e) => setNewPiezaNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Monto cotizado final (MXN)</label>
                    <input
                      type="number"
                      value={newMonto}
                      onChange={(e) => setNewMonto(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>

                {/* Sugerencia de Venta Cruzada / Upselling */}
                <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>💡 Sugerir: ¿Desea sanitizar un colchón o 4 sillas por precio especial?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPiezaNombre((prev) => `${prev} + 4 Sillas Comedor`);
                      setNewMonto((prev) => (Number(prev) || 0) + 400);
                    }}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition"
                  >
                    + Agregar al paquete
                  </button>
                </div>
              </div>

              {/* Especificaciones de Tela, Manchas y Acceso al Coto */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-[#355581] block">Detalles Técnicos y Acceso</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Tipo de Tela</label>
                    <select
                      value={newTipoTela}
                      onChange={(e) => setNewTipoTela(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      {TIPOS_TELA.map((tela) => (
                        <option key={tela} value={tela}>
                          {tela}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">Método de Pago Acordado</label>
                    <select
                      value={newMetodoPago}
                      onChange={(e) => setNewMetodoPago(e.target.value as MetodoPago)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      {METODOS_PAGO.map((mp) => (
                        <option key={mp} value={mp}>
                          {mp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Manchas difíciles */}
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">Manchas críticas a tratar:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MANCHAS_COMUNES.map((mancha) => {
                      const selected = newManchas.includes(mancha);
                      return (
                        <button
                          type="button"
                          key={mancha}
                          onClick={() => toggleMancha(mancha)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                            selected
                              ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {selected ? "✓ " : "+ "} {mancha}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instrucciones de Acceso al Coto */}
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Instrucciones de Acceso al Coto / Edificio / Privada
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Coto 4 Casa 12, dar nombre en caseta, es piso 2 con elevador..."
                    value={newAcceso}
                    onChange={(e) => setNewAcceso(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="new-agua-luz"
                    checked={newAguaLuz}
                    onChange={(e) => setNewAguaLuz(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1D71B5]"
                  />
                  <label htmlFor="new-agua-luz" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Cliente cuenta con toma de agua y conexión eléctrica funcional
                  </label>
                </div>
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white text-xs font-heading font-bold shadow-md transition-all"
                >
                  Confirmar y Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCELACIÓN */}
      {cancellingCita && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-base text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cancelar Cita {cancellingCita.id}
            </h3>
            <p className="text-xs text-slate-600">
              Ingresa el motivo de cancelación para registrarlo en el historial del CRM:
            </p>
            <input
              type="text"
              required
              placeholder="Ej. Cliente reprogramó por viaje, emergencia..."
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingCita(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
