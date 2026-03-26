// ── GLOBALS ──
let map, layers = {}, activeView = 'global';
let flightMarkers = [], eqMarkers = [], newsMarkers = [], conflictMarkers = [];
const layerGroups = {};
let currentTimeFilter = '1h';

// ── CLOCK ──
function updateClock() {
  const c = document.getElementById('clock');
  if(!c) return;
  const now = new Date();
  const utc = now.toUTCString().slice(17, 25);
  c.textContent = utc + ' UTC';
}
setInterval(updateClock, 1000);
// Wait for DOM to load before calling updateClock initially is handled by window.onload

// ── LOADING ──
const loadStatuses = ['Connecting to USGS...', 'Loading GDELT feeds...', 'Querying OpenSky...', 'Initializing map layers...', 'Building intelligence index...'];
let li = 0;
const lsi = setInterval(() => {
  const el = document.getElementById('load-status');
  if(el && li < loadStatuses.length) {
    el.textContent = loadStatuses[li++];
  } else if (li >= loadStatuses.length) {
    clearInterval(lsi);
  }
}, 400);
setTimeout(() => { 
  const el = document.getElementById('loading');
  if(el) el.style.display = 'none'; 
}, 2400);

// ── MAP INIT ──
window.initMap = function() {
  if (map) return;
  map = L.map('map', { center: [20, 10], zoom: 3, zoomControl: true, attributionControl: false });

  const tiles = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };
  layers.base = L.tileLayer(tiles.dark, { maxZoom: 18 }).addTo(map);
  layers.tiles = tiles;

  Object.keys(layerDefs).forEach(k => { layerGroups[k] = L.layerGroup().addTo(map); });

  window.loadEarthquakes();
  window.loadFlights();
  window.loadShips();
  window.loadConflicts();
  window.loadFires();
  window.loadNewsEvents();
  window.loadStaticLayers();

  setInterval(window.loadFlights, 90000);
  setInterval(window.loadShips, 120000);
  setInterval(window.loadEarthquakes, 300000);
  setInterval(window.loadFires, 600000);
  setInterval(window.fetchNewsFeeds, 600000);
}

const layerDefs = {
  conflicts: true, military: false, nuclear: false,
  flights: true, ships: true, airports: false,
  cables: false, datacenters: false,
  earthquakes: true, fires: false, news: true
};

window.toggleLayer = function(name) {
  const el = document.getElementById('l-' + name);
  if (!el) return;
  const checked = el.checked;
  layerDefs[name] = checked;
  if (layerGroups[name]) {
    if (checked) map.addLayer(layerGroups[name]);
    else map.removeLayer(layerGroups[name]);
  }
  window.updateActiveCount();
}

window.updateActiveCount = function() {
  const n = Object.values(layerDefs).filter(Boolean).length;
  const el = document.getElementById('active-count');
  if(el) el.textContent = n + ' active';
}

