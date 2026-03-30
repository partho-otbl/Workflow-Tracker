import React from 'react';
import { Circle, Square, Diamond, Play } from 'lucide-react';

const ShapeSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const shapes = [
    { type: 'input', label: 'Start Event', icon: <Circle size={18} />, color: '#22c55e' },
    { type: 'default', label: 'Process Step', icon: <Square size={18} />, color: '#3b82f6' },
    { type: 'decision', label: 'Decision', icon: <Diamond size={18} />, color: '#eab308' },
    { type: 'output', label: 'End Event', icon: <Play size={18} />, color: '#f43f5e' },
  ];

  return (
    <aside style={{ 
      width: '260px', 
      borderRight: '1px solid #e2e8f0', 
      padding: '24px', 
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Workflow Elements
      </h3>
      {shapes.map((shape) => (
        <div 
          key={shape.type}
          onDragStart={(event) => onDragStart(event, shape.type)} 
          draggable 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '12px 16px', 
            border: '1px solid #f1f5f9', 
            borderRadius: '12px', 
            cursor: 'grab', 
            background: 'white',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            transition: 'all 0.2s',
            fontWeight: 500,
            color: '#1e293b',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#f1f5f9';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ color: shape.color, display: 'flex' }}>{shape.icon}</div>
          {shape.label}
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '12px', color: '#64748b', border: '1px dashed #e2e8f0' }}>
        Drag and drop elements onto the canvas to build your workflow.
      </div>
    </aside>
  );
};

export default ShapeSidebar;
