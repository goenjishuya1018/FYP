class PortfolioDetail {
    constructor() {
        this.currentFilter = '1Y';
        this.allocationView = 'type';
        this.performanceView = 'value';
        this.holdings = [];
        this.allocationData = {};
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadPortfolioData();
        this.setupCharts();
        this.loadDividendCalendar();
    }
    
    setupEventListeners() {
        // Time filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTimeFilter(e.target.dataset.filter));
        });
        
        // Chart action buttons
        document.querySelectorAll('.chart-action[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => this.changePerformanceView(e.target.dataset.type));
        });
        
        document.querySelectorAll('.chart-action[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeAllocationView(e.target.dataset.view));
        });
        
        // Search functionality
        const searchInput = document.getElementById('holdingsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchHoldings(e.target.value));
        }
        
        // Transaction form
        const sharesInput = document.getElementById('shares');
        const priceInput = document.getElementById('price');
        if (sharesInput && priceInput) {
            sharesInput.addEventListener('input', this.calculateTransactionTotal.bind(this));
            priceInput.addEventListener('input', this.calculateTransactionTotal.bind(this));
        }
        
        // Asset symbol autocomplete
        const assetSymbolInput = document.getElementById('assetSymbol');
        if (assetSymbolInput) {
            assetSymbolInput.addEventListener('input', (e) => this.assetAutocomplete(e.target.value));
        }
    }
    
    async loadPortfolioData() {
        this.showLoading();
        
        try {
            const [summary, holdings, allocation] = await Promise.all([
                PortfolioAPI.getPortfolioSummary(),
                PortfolioAPI.getHoldings(),
                PortfolioAPI.getAssetAllocation()
            ]);
            
            this.updateSummary(summary);
            this.holdings = holdings;
            this.allocationData = allocation;
            
            this.renderHoldings();
            this.updateAllocationDetails();
            
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showError('Failed to load portfolio data');
        } finally {
            this.hideLoading();
        }
    }
    
    updateSummary(summary) {
        document.getElementById('totalValue').textContent = 
            Helpers.formatCurrency(summary.totalValue);
        
        const dailyChange = summary.dailyChange;
        const changeElement = document.getElementById('dailyChange');
        changeElement.textContent = 
            `${dailyChange.amount >= 0 ? '+' : ''}${Helpers.formatCurrency(dailyChange.amount)} (${dailyChange.percent >= 0 ? '+' : ''}${dailyChange.percent}%)`;
        changeElement.className = dailyChange.amount >= 0 ? 'change-info positive' : 'change-info negative';
        
        // Update dividend metrics
        const metrics = summary.dividendMetrics;
        document.getElementById('dividendYield').textContent = `${metrics.yieldTTM}%`;
        document.getElementById('yieldOnCost').textContent = `${metrics.yieldOnCost}%`;
        document.getElementById('cagr').textContent = `${metrics.cagr}%`;
        document.getElementById('totalDividends').textContent = Helpers.formatCurrency(metrics.totalYTD);
    }
    
    renderHoldings() {
        const tbody = document.getElementById('holdingsTable');
        
        if (!this.holdings || this.holdings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div style="text-align:center;padding:40px;">
                            <div style="font-size:3rem;margin-bottom:16px;">💼</div>
                            <h3 style="color:var(--text-secondary);margin-bottom:8px;">No Holdings Yet</h3>
                            <p style="color:var(--text-muted);margin-bottom:16px;">Start building your portfolio by adding your first investment</p>
                            <button class="btn-primary" onclick="addTransaction()">Add First Holding</button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.holdings.map(holding => `
            <tr>
                <td>
                    <div class="asset-cell">
                        <div class="asset-logo">${holding.symbol.substring(0, 3)}</div>
                        <div class="asset-info">
                            <div class="asset-name">${holding.name}</div>
                            <div class="asset-symbol">${holding.symbol}</div>
                        </div>
                    </div>
                </td>
                <td>${holding.shares.toLocaleString()}</td>
                <td>${Helpers.formatCurrency(holding.avgCost)}</td>
                <td>${Helpers.formatCurrency(holding.marketPrice)}</td>
                <td>${Helpers.formatCurrency(holding.marketValue)}</td>
                <td class="change-cell ${holding.dailyChange >= 0 ? 'positive' : 'negative'}">
                    ${holding.dailyChange >= 0 ? '+' : ''}${holding.dailyChangePercent}%
                </td>
                <td class="${holding.totalGain >= 0 ? 'positive' : 'negative'}">
                    ${holding.totalGain >= 0 ? '+' : ''}${Helpers.formatCurrency(holding.totalGain)}
                </td>
                <td>${holding.dividendYield.toFixed(2)}%</td>
                <td>
                    <div class="action-cell">
                        <button class="btn-icon-small" onclick="viewHolding('${holding.symbol}')" title="View Details">👁️</button>
                        <button class="btn-icon-small" onclick="editHolding(${holding.id})" title="Edit">✏️</button>
                        <button class="btn-icon-small" onclick="sellHolding(${holding.id})" title="Sell">💰</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    async setupCharts() {
        await this.loadPerformanceChart();
        this.createAllocationChart();
    }
    
    async loadPerformanceChart() {
        try {
            const data = await PortfolioAPI.getPerformanceData(this.currentFilter);
            this.createPerformanceChart(data.labels, data.portfolio, data.sp500);
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
            });
            
        } catch (error) {
            console.error('Error loading performance chart:', error);
        }
    }
    
    createPerformanceChart(labels, portfolioData, sp500Data) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
        
        let datasets = [];
        
        switch (this.performanceView) {
            case 'value':
                datasets = [{
                    label: 'Portfolio Value',
                    data: portfolioData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }];
                break;
                
            case 'return':
                const portfolioReturns = portfolioData.map((value, index) => 
                    index === 0 ? 0 : ((value - portfolioData[0]) / portfolioData[0] * 100)
                );
                datasets = [{
                    label: 'Portfolio Return (%)',
                    data: portfolioReturns,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }];
                break;
                
            case 'vsindex':
                const portfolioGrowth = portfolioData.map((value, index) => 
                    index === 0 ? 0 : ((value / portfolioData[0] - 1) * 100)
                );
                const sp500Growth = sp500Data.map((value, index) => 
                    index === 0 ? 0 : ((value / sp500Data[0] - 1) * 100)
                );
                
                datasets = [
                    {
                        label: 'Portfolio',
                        data: portfolioGrowth,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'S&P 500',
                        data: sp500Growth,
                        borderColor: '#94a3b8',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        borderDash: [5, 5]
                    }
                ];
                break;
        }
        
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        // position: 'top'
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (this.performanceView === 'value') {
                                    label += Helpers.formatCurrency(context.parsed.y);
                                } else {
                                    label += context.parsed.y.toFixed(2) + '%';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            callback: (value) => {
                                if (this.performanceView === 'value') {
                                    if (value >= 1000000) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                        return '$' + (value / 1000).toFixed(0) + 'K';
                                    }
                                    return '$' + value.toLocaleString();
                                } else {
                                    return value.toFixed(0) + '%';
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    
    createAllocationChart() {
        const ctx = document.getElementById('allocationChart').getContext('2d');
        const data = this.allocationData[this.allocationView] || this.allocationData.byType;
        
        // Destroy existing chart if it exists
        if (this.allocationChart) {
            this.allocationChart.destroy();
        }
        
        this.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    data: data.map(item => item.percentage),
                    backgroundColor: data.map(item => item.color),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const item = data[context.dataIndex];
                                return `${item.name}: ${item.percentage}% (${Helpers.formatCurrency(item.value)})`;
                            }
                        }
                    }
                }
            }
        });
        
        // Update active view button
        document.querySelectorAll('.chart-action[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.allocationView);
        });
    }
    
    updateAllocationDetails() {
        const container = document.getElementById('allocationDetails');
        const data = this.allocationData[this.allocationView] || this.allocationData.byType;
        
        container.innerHTML = data.map(item => `
            <div class="allocation-item">
                <div class="allocation-color" style="background: ${item.color}"></div>
                <div class="allocation-info">
                    <span class="allocation-name">${item.name}</span>
                    <span class="allocation-percentage">${item.percentage}%</span>
                </div>
                <div class="allocation-value">${Helpers.formatCurrency(item.value)}</div>
            </div>
        `).join('');
    }
    
    async loadDividendCalendar() {
        try {
            const calendar = await PortfolioAPI.getDividendCalendar(2024);
            this.renderDividendCalendar(calendar);
        } catch (error) {
            console.error('Error loading dividend calendar:', error);
        }
    }
    
    renderDividendCalendar(calendar) {
        // Update each month
        Object.entries(calendar).forEach(([month, events]) => {
            const containerId = `dividend${month}`;
            const container = document.getElementById(containerId);
            
            if (container) {
                if (events.length === 0) {
                    container.innerHTML = '<div class="no-dividends">No dividends scheduled</div>';
                } else {
                    container.innerHTML = events.map(event => `
                        <div class="dividend-event">
                            <div class="dividend-company">
                                <div class="company-logo">${event.symbol.substring(0, 3)}</div>
                                <div class="company-info">
                                    <div class="company-name">${event.name}</div>
                                    <div class="dividend-date">${new Date(event.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div class="dividend-details">
                                <div class="dividend-amount">$${event.amount.toFixed(2)}</div>
                                <div class="dividend-yield">${event.shares} shares</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        });
    }
    
    changeTimeFilter(filter) {
        this.currentFilter = filter;
        this.loadPerformanceChart();
    }
    
    changePerformanceView(view) {
        this.performanceView = view;
        
        // Update active button
        document.querySelectorAll('.chart-action[data-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === view);
        });
        
        this.loadPerformanceChart();
    }
    
    changeAllocationView(view) {
        this.allocationView = view;
        this.createAllocationChart();
        this.updateAllocationDetails();
    }
    
    searchHoldings(query) {
        const searchLower = query.toLowerCase();
        const rows = document.querySelectorAll('#holdingsTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchLower) ? '' : 'none';
        });
    }
    
    async assetAutocomplete(query) {
        if (query.length < 2) return;
        
        try {
            const assets = await PortfolioAPI.searchAssets(query);
            const datalist = document.getElementById('assetSuggestions');
            
            datalist.innerHTML = assets.map(asset => 
                `<option value="${asset.symbol}">${asset.name} (${asset.exchange})</option>`
            ).join('');
            
        } catch (error) {
            console.error('Error fetching asset suggestions:', error);
        }
    }
    
    calculateTransactionTotal() {
        const shares = parseFloat(document.getElementById('shares').value) || 0;
        const price = parseFloat(document.getElementById('price').value) || 0;
        const total = shares * price;
        
        document.getElementById('transactionTotal').textContent = 
            Helpers.formatCurrency(total);
    }
    
    // Modal functions
    openTransactionModal() {
        document.getElementById('transactionModal').classList.add('active');
    }
    
    closeTransactionModal() {
        document.getElementById('transactionModal').classList.remove('active');
        // Reset form
        document.getElementById('transactionForm').reset();
        this.calculateTransactionTotal();
    }
    
    async submitTransaction() {
        const transaction = {
            type: document.getElementById('transactionType').value,
            symbol: document.getElementById('assetSymbol').value,
            shares: parseFloat(document.getElementById('shares').value),
            price: parseFloat(document.getElementById('price').value),
            date: document.getElementById('transactionDate').value,
            notes: document.getElementById('notes').value,
            total: parseFloat(document.getElementById('shares').value) * parseFloat(document.getElementById('price').value)
        };
        
        try {
            await PortfolioAPI.addTransaction(transaction);
            alert('Transaction added successfully!');
            this.closeTransactionModal();
            await this.loadPortfolioData(); // Refresh data
        } catch (error) {
            alert('Error adding transaction: ' + error.message);
        }
    }
    
    openGoalModal() {
        document.getElementById('goalModal').classList.add('active');
    }
    
    closeGoalModal() {
        document.getElementById('goalModal').classList.remove('active');
        // Reset form
        document.getElementById('goalForm').reset();
    }
    
    submitGoal() {
        const goal = {
            name: document.getElementById('goalName').value,
            targetAmount: parseFloat(document.getElementById('targetAmount').value),
            currentAmount: parseFloat(document.getElementById('currentAmount').value),
            targetDate: document.getElementById('targetDate').value,
            monthlyContribution: parseFloat(document.getElementById('monthlyContribution').value),
            icon: document.getElementById('goalIcon').value
        };
        
        // In a real app, this would call an API
        alert(`Goal "${goal.name}" created successfully!`);
        this.closeGoalModal();
        // TODO: Refresh goals list
    }
    
    // Navigation functions
    viewHolding(symbol) {
        // Navigate to market detail page for this symbol
        if (window.parent === window) {
            window.location.href = `market.html?symbol=${symbol}`;
        } else {
            window.parent.postMessage({ 
                type: 'navigate', 
                page: `market.html?symbol=${symbol}` 
            }, '*');
        }
    }
    
    editHolding(holdingId) {
        // Implement edit holding functionality
        console.log('Edit holding:', holdingId);
    }
    
    sellHolding(holdingId) {
        // Open transaction modal with sell type
        document.getElementById('transactionType').value = 'sell';
        this.openTransactionModal();
    }
    
    exportPortfolio() {
        // Implement export functionality
        const portfolioData = {
            holdings: this.holdings,
            summary: {
                totalValue: document.getElementById('totalValue').textContent,
                dailyChange: document.getElementById('dailyChange').textContent
            }
        };
        
        const dataStr = JSON.stringify(portfolioData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Portfolio data exported successfully!');
    }
    
    addTransaction() {
        this.openTransactionModal();
    }
    
    addHolding() {
        this.openTransactionModal();
    }
    
    addGoal() {
        this.openGoalModal();
    }
    
    viewAllDividends() {
        // Navigate to dividends page or show more
        console.log('View all dividends');
    }
    
    searchAssets() {
        // Focus on search input
        document.getElementById('holdingsSearch').focus();
    }
    
    updateDividendCalendar() {
        const year = document.getElementById('dividendYear').value;
        this.loadDividendCalendar(year);
    }
    
    showLoading() {
        document.body.classList.add('loading');
    }
    
    hideLoading() {
        document.body.classList.remove('loading');
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <span>⚠️ ${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioDetail = new PortfolioDetail();
    
    // Make functions available globally
    window.addTransaction = () => window.portfolioDetail.addTransaction();
    window.addGoal = () => window.portfolioDetail.addGoal();
    window.viewAllDividends = () => window.portfolioDetail.viewAllDividends();
    window.exportPortfolio = () => window.portfolioDetail.exportPortfolio();
    window.addHolding = () => window.portfolioDetail.addHolding();
    window.searchAssets = () => window.portfolioDetail.searchAssets();
    window.updateDividendCalendar = () => window.portfolioDetail.updateDividendCalendar();
    window.viewHolding = (symbol) => window.portfolioDetail.viewHolding(symbol);
    window.editHolding = (id) => window.portfolioDetail.editHolding(id);
    window.sellHolding = (id) => window.portfolioDetail.sellHolding(id);
    window.closeTransactionModal = () => window.portfolioDetail.closeTransactionModal();
    window.submitTransaction = () => window.portfolioDetail.submitTransaction();
    window.closeGoalModal = () => window.portfolioDetail.closeGoalModal();
    window.submitGoal = () => window.portfolioDetail.submitGoal();
});