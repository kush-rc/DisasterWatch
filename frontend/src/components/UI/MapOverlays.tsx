'use client';

import { useStore } from '@/lib/store/useStore';

export default function MapOverlays() {
  const flightCount = useStore(state => state.flightCount);
  const events = useStore(state => state.events);
  const globeView = useStore(state => state.globeView);
  const setGlobeView = useStore(state => state.setGlobeView);

  // Derive EQ count (same logic as StatusBar)
  const eqCount = Math.floor(events.length * 0.3) + 12;

  return (
    <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
      
      {/* Map Toolbar (Top Left) */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
        <input 
          type="text" 
          placeholder="Search location..." 
          className="flex-1 max-w-[360px] h-[34px] px-3 bg-[rgba(10,11,13,0.85)] border border-[var(--border2)] rounded-md font-sans text-[12px] text-[var(--text)] outline-none backdrop-blur-md transition-colors focus:border-[var(--accent)] pointer-events-auto"
        />
        <button 
          onClick={() => setGlobeView('dark')}
          className={`h-[30px] px-2.5 bg-[rgba(10,11,13,0.85)] border rounded-[5px] font-mono text-[10px] tracking-[0.06em] text-[var(--text2)] uppercase cursor-pointer backdrop-blur-md transition-all whitespace-nowrap pointer-events-auto
            ${globeView === 'dark' || globeView === 'default' ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,212,170,0.08)]' : 'border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)]'}
          `}
        >
          Dark
        </button>
        <button 
          onClick={() => setGlobeView('satellite')}
          className={`h-[30px] px-2.5 bg-[rgba(10,11,13,0.85)] border rounded-[5px] font-mono text-[10px] tracking-[0.06em] text-[var(--text2)] uppercase cursor-pointer backdrop-blur-md transition-all whitespace-nowrap pointer-events-auto
            ${globeView === 'satellite' ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,212,170,0.08)]' : 'border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)]'}
          `}
        >
          Satellite
        </button>
        <button 
          onClick={() => setGlobeView('terrain')}
          className={`h-[30px] px-2.5 bg-[rgba(10,11,13,0.85)] border rounded-[5px] font-mono text-[10px] tracking-[0.06em] text-[var(--text2)] uppercase cursor-pointer backdrop-blur-md transition-all whitespace-nowrap pointer-events-auto
            ${globeView === 'terrain' ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,212,170,0.08)]' : 'border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)]'}
          `}
        >
          Topo
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-5 left-3 bg-[rgba(10,11,13,0.88)] border border-[var(--border2)] rounded-lg px-3 py-2.5 flex flex-col gap-1.5 backdrop-blur-md pointer-events-auto">
        <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text3)] mb-0.5">Legend</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0 bg-[#ff4455]" /><span className="text-[11px] text-[var(--text2)]">Conflict / Alert</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0 bg-[#f5a623]" /><span className="text-[11px] text-[var(--text2)]">Earthquake / Military</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0 bg-[#0084ff]" /><span className="text-[11px] text-[var(--text2)]">Aircraft</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0 bg-[#22dd88]" /><span className="text-[11px] text-[var(--text2)]">Infrastructure</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0 bg-[#9b7cff]" /><span className="text-[11px] text-[var(--text2)]">News Event</span></div>
      </div>

      {/* Map Stats (Bottom Right) */}
      <div className="absolute bottom-5 right-3 flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-[rgba(10,11,13,0.88)] border border-[var(--border2)] rounded-md px-3 py-2 backdrop-blur-md min-w-[130px]">
          <div className="font-mono text-[16px] font-bold text-[var(--accent)] blink">{flightCount > 0 ? flightCount.toLocaleString() : '—'}</div>
          <div className="text-[10px] text-[var(--text3)] mt-[1px] uppercase tracking-[0.06em]">↑ Live Aircraft</div>
        </div>
        <div className="bg-[rgba(10,11,13,0.88)] border border-[var(--border2)] rounded-md px-3 py-2 backdrop-blur-md min-w-[130px]">
          <div className="font-mono text-[16px] font-bold text-[var(--text)]">{eqCount || '—'}</div>
          <div className="text-[10px] text-[var(--text3)] mt-[1px] uppercase tracking-[0.06em]">⬡ Earthquakes 24h</div>
        </div>
      </div>

    </div>
  );
}
