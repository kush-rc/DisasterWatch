'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLong, degreesLat } from 'satellite.js';

interface SatTLE {
  name: string;
  line1: string;
  line2: string;
  group: string;
}

export default function SatelliteLayer() {
  const layers = useStore(state => state.layers);
  const setSatelliteCount = useStore(state => state.setSatelliteCount);
  const entitiesRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tlesRef = useRef<SatTLE[]>([]);

  useEffect(() => {
    if (!layers.satellites) {
      cleanup();
      return;
    }

    fetchAndRender();
    intervalRef.current = setInterval(updatePositions, 5000);

    return () => cleanup();
  }, [layers.satellites]);

  function cleanup() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const viewer = window.__cesiumViewer;
    if (!viewer) return;
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];
    setSatelliteCount(0);
  }

  async function fetchAndRender() {
    try {
      const res = await fetch('/api/satellites');
      if (!res.ok) return;
      const data = await res.json();
      tlesRef.current = data.satellites || [];
      renderSatellites();
    } catch (e) {
      console.error('[SatelliteLayer] Fetch error:', e);
    }
  }

  function renderSatellites() {
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    cleanup();
    const now = new Date();
    const gmst = gstime(now);

    tlesRef.current.forEach((sat, i) => {
      try {
        const satrec = twoline2satrec(sat.line1, sat.line2);
        const posVel: any = propagate(satrec, now);
        if (!posVel || !posVel.position || typeof posVel.position === 'boolean') return;

        const geo = eciToGeodetic(posVel.position, gmst);
        const lon = degreesLong(geo.longitude);
        const lat = degreesLat(geo.latitude);
        const alt = geo.height * 1000;

        const id = 'sat-' + i;
        const isISS = sat.name.includes('ISS');
        const isStation = sat.group === 'STATIONS';

        viewer.entities.add({
          id,
          name: sat.name,
          description: '<b>Group:</b> ' + sat.group + '<br/><b>Altitude:</b> ' + Math.round(geo.height) + ' km<br/><b>Latitude:</b> ' + lat.toFixed(2) + '<br/><b>Longitude:</b> ' + lon.toFixed(2),
          position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
          point: {
            pixelSize: isISS ? 10 : isStation ? 6 : 4,
            color: isISS ? Cesium.Color.GOLD : Cesium.Color.fromCssColorString('rgba(34,211,238,0.8)'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isISS ? 1 : 0,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, isISS ? 50000000 : 20000000),
          },
          label: (isISS || isStation) ? {
            text: sat.name,
            font: isISS ? '12px "JetBrains Mono"' : '9px "JetBrains Mono"',
            fillColor: isISS ? Cesium.Color.GOLD : Cesium.Color.CYAN,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -14),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, isISS ? 30000000 : 10000000),
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
            scale: isISS ? 1 : 0.8,
          } : undefined,
        });

        entitiesRef.current.push(id);
      } catch {
        // Skip invalid TLEs
      }
    });

    setSatelliteCount(entitiesRef.current.length);
  }

  function updatePositions() {
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    const now = new Date();
    const gmst = gstime(now);

    tlesRef.current.forEach((sat, i) => {
      try {
        const satrec = twoline2satrec(sat.line1, sat.line2);
        const posVel: any = propagate(satrec, now);
        if (!posVel || !posVel.position || typeof posVel.position === 'boolean') return;

        const geo = eciToGeodetic(posVel.position, gmst);
        const lon = degreesLong(geo.longitude);
        const lat = degreesLat(geo.latitude);
        const alt = geo.height * 1000;

        const entity = viewer.entities.getById('sat-' + i);
        if (entity) {
          entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        }
      } catch {
        // Skip
      }
    });
  }

  return null;
}
