// ═══════════════════════════════════════════════════════
// DisasterWatch — Stock Market Data API (Yahoo Finance)
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';

const SYMBOLS = [
  { symbol: '^GSPC',     name: 'S&P 500 📈',             category: 'index' },
  { symbol: '^FTSE',     name: 'FTSE 100 🇬🇧',           category: 'index' },
  { symbol: '000001.SS', name: 'Shanghai Composite 🇨🇳',  category: 'index' },
  { symbol: '^N225',     name: 'Nikkei 🇯🇵',              category: 'index' },
  { symbol: 'GC=F',      name: 'Gold 🥇',                 category: 'commodity' },
  { symbol: 'SI=F',      name: 'Silver 🥈',               category: 'commodity' },
  { symbol: 'BTC-USD',   name: 'BTC ₿',                   category: 'crypto' },
  { symbol: 'CL=F',      name: 'WTI 🛢️',                  category: 'commodity' },
  { symbol: '^VIX',      name: 'VIX 😱',                   category: 'volatility' },
];

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  category: string;
}

// Cache for 5 minutes
let cache: { data: StockQuote[]; ts: number } = { data: [], ts: 0 };
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache.data.length > 0 && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const symbolList = SYMBOLS.map(s => s.symbol).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      // Fallback: try individual fetches via v8 chart API
      const results = await fetchViaChartAPI();
      if (results.length > 0) {
        cache = { data: results, ts: Date.now() };
        return NextResponse.json(results);
      }
      throw new Error(`Yahoo Finance returned ${res.status}`);
    }

    const data = await res.json();
    const quotes = data?.quoteResponse?.result || [];

    const results: StockQuote[] = quotes.map((q: any) => {
      const meta = SYMBOLS.find(s => s.symbol === q.symbol);
      return {
        symbol: q.symbol,
        name: meta?.name || q.shortName || q.symbol,
        price: q.regularMarketPrice || 0,
        change: q.regularMarketChange || 0,
        change_percent: q.regularMarketChangePercent || 0,
        category: meta?.category || 'other',
      };
    });

    cache = { data: results, ts: Date.now() };
    return NextResponse.json(results);
  } catch (error) {
    console.error('[Stocks API] Error:', error);

    // If we have stale cache data, return it
    if (cache.data.length > 0) {
      return NextResponse.json(cache.data);
    }

    // Return realistic fallback data
    return NextResponse.json(getFallbackData());
  }
}

async function fetchViaChartAPI(): Promise<StockQuote[]> {
  const results: StockQuote[] = [];

  for (const meta of SYMBOLS) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(meta.symbol)}?interval=1d&range=2d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const chart = data?.chart?.result?.[0];
      if (!chart) continue;

      const price = chart.meta?.regularMarketPrice || 0;
      const prevClose = chart.meta?.previousClose || chart.meta?.chartPreviousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      results.push({
        symbol: meta.symbol,
        name: meta.name,
        price,
        change,
        change_percent: changePercent,
        category: meta.category,
      });
    } catch {
      continue;
    }
  }

  return results;
}

function getFallbackData(): StockQuote[] {
  return SYMBOLS.map(s => ({
    symbol: s.symbol,
    name: s.name,
    price: 0,
    change: 0,
    change_percent: 0,
    category: s.category,
  }));
}
