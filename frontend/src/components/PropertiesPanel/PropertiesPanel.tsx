import React, { useState, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { Trash2, Edit3, Info, Link } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onUpdateNode: (id: string, label: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateEdge: (id: string, hasArrow: boolean) => void;
  onUpdateEdgePattern: (id: string, pattern: 'solid' | 'dotted') => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedNode, 
  selectedEdge,
  onUpdateNode, 
  onDeleteNode,
  onDeleteEdge,
  onUpdateEdge,
  onUpdateEdgePattern
}) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
    }
  }, [selectedNode]);

  if (!selectedNode && !selectedEdge) {
    return (
      <aside style={{ 
        width: '320px', 
        borderLeft: '1px solid #e2e8f0', 
        padding: '32px 24px', 
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <div style={{ marginBottom: '16px', opacity: 0.5 }}><Info size={48} /></div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>Select an element or connection to view and edit its properties.</p>
      </aside>
    );
  }

  if (selectedEdge) {
    return (
      <aside style={{ 
        width: '320px', 
        borderLeft: '1px solid #e2e8f0', 
        padding: '24px', 
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link size={18} color="#2563eb" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Connection Properties</h3>
        </div>

        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
            Flow Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>From Node</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedEdge.source}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>To Node</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedEdge.target}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Connection Style</label>
          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '8px'
          }}>
            <button 
              onClick={() => onUpdateEdge(selectedEdge.id, true)}
              style={{ 
                flex: 1,
                padding: '8px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: !!selectedEdge.markerEnd ? 'white' : 'transparent',
                color: !!selectedEdge.markerEnd ? '#2563eb' : '#64748b',
                boxShadow: !!selectedEdge.markerEnd ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Show Arrow
            </button>
            <button 
              onClick={() => onUpdateEdge(selectedEdge.id, false)}
              style={{ 
                flex: 1,
                padding: '8px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: !selectedEdge.markerEnd ? 'white' : 'transparent',
                color: !selectedEdge.markerEnd ? '#2563eb' : '#64748b',
                boxShadow: !selectedEdge.markerEnd ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Plain Line
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <button 
              onClick={() => onUpdateEdgePattern(selectedEdge.id, 'solid')}
              style={{ 
                flex: 1,
                padding: '8px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: (selectedEdge.style?.strokeDasharray === 'none' || !selectedEdge.style?.strokeDasharray) ? 'white' : 'transparent',
                color: (selectedEdge.style?.strokeDasharray === 'none' || !selectedEdge.style?.strokeDasharray) ? '#2563eb' : '#64748b',
                boxShadow: (selectedEdge.style?.strokeDasharray === 'none' || !selectedEdge.style?.strokeDasharray) ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Solid
            </button>
            <button 
              onClick={() => onUpdateEdgePattern(selectedEdge.id, 'dotted')}
              style={{ 
                flex: 1,
                padding: '8px', 
                borderRadius: '8px', 
                border: 'none', 
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedEdge.style?.strokeDasharray === '5,5' ? 'white' : 'transparent',
                color: selectedEdge.style?.strokeDasharray === '5,5' ? '#2563eb' : '#64748b',
                boxShadow: selectedEdge.style?.strokeDasharray === '5,5' ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Dotted
            </button>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={() => onDeleteEdge(selectedEdge.id)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#fff1f2', 
              color: '#e11d48', 
              border: '1.5px solid #ffe4e6', 
              borderRadius: '12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <Trash2 size={18} /> Remove Connection
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{ 
      width: '320px', 
      borderLeft: '1px solid #e2e8f0', 
      padding: '24px', 
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Edit3 size={18} color="#2563eb" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Element Properties</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Display Label</label>
        <input 
          type="text" 
          value={label} 
          onChange={(e) => {
            if (selectedNode) {
              setLabel(e.target.value);
              onUpdateNode(selectedNode.id, e.target.value);
            }
          }}
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            border: '1.5px solid #f1f5f9', 
            borderRadius: '12px',
            fontSize: '14px',
            color: '#1e293b',
            background: '#f8fafc',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        />
      </div>

      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
          System Info
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>ID</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedNode?.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Type</span>
            <span style={{ fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>{selectedNode?.type || 'standard'}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={() => selectedNode && onDeleteNode(selectedNode.id)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#fff1f2', 
            color: '#e11d48', 
            border: '1.5px solid #ffe4e6', 
            borderRadius: '12px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={18} /> Remove Element
        </button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
