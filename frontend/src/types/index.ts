// ═══════════════════════════════════════════════════════
// DisasterWatch — TypeScript Type Definitions
// ═══════════════════════════════════════════════════════

// ─── Visual Modes ───
export type ShaderMode = 'STANDARD' | 'NVG' | 'FLIR' | 'CRT' | 'ANIME';

// ─── Globe View Modes ───
export type GlobeView = 'default' | 'dark' | 'satellite' | 'toner' | 'watercolor' | 'terrain' | 'night' | 'sentinel';

// ─── Disaster Categories ───
export type DisasterCategory = 'earthquake' | 'flood' | 'fire' | 'cyclone' | 'volcano' | 'storm' | 'drought';
export type EventCategory = 'conflict' | 'political' | 'humanitarian' | 'economic' | 'disaster';
export type Severity = 1 | 2 | 3 | 4 | 5;

// ─── Satellite ───
export interface Satellite {
  noradId: number;
  name: string;
  type: 'earth-obs' | 'weather' | 'station' | 'comms';
  color: string;
  latitude?: number;
  longitude?: number;
  altitude?: number; // km
  velocity?: number; // km/s
}

// ─── Flight ───
export interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude: number;     // meters
  velocity: number;     // m/s
  heading: number;      // degrees
  verticalRate: number; // m/s
  onGround: boolean;
}

// ─── Ship ───
export interface Ship {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;  // knots
  shipType: string;
}

// ─── Disaster Event ───
export interface DisasterEvent {
  id: string;
  title: string;
  category: EventCategory;
  severity: Severity;
  summary: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  source: string;
  sourceUrl: string;
  timestamp: string;
  timeAgo: string;
  confidence: number;
}

// ─── Fire Hotspot (NASA FIRMS) ───
export interface FireHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acqDate: string;
  acqTime: string;
  satellite: string;
}

// ─── Earthquake (USGS) ───
export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  latitude: number;
  longitude: number;
  depth: number;
  tsunami: boolean;
  significance: number;
}

// ─── News Article ───
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

// ─── AI Brief ───
export interface AIBrief {
  summary: string;
  timestamp: string;
  activeDisasters: number;
  threatLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

// ─── Layer Visibility ───
export interface LayerVisibility {
  earthquakes: boolean;
  fires: boolean;
  floods: boolean;
  cyclones: boolean;
  satellites: boolean;
  flights: boolean;
  ships: boolean;
  news: boolean;
  weather: boolean;
  conflict: boolean;
  cameras: boolean;
  markets: boolean;
  military: boolean;
  nuclear: boolean;
  airports: boolean;
  cables: boolean;
  datacenters: boolean;
}
