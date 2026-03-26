'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';

export default function DetailsPanel() {
  const isOpen = useStore(state => state.detailsPanelOpen);
  const setIsOpen = useStore(state => state.setDetailsPanelOpen);
  const selectedEventId = useStore(state => state.selectedEventId);
  const events = useStore(state => state.events);

  const [mediaOpen, setMediaOpen] = useState(true);
  const [signalsOpen, setSignalsOpen] = useState(true);

  const event = events.find(e => e.id === selectedEventId);

  // If no event is selected but panel is open, we can just render the empty shell
  // But usually it should close.
  if (!event && isOpen) {
    setTimeout(() => setIsOpen(false), 0);
  }

  const getSeverityStyle = (sev: number) => {
    if (sev <= 1) return { bg: 'rgba(34, 197, 94, 0.125)', color: 'rgb(34, 197, 94)' };
    if (sev === 2) return { bg: 'rgba(132, 204, 22, 0.125)', color: 'rgb(132, 204, 22)' };
    if (sev === 4) return { bg: 'rgba(239, 68, 68, 0.125)', color: 'rgb(239, 68, 68)' };
    if (sev >= 5) return { bg: 'rgba(185, 28, 28, 0.2)', color: 'rgb(239, 68, 68)' };
    return { bg: 'rgba(245, 158, 11, 0.125)', color: 'rgb(245, 158, 11)' }; // default S3
  };

  const getCategoryStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'conflict': return { bg: 'rgba(239, 68, 68, 0.125)', color: 'rgb(239, 68, 68)' };
      case 'economic': return { bg: 'rgba(34, 197, 94, 0.125)', color: 'rgb(34, 197, 94)' };
      case 'disaster': return { bg: 'rgba(245, 158, 11, 0.125)', color: 'rgb(245, 158, 11)' };
      case 'political': return { bg: 'rgba(139, 92, 246, 0.125)', color: 'rgb(139, 92, 246)' };
      case 'humanitarian': return { bg: 'rgba(56, 189, 248, 0.125)', color: 'rgb(56, 189, 248)' };
      default: return { bg: 'rgba(156, 163, 175, 0.125)', color: 'rgb(156, 163, 175)' };
    }
  };

  // Determine category dynamically if not provided explicitly in store
  let activeCategory = event?.category || 'Disaster';
  if (event) {
    const t = event.title.toLowerCase();
    if (t.includes('conflict') || t.includes('attack') || t.includes('war') || t.includes('militar') || t.includes('missile') || t.includes('strike') || t.includes('idf') || t.includes('hezbollah')) activeCategory = 'conflict';
    else if (t.includes('political') || t.includes('elect') || t.includes('govern') || t.includes('president') || t.includes('dispute')) activeCategory = 'political';
    else if (t.includes('humanitarian') || t.includes('refugee') || t.includes('aid')) activeCategory = 'humanitarian';
    else if (t.includes('economic') || t.includes('trade') || t.includes('market') || t.includes('price')) activeCategory = 'economic';
  }

  const catStyle = getCategoryStyle(activeCategory);
  // Default to severity 3 if missing
  const severityVal = event?.severity || 3;
  const sevStyle = getSeverityStyle(severityVal);
  
  const confidenceScore = event?.confidence || 60;
  let confidenceText = 'Confirmed';
  if (confidenceScore < 40) confidenceText = 'Unverified';
  else if (confidenceScore < 75) confidenceText = 'Likely';

  return (
    <div 
      data-tour="tour-detail" 
      className="absolute top-0 right-0 h-full z-40 bg-secondary overflow-hidden pointer-events-auto" 
      style={{ 
        width: isOpen ? '384px' : '0px', 
        transition: 'width 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        borderLeft: isOpen ? '1px solid var(--border)' : 'none'
      }}
    >
      <div 
        className="w-96 h-full" 
        style={{ 
          opacity: isOpen ? 1 : 0, 
          transform: isOpen ? 'translateX(0px)' : 'translateX(100px)', 
          transition: 'opacity 300ms, transform 300ms cubic-bezier(0.32, 0.72, 0, 1)' 
        }}
      >
        <div className="flex flex-col w-full max-w-full bg-secondary h-full overflow-hidden">
          
          {/* Header */}
          <div className="h-10 px-3 flex items-center justify-between bg-tertiary border-b border-subtle flex-shrink-0">
            <span className="text-[11px] font-medium text-white/90 uppercase tracking-wide">Details</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-accent" 
              aria-label="Close details panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-white/80" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          {/* Severity Color Strip */}
          <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: sevStyle.color }}></div>
          
          {/* Title Area */}
          <div className="border-b border-subtle flex items-start justify-between w-full max-w-full flex-shrink-0 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1.5 gap-2">
                <span className="inline-flex items-center font-medium rounded-sm px-2 py-0.5 text-xs capitalize" style={{ backgroundColor: catStyle.bg, color: catStyle.color }}>
                  {activeCategory}
                </span>
                <span className="inline-flex items-center font-medium rounded-sm px-2 py-0.5 text-xs" style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}>
                  S{severityVal}
                </span>
                <button 
                  onClick={() => {
                    if (event?.sourceUrl) window.open(event.sourceUrl, '_blank');
                  }}
                  className="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0" 
                  aria-label="Open source link" 
                  title="Source Link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link text-faint" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
              </div>
              <h2 className="font-semibold text-foreground leading-snug break-words text-sm">
                {event?.title || 'Loading Event Details...'}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-full flex-1 overflow-y-auto overflow-x-hidden">
            
            {/* Confidence */}
            <div className="flex items-center gap-2 border-b border-subtle px-4 py-2 text-[11px]">
              <span className="text-faint">Confidence:</span>
              <span className="font-medium" style={{ color: confidenceScore >= 70 ? 'rgb(59, 130, 246)' : confidenceScore >= 40 ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)' }}>
                {confidenceScore}% — {confidenceText}
              </span>
            </div>
            
            {/* Time / Location */}
            <div className="flex items-center justify-between border-b border-subtle px-4 py-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock text-faint" aria-hidden="true"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
                <span>{event?.timeAgo || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted truncate max-w-[50%]" title={event?.location || 'Unknown'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin text-faint flex-shrink-0" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span className="truncate">{event?.location || 'Unknown Location'}</span>
              </div>
            </div>
            
            {/* Summary */}
            <div className="border-b border-subtle px-4 py-3">
              <h3 className="font-medium text-faint uppercase tracking-wide mb-1.5 text-[10px]">Summary</h3>
              <p className="text-muted leading-relaxed break-words text-xs">
                {event?.summary || (event?.title ? `No detailed summary available for this event: ${event.title}. Data pulled from ${event.source || 'Intelligence Feeds'}.` : 'No summary available.')}
              </p>
            </div>
            
            {/* Media */}
            <div className="border-b border-subtle">
              <button 
                onClick={() => setMediaOpen(!mediaOpen)}
                className="w-full flex items-center justify-between hover:bg-white/5 active:bg-white/10 px-4 py-3 transition-colors cursor-pointer" 
                aria-expanded={mediaOpen}
              >
                <h3 className="font-medium text-faint uppercase tracking-wide text-xs flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image text-faint" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                  Media (1)
                </h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down text-faint transition-transform duration-200 ${mediaOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              
              <div className="overflow-hidden transition-[max-height] duration-200" style={{ maxHeight: mediaOpen ? '400px' : '0px' }}>
                <div className="px-4 pb-3">
                  <div className="grid gap-2 grid-cols-1">
                    <button className="relative group rounded-lg overflow-hidden bg-black/20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent">
                      <div className="relative">
                        {/* Use a placeholder map image to represent the location, or a generic tactical image */}
                        <img alt="Event Media" loading="lazy" className="w-full object-cover rounded-lg h-36" src="https://images.unsplash.com/photo-1549298485-eb65893a7cf6?q=80&w=600&auto=format&fit=crop" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded bg-black/60 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 text-white" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Signals */}
            <div className="border-t border-subtle">
              <button 
                onClick={() => setSignalsOpen(!signalsOpen)}
                className="w-full flex items-center justify-between hover:bg-white/5 active:bg-white/10 px-4 py-3 transition-colors cursor-pointer" 
                aria-expanded={signalsOpen}
              >
                <h3 className="font-medium text-faint uppercase tracking-wide text-xs">Signals (1)</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down text-faint transition-transform duration-200 ${signalsOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              
              <div className="overflow-hidden transition-[max-height] duration-200" style={{ maxHeight: signalsOpen ? '500px' : '0px' }}>
                <div className="pb-3 space-y-2 px-4 overflow-y-auto max-h-80">
                  <div className="py-2.5 border-b border-subtle last:border-0 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-faint font-medium">{event?.source ? `@${event.source.replace(/\s+/g, '')}` : '@IntelligenceOSINT'}</span>
                      <span className="text-faint flex-shrink-0 text-xs">{event?.timeAgo || 'Unknown'}</span>
                    </div>
                    <p className="text-muted mb-2 line-clamp-4">
                      {event?.title} reported near {event?.location || 'unknown'}. Multiple sources corroborating initial metrics. Severity assessed at Level {severityVal}.
                    </p>
                    <a href={event?.sourceUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors py-1 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                      <span>View Source</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
