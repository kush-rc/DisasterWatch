'use client';

import { useStore } from '@/lib/store/useStore';
import { useDraggable } from '@/hooks/useDraggable';
import { useEffect, useState } from 'react';

export default function InfoPopup() {
  const infoPopup = useStore(state => state.infoPopup);
  const setInfoPopup = useStore(state => state.setInfoPopup);
  const zIndex = useStore(state => state.panelZIndex.infoPopup);
  const bringToFront = useStore(state => state.bringToFront);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { position, handleMouseDown } = useDraggable({ 
    x: mounted ? window.innerWidth / 2 - 150 : 500, 
    y: mounted ? window.innerHeight / 2 - 100 : 300 
  });

  if (!infoPopup) return null;

  return (
    <div 
      className="fixed pointer-events-auto" 
      style={{ left: position.x, top: position.y, width: '300px', zIndex }}
      onMouseDownCapture={() => bringToFront('infoPopup')}
    >
      <div className="panel p-0 overflow-hidden shadow-2xl" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {/* Header (Drag Handle) */}
        <div 
          className="flex items-center justify-between px-4 py-2 cursor-move" 
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)' }}
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
            {infoPopup.title}
          </h3>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setInfoPopup(null)}
            className="text-gray-500 hover:text-white transition-colors text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3 text-xs leading-relaxed" style={{ color: 'var(--text)' }} onMouseDown={(e) => e.stopPropagation()}>
          <div dangerouslySetInnerHTML={{ __html: infoPopup.description || 'No additional information available.' }} />
        </div>
      </div>
    </div>
  );
}
