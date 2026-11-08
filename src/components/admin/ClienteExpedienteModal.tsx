"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Download,
  CheckCircle,
  Clock,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Cpu,
  Share2,
} from "lucide-react";
import { Cliente, ServicioCita } from "@/types/crm";

interface ClienteExpedienteModalProps {
  cliente: Cliente;
  citas: ServicioCita[];
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteExpedienteModal({
  cliente,
  citas,
  isOpen,
  onClose,
}: ClienteExpedienteModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "historial" | "galeria" | "ia">("general");
  const [copiadoIA, setCopiadoIA] = useState(false);

  if (!isOpen) return null;

  // Filtrar citas de este cliente
  const citasCliente = citas.filter((c) => c.cliente_id === cliente.id);
  const citasCompletadas = citasCliente.filter((c) => c.estatus === "Completada");

  // Métricas agregadas
  const gastoTotal = citasCliente.reduce((sum, c) => sum + (c.monto_total || 0), 0) || cliente.historico_gasto || 0;
  const ticketPromedio = citasCliente.length > 0 ? Math.round(gastoTotal / citasCliente.length) : 0;

  // Agrupar fotos antes/después
  const todasLasFotos = citasCliente.flatMap((c) =>
    (c.fotos_antes_despues || []).map((f) => ({
      ...f,
      fecha: c.fecha,
      citaId: c.id,
      items: c.items_contratados.map((it) => it.piezaNombre).join(", "),
    }))
  );

  // Generar dataset para IA y Meta Ads
  const datasetIA = {
    expediente_version: "2.0",
    cliente: {
      id: cliente.id,
      nombre: cliente.nombre,
      municipio: cliente.municipio,
      colonia: cliente.colonia || "No especificada",
      tiene_mascotas: cliente.mascotas,
      ltv_acumulado_mxn: gastoTotal,
      ticket_promedio_mxn: ticketPromedio,
      total_servicios_realizados: citasCliente.length,
      fecha_primer_contacto: cliente.fecha_registro,
    },
    preferencias_y_telas: citasCliente.map((c) => ({
      cita_id: c.id,
      fecha: c.fecha,
      monto: c.monto_total,
      piezas: c.items_contratados.map((i) => `${i.cantidad}x ${i.piezaNombre}`),
      tipo_tela: c.tipo_tela || "No documentada",
      manchas_dificiles: c.manchas_dificiles || [],
      calificacion: c.calificacion_estrellas || c.calificacion || null,
      metodo_pago: c.metodo_pago || "Efectivo",
    })),
    perfil_audiencia_meta_lookalike: {
      segmento: cliente.mascotas ? "Pet Owners Premium ZMG" : "Hogar y Cuidado Premium ZMG",
      zona: cliente.municipio,
      cluster_valor: gastoTotal > 3000 ? "High LTV VIP" : "Standard Retargeting",
      frecuencia_servicio_sugerida: cliente.mascotas ? "Trimestral" : "Semestral",
    },
  };

  const handleCopiarDataset = () => {
    navigator.clipboard.writeText(JSON.stringify(datasetIA, null, 2));
    setCopiadoIA(true);
    setTimeout(() => setCopiadoIA(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Encabezado Kanan 60-30-10 */}
        <div className="bg-gradient-to-r from-[#355581] via-[#1D71B5] to-[#36A6DE] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading font-extrabold tracking-tight">
                  Expediente 360° del Cliente
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                  {cliente.id}
                </span>
              </div>
              <p className="text-xs text-white/90">
                {cliente.nombre} • {cliente.municipio}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Cerrar expediente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de navegación interna */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/70 text-xs font-heading font-bold">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-[#1D71B5] text-[#1D71B5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil y LTV</span>
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "historial"
                ? "border-[#1D71B5] text-[#1D71B5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historial ({citasCliente.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("galeria")}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "galeria"
                ? "border-[#1D71B5] text-[#1D71B5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Evidencias y Fotos ({todasLasFotos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("ia")}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "ia"
                ? "border-[#1D71B5] text-[#1D71B5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#36A6DE]" />
            <span>Dataset IA y Ads</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Tarjetas de métricas LTV */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    LTV Acumulado
                  </p>
                  <p className="text-xl font-heading font-extrabold text-[#1D71B5] mt-1">
                    ${gastoTotal.toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Ticket Promedio
                  </p>
                  <p className="text-xl font-heading font-extrabold text-[#355581] mt-1">
                    ${ticketPromedio.toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Servicios Hechos
                  </p>
                  <p className="text-xl font-heading font-extrabold text-emerald-700 mt-1">
                    {citasCompletadas.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Perfil Hogar
                  </p>
                  <p className="text-xs font-heading font-extrabold text-amber-800 mt-1.5 flex items-center gap-1">
                    {cliente.mascotas ? "🐾 Con Mascotas" : "✨ Sin Mascotas"}
                  </p>
                </div>
              </div>

              {/* Información de Contacto y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-heading font-bold text-[#355581] uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#1D71B5]" /> Contacto y WhatsApp
                  </h4>
                  <div className="text-xs space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Teléfono / WhatsApp</span>
                      <a
                        href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#1D71B5] hover:underline"
                      >
                        {cliente.whatsapp}
                      </a>
                    </div>
                    {cliente.email && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Correo Electrónico</span>
                        <p className="font-medium">{cliente.email}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cliente Desde</span>
                      <p className="font-medium">{cliente.fecha_registro || "2026"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="text-xs font-heading font-bold text-[#355581] uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#36A6DE]" /> Dirección y Cobertura
                  </h4>
                  <div className="text-xs space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dirección Completa</span>
                      <p className="font-semibold">{cliente.direccion}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Municipio</span>
                        <p className="font-medium">{cliente.municipio}</p>
                      </div>
                      {cliente.codigo_postal && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Código Postal</span>
                          <p className="font-medium">{cliente.codigo_postal}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas de Diagnóstico Histórico */}
              {cliente.notas_especiales && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900">
                  <span className="font-bold block mb-1">Notas especiales y cuidados particulares:</span>
                  {cliente.notas_especiales}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORIAL */}
          {activeTab === "historial" && (
            <div className="space-y-4">
              {citasCliente.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No hay citas registradas en el historial para este cliente.
                </div>
              ) : (
                <div className="space-y-3">
                  {citasCliente.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#1D71B5] transition-colors shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-extrabold text-[#1D71B5] bg-blue-50 px-2 py-1 rounded-lg">
                            {cita.id}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {cita.fecha} • {cita.turno}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              cita.estatus === "Completada"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : cita.estatus === "En Proceso"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {cita.estatus}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            ${(cita.monto_total || 0).toLocaleString("es-MX")}
                          </span>
                        </div>
                      </div>

                      {/* Ítems del servicio */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">
                          Mobiliario atendido:
                        </span>
                        {cita.items_contratados.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              • {it.cantidad}x {it.piezaNombre} ({it.categoriaNombre})
                            </span>
                            {it.detalles && <span className="text-slate-400 italic">{it.detalles}</span>}
                          </div>
                        ))}
                      </div>

                      {/* Detalles técnicos (Tela, manchas, firma) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Tipo de Tela:</span>
                          <span className="font-medium text-slate-700">{cita.tipo_tela || "Poliamida / Lino"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Método de Pago:</span>
                          <span className="font-medium text-slate-700">{cita.metodo_pago || "Efectivo"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Técnico Asignado:</span>
                          <span className="font-medium text-slate-700">{cita.tecnico_asignado}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GALERIA ANTES/DESPUES */}
          {activeTab === "galeria" && (
            <div className="space-y-4">
              {todasLasFotos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No se han capturado fotos de antes y después en los servicios de este cliente aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todasLasFotos.map((foto, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#1D71B5]">{foto.citaId}</span>
                        <span className="text-slate-500">{foto.fecha}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/10">
                          <img
                            src={foto.antesUrl}
                            alt="Antes"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Antes
                          </span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/10">
                          <img
                            src={foto.despuesUrl}
                            alt="Después"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-[#1D71B5] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Después
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        {foto.descripcion || foto.items}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATASET IA Y META ADS */}
          {activeTab === "ia" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#355581] uppercase tracking-wider">
                    Estructura de Datos para Entrenamiento IA & Meta Ads
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Formato JSON unificado para alimentar el Agente de Marketing, campañas Lookalike y promociones recurrentes.
                  </p>
                </div>
                <button
                  onClick={handleCopiarDataset}
                  className="px-3 py-1.5 rounded-xl bg-[#1D71B5] hover:bg-[#185c94] text-white text-xs font-heading font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiadoIA ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiadoIA ? "¡Copiado al portapapeles!" : "Copiar JSON"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-[350px] border border-slate-800 leading-relaxed">
                {JSON.stringify(datasetIA, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-heading font-bold transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
}
