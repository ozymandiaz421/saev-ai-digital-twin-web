# FastAPI Skeleton (private)

This is **not yet** the SAEV simulation backend. `/healthz` and `/api/v1/capabilities` are real;
incident/fork endpoints return HTTP 501 so the UI cannot pretend a simulation ran.

Run from this `backend` directory:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
uvicorn app.main:app --reload --port 8000
```

Before deployment: extract verified Python functions from `v2D1_SAEV_GPT_Diagnosis_Action_Integration.ipynb`,
preserve the 48 QA checks, implement session isolation and external persistence, expose approval-at-current-snapshot,
enforce auth/rate limits, and keep secrets on the server. Do not assume Cloud Run container local storage persists.
