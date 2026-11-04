'use client';

import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Save,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { FlowNode, AgentFlowConfig } from '@/types/agentFlow';
import { getAgentFlowConfig, saveAgentFlowConfig, resetAgentFlowConfig } from '@/lib/chat/flowConfigStore';
import { NodeEditorDrawer } from './NodeEditorDrawer';

interface AgentFlowCanvasProps {
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

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
  Award
};

export const AgentFlowCanvas: React.FC<AgentFlowCanvasProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<AgentFlowConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [saveBanner, setSaveBanner] = useState(false);

  useEffect(() => {
    setConfig(getAgentFlowConfig());
  }, []);

  if (!config) return null;

  const nodes = Object.values(config.nodos);

  const handleSelectNode = (node: FlowNode) => {
    setSelectedNode(node);
  };

  const handleUpdateNode = (updatedNode: FlowNode) => {
    const updatedNodos = {
      ...config.nodos,
      [updatedNode.id]: updatedNode
    };
    const newConfig: AgentFlowConfig = {
      ...config,
      nodos: updatedNodos
    };
    setConfig(newConfig);
    saveAgentFlowConfig(newConfig);
    setSelectedNode(updatedNode);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
    if (onNotify) {
      onNotify(`Nodo "${updatedNode.titulo}" actualizado correctamente`, 'success');
    }
  };

  const handleResetFlow = () => {
    if (confirm('¿Deseas restablecer todos los textos y stickers del flujo a los valores iniciales de fábrica?')) {
      const reset = resetAgentFlowConfig();
      setConfig(reset);
      setSelectedNode(null);
      if (onNotify) {
        onNotify('Flujo restablecido a los valores por defecto', 'info');
      }
    }
  };

  const handleTestMessage = async (node: FlowNode, phone: string) => {
    if (!phone || phone.length < 10) {
      if (onNotify) onNotify('Por favor ingresa un número de WhatsApp a 10 dígitos', 'error');
      return;
    }
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: phone,
          mensaje: `🧪 *[MODO PRUEBA - NODO AGENTE]*\n\n${node.mensajePlantilla || 'Sin texto'}`,
          stickerUrl: node.stickerPath
        })
      });
      if (res.ok) {
        if (onNotify) onNotify(`Mensaje de prueba enviado al WhatsApp: ${phone}`, 'success');
      } else {
        if (onNotify) onNotify('No se pudo enviar la prueba. Verifica el estado del chat-bridge.', 'error');
      }
    } catch {
      if (onNotify) onNotify('Error de conexión al enviar mensaje de prueba', 'error');
    }
  };

  // Cálculo de cables curvos SVG (Bézier curves) entre nodos
  const renderConnections = () => {
    return nodes.flatMap((sourceNode) => {
      const nextIds = sourceNode.siguienteNodoId || [];
      return nextIds.map((targetId) => {
        const targetNode = config.nodos[targetId];
        if (!targetNode) return null;

        // Coordenadas relativas
        const startX = sourceNode.x + 280; // extremo derecho de tarjeta (ancho ~280px)
        const startY = sourceNode.y + 70;  // punto medio vertical
        const endX = targetNode.x;         // extremo izquierdo de tarjeta destino
        const endY = targetNode.y + 70;

        const deltaX = Math.max(endX - startX, 80);
        const cp1X = startX + deltaX * 0.45;
        const cp1Y = startY;
        const cp2X = endX - deltaX * 0.45;
        const cp2Y = endY;

        const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
        const isActive = sourceNode.enabled && targetNode.enabled;

        return (
          <g key={`${sourceNode.id}->${targetId}`}>
            {/* Cable de fondo grueso para sombra */}
            <path
              d={pathData}
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Cable principal de datos */}
            <path
              d={pathData}
              fill="none"
              stroke={isActive ? '#06b6d4' : '#475569'}
              strokeWidth={isActive ? '2.5' : '1.5'}
              strokeDasharray={isActive ? 'none' : '4 4'}
              className={isActive ? 'transition-all duration-300' : 'opacity-50'}
            />
            {/* Punto indicador de dirección */}
            <circle
              cx={(startX + endX) / 2}
              cy={(startY + endY) / 2}
              r={isActive ? 3.5 : 2}
              fill={isActive ? '#22d3ee' : '#64748b'}
            />
          </g>
        );
      });
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0b0f19] select-none overflow-hidden">
      {/* Barra de herramientas superior del lienzo estilo n8n */}
      <div className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Flujo Autónomo Kanan Bot v{config.version}
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            Haz clic en cualquier nodo para personalizar sus mensajes y stickers
          </span>
        </div>

        {/* Controles de Vista y Acciones */}
        <div className="flex items-center gap-2">
          {saveBanner && (
            <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
              <Save className="w-3.5 h-3.5" /> Cambios guardados
            </span>
          )}

          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors ml-0.5"
              title="Zoom normal 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetFlow}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
            title="Restablecer textos a valores originales"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* Área del Lienzo Interactivo con Patrón de Cuadrícula Dot-Grid */}
      <div 
        className="relative flex-1 overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] p-6"
        style={{ minHeight: '600px' }}
      >
        <div 
          className="relative transition-transform duration-100 origin-top-left"
          style={{ 
            width: '3100px', 
            height: '650px',
            transform: `scale(${zoomLevel})`
          }}
        >
          {/* Capa de Cables SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {renderConnections()}
          </svg>

          {/* Capa de Nodos estilo n8n */}
          {nodes.map((n) => {
            const IconComponent = ICON_MAP[n.icono] || MessageSquareText;
            const isSelected = selectedNode?.id === n.id;
            const isMessage = n.tipo === 'whatsapp_message';

            return (
              <div
                key={n.id}
                onClick={() => handleSelectNode(n)}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  width: '280px'
                }}
                className={`absolute z-10 cursor-pointer rounded-2xl border transition-all duration-200 group ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900 shadow-2xl shadow-cyan-950/60 scale-[1.02]'
                    : n.enabled
                    ? 'border-slate-800 hover:border-slate-600 bg-slate-900/95 hover:bg-slate-900 shadow-xl'
                    : 'border-slate-800/60 bg-slate-950/80 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Header del Nodo */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                        : n.enabled 
                        ? 'bg-slate-800 text-cyan-400 border-slate-700' 
                        : 'bg-slate-800/40 text-slate-500 border-slate-800'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        {n.titulo}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.tipo.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <span className={`w-2 h-2 rounded-full ${
                    n.enabled ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-600'
                  }`} />
                </div>

                {/* Contenido / Vista previa del Nodo */}
                <div className="p-3 space-y-2.5">
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {n.mensajePlantilla || n.subtitulo}
                  </p>

                  {/* Sticker Preview Miniatura si tiene */}
                  {isMessage && n.stickerPath && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <img 
                        src={n.stickerPath} 
                        alt="Sticker" 
                        className="w-7 h-7 rounded object-contain bg-white/5 border border-slate-800"
                      />
                      <span className="text-[10px] text-cyan-300 font-medium truncate">
                        {n.stickerCategoriaEspecifica ? 'Sticker Dinámico' : 'Sticker Asignado'}
                      </span>
                    </div>
                  )}

                  {/* Delay Antispam */}
                  {isMessage && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Retardo antispam:</span>
                      <span className="font-mono text-amber-400 font-semibold">{n.delaySegundos || 2}s</span>
                    </div>
                  )}
                </div>

                {/* Puertos de Conexión estilo n8n */}
                {/* Puerto de Entrada (Izquierda) */}
                {n.tipo !== 'trigger' && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 shadow group-hover:scale-125 transition-transform" />
                )}
                {/* Puerto de Salida (Derecha) */}
                {n.siguienteNodoId && n.siguienteNodoId.length > 0 && (
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 shadow group-hover:scale-125 transition-transform" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer Lateral de Edición de Nodo */}
      <NodeEditorDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSave={handleUpdateNode}
        onSendTestMessage={handleTestMessage}
        testPhoneDefault={config.telefonoPruebas}
      />
    </div>
  );
};
