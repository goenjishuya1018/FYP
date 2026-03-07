class AutoRefresh {
    constructor() {
        this.refreshInterval = 300000; // 5 minutes
        this.isRefreshing = false;
        this.init();
    }

    init() {
        // Start auto-refresh
        this.startAutoRefresh();
        
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

    setRefreshInterval(interval) {
        this.refreshInterval = interval;
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }
}

// Initialize auto-refresh
window.autoRefresh = new AutoRefresh();