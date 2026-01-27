// stockApi.js
class StockAPI {
    static async getPortfolioData() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
            totalValue: {
                current: 154280.65,
                change: 2875.30,
                changePercent: '+1.89'
            },
            dailyChange: {
                amount: 2150.75,
                percent: '+1.41'
            },
            allocation: [
                { name: 'US Stocks', percentage: 42 },
                { name: 'Intl Stocks', percentage: 18 },
                { name: 'Bonds', percentage: 25 },
                { name: 'Crypto', percentage: 10 },
                { name: 'Cash', percentage: 5 }
            ],
            metrics: {
                sharpeRatio: 1.25,
                volatility: 12.3,
                maxDrawdown: -8.7
            }
        };
    }

    static async getWatchlist() {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const mockStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 187.24, change: 2.45, changePercent: '1.33' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.86, change: 8.72, changePercent: '2.14' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.91, change: 1.25, changePercent: '0.82' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.45, change: -0.85, changePercent: '-0.47' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.33, change: 15.67, changePercent: '6.83' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 950.02, change: 32.45, changePercent: '3.54' }
        ];
        
        return mockStocks;
    }

    static async getMarketNews() {
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const now = new Date();
        return [
            {
                title: 'Federal Reserve Signals Rate Cuts Ahead As Inflation Eases',
                summary: 'The central bank indicates potential rate reductions in the coming months as economic data shows moderating price pressures.',
                source: 'Bloomberg',
                publishedAt: new Date(now - 2 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'Central Banking'
            },
            {
                title: 'Tech Stocks Rally On AI Optimism, Microsoft Hits Record High',
                summary: 'Technology sector leads market gains as investors bet on AI-driven growth, with Microsoft surpassing $3 trillion valuation.',
                source: 'CNBC',
                publishedAt: new Date(now - 4 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'Technology'
            },
            {
                title: 'Oil Prices Surge 3% Amid Middle East Tensions, Supply Concerns',
                summary: 'Brent crude jumps as geopolitical risks escalate and OPEC+ considers production cuts to stabilize markets.',
                source: 'Reuters',
                publishedAt: new Date(now - 6 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'Commodities'
            },
            {
                title: 'Retail Investor Activity Hits 2-Year High, Particularly in Tech',
                summary: 'Individual traders increase market participation, focusing on AI-related stocks and semiconductor companies.',
                source: 'WSJ Markets',
                publishedAt: new Date(now - 8 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'Markets'
            }
        ];
    }

    static async getPerformanceData(timeRange = '1M') {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Generate realistic performance data based on time range
        const baseValue = 125000;
        const volatility = 0.02; // 2% daily volatility
        
        let data = [];
        let labels = [];
        
        switch (timeRange) {
            case '1D':
                labels = this.generateIntradayLabels();
                data = this.generatePricePath(baseValue, labels.length, volatility / 8); // Less volatility intraday
                break;
            case '1W':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                data = this.generatePricePath(baseValue, 5, volatility);
                break;
            case '1M':
                labels = this.generateMonthlyLabels();
                data = this.generatePricePath(baseValue, labels.length, volatility * Math.sqrt(4)); // Monthly scaling
                break;
            case '1Y':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = this.generatePricePath(baseValue, 12, volatility * Math.sqrt(22)); // Annual scaling
                break;
            case 'All':
                labels = ['2020', '2021', '2022', '2023', '2024'];
                data = this.generatePricePath(baseValue, 5, 0.15); // Long-term volatility
                break;
        }
        
        return { labels, data };
    }
    
    static generateIntradayLabels() {
        return ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    }
    
    static generateMonthlyLabels() {
        const today = new Date();
        const labels = [];
        for (let i = 3; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        return labels;
    }
    
    static generatePricePath(startPrice, periods, volatility) {
        const prices = [startPrice];
        let currentPrice = startPrice;
        
        for (let i = 1; i < periods; i++) {
            // Random walk with drift
            const drift = 0.0002; // Small upward drift
            const shock = (Math.random() - 0.5) * volatility;
            currentPrice = currentPrice * (1 + drift + shock);
            prices.push(currentPrice);
        }
        
        return prices;
    }

    static async searchStocks(query) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const allStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 187.24, change: 1.33 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 415.86, change: 2.14 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', price: 152.91, change: 0.82 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: 178.45, change: -0.47 },
            { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: 245.33, change: 6.83 },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', price: 950.02, change: 3.54 },
            { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', price: 485.75, change: 2.33 },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', price: 195.63, change: 0.45 }
        ];
        
        const queryLower = query.toLowerCase();
        return allStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(queryLower) || 
            stock.name.toLowerCase().includes(queryLower)
        ).slice(0, 8); // Limit to 8 results
    }

    static async getStockDetails(symbol) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const mockDetails = {
            AAPL: {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                price: 187.24,
                change: 2.45,
                changePercent: 1.33,
                marketCap: '2.91T',
                peRatio: 29.5,
                dividendYield: 0.52,
                volume: '58.4M',
                avgVolume: '55.2M',
                dayRange: '184.50-188.25',
                yearRange: '124.17-199.62',
                sector: 'Technology',
                industry: 'Consumer Electronics'
            }
        };
        
        return mockDetails[symbol] || null;
    }
}