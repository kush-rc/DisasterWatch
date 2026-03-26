'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';

type RTab = 'news' | 'signals' | 'alerts';

export default function SituationRightPanel() {
  const [activeTab, setActiveTab] = useState<RTab>('news');
  const events = useStore((state) => state.events);

  return (
    <div className="w-[320px] shrink-0 bg-[var(--bg2)] border-l border-[var(--border)] flex flex-col overflow-hidden z-[100]">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] shrink-0">
        {(['news', 'signals', 'alerts'] as RTab[]).map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-1 pt-2.5 pb-2 text-center font-mono text-[9px] tracking-[0.1em] uppercase cursor-pointer border-r border-[var(--border)] transition-all last:border-r-0
              ${activeTab === tab ? 'text-[var(--accent)] bg-[rgba(0,212,170,0.05)]' : 'text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[rgba(255,255,255,0.02)]'}
            `}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* News Tab */}
        <div className={activeTab === 'news' ? 'block' : 'hidden'}>
          {events.length === 0 ? (
            <div className="p-5 text-center font-mono text-[10px] text-[var(--text3)] blink">
              ◉ Fetching live feeds...
            </div>
          ) : (
            <div>
              {events.map((evt, i) => (
                <div 
                  key={evt.id || i}
                  className="px-3 py-2.5 border-b border-[var(--border)] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                  onClick={() => evt.sourceUrl && window.open(evt.sourceUrl, '_blank')}
                >
                  <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text3)] mb-1 flex items-center gap-1.5">
                    <div className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--purple)' }} />
                    {evt.source || 'GDELT'}
                  </div>
                  <div className="text-[12px] text-[var(--text)] leading-[1.45] font-medium mb-1">
                    {evt.title}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--text3)] flex justify-between">
                    <span>{evt.location}</span>
                    <span>{evt.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signals Tab */}
        <div className={activeTab === 'signals' ? 'block' : 'hidden'}>
          <div className="p-3">
            {[
              { title: 'GPS Jamming Detected', meta: 'Baltic Sea region', val: 'V-HIGH', c: 'red', icon: '⚡' },
              { title: 'Seismic Anomaly', meta: 'Ring of Fire sensors', val: 'ELEVATED', c: 'amber', icon: '⬡' },
              { title: 'Airspace Closure', meta: 'Middle East FIR', val: 'ACTIVE', c: 'blue', icon: '✈' },
              { title: 'Undersea Cable Cut', meta: 'Red Sea corridor', val: 'CRITICAL', c: 'red', icon: '⚓' },
            ].map((sig, i) => (
              <div key={i} className="py-2 border-b border-[var(--border)] flex items-start gap-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[11px] shrink-0 mt-[1px]
                  ${sig.c === 'red' ? 'bg-[rgba(255,68,85,0.15)] text-[var(--red)]' : 
                    sig.c === 'amber' ? 'bg-[rgba(245,166,35,0.15)] text-[var(--amber)]' : 
                    'bg-[rgba(0,132,255,0.15)] text-[var(--accent2)]'}
                `}>
                  {sig.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[var(--text)] font-medium mb-[2px]">{sig.title}</div>
                  <div className="font-mono text-[9px] text-[var(--text3)] tracking-[0.06em]">{sig.meta}</div>
                </div>
                <div className="font-mono text-[11px] font-bold text-right whitespace-nowrap">
                  {sig.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Tab */}
        <div className={activeTab === 'alerts' ? 'block' : 'hidden'}>
          <div className="p-2">
            {[
              { level: 'CRITICAL', title: 'M7.2 Earthquake', text: 'Off the coast of Taiwan. Tsunami warning issued for Okinawa prefix.', time: '04:12 UTC', clazz: 'critical' },
              { level: 'WARNING', title: 'Political Tension', text: 'Rising tensions in South China Sea following naval maneuvers.', time: '02:45 UTC', clazz: 'warning' },
              { level: 'INFO', title: 'System Update', text: 'Satellite feed synchronization complete. Latency normal.', time: '00:00 UTC', clazz: 'info' }
            ].map((al, i) => (
              <div 
                key={i} 
                className={`
                  m-2 p-2.5 rounded-md border-l-[3px] 
                  ${al.clazz === 'critical' ? 'bg-[rgba(255,68,85,0.08)] border-l-[var(--red)]' : 
                    al.clazz === 'warning' ? 'bg-[rgba(245,166,35,0.08)] border-l-[var(--amber)]' : 
                    'bg-[rgba(0,132,255,0.08)] border-l-[var(--accent2)]'}
                `}
              >
                <div className={`font-mono text-[9px] tracking-[0.1em] uppercase font-bold mb-1 
                  ${al.clazz === 'critical' ? 'text-[var(--red)]' : 
                    al.clazz === 'warning' ? 'text-[var(--amber)]' : 
                    'text-[var(--accent2)]'}
                `}>
                  {al.level}
                </div>
                <div className="text-[12px] text-[var(--text)] font-medium mb-1">{al.title}</div>
                <div className="text-[12px] text-[var(--text)] line-clamp-3 leading-[1.4]">{al.text}</div>
                <div className="font-mono text-[9px] text-[var(--text3)] mt-1">{al.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
