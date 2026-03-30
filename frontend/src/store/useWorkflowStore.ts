import { create } from 'zustand';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  
  // Internal History State
  past: { nodes: Node[]; edges: Edge[] }[];
  future: { nodes: Node[]; edges: Edge[] }[];

  // Clipboard
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  copy: (nodes: Node[], edges: Edge[]) => void;
  paste: (position: { x: number; y: number }) => { nodes: Node[]; edges: Edge[] };
  cut: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] };
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  clipboard: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes: NodeChange[]) => {
    const nextNodes = applyNodeChanges(changes, get().nodes);
    // Only take snapshot for meaningful changes (like position stop or add/remove, not every drag tick)
    // Actually, reactflow's onNodesChange is called frequently. 
    // Usually we take snapshot on dragStop or manual actions.
    set({ nodes: nextNodes });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().takeSnapshot();
    const newEdges = addEdge({ 
      ...connection, 
      animated: false, 
      style: { stroke: '#1e293b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
    }, get().edges);
    set({ edges: newEdges });
  },

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past.slice(-49), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: [],
    });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...future],
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: newFuture,
    });
  },

  copy: (nodes, edges) => {
    set({ clipboard: { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) } });
  },

  paste: (_position) => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard) return { nodes, edges };

    get().takeSnapshot();

    const idMap: Record<string, string> = {};
    const newNodes = clipboard.nodes.map(node => {
      const newId = `dndnode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap[node.id] = newId;
      
      // Calculate offset based on original clipboard position vs paste position
      // For simplicity, we'll just offset them a bit from their original positions
      // or place the center of the selection at the mouse position
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 40,
          y: node.position.y + 40,
        },
        selected: true
      };
    });

    const newEdges = clipboard.edges.map(edge => ({
      ...edge,
      id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: idMap[edge.source] || edge.source,
      target: idMap[edge.target] || edge.target,
      selected: true
    }));

    // Deselect old nodes/edges
    const deselectedNodes = nodes.map(n => ({ ...n, selected: false }));
    const deselectedEdges = edges.map(e => ({ ...e, selected: false }));

    const finalNodes = [...deselectedNodes, ...newNodes];
    const finalEdges = [...deselectedEdges, ...newEdges];

    set({ nodes: finalNodes, edges: finalEdges });
    return { nodes: finalNodes, edges: finalEdges };
  },

  cut: (nodesToCut, edgesToCut) => {
    const { nodes, edges } = get();
    get().takeSnapshot();
    
    set({ clipboard: { nodes: JSON.parse(JSON.stringify(nodesToCut)), edges: JSON.parse(JSON.stringify(edgesToCut)) } });
    
    const nodeIdsToCut = new Set(nodesToCut.map(n => n.id));
    const edgeIdsToCut = new Set(edgesToCut.map(e => e.id));
    
    const finalNodes = nodes.filter(n => !nodeIdsToCut.has(n.id));
    const finalEdges = edges.filter(e => !edgeIdsToCut.has(e.id));
    
    set({ nodes: finalNodes, edges: finalEdges });
    return { nodes: finalNodes, edges: finalEdges };
  },
}));
