import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache the global live ships stream for 60s per call

export async function GET() {
  const AIS_KEY = process.env.AISSTREAM_API_KEY;
  if (!AIS_KEY) {
    return NextResponse.json({ ships: getGlobalMockShips(), source: 'mock-nokey' });
  }

  try {
    const liveShips = await collectGlobalAIS(AIS_KEY);
    if (liveShips && liveShips.length > 0) {
      return NextResponse.json({ ships: liveShips, source: 'aisstream-live' });
    }
  } catch (error) {
    console.warn('[API] WebSocket collection failed, falling back to mock.');
  }

  return NextResponse.json({ ships: getGlobalMockShips(), source: 'mock-fallback' });
}

// Opens a brief 2.5 second WebSocket connection to AISStream to collect ~150 live global ships
// This allows a stateless REST API to serve live WebSocket streams!
async function collectGlobalAIS(apiKey: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Use native WebSocket (Next.js Edge / Node 21+ polyfills it)
      let WSConstructor;
      if (typeof WebSocket !== 'undefined') {
        WSConstructor = WebSocket;
      }

      if (!WSConstructor) {
        resolve([]);
        return;
      }

      const ws = new WSConstructor("wss://stream.aisstream.io/v0/stream");
      const shipsMap = new Map();
      
      const timeout = setTimeout(() => {
        try { ws.close(); } catch(e){}
        resolve(Array.from(shipsMap.values()));
      }, 2500); // Wait 2.5 seconds to collect live global ships

      ws.onopen = () => {
        const subMsg = {
          APIKey: apiKey,
          BoundingBoxes: [[[-90, -180], [90, 180]]], // Global coverage!
          FilterMessageTypes: ["PositionReport"]
        };
        ws.send(JSON.stringify(subMsg));
      };

      ws.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          if (data.MessageType === "PositionReport") {
            const msg = data.Message.PositionReport;
            const mmsi = String(data.MetaData?.MMSI || msg.UserID);
            
            // Only add moving ships
            if (msg.Sog > 0.5) {
              shipsMap.set(mmsi, {
                mmsi: mmsi,
                name: data.MetaData?.ShipName?.trim() || `VESSEL-${mmsi}`,
                type: 'Cargo Vessel',
                longitude: msg.Longitude,
                latitude: msg.Latitude,
                heading: msg.TrueHeading || msg.Cog || 0,
                speed: msg.Sog || 0,
                status: 'Under way'
              });
            }

            // Flush early if we gathered 150 moving ships globally to speed up REST response
            if (shipsMap.size >= 500) {
              clearTimeout(timeout);
              try { ws.close(); } catch(e){}
              resolve(Array.from(shipsMap.values()));
            }
          }
        } catch (e) {}
      };

      ws.onerror = (e: any) => {
        clearTimeout(timeout);
        resolve(Array.from(shipsMap.values()));
      };
    } catch (error) {
      resolve([]);
    }
  });
}

function getGlobalMockShips() {
  const ships: any[] = [];
  const regions = [
    { name: 'Strait of Malacca', lat: 3.0, lng: 100.5, count: 50 },
    { name: 'Suez Canal', lat: 29.0, lng: 33.0, count: 40 },
    { name: 'English Channel', lat: 50.0, lng: -2.0, count: 60 },
    { name: 'Strait of Gibraltar', lat: 35.9, lng: -5.5, count: 30 },
    { name: 'Panama Canal', lat: 9.0, lng: -79.5, count: 30 },
    { name: 'Strait of Hormuz', lat: 26.5, lng: 56.5, count: 40 },
    { name: 'Bab el-Mandeb', lat: 12.5, lng: 43.3, count: 25 },
    { name: 'South China Sea', lat: 15.0, lng: 115.0, count: 60 },
    { name: 'US East Coast', lat: 35.0, lng: -73.0, count: 50 },
    { name: 'Japan Sea', lat: 35.0, lng: 135.0, count: 50 },
    { name: 'Cape of Good Hope', lat: -35.0, lng: 20.0, count: 25 },
    { name: 'Gulf of Mexico', lat: 25.0, lng: -90.0, count: 40 },
    { name: 'Baltic Sea', lat: 57.0, lng: 19.0, count: 40 }
  ];

  let mmsiBase = 100000000;
  regions.forEach(r => {
    for (let i = 0; i < r.count; i++) {
      ships.push({
        mmsi: String(mmsiBase++),
        name: `GLOBAL LOGISTICS ${mmsiBase}`,
        type: 'Cargo Ship',
        longitude: r.lng + (Math.random() - 0.5) * 8, // Scatter 8 degrees
        latitude: r.lat + (Math.random() - 0.5) * 4,  // Scatter 4 degrees
        heading: Math.floor(Math.random() * 360),
        speed: (Math.random() * 15 + 5).toFixed(1),
        status: 'Under way'
      });
    }
  });
  return ships;
}
