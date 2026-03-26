import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour cache

// Copernicus Open Access Hub — search for recent Sentinel-2 scenes
// Uses the OData API (free, requires credentials)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '22.0';
  const lon = searchParams.get('lon') || '82.0';
  const days = parseInt(searchParams.get('days') || '30');

  const COPERNICUS_USER = process.env.COPERNICUS_USER;
  const COPERNICUS_PASS = process.env.COPERNICUS_PASS;

  if (!COPERNICUS_USER || !COPERNICUS_PASS) {
    return NextResponse.json({
      scenes: getMockScenes(),
      note: 'Using mock data — Copernicus credentials not configured'
    });
  }

  try {
    // Construct bounding box around the point (±1 degree)
    const bbox = [
      parseFloat(lon) - 1,
      parseFloat(lat) - 1,
      parseFloat(lon) + 1,
      parseFloat(lat) + 1,
    ];

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    // Copernicus Data Space Ecosystem (CDSE) OData API
    const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=Collection/Name eq 'SENTINEL-2' and OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((${bbox[0]} ${bbox[1]},${bbox[2]} ${bbox[1]},${bbox[2]} ${bbox[3]},${bbox[0]} ${bbox[3]},${bbox[0]} ${bbox[1]}))') and ContentDate/Start gt ${startDate}T00:00:00.000Z and ContentDate/Start lt ${endDate}T23:59:59.999Z&$orderby=ContentDate/Start desc&$top=5`;

    const res = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(COPERNICUS_USER + ':' + COPERNICUS_PASS).toString('base64'),
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('[API] Copernicus API error:', res.status);
      return NextResponse.json({ scenes: getMockScenes(), note: 'Copernicus API error' });
    }

    const data = await res.json();
    const scenes = (data.value || []).map((product: any) => ({
      id: product.Id,
      name: product.Name,
      date: product.ContentDate?.Start,
      cloudCover: product.Attributes?.find((a: any) => a.Name === 'cloudCover')?.Value || null,
      size: product.ContentLength,
      footprint: product.GeoFootprint,
      quicklookUrl: `https://catalogue.dataspace.copernicus.eu/odata/v1/Products(${product.Id})/Nodes(${product.Name})/Nodes('GRANULE')/Nodes/Nodes('IMG_DATA')/Nodes('R10m')/Nodes`,
    }));

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error('[API] Sentinel-2 error:', error);
    return NextResponse.json({ scenes: getMockScenes() });
  }
}

function getMockScenes() {
  return [
    {
      id: 'mock-s2a-001',
      name: 'S2A_MSIL2A_20260322T051931_N0511_R062_T44QMK',
      date: '2026-03-22T05:19:31Z',
      cloudCover: 12.5,
      size: 812000000,
      footprint: null,
    },
    {
      id: 'mock-s2b-002',
      name: 'S2B_MSIL2A_20260320T052329_N0511_R062_T44QMK',
      date: '2026-03-20T05:23:29Z',
      cloudCover: 28.1,
      size: 795000000,
      footprint: null,
    },
    {
      id: 'mock-s2a-003',
      name: 'S2A_MSIL2A_20260317T051311_N0511_R062_T44QMK',
      date: '2026-03-17T05:13:11Z',
      cloudCover: 5.2,
      size: 823000000,
      footprint: null,
    },
  ];
}
