'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Zap, 
  MessageSquareText, 
  UserCheck, 
  DollarSign, 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Sparkles, 
  Award,
  Clock,
  CalendarCheck
} from 'lucide-react';
import { FlowNode } from '@/types/agentFlow';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  MessageSquareText,
  UserCheck,
  DollarSign,
  GitFork,
  CheckCircle2,
  XCircle,
  Truck,
  Sparkles,
  Award,
  Clock,
  CalendarCheck
};

export interface FlowNodeData extends Record<string, unknown> {
  flowNode: FlowNode;
  onEdit: (node: FlowNode) => void;
}

export const CustomFlowNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as FlowNodeData;
  const flowNode = nodeData?.flowNode;
  if (!flowNode) return null;

  const IconComponent = ICON_MAP[flowNode.icono] || MessageSquareText;
  const isMessage = flowNode.tipo === 'whatsapp_message';
  const isTrigger = flowNode.tipo === 'trigger';

  return (
    <div
      className={`w-[290px] rounded-2xl border transition-all duration-150 select-none group text-left ${
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900 shadow-2xl shadow-cyan-950/80 scale-[1.02]'
          : flowNode.enabled
          ? 'border-slate-800 hover:border-slate-600 bg-slate-900/95 hover:bg-slate-900 shadow-xl'
          : 'border-slate-800/60 bg-slate-950/80 opacity-60 hover:opacity-80'
      }`}
    >
      {/* Handle de Entrada (izquierda) si no es un Trigger inicial */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950 hover:!scale-125 !transition-transform"
        />
      )}

      {/* Header del Nodo */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              selected
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : flowNode.enabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white leading-tight truncate">
              {flowNode.titulo}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono block">
              {flowNode.tipo.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Estado Badge y Botón Editar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nodeData.onEdit(flowNode);
            }}
            className="px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-800/80 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Editar este nodo"
          >
            Editar ✎
          </button>
          <span
            className={`w-2 h-2 rounded-full ${
              flowNode.enabled ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Cuerpo del Nodo */}
      <div className="p-3.5 space-y-2">
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
          {flowNode.subtitulo}
        </p>

        {/* Previsualización del Mensaje de WhatsApp si aplica */}
        {isMessage && flowNode.mensajePlantilla && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="text-emerald-400 flex items-center gap-1">
                💬 Mensaje WhatsApp
              </span>
              {flowNode.delaySegundos !== undefined && (
                <span className="text-slate-400 flex items-center gap-0.5">
                  ⏱️ {flowNode.delaySegundos}s
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-sans line-clamp-3 leading-relaxed whitespace-pre-wrap">
              {flowNode.mensajePlantilla}
            </p>
          </div>
        )}

        {/* Sticker asignado si existe */}
        {flowNode.stickerPath && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
            <img
              src={flowNode.stickerPath}
              alt="Sticker"
              className="w-5 h-5 object-contain rounded"
            />
            <span className="truncate">Sticker Kanan adjunto</span>
          </div>
        )}
      </div>

      {/* Handle de Salida (derecha) para conectar con siguientes nodos */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950 hover:!scale-125 !transition-transform"
      />
    </div>
  );
});

CustomFlowNode.displayName = 'CustomFlowNode';
