import { NextResponse } from 'next/server';
import type { FireHotspot } from '@/types';

export const revalidate = 600; // 10 minutes cache

export async function GET() {
  const NASA_FIRMS_KEY = process.env.NASA_FIRMS_API_KEY;
  
  if (!NASA_FIRMS_KEY) {
    console.warn('[API] Missing NASA_FIRMS_API_KEY. Using mock data.');
    return NextResponse.json({ hotspots: getMockFires() });
  }

  // Fetch from NASA FIRMS API (VIIRS SNPP NRT for India region as an example, area parameter: xmin,ymin,xmax,ymax)
  // For global, FIRMS requires territory codes. Let's use IND for India as a robust starting point, or South Asia bounding box.
  // URL format for CSV: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/VIIRS_SNPP_NRT/[BBOX]/[DAY_RANGE]
  const bbox = '65,5,100,40'; // South Asia / India bounding box
  const URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_KEY}/VIIRS_SNPP_NRT/${bbox}/1`;

  try {
    const res = await fetch(URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`FIRMS API returned ${res.status}`);
    
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4'); // VIIRS uses bright_ti4
    const confIdx = headers.indexOf('confidence');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');

    const hotspots: FireHotspot[] = [];

    // Parse CSV (skip header)
    for (let i = 1; i < lines.length; i++) {
        // Limit to 500 fires max to avoid client-side overload
        if (hotspots.length >= 500) break;

        const row = lines[i].split(',');
        if (row.length < headers.length) continue;

        const confidence = row[confIdx];
        // Only keep high or nominal confidence fires (skip 'l' for low)
        if (confidence === 'l') continue;

        hotspots.push({
            latitude: parseFloat(row[latIdx]),
            longitude: parseFloat(row[lonIdx]),
            brightness: parseFloat(row[brightIdx]),
            confidence: confidence, // 'n' nominal, 'h' high
            acqDate: row[dateIdx],
            acqTime: row[timeIdx],
            satellite: 'VIIRS_SNPP'
        });
    }

    return NextResponse.json({ hotspots });
  } catch (error) {
    console.error('[API] Error fetching FIRMS fires:', error);
    return NextResponse.json({ hotspots: getMockFires() });
  }
}

// Fallback mock data if key is invalid or rate limited
function getMockFires(): FireHotspot[] {
  return [
    { latitude: 22.5, longitude: 82.1, brightness: 340, confidence: 'h', acqDate: '2026-03-23', acqTime: '1200', satellite: 'MOCK' },
    { latitude: 23.1, longitude: 81.5, brightness: 320, confidence: 'n', acqDate: '2026-03-23', acqTime: '1205', satellite: 'MOCK' },
    { latitude: 21.8, longitude: 79.9, brightness: 355, confidence: 'h', acqDate: '2026-03-23', acqTime: '1210', satellite: 'MOCK' },
  ];
}
