import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour cache — TLEs update slowly

// CelesTrak TLE URLs for key satellite groups
const TLE_GROUPS = [
  { name: 'ISS', url: 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle' },
  { name: 'STATIONS', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle' },
  { name: 'WEATHER', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle' },
  { name: 'EARTH_OBS', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle' },
];

interface SatTLE {
  name: string;
  line1: string;
  line2: string;
  group: string;
}

export async function GET() {
  try {
    const allTLEs: SatTLE[] = [];

    await Promise.all(
      TLE_GROUPS.map(async (group) => {
        try {
          const res = await fetch(group.url, { next: { revalidate: 3600 } });
          if (!res.ok) return;
          const text = await res.text();
          const lines = text.trim().split('\n').map(l => l.trim());

          // TLE format: every 3 lines = name, line1, line2
          for (let i = 0; i + 2 < lines.length; i += 3) {
            if (!lines[i + 1].startsWith('1 ') || !lines[i + 2].startsWith('2 ')) continue;
            allTLEs.push({
              name: lines[i].replace(/^0 /, ''),
              line1: lines[i + 1],
              line2: lines[i + 2],
              group: group.name,
            });
          }
        } catch (e) {
          console.error('[API] Failed to fetch TLE group:', group.name, e);
        }
      })
    );

    return NextResponse.json({ satellites: allTLEs, count: allTLEs.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch satellite TLEs' }, { status: 500 });
  }
}
