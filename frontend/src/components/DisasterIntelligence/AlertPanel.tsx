'use client';

import { useStore } from '@/lib/store/useStore';

export default function AlertPanel() {
  const detailsPanelOpen = useStore(state => state.detailsPanelOpen);
  const selectedEventId = useStore(state => state.selectedEventId);
  const events = useStore(state => state.events);
  const setDetailsPanelOpen = useStore(state => state.setDetailsPanelOpen);

  if (!detailsPanelOpen || !selectedEventId) return null;

  const event = events.find(e => e.id === selectedEventId);
  if (!event) return null;

  // Severity color mapping
  const getSeverityColor = (sev: number) => {
    switch(sev) {
      case 5: return 'var(--red)';
      case 4: return 'var(--orange)';
      case 3: return 'var(--amber)';
      case 2: return 'var(--green)';
      default: return 'var(--cyan)';
    }
  };

  const color = getSeverityColor(event.severity);

  return (
    <div 
      className="absolute right-0 z-20 pointer-events-auto bg-secondary border-l border-subtle shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" 
      style={{ top: 'var(--navbar-height)', width: '380px', height: 'calc(100dvh - var(--navbar-height))' }}
    >
      <div 
        className="flex flex-col h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b cursor-default shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--tertiary)' }}>
          <span className="text-[11px] font-medium text-faint uppercase tracking-widest">Details</span>
          <button 
            onClick={() => setDetailsPanelOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 transition-colors"
            title="Close details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1">
          <div className="p-4" style={{ borderTop: '3px solid ' + color }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`, color: color }}>
                  {event.category}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`, color: color }}>
                  S{event.severity}
                </span>
              </div>
            </div>
            
            <h2 className="text-lg font-bold leading-tight mb-4 font-sans text-foreground">
              {event.title}
            </h2>
          </div>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setDetailsPanelOpen(false)}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0 mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-sm text-foreground" onMouseDown={(e) => e.stopPropagation()}>
          <p className="leading-relaxed opacity-90">{event.summary}</p>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-2 bg-black/40 rounded border border-white/5">
              <span className="block text-[10px] uppercase opacity-60 mb-1">Time</span>
              <span className="text-xs">{event.timeAgo}</span>
            </div>
            <div className="p-2 bg-black/40 rounded border border-white/5">
              <span className="block text-[10px] uppercase opacity-60 mb-1">Coordinates</span>
              <span className="text-xs">{event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* ML Actions Banner */}
        <div className="p-3 mx-4 mb-4 rounded bg-black/40 border border-white/10" onMouseDown={(e) => e.stopPropagation()}>
          <p className="text-[10px] uppercase tracking-wider mb-2 font-mono text-muted">
            Intelligence Suite Integrations
          </p>
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded group hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan)' }}>
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/></svg>
                RUN ML FLOOD PREDICTOR
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
            <button className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded group hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>
                GET SENTINEL-2 IMAGERY
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
