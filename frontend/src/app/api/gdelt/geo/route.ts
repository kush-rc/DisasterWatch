import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const url = `https://api.gdeltproject.org/api/v2/geo/geo?${searchParams.toString()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('GDELT API error: ' + res.status);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] GDELT geo error:', error);
    return NextResponse.json({ features: [] });
  }
}
