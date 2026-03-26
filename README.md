# DisasterWatch 🌍

Real-time global disaster monitoring and intelligence platform built with a 3D CesiumJS globe, live data feeds, and ML-powered predictions.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688?logo=fastapi)
![CesiumJS](https://img.shields.io/badge/CesiumJS-1.129-6caddf)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **3D Globe Visualization** — Interactive CesiumJS globe with multiple base-map providers
- **Live Disaster Feed** — Real-time earthquakes (USGS), fires (NASA FIRMS), floods, and conflicts (ACLED)
- **Flight & Ship Tracking** — Live ADS-B flights via OpenSky and AIS vessel tracking via AISStream
- **Satellite Overlay** — Real-time satellite positions (N2YO) and Sentinel-2 imagery
- **Weather Layer** — Global weather data from OpenWeatherMap
- **AI Briefings** — Groq-powered natural-language situation summaries
- **ML Predictions** — Flood risk (U-Net), earthquake anomaly detection (LSTM), resource demand forecasting (XGBoost)
- **Live News & Markets** — GNews headlines and stock market data
- **Live TV** — Embedded live news streams

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| 3D Engine | CesiumJS, Deck.gl |
| State | Zustand |
| Backend | FastAPI, Python |
| ML | PyTorch, XGBoost, scikit-learn |
| Caching | Upstash Redis |

## Project Structure

```
disasterwatch/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Pages & API routes
│   │   ├── components/# Globe, UI, Layout components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Zustand store
│   │   └── types/     # TypeScript definitions
│   └── public/        # Static assets
├── backend/           # FastAPI ML backend
│   ├── main.py        # API server
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/disasterwatch.git
cd disasterwatch

# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp frontend/.env.example frontend/.env.local
```

Fill in your API keys in `frontend/.env.local` (see the template for required keys).

### 3. Run

```bash
# Terminal 1 — Frontend
cd frontend
npm run dev          # → http://localhost:3000

# Terminal 2 — Backend
cd backend
uvicorn main:app --reload --port 8000
```

## API Keys Required

| Service | Key | Purpose |
|---|---|---|
| Cesium Ion | `NEXT_PUBLIC_CESIUM_ION_TOKEN` | 3D globe tiles |
| Groq | `GROQ_API_KEY` | AI briefings |
| NASA FIRMS | `NASA_FIRMS_API_KEY` | Fire data |
| N2YO | `N2YO_API_KEY` | Satellite positions |
| GNews | `GNEWS_API_KEY` | News feed |
| OpenWeatherMap | `OPENWEATHER_API_KEY` | Weather layer |
| AISStream | `AISSTREAM_API_KEY` | Ship tracking |
| ACLED | `ACLED_EMAIL` / `ACLED_PASS` | Conflict data |
| Upstash Redis | `UPSTASH_REDIS_REST_URL` / `TOKEN` | API caching |

## License

MIT
