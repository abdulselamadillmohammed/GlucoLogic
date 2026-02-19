import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, ReactFlow, useEdgesState, useNodesState, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

interface PathwayDiagramProps {
  nodes: Node[];
  edges: Edge[];
  title: string;
  pulseKey?: string;
}

function cardStyle(): CSSProperties {
  return {
    border: "1px solid rgba(61, 169, 252, 0.26)",
    borderRadius: 14,
    padding: "8px 10px",
    minWidth: 110,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
    color: "#0F172A",
    fontSize: 12,
    fontWeight: 600
  };
}

function FloatingNode({ data }: { data: { label: string } }) {
  return (
    <div className="group relative transition-transform duration-150 hover:scale-[1.02]" style={cardStyle()}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 shadow-[0_0_30px_rgba(15,185,177,0.22)] transition-opacity duration-150 group-hover:opacity-100" />
    </div>
  );
}

const nodeTypes = { floating: FloatingNode };

export function PathwayDiagram({ nodes, edges, title, pulseKey }: PathwayDiagramProps) {
  const [pulse, setPulse] = useState(false);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    nodes.map((node) => ({ ...node, type: "floating", draggable: true, selectable: true }))
  );
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    if (!pulseKey) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 360);
    return () => window.clearTimeout(timer);
  }, [pulseKey]);

  useEffect(() => {
    setFlowNodes(nodes.map((node) => ({ ...node, type: "floating", draggable: true, selectable: true })));
  }, [nodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

  const resolvedEdges = useMemo(
    () =>
      flowEdges.map((edge) => ({
        ...edge,
        animated: true,
        style: {
          stroke: pulse ? "#0FB9B1" : "#3DA9FC",
          strokeWidth: pulse ? 2.6 : 1.8,
          strokeDasharray: "6 6"
        }
      })),
    [flowEdges, pulse]
  );

  return (
    <div className="glass-panel overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#2E3A8C]">{title}</p>
        <span className="rounded-full bg-[#EAF6FF] px-2 py-1 text-[11px] text-[#334155]">Interactive Flow</span>
      </div>
      <div className="h-[330px] rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-[#F6FBFF]">
        <ReactFlow
          nodes={flowNodes}
          edges={resolvedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          minZoom={0.7}
          maxZoom={1.2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          panOnDrag
          selectionOnDrag={false}
          nodesConnectable={false}
          elementsSelectable
          panOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          zoomOnScroll={false}
          nodeTypes={nodeTypes}
        />
      </div>
    </div>
  );
}
