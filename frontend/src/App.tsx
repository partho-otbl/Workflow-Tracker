import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ReactFlowProvider, 
  MarkerType,
  type Edge, 
  type Node, 
  type ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Layout, Save, Activity, LogOut, Download, Undo2, Redo2, Plus, ChevronDown, Trash2 } from 'lucide-react';
import * as api from './api';
import type { Diagram, Presence, Cursor } from './types';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import ShapeSidebar from './components/Sidebar/ShapeSidebar';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import PresenceOverlay from './components/Canvas/PresenceOverlay';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useWorkflowStore } from './store/useWorkflowStore';
import { exportToPng, exportToSvg } from './utils/export';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import './styles/global.css';

let id = 0;
const getId = () => `dndnode_${Date.now()}_${id++}`;

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4b5563'];

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, 
    setNodes, setEdges, undo, redo, takeSnapshot, copy, paste, cut
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [allDiagrams, setAllDiagrams] = useState<Diagram[]>([]);
  const [isDiagramMenuOpen, setIsDiagramMenuOpen] = useState(false);
  
  const [presences, setPresences] = useState<Record<string, Presence>>({});
  const userColor = useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

  const [isSyncing, setIsSyncing] = useState(false);
  const stompClient = useRef<Stomp.Client | null>(null);

  const broadcastChanges = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (stompClient.current?.connected && diagram) {
      stompClient.current.send(
        `/app/diagram/${diagram.id}`,
        {},
        JSON.stringify({ nodes: newNodes, edges: newEdges })
      );
    }
  }, [diagram]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;

      // Undo/Redo
      if (isMod && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
          const state = useWorkflowStore.getState();
          broadcastChanges(state.nodes, state.edges);
        } else {
          undo();
          const state = useWorkflowStore.getState();
          broadcastChanges(state.nodes, state.edges);
        }
      }
      if (isMod && event.key === 'y') {
        event.preventDefault();
        redo();
        const state = useWorkflowStore.getState();
        broadcastChanges(state.nodes, state.edges);
      }

      // Copy/Paste/Cut
      if (isMod && event.key === 'c') {
        event.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        if (selectedNodes.length > 0) {
          copy(selectedNodes, selectedEdges);
        }
      }

      if (isMod && event.key === 'v') {
        event.preventDefault();
        const { nodes: newNodes, edges: newEdges } = paste({ x: 0, y: 0 });
        broadcastChanges(newNodes, newEdges);
      }

      if (isMod && event.key === 'x') {
        event.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        if (selectedNodes.length > 0) {
          const { nodes: newNodes, edges: newEdges } = cut(selectedNodes, selectedEdges);
          broadcastChanges(newNodes, newEdges);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, undo, redo, copy, paste, cut, broadcastChanges]);

  const fetchAllDiagrams = useCallback(async () => {
    try {
      const diagrams = await api.getDiagrams();
      setAllDiagrams(diagrams);
      return diagrams;
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      return [];
    }
  }, []);

  const handleSelectDiagram = useCallback((d: Diagram) => {
    setDiagram(d);
    setPresences({}); // Clear others' cursors when switching
    const content = JSON.parse(d.content);
    setNodes(content.nodes || []);
    setEdges(content.edges || []);
    setIsDiagramMenuOpen(false);
  }, [setNodes, setEdges]);

  const handleCreateNew = useCallback(async () => {
    const name = prompt('Enter workflow name:', 'New Workflow');
    if (!name) return;
    
    try {
      const newD = await api.createDiagram({ name, content: JSON.stringify({ nodes: [], edges: [] }) });
      setAllDiagrams(prev => [newD, ...prev]);
      handleSelectDiagram(newD);
    } catch (error) {
      console.error('Error creating diagram:', error);
    }
  }, [handleSelectDiagram]);

  // Fetch initial diagram
  useEffect(() => {
    if (!user) return;
    
    const init = async () => {
      const diagrams = await fetchAllDiagrams();
      if (diagrams.length > 0) {
        handleSelectDiagram(diagrams[0]);
      } else {
        handleCreateNew();
      }
    };
    init();
  }, [user, fetchAllDiagrams, handleSelectDiagram, handleCreateNew]);

  // WebSocket Connection
  useEffect(() => {
    if (!diagram || !user) return;

    if (stompClient.current?.connected) {
      stompClient.current.disconnect(() => {});
    }

    const socket = new SockJS('http://localhost:8080/ws-workflow');
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => {};

    stompClient.current.connect({}, () => {
      setIsSyncing(true);
      
      // Subscribe to diagram updates (Nodes/Edges)
      stompClient.current?.subscribe(`/topic/diagram/${diagram.id}`, (message) => {
        const update = JSON.parse(message.body);
        if (update.nodes) setNodes(update.nodes);
        if (update.edges) setEdges(update.edges);
      });

      // Subscribe to Presence updates (Cursors)
      stompClient.current?.subscribe(`/topic/presence/${diagram.id}`, (message) => {
        const presence = JSON.parse(message.body) as Presence;
        if (presence.username !== user.username) {
          setPresences(prev => ({ ...prev, [presence.username]: presence }));
        }
      });
    });

    return () => stompClient.current?.disconnect(() => {});
  }, [diagram?.id, user, setNodes, setEdges]);

  const onMouseMove = (event: React.MouseEvent) => {
    if (!stompClient.current?.connected || !diagram || !user) return;
    
    // Throttle presence broadcast (not defined as a ref anymore to simplify, but could be)
    // For now keep it simple within the mouse move
    // Use a local ref for throttling if needed, or just broadcast
    
    if (reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const cursor: Cursor = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };

      const presence: Presence = {
        username: user.username,
        cursor,
        color: userColor
      };

      stompClient.current.send(
        `/app/presence/${diagram.id}`,
        {},
        JSON.stringify(presence)
      );
    }
  };

  const handleDeleteDiagram = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await api.deleteDiagram(id);
      const updated = allDiagrams.filter(d => d.id !== id);
      setAllDiagrams(updated);
      if (diagram?.id === id) {
        if (updated.length > 0) handleSelectDiagram(updated[0]);
        else handleCreateNew();
      }
    } catch (error) {
      console.error('Error deleting diagram:', error);
    }
  };

  const handleSave = async () => {
    if (!diagram) return;
    try {
      const content = JSON.stringify({ nodes, edges });
      await api.updateDiagram(diagram.id, { content, name: diagram.name });
      alert('Diagram saved successfully!');
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  const onUpdateNode = (nodeId: string, label: string) => {
    takeSnapshot();
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, label } };
      }
      return node;
    });
    setNodes(updatedNodes);
    broadcastChanges(updatedNodes, edges);
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const isOval = type === 'input' || type === 'output';
      const isDiamond = type === 'decision';

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
        style: { 
          width: isOval ? 120 : (isDiamond ? 120 : 150), 
          height: isOval ? 60 : (isDiamond ? 120 : 80) 
        }
      };

      takeSnapshot();
      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);
      broadcastChanges(newNodes, edges);
    },
    [reactFlowInstance, nodes, edges, setNodes, broadcastChanges, takeSnapshot]
  );

  const onUpdateEdgePattern = (edgeId: string, pattern: 'solid' | 'dotted') => {
    takeSnapshot();
    const updatedEdges = edges.map((edge) => {
      if (edge.id === edgeId) {
        return {
          ...edge,
          style: { 
            ...edge.style, 
            strokeDasharray: pattern === 'dotted' ? '5,5' : 'none' 
          }
        };
      }
      return edge;
    });
    setEdges(updatedEdges);
    broadcastChanges(nodes, updatedEdges);
  };

  const onDeleteNode = (nodeId: string) => {
    takeSnapshot();
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    broadcastChanges(updatedNodes, updatedEdges);
    setSelectedNode(null);
  };

  const onDeleteEdge = (edgeId: string) => {
    takeSnapshot();
    const updatedEdges = edges.filter(e => e.id !== edgeId);
    setEdges(updatedEdges);
    broadcastChanges(nodes, updatedEdges);
    setSelectedEdge(null);
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Activity className="animate-spin" size={48} color="#2563eb" />
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f8fafc' }}>
      <header style={{ 
        height: '72px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 32px',
        background: 'white',
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
              <Layout color="#2563eb" size={24} />
            </div>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsDiagramMenuOpen(!isDiagramMenuOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                className="hover-bg"
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                  {diagram?.name || 'Loading...'}
                </span>
                <ChevronDown size={18} color="#64748b" />
              </button>

              {isDiagramMenuOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  width: '240px', 
                  background: 'white', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  border: '1px solid #e2e8f0',
                  padding: '8px',
                  marginTop: '8px',
                  zIndex: 100
                }}>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {allDiagrams.map(d => (
                      <div 
                        key={d.id} 
                        onClick={() => handleSelectDiagram(d)}
                        style={{ 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: diagram?.id === d.id ? '#f1f5f9' : 'transparent',
                          color: diagram?.id === d.id ? '#2563eb' : '#1e293b',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                        className="menu-item"
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                        <Trash2 
                          size={14} 
                          color="#94a3b8" 
                          onClick={(e) => handleDeleteDiagram(d.id, e)}
                          className="delete-icon"
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>
                  <button 
                    onClick={handleCreateNew}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      background: '#eff6ff', 
                      color: '#2563eb', 
                      fontWeight: 600, 
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} /> New Workflow
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSyncing ? '#22c55e' : '#cbd5e1' }}></span>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
              {isSyncing ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* History */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => {
                undo();
                const state = useWorkflowStore.getState();
                broadcastChanges(state.nodes, state.edges);
              }} 
              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569' }}
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={() => {
                redo();
                const state = useWorkflowStore.getState();
                broadcastChanges(state.nodes, state.edges);
              }} 
              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569' }}
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }}></div>

          {/* Export */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => exportToPng(nodes)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', gap: '6px' }}>
              <Download size={16} /> PNG
            </button>
            <button onClick={() => exportToSvg(nodes)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', gap: '6px' }}>
              <Download size={16} /> SVG
            </button>
          </div>

          <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }}></div>

          {/* User & Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{user?.username}</span>
            </div>
            
            <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
              <Save size={18} /> Save
            </button>

            <button onClick={logout} style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ShapeSidebar />
        
        <div 
          ref={reactFlowWrapper} 
          style={{ flex: 1, position: 'relative', background: '#f8fafc' }} 
          onDrop={onDrop} 
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={onMouseMove}
        >
          <PresenceOverlay presences={presences} currentUsername={user?.username} />
          
          <ReactFlowProvider>
            <WorkflowCanvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onNodeClick={(_, n) => { setSelectedNode(n); setSelectedEdge(null); }}
              onNodeDragStart={() => takeSnapshot()}
              onNodeDragStop={() => broadcastChanges(nodes, edges)}
              onEdgeClick={(_, e) => { setSelectedEdge(e); setSelectedNode(null); }}
              onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
              onNodesDelete={(deleted) => { 
                takeSnapshot();
                const remainingNodes = nodes.filter(n => !deleted.some(d => d.id === n.id));
                const remainingEdges = edges.filter(e => !deleted.some(d => d.id === e.source || d.id === e.target));
                broadcastChanges(remainingNodes, remainingEdges); 
              }}
              onEdgesDelete={(deleted) => { 
                takeSnapshot();
                const remainingEdges = edges.filter(e => !deleted.some(d => d.id === e.id));
                broadcastChanges(nodes, remainingEdges); 
              }}
            />
          </ReactFlowProvider>
        </div>

        <PropertiesPanel 
          selectedNode={selectedNode} 
          selectedEdge={selectedEdge}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
          onUpdateEdge={(edgeId, arrow) => {
            const updated = edges.map(e => e.id === edgeId ? { ...e, markerEnd: arrow ? { type: MarkerType.ArrowClosed, color: '#1e293b' } : undefined } : e);
            setEdges(updated);
            broadcastChanges(nodes, updated);
          }}
          onUpdateEdgePattern={onUpdateEdgePattern}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
