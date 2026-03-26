import { NextResponse } from 'next/server';
import type { DisasterEvent, EventCategory, Severity } from '@/types';

// Cache responses for 60 seconds (Edge compatible)
export const revalidate = 60;

const USGS_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.0&limit=100&orderby=time';
const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50';

export async function GET() {
  try {
    const events: DisasterEvent[] = [];

    // 1. Fetch USGS Earthquakes
    try {
      const usgsRes = await fetch(USGS_URL, { next: { revalidate: 60 } });
      if (usgsRes.ok) {
        const usgsData = await usgsRes.json();
        const quakes = usgsData.features.map((feature: any) => {
          const mag = feature.properties.mag;
          let severity: Severity = 1;
          if (mag >= 7.0) severity = 5;
          else if (mag >= 6.0) severity = 4;
          else if (mag >= 5.0) severity = 3;
          else if (mag >= 4.5) severity = 2;

          return {
            id: feature.id,
            title: `M ${mag.toFixed(1)} - ${feature.properties.place}`,
            category: 'disaster' as EventCategory,
            severity,
            summary: `A magnitude ${mag.toFixed(1)} earthquake occurred at ${feature.properties.place}. Depth: ${feature.geometry.coordinates[2].toFixed(1)} km.`,
            location: feature.properties.place,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
            source: 'USGS',
            sourceUrl: feature.properties.url,
            timestamp: new Date(feature.properties.time).toISOString(),
            timeAgo: getTimeAgo(new Date(feature.properties.time)),
            confidence: 1.0, 
            metadata: { magnitude: mag, depth: feature.geometry.coordinates[2] }
          };
        });
        events.push(...quakes);
      }
    } catch (e) {
      console.error('[API] Failed to fetch USGS data:', e);
    }

    // 2. Fetch NASA EONET (Volcanoes, Floods, Storms)
    try {
      const eonetRes = await fetch(EONET_URL, { next: { revalidate: 3600 } });
      if (eonetRes.ok) {
        const eonetData = await eonetRes.json();
        const eonetEvents = eonetData.events
          .filter((e: any) => e.geometry && e.geometry.length > 0)
          .map((e: any) => {
            const geom = e.geometry[0]; // Take latest geometry point
            const coords = geom.coordinates;
            
            // Map EONET categories to our severities (just estimation)
            const type = e.categories[0]?.id || '';
            let severity: Severity = 3; // default medium
            if (type === 'severeStorms' || type === 'volcanoes') severity = 4;

            return {
              id: `eonet-${e.id}`,
              title: e.title,
              category: 'disaster' as EventCategory,
              severity,
              summary: `Active ${e.categories[0]?.title.toLowerCase()} event: ${e.title}. Status: ${e.closed ? 'Closed' : 'Open'}.`,
              location: 'Global (NASA EONET)',
              longitude: Array.isArray(coords[0]) ? coords[0][0] : coords[0], // Handle point vs polygon
              latitude: Array.isArray(coords[0]) ? coords[0][1] : coords[1],
              source: 'NASA EONET',
              sourceUrl: e.sources[0]?.url || '',
              timestamp: new Date(geom.date).toISOString(),
              timeAgo: getTimeAgo(new Date(geom.date)),
              confidence: 0.9
            };
          });
        events.push(...eonetEvents);
      }
    } catch (e) {
      console.error('[API] Failed to fetch EONET data:', e);
    }

    // Sort all events by timestamp descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[API] Error in /api/disasters:', error);
    return NextResponse.json({ error: 'Failed to fetch disaster events' }, { status: 500 });
  }
}

// Helper utility
function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
}
