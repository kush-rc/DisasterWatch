'use client';

import { useEffect, useRef } from 'react';

// Ignore TS errors for window attached functions
declare global {
  interface Window {
    initMap: () => void;
    setView: (v: string, e?: any) => void;
    setRTab: (v: string) => void;
    toggleTheme: () => void;
    refreshAll: () => void;
    toggleLayer: (layer: string) => void;
    setTimeFilter: (tf: string, e?: any) => void;
    setMapStyle: (s: string, e?: any) => void;
    searchLocation: (q: string) => void;
  }
}

export default function Home() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    // Check if script is loaded, and then run window.initMap
    const runInit = () => {
      if (typeof window.initMap === 'function') {
        window.initMap();
      } else {
        setTimeout(runInit, 100);
      }
    };
    runInit();
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div id="loading">
        <div className="loading-logo">◉ Situation Monitor</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
        <div className="loading-status" id="load-status">Initializing feeds...</div>
      </div>

      {/* Header */}
      <div id="header">
        <div className="logo">
          <div className="logo-dot"></div>
          <span className="logo-text">Situation Monitor</span>
        </div>
        <div className="header-tabs">
          <div className="htab active" onClick={(e) => window.setView('global', e)}>◈ Global</div>
          <div className="htab" onClick={(e) => window.setView('conflicts', e)}>⚡ Conflicts</div>
          <div className="htab" onClick={(e) => window.setView('aviation', e)}>✈ Aviation</div>
          <div className="htab" onClick={(e) => window.setView('maritime', e)}>⚓ Maritime</div>
          <div className="htab" onClick={(e) => window.setView('finance', e)}>◎ Markets</div>
          <div className="htab" onClick={(e) => window.setView('disasters', e)}>⬡ Disasters</div>
        </div>
        <div className="header-right">
          <div id="clock">--:--:-- UTC</div>
          <button className="hbtn" onClick={() => window.refreshAll()}>↻ Refresh</button>
          <button className="hbtn" onClick={() => window.toggleTheme()}>◐ Theme</button>
        </div>
      </div>

      {/* Main Layout */}
      <div id="layout">

        {/* Left Panel: Layers + Stats */}
        <div id="left-panel">
          <div className="panel-header">
            <span className="panel-title">Layers</span>
            <span className="panel-badge" id="active-count">0 active</span>
          </div>

          {/* Stats grid */}
          <div className="stat-grid">
            <div className="stat-cell">
              <div className="stat-value red" id="stat-conflicts">24</div>
              <div className="stat-label">Active Conflicts</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value amber" id="stat-flights">—</div>
              <div className="stat-label">Live Flights</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value green" id="stat-events">—</div>
              <div className="stat-label">News Events</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value" id="stat-ships">147</div>
              <div className="stat-label">Vessels</div>
            </div>
          </div>

          <div className="panel-scroll">
            {/* Conflict Layer */}
            <div className="layer-section">
              <div className="layer-sec-title">Conflict & Security</div>
              <div className="layer-item" onClick={() => window.toggleLayer('conflicts')}>
                <label className="layer-toggle"><input type="checkbox" id="l-conflicts" defaultChecked /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#ff4455' }}></div>
                <span className="layer-label">Active Conflict Zones</span>
              </div>
              <div className="layer-item" onClick={() => window.toggleLayer('military')}>
                <label className="layer-toggle"><input type="checkbox" id="l-military" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#ff8c00' }}></div>
                <span className="layer-label">Military Bases</span>
              </div>
              <div className="layer-item" onClick={() => window.toggleLayer('nuclear')}>
                <label className="layer-toggle"><input type="checkbox" id="l-nuclear" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#ff00ff' }}></div>
                <span className="layer-label">Nuclear Sites</span>
              </div>
            </div>

            {/* Aviation Layer */}
            <div className="layer-section">
              <div className="layer-sec-title">Aviation</div>
              <div className="layer-item" onClick={() => window.toggleLayer('flights')}>
                <label className="layer-toggle"><input type="checkbox" id="l-flights" defaultChecked /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#0084ff' }}></div>
                <span className="layer-label">Live Flights (OpenSky)</span>
              </div>
              <div className="layer-item" onClick={() => window.toggleLayer('airports')}>
                <label className="layer-toggle"><input type="checkbox" id="l-airports" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#ffdf00' }}></div>
                <span className="layer-label">Major Airports</span>
              </div>
            </div>

            {/* Maritime Layer */}
            <div className="layer-section">
              <div className="layer-sec-title">Maritime</div>
              <div className="layer-item" onClick={() => window.toggleLayer('ships')}>
                <label className="layer-toggle"><input type="checkbox" id="l-ships" defaultChecked /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#00d4aa' }}></div>
                <span className="layer-label">Live Vessels (AIS)</span>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="layer-section">
              <div className="layer-sec-title">Infrastructure</div>
              <div className="layer-item" onClick={() => window.toggleLayer('cables')}>
                <label className="layer-toggle"><input type="checkbox" id="l-cables" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#22dd88' }}></div>
                <span className="layer-label">Undersea Cables</span>
              </div>
              <div className="layer-item" onClick={() => window.toggleLayer('datacenters')}>
                <label className="layer-toggle"><input type="checkbox" id="l-datacenters" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#00ffff' }}></div>
                <span className="layer-label">Data Centers</span>
              </div>
            </div>

            {/* Environment */}
            <div className="layer-section">
              <div className="layer-sec-title">Environment & Disasters</div>
              <div className="layer-item" onClick={() => window.toggleLayer('earthquakes')}>
                <label className="layer-toggle"><input type="checkbox" id="l-earthquakes" defaultChecked /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#f5a623' }}></div>
                <span className="layer-label">Earthquakes (USGS)</span>
              </div>
              <div className="layer-item" onClick={() => window.toggleLayer('fires')}>
                <label className="layer-toggle"><input type="checkbox" id="l-fires" /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#ff6633' }}></div>
                <span className="layer-label">Active Fires (NASA)</span>
              </div>
            </div>

            {/* News */}
            <div className="layer-section">
              <div className="layer-sec-title">News & Events</div>
              <div className="layer-item" onClick={() => window.toggleLayer('news')}>
                <label className="layer-toggle"><input type="checkbox" id="l-news" defaultChecked /><span className="layer-slider"></span></label>
                <div className="layer-dot" style={{ background: '#9b7cff' }}></div>
                <span className="layer-label">GDELT News Events</span>
              </div>
            </div>

            {/* Time filter */}
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
              <div className="panel-title" style={{ marginBottom: '8px' }}>Time Range</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button className="map-chip active" id="tf-1h" onClick={(e) => window.setTimeFilter('1h', e)}>1H</button>
                <button className="map-chip" id="tf-6h" onClick={(e) => window.setTimeFilter('6h', e)}>6H</button>
                <button className="map-chip" id="tf-24h" onClick={(e) => window.setTimeFilter('24h', e)}>24H</button>
                <button className="map-chip" id="tf-7d" onClick={(e) => window.setTimeFilter('7d', e)}>7D</button>
              </div>
            </div>

          </div>
        </div>

        {/* Map */}
        <div id="map-container">
          <div id="map"></div>

          <div id="map-toolbar">
            <input className="map-search" type="text" placeholder="Search location..." id="map-search" onInput={(e) => window.searchLocation(e.currentTarget.value)} />
            <button className="map-chip active" onClick={(e) => window.setMapStyle('dark', e)}>Dark</button>
            <button className="map-chip" onClick={(e) => window.setMapStyle('satellite', e)}>Satellite</button>
            <button className="map-chip" onClick={(e) => window.setMapStyle('topo', e)}>Topo</button>
          </div>

          <div id="map-legend">
            <div className="legend-title">Legend</div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#ff4455' }}></div><span className="legend-label">Conflicts (Active)</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#f5a623' }}></div><span className="legend-label">Earthquakes</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#ff6633' }}></div><span className="legend-label">Fires</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#0084ff' }}></div><span className="legend-label">Aviation Tracker</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#00d4aa' }}></div><span className="legend-label">Maritime Vessels</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#ff00ff' }}></div><span className="legend-label">Nuclear & Military</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: '#9b7cff' }}></div><span className="legend-label">News Reports</span></div>
          </div>

          <div id="map-stats">
            <div className="map-stat-card">
              <div className="msc-val live blink" id="ms-flights">—</div>
              <div className="msc-label">↑ Live Aircraft</div>
            </div>
            <div className="map-stat-card">
              <div className="msc-val" id="ms-eq">—</div>
              <div className="msc-label">⬡ Earthquakes 24h</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Feeds */}
        <div id="right-panel">
          <div className="rpanel-tabs">
            <div className="rpanel-tab active" onClick={() => window.setRTab('news')}>News</div>
            <div className="rpanel-tab" onClick={() => window.setRTab('signals')}>Signals</div>
            <div className="rpanel-tab" onClick={() => window.setRTab('alerts')}>Alerts</div>
          </div>

          {/* News Tab */}
          <div className="rpanel-content active" id="rt-news">
            <div className="news-loading blink" id="news-loading">◉ Fetching live feeds...</div>
            <div id="news-list"></div>
          </div>

          {/* Signals Tab */}
          <div className="rpanel-content" id="rt-signals">
            <div id="signals-list">
              <div style={{ padding: '10px 0' }}>
                {/* Signals populated by JS */}
              </div>
            </div>
          </div>

          {/* Alerts Tab */}
          <div className="rpanel-content" id="rt-alerts">
            <div id="alerts-list"></div>
          </div>

        </div>

      </div>

      {/* Status Bar */}
      <div id="statusbar">
        <div className="sb-item"><div className="sb-dot" style={{ background: 'var(--accent)' }}></div>LIVE</div>
        <div className="sb-item" id="sb-eq">EQ: loading…</div>
        <div className="sb-item" id="sb-flights">AIR: —</div>
        <div className="sb-item" id="sb-news-count">NEWS: loading…</div>
        <div id="ticker-wrap">
          <div id="ticker">
            <span><b>CONFLICT</b> Russia-Ukraine front active — shelling reported near Zaporizhzhia</span>
            <span><b>AVIATION</b> Global air traffic nominal — 45,000+ commercial flights daily</span>
            <span><b>MARKETS</b> S&P 500 watchlist active — VIX monitoring engaged</span>
            <span><b>SEISMIC</b> USGS monitoring 150+ sensors globally — live feed active</span>
            <span><b>MARITIME</b> Strait of Hormuz — vessel traffic nominal</span>
          </div>
        </div>
      </div>
    </>
  );
}
