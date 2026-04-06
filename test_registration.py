import pytest
from unittest.mock import MagicMock, patch
from backend import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestUserRegistration:

    @patch('backend.supabase')
    def test_successful_registration(self, mock_supabase, client):
        
        mock_check = MagicMock()
        mock_check.data = None
        mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_check

        mock_insert = MagicMock()
        mock_supabase.table().insert().execute.return_value = mock_insert

        mock_portfolio_res = MagicMock()
        mock_portfolio_res.data = {'portfolio_id': 'p123'}
        mock_supabase.table().select().eq().maybe_single().execute.side_effect = [
            mock_check,          # email check
            mock_check,          # userid check
            mock_portfolio_res   # portfolio_id fetch (Step 4 in your code)
        ]

        registration_data = {
            "email": "test@example.com",
            "userid": "testuser",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User",
            "phone": "12345678"
        }

        response = client.post('/createUser', json=registration_data)

        assert response.status_code == 200
        assert response.get_json()['success'] is True
        
        mock_supabase.table.assert_any_call("user")
        mock_supabase.table.assert_any_call("portfolio")

    @patch('backend.supabase')
    def test_duplicate_email_registration(self, mock_supabase, client):
        
        mock_exists = MagicMock()
        mock_exists.data = {'email': 'test@example.com'}
        mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_exists

        response = client.post('/createUser', json={
            "email": "test@example.com",
            "userid": "newuser"
        })

        assert response.status_code == 400
        assert "Email already registered" in response.get_json()['error']

