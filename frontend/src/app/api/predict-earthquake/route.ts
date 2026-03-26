import { NextResponse } from 'next/server';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const res = await fetch(ML_BACKEND_URL + '/api/predict-earthquake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(getFallback(body));
    }

    return NextResponse.json(await res.json());
  } catch {
    const body = await request.clone().json().catch(() => ({}));
    return NextResponse.json(getFallback(body));
  }
}

function getFallback(req: any) {
  const mags = req.recent_magnitudes || [3.2, 2.8, 4.1];
  const maxMag = Math.max(...mags);
  const meanMag = mags.reduce((a: number, b: number) => a + b, 0) / mags.length;
  const score = Math.min(1, (maxMag / 9) * 0.5 + (meanMag / 7) * 0.3 + 0.1);

  return {
    anomaly_score: Math.round(score * 1000) / 1000,
    risk_level: score > 0.6 ? 'HIGH' : score > 0.3 ? 'MODERATE' : 'LOW',
    estimated_magnitude_range: meanMag.toFixed(1) + ' - ' + (meanMag + 1).toFixed(1),
    aftershock_probability: Math.round(Math.min(0.9, 0.3 + maxMag / 12) * 100) / 100,
    analysis: 'ML backend offline — using statistical estimation.',
  };
}
