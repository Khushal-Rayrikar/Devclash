import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
import sqlite3

app = FastAPI()

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agent', 'crisis_agent.db')

@app.get("/api/status")
def get_status():
    """Return the latest status for the UI."""
    try:
        if not os.path.exists(DB_PATH):
            return {
                "status": "watching",
                "crisis_score": 50,
                "message": "Waiting for live data... (DB not found)",
                "crisis": False
            }
            
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get the latest crisis analysis from the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='scans'")
        if cursor.fetchone():
            cursor.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                data = dict(row)
                full_output = {}
                if data.get("full_output"):
                    try:
                        full_output = json.loads(data["full_output"])
                    except Exception:
                        full_output = {}

                return {
                    "status": data.get("status", "WATCH"),
                    "crisis_score": data.get("crisis_score", 50),
                    "banking_score": data.get("technical_risk", 50),
                    "market_score": data.get("sentiment_risk", 50),
                    "liquidity_score": data.get("combined_risk", 50),
                    "message": data.get("recommended_action", ""),
                    "crisis": data.get("alert_triggered", 0) == 1,
                    "ticker": data.get("ticker", ""),
                    "company_name": data.get("company_name", ""),
                    "timestamp": data.get("scan_timestamp", ""),
                    "chart_signals": full_output.get("chart_signals", []),
                    "news_signals": full_output.get("news_signals", []),
                    "combined_signals": full_output.get("combined_signals", []),
                    "news_headlines": full_output.get("news_headlines", []),
                    "expected_crisis_time": full_output.get("expected_crisis_time"),
                    "crisis_rationale": full_output.get("crisis_rationale", ""),
                    "data_sources": full_output.get("data_sources_used", []),
                }
                
        return {
            "status": "watching",
            "crisis_score": 50,
            "banking_score": 40,
            "market_score": 60,
            "liquidity_score": 50,
            "message": "Waiting for live data...",
            "crisis": False
        }
    except Exception as e:
        return {"error": str(e), "crisis": False}

# Mount public directory
app.mount("/", StaticFiles(directory="public", html=True), name="public")

if __name__ == "__main__":
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    uvicorn.run("server:app", host=HOST, port=PORT, reload=True)
