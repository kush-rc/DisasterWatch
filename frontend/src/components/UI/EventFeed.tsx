'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

export default function EventFeed() {
  const events = useStore(state => state.events);
  const selectedEventId = useStore(state => state.selectedEventId);
  const setSelectedEventId = useStore(state => state.setSelectedEventId);
  const setDetailsPanelOpen = useStore(state => state.setDetailsPanelOpen);
  const aiBrief = useStore(state => state.aiBrief);
  const setAIBrief = useStore(state => state.setAIBrief);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [tab, setTab] = useState<'events' | 'news' | 'brief'>('events');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => setNews(data.articles || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (events.length > 0 && !aiBrief) {
      fetch('/api/ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events.slice(0, 10) }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.brief) {
            setAIBrief({
              summary: data.brief,
              timestamp: data.timestamp || new Date().toISOString(),
              activeDisasters: events.length,
              threatLevel: events.some(e => e.severity >= 4) ? 'HIGH' : 'MODERATE',
            });
          }
        })
        .catch(() => {});
    }
  }, [events, aiBrief, setAIBrief]);

  function handleEventClick(eventId: string) {
    setSelectedEventId(eventId);
    setDetailsPanelOpen(true);

    const event = events.find(e => e.id === eventId);
    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (event && event.latitude && event.longitude && viewer && Cesium) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude, event.severity * 200000),
        duration: 2,
      });
    }
  }

  const severityColors: Record<number, string> = {
    5: 'var(--red)', 4: 'var(--orange)', 3: 'var(--amber)', 2: 'var(--green)', 1: 'var(--cyan)',
  };

  // Toggle button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-20 px-3 py-2 pointer-events-auto flex items-center gap-2"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          color: 'var(--cyan)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
        }}
        title="Open Intel Feed"
      >
        INTEL FEED
        {events.length > 0 && (
          <span className="px-1 rounded text-[9px]" style={{ background: 'var(--red)', color: '#fff' }}>
            {events.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20 w-[320px] pointer-events-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
      <div className="panel flex flex-col" style={{ background: 'var(--panel)', border: '1px solid var(--border)', maxHeight: 'calc(100vh - 5rem)' }}>

        {/* Tab Bar + Close */}
        <div className="flex items-center border-b" style={{ borderColor: 'var(--border)' }}>
          {(['events', 'news', 'brief'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-[10px] tracking-widest uppercase transition-all"
              style={{
                fontFamily: 'var(--font-mono)',
                color: tab === t ? 'var(--cyan)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--cyan)' : '2px solid transparent',
                background: tab === t ? 'rgba(34,211,238,0.05)' : 'transparent',
              }}
            >
              {t === 'events' ? 'ALERTS' : t === 'news' ? 'NEWS' : 'AI BRIEF'}
            </button>
          ))}
          <button onClick={() => setIsOpen(false)} className="px-2 py-2 text-gray-500 hover:text-white text-xs">✕</button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 10rem)' }}>

          {tab === 'events' && (
            <div className="p-2 space-y-1">
              {events.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Loading disaster events...
                </p>
              )}
              {events.slice(0, 25).map(event => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="w-full text-left p-2 rounded transition-all hover:bg-white/5"
                  style={{
                    background: selectedEventId === event.id ? 'rgba(34,211,238,0.1)' : 'transparent',
                    borderLeft: '3px solid ' + (severityColors[event.severity] || 'var(--border)'),
                  }}
                >
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {event.title}
                  </p>
                  <p className="text-[10px] mt-0.5 flex items-center justify-between" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>{event.source} · {event.timeAgo}</span>
                    <span style={{ color: severityColors[event.severity] }}>S{event.severity}</span>
                  </p>
                </button>
              ))}
            </div>
          )}

          {tab === 'news' && (
            <div className="p-2 space-y-2">
              {news.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  Loading news...
                </p>
              )}
              {news.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded transition-all hover:bg-white/5"
                  style={{ borderLeft: '3px solid var(--amber)' }}
                >
                  <p className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text)' }}>
                    {article.title}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {article.source.name} · {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </a>
              ))}
            </div>
          )}

          {tab === 'brief' && (
            <div className="p-4">
              {!aiBrief ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto mb-2" />
                  <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    GENERATING AI BRIEF...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{
                      background: aiBrief.threatLevel === 'HIGH' ? 'var(--orange)' : 'var(--amber)',
                    }} />
                    <span className="text-[10px] tracking-widest uppercase" style={{
                      color: aiBrief.threatLevel === 'HIGH' ? 'var(--orange)' : 'var(--amber)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      THREAT LEVEL: {aiBrief.threatLevel}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
                    {aiBrief.summary}
                  </p>
                  <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>{aiBrief.activeDisasters} ACTIVE EVENTS</span>
                    <span>GROQ LLAMA 3.1</span>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
