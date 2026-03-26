"use client";

import { useEffect, useRef, useState } from "react";
import ShaderControls from "./ShaderControls";
import DisasterLayer from "./DisasterLayer";
import SatelliteLayer from "./SatelliteLayer";
import FlightLayer from "./FlightLayer";
import ShipLayer from "./ShipLayer";
import WeatherLayer from "./WeatherLayer";
import NewsPinsLayer from "./NewsPinsLayer";
import ConflictLayer from "./ConflictLayer";
import SituationHeader from "@/components/Layout/SituationHeader";
import SituationLeftPanel from "@/components/Layout/SituationLeftPanel";
import SituationRightPanel from "@/components/Layout/SituationRightPanel";
import SituationStatusBar from "@/components/Layout/SituationStatusBar";
import MapOverlays from "@/components/UI/MapOverlays";
import InfoPopup from "@/components/UI/InfoPopup";

declare global {
  interface Window {
    Cesium: any;
    __cesiumViewer: any;
  }
}

export default function GlobeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    function waitForCesium(): Promise<any> {
      return new Promise((resolve) => {
        if (window.Cesium) return resolve(window.Cesium);
        const check = setInterval(() => {
          if (window.Cesium) { clearInterval(check); resolve(window.Cesium); }
        }, 100);
      });
    }

    async function initCesium() {
      const Cesium = await waitForCesium();
      if (!mounted || !containerRef.current) return;

      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "";

      try {
        const viewer = new Cesium.Viewer(containerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          selectionIndicator: false,
          targetFrameRate: 60,
          requestRenderMode: false,
          skyAtmosphere: new Cesium.SkyAtmosphere(),
          skyBox: new Cesium.SkyBox({
            sources: {
              positiveX: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_px.jpg"),
              negativeX: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mx.jpg"),
              positiveY: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_py.jpg"),
              negativeY: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_my.jpg"),
              positiveZ: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_pz.jpg"),
              negativeZ: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mz.jpg"),
            },
          }),
        });

        const scene = viewer.scene;
        scene.globe.enableLighting = true;
        scene.fog.enabled = true;
        scene.fog.density = 0.0002;
        scene.postProcessStages.fxaa.enabled = true;
        scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0e14');

        // Switch to Dark CARTO basemap by default (matches reference)
        try {
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              maximumLevel: 18,
              credit: 'CARTO',
            })
          );
        } catch {
          console.warn("[DisasterWatch] Could not set dark basemap");
        }

        try {
          const osmBuildings = await Cesium.createOsmBuildingsAsync();
          scene.primitives.add(osmBuildings);
        } catch { /* skip */ }

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(35.0, 30.0, 12000000),
          duration: 3,
          orientation: { heading: 0, pitch: -Math.PI / 2.5, roll: 0 },
        });

        viewerRef.current = viewer;
        window.__cesiumViewer = viewer;

        if (mounted) setReady(true);
        console.log("[DisasterWatch] Globe initialized");
      } catch (error) {
        console.error("[DisasterWatch] Init error:", error);
      }
    }

    initCesium();
    return () => {
      mounted = false;
      if (viewerRef.current) { try { viewerRef.current.destroy(); } catch {} }
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--bg)] text-[13px] text-[var(--text)] font-sans">
      <SituationHeader />

      <div className="flex flex-1 overflow-hidden relative" style={{ top: '44px', bottom: '24px', position: 'absolute', left: 0, right: 0 }}>
        
        <SituationLeftPanel />

        <div className="flex-1 relative" id="map-container">
          <div
            ref={containerRef}
            id="cesiumContainer"
            className="absolute inset-0 w-full h-full"
            style={{ background: '#060810' }}
          />

          {ready && (
            <>
              {/* Data Layers (logical — no DOM) */}
              <ShaderControls />
              <DisasterLayer />
              <SatelliteLayer />
              <FlightLayer />
              <ShipLayer />
              <WeatherLayer />
              <NewsPinsLayer />
              <ConflictLayer />

              {/* Map Floating UI */}
              <MapOverlays />
            </>
          )}

          <InfoPopup />

          {/* Zoom Controls (right side of center map) */}
          <div className="absolute right-3 bottom-[120px] z-30 flex flex-col gap-0.5 pointer-events-auto">
            <button
              onClick={() => {
                const viewer = window.__cesiumViewer;
                if (viewer) viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.3);
              }}
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all hover:bg-white/10"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >+</button>
            <button
              onClick={() => {
                const viewer = window.__cesiumViewer;
                if (viewer) viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.3);
              }}
              className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all hover:bg-white/10"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >-</button>
          </div>
        </div>

        <SituationRightPanel />
        
      </div>

      <SituationStatusBar />
    </div>
  );
}
