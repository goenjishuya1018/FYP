class Charts {
    static createPerformanceChartConfig(timeRange) {
        // Generate mock data based on time range
        const { labels, data } = this.generateChartData(timeRange);
        
        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 14 },
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };
    }

    static generateChartData(timeRange) {
        let labels = [];
        let data = [];
        const baseValue = 100000;
        
        switch (timeRange) {
            case '1D':
                labels = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
                data = this.generateIntradayData(baseValue);
                break;
            case '1W':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                data = this.generateWeeklyData(baseValue);
                break;
            case '1M':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = this.generateMonthlyData(baseValue);
                break;
            case '1Y':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = this.generateYearlyData(baseValue);
                break;
            default:
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                data = this.generateDefaultData(baseValue);
        }
        
        return { labels, data };
    }

    static generateIntradayData(baseValue) {
        return Array.from({ length: 8 }, (_, i) => {
            const volatility = (Math.random() - 0.5) * 200;
            return baseValue + (i * 150) + volatility;
        });
    }

    static generateWeeklyData(baseValue) {
        return [baseValue, baseValue + 500, baseValue + 1200, baseValue + 800, baseValue + 1800];
    }

    static generateMonthlyData(baseValue) {
        return [baseValue, baseValue + 2500, baseValue + 1800, baseValue + 3400];
    }

    static generateYearlyData(baseValue) {
        return Array.from({ length: 12 }, (_, i) => {
            return baseValue + (i * 2000) + (Math.random() * 1000 - 500);
        });
    }
}