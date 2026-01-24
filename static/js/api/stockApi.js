class StockAPI {
    static async getPortfolioData() {
        // Mock data - replace with actual API calls
        return {
            totalValue: {
                current: 125430.75,
                change: 2340.50,
                changePercent: '+1.90'
            },
            dailyChange: {
                amount: 1245.30,
                percent: '+0.98'
            },
            allocation: [
                { name: 'Stocks', percentage: 65 },
                { name: 'Crypto', percentage: 20 },
                { name: 'Bonds', percentage: 10 },
                { name: 'Cash', percentage: 5 }
            ]
        };
    }

    static async getWatchlist() {
        // Mock data
        return [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 2.34, changePercent: '1.30' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: -0.75, changePercent: '0.54' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.23, changePercent: '1.40' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: 12.56, changePercent: '5.33' }
        ];
    }

    static async getMarketNews() {
        // Mock data
        return [
            {
                title: 'Federal Reserve Holds Interest Rates Steady',
                summary: 'The Federal Reserve maintained interest rates while signaling potential cuts later this year amid cooling inflation.',
                source: 'Bloomberg',
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                url: '#',
                imageUrl: null
            },
            {
                title: 'Tech Stocks Rally on Strong Earnings',
                summary: 'Major technology companies reported better-than-expected earnings, driving the NASDAQ to record highs.',
                source: 'CNBC',
                publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                url: '#',
                imageUrl: null
            }
        ];
    }

    static async searchStocks(query) {
        // Implement actual stock search
        return [];
    }
}