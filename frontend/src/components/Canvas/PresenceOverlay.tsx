import React from 'react';
import type { Presence } from '../../types';
import { MousePointer2 } from 'lucide-react';

interface PresenceOverlayProps {
  presences: Record<string, Presence>;
  currentUsername?: string;
}

const PresenceOverlay: React.FC<PresenceOverlayProps> = ({ presences, currentUsername }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
      {Object.entries(presences).map(([username, presence]) => {
        if (username === currentUsername || !presence.cursor) return null;

        return (
          <div
            key={username}
            style={{
              position: 'absolute',
              left: presence.cursor.x,
              top: presence.cursor.y,
              transform: 'translate(-4px, -4px)',
              transition: 'all 0.1s linear',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
            }}
          >
            <MousePointer2 
              size={20} 
              fill={presence.color} 
              color="white" 
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))' }}
            />
            <div style={{
              background: presence.color,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
            }}>
              {presence.username}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PresenceOverlay;
