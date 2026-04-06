import pytest
from unittest.mock import MagicMock, patch
from backend import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.secret_key = 'test_secret' 
    with app.test_client() as client:
        yield client

class TestLoginLogic:

    @patch('backend.supabase')
    def test_login_success(self, mock_supabase, client):

        mock_res = MagicMock()
        mock_res.data = {'user_id': 'testuser123', 'email': 'test@test.com'}
        mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_res

        response = client.post('/login', data={'userid': 'testuser123'}, follow_redirects=False)

        assert response.status_code == 302 
        assert response.location.endswith('/') 
        
        with client.session_transaction() as sess:
            assert sess['user_id'] == 'testuser123'

    @patch('backend.supabase')
    def test_login_failure(self, mock_supabase, client):
        """Test login with an invalid user ID"""
        mock_res = MagicMock()
        mock_res.data = None
        mock_supabase.table().select().eq().maybe_single().execute.return_value = mock_res

        response = client.post('/login', data={'userid': 'wronguser'})

        assert response.status_code == 401
        assert b"Invalid Login" in response.data
        
        with client.session_transaction() as sess:
            assert 'user_id' not in sess