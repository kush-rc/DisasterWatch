import { NextResponse } from 'next/server';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const res = await fetch(ML_BACKEND_URL + '/api/predict-flood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Fallback prediction if backend is not running
      return NextResponse.json(getFallbackPrediction(body));
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Backend not running — return fallback prediction
    const body = await request.clone().json().catch(() => ({}));
    return NextResponse.json(getFallbackPrediction(body));
  }
}

function getFallbackPrediction(req: any) {
  const rainfall = req.rainfall_mm || 50;
  const moisture = req.soil_moisture || 0.6;
  const risk = Math.min(1, (rainfall / 200) * 0.4 + moisture * 0.3 + 0.2);
  
  return {
    risk_score: Math.round(risk * 1000) / 1000,
    risk_level: risk > 0.7 ? 'HIGH' : risk > 0.4 ? 'MODERATE' : 'LOW',
    affected_area_km2: Math.round(risk * 100),
    peak_day: Math.min(3, Math.ceil(rainfall / 50)),
    confidence: 0.65,
    factors: {
      rainfall_contribution: Math.round((rainfall / 200) * 0.4 * 1000) / 1000,
      soil_moisture_contribution: Math.round(moisture * 0.3 * 1000) / 1000,
      elevation_risk: 0.15,
      river_proximity_risk: 0.1,
    },
    note: 'ML backend offline — using simplified estimation'
  };
}
