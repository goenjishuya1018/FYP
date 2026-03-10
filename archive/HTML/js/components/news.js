class NewsManager {
    constructor() {
        this.news = [];
        this.currentPage = 1;
        this.newsPerPage = 6;
    }

    async loadNews(category = 'general') {
        try {
            this.showLoading();
            
            // In a real app, this would be an API call
            this.news = await this.fetchNewsFromAPI(category);
            this.renderNews();
            
        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('Failed to load news');
        }
    }

    async fetchNewsFromAPI(category) {
        // Mock API response - replace with actual news API
        return [
            {
                id: 1,
                title: 'Federal Reserve Holds Interest Rates Steady Amid Economic Uncertainty',
                summary: 'The Federal Reserve maintained interest rates at current levels while signaling potential adjustments in the coming months based on inflation data.',
                source: 'Financial Times',
                author: 'Sarah Chen',
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'economics',
                readTime: '3 min read'
            },
            {
                id: 2,
                title: 'Tech Giants Report Strong Q4 Earnings, Exceeding Analyst Expectations',
                summary: 'Major technology companies including Apple, Microsoft, and Google reported better-than-expected quarterly results, driving market optimism.',
                source: 'Bloomberg',
                author: 'Michael Rodriguez',
                publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'earnings',
                readTime: '4 min read'
            },
            {
                id: 3,
                title: 'Cryptocurrency Market Shows Signs of Recovery After Regulatory Clarity',
                summary: 'Digital asset prices rallied as regulatory frameworks become clearer, with Bitcoin surpassing key resistance levels.',
                source: 'CoinDesk',
                author: 'Jessica Wong',
                publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'crypto',
                readTime: '2 min read'
            },
            {
                id: 4,
                title: 'Electric Vehicle Stocks Charge Ahead on New Government Incentives',
                summary: 'Shares of electric vehicle manufacturers surged following announcements of expanded tax credits and infrastructure funding.',
                source: 'Reuters',
                author: 'David Kim',
                publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'automotive',
                readTime: '3 min read'
            },
            {
                id: 5,
                title: 'Global Markets React to Geopolitical Tensions and Trade Developments',
                summary: 'International stock markets showed mixed performance as investors weigh geopolitical risks against positive trade agreement progress.',
                source: 'Wall Street Journal',
                author: 'Emily Thompson',
                publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'markets',
                readTime: '5 min read'
            },
            {
                id: 6,
                title: 'Renewable Energy Sector Attracts Record Investment in 2024',
                summary: 'Sustainable energy companies secured unprecedented funding rounds, signaling strong investor confidence in green technology.',
                source: 'GreenTech Media',
                author: 'Robert Green',
                publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                url: '#',
                imageUrl: null,
                category: 'energy',
                readTime: '4 min read'
            }
        ];
    }

    renderNews() {
        const newsContainer = document.getElementById('newsGrid');
        
        if (!this.news || this.news.length === 0) {
            newsContainer.innerHTML = this.getEmptyState();
            return;
        }

        const newsToShow = this.news.slice(0, this.newsPerPage);
        
        newsContainer.innerHTML = newsToShow.map(article => `
            <div class="news-card" onclick="newsManager.openArticle(${article.id})">
                <div class="news-image">
                    ${this.getArticleImage(article)}
                </div>
                <div class="news-content">
                    <div class="news-source">
                        <span class="source-name">${article.source}</span>
                        <span class="news-time">${Helpers.formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <div class="news-category">${article.category}</div>
                    <div class="news-title">${article.title}</div>
                    <div class="news-summary">${article.summary}</div>
                    <div class="news-meta">
                        <span class="news-author">By ${article.author}</span>
                        <span class="news-read-time">${article.readTime}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add CSS for new elements
        this.injectNewsStyles();
    }

    getArticleImage(article) {
        if (article.imageUrl) {
            return `<img src="${article.imageUrl}" alt="${article.title}" style="width:100%;height:100%;object-fit:cover;">`;
        }
        
        // Generate placeholder based on category
        const placeholders = {
            economics: '📊',
            earnings: '💹',
            crypto: '₿',
            automotive: '🚗',
            markets: '🌍',
            energy: '⚡'
        };
        
        const emoji = placeholders[article.category] || '📰';
        return `<div style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,#667eea,#764ba2);color:white;width:100%;height:100%;">${emoji}</div>`;
    }

    getEmptyState() {
        return `
            <div class="empty-news-state">
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:3rem;margin-bottom:16px;">📰</div>
                    <h3 style="color:var(--text-secondary);margin-bottom:8px;">No News Available</h3>
                    <p style="color:var(--text-muted);margin-bottom:16px;">Check back later for the latest market updates</p>
                    <button class="btn-secondary" onclick="newsManager.loadNews()">Refresh News</button>
                </div>
            </div>
        `;
    }

    openArticle(articleId) {
        const article = this.news.find(a => a.id === articleId);
        if (article) {
            // In a real app, this would open a detailed view or external link
            console.log('Opening article:', article.title);
            // window.open(article.url, '_blank');
            
            // For demo, show a modal or alert
            this.showArticleModal(article);
        }
    }

    showArticleModal(article) {
        // Simple modal implementation
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
            <div style="background:white;border-radius:12px;padding:24px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 style="margin:0;">${article.title}</h2>
                    <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>
                </div>
                <div style="color:var(--text-secondary);margin-bottom:16px;">
                    <strong>${article.source}</strong> • ${Helpers.formatTimeAgo(article.publishedAt)} • ${article.readTime}
                </div>
                <div style="margin-bottom:16px;">
                    <strong>By ${article.author}</strong>
                </div>
                <div style="line-height:1.6;">
                    <p>${article.summary}</p>
                    <p>This is a demo article. In a real application, this would contain the full article content fetched from a news API.</p>
                </div>
                <div style="margin-top:24px;text-align:center;">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        modal.classList.add('modal');
        document.body.appendChild(modal);
    }

    filterNewsByCategory(category) {
        if (category === 'all') {
            this.renderNews();
        } else {
            const filteredNews = this.news.filter(article => article.category === category);
            // Re-render with filtered news
            const tempNews = this.news;
            this.news = filteredNews;
            this.renderNews();
            this.news = tempNews; // Restore original data
        }
    }

    showLoading() {
        const newsContainer = document.getElementById('newsGrid');
        newsContainer.innerHTML = `
            <div class="news-loading">
                ${Array.from({length: 6}, () => `
                    <div class="news-card-skeleton">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line medium"></div>
                            <div class="skeleton-line long"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showError(message) {
        const newsContainer = document.getElementById('newsGrid');
        newsContainer.innerHTML = `
            <div class="news-error">
                <div style="text-align:center;padding:40px;">
                    <div style="font-size:3rem;margin-bottom:16px;">❌</div>
                    <h3 style="color:var(--danger-color);margin-bottom:8px;">Error Loading News</h3>
                    <p style="color:var(--text-muted);margin-bottom:16px;">${message}</p>
                    <button class="btn-secondary" onclick="newsManager.loadNews()">Try Again</button>
                </div>
            </div>
        `;
    }

    injectNewsStyles() {
        if (!document.getElementById('news-styles')) {
            const style = document.createElement('style');
            style.id = 'news-styles';
            style.textContent = `
                .news-category {
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary-color);
                    margin-bottom: 8px;
                }

                .news-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .news-card-skeleton {
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    overflow: hidden;
                }

                .skeleton-image {
                    width: 100%;
                    height: 160px;
                    background: var(--bg-gray);
                }

                .skeleton-content {
                    padding: 16px;
                }

                .skeleton-line {
                    background: var(--bg-gray);
                    height: 12px;
                    margin-bottom: 8px;
                    border-radius: 4px;
                }

                .skeleton-line.short { width: 40%; }
                .skeleton-line.medium { width: 70%; }
                .skeleton-line.long { width: 100%; }

                .news-loading {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize news manager
const newsManager = new NewsManager();