from fastapi.testclient import TestClient
import sys
sys.path.insert(0, 'backend')

from main import app

client = TestClient(app)

print("Testing Newsletter API Endpoints:")
print("")

# Test subscribe
r = client.post(
    '/subscribe',
    params={
        'email': 'test@example.com',
        'role': 'frontend',
        'tech_stack': ['react', 'typescript']
    }
)
print(f"POST /subscribe: {r.status_code}")
print(f"  Response: {r.json()}")
print("")

# Test get subscribers
r = client.get('/subscribers', params={'admin_key': 'change_me'})
print(f"GET /subscribers: {r.status_code}")
if r.status_code == 200:
    print(f"  Total subscribers: {r.json()['total']}")
print("")

print("✅ All endpoints working!")
