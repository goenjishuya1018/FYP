class PortfolioAPI {
    static BASE_URL = 'https://api.example.com/portfolio'; // Replace with API endpoint
    static API_KEY = 'demo_key'; // Replace with API key
    
    static async getPortfolioSummary() {
        try {
            // In a real implementation, this would call backend API
            // const response = await fetch(`${this.BASE_URL}/summary`, {
            //     headers: { 'Authorization': `Bearer ${this.API_KEY}` }
            // });
            // return await response.json();
            
            // Mock data for demo
            await this.simulateDelay();
            return {
                totalValue: 154280.65,
                dailyChange: {
                    amount: 2150.75,
                    percent: 1.41
                },
                dividendMetrics: {
                    yieldTTM: 2.18,
                    yieldOnCost: 3.45,
                    cagr: 15.27,
                    totalYTD: 3285.40
                },
                performance: {
                    '1D': 1.41,
                    '1W': 2.83,
                    '1M': 5.67,
                    'YTD': 12.45,
                    '1Y': 18.32
                }
            };
        } catch (error) {
            console.error('Error fetching portfolio summary:', error);
            throw error;
        }
    }
    
    static async getHoldings() {
        try {
            // Mock holdings data
            await this.simulateDelay();
            return [
                {
                    id: 1,
                    symbol: 'TSLA',
                    name: 'Tesla Inc.',
                    shares: 6,
                    avgCost: 180.50,
                    marketPrice: 245.33,
                    dailyChange: 15.67,
                    dailyChangePercent: 6.83,
                    marketValue: 1471.98,
                    totalGain: 389.00,
                    dividendYield: 0.00,
                    sector: 'Automotive',
                    currency: 'USD'
                },
                {
                    id: 2,
                    symbol: 'RYA',
                    name: 'Ryanair Holdings',
                    shares: 60,
                    avgCost: 18.50,
                    marketPrice: 22.73,
                    dailyChange: -0.45,
                    dailyChangePercent: -1.94,
                    marketValue: 1363.80,
                    totalGain: 253.80,
                    dividendYield: 1.42,
                    sector: 'Airlines',
                    currency: 'EUR'
                },
                {
                    id: 3,
                    symbol: 'ETH-USD',
                    name: 'Ethereum',
                    shares: 0.5,
                    avgCost: 3200.00,
                    marketPrice: 3825.50,
                    dailyChange: 125.25,
                    dailyChangePercent: 3.38,
                    marketValue: 1912.75,
                    totalGain: 312.75,
                    dividendYield: 0.00,
                    sector: 'Cryptocurrency',
                    currency: 'USD'
                },
                {
                    id: 4,
                    symbol: 'VIC',
                    name: 'Vinci',
                    shares: 2,
                    avgCost: 105.75,
                    marketPrice: 112.88,
                    dailyChange: 1.25,
                    dailyChangePercent: 1.12,
                    marketValue: 225.76,
                    totalGain: 14.26,
                    dividendYield: 3.85,
                    sector: 'Construction',
                    currency: 'EUR'
                },
                {
                    id: 5,
                    symbol: 'MSFT',
                    name: 'Microsoft',
                    shares: 2,
                    avgCost: 295.40,
                    marketPrice: 378.85,
                    dailyChange: 5.23,
                    dailyChangePercent: 1.40,
                    marketValue: 757.70,
                    totalGain: 166.90,
                    dividendYield: 0.73,
                    sector: 'Technology',
                    currency: 'USD'
                },
                {
                    id: 6,
                    symbol: '0700',
                    name: 'Tencent Holdings',
                    shares: 10,
                    avgCost: 320.50,
                    marketPrice: 297.61,
                    dailyChange: -3.45,
                    dailyChangePercent: -1.14,
                    marketValue: 2976.10,
                    totalGain: -229.00,
                    dividendYield: 0.88,
                    sector: 'Technology',
                    currency: 'HKD'
                },
                {
                    id: 7,
                    symbol: 'PG',
                    name: 'Procter & Gamble',
                    shares: 5,
                    avgCost: 145.80,
                    marketPrice: 156.25,
                    dailyChange: 0.88,
                    dailyChangePercent: 0.57,
                    marketValue: 781.25,
                    totalGain: 52.25,
                    dividendYield: 2.42,
                    sector: 'Consumer Goods',
                    currency: 'USD'
                }
            ];
        } catch (error) {
            console.error('Error fetching holdings:', error);
            throw error;
        }
    }
    
    static async getAssetAllocation() {
        try {
            await this.simulateDelay();
            return {
                byType: [
                    { name: 'Stocks', value: 85642.50, percentage: 55.5, color: '#6366f1' },
                    { name: 'ETFs', value: 35720.80, percentage: 23.2, color: '#10b981' },
                    { name: 'Crypto', value: 25725.00, percentage: 16.7, color: '#f59e0b' },
                    { name: 'Bonds', value: 5230.35, percentage: 3.4, color: '#3b82f6' },
                    { name: 'Cash', value: 1963.00, percentage: 1.2, color: '#94a3b8' }
                ],
                bySector: [
                    { name: 'Technology', value: 45215.80, percentage: 29.3, color: '#8b5cf6' },
                    { name: 'Consumer Cyclical', value: 28742.65, percentage: 18.6, color: '#ef4444' },
                    { name: 'Healthcare', value: 18542.30, percentage: 12.0, color: '#06b6d4' },
                    { name: 'Financial Services', value: 15320.75, percentage: 9.9, color: '#84cc16' },
                    { name: 'Industrial', value: 12548.90, percentage: 8.1, color: '#f97316' },
                    { name: 'Other', value: 33910.25, percentage: 22.1, color: '#64748b' }
                ],
                byRegion: [
                    { name: 'North America', value: 102845.80, percentage: 66.7, color: '#3b82f6' },
                    { name: 'Europe', value: 28742.65, percentage: 18.6, color: '#ef4444' },
                    { name: 'Asia Pacific', value: 18542.30, percentage: 12.0, color: '#10b981' },
                    { name: 'Other', value: 4150.90, percentage: 2.7, color: '#94a3b8' }
                ]
            };
        } catch (error) {
            console.error('Error fetching allocation:', error);
            throw error;
        }
    }
    
    static async getDividendCalendar(year = 2024) {
        try {
            await this.simulateDelay();
            
            const months = {
                Jan: [
                    { symbol: 'MSFT', name: 'Microsoft', amount: 0.91, date: '2024-01-15', shares: 2, total: 1.82 },
                    { symbol: 'LVMH', name: 'LVMH', amount: 5.50, date: '2024-01-20', shares: 2, total: 11.00, currency: 'EUR' }
                ],
                Feb: [
                    { symbol: 'JNJ', name: 'Johnson & Johnson', amount: 1.19, date: '2024-02-15', shares: 8, total: 9.52 }
                ],
                Mar: [
                    { symbol: 'PG', name: 'Procter & Gamble', amount: 1.057, date: '2024-03-15', shares: 5, total: 5.29 }
                ],
                Apr: [
                    { symbol: 'AAPL', name: 'Apple', amount: 0.24, date: '2024-04-15', shares: 15, total: 3.60 }
                ],
                May: [
                    { symbol: 'JPM', name: 'JPMorgan Chase', amount: 1.05, date: '2024-05-15', shares: 6, total: 6.30 }
                ],
                Jun: [
                    { symbol: 'V', name: 'Visa', amount: 0.52, date: '2024-06-15', shares: 12, total: 6.24 }
                ],
                Jul: [
                    { symbol: 'WMT', name: 'Walmart', amount: 0.57, date: '2024-07-15', shares: 8, total: 4.56 }
                ],
                Aug: [
                    { symbol: 'KO', name: 'Coca-Cola', amount: 0.46, date: '2024-08-15', shares: 20, total: 9.20 }
                ],
                Sep: [
                    { symbol: 'PFE', name: 'Pfizer', amount: 0.41, date: '2024-09-15', shares: 25, total: 10.25 }
                ],
                Oct: [
                    { symbol: 'RYA', name: 'Ryanair', amount: 0.227, date: '2024-10-15', shares: 60, total: 13.62, currency: 'EUR' },
                    { symbol: 'MSFT', name: 'Microsoft', amount: 0.83, date: '2024-10-15', shares: 2, total: 1.66 }
                ],
                Nov: [
                    { symbol: 'PG', name: 'Procter & Gamble', amount: 1.057, date: '2024-11-15', shares: 5, total: 5.29 }
                ],
                Dec: [
                    { symbol: 'MSFT', name: 'Microsoft', amount: 0.91, date: '2024-12-15', shares: 2, total: 1.82 },
                    { symbol: 'LVMH', name: 'LVMH', amount: 5.50, date: '2024-12-20', shares: 2, total: 11.00, currency: 'EUR' }
                ]
            };
            
            return months;
        } catch (error) {
            console.error('Error fetching dividend calendar:', error);
            throw error;
        }
    }
    
    static async getPerformanceData(range = '1Y') {
        try {
            await this.simulateDelay();
            
            let labels = [];
            let portfolioValues = [];
            let sp500Values = [];
            const baseValue = 125000;
            
            switch (range) {
                case '1D':
                    // Intraday data (9:30 AM to 4:00 PM)
                    labels = Array.from({ length: 78 }, (_, i) => {
                        const hour = 9 + Math.floor(i / 12);
                        const minute = (i % 12) * 5;
                        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    });
                    portfolioValues = this.generatePricePath(baseValue, labels.length, 0.008);
                    sp500Values = this.generatePricePath(baseValue * 0.95, labels.length, 0.007);
                    break;
                    
                case '1W':
                    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    portfolioValues = this.generatePricePath(baseValue, 5, 0.02);
                    sp500Values = this.generatePricePath(baseValue * 0.95, 5, 0.018);
                    break;
                    
                case '1M':
                    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                    portfolioValues = this.generatePricePath(baseValue, 4, 0.04);
                    sp500Values = this.generatePricePath(baseValue * 0.95, 4, 0.035);
                    break;
                    
                case 'YTD':
                    const monthsYTD = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const currentMonth = new Date().getMonth();
                    labels = monthsYTD.slice(0, currentMonth + 1);
                    portfolioValues = this.generatePricePath(baseValue, labels.length, 0.12);
                    sp500Values = this.generatePricePath(baseValue * 0.95, labels.length, 0.10);
                    break;
                    
                case '1Y':
                    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    portfolioValues = this.generatePricePath(baseValue, 12, 0.15);
                    sp500Values = this.generatePricePath(baseValue * 0.95, 12, 0.12);
                    break;
                    
                case 'MAX':
                    labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
                    portfolioValues = this.generatePricePath(baseValue * 0.7, 6, 0.25);
                    sp500Values = this.generatePricePath(baseValue * 0.65, 6, 0.22);
                    break;
            }
            
            return {
                labels,
                portfolio: portfolioValues,
                sp500: sp500Values
            };
        } catch (error) {
            console.error('Error fetching performance data:', error);
            throw error;
        }
    }
    
    static async addTransaction(transaction) {
        try {
            // In real implementation:
            // const response = await fetch(`${this.BASE_URL}/transactions`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${this.API_KEY}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(transaction)
            // });
            // return await response.json();
            
            await this.simulateDelay();
            return { success: true, id: Date.now(), ...transaction };
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }
    
    static async searchAssets(query) {
        try {
            // Mock search results
            await this.simulateDelay();
            
            const allAssets = [
                { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Stock', exchange: 'NASDAQ' },
                { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', exchange: 'NYSE' },
                { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', exchange: 'NASDAQ' },
                { symbol: 'BTC-USD', name: 'Bitcoin', type: 'Crypto', exchange: 'Crypto' },
                { symbol: 'ETH-USD', name: 'Ethereum', type: 'Crypto', exchange: 'Crypto' },
                { symbol: 'US10Y', name: '10-Year Treasury Note', type: 'Bond', exchange: 'Bond' },
                { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'ETF', exchange: 'NYSE' }
            ];
            
            const queryLower = query.toLowerCase();
            return allAssets.filter(asset => 
                asset.symbol.toLowerCase().includes(queryLower) || 
                asset.name.toLowerCase().includes(queryLower)
            ).slice(0, 10);
        } catch (error) {
            console.error('Error searching assets:', error);
            throw error;
        }
    }
    
    static generatePricePath(startPrice, periods, volatility) {
        const prices = [startPrice];
        let currentPrice = startPrice;
        
        for (let i = 1; i < periods; i++) {
            const drift = 0.0003; // Small upward drift
            const shock = (Math.random() - 0.5) * volatility;
            currentPrice = currentPrice * (1 + drift + shock);
            prices.push(currentPrice);
        }
        
        return prices;
    }
    
    static simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, 300));
    }
}