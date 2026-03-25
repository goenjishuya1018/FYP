// alertsApi.js
class AlertsAPI {
    constructor() {
        this.baseURL = 'https://api.example.com/alerts'; // Replace with API endpoint
        this.apiKey = 'demo_key'; // Replace with API key
    }

    // Stock price alerts
    async getAlerts() {
        try {
            await this.simulateDelay();
            return [
                {
                    id: 1,
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    condition: 'above',
                    targetPrice: 150.00,
                    currentPrice: 152.34,
                    status: 'active',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    notifications: ['email', 'push'],
                    note: 'Breakout level'
                },
                {
                    id: 2,
                    symbol: 'MSFT',
                    name: 'Microsoft Corp.',
                    condition: 'below',
                    targetPrice: 380.00,
                    currentPrice: 378.85,
                    status: 'triggered',
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                    triggeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    notifications: ['email'],
                    note: 'Support level'
                },
                {
                    id: 3,
                    symbol: 'GOOGL',
                    name: 'Alphabet Inc.',
                    condition: 'above',
                    targetPrice: 140.00,
                    currentPrice: 142.50,
                    status: 'active',
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                    notifications: ['push', 'sms'],
                    note: 'Resistance level'
                },
                {
                    id: 4,
                    symbol: 'TSLA',
                    name: 'Tesla Inc.',
                    condition: 'below',
                    targetPrice: 200.00,
                    currentPrice: 245.33,
                    status: 'active',
                    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    notifications: ['email'],
                    note: 'Buy opportunity'
                },
                {
                    id: 5,
                    symbol: 'NVDA',
                    name: 'NVIDIA Corp.',
                    condition: 'above',
                    targetPrice: 900.00,
                    currentPrice: 895.50,
                    status: 'expired',
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    notifications: ['email', 'push']
                }
            ];
        } catch (error) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    }

