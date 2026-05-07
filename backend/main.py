from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory log storage (no DB needed for now)
logs = []

# Request model
class TabSwitchLog(BaseModel):
    tab_switched: bool
    trigger: Optional[str] = None
    switch_count: Optional[int] = None
    session_id: Optional[str] = None
    timestamp: str
    event: Optional[str] = None

@app.post("/monitoring/tab-switch")
async def log_tab_switch(payload: TabSwitchLog):
    log_entry = {
        "id": len(logs) + 1,
        "tab_switched": payload.tab_switched,
        "trigger": payload.trigger,
        "switch_count": payload.switch_count,
        "session_id": payload.session_id,
        "timestamp": payload.timestamp,
        "event": payload.event,
        "received_at": datetime.now().isoformat()
    }
    logs.append(log_entry)
    print(f"Log received: {log_entry}")
    return {"status": "logged", "log_id": log_entry["id"]}

@app.get("/monitoring/logs")
async def get_logs():
    return {"total": len(logs), "logs": logs}

@app.get("/")
async def root():
    return {"message": "Tab Switch Detection Backend Running"}