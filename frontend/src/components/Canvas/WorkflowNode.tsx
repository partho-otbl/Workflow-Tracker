import { memo } from 'react';
import { Handle, Position, type NodeProps, NodeResizer } from 'reactflow';

const NODE_STYLES: Record<string, { bg: string, border: string, iconColor: string }> = {
  input: { bg: '#f0fdf4', border: '#22c55e', iconColor: '#166534' },     // Oval (Start)
  output: { bg: '#fff1f2', border: '#f43f5e', iconColor: '#9f1239' },    // Oval (End)
  decision: { bg: '#fefce8', border: '#eab308', iconColor: '#854d0e' },  // Diamond
  default: { bg: '#f8fafc', border: '#3b82f6', iconColor: '#1e40af' },   // Rounded Rect (Process)
};

const handleStyle = { background: '#94a3b8', width: '8px', height: '8px', border: '2px solid white', zIndex: 10 };

const WorkflowNode = ({ data, selected, type }: NodeProps) => {
  const style = NODE_STYLES[type || 'default'] || NODE_STYLES.default;
  const isDiamond = type === 'decision';
  const isOval = type === 'input' || type === 'output';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <NodeResizer 
        color="#2563eb" 
        isVisible={selected} 
        minWidth={isDiamond ? 120 : 100} 
        minHeight={isDiamond ? 120 : 60} 
        lineStyle={{ border: 'none' }}
      />
      
      <div style={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Shape Layer (SVG for precision) */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 0 
        }}>
          {isDiamond ? (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M 50 2 L 98 50 L 50 98 L 2 50 Z" 
                fill={style.bg} 
                stroke={selected ? '#2563eb' : style.border} 
                strokeWidth="2"
              />
            </svg>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: style.bg,
              border: `2px solid ${selected ? '#2563eb' : style.border}`,
              borderRadius: isOval ? '50% / 50%' : '10px',
              boxShadow: selected ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              boxSizing: 'border-box'
            }} />
          )}
        </div>

        {/* Content Layer */}
        <div style={{ 
          zIndex: 1,
          padding: isDiamond ? '25%' : '12px 18px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1e293b',
          textAlign: 'center',
          width: '100%',
          wordBreak: 'break-word',
          pointerEvents: 'none'
        }}>
          {data.label}
        </div>

        {/* Handles positioned at the tips */}
        <Handle type="target" position={Position.Top} id="t-t" style={handleStyle} />
        <Handle type="source" position={Position.Top} id="t-s" style={handleStyle} />
        
        <Handle type="target" position={Position.Bottom} id="b-t" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="b-s" style={handleStyle} />
        
        <Handle type="target" position={Position.Left} id="l-t" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="l-s" style={handleStyle} />
        
        <Handle type="target" position={Position.Right} id="r-t" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="r-s" style={handleStyle} />
      </div>
    </div>
  );
};

export default memo(WorkflowNode);
