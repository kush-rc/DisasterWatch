// ═══════════════════════════════════════════════════════
// DisasterWatch — Global State (Zustand)
// ═══════════════════════════════════════════════════════

import { create } from 'zustand';
import type { ShaderMode, GlobeView, LayerVisibility, DisasterEvent, AIBrief } from '@/types';

export interface InfoPopup {
  title: string;
  description: string;
  position?: { x: number; y: number };
}

export type ActiveView = 'global' | 'conflicts' | 'aviation' | 'maritime' | 'finance' | 'disasters';
export type TimeFilter = '1h' | '6h' | '24h' | '7d';

interface AppState {
  // ─── Visual ───
  activeView: ActiveView;
  timeFilter: TimeFilter;
  setView: (view: ActiveView) => void;
  setTimeFilter: (tf: TimeFilter) => void;
  
  shaderMode: ShaderMode;
  globeView: GlobeView;
  setShaderMode: (mode: ShaderMode) => void;
  setGlobeView: (view: GlobeView) => void;

  // ─── Layers ───
  layers: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;

  // ─── Data ───
  events: DisasterEvent[];
  setEvents: (events: DisasterEvent[]) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // ─── AI Brief ───
  aiBrief: AIBrief | null;
  setAIBrief: (brief: AIBrief | null) => void;

  // ─── Info Popup (for any clicked entity) ───
  infoPopup: InfoPopup | null;
  setInfoPopup: (popup: InfoPopup | null) => void;

  // ─── UI State ───
  feedPanelOpen: boolean;
  setFeedPanelOpen: (open: boolean) => void;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  detailsPanelOpen: boolean;
  toggleLeftPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setDetailsPanelOpen: (open: boolean) => void;

  // ─── Panel Z-Index Management ───
  panelZIndex: {
    liveTv: number;
    infoPopup: number;
    alertPanel: number;
    marketAnalysis: number;
  };
  bringToFront: (panel: 'liveTv' | 'infoPopup' | 'alertPanel' | 'marketAnalysis') => void;

  // ─── Counts ───
  flightCount: number;
  satelliteCount: number;
  shipCount: number;
  setFlightCount: (n: number) => void;
  setSatelliteCount: (n: number) => void;
  setShipCount: (n: number) => void;
}

export const useStore = create<AppState>((set) => ({
  // ─── Visual ───
  activeView: 'global',
  timeFilter: '1h',
  setView: (view) => set({ activeView: view }),
  setTimeFilter: (tf) => set({ timeFilter: tf }),
  
  shaderMode: 'STANDARD',
  globeView: 'default',
  setShaderMode: (mode) => set({ shaderMode: mode }),
  setGlobeView: (view) => set({ globeView: view }),

  // ─── Layers ───
  layers: {
    earthquakes: true,
    fires: true,
    floods: true,
    cyclones: true,
    satellites: true,
    flights: true,
    ships: true,
    news: true,
    weather: false,
    conflict: false,
    cameras: false,
    markets: false,
    military: false,
    nuclear: false,
    airports: false,
    cables: false,
    datacenters: false,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),

  // ─── Data ───
  events: [],
  setEvents: (events) => set({ events }),
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  // ─── AI Brief ───
  aiBrief: null,
  setAIBrief: (brief) => set({ aiBrief: brief }),

  // ─── Info Popup ───
  infoPopup: null,
  setInfoPopup: (popup) => set({ infoPopup: popup }),

  // ─── UI State ───
  feedPanelOpen: true,
  setFeedPanelOpen: (open) => set({ feedPanelOpen: open }),
  leftPanelOpen: false,
  rightPanelOpen: false,
  detailsPanelOpen: false,
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setDetailsPanelOpen: (open) => set({ detailsPanelOpen: open }),

  // ─── Panel Z-Index Management ───
  panelZIndex: {
    liveTv: 50,
    infoPopup: 50,
    alertPanel: 50,
    marketAnalysis: 50,
  },
  bringToFront: (panel) => set((state) => {
    const maxZ = Math.max(state.panelZIndex.liveTv, state.panelZIndex.infoPopup, state.panelZIndex.alertPanel, state.panelZIndex.marketAnalysis);
    return {
      panelZIndex: {
        ...state.panelZIndex,
        [panel]: maxZ + 1,
      }
    };
  }),

  // ─── Counts ───
  flightCount: 0,
  satelliteCount: 0,
  shipCount: 0,
  setFlightCount: (n) => set({ flightCount: n }),
  setSatelliteCount: (n) => set({ satelliteCount: n }),
  setShipCount: (n) => set({ shipCount: n }),
}));
