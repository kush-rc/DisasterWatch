'use client';

import { useEffect, useState } from 'react';
import { useStore, ActiveView } from '@/lib/store/useStore';

export default function SituationHeader() {
  const [time, setTime] = useState('--:--:-- UTC');
  const activeView = useStore((state) => state.activeView);
  const setView = useStore((state) => state.setView);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'global', label: 'Global', icon: '◈' },
    { id: 'conflicts', label: 'Conflicts', icon: '⚡' },
    { id: 'aviation', label: 'Aviation', icon: '✈' },
    { id: 'maritime', label: 'Maritime', icon: '⚓' },
    { id: 'finance', label: 'Markets', icon: '◎' },
    { id: 'disasters', label: 'Disasters', icon: '⬡' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-[44px] bg-[var(--bg2)] border-b border-[var(--border)] flex items-center gap-0 z-[1000]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 border-r border-[var(--border)] h-full min-w-[180px]">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-[pulse_2s_ease-in-out_infinite]" />
        <span className="font-mono text-[11px] tracking-[0.15em] text-[var(--text)] uppercase">
          Situation Monitor
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center h-full flex-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`
              h-full px-[14px] flex items-center font-mono text-[10px] tracking-[0.1em] uppercase cursor-pointer border-r border-[var(--border)] transition-colors whitespace-nowrap
              ${activeView === tab.id ? 'text-[var(--accent)] bg-[rgba(0,212,170,0.06)]' : 'text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[rgba(255,255,255,0.03)]'}
            `}
          >
            <span className="mr-1.5">{tab.icon}</span> {tab.label}
          </div>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 px-3 ml-auto border-l border-[var(--border)] h-full">
        <div className="font-mono text-[11px] text-[var(--text3)] whitespace-nowrap mr-2">
          {time}
        </div>
        <button 
          className="px-2.5 py-1 border border-[var(--border2)] rounded font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--text2)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>
        <button 
          className="px-2.5 py-1 border border-[var(--border2)] rounded font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--text2)] bg-transparent cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ◐ Theme
        </button>
      </div>
    </div>
  );
}
