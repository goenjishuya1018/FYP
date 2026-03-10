class QuinDashboard {
    constructor() {
        this.currentDate = new Date();
        this.portfolioData = null;
        this.watchlistData = [];
        this.newsData = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        
        // Initialize components
        await portfolioManager.initialize();
        await newsManager.loadNews();
        
        this.loadDashboardData();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.handleSearch.bind(this));

        // Time filters
        document.querySelectorAll('.time-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.time-filter').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.updatePerformanceChart(e.target.textContent);
            });
        });

        // Chart actions
        document.querySelectorAll('.chart-action').forEach(button => {
            button.addEventListener('click', (e) => {
                if (!e.target.classList.contains('active')) {
                    document.querySelectorAll('.chart-action').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    }

    updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            this.currentDate.toLocaleDateString('en-US', options);
    }

    async loadDashboardData() {
        try {
            // Load portfolio data
            this.portfolioData = await StockAPI.getPortfolioData();
            this.updatePortfolioOverview();
            
            // Load watchlist
            this.watchlistData = await StockAPI.getWatchlist();
            this.renderWatchlist();
            
            // Load news
            this.newsData = await StockAPI.getMarketNews();
            this.renderNews();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updatePortfolioOverview() {
        if (!this.portfolioData) return;

        const { totalValue, dailyChange, allocation } = this.portfolioData;
        
        // Update total value
        document.getElementById('totalValue').textContent = 
            Helpers.formatCurrency(totalValue.current);
        document.getElementById('totalChange').textContent = 
            `${Helpers.formatCurrency(totalValue.change)} (${totalValue.changePercent}%)`;
        document.getElementById('totalChange').className = 
            `change ${totalValue.change >= 0 ? 'positive' : 'negative'}`;

        // Update daily change
        document.getElementById('dailyChange').textContent = 
            Helpers.formatCurrency(dailyChange.amount);
        document.querySelector('.daily-change .change').textContent = 
            `${dailyChange.percent}%`;
        document.querySelector('.daily-change .change').className = 
            `change ${dailyChange.amount >= 0 ? 'positive' : 'negative'}`;

        // Render allocation chart
        this.renderAllocationChart(allocation);
    }

    renderAllocationChart(allocation) {
        const ctx = document.createElement('canvas');
        document.getElementById('allocationChart').innerHTML = '';
        document.getElementById('allocationChart').appendChild(ctx);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: allocation.map(item => item.name),
                datasets: [{
                    data: allocation.map(item => item.percentage),
                    backgroundColor: [
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderWatchlist() {
        const watchlistContainer = document.getElementById('watchlist');
        
        if (this.watchlistData.length === 0) {
            watchlistContainer.innerHTML = `
                <div class="empty-state">
                    <p>No stocks in watchlist</p>
                    <button class="btn-secondary">Add Stocks</button>
                </div>
            `;
            return;
        }

        watchlistContainer.innerHTML = this.watchlistData.map(stock => `
            <div class="watchlist-item">
                <div class="stock-info">
                    <div>
                        <div class="stock-symbol">${stock.symbol}</div>
                        <div class="stock-name">${stock.name}</div>
                    </div>
                </div>
                <div class="stock-price">
                    <div class="price">${Helpers.formatCurrency(stock.price)}</div>
                    <div class="change ${stock.change >= 0 ? 'positive' : 'negative'}">
                        ${stock.change >= 0 ? '+' : '-'}${stock.changePercent}%
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderNews() {
        const newsContainer = document.getElementById('newsGrid');
        
        newsContainer.innerHTML = this.newsData.map(article => `
            <div class="news-card" onclick="window.open('${article.url}', '_blank')">
                <div class="news-image">
                    ${article.imageUrl ? 
                        `<img src="${article.imageUrl}" alt="${article.title}" style="width:100%;height:100%;object-fit:cover;">` : 
                        '📰'
                    }
                </div>
                <div class="news-content">
                    <div class="news-source">
                        <span class="source-name">${article.source}</span>
                        <span class="news-time">${Helpers.formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <div class="news-title">${article.title}</div>
                    <div class="news-summary">${article.summary}</div>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        // Performance chart will be initialized when data is loaded
        setTimeout(() => {
            this.updatePerformanceChart('1M');
        }, 1000);
    }

    updatePerformanceChart(timeRange) {
        // This would typically fetch new data based on timeRange
        const performanceChart = new Chart(
            document.getElementById('performanceChart'), 
            Charts.createPerformanceChartConfig(timeRange)
        );
    }

    handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length > 2) {
            // Implement search functionality
            console.log('Searching for:', query);
        }
    }

    showError(message) {
        // Implement error notification
        console.error('Error:', message);
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuinDashboard();
});