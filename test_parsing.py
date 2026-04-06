import pytest
from unittest.mock import MagicMock, patch
from backend import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['user_id'] = 'test_user_123'
        yield client

class TestStockDataParsing:

    @patch('backend.finnhub_client.symbol_lookup')
    @patch('backend.finnhub_client.quote')
    def test_extract_index_zero_with_multiple_results(self, mock_quote, mock_lookup, client):

        mock_lookup.return_value = {
            'count': 2,
            'result': [
                {
                    'description': 'NVIDIA CORP', 
                    'displaySymbol': 'NVDA', 
                    'symbol': 'NVDA', 
                    'type': 'Common Stock'
                },
                {
                    'description': 'NVIDIA CORP-CDR', 
                    'displaySymbol': 'NVDA.TO', 
                    'symbol': 'NVDA.TO', 
                    'type': 'Canadian DR'
                }
            ]
        }
        mock_quote.return_value = {'c': 900.0, 'd': 10.0, 'dp': 1.1}

        response = client.get('/stock/NVDA')

        assert response.status_code == 200
        assert b'NVIDIA CORP' in response.data
        assert b'Canadian DR' not in response.data

    @patch('backend.finnhub_client.symbol_lookup')
    def test_parsing_empty_results(self, mock_lookup, client):

        mock_lookup.return_value = {'count': 0, 'result': []}

        response = client.get('/stock/NONEXISTENT')

        assert response.status_code == 404
        assert b'No results found' in response.data

