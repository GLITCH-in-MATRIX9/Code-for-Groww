# Pulse — Smart Market Watchlist MVP

Pulse is a production-style fintech dashboard focused on: **what changed, why it changed, and why it matters**.

## Stack
- Frontend: React + TypeScript + Tailwind + React Query + Recharts
- Backend: Node.js + Express + TypeScript + SSE
- Data: Yahoo Finance + Finnhub (with deterministic demo fallback)
- AI Explanations: Ollama (Qwen 2.5 7B) with template fallback
- Persistence: PostgreSQL when `DATABASE_URL` is set, otherwise local file-backed store

## Setup
1. Install dependencies:
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. Configure backend env:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Run app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Main MVP Flow
1. Open app and view default watchlist
2. Use **Generate Insights**
3. View **Since You Last Checked** ranked insight
4. Dismiss insight to surface next one
5. Open stock detail with timeframe chart
6. Watch live quote updates via SSE

## API Notes
- `POST /api/insights/generate` runs pipeline: fetch → validate → detect events → score → AI explain → rank → persist snapshot.
- `GET /api/events/quotes` streams live quote refresh events (SSE).
- If live providers fail/unavailable, demo provider keeps full app flow functional.
