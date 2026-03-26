'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';

export default function NewsPinsLayer() {
  const layers = useStore(state => state.layers);
  const entitiesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!layers.news) {
      cleanup();
      return;
    }
    fetchAndRender();
    return () => cleanup();
  }, [layers.news]);

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
      const res = await fetch('/api/news');
      if (!res.ok) return;
      const data = await res.json();
      renderPins(data.articles || []);
    } catch (e) {
      console.error('[NewsLayer] error:', e);
    }
  }

  // Map news articles to approximate globe locations
  function renderPins(articles: any[]) {
    const Cesium = window.Cesium;
    const viewer = window.__cesiumViewer;
    if (!Cesium || !viewer) return;

    cleanup();

    // Geo-approximate based on keywords in title/description
    const geoMap: Record<string, [number, number]> = {
      'india': [20.6, 78.9], 'indonesia': [-2.5, 118], 'japan': [36.2, 138.3],
      'china': [35.9, 104.2], 'usa': [37.1, -95.7], 'united states': [37.1, -95.7],
      'uk': [55.4, -3.4], 'europe': [50.1, 10.4], 'africa': [1.6, 17.3],
      'brazil': [-14.2, -51.9], 'australia': [-25.3, 133.8], 'russia': [61.5, 105.3],
      'turkey': [38.9, 35.2], 'middle east': [29.3, 47.5], 'pakistan': [30.4, 69.3],
      'bangladesh': [23.7, 90.4], 'philippines': [12.9, 121.8], 'mexico': [23.6, -102.6],
      'chile': [-35.7, -71.5], 'tonga': [-21.2, -175.2], 'iceland': [65.0, -18.0],
      'bolivia': [-16.3, -63.6], 'earthquake': [0, 120], 'flood': [23, 85], 'wildfire': [40, -5],
    };

    articles.forEach((article: any, i: number) => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      let coords: [number, number] | null = null;

      for (const [keyword, latlon] of Object.entries(geoMap)) {
        if (text.includes(keyword)) {
          coords = [latlon[0] + (Math.random() - 0.5) * 3, latlon[1] + (Math.random() - 0.5) * 3];
          break;
        }
      }

      if (!coords) {
        // Random placement for unmatched news
        coords = [(Math.random() - 0.5) * 120, (Math.random() - 0.5) * 300];
      }

      const id = 'news-' + i;

      viewer.entities.add({
        id,
        name: article.title,
        description: '<b>Source:</b> ' + (article.source?.name || 'Unknown') + '<br/><b>Published:</b> ' + new Date(article.publishedAt).toLocaleString() + '<br/><br/>' + (article.description || '') + '<br/><br/><a href="' + article.url + '" target="_blank">Read Full Article</a>',
        position: Cesium.Cartesian3.fromDegrees(coords[1], coords[0], 30000),
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000),
        },
        label: {
          text: article.title.length > 30 ? article.title.substring(0, 27) + '...' : article.title,
          font: '10px "JetBrains Mono"',
          fillColor: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(12, 0),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          scale: 0.8,
        },
      });

      entitiesRef.current.push(id);
    });
  }

  return null;
}
