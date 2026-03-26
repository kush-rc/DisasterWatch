import { NextResponse } from 'next/server';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(ML_BACKEND_URL + '/api/predict-demand', {
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
  const pop = req.population_affected || 10000;
  const sev = req.severity || 3;
  const factor = 1 + (sev - 1) * 0.4;

  return {
    water_liters: Math.round(pop * 3 * factor),
    food_packages: Math.round(pop * 0.6 * factor),
    medical_kits: Math.round(pop * 0.03 * factor),
    tents: Math.round(pop * 0.12 * factor),
    rescue_teams: Math.max(5, Math.round(pop * 0.015 * factor)),
    evacuation_routes: [
      { name: 'Primary Route', distance_km: 18, estimated_time_min: 40, capacity: Math.round(pop * 0.5), status: 'OPEN' },
      { name: 'Alternative Route', distance_km: 25, estimated_time_min: 55, capacity: Math.round(pop * 0.3), status: 'OPEN' },
    ],
    priority_zones: [
      { name: 'Impact Center', priority: sev >= 4 ? 'CRITICAL' : 'HIGH', population: Math.round(pop * 0.5) },
      { name: 'Perimeter', priority: 'MODERATE', population: Math.round(pop * 0.3) },
    ],
    note: 'ML backend offline — using empirical estimation',
  };
}
