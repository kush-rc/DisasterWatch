import { NextResponse } from 'next/server';

export const revalidate = 15; // OpenSky updates every ~10 seconds

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

export async function GET() {
  try {
    const res = await fetch(OPENSKY_URL, { next: { revalidate: 15 } });
    
    if (!res.ok) {
      // OpenSky has rate limits — return mock data if rate limited
      return NextResponse.json({ flights: getMockFlights() });
    }
    
    const data = await res.json();
    const states = data.states || [];

    // OpenSky returns arrays: [icao24, callsign, origin_country, ...]
    // https://openskynetwork.github.io/opensky-api/rest.html
    const flights = states
      .filter((s: any[]) => s[5] !== null && s[6] !== null && s[8] === false) // s[8]=onGround: keep only airborne
      .map((s: any[]) => ({
        icao24: s[0],
        callsign: (s[1] || '').trim(),
        country: s[2],
        timePosition: s[3],
        longitude: s[5],
        latitude: s[6],
        altitude: s[7] || 0,       // barometric altitude in meters
        geoAltitude: s[13] || 0,    // geometric altitude
        velocity: s[9] || 0,        // ground speed m/s
        heading: s[10] || 0,        // true track in degrees
        verticalRate: s[11] || 0,
        squawk: s[14] || '',        // transponder code
        onGround: s[8],
      }));

    return NextResponse.json({ flights, timestamp: data.time });
  } catch (error) {
    console.error('[API] OpenSky fetch error:', error);
    return NextResponse.json({ flights: getMockFlights() });
  }
}

function getMockFlights() {
  return [
    { icao24: 'abc123', callsign: 'AI302', country: 'India', longitude: 77.1, latitude: 28.6, altitude: 10000, velocity: 250, heading: 45, verticalRate: 0, onGround: false },
    { icao24: 'def456', callsign: 'BA256', country: 'United Kingdom', longitude: -0.1, latitude: 51.5, altitude: 11000, velocity: 260, heading: 270, verticalRate: 0, onGround: false },
    { icao24: 'ghi789', callsign: 'UA901', country: 'United States', longitude: -73.9, latitude: 40.7, altitude: 9500, velocity: 230, heading: 180, verticalRate: -5, onGround: false },
  ];
}
