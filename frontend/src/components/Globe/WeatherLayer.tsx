'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';

export default function WeatherLayer() {
  const layers = useStore(state => state.layers);
  const entitiesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!layers.weather) {
      cleanup();
      return;
    }
    fetchAndRender();
    return () => cleanup();
  }, [layers.weather]);

  function cleanup() {
    const viewer = window.__cesiumViewer;
    if (!viewer) return;
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];
  }

  async function fetchAndRender() {
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) return;
      const data = await res.json();
      renderWeather(data.weather || []);
    } catch (e) {
      console.error('[WeatherLayer] Fetch error:', e);
    }
  }

  function renderWeather(stations: any[]) {
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    cleanup();

    stations.forEach((w: any, i: number) => {
      const id = 'weather-' + i;
      const tempColor = w.temp > 35 ? '#ef4444' : w.temp > 25 ? '#f97316' : w.temp > 15 ? '#eab308' : w.temp > 5 ? '#22d3ee' : '#3b82f6';

      viewer.entities.add({
        id,
        name: w.city + ' Weather',
        description: '<b>City:</b> ' + w.city + '<br/><b>Temperature:</b> ' + w.temp + '°C<br/><b>Condition:</b> ' + w.description + '<br/><b>Humidity:</b> ' + w.humidity + '%<br/><b>Wind:</b> ' + w.windSpeed + ' km/h',
        position: Cesium.Cartesian3.fromDegrees(w.longitude, w.latitude, 50000),
        label: {
          text: w.temp + '\u00B0C',
          font: '14px "JetBrains Mono"',
          fillColor: Cesium.Color.fromCssColorString(tempColor),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
        },
        point: {
          pixelSize: 6,
          color: Cesium.Color.fromCssColorString(tempColor),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
        },
      });

      entitiesRef.current.push(id);
    });
  }

  return null;
}
