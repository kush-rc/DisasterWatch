'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';

// Major active conflict zones (ACLED approximation)
const CONFLICT_ZONES = [
  { name: 'Ukraine-Russia Conflict', lat: 48.4, lon: 35.1, severity: 5, type: 'Armed Conflict', casualties: '10000+' },
  { name: 'Gaza Strip', lat: 31.4, lon: 34.4, severity: 5, type: 'Armed Conflict', casualties: '35000+' },
  { name: 'Sudan Civil War', lat: 15.5, lon: 32.5, severity: 5, type: 'Civil War', casualties: '15000+' },
  { name: 'Myanmar Civil War', lat: 19.0, lon: 96.1, severity: 4, type: 'Civil War', casualties: '5000+' },
  { name: 'Syria Conflict', lat: 34.8, lon: 39.0, severity: 4, type: 'Armed Conflict', casualties: 'Ongoing' },
  { name: 'Yemen Crisis', lat: 15.5, lon: 48.5, severity: 4, type: 'Humanitarian Crisis', casualties: 'Ongoing' },
  { name: 'DR Congo', lat: -1.7, lon: 29.2, severity: 4, type: 'Armed Conflict', casualties: 'Ongoing' },
  { name: 'Somalia', lat: 5.2, lon: 46.2, severity: 3, type: 'Insurgency', casualties: 'Ongoing' },
  { name: 'Sahel Region', lat: 15.4, lon: 1.5, severity: 3, type: 'Insurgency', casualties: 'Ongoing' },
  { name: 'Haiti Crisis', lat: 19.0, lon: -72.3, severity: 3, type: 'Political Crisis', casualties: 'Ongoing' },
  { name: 'Ethiopia — Tigray', lat: 13.5, lon: 39.5, severity: 3, type: 'Post-Conflict', casualties: 'Ongoing' },
  { name: 'Afghanistan', lat: 33.9, lon: 67.7, severity: 3, type: 'Instability', casualties: 'Ongoing' },
];

export default function ConflictLayer() {
  const layers = useStore(state => state.layers);
  const entitiesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!layers.conflict) {
      cleanup();
      return;
    }
    renderConflicts();
    return () => cleanup();
  }, [layers.conflict]);

  function cleanup() {
    const viewer = window.__cesiumViewer;
    if (!viewer) return;
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];
  }

  function renderConflicts() {
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    cleanup();

    CONFLICT_ZONES.forEach((zone, i) => {
      const id = 'conflict-' + i;
      const isCritical = zone.severity >= 5;
      const color = zone.severity >= 5 ? Cesium.Color.RED :
                    zone.severity >= 4 ? Cesium.Color.fromCssColorString('#dc2626') :
                    Cesium.Color.fromCssColorString('#b91c1c');

      const radius = zone.severity * 60000;
      const semiAxis = isCritical
        ? new Cesium.CallbackProperty(() => radius + Math.sin(Date.now() / 400) * 20000, false)
        : radius;

      viewer.entities.add({
        id,
        name: zone.name,
        description: '<b>Type:</b> ' + zone.type + '<br/><b>Severity:</b> ' + zone.severity + '/5<br/><b>Casualties:</b> ' + zone.casualties + '<br/><br/><i>Data source: ACLED approximation</i>',
        position: Cesium.Cartesian3.fromDegrees(zone.lon, zone.lat),
        point: {
          pixelSize: isCritical ? 10 : 7,
          color: color,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
        },
        ellipse: {
          semiMajorAxis: semiAxis,
          semiMinorAxis: semiAxis,
          material: new Cesium.ColorMaterialProperty(color.withAlpha(0.1)),
          outline: true,
          outlineColor: color.withAlpha(0.4),
          height: 100,
        },
        label: {
          text: zone.name,
          font: isCritical ? '12px "JetBrains Mono"' : '10px "JetBrains Mono"',
          fillColor: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, isCritical ? 10000000 : 5000000),
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          scale: 0.9,
        },
      });

      entitiesRef.current.push(id);
    });
  }

  return null;
}
