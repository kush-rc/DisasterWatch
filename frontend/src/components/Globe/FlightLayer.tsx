'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';

interface FlightData {
  icao24: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
}

export default function FlightLayer() {
  const layers = useStore(state => state.layers);
  const setFlightCount = useStore(state => state.setFlightCount);
  const entitiesRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!layers.flights) {
      cleanup();
      return;
    }

    fetchAndRender();
    intervalRef.current = setInterval(fetchAndRender, 30000);

    return () => cleanup();
  }, [layers.flights]);

  function cleanup() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const viewer = window.__cesiumViewer;
    if (!viewer) return;
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];
    setFlightCount(0);
  }

  async function fetchAndRender() {
    try {
      const res = await fetch('/api/flights');
      if (!res.ok) return;
      const data = await res.json();
      const flights: FlightData[] = data.flights || [];

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
      flights.forEach((flight) => {
        if (flight.onGround) return;
        if (!flight.longitude || !flight.latitude) return;

        const id = `flight-${batch}-${flight.icao24}`;

        // Color by altitude
        let color;
        if (flight.altitude > 10000) color = Cesium.Color.fromCssColorString('rgba(139, 92, 246, 0.85)');
        else if (flight.altitude > 5000) color = Cesium.Color.fromCssColorString('rgba(59, 130, 246, 0.85)');
        else color = Cesium.Color.fromCssColorString('rgba(245, 158, 11, 0.85)');

        const speedKnots = Math.round(flight.velocity * 1.944);
        const altFeet = Math.round(flight.altitude * 3.281);
        const callsign = flight.callsign || flight.icao24;

        viewer.entities.add({
          id,
          name: callsign,
          description: '<b>Callsign:</b> ' + callsign + '<br/><b>Country:</b> ' + flight.country + '<br/><b>Altitude:</b> ' + altFeet + ' ft (' + Math.round(flight.altitude) + ' m)<br/><b>Speed:</b> ' + speedKnots + ' kts (' + Math.round(flight.velocity) + ' m/s)<br/><b>Heading:</b> ' + Math.round(flight.heading) + '&deg;<br/><b>ICAO24:</b> ' + flight.icao24,
          position: Cesium.Cartesian3.fromDegrees(flight.longitude, flight.latitude, flight.altitude),
          point: {
            pixelSize: 8,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
          },
          label: {
            text: callsign,
            font: '10px "JetBrains Mono"',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(12, 0),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
            scale: 0.8,
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          },
        });

        entitiesRef.current.push(id);
      });

      setFlightCount(entitiesRef.current.length);
    } catch (e) {
      console.error('[FlightLayer] Fetch error:', e);
    }
  }
  return null;
}
