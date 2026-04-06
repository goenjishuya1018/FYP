import pytest
from unittest.mock import MagicMock, patch
from backend import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.secret_key = 'test_secret_key'
    with app.test_client() as client:
        yield client

@patch('backend.supabase')
@patch('backend.finnhub_client.quote')
def test_get_holdings_multiple_stocks(mock_quote, mock_supabase, client):

    with client.session_transaction() as sess:
        sess['user_id'] = 'user_99'

    mock_user_res = MagicMock()
    mock_user_res.data = {'portfolio_id': 'p_456'}
    
    mock_holdings_res = MagicMock()
    mock_holdings_res.data = [
        {'symbol': 'AAPL', 'quantity': 10, 'avg_cost': 150.0, 'name': 'Apple Inc'},
        {'symbol': 'TSLA', 'quantity': 5, 'avg_cost': 200.0, 'name': 'Tesla Inc'}
    ]

    mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_user_res
    mock_supabase.table().select().eq().execute.return_value = mock_holdings_res

    mock_quote.side_effect = [
        {'c': 165.0, 'd': 2.0, 'dp': 1.2}, 
        {'c': 180.0, 'd': -5.0, 'dp': -2.5} 
    ]

    response = client.get('/api/portfolio/holdings')
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 2


    aapl = next(h for h in data if h['symbol'] == 'AAPL')
    assert aapl['marketValue'] == 1650.0
    assert aapl['totalGain'] == 150.0
    assert aapl['totalGainPercent'] == 10.0 


    tsla = next(h for h in data if h['symbol'] == 'TSLA')
    assert tsla['marketValue'] == 900.0
    assert tsla['totalGain'] == -100.0
    assert tsla['totalGainPercent'] == -10.0

@patch('backend.supabase')
def test_get_holdings_empty_portfolio(mock_supabase, client):

    with client.session_transaction() as sess:
        sess['user_id'] = 'user_new'

    mock_user_res = MagicMock()
    mock_user_res.data = {'portfolio_id': 'p_empty'}
    
    mock_holdings_res = MagicMock()
    mock_holdings_res.data = [] 

    mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_user_res
    mock_supabase.table().select().eq().execute.return_value = mock_holdings_res

    response = client.get('/api/portfolio/holdings')
    assert response.status_code == 200
    assert response.get_json() == []

def test_get_holdings_unauthorized(client):

    response = client.get('/api/portfolio/holdings')
    assert response.status_code == 401
    assert response.get_json()['error'] == "Unauthorized"