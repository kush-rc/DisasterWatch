import { NextResponse } from 'next/server';

export const revalidate = 300; // 5 min cache

const GNEWS_KEY = process.env.GNEWS_API_KEY;
const GNEWS_URL = 'https://gnews.io/api/v4/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'earthquake OR flood OR cyclone OR wildfire OR disaster';

  if (!GNEWS_KEY) {
    return NextResponse.json({ articles: getMockArticles() });
  }

  try {
    const url = GNEWS_URL + '?q=' + encodeURIComponent(query) + '&lang=en&max=10&apikey=' + GNEWS_KEY;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      return NextResponse.json({ articles: getMockArticles() });
    }

    const data = await res.json();
    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      publishedAt: a.publishedAt,
      source: { name: a.source?.name || 'Unknown', url: a.source?.url || '' },
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('[API] GNews error:', error);
    return NextResponse.json({ articles: getMockArticles() });
  }
}

function getMockArticles() {
  return [
    {
      title: 'Major 6.2 earthquake strikes off the coast of Indonesia',
      description: 'A powerful earthquake has been felt across the region. Tsunami warnings were briefly issued before being lifted.',
      url: 'https://example.com/earthquake',
      image: null,
      publishedAt: '2026-03-24T08:00:00Z',
      source: { name: 'Reuters', url: 'https://reuters.com' },
    },
    {
      title: 'Wildfire season begins early in southern Europe',
      description: 'Record temperatures combined with drought conditions are creating extreme fire risk across Mediterranean nations.',
      url: 'https://example.com/wildfire',
      image: null,
      publishedAt: '2026-03-24T06:30:00Z',
      source: { name: 'BBC News', url: 'https://bbc.com' },
    },
    {
      title: 'Flood warning issued for Bangladesh river delta',
      description: 'Heavy monsoon rainfall upstream is expected to cause severe flooding in low-lying areas over the next 48 hours.',
      url: 'https://example.com/flood',
      image: null,
      publishedAt: '2026-03-23T22:15:00Z',
      source: { name: 'Al Jazeera', url: 'https://aljazeera.com' },
    },
  ];
}