    async createAlert(alertData) {
        try {
            await this.simulateDelay();
            return {
                id: Math.floor(Math.random() * 1000),
                ...alertData,
                createdAt: new Date(),
                status: 'active'
            };
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    async updateAlert(alertId, alertData) {
        try {
            await this.simulateDelay();
            return { success: true, id: alertId, ...alertData };
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    }

    async deleteAlert(alertId) {
        try {
            await this.simulateDelay();
            return { success: true, id: alertId };
        } catch (error) {
            console.error('Error deleting alert:', error);
            throw error;
        }
    }

    // Calendar events
    async getCalendarEvents(startDate, endDate) {
        try {
            await this.simulateDelay();
            
            return [
                {
                    id: 101,
                    title: 'AAPL Ex-Dividend',
                    start: new Date(2024, 11, 10), // Dec 10, 2024
                    end: new Date(2024, 11, 10),
                    type: 'dividend',
                    symbol: 'AAPL',
                    amount: 0.24,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    textColor: '#ffffff'
                },
                {
                    id: 102,
                    title: 'MSFT Dividend Payment',
                    start: new Date(2024, 11, 15),
                    end: new Date(2024, 11, 15),
                    type: 'dividend',
                    symbol: 'MSFT',
                    amount: 0.75,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    textColor: '#ffffff'
                },
                {
                    id: 103,
                    title: 'GOOGL Ex-Rights',
                    start: new Date(2024, 11, 5),
                    end: new Date(2024, 11, 5),
                    type: 'ex-rights',
                    symbol: 'GOOGL',
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    textColor: '#ffffff'
                },
                {
                    id: 104,
                    title: 'TSLA Earnings',
                    start: new Date(2024, 11, 20),
                    end: new Date(2024, 11, 20),
                    type: 'earnings',
                    symbol: 'TSLA',
                    backgroundColor: '#6366f1',
                    borderColor: '#6366f1',
                    textColor: '#ffffff'
                },
                {
                    id: 105,
                    title: 'NVDA Ex-Dividend',
                    start: new Date(2024, 11, 25),
                    end: new Date(2024, 11, 25),
                    type: 'dividend',
                    symbol: 'NVDA',
                    amount: 0.16,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    textColor: '#ffffff'
                }
            ];
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    // Custom user events
    async getUserEvents() {
        try {
            await this.simulateDelay();
            
            // Get events from localStorage
            const savedEvents = localStorage.getItem('userEvents');
            if (savedEvents) {
                return JSON.parse(savedEvents);
            }
            
            return [
                {
                    id: 201,
                    title: 'Sell AAPL at $160',
                    start: new Date(2024, 11, 18),
                    end: new Date(2024, 11, 18),
                    type: 'planned-sell',
                    symbol: 'AAPL',
                    targetPrice: 160.00,
                    description: 'Take profits at resistance level',
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    textColor: '#ffffff'
                },
                {
                    id: 202,
                    title: 'Buy MSFT on dip',
                    start: new Date(2024, 11, 12),
                    end: new Date(2024, 11, 15),
                    type: 'planned-buy',
                    symbol: 'MSFT',
                    targetPrice: 350.00,
                    description: 'Buy if price drops to support',
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    textColor: '#ffffff'
                },
                {
                    id: 203,
                    title: 'Portfolio Review',
                    start: new Date(2024, 11, 30),
                    end: new Date(2024, 11, 30),
                    type: 'review',
                    description: 'Monthly portfolio performance review',
                    backgroundColor: '#8b5cf6',
                    borderColor: '#8b5cf6',
                    textColor: '#ffffff'
                }
            ];
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw error;
        }
    }

    async createUserEvent(eventData) {
        try {
            await this.simulateDelay();
            
            const newEvent = {
                id: Math.floor(Math.random() * 1000),
                ...eventData,
                createdAt: new Date()
            };
            
            // Save to localStorage
            const events = await this.getUserEvents();
            events.push(newEvent);
            localStorage.setItem('userEvents', JSON.stringify(events));
            
            return newEvent;
        } catch (error) {
            console.error('Error creating user event:', error);
            throw error;
        }
    }

    async updateUserEvent(eventId, eventData) {
        try {
            await this.simulateDelay();
            
            const events = await this.getUserEvents();
            const index = events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                events[index] = { ...events[index], ...eventData };
                localStorage.setItem('userEvents', JSON.stringify(events));
                return events[index];
            }
            throw new Error('Event not found');
        } catch (error) {
            console.error('Error updating user event:', error);
            throw error;
        }
    }

    async deleteUserEvent(eventId) {
        try {
            await this.simulateDelay();
            
            const events = await this.getUserEvents();
            const filtered = events.filter(e => e.id !== eventId);
            localStorage.setItem('userEvents', JSON.stringify(filtered));
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting user event:', error);
            throw error;
        }
    }

    // Stock search
    async searchStocks(query) {
        try {
            await this.simulateDelay(200);
            
            const stocks = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 152.34, change: 1.23 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: -0.45 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.50, change: 0.89 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.23, change: 2.11 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.33, change: -3.45 },
                { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 895.50, change: 12.34 },
                { symbol: 'META', name: 'Meta Platforms', price: 485.75, change: 5.67 },
                { symbol: 'JPM', name: 'JPMorgan Chase', price: 155.89, change: 0.34 },
                { symbol: 'V', name: 'Visa Inc.', price: 245.67, change: 1.23 },
                { symbol: 'WMT', name: 'Walmart Inc.', price: 165.43, change: -0.56 }
            ];
            
            const queryLower = query.toLowerCase();
            return stocks.filter(stock => 
                stock.symbol.toLowerCase().includes(queryLower) || 
                stock.name.toLowerCase().includes(queryLower)
            ).slice(0, 8);
        } catch (error) {
            console.error('Error searching stocks:', error);
            throw error;
        }
    }

    async getStockPrice(symbol) {
        try {
            await this.simulateDelay(100);
            
            const prices = {
                'AAPL': 152.34,
                'MSFT': 378.85,
                'GOOGL': 142.50,
                'AMZN': 178.23,
                'TSLA': 245.33,
                'NVDA': 895.50,
                'META': 485.75,
                'JPM': 155.89,
                'V': 245.67,
                'WMT': 165.43
            };
            
            return prices[symbol] || 100.00;
        } catch (error) {
            console.error('Error fetching stock price:', error);
            throw error;
        }
    }

    async getDividendInfo(symbol) {
        try {
            await this.simulateDelay(150);
            
            const dividends = {
                'AAPL': { exDate: '2024-12-10', paymentDate: '2024-12-20', amount: 0.24, yield: 0.52 },
                'MSFT': { exDate: '2024-11-15', paymentDate: '2024-12-15', amount: 0.75, yield: 0.73 },
                'NVDA': { exDate: '2024-12-25', paymentDate: '2025-01-15', amount: 0.16, yield: 0.07 }
            };
            
            return dividends[symbol] || null;
        } catch (error) {
            console.error('Error fetching dividend info:', error);
            throw error;
        }
    }

    simulateDelay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize API
const alertsAPI = new AlertsAPI();