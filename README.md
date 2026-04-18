# Realtime Analyzer App

This repository contains a realtime crisis analysis application with a Python FastAPI frontend server, a static UI, and supporting agent code.

## Project Structure

- `server.py` - FastAPI application that serves the UI and exposes the `/api/status` endpoint.
- `public/` - Static frontend files for the dashboard and application UI.
- `agent/` - Agent-related code and data storage.
- `realtime_analyzer.py` - Additional realtime analysis script.
- `devclash/` - Separate Node.js backend module with AI agent support and pipeline code.

## Requirements

### Python

- Python 3.10+ recommended
- `fastapi`
- `uvicorn`

### Node.js (optional)

- `npm` if you want to inspect or run the `devclash` backend.

## Setup

### 1. Install Python dependencies

Open a terminal in the project root and create a virtual environment if desired:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn
```

### 2. Run the app

From the project root:

```powershell
python server.py
```

By default, the server starts on `http://0.0.0.0:8000`.

### 3. Open the UI

In a browser, go to:

```text
http://localhost:8000
```

The frontend is served from `public/` and pulls current status data from the `/api/status` endpoint.

## How to Use the App

1. Start the Python server using `python server.py`.
2. Open `http://localhost:8000` in your browser.
3. The dashboard reads data from `agent/crisis_agent.db`.
4. If the database file is missing or empty, the UI shows a waiting state.
5. Update or populate `agent/crisis_agent.db` with latest scan results to see live status in the dashboard.

## Optional: Devclash Backend

The `devclash/` folder contains a separate Node.js backend for AI agent processing.

To install and run it:

```powershell
cd devclash
npm install
npm run dev
```

This is useful if you want to explore or extend the AI agent backend independently of the Python FastAPI UI server.

## Notes

- The FastAPI server serves static content from `public/` and serves app data from `/api/status`.
- The dashboard is built from the files in `public/pages/`.
- If you make changes to the frontend, simply refresh the browser after restarting the server if needed.
