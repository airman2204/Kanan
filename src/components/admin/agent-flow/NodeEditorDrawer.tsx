'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Save, 
  Power, 
  Clock, 
  Tag, 
  Image as ImageIcon, 
  Smartphone, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { FlowNode, VARIABLES_SISTEMA, STICKERS_DISPONIBLES } from '@/types/agentFlow';

interface NodeEditorDrawerProps {
  node: FlowNode | null;
  onClose: () => void;
  onSave: (updatedNode: FlowNode) => void;
  onSendTestMessage?: (node: FlowNode, phone: string) => void;
  testPhoneDefault?: string;
}

export const NodeEditorDrawer: React.FC<NodeEditorDrawerProps> = ({
  node,
  onClose,
  onSave,
  onSendTestMessage,
  testPhoneDefault = '4421234567'
}) => {
  if (!node) return null;

  const [formData, setFormData] = useState<FlowNode>({ ...node });
  const [testPhone, setTestPhone] = useState(testPhoneDefault);
  const [testSent, setTestSent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reemplazo de variables de prueba para la previsualización del celular
  const renderPreviewMessage = (text?: string) => {
    if (!text) return 'Sin mensaje configurado para este nodo.';
    let preview = text;
    VARIABLES_SISTEMA.forEach((v) => {
      preview = preview.split(v.tag).join(v.example);
    });
    return preview;
  };

  const insertVariable = (tag: string) => {
    const current = formData.mensajePlantilla || '';
    setFormData({
      ...formData,
      mensajePlantilla: current + (current.endsWith(' ') || current === '' ? '' : ' ') + tag + ' '
    });
  };

  const handleSave = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSendTest = () => {
    if (onSendTestMessage) {
      onSendTestMessage(formData, testPhone);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const isMessageNode = formData.tipo === 'whatsapp_message';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {formData.titulo}
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                formData.enabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {formData.enabled ? 'ACTIVO' : 'PAUSADO'}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{formData.subtitulo}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Cerrar panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* Toggle Activar/Pausar Nodo */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Estado de este Nodo</p>
              <p className="text-xs text-slate-400">
                {formData.enabled 
                  ? 'El agente ejecutará este mensaje/paso automáticamente.' 
                  : 'Este paso está omitido temporalmente.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Info si no es nodo de mensaje */}
        {!isMessageNode && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-200 text-xs">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-300">Nodo de Control Operativo</p>
              <p className="mt-0.5 text-blue-300/80">
                Este nodo representa una acción del administrador, un disparador web o una bifurcación de decisión lógica. No envía mensajes de texto directamente al cliente.
              </p>
            </div>
          </div>
        )}

        {/* Configuración de Mensaje de WhatsApp */}
        {isMessageNode && (
          <>
            {/* Editor de Plantilla */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Plantilla de Mensaje (WhatsApp)
                </label>
                <span className="text-[11px] text-slate-400">
                  Usa *asteriscos* para negrita
                </span>
              </div>

              {/* Botones de Variables Disponibles */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400 font-medium">
                  Variables dinámicas (haz clic para insertar):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES_SISTEMA.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-800/40 hover:border-cyan-500 transition-all flex items-center gap-1 active:scale-95"
                      title={`Ejemplo: ${v.example}`}
                    >
                      <span className="text-cyan-400 font-bold">+</span>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={formData.mensajePlantilla || ''}
                onChange={(e) => setFormData({ ...formData, mensajePlantilla: e.target.value })}
                rows={7}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3.5 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all leading-relaxed"
                placeholder="Escribe el mensaje aquí..."
              />
            </div>

            {/* Configuración de Retardo Antispam */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Retardo Natural Antispam (Simulación de escritura)
                </label>
                <span className="text-xs font-bold text-amber-400">
                  {formData.delaySegundos || 2} segundos
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={formData.delaySegundos || 2}
                onChange={(e) => setFormData({ ...formData, delaySegundos: parseInt(e.target.value) || 0 })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0s (Inmediato)</span>
                <span>3s (Recomendado)</span>
                <span>10s (Pausado)</span>
              </div>
            </div>

            {/* Selector de Sticker */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Sticker de Mascota Kanan
              </label>

              {formData.stickerCategoriaEspecifica ? (
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Sticker Inteligente Activado:</strong> Este paso selecciona automáticamente el perro con Sala, Colchón, Auto o Tapete según el servicio del cliente.
                  </span>
                </div>
              ) : null}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stickerPath: undefined })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                    !formData.stickerPath 
                      ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-500' 
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">🚫</span>
                  <span className="font-semibold text-center">Sin Sticker</span>
                </button>

                {STICKERS_DISPONIBLES.map((stk) => {
                  const isSelected = formData.stickerPath === stk.path;
                  return (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, stickerPath: stk.path })}
                      className={`relative p-2 rounded-lg border text-left text-xs transition-all flex flex-col items-center gap-1.5 ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-500' 
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <img 
                        src={stk.path} 
                        alt={stk.nombre} 
                        className="w-14 h-14 object-contain rounded-md bg-white/5 border border-slate-800"
                      />
                      <span className="text-[10px] text-center line-clamp-1 font-medium">{stk.nombre}</span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulador de Celular en Vivo */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Previsualización en Vivo de WhatsApp
              </label>

              <div className="rounded-2xl bg-gradient-to-b from-[#111b21] to-[#0c1317] border border-slate-800 p-4 shadow-xl">
                {/* Header celular */}
                <div className="flex items-center gap-3 pb-3 border-b border-emerald-950/40 mb-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                    K
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">Kanan Limpieza</p>
                    <p className="text-[10px] text-emerald-400">Cuenta Oficial de Empresa</p>
                  </div>
                </div>

                {/* Sticker Mockup si existe */}
                {formData.stickerPath && (
                  <div className="flex justify-start mb-2 animate-in fade-in zoom-in-95">
                    <div className="p-1 rounded-xl bg-emerald-950/40 border border-emerald-800/40 shadow-md">
                      <img 
                        src={formData.stickerPath} 
                        alt="Sticker Preview" 
                        className="w-28 h-28 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Bubble de Mensaje de WhatsApp */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#005c4b] text-white p-3 text-xs leading-relaxed shadow-md whitespace-pre-wrap font-sans">
                    {renderPreviewMessage(formData.mensajePlantilla)}
                    <div className="text-[9px] text-emerald-200/60 text-right mt-1">
                      12:45 p. m. ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prueba en WhatsApp real */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                Enviar Prueba a mi WhatsApp
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Ej. 4421234567 (10 dígitos)"
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={testSent}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  {testSent ? <Check className="w-4 h-4 text-emerald-300" /> : <Send className="w-3.5 h-3.5" />}
                  {testSent ? '¡Enviado!' : 'Probar'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Acciones */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {saveSuccess ? '¡Guardado con éxito!' : 'Guardar Cambios de este Nodo'}
        </button>
      </div>
    </div>
  );
};
