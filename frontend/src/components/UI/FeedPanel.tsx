'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';

const CATEGORIES = ['Conflict', 'Political', 'Humanitarian', 'Economic', 'Disaster'] as const;
type Category = typeof CATEGORIES[number];

interface FeedEvent {
  id: string;
  title: string;
  location: string;
  category: Category;
  severity: number;
  timeAgo: string;
}

const getCategoryStyle = (cat: string) => {
  switch (cat) {
    case 'Conflict': return { bg: 'rgba(239, 68, 68, 0.125)', color: 'rgb(239, 68, 68)', border: 'rgba(245, 158, 11, 0.533)' };
    case 'Economic': return { bg: 'rgba(34, 197, 94, 0.125)', color: 'rgb(34, 197, 94)', border: 'rgba(132, 204, 22, 0.533)' };
    case 'Disaster': return { bg: 'rgba(245, 158, 11, 0.125)', color: 'rgb(245, 158, 11)', border: 'rgba(34, 197, 94, 0.533)' };
    case 'Political': return { bg: 'rgba(139, 92, 246, 0.125)', color: 'rgb(139, 92, 246)', border: 'rgba(245, 158, 11, 0.533)' };
    case 'Humanitarian': return { bg: 'rgba(56, 189, 248, 0.125)', color: 'rgb(56, 189, 248)', border: 'rgba(56, 189, 248, 0.533)' };
    default: return { bg: 'rgba(156, 163, 175, 0.125)', color: 'rgb(156, 163, 175)', border: 'rgba(156, 163, 175, 0.533)' };
  }
}

const getSeverityStyle = (sev: number) => {
  if (sev <= 1) return { bg: 'rgba(34, 197, 94, 0.125)', color: 'rgb(34, 197, 94)' };
  if (sev === 2) return { bg: 'rgba(132, 204, 22, 0.125)', color: 'rgb(132, 204, 22)' };
  return { bg: 'rgba(245, 158, 11, 0.125)', color: 'rgb(245, 158, 11)' };
}

export default function FeedPanel() {
  const events = useStore(state => state.events);
  const setSelectedEventId = useStore(state => state.setSelectedEventId);
  const setDetailsPanelOpen = useStore(state => state.setDetailsPanelOpen);
  const feedPanelOpen = useStore(state => state.feedPanelOpen);
  const setFeedPanelOpen = useStore(state => state.setFeedPanelOpen);
  const [tab, setTab] = useState<'live' | 'reports'>('live');

  // Transform store events to feed format based on dynamic matching
  const feedEvents: FeedEvent[] = events.map(e => {
    let category: Category = 'Disaster';
    const t = e.title.toLowerCase();
    if (t.includes('conflict') || t.includes('attack') || t.includes('war') || t.includes('militar') || t.includes('missile') || t.includes('strike')) category = 'Conflict';
    else if (t.includes('political') || t.includes('elect') || t.includes('govern') || t.includes('president') || t.includes('dispute')) category = 'Political';
    else if (t.includes('humanitarian') || t.includes('refugee') || t.includes('aid')) category = 'Humanitarian';
    else if (t.includes('economic') || t.includes('trade') || t.includes('market') || t.includes('price') || t.includes('shortage')) category = 'Economic';
    return {
      id: e.id,
      title: e.title,
      location: e.location || 'Unknown Location',
      category,
      severity: e.severity,
      timeAgo: e.timeAgo || 'just now',
    };
  });

  function handleClick(eventId: string) {
    const event = events.find(e => e.id === eventId);
    setSelectedEventId(eventId);
    setDetailsPanelOpen(true);

    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (event && event.latitude && event.longitude && viewer && Cesium) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude, event.severity * 200000),
        duration: 1.5,
      });
    }
  }

  if (!feedPanelOpen) {
    return (
      <button
        onClick={() => setFeedPanelOpen(true)}
        className="absolute z-40 flex items-center gap-1.5 px-3 py-1.5 rounded pointer-events-auto bg-secondary border border-subtle text-foreground shadow-lg hover:border-white/30 transition-colors"
        style={{
          top: '8px',
          left: '8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        FEED
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    );
  }

  return (
    <div className="absolute left-0 z-20 pointer-events-auto shadow-2xl overflow-hidden origin-top-left bg-secondary border-r border-subtle cursor-default flex flex-col"
         style={{ top: '0', width: '340px', height: '100%', transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
      
      {/* Header */}
      <div className="h-10 px-3 flex items-center justify-between bg-tertiary border-b border-subtle flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-white/90 uppercase tracking-wide">Feed</span>
          <div className="flex rounded border border-white/10 overflow-hidden">
            <button 
              onClick={() => setTab('live')}
              title="Real-time OSINT from X/Twitter" 
              className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-150 ${tab === 'live' ? 'bg-red-500/25 text-red-300' : 'bg-transparent text-white/35 hover:bg-white/8 hover:text-white/55'}`}
            >
              LIVE
            </button>
            <button 
              onClick={() => setTab('reports')}
              title="Global wire services, news agencies & under-reported stories" 
              className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-150 ${tab === 'reports' ? 'bg-indigo-500/25 text-indigo-300' : 'bg-transparent text-white/35 hover:bg-white/8 hover:text-white/55'}`}
            >
              REPORTS
            </button>
          </div>
        </div>
        
        <span className="ml-auto mr-2 text-[10px] text-faint tabular-nums bg-transparent tracking-wide">
          {feedEvents.length} events
        </span>
        
        <button 
          onClick={() => setFeedPanelOpen(false)}
          className="w-7 h-7 flex flex-shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30" 
          title="Hide feed" aria-label="Hide feed panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left text-white/80" aria-hidden="true">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
      </div>

      {/* Feed List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        {feedEvents.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-faint">
            No events found.
          </div>
        )}
        
        {feedEvents.map((event) => {
          const catStyle = getCategoryStyle(event.category);
          const sevStyle = getSeverityStyle(event.severity);
          
          return (
            <div 
              key={event.id}
              role="button" 
              tabIndex={0} 
              onClick={() => handleClick(event.id)}
              className="cursor-pointer border-b border-subtle w-full box-border border-l-2 hover:bg-white/5 active:bg-white/10 overflow-hidden px-3 py-2 h-[86px] bg-transparent transition-colors" 
              style={{ borderLeftColor: catStyle.border }}
            >
              <div className="flex items-center min-w-0 gap-2 mb-1">
                <span 
                  className="font-medium rounded flex-shrink-0 truncate text-[9px] px-1 py-0.5 max-w-[80px]" 
                  style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
                >
                  {event.category}
                </span>
                <span 
                  className="font-medium rounded flex-shrink-0 text-[9px] px-1 py-0.5" 
                  style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}
                >
                  S{event.severity}
                </span>
                <span className="text-faint ml-auto flex-shrink-0 text-[9px]">
                  {event.timeAgo}
                </span>
              </div>
              
              <h3 className="font-medium text-foreground leading-snug break-words text-[11.5px] mb-0.5 line-clamp-2" title={event.title}>
                {event.title}
              </h3>
              
              <div className="flex items-center text-faint min-w-0 gap-1.5 text-[9px]">
                <span className="flex items-center gap-1 truncate min-w-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin flex-shrink-0" aria-hidden="true">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="truncate">{event.location}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
