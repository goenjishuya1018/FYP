// marketDetail.js
class MarketDetail {
    constructor() {
        this.symbol = this.getSymbolFromURL();
        this.currentChart = null;
        this.currentChartType = 'price';
        this.currentRange = '1M';
        this.isLoading = false;
        
        this.init();
    }
    
    getSymbolFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('symbol') || 'NKE';
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadStockData();
        this.setupChart();
        this.loadNews();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Time filter buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTimeRange(e.target.dataset.range));
        });
        
        // Trading modal
        const sharesInput = document.getElementById('shares');
        if (sharesInput) {
            sharesInput.addEventListener('input', this.updateEstimatedCost.bind(this));
        }
    }
    
    async loadStockData() {
        this.showLoading();
        
        try {
            // Load all data in parallel
            const [overview, quote] = await Promise.all([
                FinancialAPI.getStockOverview(this.symbol),
                FinancialAPI.getStockQuote(this.symbol)
            ]);
            
            this.updateUI(overview, quote);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError('Failed to load stock data');
        } finally {
            this.hideLoading();
        }
    }
    
    updateUI(overview, quote) {
        // Update basic info

        document.getElementById('stockSymbol').textContent = overview.symbol;
        document.getElementById('stockName').textContent = overview.name;
        document.getElementById('stockExchange').textContent = overview.exchange;
        document.getElementById('stockLogo').textContent = overview.symbol;
        
        // Update price
        const price = quote.price.toFixed(2);
        const change = quote.change.toFixed(2);
        const changePercent = quote.changePercent.toFixed(2);
        
        document.getElementById('currentPrice').textContent = `$${price}`;
        document.getElementById('priceChange').innerHTML = `
            <span class="change-amount">${change >= 0 ? '+' : ''}$${Math.abs(change)}</span>
            <span class="change-percent">(${change >= 0 ? '+' : ''}${Math.abs(changePercent)}%)</span>
        `;
        
        // Update color based on change
        const priceChangeElement = document.getElementById('priceChange');
        priceChangeElement.className = change >= 0 ? 'price-change positive' : 'price-change negative';
        
        // Update key metrics
        document.getElementById('marketCap').textContent = overview.marketCap;
        document.getElementById('peRatio').textContent = overview.peRatio;
        document.getElementById('dividendYield').textContent = overview.dividendYield;
        document.getElementById('beta').textContent = overview.beta;
        document.getElementById('week52High').textContent = `$${overview.week52High}`;
        document.getElementById('week52Low').textContent = `$${overview.week52Low}`;
        
        // Update company info
        document.getElementById('companyDescription').textContent = overview.description;
        document.getElementById('ceoName').textContent = overview.ceo;
        document.getElementById('employees').textContent = overview.employees;
        document.getElementById('sector').textContent = overview.sector;
        document.getElementById('industry').textContent = overview.industry;
        document.getElementById('website').textContent = overview.website;
        document.getElementById('website').href = overview.website;
        
        // Update page title
        document.title = `${overview.symbol} - ${overview.name} | Theta`;
    }
    
    async setupChart() {
        await this.loadChartData(this.currentRange);
    }
    
    async loadChartData(range) {
        try {
            const chartData = await FinancialAPI.getStockChart(this.symbol, range);
            
            // Update chart info
            document.getElementById('chartRange').textContent = this.getRangeDisplayName(range);
            document.getElementById('chartInterval').textContent = this.getIntervalForRange(range);
            
            // Update active button
            document.querySelectorAll('.time-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.range === range);
            });
            
            // Create or update chart
            this.createPriceChart(chartData.labels, chartData.values);
            
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }
    
    createPriceChart(labels, data) {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        // Determine line color
        const isPositive = data[data.length - 1] > data[0];
        const lineColor = isPositive ? '#10b981' : '#ef4444';
        const fillColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: data,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: lineColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 12 },
                        bodyFont: { size: 14 },
                        callbacks: {
                            label: (context) => {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', maxTicksLimit: 8 }
                    },
                    y: {
                        position: 'right',
                        grid: { color: 'rgba(226, 232, 240, 0.5)' },
                        ticks: {
                            color: '#64748b',
                            callback: (value) => `$${value.toFixed(0)}`
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    async loadNews() {
        try {
            const news = await FinancialAPI.getStockNews(this.symbol);
            this.renderNews(news);
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }
    
    renderNews(news) {
        const container = document.getElementById('stockNews');
        
        if (!news || news.length === 0) {
            container.innerHTML = '<div class="no-news">No news available at this time.</div>';
            return;
        }
        
        container.innerHTML = news.map(article => `
            <div class="news-card" onclick="window.open('${article.url}', '_blank')">
                <div class="news-content">
                    <div class="news-header">
                        <span class="news-source">${article.source}</span>
                        <span class="news-time">${Helpers.formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <h4 class="news-title">${article.title}</h4>
                    <p class="news-summary">${article.summary}</p>
                    <div class="news-category">${article.category}</div>
                </div>
            </div>
        `).join('');
    }
    
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Load data for specific tabs
        switch (tabName) {
            case 'financials':
                this.loadFinancialData();
                break;
            case 'dividends':
                this.loadDividendData();
                break;
            case 'portfolio':
                this.loadPortfolioData();
                break;
        }
    }
    
    async loadFinancialData() {
        try {
            const financials = await FinancialAPI.getFinancials(this.symbol);
            
            // Update financial metrics
            if (financials.revenue) {
                document.getElementById('revenueTTM').textContent = financials.revenue;
            }
            if (financials.grossProfit) {
                document.getElementById('grossProfitTTM').textContent = financials.grossProfit;
            }
            if (financials.operatingIncome) {
                document.getElementById('operatingIncomeTTM').textContent = financials.operatingIncome;
            }
            if (financials.netIncome) {
                document.getElementById('netIncomeTTM').textContent = financials.netIncome;
            }
            if (financials.eps) {
                document.getElementById('epsTTM').textContent = financials.eps;
            }
            
            // Load earnings chart
            this.createEarningsChart();
            
        } catch (error) {
            console.error('Error loading financial data:', error);
        }
    }
    
    async loadDividendData() {
        try {
            const dividends = await FinancialAPI.getDividends(this.symbol);
            
            // Update dividend summary
            document.getElementById('currentYield').textContent = dividends.currentYield;
            document.getElementById('annualDividend').textContent = dividends.annualDividend;
            
            // Render dividend history
            this.renderDividendHistory(dividends.history);
            
            // Create dividend chart
            this.createDividendChart(dividends.history);
            
        } catch (error) {
            console.error('Error loading dividend data:', error);
        }
    }
    
    renderDividendHistory(history) {
        const tbody = document.getElementById('dividendHistoryBody');
        
        if (!history || history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No dividend history available</td></tr>';
            return;
        }
        
        tbody.innerHTML = history.map(dividend => `
            <tr>
                <td>${dividend.date.toLocaleDateString()}</td>
                <td>${this.getPaymentDate(dividend.date)}</td>
                <td>$${dividend.amount.toFixed(2)}</td>
                <td>${dividend.type}</td>
            </tr>
        `).join('');
    }
    
    getPaymentDate(exDate) {
        const paymentDate = new Date(exDate);
        paymentDate.setDate(paymentDate.getDate() + 30); // Typically 30 days after ex-date
        return paymentDate.toLocaleDateString();
    }
    
    createEarningsChart() {
        const ctx = document.getElementById('earningsChart').getContext('2d');
        
        // Mock data for earnings chart
        const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'];
        const revenue = [12.4, 13.3, 12.9, 13.4, 13.3, 13.8]; // in billions
        const earnings = [1.2, 1.3, 1.1, 1.4, 1.3, 1.5]; // in billions
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: quarters,
                datasets: [
                    {
                        label: 'Revenue ($B)',
                        data: revenue,
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Earnings ($B)',
                        data: earnings,
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue ($B)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Earnings ($B)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    createDividendChart(history) {
        const ctx = document.getElementById('dividendChart').getContext('2d');
        
        // Prepare data
        const labels = history.map(d => d.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
        const data = history.map(d => d.amount);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.reverse(),
                datasets: [{
                    label: 'Dividend Amount',
                    data: data.reverse(),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Dividend Amount ($)'
                        }
                    }
                }
            }
        });
    }
    
    loadPortfolioData() {
        // Create investment performance chart
        this.createInvestmentChart();
    }
    
    createInvestmentChart() {
        const ctx = document.getElementById('investmentChart').getContext('2d');
        
        // Mock investment performance data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const portfolioValue = [8000, 8200, 8150, 8300, 8250, 8400, 8350, 8450, 8420, 8500, 8550, 8425];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Portfolio Value',
                    data: portfolioValue,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            callback: (value) => `$${value.toLocaleString()}`
                        }
                    }
                }
            }
        });
    }
    
    changeTimeRange(range) {
        this.currentRange = range;
        this.loadChartData(range);
    }
    
    getRangeDisplayName(range) {
        const names = {
            '1D': '1 Day',
            '1W': '1 Week',
            '1M': '1 Month',
            '3M': '3 Months',
            '1Y': '1 Year',
            '5Y': '5 Years'
        };
        return names[range] || range;
    }
    
    getIntervalForRange(range) {
        const intervals = {
            '1D': '5 minutes',
            '1W': '30 minutes',
            '1M': 'Daily',
            '3M': 'Daily',
            '1Y': 'Daily',
            '5Y': 'Weekly'
        };
        return intervals[range] || 'Daily';
    }
    
    // Trading modal functions
    openTradeModal(action) {
        const modal = document.getElementById('tradeModal');
        const title = document.getElementById('tradeModalTitle');
        
        title.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} ${this.symbol}`;
        modal.classList.add('active');
        
        // Reset form
        document.getElementById('shares').value = '10';
        this.updateEstimatedCost();
    }
    
    closeTradeModal() {
        document.getElementById('tradeModal').classList.remove('active');
    }
    
    updateEstimatedCost() {
        const shares = parseInt(document.getElementById('shares').value) || 0;
        const price = parseFloat(document.getElementById('currentPrice').textContent.replace('$', ''));
        const estimatedCost = shares * price;
        
        document.getElementById('estimatedCost').textContent = `$${estimatedCost.toFixed(2)}`;
    }
    
    executeTrade() {
        const shares = parseInt(document.getElementById('shares').value);
        const action = document.getElementById('tradeModalTitle').textContent.split(' ')[0].toLowerCase();
        
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} order for ${shares} shares of ${this.symbol} placed successfully!`);
        this.closeTradeModal();
    }
    
    showLoading() {
        this.isLoading = true;
        document.body.classList.add('loading');
    }
    
    hideLoading() {
        this.isLoading = false;
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
    window.marketDetail = new MarketDetail();
});