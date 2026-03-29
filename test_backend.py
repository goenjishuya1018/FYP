import unittest
from unittest.mock import patch, MagicMock
from backend import app, sync_portfolio_total, sync_portfolio_market_value

class BackendLogicTests(unittest.TestCase):
    
    @patch('backend.supabase')
    def test_sync_portfolio_total_calculation(self, mock_supabase):
        mock_holdings = [
            {'quantity': 10, 'avg_cost': 150}, 
            {'quantity': 5, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 2000.0})

    @patch('backend.supabase')
    def test_sync_portfolio_total_no_holdings(self, mock_supabase):
        mock_res = MagicMock()
        mock_res.data = []
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 0.0})

    @patch('backend.supabase')
    def test_sync_portfolio_total_with_zero_quantity(self, mock_supabase):
        mock_holdings = [
            {'quantity': 0, 'avg_cost': 150}, 
            {'quantity': 5, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 500.0})
    
    @patch('backend.supabase')
    def test_sync_portfolio_total_with_zero_avg_cost(self, mock_supabase):
        mock_holdings = [
            {'quantity': 10, 'avg_cost': 0}, 
            {'quantity': 5, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 500.0})

    @patch('backend.supabase')
    def test_sync_portfolio_total_with_negative_values(self, mock_supabase):
        mock_holdings = [
            {'quantity': -10, 'avg_cost': 150}, 
            {'quantity': 5, 'avg_cost': -100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": -2000.0})

    @patch('backend.supabase')
    def test_sync_portfolio_total_with_large_numbers(self, mock_supabase):
        mock_holdings = [
            {'quantity': 1000000, 'avg_cost': 150}, 
            {'quantity': 500000, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 200000000.0})

    @patch('backend.supabase')
    def test_sync_portfolio_total_with_mixed_values(self, mock_supabase):
        mock_holdings = [
            {'quantity': 10, 'avg_cost': 150}, 
            {'quantity': -5, 'avg_cost': 100}, 
            {'quantity': 0, 'avg_cost': 50} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        sync_portfolio_total("test_p_id")
        
        mock_supabase.table().update.assert_called_with({"asset_value": 1000.0})

    @patch('backend.supabase')
    def test_sync_portfolio_market_value_calculation(self, mock_supabase):
        mock_holdings = [
            {'symbol': 'AAPL', 'quantity': 10, 'avg_cost': 150}, 
            {'symbol': 'GOOGL', 'quantity': 5, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        with patch('backend.finnhub_client.quote') as mock_quote:
            mock_quote.side_effect = [
                {'c': 200},  # AAPL current price
                {'c': 150}   # GOOGL current price
            ]
            
            sync_portfolio_market_value("test_p_id")
            
            expected_market_value = (10 * 200) + (5 * 150)
            mock_supabase.table().update.assert_called_with({"market_value": expected_market_value})
    
    @patch('backend.supabase')
    def test_sync_portfolio_market_value_with_api_failure(self, mock_supabase):
        mock_holdings = [
            {'symbol': 'AAPL', 'quantity': 10, 'avg_cost': 150}, 
            {'symbol': 'GOOGL', 'quantity': 5, 'avg_cost': 100} 
        ]
        
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        with patch('backend.finnhub_client.quote') as mock_quote:
            mock_quote.side_effect = Exception("API failure")
            
            sync_portfolio_market_value("test_p_id")
            
            expected_market_value = (10 * 150) + (5 * 100)
            mock_supabase.table().update.assert_called_with({"market_value": expected_market_value})
if __name__ == '__main__':
    unittest.main()