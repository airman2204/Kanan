'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Move,
  Clock,
  Layers,
  CalendarCheck
} from 'lucide-react';
import { FlowNode, FlowNodeType, AgentFlowConfig } from '@/types/agentFlow';
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
  Award,
  Clock,
  CalendarCheck
};

export const AgentFlowCanvas: React.FC<AgentFlowCanvasProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<AgentFlowConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [saveBanner, setSaveBanner] = useState(false);
  const [mostrarModalNuevoNodo, setMostrarModalNuevoNodo] = useState(false);

  // Estado del Panning (Arrastrar el lienzo infinito sin scrollbars)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 30, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const nodeDragMovedRef = useRef(false);

  // Arrastre individual de un nodo para reposicionarlo libremente
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragNodeStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number }>({
    mouseX: 0,
    mouseY: 0,
    nodeX: 0,
    nodeY: 0
  });

  useEffect(() => {
    setConfig(getAgentFlowConfig());
  }, []);

  if (!config) return null;

  const nodes = Object.values(config.nodos);

  // Manejador del zoom con la rueda del mouse (Scroll para acercar/alejar)
  const handleWheelCanvas = (e: React.WheelEvent) => {
    // Si se está scrolleando dentro de un drawer o modal, ignorar
    if ((e.target as HTMLElement).closest('.overflow-y-auto')) return;
    e.preventDefault();

    const zoomFactor = 0.0015;
    const delta = -e.deltaY * zoomFactor;
    setZoomLevel((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.35), 1.8);
      return Math.round(newZoom * 100) / 100;
    });
  };

  // Manejadores de Panning del Lienzo (Arrastrar fondo con mouse o touch)
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Si se hace clic directo en el fondo del lienzo o svg
    if ((e.target as HTMLElement).closest('.flow-node-card')) return;
    setIsPanning(true);
    hasMovedRef.current = false;
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    };
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId && config) {
      // Moviendo nodo individual
      const dx = (e.clientX - dragNodeStartRef.current.mouseX) / zoomLevel;
      const dy = (e.clientY - dragNodeStartRef.current.mouseY) / zoomLevel;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        nodeDragMovedRef.current = true;
      }
      const node = config.nodos[draggingNodeId];
      if (node && nodeDragMovedRef.current) {
        const newX = Math.round(dragNodeStartRef.current.nodeX + dx);
        const newY = Math.round(dragNodeStartRef.current.nodeY + dy);
        setConfig({
          ...config,
          nodos: {
            ...config.nodos,
            [draggingNodeId]: {
              ...node,
              x: Math.max(10, newX),
              y: Math.max(10, newY)
            }
          }
        });
      }
      return;
    }

    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x - panOffset.x;
    const dy = e.clientY - panStartRef.current.y - panOffset.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handleMouseUpCanvas = () => {
    if (draggingNodeId && config) {
      if (nodeDragMovedRef.current) {
        saveAgentFlowConfig(config);
      }
      setDraggingNodeId(null);
    }
    setIsPanning(false);
  };

  // Iniciar arrastre de nodo individual
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowNode) => {
    e.stopPropagation();
    nodeDragMovedRef.current = false;
    setDraggingNodeId(node.id);
    dragNodeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: node.x,
      nodeY: node.y
    };
  };

  const handleSelectNode = (node: FlowNode) => {
    // Si no hubo desplazamiento significativo del mouse, abrir drawer
    if (!nodeDragMovedRef.current && !hasMovedRef.current) {
      setSelectedNode(node);
    }
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
      onNotify(`Nodo "${updatedNode.titulo}" guardado`, 'success');
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    const updated = { ...config.nodos };
    delete updated[nodeId];
    // Desvincular de otros nodos
    Object.keys(updated).forEach((key) => {
      const n = updated[key];
      if (n.siguienteNodoId) {
        n.siguienteNodoId = n.siguienteNodoId.filter((id) => id !== nodeId);
      }
    });

    const newConfig = { ...config, nodos: updated };
    setConfig(newConfig);
    saveAgentFlowConfig(newConfig);
    setSelectedNode(null);
    if (onNotify) onNotify('Nodo eliminado del flujo', 'info');
  };

  const handleAddNewNode = (tipo: FlowNodeType, titulo: string, conectarDesdeId?: string) => {
    const id = `nodo_${Date.now()}`;
    let nuevoX = 300;
    let nuevoY = 200;

    // Colocar a la derecha del último nodo o del seleccionado
    if (conectarDesdeId && config.nodos[conectarDesdeId]) {
      const origen = config.nodos[conectarDesdeId];
      nuevoX = origen.x + 340;
      nuevoY = origen.y;
    } else if (nodes.length > 0) {
      const last = nodes[nodes.length - 1];
      nuevoX = last.x + 340;
      nuevoY = last.y;
    }

    const nuevoNodo: FlowNode = {
      id,
      tipo,
      titulo,
      subtitulo: 'Nuevo paso configurable del flujo',
      icono: tipo === 'whatsapp_message' ? 'MessageSquareText' : tipo === 'decision' ? 'GitFork' : 'UserCheck',
      enabled: true,
      x: nuevoX,
      y: nuevoY,
      delaySegundos: 2,
      siguienteNodoId: [],
      mensajePlantilla: tipo === 'whatsapp_message' ? 'Hola *{nombre}*, te informamos lo siguiente...' : undefined
    };

    const updatedNodos = {
      ...config.nodos,
      [id]: nuevoNodo
    };

    // Conectar si se seleccionó origen
    if (conectarDesdeId && updatedNodos[conectarDesdeId]) {
      const origen = updatedNodos[conectarDesdeId];
      origen.siguienteNodoId = [...(origen.siguienteNodoId || []), id];
    }

    const newConfig: AgentFlowConfig = {
      ...config,
      nodos: updatedNodos
    };

    setConfig(newConfig);
    saveAgentFlowConfig(newConfig);
    setSelectedNode(nuevoNodo);
    setMostrarModalNuevoNodo(false);
    if (onNotify) onNotify(`Nuevo nodo "${titulo}" creado con éxito`, 'success');
  };

  const handleResetFlow = () => {
    if (confirm('¿Deseas restablecer todos los textos y stickers del flujo a los valores iniciales de fábrica?')) {
      const reset = resetAgentFlowConfig();
      setConfig(reset);
      setSelectedNode(null);
      setPanOffset({ x: 30, y: 40 });
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

        const startX = sourceNode.x + 280;
        const startY = sourceNode.y + 70;
        const endX = targetNode.x;
        const endY = targetNode.y + 70;

        const deltaX = Math.max(endX - startX, 60);
        const cp1X = startX + deltaX * 0.45;
        const cp1Y = startY;
        const cp2X = endX - deltaX * 0.45;
        const cp2Y = endY;

        const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
        const isActive = sourceNode.enabled && targetNode.enabled;

        return (
          <g key={`${sourceNode.id}->${targetId}`}>
            <path
              d={pathData}
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d={pathData}
              fill="none"
              stroke={isActive ? '#06b6d4' : '#475569'}
              strokeWidth={isActive ? '2.5' : '1.5'}
              strokeDasharray={isActive ? 'none' : '4 4'}
              className={isActive ? 'transition-all duration-300' : 'opacity-50'}
            />
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

          {/* Botón para Añadir Nodo */}
          <button
            type="button"
            onClick={() => setMostrarModalNuevoNodo(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Nodo</span>
          </button>
        </div>

        {/* Controles de Vista y Panning */}
        <div className="flex items-center gap-2">
          {saveBanner && (
            <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
              <Save className="w-3.5 h-3.5" /> Guardado
            </span>
          )}

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rueda del mouse: Zoom | Arrastra fondo: Mover lienzo | Arrastra nodo: Reorganizar</span>
          </div>

          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 30, y: 40 });
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors ml-0.5"
              title="Centrar y zoom normal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetFlow}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
            title="Restablecer flujo a valores de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* Área del Lienzo Interactivo con Panning Arrastrable (Sin Barras de Scroll) */}
      <div 
        onWheel={handleWheelCanvas}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
        className={`relative flex-1 overflow-hidden select-none bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:28px_28px] ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
          style={{ 
            width: '4500px', 
            height: '2500px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
          }}
        >
          {/* Capa de Cables SVG Bézier */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {renderConnections()}
          </svg>

          {/* Capa de Nodos estilo n8n */}
          {nodes.map((n) => {
            const IconComponent = ICON_MAP[n.icono] || MessageSquareText;
            const isSelected = selectedNode?.id === n.id;
            const isMessage = n.tipo === 'whatsapp_message';
            const isDragging = draggingNodeId === n.id;

            return (
              <div
                key={n.id}
                onMouseDown={(e) => handleNodeMouseDown(e, n)}
                onClick={() => handleSelectNode(n)}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  width: '280px'
                }}
                className={`flow-node-card absolute z-10 cursor-move rounded-2xl border transition-all duration-150 group ${
                  isDragging
                    ? 'shadow-2xl shadow-cyan-500/50 scale-[1.04] ring-2 ring-cyan-400 bg-slate-900 border-cyan-400 z-30'
                    : isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900 shadow-2xl shadow-cyan-950/60 scale-[1.02] z-20'
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

                  {/* Estado Badge y Botón Editar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(n);
                      }}
                      className="px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-800/80 text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                      title="Editar este nodo"
                    >
                      Editar ✎
                    </button>
                    <span className={`w-2 h-2 rounded-full ${
                      n.enabled ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-600'
                    }`} />
                  </div>
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
                      <span>Retardo:</span>
                      <span className="font-mono text-amber-400 font-semibold">{n.delaySegundos || 2}s</span>
                    </div>
                  )}
                </div>

                {/* Puertos de Conexión estilo n8n */}
                {n.tipo !== 'trigger' && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 shadow group-hover:scale-125 transition-transform" />
                )}
                {n.siguienteNodoId && n.siguienteNodoId.length > 0 && (
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 shadow group-hover:scale-125 transition-transform" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para Crear Nuevo Nodo */}
      {mostrarModalNuevoNodo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Añadir Nuevo Nodo al Flujo</h3>
              </div>
              <button 
                onClick={() => setMostrarModalNuevoNodo(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Selecciona el tipo de nodo que deseas incorporar a la secuencia del agente:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleAddNewNode('whatsapp_message', 'Nuevo Mensaje WhatsApp', selectedNode?.id)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500 text-left transition flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mensaje de WhatsApp con Sticker</h4>
                  <p className="text-[11px] text-slate-400">Envía un texto personalizado con variables y sticker a tu cliente.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAddNewNode('decision', 'Nueva Decisión / Filtro', selectedNode?.id)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500 text-left transition flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bifurcación / Decisión Lógica</h4>
                  <p className="text-[11px] text-slate-400">Divide el flujo según la respuesta del cliente (Sí / No / Opción).</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAddNewNode('admin_action', 'Paso Operativo Admin', selectedNode?.id)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500 text-left transition flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Acción de Administrador o Técnico</h4>
                  <p className="text-[11px] text-slate-400">Espera validación manual antes de continuar el flujo.</p>
                </div>
              </button>
            </div>

            {selectedNode && (
              <p className="text-[11px] text-cyan-400/90 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40">
                🔗 Se conectará automáticamente después del nodo: <strong>{selectedNode.titulo}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Drawer Lateral de Edición de Nodo */}
      <NodeEditorDrawer
        node={selectedNode}
        allNodes={nodes}
        onClose={() => setSelectedNode(null)}
        onSave={handleUpdateNode}
        onDelete={handleDeleteNode}
        onSendTestMessage={handleTestMessage}
        testPhoneDefault={config.telefonoPruebas}
      />
    </div>
  );
};
