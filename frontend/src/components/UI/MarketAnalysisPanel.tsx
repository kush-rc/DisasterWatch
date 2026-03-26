'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store/useStore';
import { useDraggable } from '@/hooks/useDraggable';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  category: string;
}

const SYMBOL_ORDER = ['^GSPC', '^FTSE', '000001.SS', '^N225', 'GC=F', 'SI=F', 'BTC-USD', 'CL=F', '^VIX'];

export default function MarketAnalysisPanel() {
  const zIndex = useStore(state => state.panelZIndex.marketAnalysis);
  const bringToFront = useStore(state => state.bringToFront);
  const marketsActive = useStore(state => state.layers.markets);
  const toggleLayer = useStore(state => state.toggleLayer);
  const [mounted, setMounted] = useState(false);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => setMounted(true), []);

  const { position, handleMouseDown } = useDraggable({ 
    x: mounted ? window.innerWidth - 340 : 800, 
    y: mounted ? 80 : 80 
  });

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setStocks(data);
        setLastUpdated(new Date());
      } else {
        setError('No data');
      }
    } catch (e) {
      console.error('[Markets] Fetch error:', e);
      setError('Could not load market data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (marketsActive) {
      fetchStocks();
      const interval = setInterval(fetchStocks, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [marketsActive, fetchStocks]);

  // Sorted by reference order
  const orderedStocks = useMemo(() => {
    const map = new Map(stocks.map(s => [s.symbol, s]));
    const sorted: StockQuote[] = [];
    for (const sym of SYMBOL_ORDER) {
      const s = map.get(sym);
      if (s) sorted.push(s);
    }
    return sorted;
  }, [stocks]);

  // Time ago
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!lastUpdated) return;
    const i = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(i);
  }, [lastUpdated]);

  const timeAgo = useMemo(() => {
    if (!lastUpdated) return '';
    const secs = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (secs < 60) return 'just now';
    return `${Math.round(secs / 60)}m ago`;
  }, [lastUpdated, stocks]); // eslint-disable-line

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (!marketsActive) {
    return null;
  }

  return (
    <div 
      className="fixed pointer-events-auto"
      style={{ left: position.x, top: position.y, zIndex }}
      onMouseDownCapture={() => bringToFront('marketAnalysis')}
    >
      <div 
        data-floating-panel="true"
        className="bg-secondary border border-subtle rounded-lg shadow-lg overflow-hidden cursor-default"
        style={{ width: '260px', height: '304px' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div 
            className="h-10 px-2 flex items-center justify-between bg-tertiary border-b border-subtle flex-shrink-0"
            style={{ cursor: 'grab' }}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <line x1="12" x2="12" y1="2" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span className="text-[11px] font-medium text-white/90 uppercase tracking-wide">Markets</span>
              {timeAgo && <span className="text-[9px] text-faint font-normal normal-case tracking-normal">{timeAgo}</span>}
            </div>
            <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
              <button 
                onClick={fetchStocks} 
                disabled={loading}
                className="p-1 rounded hover:bg-white/20" 
                title="Refresh"
                aria-label="Refresh market data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/80 ${loading ? 'animate-spin' : ''}`}>
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 16h5v5"></path>
                </svg>
              </button>
              <button 
                onClick={() => toggleLayer('markets')}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30"
                title="Collapse"
                aria-label="Collapse markets panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && stocks.length === 0 ? (
              <div className="py-3 text-center text-faint text-[10px]">Loading...</div>
            ) : error && stocks.length === 0 ? (
              <div className="py-4 flex flex-col items-center gap-2">
                <span className="text-amber-400 text-[10px]">{error}</span>
                <button onClick={fetchStocks} className="px-3 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-white/80 rounded">
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Column Headers */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-subtle bg-tertiary sticky top-0 z-10">
                  <span className="text-[9px] uppercase tracking-wider text-faint">Symbol</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-faint">Price</span>
                    <span className="text-[9px] uppercase tracking-wider text-faint w-[42px] text-right">Chg</span>
                  </div>
                </div>
                {/* Rows */}
                {orderedStocks.map(stock => {
                  const isUp = stock.change > 0;
                  const isDown = stock.change < 0;
                  const colorClass = isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-faint';
                  
                  return (
                    <div key={stock.symbol} className="flex items-center justify-between py-1 px-2 hover:bg-white/5 rounded">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isUp ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                            <path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path>
                          </svg>
                        ) : isDown ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                            <path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                            <path d="M5 12h14"></path>
                          </svg>
                        )}
                        <span className="text-[11px] text-foreground truncate">{stock.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-muted font-mono">{formatPrice(stock.price)}</span>
                        <span className={`text-[10px] font-mono w-[42px] text-right ${colorClass}`}>
                          {isUp ? '+' : ''}{stock.change_percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
