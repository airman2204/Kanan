'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  RotateCcw,
  Plus,
  Maximize2,
  Workflow,
  Sparkles,
  Save,
  CheckCircle2,
  Send,
  HelpCircle
} from 'lucide-react';
import { FlowNode, AgentFlowConfig } from '@/types/agentFlow';
import { getAgentFlowConfig, saveAgentFlowConfig, resetAgentFlowConfig } from '@/lib/chat/flowConfigStore';
import { CustomFlowNode, FlowNodeData } from './CustomFlowNode';
import { NodeEditorDrawer } from './NodeEditorDrawer';

interface AgentFlowCanvasProps {
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const nodeTypes = {
  customNode: CustomFlowNode,
};

export const AgentFlowCanvas: React.FC<AgentFlowCanvasProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<AgentFlowConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [saveBanner, setSaveBanner] = useState(false);
  const [mostrarModalNuevoNodo, setMostrarModalNuevoNodo] = useState(false);

  // Estados nativos de React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Cargar configuración inicial
  useEffect(() => {
    const loaded = getAgentFlowConfig();
    setConfig(loaded);
  }, []);

  // Convertir config a React Flow Nodes y Edges
  const syncFlowFromConfig = useCallback((cfg: AgentFlowConfig) => {
    const flowNodesArray: Node[] = Object.values(cfg.nodos).map((n) => ({
      id: n.id,
      type: 'customNode',
      position: { x: n.x, y: n.y },
      data: {
        flowNode: n,
        onEdit: (target: FlowNode) => setSelectedNode(target),
      } as FlowNodeData,
    }));

    const flowEdgesArray: Edge[] = [];
    Object.values(cfg.nodos).forEach((sourceNode) => {
      const nextIds = sourceNode.siguienteNodoId || [];
      nextIds.forEach((targetId) => {
        if (cfg.nodos[targetId]) {
          const isActive = sourceNode.enabled && cfg.nodos[targetId].enabled;
          flowEdgesArray.push({
            id: `edge-${sourceNode.id}->${targetId}`,
            source: sourceNode.id,
            target: targetId,
            animated: isActive,
            style: {
              stroke: isActive ? '#06b6d4' : '#475569',
              strokeWidth: isActive ? 2.5 : 1.5,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isActive ? '#06b6d4' : '#475569',
              width: 14,
              height: 14,
            },
          });
        }
      });
    });

    setNodes(flowNodesArray);
    setEdges(flowEdgesArray);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (config) {
      syncFlowFromConfig(config);
    }
  }, [config, syncFlowFromConfig]);

  // Al conectar dos nodos mediante arrastre manual con el mouse (interactivo como en n8n)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!config || !params.source || !params.target) return;
      const sourceId = params.source;
      const targetId = params.target;

      const sourceNode = config.nodos[sourceId];
      if (!sourceNode) return;

