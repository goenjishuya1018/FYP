import pytest
from backend import app, supabase

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.secret_key = 'integration_test_secret'
    with app.test_client() as client:
        yield client

def test_full_user_workflow(client):
    test_user = "int_test_user_001"
    test_email = "int_test@example.com"

    reg_response = client.post('/createUser', json={
        "email": test_email,
        "userid": test_user,
        "password": "password123",
        "firstName": "Integration",
        "lastName": "Test",
        "phone": "00000000"
    })
    assert reg_response.status_code == 200

    login_response = client.post('/login', data={"userid": test_user}, follow_redirects=True)
    assert login_response.status_code == 200

    txn_payload = {
        "symbol": "AAPL",
        "type": "buy",
        "shares": 10,
        "price": 150.0,
        "date": "2026-03-30",
        "notes": "Integration test buy"
    }
    txn_response = client.post('/api/portfolio/add-transaction', json=txn_payload)
    assert txn_response.status_code == 200

    holdings_response = client.get('/api/portfolio/holdings')
    assert holdings_response.status_code == 200
    
    data = holdings_response.get_json()
    assert len(data) > 0
    
    aapl_holding = next(h for h in data if h['symbol'] == 'AAPL')
    assert aapl_holding['shares'] == 10
    assert float(aapl_holding['marketPrice']) > 0

    supabase.table("transactions").delete().eq("symbol", "AAPL").execute()
    supabase.table("holdings").delete().eq("symbol", "AAPL").execute()
    supabase.table("user").delete().eq("user_id", test_user).execute()