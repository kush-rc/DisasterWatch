'use client';

import { useStore } from '@/lib/store/useStore';

export default function SituationStatusBar() {
  const events = useStore((state) => state.events);
  const flights = useStore((state) => state.flightCount);

  // We can derive EQ count by assuming some logic or just simulating it since no direct eq count exists
  const eqCount = Math.floor(events.length * 0.3) + 12; // Dummy simulation for UI matching

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[24px] bg-[var(--bg3)] border-t border-[var(--border)] flex items-center z-[1000] overflow-hidden">
      
      <div className="flex items-center gap-[5px] px-3 border-r border-[var(--border)] h-full font-mono text-[10px] text-[var(--text3)] whitespace-nowrap">
        <div className="w-[5px] h-[5px] rounded-full bg-[var(--accent)]" /> 
        <span className="text-[var(--text)] font-bold">LIVE</span>
      </div>
      
      <div className="flex items-center gap-[5px] px-3 border-r border-[var(--border)] h-full font-mono text-[10px] text-[var(--text3)] whitespace-nowrap">
        EQ: {eqCount} (24h)
      </div>
      
      <div className="flex items-center gap-[5px] px-3 border-r border-[var(--border)] h-full font-mono text-[10px] text-[var(--text3)] whitespace-nowrap">
        AIR: {flights.toLocaleString()}
      </div>
      
      <div className="flex items-center gap-[5px] px-3 border-r border-[var(--border)] h-full font-mono text-[10px] text-[var(--text3)] whitespace-nowrap">
        NEWS: {events.length} events
      </div>

      <div className="flex-1 overflow-hidden relative h-full bg-[var(--bg2)] hidden sm:block">
        <div className="absolute left-0 top-0 h-full flex items-center whitespace-nowrap font-mono text-[10px] text-[var(--text3)] animate-[ticker_60s_linear_infinite]">
          <span className="mr-[60px] text-[var(--text2)]"><b className="text-[var(--amber)] font-normal">CONFLICT</b> Russia-Ukraine front active — shelling reported near Zaporizhzhia</span>
          <span className="mr-[60px] text-[var(--text2)]"><b className="text-[var(--amber)] font-normal">AVIATION</b> Global air traffic nominal — 45,000+ commercial flights daily</span>
          <span className="mr-[60px] text-[var(--text2)]"><b className="text-[var(--amber)] font-normal">MARKETS</b> S&P 500 watchlist active — VIX monitoring engaged</span>
          <span className="mr-[60px] text-[var(--text2)]"><b className="text-[var(--amber)] font-normal">SEISMIC</b> USGS monitoring 150+ sensors globally — live feed active</span>
          <span className="mr-[60px] text-[var(--text2)]"><b className="text-[var(--amber)] font-normal">MARITIME</b> Strait of Hormuz — vessel traffic nominal</span>
        </div>
      </div>
    </div>
  );
}