      const currentNext = sourceNode.siguienteNodoId || [];
      if (!currentNext.includes(targetId)) {
        const updatedSource: FlowNode = {
          ...sourceNode,
          siguienteNodoId: [...currentNext, targetId],
        };
        const newConfig: AgentFlowConfig = {
          ...config,
          nodos: {
            ...config.nodos,
            [sourceId]: updatedSource,
          },
        };
        setConfig(newConfig);
        saveAgentFlowConfig(newConfig);
        if (onNotify) onNotify(`Conexión creada: ${sourceNode.titulo} ➔ ${config.nodos[targetId]?.titulo}`, 'success');
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
          },
          eds
        )
      );
    },
    [config, setEdges, onNotify]
  );

  // Al terminar de arrastrar un nodo, persistir sus nuevas coordenadas X, Y
  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      if (!config) return;
      const current = config.nodos[node.id];
      if (!current) return;

      const updatedNode: FlowNode = {
        ...current,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      };

      const newConfig: AgentFlowConfig = {
        ...config,
        nodos: {
          ...config.nodos,
          [node.id]: updatedNode,
        },
      };

      setConfig(newConfig);
      saveAgentFlowConfig(newConfig);
    },
    [config]
  );

  // Actualizar nodo desde el Drawer lateral
  const handleUpdateNode = (updatedNode: FlowNode) => {
    if (!config) return;
    const newConfig: AgentFlowConfig = {
      ...config,
      nodos: {
        ...config.nodos,
        [updatedNode.id]: updatedNode,
      },
    };
    setConfig(newConfig);
    saveAgentFlowConfig(newConfig);
    setSelectedNode(updatedNode);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
    if (onNotify) onNotify(`Nodo "${updatedNode.titulo}" guardado`, 'success');
  };

  // Eliminar nodo
  const handleDeleteNode = (nodeId: string) => {
    if (!config) return;
    const updated = { ...config.nodos };
    delete updated[nodeId];

    // Desvincular de otros nodos
    Object.keys(updated).forEach((key) => {
      const n = updated[key];
      if (n.siguienteNodoId && n.siguienteNodoId.includes(nodeId)) {
        updated[key] = {
          ...n,
          siguienteNodoId: n.siguienteNodoId.filter((id) => id !== nodeId),
        };
      }
    });

    const newConfig: AgentFlowConfig = {
      ...config,
      nodos: updated,
    };
    setConfig(newConfig);
    saveAgentFlowConfig(newConfig);
    setSelectedNode(null);
    if (onNotify) onNotify('Nodo eliminado con éxito', 'info');
  };

  // Restablecer a fábrica
  const handleResetFlow = () => {
    if (confirm('¿Deseas restablecer todos los nodos y textos a la versión de fábrica optimizada?')) {
      const reset = resetAgentFlowConfig();
      setConfig(reset);
      setSelectedNode(null);
      if (onNotify) onNotify('Flujo restablecido a valores por defecto', 'info');
    }
  };

  // Prueba de mensaje de WhatsApp
  const handleTestMessage = async (node: FlowNode, phone: string) => {
    if (!phone || phone.length < 10) {
      if (onNotify) onNotify('Ingresa un número de WhatsApp a 10 dígitos', 'error');
      return;
    }
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: phone,
          mensaje: `🧪 *[MODO PRUEBA - NODO AGENTE]*\n\n${node.mensajePlantilla || 'Sin texto'}`,
          stickerUrl: node.stickerPath,
        }),
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

  if (!config) return null;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
      {/* Barra de Control Superior */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Flujo del Agente Kanan
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">
                v{config.version || 4} • React Flow Engine ⚡
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Motor visual interactivo: arrastra conector circular de un nodo a otro para conectar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveBanner && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFlow}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            title="Restablecer flujo a valores de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* Lienzo Interactivo con React Flow NATIVO a 60 FPS */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-950"
        >
          {/* Fondo con matriz de puntos profesional estilo n8n */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#334155"
          />

          {/* Controles flotantes nativos (Zoom in, Zoom out, Fit view, Lock) */}
          <Controls 
            className="!bg-slate-900 !border-slate-800 !rounded-xl !overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800 [&>button:hover]:!text-white"
          />

          {/* Minimapa interactivo en la esquina inferior derecha */}
          <MiniMap
            zoomable
            pannable
            nodeColor="#06b6d4"
            maskColor="rgba(15, 23, 42, 0.75)"
            className="!bg-slate-900 !border !border-slate-800 !rounded-xl overflow-hidden !shadow-2xl"
          />
        </ReactFlow>
      </div>

      {/* Drawer Lateral de Edición de Nodo */}
      <NodeEditorDrawer
        node={selectedNode}
        allNodes={Object.values(config.nodos)}
        onClose={() => setSelectedNode(null)}
        onSave={handleUpdateNode}
        onDelete={handleDeleteNode}
        onSendTestMessage={handleTestMessage}
        testPhoneDefault={config.telefonoPruebas || '3326154699'}
      />
    </div>
  );
};
