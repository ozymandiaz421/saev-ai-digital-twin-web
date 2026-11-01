from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r=client.get('/healthz')
    assert r.status_code==200
    assert r.json()['engine_connected'] is False

def test_scaffold_capabilities():
    r=client.get('/api/v1/capabilities')
    assert r.status_code==200
    assert r.json()['mode']=='SCAFFOLD_ONLY'
    assert r.json()['features']['fork_simulation'] is False

def test_no_fake_simulation():
    assert client.post('/api/v1/sessions').status_code==501
    assert client.post('/api/v1/sessions/demo/incidents').status_code==501
    assert client.post('/api/v1/sessions/demo/compare').status_code==501

def test_cors_policy():
    r=client.options('/api/v1/capabilities',headers={
        'Origin':'https://ozymandiaz421.github.io', 'Access-Control-Request-Method':'GET'})
    assert r.headers.get('access-control-allow-origin')=='https://ozymandiaz421.github.io'
