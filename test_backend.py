import unittest
from unittest.mock import patch, MagicMock
from backend import app, sync_portfolio_total

class BackendLogicTests(unittest.TestCase):
    
    @patch('backend.supabase') # We "mock" the supabase client
    def test_sync_portfolio_total_calculation(self, mock_supabase):
        # 1. Setup: Fake data that Supabase would normally return
        mock_holdings = [
            {'quantity': 10, 'avg_cost': 150}, # Value = 1500
            {'quantity': 5, 'avg_cost': 100}   # Value = 500
        ]
        
        # 2. Configure the mock to return our fake data
        mock_res = MagicMock()
        mock_res.data = mock_holdings
        mock_supabase.table().select().eq().execute.return_value = mock_res
        
        # 3. Call the actual function
        # We catch the result of the update call inside the function
        sync_portfolio_total("test_p_id")
        
        # 4. Assert: Check if the update was called with the correct total (2000)
        mock_supabase.table().update.assert_called_with({"asset_value": 2000.0})

if __name__ == '__main__':
    unittest.main()