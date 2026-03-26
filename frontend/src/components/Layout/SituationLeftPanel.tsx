'use client';

import { useStore } from '@/lib/store/useStore';
import { TimeFilter } from '@/lib/store/useStore';
import { LayerVisibility } from '@/types';

function LayerToggle({ 
  id, 
  color, 
  label 
}: { 
  id: keyof LayerVisibility, 
  color: string, 
  label: string 
}) {
  const isActive = useStore((state) => state.layers[id as keyof LayerVisibility]);
  const toggleLayer = useStore((state) => state.toggleLayer);

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)]"
      onClick={() => toggleLayer(id)}
    >
      <div className="relative w-7 h-4 shrink-0">
        <input 
          type="checkbox" 
          className="opacity-0 w-0 h-0 absolute pointer-events-none" 
          checked={isActive} 
          readOnly 
        />
        <div 
          className={`absolute inset-0 rounded-full border transition-all duration-200 ${isActive ? 'bg-[rgba(0,212,170,0.2)] border-[var(--accent)]' : 'bg-[var(--bg3)] border-[var(--border2)]'}`}
        >
          <div 
            className={`absolute w-2.5 h-2.5 rounded-full top-[1.5px] transition-all duration-200 ${isActive ? 'translate-x-[12px] bg-[var(--accent)]' : 'left-[2px] bg-[var(--text3)]'}`} 
          />
        </div>
      </div>
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[12px] text-[var(--text2)] flex-1 select-none">{label}</span>
    </div>
  );
}

export default function SituationLeftPanel() {
  const events = useStore(state => state.events);
  const flights = useStore(state => state.flightCount);
  const ships = useStore(state => state.shipCount);
  
  // Quick active count calculation
  const layers = useStore(state => state.layers);
  const activeCount = Object.values(layers).filter(Boolean).length;

  const timeFilter = useStore(state => state.timeFilter);
  const setTimeFilter = useStore(state => state.setTimeFilter);

  return (
    <div className="w-[320px] shrink-0 bg-[var(--bg2)] border-r border-[var(--border)] flex flex-col overflow-hidden z-[100]">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text3)]">Layers</span>
        <span className="font-mono text-[10px] text-[var(--accent)]">{activeCount} active</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-[1px] bg-[var(--border)] border-b border-[var(--border)] shrink-0">
        <div className="bg-[var(--bg2)] px-3 py-2.5">
          <div className="font-mono text-[18px] font-bold text-[var(--red)]">24</div>
          <div className="text-[10px] text-[var(--text3)] tracking-[0.06em] mt-0.5 uppercase">Active Conflicts</div>
        </div>
        <div className="bg-[var(--bg2)] px-3 py-2.5">
          <div className="font-mono text-[18px] font-bold text-[var(--amber)]">{flights > 0 ? flights.toLocaleString() : '—'}</div>
          <div className="text-[10px] text-[var(--text3)] tracking-[0.06em] mt-0.5 uppercase">Live Flights</div>
        </div>
        <div className="bg-[var(--bg2)] px-3 py-2.5">
          <div className="font-mono text-[18px] font-bold text-[var(--green)]">{events.length > 0 ? events.length.toLocaleString() : '—'}</div>
          <div className="text-[10px] text-[var(--text3)] tracking-[0.06em] mt-0.5 uppercase">News Events</div>
        </div>
        <div className="bg-[var(--bg2)] px-3 py-2.5">
          <div className="font-mono text-[18px] font-bold text-[var(--text)]">{ships > 0 ? ships.toLocaleString() : '147'}</div>
          <div className="text-[10px] text-[var(--text3)] tracking-[0.06em] mt-0.5 uppercase">Vessels</div>
        </div>
      </div>

      {/* Scrollable Layers List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 m-0 custom-scrollbar">
        
        <div className="py-2 border-b border-[var(--border)]">
          <div className="px-3 pt-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text3)]">Conflict & Security</div>
          <LayerToggle id="conflict" color="#ff4455" label="Active Conflict Zones" />
          <LayerToggle id="military" color="#f5a623" label="Military Bases" />
          <LayerToggle id="nuclear" color="#9b7cff" label="Nuclear Sites" />
        </div>

        <div className="py-2 border-b border-[var(--border)]">
          <div className="px-3 pt-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text3)]">Aviation</div>
          <LayerToggle id="flights" color="#0084ff" label="Live Flights (OpenSky)" />
          <LayerToggle id="airports" color="#00d4aa" label="Major Airports" />
        </div>

        <div className="py-2 border-b border-[var(--border)]">
          <div className="px-3 pt-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text3)]">Infrastructure</div>
          <LayerToggle id="cables" color="#22dd88" label="Undersea Cables" />
          <LayerToggle id="datacenters" color="#00d4aa" label="Data Centers" />
        </div>

        <div className="py-2 border-b border-[var(--border)]">
          <div className="px-3 pt-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text3)]">Environment & Disasters</div>
          <LayerToggle id="earthquakes" color="#f5a623" label="Earthquakes (USGS)" />
          <LayerToggle id="fires" color="#ff6633" label="Active Fires (NASA)" />
        </div>

        <div className="py-2 border-b border-[var(--border)]">
          <div className="px-3 pt-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text3)]">News & Events</div>
          <LayerToggle id="news" color="#9b7cff" label="GDELT News Events" />
        </div>

        {/* Time filter */}
        <div className="p-3 border-b border-[var(--border)]">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text3)] mb-2">Time Range</div>
          <div className="flex gap-1 flex-wrap">
            {['1h', '6h', '24h', '7d'].map((tf) => (
              <button 
                key={tf}
                onClick={() => setTimeFilter(tf as TimeFilter)}
                className={`
                  h-[30px] px-2.5 bg-[rgba(10,11,13,0.85)] border rounded-[5px] font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer backdrop-blur-md transition-all whitespace-nowrap
                  ${timeFilter === tf ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,212,170,0.08)]' : 'border-[var(--border2)] text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)]'}
                `}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
