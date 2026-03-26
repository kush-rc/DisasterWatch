'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { useDraggable } from '@/hooks/useDraggable';

const CHANNELS = [
  { country: 'QA', code: '🇶🇦', name: 'Al Jazeera', channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg' },
  { country: 'DE', code: '🇩🇪', name: 'DW News', channelId: 'UCknLrEdhRCp1aegoMqRaCZg' },
  { country: 'FR', code: '🇫🇷', name: 'France 24', channelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' },
  { country: 'GB', code: '🇬🇧', name: 'Sky News', channelId: 'UCoMdktPbSTixAyNGwb-UYkQ' },
  { country: 'IN', code: '🇮🇳', name: 'WION', channelId: 'UC_gUM8rL-Lrg6O3adPW9K1g' },
  { country: 'IN', code: '🇮🇳', name: 'India Today', channelId: 'UCYPvAwZP8pZhSMW8qs7cVCw' },
  { country: 'IN', code: '🇮🇳', name: 'NDTV 24x7', channelId: 'UCZFMm1MjWFiYIaKpRJMijDg' },
  { country: 'SG', code: '🇸🇬', name: 'CNA', channelId: 'UCo8bcnLyZH8tBIH9V1mLgqQ' },
  { country: 'TR', code: '🇹🇷', name: 'TRT World', channelId: 'UC7fWeaHhqgM4Lba0JzFZqOQ' },
  { country: 'EU', code: '🇪🇺', name: 'Euronews', channelId: 'UCW2QcKZiU8aUGg4yxCIditg' },
  { country: 'JP', code: '🇯🇵', name: 'NHK World', channelId: 'UCQ0eoO0MYGflMIVPw5PYJPA' },
  { country: 'KR', code: '🇰🇷', name: 'Arirang', channelId: 'UCcKDUxQfMPFaIBZ6Q5xAODg' },
  { country: 'CN', code: '🇨🇳', name: 'CGTN', channelId: 'UCgrNz-aDmcr2uuto8_DL2jg' },
  { country: 'AU', code: '🇦🇺', name: 'ABC News AU', channelId: 'UCVgO39Bk5sMo66-6o6Spn6Q' },
  { country: 'US', code: '🇺🇸', name: 'CBS News', channelId: 'UC8p1vwvWtl6T73JiExfWs1g' },
  { country: 'US', code: '🇺🇸', name: 'Bloomberg', channelId: 'UCIALMKvObZNtJ68-rmLjb5A' },
];

const NORMAL_SIZE = { w: 344, h: 230 };
const EXPANDED_SIZE = { w: 640, h: 400 };

export default function LiveTVPanel() {
  const [showList, setShowList] = useState(false);
  const [activeChannel, setActiveChannel] = useState(-1);
  const [isMuted, setIsMuted] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const zIndex = useStore(state => state.panelZIndex.liveTv);
  const bringToFront = useStore(state => state.bringToFront);
  const camerasActive = useStore(state => state.layers.cameras);
  const toggleLayer = useStore(state => state.toggleLayer);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { position, handleMouseDown, resetPosition } = useDraggable({ 
    x: mounted ? window.innerWidth - 400 : 800, 
    y: mounted ? window.innerHeight - 350 : 500 
  });

  // Clean up when cameras overlay is turned off
  useEffect(() => {
    if (!camerasActive) {
      setShowList(false);
      setActiveChannel(-1);
      setIsMuted(true);
      setIsMaximized(false);
    }
  }, [camerasActive]);

  function playChannel(index: number) {
    setActiveChannel(index);
    setShowList(false);
    setIsMuted(true); // YouTube iframes start muted for autoplay
  }

  function stop() {
    toggleLayer('cameras');
  }

  // Send postMessage commands to YouTube iframe
  function sendYTCommand(func: string) {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
    }
  }

  function handleMuteToggle() {
    if (isMuted) {
      sendYTCommand('unMute');
    } else {
      sendYTCommand('mute');
    }
    setIsMuted(!isMuted);
  }

  function handleMaximize() {
    setIsMaximized(!isMaximized);
  }

  function handleDock() {
    resetPosition();
    setIsMaximized(false);
  }

  if (!camerasActive) {
    return null;
  }

  const size = isMaximized ? EXPANDED_SIZE : NORMAL_SIZE;
  const iframeSrc = activeChannel >= 0
    ? `https://www.youtube.com/embed/live_stream?channel=${CHANNELS[activeChannel].channelId}&autoplay=1&mute=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    : '';

  return (
    <div 
      className="fixed pointer-events-auto shadow-lg" 
      style={{ 
        left: position.x, 
        top: position.y, 
        width: `${size.w}px`, 
        height: `${size.h}px`, 
        zIndex,
        transition: 'width 300ms ease, height 300ms ease'
      }}
      onMouseDownCapture={() => bringToFront('liveTv')}
    >
      <div data-floating-panel="true" className="w-full h-full bg-secondary border border-subtle rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-2 h-9 bg-tertiary border-b border-subtle shrink-0 cursor-grab active:cursor-grabbing drag-handle"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-500 shrink-0"></span>
            <button 
              onMouseDown={(e) => { e.stopPropagation(); setShowList(!showList); }}
              className="flex items-center gap-1 text-[10px] font-medium text-white/90 hover:bg-white/10 px-1.5 py-0.5 rounded min-w-0 cursor-pointer"
            >
              {activeChannel >= 0 ? (
                <>
                  <span className="text-xs">{CHANNELS[activeChannel].code}</span>
                  <span className="truncate max-w-[120px]">{CHANNELS[activeChannel].name}</span>
                </>
              ) : (
                <>
                  <span className="text-xs">📺</span>
                  <span className="truncate max-w-[120px]">Select Channel</span>
                </>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform ${showList ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button className="p-1 rounded hover:bg-white/10 cursor-pointer" title="Dock to default position" aria-label="Dock video panel" onClick={handleDock}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
            </button>
            <button 
              className="p-1 rounded hover:bg-white/10 cursor-pointer" 
              title={isMuted ? "Unmute" : "Mute"} 
              aria-label={isMuted ? "Unmute" : "Mute"} 
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              )}
            </button>
            <button className="p-1 rounded hover:bg-white/10 cursor-pointer" title={isMaximized ? "Minimize" : "Maximize"} aria-label={isMaximized ? "Minimize" : "Maximize"} onClick={handleMaximize}>
              {isMaximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
              )}
            </button>
            <button className="p-1 rounded hover:bg-red-500/30 cursor-pointer" onClick={stop} title="Close" aria-label="Close video panel">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative bg-black" onMouseDown={(e) => e.stopPropagation()}>
          {/* YouTube iframe */}
          {activeChannel >= 0 && (
            <iframe 
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={iframeSrc}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 'none' }}
            />
          )}

          {activeChannel < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none bg-black/80 z-10">
              <span className="text-[11px] font-medium tracking-widest text-white/50">SELECT A CHANNEL</span>
              <button 
                onClick={() => setShowList(true)} 
                className="px-4 py-1.5 rounded-md text-[11px] font-medium tracking-wide pointer-events-auto cursor-pointer border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80 uppercase"
              >
                Browse TV Feeds
              </button>
            </div>
          )}

          {/* Channel List Dropdown */}
          {showList && (
            <div className="absolute top-0 left-0 w-full h-full overflow-y-auto bg-secondary/95 backdrop-blur z-20">
              {CHANNELS.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => playChannel(i)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10 cursor-pointer border-b border-subtle/50"
                  style={{ background: activeChannel === i ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                >
                  <span className="text-[14px] shrink-0" style={{ width: '20px' }}>{ch.code}</span>
                  <span className="text-[12px] font-medium flex-1 text-white/90">{ch.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeChannel === i ? 'var(--green)' : 'var(--muted)' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
