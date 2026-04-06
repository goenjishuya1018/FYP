import pytest
from unittest.mock import MagicMock, patch
from backend import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.secret_key = 'test_secret'
    with app.test_client() as client:
        yield client

class TestDashboard:

    @patch('backend.supabase')
    def test_dashboard_access(self, mock_supabase, client):

        with client.session_transaction() as sess:
            sess['user_id'] = 'testuser123'

        mock_res = MagicMock()
        mock_res.data = {'portfolio_id': 'test_portfolio_id'}

        mock_holdings_res = MagicMock()
        mock_holdings_res.data = [
            {'stock_symbol': 'AAPL', 'quantity': 10},
            {'stock_symbol': 'GOOGL', 'quantity': 5}
        ]

        mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_res
        mock_supabase.table().select().eq().execute.return_value = mock_holdings_res

        response = client.get('/api/dashboard/holdings')

        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert data[0]['stock_symbol'] == 'AAPL'
        assert data[0]['quantity'] == 10
        assert data[1]['stock_symbol'] == 'GOOGL'
        assert data[1]['quantity'] == 5

    def test_dashboard_no_session(self, client):

        response = client.get('/api/dashboard/holdings')

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Unauthorized'