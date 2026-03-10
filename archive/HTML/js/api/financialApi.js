// Sample data
class FinancialAPI {
    static API_KEY = 'demo'; // Replace with API key
    static BASE_URL = 'https://www.alphavantage.co/query';
    static FINNHUB_URL = 'https://finnhub.io/api/v1';
    static FINNHUB_KEY = 'demo'; // Replace with Finnhub API key
    
    static async getStockOverview(symbol) {
        try {
            // Alpha Vantage API for company overview
            const response = await fetch(
                `${this.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            if (data.Note || data.Information) {
                // API limit reached, use mock data
                console.warn('API limit reached, using mock data');
                return this.getMockOverview(symbol);
            }
            
            return this.formatOverviewData(data);
            
        } catch (error) {
            console.error('Error fetching stock overview:', error);
            return this.getMockOverview(symbol);
        }
    }
    
    static async getStockQuote(symbol) {
        try {
            // Finnhub API for real-time quotes
            const response = await fetch(
                `${this.FINNHUB_URL}/quote?symbol=${symbol}&token=${this.FINNHUB_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return this.formatQuoteData(data, symbol);
            
        } catch (error) {
            console.error('Error fetching stock quote:', error);
            return this.getMockQuote(symbol);
        }
    }
    
    static async getStockChart(symbol, range = '1D') {
        try {
            let interval = '5min';
            let outputsize = 'compact';
            
            switch (range) {
                case '1D':
                    interval = '5min';
                    outputsize = 'compact';
                    break;
                case '1W':
                    interval = '30min';
                    outputsize = 'compact';
                    break;
                case '1M':
                    interval = 'daily';
                    outputsize = 'compact';
                    break;
                case '3M':
                    interval = 'daily';
                    outputsize = 'compact';
                    break;
                case '1Y':
                    interval = 'daily';
                    outputsize = 'full';
                    break;
                case '5Y':
                    interval = 'weekly';
                    outputsize = 'full';
                    break;
            }
            
            const response = await fetch(
                `${this.BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.API_KEY}`
            );
            
            const data = await response.json();
            
            if (data.Note || data.Information) {
                return this.getMockChartData(range);
            }
            
            return this.formatChartData(data, range);
            
        } catch (error) {
            console.error('Error fetching chart data:', error);
            return this.getMockChartData(range);
        }
    }
    
    static async getStockNews(symbol) {
        try {
            const today = new Date();
            const fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 7);
            
            const from = fromDate.toISOString().split('T')[0];
            const to = today.toISOString().split('T')[0];
            
            const response = await fetch(
                `${this.FINNHUB_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${this.FINNHUB_KEY}`
            );
            
            const data = await response.json();
            
            if (data.error || !Array.isArray(data) || data.length === 0) {
                return this.getMockNews();
            }
            
            return data.slice(0, 6).map(article => this.formatNewsData(article));
            
        } catch (error) {
            console.error('Error fetching news:', error);
            return this.getMockNews();
        }
    }
    
    static async getFinancials(symbol) {
        try {
            // Alpha Vantage for income statement
            const response = await fetch(
                `${this.BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${this.API_KEY}`
            );
            
            const data = await response.json();
            
            if (data.Note || data.Information) {
                return this.getMockFinancials();
            }
            
            return this.formatFinancialData(data);
            
        } catch (error) {
            console.error('Error fetching financials:', error);
            return this.getMockFinancials();
        }
    }
    
    static async getDividends(symbol) {
        try {
            const response = await fetch(
                `${this.BASE_URL}?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}&apikey=${this.API_KEY}`
            );
            
            const data = await response.json();
            
            if (data.Note || data.Information) {
                return this.getMockDividends();
            }
            
            return this.formatDividendData(data);
            
        } catch (error) {
            console.error('Error fetching dividends:', error);
            return this.getMockDividends();
        }
    }
    
    static formatOverviewData(data) {
        return {
            symbol: data.Symbol,
            name: data.Name,
            description: data.Description,
            exchange: data.Exchange,
            currency: data.Currency,
            country: data.Country,
            sector: data.Sector,
            industry: data.Industry,
            marketCap: this.formatMarketCap(data.MarketCapitalization),
            peRatio: data.PERatio,
            dividendYield: data.DividendYield,
            beta: data.Beta,
            week52High: data['52WeekHigh'],
            week52Low: data['52WeekLow'],
            eps: data.EPS,
            revenue: this.formatCurrency(data.RevenueTTM),
            grossProfit: this.formatCurrency(data.GrossProfitTTM),
            profitMargin: data.ProfitMargin,
            operatingMargin: data.OperatingMarginTTM,
            returnOnEquity: data.ReturnOnEquityTTM,
            returnOnAssets: data.ReturnOnAssetsTTM,
            debtToEquity: data.DebtToEquity,
            currentRatio: data.CurrentRatio,
            employees: data.FullTimeEmployees,
            ceo: data.CEO,
            website: data.Website
        };
    }
    
    static formatQuoteData(data, symbol) {
        return {
            symbol: symbol,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc,
            volume: data.v,
            timestamp: data.t
        };
    }
    
    static formatChartData(data, range) {
        let timeSeries = {};
        let labels = [];
        let values = [];
        
        // Extract time series based on API response structure
        if (data['Time Series (5min)']) {
            timeSeries = data['Time Series (5min)'];
        } else if (data['Time Series (30min)']) {
            timeSeries = data['Time Series (30min)'];
        } else if (data['Time Series (Daily)']) {
            timeSeries = data['Time Series (Daily)'];
        } else if (data['Weekly Time Series']) {
            timeSeries = data['Weekly Time Series'];
        }
        
        // Get latest data points based on range
        const entries = Object.entries(timeSeries);
        let dataPoints = 30; // Default number of data points
        
        switch (range) {
            case '1D': dataPoints = 78; break; // 6.5 hours * 12 (5min intervals)
            case '1W': dataPoints = 28; break; // 7 days * 4 (30min intervals)
            case '1M': dataPoints = 30; break;
            case '3M': dataPoints = 63; break;
            case '1Y': dataPoints = 252; break; // Trading days
            case '5Y': dataPoints = 260; break; // Weeks
        }
        
        const latestEntries = entries.slice(0, Math.min(dataPoints, entries.length));
        
        // Reverse to get chronological order
        latestEntries.reverse().forEach(([timestamp, valuesObj]) => {
            labels.push(this.formatChartLabel(timestamp, range));
            values.push(parseFloat(valuesObj['4. close']));
        });
        
        return { labels, values };
    }
    
    static formatChartLabel(timestamp, range) {
        const date = new Date(timestamp);
        
        switch (range) {
            case '1D':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case '1W':
            case '1M':
            case '3M':
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            case '1Y':
            case '5Y':
                return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
            default:
                return timestamp;
        }
    }
    
    static formatNewsData(article) {
        return {
            title: article.headline,
            summary: article.summary || '',
            source: article.source,
            url: article.url,
            imageUrl: article.image,
            publishedAt: new Date(article.datetime * 1000),
            category: article.category || 'General'
        };
    }
    
    static formatFinancialData(data) {
        const annualReports = data.annualReports || [];
        const latestReport = annualReports[0] || {};
        
        return {
            revenue: this.formatCurrency(latestReport.totalRevenue),
            grossProfit: this.formatCurrency(latestReport.grossProfit),
            operatingIncome: this.formatCurrency(latestReport.operatingIncome),
            netIncome: this.formatCurrency(latestReport.netIncome),
            eps: latestReport.eps,
            totalAssets: this.formatCurrency(latestReport.totalAssets),
            totalLiabilities: this.formatCurrency(latestReport.totalLiabilities),
            totalEquity: this.formatCurrency(latestReport.totalShareholderEquity),
            cash: this.formatCurrency(latestReport.cashAndCashEquivalentsAtCarryingValue),
            debt: this.formatCurrency(latestReport.totalDebt)
        };
    }
    
    static formatDividendData(data) {
        const monthlyData = data['Monthly Adjusted Time Series'] || {};
        const dividends = [];
        
        Object.entries(monthlyData).forEach(([date, values]) => {
            const dividend = parseFloat(values['7. dividend amount']);
            if (dividend > 0) {
                dividends.push({
                    date: new Date(date),
                    amount: dividend,
                    type: 'Regular'
                });
            }
        });
        
        // Sort by date descending
        dividends.sort((a, b) => b.date - a.date);
        
        return {
            history: dividends.slice(0, 12), // Last 12 dividends
            currentYield: (dividends[0]?.amount * 12 / 100).toFixed(2) + '%',
            annualDividend: (dividends[0]?.amount * 4).toFixed(2)
        };
    }
    
    static formatMarketCap(value) {
        const num = parseFloat(value);
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    }
    
    static formatCurrency(value) {
        const num = parseFloat(value);
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    }
    
    // Mock data fallbacks
    static getMockOverview(symbol) {
        const mockData = {
            NKE: {
                symbol: 'NKE',
                name: 'Nike Inc.',
                description: 'Nike, Inc. designs, develops, markets, and sells athletic footwear, apparel, equipment, and accessories worldwide. The company offers Nike brand products in six categories: running, basketball, football, training, sportswear, and other.',
                exchange: 'NYSE',
                currency: 'USD',
                country: 'USA',
                sector: 'Consumer Cyclical',
                industry: 'Footwear & Apparel',
                marketCap: '$161.2B',
                peRatio: '28.5',
                dividendYield: '1.42%',
                beta: '0.96',
                week52High: '$128.68',
                week52Low: '$88.66',
                eps: '$3.67',
                revenue: '$51.22B',
                grossProfit: '$22.85B',
                profitMargin: '11.2%',
                operatingMargin: '12.4%',
                returnOnEquity: '41.8%',
                returnOnAssets: '15.2%',
                debtToEquity: '0.69',
                currentRatio: '2.45',
                employees: '83,700',
                ceo: 'John Donahoe',
                website: 'https://www.nike.com'
            },
            AAPL: {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
                exchange: 'NASDAQ',
                currency: 'USD',
                country: 'USA',
                sector: 'Technology',
                industry: 'Consumer Electronics',
                marketCap: '$2.91T',
                peRatio: '29.5',
                dividendYield: '0.52%',
                beta: '1.25',
                week52High: '$199.62',
                week52Low: '$124.17',
                eps: '$6.16',
                revenue: '$383.29B',
                grossProfit: '$169.14B',
                profitMargin: '25.3%',
                operatingMargin: '29.8%',
                returnOnEquity: '147.5%',
                returnOnAssets: '28.6%',
                debtToEquity: '1.87',
                currentRatio: '0.99',
                employees: '164,000',
                ceo: 'Tim Cook',
                website: 'https://www.apple.com'
            },
            MSFT: {
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
                exchange: 'NASDAQ',
                currency: 'USD',
                country: 'USA',
                sector: 'Technology',
                industry: 'Software - Infrastructure',
                marketCap: '$3.08T',
                peRatio: '36.8',
                dividendYield: '0.73%',
                beta: '0.88',
                week52High: '$420.82',
                week52Low: '$245.61',
                eps: '$11.06',
                revenue: '$211.92B',
                grossProfit: '$146.05B',
                profitMargin: '36.4%',
                operatingMargin: '43.0%',
                returnOnEquity: '39.3%',
                returnOnAssets: '19.2%',
                debtToEquity: '0.35',
                currentRatio: '1.38',
                employees: '221,000',
                ceo: 'Satya Nadella',
                website: 'https://www.microsoft.com'
            }
        };
        
        return mockData[symbol] || mockData.NKE;
    }
    
    static getMockQuote(symbol) {
        const basePrices = {
            NKE: 104.92,
            AAPL: 187.24,
            MSFT: 415.86,
            GOOGL: 152.91,
            AMZN: 178.45,
            TSLA: 245.33,
            NVDA: 950.02
        };
        
        const basePrice = basePrices[symbol] || 100.00;
        const change = (Math.random() - 0.5) * 5;
        const changePercent = (change / basePrice) * 100;
        
        return {
            symbol: symbol,
            price: basePrice + change,
            change: change,
            changePercent: changePercent.toFixed(2),
            high: basePrice + Math.random() * 10,
            low: basePrice - Math.random() * 10,
            open: basePrice + (Math.random() - 0.5) * 2,
            previousClose: basePrice,
            volume: Math.floor(Math.random() * 10000000) + 1000000,
            timestamp: Date.now() / 1000
        };
    }
    
    static getMockChartData(range) {
        const baseValue = 10000;
        const volatility = range === '1D' ? 0.01 : range === '1W' ? 0.02 : range === '1M' ? 0.05 : 0.15;
        
        let labels = [];
        let values = [baseValue];
        
        switch (range) {
            case '1D':
                labels = Array.from({ length: 78 }, (_, i) => {
                    const hour = 9 + Math.floor(i / 12);
                    const minute = (i % 12) * 5;
                    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                });
                break;
            case '1W':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                break;
            case '1M':
                labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
                break;
            case '3M':
                labels = Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`);
                break;
            case '1Y':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;
            case '5Y':
                labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
                break;
        }
        
        // Generate price path
        for (let i = 1; i < labels.length; i++) {
            const change = (Math.random() - 0.5) * 2 * volatility;
            values.push(values[i - 1] * (1 + change));
        }
        
        return { labels, values };
    }
    
    static getMockNews() {
        const news = [
            {
                title: 'Nike Reports Strong Q3 Earnings, Beats Estimates',
                summary: 'Nike announced quarterly earnings that exceeded analyst expectations, driven by strong digital sales and growth in key markets.',
                source: 'CNBC',
                url: '#',
                imageUrl: null,
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                category: 'Earnings'
            },
            {
                title: 'New Athletic Wear Line Boosts Nike Sales',
                summary: 'Nike\'s latest collection of sustainable athletic wear sees record sales in first month of release.',
                source: 'Bloomberg',
                url: '#',
                imageUrl: null,
                publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                category: 'Products'
            },
            {
                title: 'Analysts Raise Price Target for Nike Stock',
                summary: 'Multiple investment firms have increased their price targets for Nike following positive quarterly results.',
                source: 'Reuters',
                url: '#',
                imageUrl: null,
                publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                category: 'Analysis'
            }
        ];
        
        return news;
    }
    
    static getMockFinancials() {
        return {
            revenue: '$51.22B',
            grossProfit: '$22.85B',
            operatingIncome: '$6.38B',
            netIncome: '$5.72B',
            eps: '$3.67',
            totalAssets: '$37.54B',
            totalLiabilities: '$23.85B',
            totalEquity: '$13.69B',
            cash: '$8.93B',
            debt: '$9.42B'
        };
    }
    
    static getMockDividends() {
        const history = [
            { date: new Date('2024-12-01'), amount: 0.37, type: 'Regular' },
            { date: new Date('2024-09-01'), amount: 0.34, type: 'Regular' },
            { date: new Date('2024-06-01'), amount: 0.34, type: 'Regular' },
            { date: new Date('2024-03-01'), amount: 0.34, type: 'Regular' },
            { date: new Date('2023-12-01'), amount: 0.34, type: 'Regular' },
            { date: new Date('2023-09-01'), amount: 0.34, type: 'Regular' }
        ];
        
        return {
            history: history,
            currentYield: '1.42%',
            annualDividend: '$1.48'
        };
    }
}