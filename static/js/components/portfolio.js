class PortfolioManager {
    constructor() {
        this.holdings = [];
        this.performanceData = {};
        this.allocationData = [];
    }

    async initialize() {
        await this.loadPortfolioData();
        this.setupPortfolioEventListeners();
    }

    async loadPortfolioData() {
        try {
            this.showPortfolioLoading();
            
            // Load holdings data
            this.holdings = await this.fetchHoldings();
            this.renderHoldings();
            
            // Load performance data
            this.performanceData = await this.fetchPerformanceData();
            this.updatePerformanceMetrics();
            
            // Load allocation data
            this.allocationData = await this.fetchAllocationData();
            this.renderAllocationChart();
            
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showPortfolioError('Failed to load portfolio data');
        }
    }

    async fetchHoldings() {
        // Mock data - replace with actual API calls
        return [
            {
                id: 1,
                symbol: 'AAPL',
                name: 'Apple Inc.',
                shares: 15,
                avgPrice: 150.25,
                currentPrice: 182.63,
                change: 2.34,
                changePercent: 1.30,
                marketValue: 2739.45,
                dailyGain: 35.10,
                totalGain: 485.70,
                allocation: 18.5,
                sector: 'Technology'
            },
            {
                id: 2,
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                shares: 8,
                avgPrice: 320.50,
                currentPrice: 378.85,
                change: 5.23,
                changePercent: 1.40,
                marketValue: 3030.80,
                dailyGain: 41.84,
                totalGain: 466.80,
                allocation: 20.4,
                sector: 'Technology'
            },
            {
                id: 3,
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                shares: 5,
                avgPrice: 125.80,
                currentPrice: 138.21,
                change: -0.75,
                changePercent: -0.54,
                marketValue: 691.05,
                dailyGain: -3.75,
                totalGain: 62.05,
                allocation: 4.7,
                sector: 'Technology'
            },
            {
                id: 4,
                symbol: 'VOO',
                name: 'Vanguard S&P 500 ETF',
                shares: 12,
                avgPrice: 385.20,
                currentPrice: 412.75,
                change: 1.25,
                changePercent: 0.30,
                marketValue: 4953.00,
                dailyGain: 15.00,
                totalGain: 330.60,
                allocation: 33.2,
                sector: 'ETF'
            },
            {
                id: 5,
                symbol: 'BTC-USD',
                name: 'Bitcoin USD',
                shares: 0.15,
                avgPrice: 38500.00,
                currentPrice: 42850.00,
                change: 1250.00,
                changePercent: 3.01,
                marketValue: 6427.50,
                dailyGain: 187.50,
                totalGain: 652.50,
                allocation: 11.3,
                sector: 'Cryptocurrency'
            }
        ];
    }

    async fetchPerformanceData() {
        return {
            totalValue: 14841.80,
            dailyChange: 275.69,
            dailyChangePercent: 1.89,
            totalGain: 1997.65,
            totalGainPercent: 15.56,
            todaysGainers: 4,
            todaysLosers: 1
        };
    }

    async fetchAllocationData() {
        return [
            { name: 'Technology', percentage: 43.6, value: 6461.30, color: '#6366f1' },
            { name: 'ETF', percentage: 33.2, value: 4953.00, color: '#10b981' },
            { name: 'Cryptocurrency', percentage: 11.3, value: 6427.50, color: '#f59e0b' },
            { name: 'Cash', percentage: 11.9, value: 2000.00, color: '#94a3b8' }
        ];
    }

    renderHoldings() {
        const holdingsContainer = document.getElementById('holdingsList');
        
        if (!this.holdings || this.holdings.length === 0) {
            holdingsContainer.innerHTML = this.getEmptyHoldingsState();
            return;
        }

        holdingsContainer.innerHTML = this.holdings.map(holding => `
            <div class="holding-item" data-symbol="${holding.symbol}">
                <div class="stock-info">
                    <div class="stock-icon">${this.getStockIcon(holding.sector)}</div>
                    <div>
                        <div class="stock-symbol">${holding.symbol}</div>
                        <div class="stock-name">${holding.name}</div>
                        <div class="holding-details">
                            ${holding.shares} shares • ${holding.allocation}%
                        </div>
                    </div>
                </div>
                <div class="holding-performance">
                    <div class="price">${Helpers.formatCurrency(holding.currentPrice)}</div>
                    <div class="change ${holding.change >= 0 ? 'positive' : 'negative'}">
                        ${holding.change >= 0 ? '+' : ''}${holding.changePercent}%
                    </div>
                    <div class="market-value">
                        ${Helpers.formatCurrency(holding.marketValue)}
                    </div>
                    <div class="daily-gain ${holding.dailyGain >= 0 ? 'positive' : 'negative'}">
                        ${holding.dailyGain >= 0 ? '+' : ''}${Helpers.formatCurrency(holding.dailyGain)}
                    </div>
                </div>
            </div>
        `).join('');

        this.injectHoldingsStyles();
    }

    getStockIcon(sector) {
        const icons = {
            'Technology': '💻',
            'ETF': '📊',
            'Cryptocurrency': '₿',
            'Healthcare': '🏥',
            'Finance': '🏦',
            'Energy': '⚡',
            'Consumer': '🛒',
            'Industrial': '🏭'
        };
        return icons[sector] || '📈';
    }

    getEmptyHoldingsState() {
        return `
            <div class="empty-holdings-state">
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:3rem;margin-bottom:16px;">💼</div>
                    <h3 style="color:var(--text-secondary);margin-bottom:8px;">No Holdings Yet</h3>
                    <p style="color:var(--text-muted);margin-bottom:16px;">Start building your portfolio by adding your first investment</p>
                    <button class="btn-secondary" onclick="portfolioManager.addNewHolding()">Add Holding</button>
                </div>
            </div>
        `;
    }

    updatePerformanceMetrics() {
        const { totalValue, dailyChange, dailyChangePercent, totalGain, totalGainPercent } = this.performanceData;
        
        // Update the main portfolio overview
        document.getElementById('totalValue').textContent = Helpers.formatCurrency(totalValue);
        document.getElementById('totalChange').textContent = 
            `${Helpers.formatCurrency(dailyChange)} (${dailyChangePercent}%)`;
        document.getElementById('totalChange').className = 
            `change ${dailyChange >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('dailyChange').textContent = Helpers.formatCurrency(dailyChange);
        document.querySelector('.daily-change .change').textContent = `${dailyChangePercent}%`;
        document.querySelector('.daily-change .change').className = 
            `change ${dailyChange >= 0 ? 'positive' : 'negative'}`;
    }

    renderAllocationChart() {
        const allocationContainer = document.getElementById('allocationChart');
        allocationContainer.innerHTML = '<canvas id="allocationChartCanvas"></canvas>';
        
        const ctx = document.getElementById('allocationChartCanvas').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.allocationData.map(item => item.name),
                datasets: [{
                    data: this.allocationData.map(item => item.percentage),
                    backgroundColor: this.allocationData.map(item => item.color),
                    borderWidth: 0,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const item = this.allocationData[context.dataIndex];
                                return `${item.name}: ${item.percentage}% (${Helpers.formatCurrency(item.value)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    showPortfolioLoading() {
        const holdingsContainer = document.getElementById('holdingsList');
        holdingsContainer.innerHTML = `
            <div class="holdings-loading">
                ${Array.from({length: 5}, () => `
                    <div class="holding-item-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-info">
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line medium"></div>
                        </div>
                        <div class="skeleton-performance">
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showPortfolioError(message) {
        const holdingsContainer = document.getElementById('holdingsList');
        holdingsContainer.innerHTML = `
            <div class="portfolio-error">
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:3rem;margin-bottom:16px;">❌</div>
                    <h3 style="color:var(--danger-color);margin-bottom:8px;">Error Loading Portfolio</h3>
                    <p style="color:var(--text-muted);margin-bottom:16px;">${message}</p>
                    <button class="btn-secondary" onclick="portfolioManager.loadPortfolioData()">Try Again</button>
                </div>
            </div>
        `;
    }

    setupPortfolioEventListeners() {
        // Add click handlers for holding items
        document.addEventListener('click', (e) => {
            const holdingItem = e.target.closest('.holding-item');
            if (holdingItem) {
                const symbol = holdingItem.dataset.symbol;
                this.openHoldingDetails(symbol);
            }
        });

        // Add sorting functionality
        this.setupSorting();
    }

    openHoldingDetails(symbol) {
        const holding = this.holdings.find(h => h.symbol === symbol);
        if (holding) {
            this.showHoldingModal(holding);
        }
    }

    showHoldingModal(holding) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background:white;border-radius:12px;padding:24px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h2 style="margin:0;">${holding.symbol} - ${holding.name}</h2>
                    <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                    <div class="holding-stat">
                        <div class="stat-label">Current Price</div>
                        <div class="stat-value">${Helpers.formatCurrency(holding.currentPrice)}</div>
                    </div>
                    <div class="holding-stat">
                        <div class="stat-label">Shares</div>
                        <div class="stat-value">${holding.shares}</div>
                    </div>
                    <div class="holding-stat">
                        <div class="stat-label">Market Value</div>
                        <div class="stat-value">${Helpers.formatCurrency(holding.marketValue)}</div>
                    </div>
                    <div class="holding-stat">
                        <div class="stat-label">Allocation</div>
                        <div class="stat-value">${holding.allocation}%</div>
                    </div>
                </div>

                <div style="border-top:1px solid var(--border-color);padding-top:16px;">
                    <h3 style="margin-bottom:12px;">Performance</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="performance-stat">
                            <div class="stat-label">Today's Gain/Loss</div>
                            <div class="stat-value ${holding.dailyGain >= 0 ? 'positive' : 'negative'}">
                                ${Helpers.formatCurrency(holding.dailyGain)}
                            </div>
                        </div>
                        <div class="performance-stat">
                            <div class="stat-label">Total Gain/Loss</div>
                            <div class="stat-value ${holding.totalGain >= 0 ? 'positive' : 'negative'}">
                                ${Helpers.formatCurrency(holding.totalGain)}
                            </div>
                        </div>
                        <div class="performance-stat">
                            <div class="stat-label">Average Cost</div>
                            <div class="stat-value">${Helpers.formatCurrency(holding.avgPrice)}</div>
                        </div>
                        <div class="performance-stat">
                            <div class="stat-label">Sector</div>
                            <div class="stat-value">${holding.sector}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:24px;text-align:center;">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        modal.classList.add('modal');
        document.body.appendChild(modal);
        this.injectModalStyles();
    }

    setupSorting() {
        // This would implement sorting by different columns
        console.log('Portfolio sorting setup complete');
    }

    addNewHolding() {
        // Implementation for adding new holdings
        console.log('Add new holding functionality');
    }

    injectHoldingsStyles() {
        if (!document.getElementById('holdings-styles')) {
            const style = document.createElement('style');
            style.id = 'holdings-styles';
            style.textContent = `
                .holding-details {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                .stock-icon {
                    font-size: 1.5rem;
                    margin-right: 12px;
                }

                .holding-performance {
                    text-align: right;
                }

                .market-value {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 4px 0;
                }

                .daily-gain {
                    font-size: 0.875rem;
                }

                .holding-item-skeleton {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border-radius: var(--border-radius);
                }

                .skeleton-icon {
                    width: 32px;
                    height: 32px;
                    background: var(--bg-gray);
                    border-radius: 50%;
                    margin-right: 12px;
                }

                .skeleton-info {
                    flex: 1;
                }

                .skeleton-performance {
                    text-align: right;
                }

                .holding-stat, .performance-stat {
                    padding: 8px;
                    background: var(--bg-gray);
                    border-radius: var(--border-radius);
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }
            `;
            document.head.appendChild(style);
        }
    }

    injectModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal {
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize portfolio manager
const portfolioManager = new PortfolioManager();