class AutoRefresh {
    constructor() {
        this.refreshInterval = 300000; // 5 minutes
        this.isRefreshing = false;
        this.init();
    }

    init() {
        // Start auto-refresh
        this.performSync();
        this.startAutoRefresh();
        this.fetchDashboardSummary();
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
            }
        });
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.refreshData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async refreshData() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        
        try {
            // Refresh portfolio data
            if (portfolioManager && typeof portfolioManager.loadPortfolioData === 'function') {
                await portfolioManager.loadPortfolioData();
            }
            
            // Refresh dashboard data
            if (window.dashboard && typeof window.dashboard.refreshData === 'function') {
                await window.dashboard.refreshData();
            }
            
            console.log('Data refreshed at', new Date().toLocaleTimeString());
            
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    async performSync() {
        try {
            const response = await fetch('/api/portfolio/sync', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                console.log('Auto-sync successful:', result.message);
            }
        } catch (error) {
            console.error("Auto-sync failed:", error);
        }
    }

    async fetchDashboardSummary() {
        try {
            const response = await fetch('/api/dashboard/summary');
            if (!response.ok) throw new Error('Failed to fetch dashboard summary');
            const data = await response.json();
            
            this.renderPortfolioStats(data);
        } catch (error) {
            console.error("Error updating dashboard stats:", error);
        }
    }

    renderPortfolioStats(data) {
        const container = document.querySelector('.portfolio-cards');
        if (!data || !container) return;

        const marketValue = data.market_value || 0; // Current market value
        const costBasis = data.asset_value || 0;    // Total amount invested
        const yesterdayValue = data.yesterday_value || marketValue;

        const totalChange = marketValue - costBasis;
        const dailyChange = marketValue - yesterdayValue;
        const dailyPercent = yesterdayValue !== 0 ? (dailyChange / yesterdayValue) * 100 : 0;

        const totalClass = totalChange >= 0 ? 'positive' : 'negative';
        const dailyClass = dailyChange >= 0 ? 'positive' : 'negative';

        container.innerHTML = `
            <div class="portfolio-card total-value">
                <div class="card-header">
                    <h3>Total Value</h3>
                    <span class="card-badge">Live</span>
                </div>
                <div class="card-content">
                    <div class="amount" id="totalValue">$${marketValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div class="change ${totalClass}" id="totalChange">
                        ${totalChange >= 0 ? '+$' : '-$'}${Math.abs(totalChange).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                </div>
            </div>
            
            <div class="portfolio-card daily-change">
                <div class="card-header">
                    <h3>Today's Change</h3>
                </div>
                <div class="card-content">
                    <div class="amount" id="dailyChange">${dailyChange >= 0 ? '$' : '-$'}${Math.abs(dailyChange).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div class="change ${dailyClass}">
                        ${dailyChange >= 0 ? '+' : ''}${dailyPercent.toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <div class="portfolio-card allocation">
                <div class="card-header">
                    <h2>Asset Allocation</h2>
                </div>
                <div class="card-content">
                    <div class="allocation-chart" id="allocationChart">
                        <p style="text-align:center; color:gray; padding-top:20px;">Chart Loading...</p>
                    </div>
                </div>
            </div>
        `;
    }

    setRefreshInterval(interval) {
        this.refreshInterval = interval;
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }
}

// Initialize auto-refresh
window.autoRefresh = new AutoRefresh();