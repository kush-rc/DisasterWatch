'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';

export default function OverlaysPanel() {
  const events = useStore(state => state.events);
  const layers = useStore(state => state.layers);
  const toggleLayer = useStore(state => state.toggleLayer);

  const [isOpen, setIsOpen] = useState(true);
  const feedPanelOpen = useStore(state => state.feedPanelOpen);
  const [showCategories, setShowCategories] = useState(true);
  const [showSeverity, setShowSeverity] = useState(true);
  const [showMapOptions, setShowMapOptions] = useState(false);

  const [mapStyle, setMapStyle] = useState('dark');
  const [is3dGlobe, setIs3dGlobe] = useState(true);

  // Category counting logic based on titles
  const getCatCount = (cat: string) => {
    return events.filter(e => {
      const t = e.title.toLowerCase();
      if (cat === 'disaster') return t.includes('earthquake') || t.includes('flood') || t.includes('fire') || t.includes('cyclone') || t.includes('tsunami');
      if (cat === 'conflict') return t.includes('conflict') || t.includes('attack') || t.includes('war') || t.includes('missile') || t.includes('strike');
      if (cat === 'political') return t.includes('political') || t.includes('elect');
      if (cat === 'humanitarian') return t.includes('humanitarian') || t.includes('refugee');
      if (cat === 'economic') return t.includes('economic') || t.includes('trade');
      return false;
    }).length;
  };

  const conflicts = getCatCount('conflict');
  const political = getCatCount('political');
  const humanitarian = getCatCount('humanitarian');
  const economic = getCatCount('economic');
  const disasters = getCatCount('disaster');

  function handleSwitchBasemap(style: string) {
    setMapStyle(style);
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    viewer.imageryLayers.removeAll();

    if (style === 'satellite') {
      viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 2 }));
    } else if (style === 'terrain') {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          maximumLevel: 18,
          credit: 'CARTO Light',
        })
      );
    } else if (style === 'dark') {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          maximumLevel: 18,
          credit: 'CARTO',
        })
      );
    }
  }

  function handleToggle3D(checked: boolean) {
    setIs3dGlobe(checked);
    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (viewer && Cesium) {
      viewer.scene.mode = checked ? Cesium.SceneMode.SCENE3D : Cesium.SceneMode.SCENE2D;
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded pointer-events-auto bg-secondary border border-subtle text-foreground shadow-lg hover:border-white/30 transition-colors"
        style={{ left: feedPanelOpen ? '356px' : '8px', fontSize: '11px', fontWeight: 600, transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        OVERLAYS
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
      </button>
    );
  }

  return (
    <div className="absolute bottom-2 z-20 pointer-events-auto" data-tour="tour-overlays" style={{ left: feedPanelOpen ? '356px' : '8px', transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div 
        className="shadow-xl origin-bottom-left bg-secondary border border-subtle rounded-lg cursor-default overflow-hidden" 
        style={{ width: '240px', maxHeight: 'calc(100dvh - 100px)', transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="h-full max-h-[calc(100dvh-100px)] flex flex-col bg-transparent" style={{ opacity: 1, transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <aside className="w-full h-full max-h-full flex flex-col overflow-hidden bg-transparent">
            
            {/* Header */}
            <div className="h-10 px-2 flex items-center justify-between bg-tertiary border-b border-subtle flex-shrink-0">
              <span className="text-[11px] font-medium text-white/90 uppercase tracking-wide whitespace-nowrap">Overlays</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-1 focus:ring-accent" 
                title="Hide overlays" aria-label="Hide overlays panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down text-white/80" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
            </div>

            {/* Quick Overlays Toolbar */}
            <div className="px-2 py-2 border-b border-subtle flex-shrink-0" data-tour="tour-traffic">
              <div className="flex items-center gap-1">
                <div className="relative inline-flex flex-1">
                  <button className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30" aria-label="Show VIP tracker overlay" aria-pressed="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  </button>
                </div>
                <div className="relative inline-flex flex-1">
                  <button 
                    onClick={() => toggleLayer('flights')}
                    className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 transition-colors" 
                    aria-label="Hide aircraft overlay" aria-pressed={layers.flights} 
                    style={{ borderColor: layers.flights ? 'rgba(14, 165, 233, 0.5)' : 'rgba(255,255,255,0.2)', backgroundColor: layers.flights ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={layers.flights ? "text-sky-400" : "text-white/80"} aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
                  </button>
                </div>
                <div className="relative inline-flex flex-1">
                  <button 
                    onClick={() => toggleLayer('ships')}
                    className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 transition-colors" 
                    aria-label="Hide ship overlay" aria-pressed={layers.ships} 
                    style={{ borderColor: layers.ships ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.2)', backgroundColor: layers.ships ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={layers.ships ? "text-blue-400" : "text-white/80"} aria-hidden="true"><path d="M12 10.189V14"></path><path d="M12 2v3"></path><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"></path><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"></path><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                  </button>
                </div>
                <div className="relative inline-flex flex-1">
                  <button 
                    onClick={() => toggleLayer('markets')}
                    className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 transition-colors" 
                    aria-label="Show markets overlay" aria-pressed={layers.markets}
                    style={{ borderColor: layers.markets ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255,255,255,0.2)', backgroundColor: layers.markets ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={layers.markets ? "text-green-400" : "text-white/80"} aria-hidden="true"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </button>
                </div>
                <div className="relative inline-flex flex-1">
                  <button className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30" aria-label="Show pizza tracker overlay" aria-pressed="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><path d="m12 14-1 1"></path><path d="m13.75 18.25-1.25 1.42"></path><path d="M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12"></path><path d="M18.8 9.3a1 1 0 0 0 2.1 7.7"></path><path d="M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z"></path></svg>
                  </button>
                </div>
                <div className="relative inline-flex flex-1">
                  <button 
                    onClick={() => toggleLayer('cameras')}
                    className="h-7 w-full flex items-center justify-center gap-1.5 rounded-md border focus:outline-none focus:ring-1 transition-colors" 
                    aria-label="Show video overlay" aria-pressed={layers.cameras}
                    style={{ borderColor: layers.cameras ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.2)', backgroundColor: layers.cameras ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={layers.cameras ? "text-blue-400" : "text-white/80"} aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Accordeons */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              
              {/* Categories */}
              <div className="border-b border-subtle">
                <button 
                  onClick={() => setShowCategories(!showCategories)}
                  className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-medium text-faint uppercase tracking-wide hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20" 
                  aria-expanded={showCategories}
                >
                  Categories
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ease-out ${showCategories ? 'rotate-0' : '-rotate-90'}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-out ${showCategories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-3 pb-3">
                    <div className="space-y-0.5">
                      <button className="w-full flex items-center justify-between px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 text-foreground hover:bg-white/10" aria-pressed="true">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(239, 68, 68)' }}></span><span className="truncate">Conflict</span></span>
                        <span className="text-[10px] text-faint tabular-nums">{conflicts}</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 text-foreground hover:bg-white/10" aria-pressed="true">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(139, 92, 246)' }}></span><span className="truncate">Political</span></span>
                        <span className="text-[10px] text-faint tabular-nums">{political}</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 text-foreground hover:bg-white/10" aria-pressed="true">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(20, 184, 166)' }}></span><span className="truncate">Humanitarian</span></span>
                        <span className="text-[10px] text-faint tabular-nums">{humanitarian}</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 text-foreground hover:bg-white/10" aria-pressed="true">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></span><span className="truncate">Economic</span></span>
                        <span className="text-[10px] text-faint tabular-nums">{economic}</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 text-foreground hover:bg-white/10" aria-pressed="true">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(245, 158, 11)' }}></span><span className="truncate">Disaster</span></span>
                        <span className="text-[10px] text-faint tabular-nums">{disasters}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div className="border-b border-subtle">
                <button 
                  onClick={() => setShowSeverity(!showSeverity)}
                  className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-faint uppercase tracking-wide hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20" 
                  aria-expanded={showSeverity}
                >
                  Severity
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ease-out ${showSeverity ? 'rotate-0' : '-rotate-90'}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-out ${showSeverity ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-3 pb-3">
                    <div className="flex gap-1">
                      <button className="flex-1 py-1.5 rounded text-[11px] font-medium focus:outline-none ring-1 ring-white/40 text-white" style={{ backgroundColor: 'rgb(34, 197, 94)' }}>S1</button>
                      <button className="flex-1 py-1.5 rounded text-[11px] font-medium focus:outline-none text-white" style={{ backgroundColor: 'rgb(132, 204, 22)' }}>S2</button>
                      <button className="flex-1 py-1.5 rounded text-[11px] font-medium focus:outline-none text-white" style={{ backgroundColor: 'rgb(245, 158, 11)' }}>S3</button>
                      <button className="flex-1 py-1.5 rounded text-[11px] font-medium focus:outline-none text-white" style={{ backgroundColor: 'rgb(249, 115, 22)' }}>S4</button>
                      <button className="flex-1 py-1.5 rounded text-[11px] font-medium focus:outline-none text-white" style={{ backgroundColor: 'rgb(239, 68, 68)' }}>S5</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Options */}
              <div>
                <div className="border-b border-subtle">
                  <button 
                    onClick={() => setShowMapOptions(!showMapOptions)}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-faint uppercase tracking-wide hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20" 
                    aria-expanded={showMapOptions}
                  >
                    Map Options
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ease-out ${showMapOptions ? 'rotate-0' : '-rotate-90'}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${showMapOptions ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-3 pb-3">
                      
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-foreground hover:bg-white/10" aria-pressed="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Events
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                      </button>
                      <button 
                        onClick={() => toggleLayer('weather')} 
                        className={`w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] hover:bg-white/10 ${layers.weather ? 'text-foreground' : 'text-faint'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>
                        <span className="truncate">Weather</span>
                        {layers.weather && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </button>
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-faint hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"></path><path d="M17 21v-2"></path><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"></path><path d="M21 21v-2"></path><path d="M3 5V3"></path><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"></path><path d="M7 5V3"></path></svg>
                        <span className="truncate">Pipelines & Cables</span>
                      </button>
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-faint hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                        <span className="truncate">Military Bases</span>
                      </button>
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-faint hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                        <span className="truncate">Energy & Minerals</span>
                      </button>
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-faint hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"></path><path d="M2 8.82a15 15 0 0 1 20 0"></path><path d="M5 12.859a10 10 0 0 1 14 0"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path></svg>
                        <span className="truncate">Internet Outage</span>
                      </button>
                      <button onClick={() => toggleLayer('earthquakes')} className={`w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] hover:bg-white/10 ${layers.earthquakes ? 'text-foreground' : 'text-faint'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path></svg>
                        <span className="truncate">Active Fires</span>
                        {layers.earthquakes && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </button>
                      <button className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-[11px] text-faint hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"></path><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"></path><path d="M16 12a4 4 0 0 0-4-4"></path><path d="m19 5-1.256 1.256"></path><path d="M20 12h2"></path></svg>
                        <span className="truncate">Day / Night</span>
                      </button>
                      
                      <div className="border-t border-subtle my-2"></div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="basemap-select" className="text-[10px] text-faint uppercase tracking-wide">Map Style</label>
                          <select 
                            id="basemap-select" 
                            value={mapStyle}
                            onChange={(e) => handleSwitchBasemap(e.target.value)}
                            className="w-full px-2 py-1.5 text-[11px] bg-tertiary border border-subtle rounded text-foreground cursor-pointer focus:outline-none focus:ring-1 hover:border-white/30 transition-colors"
                          >
                            <option value="dark">Dark</option>
                            <option value="terrain">Light</option>
                            <option value="satellite">Satellite</option>
                          </select>
                        </div>
                        
                        <label className="flex items-center gap-2 text-[11px] text-faint cursor-pointer min-w-0">
                          <input checked={is3dGlobe} onChange={(e) => handleToggle3D(e.target.checked)} className="rounded bg-tertiary w-3 h-3 flex-shrink-0 accent-white" type="checkbox" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          <span className="truncate">3D Globe</span>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-faint cursor-pointer min-w-0">
                          <input className="rounded bg-tertiary w-3 h-3 flex-shrink-0 accent-white" type="checkbox" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
                          <span className="truncate">Screensaver Mode</span>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-faint cursor-pointer min-w-0">
                          <input className="rounded bg-tertiary w-3 h-3 flex-shrink-0 accent-white" type="checkbox" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="22" x2="18" y1="12" y2="12"></line><line x1="6" x2="2" y1="12" y2="12"></line><line x1="12" x2="12" y1="6" y2="2"></line><line x1="12" x2="12" y1="22" y2="18"></line></svg>
                          <span className="truncate">Auto-zoom new events</span>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-faint cursor-pointer min-w-0">
                          <input className="rounded bg-tertiary w-3 h-3 flex-shrink-0 accent-white" type="checkbox" />
                          <span className="truncate">Current view only</span>
                        </label>

                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="px-2 pt-3 pb-2 border-t border-subtle flex-shrink-0">
              <div className="text-[10px] text-center text-faint">
                Made by <a href="#" className="text-white underline hover:text-white/80">Ryan</a> and <a href="#" className="text-white underline hover:text-white/80">David</a>
              </div>
              <button className="block mx-auto mt-1 text-[10px] text-white/50 hover:text-white underline transition-colors">Replay tutorial</button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
