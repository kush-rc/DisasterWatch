'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import type { DisasterEvent, FireHotspot } from '@/types';

export default function DisasterLayer() {
  const events = useStore(state => state.events);
  const setEvents = useStore(state => state.setEvents);
  const setSelectedEventId = useStore(state => state.setSelectedEventId);
  const setDetailsPanelOpen = useStore(state => state.setDetailsPanelOpen);
  const layers = useStore(state => state.layers);
  
  const entitiesRef = useRef<string[]>([]);
  const fireEntitiesRef = useRef<string[]>([]);

  // Fetch data on mount
  useEffect(() => {
    let mounted = true;

    async function fetchDisasters() {
      try {
        const res = await fetch('/api/disasters');
        if (res.ok && mounted) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (e) {
        console.error('[DisasterLayer] Fetch error:', e);
      }
    }

    fetchDisasters();
    const interval = setInterval(fetchDisasters, 60000);

    return () => { mounted = false; clearInterval(interval); };
  }, [setEvents]);

  // Render earthquakes, floods, cyclones as entities
  useEffect(() => {
    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Cleanup old
    entitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    entitiesRef.current = [];

    if (!layers.earthquakes && !layers.floods && !layers.cyclones) return;

    events.forEach(event => {
      if (event.latitude == null || event.longitude == null) return;

      // Filter by layer toggle
      const titleLower = event.title.toLowerCase();
      if (event.source === 'USGS' && !layers.earthquakes) return;
      if (event.source === 'NASA EONET') {
        if (titleLower.includes('storm') && !layers.cyclones) return;
        if (titleLower.includes('flood') && !layers.floods) return;
      }

      const color =
        event.severity >= 5 ? Cesium.Color.RED :
        event.severity === 4 ? Cesium.Color.ORANGE :
        event.severity === 3 ? Cesium.Color.GOLD :
        event.severity === 2 ? Cesium.Color.LIMEGREEN :
        Cesium.Color.CYAN;

      const isCritical = event.severity >= 4;
      const radius = event.severity * 40000;

      // Pulsing for critical events
      const semiAxis = isCritical
        ? new Cesium.CallbackProperty(() => {
            return radius + Math.sin(Date.now() / 300) * 15000;
          }, false)
        : radius;

      const id = 'disaster-' + event.id;

      viewer.entities.add({
        id: id,
        name: event.title,
        description: '<b>Source:</b> ' + event.source + '<br/><b>Severity:</b> ' + event.severity + '/5<br/><b>Time:</b> ' + event.timeAgo + '<br/><b>Location:</b> ' + (event.location || '') + '<br/><p>' + event.summary + '</p>',
        position: Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude),
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
          material: new Cesium.ColorMaterialProperty(color.withAlpha(0.15)),
          outline: true,
          outlineColor: color.withAlpha(0.5),
          height: 100,
        },
        label: {
          text: event.title.length > 35 ? event.title.substring(0, 32) + '...' : event.title,
          font: isCritical ? '13px "JetBrains Mono"' : '11px "JetBrains Mono"',
          fillColor: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, isCritical ? 8000000 : 3000000),
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
        },
        properties: {
          eventId: event.id,
          type: 'disaster',
        },
      });

      entitiesRef.current.push(id);
    });
  }, [events, layers.earthquakes, layers.floods, layers.cyclones]);

  // Render fires as entities (not billboards — so they're clickable)
  useEffect(() => {
    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // Cleanup
    fireEntitiesRef.current.forEach(id => {
      const ent = viewer.entities.getById(id);
      if (ent) viewer.entities.remove(ent);
    });
    fireEntitiesRef.current = [];

    if (!layers.fires) return;

    async function fetchAndRenderFires() {
      try {
        const res = await fetch('/api/fires');
        if (!res.ok) return;
        const data = await res.json();
        const hotspots: FireHotspot[] = data.hotspots || [];

        // Clean up again in case of race condition with re-renders
        fireEntitiesRef.current.forEach(id => {
          const ent = viewer.entities.getById(id);
          if (ent) viewer.entities.remove(ent);
        });
        fireEntitiesRef.current = [];

        const batch = Date.now();
        hotspots.slice(0, 200).forEach((fire, i) => {
          const id = `fire-${batch}-${i}`;
          const isHigh = fire.confidence === 'h' || fire.confidence === 'high';

          viewer.entities.add({
            id: id,
            name: 'Fire Hotspot',
            description: '<b>Satellite:</b> ' + fire.satellite + '<br/><b>Brightness:</b> ' + fire.brightness + 'K<br/><b>Confidence:</b> ' + fire.confidence + '<br/><b>Date:</b> ' + fire.acqDate + ' ' + fire.acqTime,
            position: Cesium.Cartesian3.fromDegrees(fire.longitude, fire.latitude, 200),
            point: {
              pixelSize: isHigh ? 7 : 5,
              color: isHigh ? Cesium.Color.fromCssColorString('#ff6b00') : Cesium.Color.fromCssColorString('#ff9500'),
              outlineColor: Cesium.Color.RED,
              outlineWidth: isHigh ? 1 : 0,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000),
            },
            label: isHigh ? {
              text: 'FIRE',
              font: '9px "JetBrains Mono"',
              fillColor: Cesium.Color.fromCssColorString('#ff6b00'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -12),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000000),
              scale: 0.8,
            } : undefined,
            properties: {
              type: 'fire',
            },
          });

          fireEntitiesRef.current.push(id);
        });
      } catch (e) {
        console.error('[DisasterLayer] Fire fetch error:', e);
      }
    }

    fetchAndRenderFires();
  }, [layers.fires]);

  // Unified click handler for all entities
  useEffect(() => {
    const viewer = window.__cesiumViewer;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: any) => {
      const picked = viewer.scene.pick(click.position);

      if (Cesium.defined(picked) && picked.id) {
        const entity = picked.id;
        const entityId = typeof entity === 'string' ? entity : entity.id;

        // Check if it's a disaster event
        const state = useStore.getState();
        const evt = state.events.find((e: DisasterEvent) => 'disaster-' + e.id === entityId);
        if (evt) {
          setSelectedEventId(evt.id);
          setDetailsPanelOpen(true);
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(evt.longitude!, evt.latitude!, evt.severity * 200000),
            duration: 1.5,
          });
          return;
        }

        // For other entities (fire, satellite, flight, ship) — show Cesium's built-in info
        if (entity.name) {
          // Use custom popup via store
          useStore.getState().setInfoPopup({
            title: entity.name,
            description: entity.description ? entity.description.getValue() : '',
            position: click.position,
          });
        }
      } else {
        // Clear selection
        setSelectedEventId(null);
        setDetailsPanelOpen(false);
        useStore.getState().setInfoPopup(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => handler.destroy();
  }, [setSelectedEventId, setDetailsPanelOpen]);

  return null;
}
