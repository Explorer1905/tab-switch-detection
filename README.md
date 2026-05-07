# Tab Switch Detection Module
**Project:** AI Assessment System  
**Phase:** Phase 3 — Frontend Monitoring  
**Developer:** Shravani  

## Overview
Detects when a candidate switches tabs or leaves the browser 
window during an online assessment and logs the event to 
prevent cheating.

## Tech Stack
- Frontend: React 18 + Vite
- Backend: FastAPI (Python)

## How to Run

### Backend
```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- Tab switch detection via visibilitychange API
- Window blur detection via blur/focus events
- 2 second debounce to ignore accidental switches
- Mobile vs Desktop handling
- Local buffering when backend is offline
- Risk level escalation based on switch count

## API Endpoints
- POST /monitoring/tab-switch — Log a tab switch event
- GET /monitoring/logs — Retrieve all logged events
