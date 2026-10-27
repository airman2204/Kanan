"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { Cliente, ServicioCita, MunicipioZMG } from "@/types/crm";

interface ClientesTableProps {
  clientes: Cliente[];
  citas: ServicioCita[];
  onUpdateCliente: (clienteId: string, updates: Partial<Cliente>) => Promise<void>;
  onDeleteCliente: (clienteId: string) => Promise<void>;
  onCreateClienteManual: (cliente: {
    nombre: string;
    whatsapp: string;
    direccion: string;
    municipio: MunicipioZMG;
    mascotas: boolean;
    notas_especiales?: string;
    email?: string;
    historico_gasto?: number;
  }) => Promise<void>;
}

const MUNICIPIOS: MunicipioZMG[] = ["Guadalajara", "Zapopan", "Tlajomulco", "Tlaquepaque"];

export function ClientesTable({
  clientes,
  citas,
  onUpdateCliente,
  onDeleteCliente,
  onCreateClienteManual,
}: ClientesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("todos");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Modal Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDireccion, setNewDireccion] = useState("");
  const [newMunicipio, setNewMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [newMascotas, setNewMascotas] = useState(false);
  const [newNotas, setNewNotas] = useState("");
  const [newGasto, setNewGasto] = useState<number | "">("");

  // Modal Editar
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editMunicipio, setEditMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [editMascotas, setEditMascotas] = useState(false);
  const [editNotas, setEditNotas] = useState("");

  // Modal Confirmar Eliminar
  const [deletingClient, setDeletingClient] = useState<Cliente | null>(null);

  // Filtros
  const filteredClientes = clientes.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm) ||
      c.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchMun = selectedMunicipio === "todos" || c.municipio === selectedMunicipio;
    return matchSearch && matchMun;
  });

  const toggleExpand = (id: string) => {
    setExpandedClientId((prev) => (prev === id ? null : id));
  };

  const handleOpenEdit = (c: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(c);
    setEditNombre(c.nombre);
    setEditWhatsapp(c.whatsapp);
    setEditEmail(c.email || "");
    setEditDireccion(c.direccion);
    setEditMunicipio(c.municipio);
    setEditMascotas(c.mascotas);
    setEditNotas(c.notas_especiales || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    await onUpdateCliente(editingClient.id, {
      nombre: editNombre,
      whatsapp: editWhatsapp,
      email: editEmail || undefined,
      direccion: editDireccion,
      municipio: editMunicipio,
      mascotas: editMascotas,
      notas_especiales: editNotas,
    });
    setEditingClient(null);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateClienteManual({
      nombre: newNombre,
      whatsapp: newWhatsapp,
      email: newEmail || undefined,
      direccion: newDireccion,
      municipio: newMunicipio,
      mascotas: newMascotas,
      notas_especiales: newNotas,
      historico_gasto: newGasto === "" ? 0 : Number(newGasto),
    });

    // Reset
    setShowCreateModal(false);
    setNewNombre("");
    setNewWhatsapp("");
    setNewEmail("");
    setNewDireccion("");
    setNewMunicipio("Guadalajara");
    setNewMascotas(false);
    setNewNotas("");
    setNewGasto("");
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior: Búsqueda, Filtro y Botón Alta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o colonia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#36A6DE]/20 focus:border-[#1D71B5]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={selectedMunicipio}
            onChange={(e) => setSelectedMunicipio(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#36A6DE]/20"
          >
            <option value="todos">Todos los municipios</option>
            {MUNICIPIOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#355581] to-[#1D71B5] hover:from-[#2a4468] hover:to-[#175c94] text-white font-heading font-bold text-xs rounded-2xl transition-all shadow-md active:scale-[0.99] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Dar de alta cliente</span>
        </button>
      </div>

      {/* Tabla Estructurada Legible */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-heading font-extrabold text-[#355581] uppercase tracking-wider">
                <th className="py-4 px-5">Cliente</th>
                <th className="py-4 px-4">Teléfono</th>
                <th className="py-4 px-4">Ubicación</th>
                <th className="py-4 px-4 text-center">Mascotas</th>
                <th className="py-4 px-4 text-right">Inversión</th>
                <th className="py-4 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cli) => {
                  const cliCitas = citas.filter((c) => c.cliente_id === cli.id);
                  const isExpanded = expandedClientId === cli.id;

                  return (
                    <React.Fragment key={cli.id}>
                      <tr
                        onClick={() => toggleExpand(cli.id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50/70 ${
                          isExpanded ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Nombre y Avatar */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#355581] to-[#1D71B5] text-white font-heading font-bold text-xs flex items-center justify-center shrink-0">
                              {cli.nombre.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-heading font-bold text-slate-800 text-sm">
                                {cli.nombre}
                              </p>
                              {cli.email && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{cli.email}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp / Teléfono */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                          <a
                            href={`https://wa.me/52${cli.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[#1D71B5] hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{cli.whatsapp}</span>
                          </a>
                        </td>

                        {/* Municipio y Dirección */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-semibold text-slate-700">{cli.municipio}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                            {cli.direccion}
                          </p>
                        </td>

                        {/* Mascotas */}
                        <td className="py-3.5 px-4 text-center">
                          {cli.mascotas ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🐾 Pet
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">—</span>
                          )}
                        </td>

                        {/* Gasto Total */}
                        <td className="py-3.5 px-4 text-right font-heading font-extrabold text-[#355581]">
                          ${(cli.historico_gasto || 0).toLocaleString("es-MX")}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">MXN</span>
                        </td>

                        {/* Acciones y Dropdown */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(cli, e)}
                              className="p-1.5 text-slate-400 hover:text-[#1D71B5] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar cliente"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingClient(cli);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#1D71B5]" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Fila Desplegable (Dropdown de Historial y Notas) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={6} className="p-5 border-t border-b border-slate-200">
                            <div className="space-y-4">
                              {/* Notas especiales del cliente */}
                              {cli.notas_especiales && (
                                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
                                  <span className="font-bold">Notas del cliente:</span>{" "}
                                  {cli.notas_especiales}
                                </div>
                              )}

                              {/* Historial de Citas */}
                              <div>
                                <h4 className="font-heading font-bold text-xs text-[#355581] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-[#36A6DE]" />
                                  <span>Historial de servicios ({cliCitas.length})</span>
                                </h4>

                                {cliCitas.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">
                                    Este cliente no cuenta con citas previas registradas.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {cliCitas.map((cita) => (
                                      <div
                                        key={cita.id}
                                        className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-heading font-extrabold text-[11px] text-[#1D71B5] bg-blue-50 px-2 py-0.5 rounded-md">
                                            {cita.id}
                                          </span>
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700">
                                            {cita.estatus}
                                          </span>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-800">
                                          {cita.fecha} • {cita.turno}
                                        </p>

                                        <div className="text-[11px] text-slate-500 space-y-0.5">
                                          {cita.items_contratados.map((it, idx) => (
                                            <p key={idx} className="truncate">
                                              • {it.cantidad}x {it.piezaNombre}
                                            </p>
                                          ))}
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                          <span className="text-slate-400">Total:</span>
                                          <span className="font-bold text-[#355581]">
                                            ${(cita.monto_total || 0).toLocaleString("es-MX")} MXN
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ALTA MANUAL DE CLIENTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-[#355581]">
                Dar de alta cliente
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Teléfono / WhatsApp (10 dígitos)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="3312345678"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Correo electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Municipio
                  </label>
                  <select
                    value={newMunicipio}
                    onChange={(e) => setNewMunicipio(e.target.value as MunicipioZMG)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                  >
                    {MUNICIPIOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Histórico de gasto inicial (MXN)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newGasto}
                    onChange={(e) => setNewGasto(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Dirección y Colonia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, número exterior/interior y colonia"
                  value={newDireccion}
                  onChange={(e) => setNewDireccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-mascotas"
                  checked={newMascotas}
                  onChange={(e) => setNewMascotas(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1D71B5] focus:ring-[#36A6DE]"
                />
                <label htmlFor="new-mascotas" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Hogar con mascotas (Perro / Gato)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Notas especiales o historial anterior
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre tipo de telas, horarios o accesos..."
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#36A6DE]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#355581] hover:bg-[#1D71B5] text-white text-xs font-heading font-bold shadow-md transition-colors"
                >
                  Guardar cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-[#355581]">
                Editar cliente
              </h3>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Municipio
                  </label>
                  <select
                    value={editMunicipio}
                    onChange={(e) => setEditMunicipio(e.target.value as MunicipioZMG)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                  >
                    {MUNICIPIOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-mascotas"
                    checked={editMascotas}
                    onChange={(e) => setEditMascotas(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1D71B5] focus:ring-[#36A6DE]"
                  />
                  <label htmlFor="edit-mascotas" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Hogar con mascotas
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Dirección
                </label>
                <input
                  type="text"
                  required
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-heading font-bold text-slate-700">
                  Notas especiales
                </label>
                <textarea
                  rows={3}
                  value={editNotas}
                  onChange={(e) => setEditNotas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1D71B5] hover:bg-[#355581] text-white text-xs font-heading font-bold shadow-md transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINAR */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-800">
                ¿Eliminar cliente?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Estás a punto de eliminar a <span className="font-bold text-slate-700">{deletingClient.nombre}</span> y todo su historial de citas. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteCliente(deletingClient.id);
                  setDeletingClient(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-heading font-bold shadow-md transition-colors"
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