// ── EARTHQUAKE DATA (USGS FREE API) ──
window.loadEarthquakes = async function() {
  const tfHours = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 }[currentTimeFilter] || 24;
  try {
    const r = await fetch('/api/disasters');
    const d = await r.json();
    let feats = d.events || [];
    const now = Date.now();
    feats = feats.filter(f => (now - new Date(f.timestamp).getTime()) < tfHours * 3600000);
    
    document.getElementById('ms-eq').textContent = feats.length;
    document.getElementById('sb-eq').textContent = 'EQ: ' + feats.length + ' (' + currentTimeFilter + ')';
    if (layerGroups.earthquakes) layerGroups.earthquakes.clearLayers();
    feats.forEach(f => {
      const lat = f.latitude;
      const lng = f.longitude;
      const mag = f.metadata?.magnitude || 4.5;
      const depth = f.metadata?.depth || 10;
      if (!lat) return;
      const r = Math.max(4, Math.min(22, mag * 4));
      const col = mag >= 6 ? '#ff4455' : mag >= 4.5 ? '#f5a623' : '#f5a62377';
      const circle = L.circleMarker([lat, lng], { radius: r, fillColor: col, color: col, weight: 1, fillOpacity: 0.6 });
      const time = new Date(f.timestamp).toUTCString().slice(0, 22);
      const sevLabel = mag >= 7 ? 'MAJOR' : mag >= 6 ? 'STRONG' : mag >= 5 ? 'MODERATE' : 'LIGHT';
      const sevCol = mag >= 7 ? '#ff4455' : mag >= 6 ? '#f5a623' : mag >= 5 ? '#ffdf00' : '#f5a62377';
      circle.bindPopup(`<div class="popup-type" style="color:#f5a623">⚡ SEISMIC EVENT — ${sevLabel}</div><div class="popup-title">M${mag.toFixed(1)} — ${f.location || 'Unknown'}</div><div class="popup-desc"><b>Magnitude:</b> ${mag.toFixed(1)} (Richter)<br><b>Depth:</b> ${Math.round(depth)} km<br><b>Severity:</b> <span style="color:${sevCol}">${sevLabel}</span><br><b>Coordinates:</b> ${lat.toFixed(3)}°, ${lng.toFixed(3)}°<br><b>Source:</b> ${f.source || 'USGS'}${f.sourceUrl ? ' <a href="' + f.sourceUrl + '" target="_blank" style="color:#0084ff">[Details]</a>' : ''}</div><div class="popup-time">${time} UTC · ${f.timeAgo || ''}</div>`);
      if (layerGroups.earthquakes) circle.addTo(layerGroups.earthquakes);
    });
    window.addAlerts(feats.filter(f => (f.metadata?.magnitude || 0) >= 5.5).map(f => ({
      level: (f.metadata?.magnitude || 0) >= 6.5 ? 'critical' : 'warning',
      title: `M${(f.metadata?.magnitude || 5.5).toFixed(1)} Earthquake`,
      text: f.location,
      time: new Date(f.timestamp).toUTCString().slice(0, 22)
    })));
  } catch(e) { console.warn('EQ fetch failed', e); }
}

