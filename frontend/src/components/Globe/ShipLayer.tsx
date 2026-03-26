'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';

interface ShipData {
  mmsi: string;
  name: string;
  type: string;
  flag: string;
  country: string;
  longitude: number;
  latitude: number;
  heading: number;
  speed: number;
  length: number;
  status: string;
}

export default function ShipLayer() {
  const layers = useStore(state => state.layers);
  const setShipCount = useStore(state => state.setShipCount);
  const entitiesRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!layers.ships) {
      cleanup();
      return;
    }

    fetchAndRender();
    intervalRef.current = setInterval(fetchAndRender, 60000); // Refresh every 60s

    return () => cleanup();
  }, [layers.ships]);

  function cleanup() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const viewer = window.__cesiumViewer;
    if (!viewer) return;
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];
    setShipCount(0);
  }

  async function fetchAndRender() {
    try {
      const res = await fetch('/api/ships');
      if (!res.ok) return;
      const data = await res.json();
      const ships: ShipData[] = data.ships || [];

      const Cesium = window.Cesium;
      const viewer = window.__cesiumViewer;
      if (!Cesium || !viewer) return;

      // Remove old entities (double cleanup for race condition)
      entitiesRef.current.forEach(id => {
        const ent = viewer.entities.getById(id);
        if (ent) viewer.entities.remove(ent);
      });
      entitiesRef.current = [];

      const batch = Date.now();
      ships.forEach((ship) => {
        if (!ship.longitude || !ship.latitude) return;

        const id = `ship-${batch}-${ship.mmsi}`;

        // Color by ship type
        let color;
        switch (ship.type) {
          case 'Container Ship':
            color = Cesium.Color.fromCssColorString('rgba(59, 130, 246, 0.9)');
            break;
          case 'Tanker':
          case 'LNG Carrier':
            color = Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.9)');
            break;
          case 'Cruise Ship':
          case 'Passenger Ship':
            color = Cesium.Color.fromCssColorString('rgba(168, 85, 247, 0.9)');
            break;
          case 'Bulk Carrier':
            color = Cesium.Color.fromCssColorString('rgba(245, 158, 11, 0.9)');
            break;
          case 'Icebreaker':
            color = Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.9)');
            break;
          default:
            color = Cesium.Color.fromCssColorString('rgba(34, 197, 94, 0.9)');
        }

        const speedKnots = ship.speed.toFixed(1);
        const displayName = ship.flag + ' ' + ship.name;

        viewer.entities.add({
          id,
          name: ship.name,
          description:
            '<b>Name:</b> ' + ship.name +
            '<br/><b>Type:</b> ' + ship.type +
            '<br/><b>Flag:</b> ' + ship.flag + ' ' + ship.country +
            '<br/><b>Speed:</b> ' + speedKnots + ' kts' +
            '<br/><b>Heading:</b> ' + ship.heading + '°' +
            '<br/><b>Length:</b> ' + ship.length + ' m' +
            '<br/><b>Status:</b> ' + ship.status +
            '<br/><b>MMSI:</b> ' + ship.mmsi,
          position: Cesium.Cartesian3.fromDegrees(ship.longitude, ship.latitude, 0),
          point: {
            pixelSize: 7,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
          },
          label: {
            text: displayName,
            font: '10px "JetBrains Mono"',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(12, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4000000),
            scale: 0.75,
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          },
        });

        entitiesRef.current.push(id);
      });

      setShipCount(entitiesRef.current.length);
    } catch (e) {
      console.error('[ShipLayer] Fetch error:', e);
    }
  }
  return null;
}
