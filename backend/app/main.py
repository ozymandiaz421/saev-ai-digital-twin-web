"""Safe API skeleton. No engine integration or fake fork results."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SAEV Digital Twin API", version="0.1.0-skeleton")
# GitHub Pages public origin only. Development localhost can be enabled explicitly later.
app.add_middleware(CORSMiddleware,
    allow_origins=["https://ozymandiaz421.github.io"],
    allow_credentials=False, allow_methods=["GET"], allow_headers=["Content-Type"])

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "saev-digital-twin", "engine_connected": False}

@app.get("/api/v1/capabilities")
def capabilities():
    return {"mode": "SCAFFOLD_ONLY", "features": {
        "live_incident_injection": False, "gpt_diagnosis": False, "fork_simulation": False,
        "static_replay": True}}

@app.post("/api/v1/sessions")
def create_session():
    raise HTTPException(status_code=501, detail="SAEV simulator not integrated; no session was created")

@app.post("/api/v1/sessions/{session_id}/incidents")
def inject_incident(session_id: str):
    raise HTTPException(status_code=501, detail="Incident engine not integrated; no incident was injected")

@app.post("/api/v1/sessions/{session_id}/compare")
def compare(session_id: str):
    raise HTTPException(status_code=501, detail="Fork engine not integrated; no simulation was run")