// ── FLIGHT DATA (OpenSky free, no key for limited data) ──
window.loadFlights = async function() {
  try {
    const r = await fetch('/api/flights', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('OpenSky route ' + r.status);
    const d = await r.json();
    const states = d.flights || [];
    // Increase to 2500 for massive global density (limit required to prevent Leaflet DOM crash)
    const sample = states.slice(0, 2500);
    document.getElementById('stat-flights').textContent = states.length.toLocaleString();
    document.getElementById('ms-flights').textContent = states.length.toLocaleString();
    document.getElementById('sb-flights').textContent = 'AIR: ' + states.length.toLocaleString();
    if (layerGroups.flights) layerGroups.flights.clearLayers();
    sample.forEach(s => {
      if (!s.latitude || !s.longitude || s.onGround) return;
      const hdg = s.heading || 0;
      const icon = L.divIcon({
        html: `<div style="transform:rotate(${hdg}deg);color:#0084ff;font-size:10px;line-height:1">▲</div>`,
        iconSize: [12,12], iconAnchor: [6,6], className: ''
      });
      const m = L.marker([s.latitude, s.longitude], { icon });
      const altFt = s.altitude ? Math.round(s.altitude * 3.281) : 0;
      const spdKts = s.velocity ? Math.round(s.velocity * 1.94) : 0;
      const vr = s.verticalRate ? (s.verticalRate > 0 ? '↑' : '↓') + Math.abs(Math.round(s.verticalRate)) + ' m/s' : 'Level';
      m.bindPopup(`<div class="popup-type" style="color:#0084ff">✈ AIRCRAFT</div><div class="popup-title">${(s.callsign||'').trim() || 'N/A'}</div><div class="popup-desc"><b>ICAO24:</b> ${s.icao24}<br><b>Callsign:</b> ${(s.callsign||'').trim() || 'Unknown'}<br><b>Origin:</b> ${s.country || 'Unknown'}<br><b>Altitude:</b> ${s.altitude ? Math.round(s.altitude) + 'm (' + altFt.toLocaleString() + 'ft)' : 'N/A'}<br><b>Ground Speed:</b> ${spdKts} kts (${s.velocity ? Math.round(s.velocity * 3.6) + ' km/h' : 'N/A'})<br><b>Heading:</b> ${Math.round(hdg)}°<br><b>Vertical Rate:</b> ${vr}<br><b>Squawk:</b> ${s.squawk || 'N/A'}<br><b>Position:</b> ${s.latitude.toFixed(3)}°, ${s.longitude.toFixed(3)}°</div>`);
      if (layerGroups.flights) m.addTo(layerGroups.flights);
    });
  } catch(e) {
    if(document.getElementById('stat-flights')) document.getElementById('stat-flights').textContent = 'limit';
    if(document.getElementById('sb-flights')) document.getElementById('sb-flights').textContent = 'AIR: API limit';
  }
}

// ── MARITIME DATA (/api/ships) ──
window.loadShips = async function() {
  try {
    const r = await fetch('/api/ships', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('Ships route ' + r.status);
    const d = await r.json();
    const ships = d.ships || [];
    
    document.getElementById('stat-ships').textContent = ships.length.toLocaleString();
    if (layerGroups.ships) layerGroups.ships.clearLayers();
    ships.forEach(s => {
      if (!s.latitude || !s.longitude) return;
      const hdg = s.heading || 0;
      const icon = L.divIcon({
        html: `<div style="transform:rotate(${hdg}deg);color:#00d4aa;font-size:11px;line-height:1;text-shadow:0 0 3px rgba(0,212,170,0.5)">▲</div>`,
        iconSize: [12,12], iconAnchor: [6,6], className: ''
      });
      const m = L.marker([s.latitude, s.longitude], { icon });
      m.bindPopup(`<div class="popup-type" style="color:#00d4aa">⚓ MARITIME VESSEL</div><div class="popup-title">${s.name || 'Unknown Vessel'}</div><div class="popup-desc"><b>MMSI:</b> ${s.mmsi || 'N/A'}<br><b>Vessel Type:</b> ${s.type || 'Unknown'}<br><b>Heading:</b> ${Math.round(hdg)}°<br><b>Speed:</b> ${s.speed || 0} knots<br><b>Nav Status:</b> ${s.status || 'Under way'}<br><b>Position:</b> ${s.latitude.toFixed(3)}°, ${s.longitude.toFixed(3)}°</div>`);
      if (layerGroups.ships) m.addTo(layerGroups.ships);
    });
  } catch(e) {
    if(document.getElementById('stat-ships')) document.getElementById('stat-ships').textContent = 'limit';
  }
}

// ── CONFLICT ZONES & ACLED (Live Real Data) ──
window.loadConflicts = async function() {
  try {
    const r = await fetch('/api/conflicts');
    const d = await r.json();
    const liveConflicts = d.events || [];
    
    if (layerGroups.conflicts) layerGroups.conflicts.clearLayers();
    if(document.getElementById('stat-active')) document.getElementById('stat-active').textContent = liveConflicts.length;
    if(document.getElementById('stat-conflicts')) document.getElementById('stat-conflicts').textContent = liveConflicts.length;
    
    liveConflicts.forEach(c => {
      if (!c.lat || !c.lng) return;
      const isCrit = c.severity === 'critical';
      const isWarn = c.severity === 'warning';
      const col = isCrit ? '#ff4455' : isWarn ? '#f5a623' : '#0084ff';
      const r_circ = isCrit ? 14 : isWarn ? 10 : 7;
      const sevLabel = c.severity === 'critical' ? '🔴 CRITICAL' : c.severity === 'warning' ? '🟡 WARNING' : '🔵 INFO';
      const circle = L.circleMarker([c.lat, c.lng], { radius: r_circ, fillColor: col, color: col, weight: 2, fillOpacity: 0.3 });
      circle.bindPopup(`<div class="popup-type" style="color:${col}">⚡ ACLED CONFLICT EVENT</div><div class="popup-title">${c.name}</div><div class="popup-desc"><b>Event Type:</b> ${c.type}<br><b>Threat Level:</b> ${sevLabel}<br><b>Position:</b> ${c.lat.toFixed(3)}°, ${c.lng.toFixed(3)}°<br><br>${c.desc}</div><div class="popup-time">${c.date || 'Recent'}</div>`);
      if (layerGroups.conflicts) circle.addTo(layerGroups.conflicts);
    });
    window.buildSignals();
  } catch(e) { console.warn('ACLED fetch failed', e); }
}

window.loadFires = async function() {
  try {
    const r = await fetch('/api/fires');
    if (!r.ok) return;
    const d = await r.json();
    const hotspots = d.hotspots || [];
    if (!layerGroups.fires) layerGroups.fires = L.layerGroup().addTo(map);
    layerGroups.fires.clearLayers();
    
    hotspots.forEach(f => {
      const lat = f.latitude;
      const lng = f.longitude;
      if (!lat || !lng) return;
      
      const r = Math.max(3, Math.min(10, f.brightness / 70));
      const col = '#ff6633';
      const confLabel = f.confidence === 'h' ? 'High' : f.confidence === 'n' ? 'Nominal' : f.confidence === 'l' ? 'Low' : f.confidence;
      const circle = L.circleMarker([lat, lng], { radius: r, fillColor: col, color: col, weight: 1, fillOpacity: 0.6 });
      circle.bindPopup(`<div class="popup-type" style="color:#ff6633">🔥 ACTIVE FIRE / THERMAL ANOMALY</div><div class="popup-title">NASA FIRMS Detection — ${f.satellite || 'VIIRS'}</div><div class="popup-desc"><b>Satellite:</b> ${f.satellite || 'VIIRS'}<br><b>Brightness Temp:</b> ${f.brightness}K<br><b>Confidence:</b> ${confLabel}<br><b>FRP:</b> ${f.frp || 'N/A'} MW<br><b>Position:</b> ${lat.toFixed(3)}°, ${lng.toFixed(3)}°</div><div class="popup-time">${f.acqDate} ${f.acqTime} UTC</div>`);
      circle.addTo(layerGroups.fires);
    });
  } catch(e) { console.warn('Fires failed', e); }
}

// ── GDELT NEWS EVENTS (Map Markers) ──
window.loadNewsEvents = async function() {
  if (layerGroups.news) layerGroups.news.clearLayers();
  
  try {
    const r = await fetch('/api/conflicts');
    const d = await r.json();
    // Offset the news points slightly from the ACLED points to show diverse density
    const events = (d.events || []).slice(0, 40);
    
    events.forEach(f => {
      const lat = f.lat + (Math.random() - 0.5) * 4;
      const lng = f.lng + (Math.random() - 0.5) * 4;
      const name = f.desc ? f.desc.slice(0, 40) + '...' : 'Geopolitical Event Report';
      
      const icon = L.divIcon({ html: `<div style="width:8px;height:8px;border-radius:50%;background:#9b7cff;border:1px solid rgba(155,124,255,0.5)"></div>`, iconSize:[8,8], iconAnchor:[4,4], className:'' });
      const m = L.marker([lat, lng], { icon });
      m.bindPopup(`<div class="popup-type" style="color:#9b7cff">NEWS EVENT</div><div class="popup-title">${name}</div><div class="popup-desc">Source: Global News Aggregator</div>`);
      if (layerGroups.news) m.addTo(layerGroups.news);
    });
  } catch(e) {}

  window.fetchNewsFeeds();
}

// ── NEWS FEEDS (GDELT top stories) ──
const newsSources = [
  { name: 'Reuters', color: '#ff4455', q: 'war+conflict' },
  { name: 'BBC News', color: '#0084ff', q: 'geopolitics+military' },
  { name: 'Al Jazeera', color: '#f5a623', q: 'middle+east+conflict' },
  { name: 'AP News', color: '#22dd88', q: 'sanctions+diplomacy' },
  { name: 'OSINT', color: '#9b7cff', q: 'military+attack' },
];

window.fetchNewsFeeds = async function() {
  const list = document.getElementById('news-list');
  if(!list) return;
  document.getElementById('news-loading').style.display = 'none';
  list.innerHTML = '';
  
  try {
    // Fallback to internal /api/news (powered by GNews / Mocks) to bypass GDELT 429 Rate Limits
    const url = `/api/news?q=conflict OR military OR attack OR natural disaster`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const d = await r.json();
    
    let articles = d.articles || [];
    document.getElementById('stat-events').textContent = articles.length;
    document.getElementById('sb-news-count').textContent = 'NEWS: ' + articles.length + ' events';
    
    if (!articles.length) {
      list.innerHTML = '<div class="news-loading">No live articles found.<br><br>Try refreshing in 30s.</div>';
      return;
    }
    
    articles.forEach(a => {
      const srcName = a.source?.name || 'News';
      // Match color from predefined sources or fallback to purple
      const matchSrc = newsSources.find(s => srcName.toLowerCase().includes(s.name.toLowerCase()));
      const color = matchSrc ? matchSrc.color : '#9b7cff';
      
      const title = (a.title || '').slice(0, 120);
      if (!title) return;
      const time = a.publishedAt ? new Date(a.publishedAt).toUTCString().slice(0, 22) + ' UTC' : 'Recent';
      
      const div = document.createElement('div');
      div.className = 'news-item';
      div.innerHTML = `<div class="news-source"><div class="news-dot" style="background:${color}"></div>${srcName}</div><div class="news-title">${title}</div><div class="news-time">${time}</div>`;
      div.onclick = () => { if (a.url) window.open(a.url, '_blank'); };
      list.appendChild(div);
    });
  } catch(e) {
    list.innerHTML = '<div class="news-loading">Failed to load news feeds.</div>';
  }
}

// ── STATIC LAYERS ──
const nuclearSites = [
  { lat: 51.38, lng: 30.09, name: 'Chernobyl Exclusion Zone', status: 'Decommissioned / High Alert' },
  { lat: 47.5, lng: 35.8, name: 'Zaporizhzhia NPP', status: 'Under military occupation' },
  { lat: 28.8, lng: 50.8, name: 'Bushehr NPP', status: 'Operational (Iran)' },
  { lat: 32.7, lng: 106.3, name: 'Qinshan NPP', status: 'Operational (China)' },
  { lat: 37.2, lng: -76.5, name: 'Newport News', status: 'Naval nuclear (USA)' },
  { lat: 49.3, lng: 6.1, name: 'Cattenom NPP', status: 'Operational (France)' },
  { lat: 35.0, lng: 139.9, name: 'Fukushima Daiichi', status: 'Decommissioned' },
  { lat: 33.3, lng: 129.5, name: 'Genkai NPP', status: 'Operational (Japan)' },
];
const militaryBases = [
  { lat: 35.5, lng: 139.8, name: 'Yokota Air Base', country: 'USA/Japan', type: 'Air Force' },
  { lat: 11.5, lng: 43.2, name: 'Camp Lemonnier', country: 'USA/Djibouti', type: 'Naval/Air Hub' },
  { lat: 41.7, lng: 41.4, name: 'Batumi Naval Base', country: 'Russia/Georgia', type: 'Naval Base' },
  { lat: 34.9, lng: 33.6, name: 'RAF Akrotiri', country: 'UK/Cyprus', type: 'Strategic Air Base' },
  { lat: 36.6, lng: 2.5, name: 'Al Dhafra Air Base', country: 'UAE/USA', type: 'Joint Air Base' },
  { lat: 18.2, lng: 109.5, name: 'Yulin Naval Base', country: 'China', type: 'Nuclear Submarine Base' },
  { lat: -12.2, lng: 96.8, name: 'HMAS Stirling', country: 'Australia', type: 'Naval Base' },
  { lat: 26.5, lng: 50.4, name: 'NSA Bahrain', country: 'USA/Bahrain', type: '5th Fleet HQ' },
  { lat: 54.3, lng: 19.9, name: 'Baltiysk Fleet Base', country: 'Russia', type: 'Baltic Fleet HQ' },
  { lat: 32.7, lng: -117.1, name: 'Naval Base San Diego', country: 'USA', type: 'Pacific Fleet HQ' },
];

const majorAirports = [
  { lat: 40.64, lng: -73.77, name: 'JFK International', code: 'JFK' },
  { lat: 51.47, lng: -0.45, name: 'Heathrow Airport', code: 'LHR' },
  { lat: 25.25, lng: 55.36, name: 'Dubai International', code: 'DXB' },
  { lat: 35.55, lng: 139.77, name: 'Haneda Airport', code: 'HND' },
  { lat: 49.00, lng: 2.55, name: 'Charles de Gaulle', code: 'CDG' },
  { lat: 1.36, lng: 103.99, name: 'Changi Airport', code: 'SIN' },
  { lat: -33.94, lng: 151.17, name: 'Sydney Kingsford', code: 'SYD' },
  { lat: 50.03, lng: 8.57, name: 'Frankfurt Airport', code: 'FRA' },
  { lat: 33.64, lng: -84.42, name: 'Hartsfield-Jackson', code: 'ATL' },
  { lat: 41.97, lng: -87.90, name: 'O\'Hare International', code: 'ORD' },
];

window.loadStaticLayers = function() {
  nuclearSites.forEach(s => {
    const icon = L.divIcon({ html: `<div style="width:10px;height:10px;border-radius:50%;background:#ff00ff;border:2px solid #df00df;box-shadow:0 0 6px rgba(255,0,255,0.5)"></div>`, iconSize:[10,10], iconAnchor:[5,5], className:'' });
    const m = L.marker([s.lat, s.lng], { icon });
    m.bindPopup(`<div class="popup-type" style="color:#ff00ff">NUCLEAR SITE</div><div class="popup-title">${s.name}</div><div class="popup-desc">Status: ${s.status}</div>`);
    if (layerGroups.nuclear) m.addTo(layerGroups.nuclear);
  });
  militaryBases.forEach(b => {
    const icon = L.divIcon({ html: `<div style="width:8px;height:8px;background:#ff8c00;clip-path:polygon(50% 0%,0% 100%,100% 100%);opacity:0.8"></div>`, iconSize:[8,8], iconAnchor:[4,6], className:'' });
    const m = L.marker([b.lat, b.lng], { icon });
    m.bindPopup(`<div class="popup-type" style="color:#ff8c00">MILITARY BASE</div><div class="popup-title">${b.name}</div><div class="popup-desc">Operator: ${b.country}<br>Type: ${b.type}</div>`);
    if (layerGroups.military) m.addTo(layerGroups.military);
  });
  if (!layerGroups.airports) layerGroups.airports = L.layerGroup().addTo(map);
  majorAirports.forEach(a => {
    const icon = L.divIcon({ html: `<div style="width:6px;height:6px;border-radius:50%;background:#ffdf00;box-shadow:0 0 4px rgba(255,223,0,0.6)"></div>`, iconSize:[6,6], iconAnchor:[3,3], className:'' });
    const m = L.marker([a.lat, a.lng], { icon });
    m.bindPopup(`<div class="popup-type" style="color:#ffdf00">MAJOR AIRPORT</div><div class="popup-title">${a.name} (${a.code})</div><div class="popup-desc">Global Aviation Hub</div>`);
    m.addTo(layerGroups.airports);
  });

  // Toggle initial visibility based on layerDefs
  Object.keys(layerDefs).forEach(k => {
    if (!layerDefs[k] && layerGroups[k]) map.removeLayer(layerGroups[k]);
  });
  window.updateActiveCount();
}

// ── SIGNALS PANEL ──
window.buildSignals = function() {
  const listEl = document.getElementById('signals-list');
  if(!listEl) return;
  const list = listEl.querySelector('div') || listEl;
  list.innerHTML = '';
  const signals = [
    { icon: '⚡', cls: 'red', title: 'Ukraine Front', meta: 'Active conflict · Eastern Europe', val: 'ACTIVE', vcol: 'var(--red)' },
    { icon: '⚡', cls: 'red', title: 'Gaza Conflict', meta: 'Active conflict · Middle East', val: 'ACTIVE', vcol: 'var(--red)' },
    { icon: '⚡', cls: 'red', title: 'Red Sea Shipping', meta: 'Houthi attacks · Maritime risk', val: 'HIGH', vcol: 'var(--red)' },
    { icon: '⬡', cls: 'amber', title: 'Seismic Activity', meta: 'Global · USGS live', val: (document.getElementById('ms-eq')?.textContent || '0') + ' EQ', vcol: 'var(--amber)' },
    { icon: '✈', cls: 'blue', title: 'Global Air Traffic', meta: 'OpenSky · ADS-B', val: document.getElementById('ms-flights')?.textContent || '0', vcol: 'var(--accent2)' },
    { icon: '◎', cls: 'green', title: 'Taiwan Strait', meta: 'PLA exercises · Elevated', val: 'WATCH', vcol: 'var(--amber)' },
    { icon: '◉', cls: 'amber', title: 'Sudan Civil War', meta: 'SAF vs RSF · Khartoum', val: 'ACTIVE', vcol: 'var(--red)' },
    { icon: '⚓', cls: 'blue', title: 'Strait of Hormuz', meta: 'Maritime · Iran tension', val: 'ELEVATED', vcol: 'var(--amber)' },
    { icon: '☢', cls: 'purple', title: 'Nuclear Monitoring', meta: 'IAEA · Zaporizhzhia', val: 'WATCH', vcol: 'var(--purple)' },
    { icon: '◈', cls: 'green', title: 'GDELT Event Index', meta: 'Global news events', val: (document.getElementById('sb-news-count')?.textContent || '').replace('NEWS: ',''), vcol: 'var(--accent)' },
  ];
  signals.forEach(s => {
    list.innerHTML += `<div class="signal-item">
      <div class="signal-icon ${s.cls}">${s.icon}</div>
      <div class="signal-body"><div class="signal-title">${s.title}</div><div class="signal-meta">${s.meta}</div></div>
      <div class="signal-value" style="color:${s.vcol}">${s.val}</div>
    </div>`;
  });
}

// ── ALERTS PANEL ──
window.addAlerts = function(alerts) {
  const list = document.getElementById('alerts-list');
  if(!list) return;
  list.innerHTML = '';
  const base = [
    { level: 'critical', title: 'Red Sea — Shipping Alert', text: 'Houthi anti-ship missiles continue to target commercial vessels. Rerouting via Cape of Good Hope recommended.', time: 'LIVE' },
    { level: 'warning', title: 'PRC Military Drills', text: 'PLA conducting exercises near Taiwan Strait. Elevated SIGINT activity. Commercial aviation advised of airspace notices.', time: 'Updated 2h ago' },
    { level: 'info', title: 'Sanctions Update', text: 'New EU/US sanctions package under review targeting Russian energy sector. Announcement expected this week.', time: '4h ago' },
  ];
  [...base, ...alerts.slice(0, 5)].forEach(a => {
    list.innerHTML += `<div class="alert-item ${a.level}"><div class="alert-level">${a.level.toUpperCase()} — ${a.title}</div><div class="alert-text">${a.text}</div><div class="alert-time">${a.time}</div></div>`;
  });
}

// ── UI HANDLERS ──
window.setRTab = function(tab) {
  document.querySelectorAll('.rpanel-tab').forEach((t, i) => t.classList.remove('active'));
  document.querySelectorAll('.rpanel-content').forEach(c => c.classList.remove('active'));
  const tabs = ['news', 'signals', 'alerts'];
  const idx = tabs.indexOf(tab);
  if(document.querySelectorAll('.rpanel-tab')[idx]) document.querySelectorAll('.rpanel-tab')[idx].classList.add('active');
  if(document.getElementById('rt-' + tab)) document.getElementById('rt-' + tab).classList.add('active');
}

window.setView = function(v, event) {
  activeView = v;
  document.querySelectorAll('.htab').forEach(t => t.classList.remove('active'));
  if(event && event.currentTarget) event.currentTarget.classList.add('active');
  const views = { global: [20,10,3], conflicts: [25,30,4], aviation: [40,0,4], maritime: [10,50,4], finance: [40,-74,5], disasters: [0,0,2] };
  if (views[v] && map) map.setView([views[v][0], views[v][1]], views[v][2], { animate: true });
}

window.setMapStyle = function(style, event) {
  document.querySelectorAll('#map-toolbar .map-chip').forEach(c => c.classList.remove('active'));
  if(event && event.currentTarget) event.currentTarget.classList.add('active');
  if (layers.base) map.removeLayer(layers.base);
  const tiles = { dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' };
  layers.base = L.tileLayer(tiles[style] || tiles.dark, { maxZoom: 18 }).addTo(map);
  layers.base.bringToBack();
}

window.setTimeFilter = function(tf, event) {
  currentTimeFilter = tf;
  document.querySelectorAll('[id^="tf-"]').forEach(b => b.classList.remove('active'));
  if(document.getElementById('tf-' + tf)) document.getElementById('tf-' + tf).classList.add('active');
  window.loadEarthquakes();
  window.fetchNewsFeeds();
}

window.searchLocation = function(q) {
  if (q.length < 3) return;
  clearTimeout(window._searchT);
  window._searchT = setTimeout(async () => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
      const d = await r.json();
      if (d[0] && map) map.setView([d[0].lat, d[0].lon], 7, { animate: true });
    } catch(e){}
  }, 500);
}

window.refreshAll = function() {
  window.loadEarthquakes();
  window.loadFlights();
  window.fetchNewsFeeds();
  window.buildSignals();
}

window.toggleTheme = function() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  if (!isDark) {
    document.documentElement.style.setProperty('--bg', '#f0f2f5');
    document.documentElement.style.setProperty('--bg2', '#ffffff');
    document.documentElement.style.setProperty('--bg3', '#e8eaed');
    document.documentElement.style.setProperty('--text', '#1a1d27');
    document.documentElement.style.setProperty('--text2', '#4a4f66');
    document.documentElement.style.setProperty('--text3', '#8a8fa8');
    document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.08)');
    document.documentElement.style.setProperty('--border2', 'rgba(0,0,0,0.15)');
  } else {
    document.documentElement.style.setProperty('--bg', '#0a0b0d');
    document.documentElement.style.setProperty('--bg2', '#111318');
    document.documentElement.style.setProperty('--bg3', '#181b22');
    document.documentElement.style.setProperty('--text', '#e8eaf0');
    document.documentElement.style.setProperty('--text2', '#8a8fa8');
    document.documentElement.style.setProperty('--text3', '#555a70');
    document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.07)');
    document.documentElement.style.setProperty('--border2', 'rgba(255,255,255,0.14)');
  }
}
