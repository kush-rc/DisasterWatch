import { NextResponse } from 'next/server';

export const revalidate = 600; // 10 min cache

export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  // Major world cities for weather overlay
  const cities = [
    { name: 'New Delhi', lat: 28.61, lon: 77.23 },
    { name: 'Mumbai', lat: 19.07, lon: 72.88 },
    { name: 'Tokyo', lat: 35.68, lon: 139.69 },
    { name: 'London', lat: 51.51, lon: -0.13 },
    { name: 'New York', lat: 40.71, lon: -74.01 },
    { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Dubai', lat: 25.21, lon: 55.27 },
    { name: 'Singapore', lat: 1.35, lon: 103.82 },
    { name: 'Lagos', lat: 6.52, lon: 3.38 },
    { name: 'São Paulo', lat: -23.55, lon: -46.63 },
    { name: 'Moscow', lat: 55.76, lon: 37.62 },
    { name: 'Beijing', lat: 39.90, lon: 116.40 },
    { name: 'Cairo', lat: 30.04, lon: 31.24 },
    { name: 'Jakarta', lat: -6.21, lon: 106.85 },
    { name: 'Istanbul', lat: 41.01, lon: 28.98 },
  ];

  if (!API_KEY) {
    return NextResponse.json({ weather: getMockWeather(cities) });
  }

  try {
    const results = await Promise.all(
      cities.map(async (city) => {
        try {
          const url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + city.lat + '&lon=' + city.lon + '&appid=' + API_KEY + '&units=metric';
          const res = await fetch(url, { next: { revalidate: 600 } });
          if (!res.ok) return getMockEntry(city);
          const data = await res.json();
          return {
            city: city.name,
            latitude: city.lat,
            longitude: city.lon,
            temp: Math.round(data.main?.temp || 0),
            humidity: data.main?.humidity || 0,
            windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // m/s to km/h
            condition: data.weather?.[0]?.main || 'Unknown',
            description: data.weather?.[0]?.description || '',
            icon: data.weather?.[0]?.icon || '01d',
          };
        } catch {
          return getMockEntry(city);
        }
      })
    );

    return NextResponse.json({ weather: results });
  } catch {
    return NextResponse.json({ weather: getMockWeather(cities) });
  }
}

function getMockEntry(city: { name: string; lat: number; lon: number }) {
  const temps = [22, 30, 18, 12, 8, 25, 35, 28, 32, 24, -2, 15, 28, 30, 14];
  const idx = Math.abs(Math.round(city.lat)) % temps.length;
  return {
    city: city.name,
    latitude: city.lat,
    longitude: city.lon,
    temp: temps[idx],
    humidity: 50 + Math.round(Math.random() * 30),
    windSpeed: 5 + Math.round(Math.random() * 20),
    condition: 'Clear',
    description: 'clear sky',
    icon: '01d',
  };
}

function getMockWeather(cities: { name: string; lat: number; lon: number }[]) {
  return cities.map(getMockEntry);
}
