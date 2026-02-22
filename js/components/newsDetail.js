class NewsManager {
            constructor() {
                this.categories = [
                    { id: 'all', name: 'All News', icon: '📰', pinned: true, pinOrder: 1 },
                    { id: 'markets', name: 'Markets', icon: '📊', pinned: true, pinOrder: 2 },
                    { id: 'technology', name: 'Technology', icon: '💻', pinned: true, pinOrder: 3 },
                    { id: 'economy', name: 'Economy', icon: '🏛️', pinned: false, pinOrder: null },
                    { id: 'central-banking', name: 'Central Banking', icon: '🏦', pinned: false, pinOrder: null },
                    { id: 'commodities', name: 'Commodities', icon: '🛢️', pinned: false, pinOrder: null },
                    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', pinned: false, pinOrder: null },
                    { id: 'earnings', name: 'Earnings', icon: '📈', pinned: false, pinOrder: null },
                    { id: 'ipo', name: 'IPO', icon: '🚀', pinned: false, pinOrder: null },
                    { id: 'esg', name: 'ESG', icon: '🌱', pinned: false, pinOrder: null },
                    { id: 'real-estate', name: 'Real Estate', icon: '🏠', pinned: false, pinOrder: null },
                    { id: 'personal-finance', name: 'Personal Finance', icon: '💰', pinned: false, pinOrder: null }
                ];
                
                this.newsData = {
                    'all': [],
                    'markets': [],
                    'technology': [],
                    'economy': [],
                    'central-banking': [],
                    'commodities': [],
                    'crypto': [],
                    'earnings': [],
                    'ipo': [],
                    'esg': [],
                    'real-estate': [],
                    'personal-finance': []
                };
                
                this.currentPage = 1;
                this.articlesPerPage = 6;
                this.activeCategory = 'all';
                this.searchQuery = '';
                
                this.init();
            }
            
            async init() {
                this.loadUserPreferences();
                this.generateNewsData();
                this.renderPinnedCategories();
                this.renderNewsGrid();
                this.setupEventListeners();
                this.updateBreakingNews();
                this.startAutoRefresh();
            }
            
            loadUserPreferences() {
                // Load pinned categories from localStorage
                const savedPins = localStorage.getItem('theta_news_pins');
                if (savedPins) {
                    try {
                        const pinData = JSON.parse(savedPins);
                        this.categories.forEach(cat => {
                            const pin = pinData.find(p => p.id === cat.id);
                            if (pin) {
                                cat.pinned = pin.pinned;
                                cat.pinOrder = pin.pinOrder;
                            }
                        });
                    } catch (e) {
                        console.error('Error loading pins:', e);
                    }
                }
                
                // Sort pinned categories by order
                this.categories.sort((a, b) => {
                    if (a.pinned && b.pinned) {
                        return (a.pinOrder || 999) - (b.pinOrder || 999);
                    }
                    if (a.pinned) return -1;
                    if (b.pinned) return 1;
                    return 0;
                });
            }
            
            generateNewsData() {
                const now = new Date();
                
                // Markets News
                this.newsData['markets'] = [
                    {
                        id: 'm1',
                        title: 'S&P 500 Hits Record High on Strong Earnings',
                        summary: 'The broad market index climbed above 5,000 for the first time as tech and financial sectors lead the rally.',
                        source: 'Bloomberg',
                        time: new Date(now - 30 * 60000),
                        category: 'Markets',
                        categoryId: 'markets',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'm2',
                        title: 'Dow Jones Surges 300 Points as Fed Signals Rate Cuts',
                        summary: 'Stocks rallied after Federal Reserve Chair Jerome Powell indicated potential rate cuts in the coming months.',
                        source: 'CNBC',
                        time: new Date(now - 2 * 3600000),
                        category: 'Markets',
                        categoryId: 'markets',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'm3',
                        title: 'European Markets Close Higher on Positive Economic Data',
                        summary: 'Stoxx 600 gains 0.8% as investors digest better-than-expected GDP figures from Germany and France.',
                        source: 'Reuters',
                        time: new Date(now - 4 * 3600000),
                        category: 'Markets',
                        categoryId: 'markets',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'm4',
                        title: 'Asian Markets Mixed as China Growth Concerns Persist',
                        summary: 'Hong Kong\'s Hang Seng declined while Japan\'s Nikkei reached 34-year high amid divergent economic policies.',
                        source: 'WSJ',
                        time: new Date(now - 8 * 3600000),
                        category: 'Markets',
                        categoryId: 'markets',
                        image: null,
                        url: '#',
                        sentiment: 'neutral'
                    }
                ];
                
                // Technology News
                this.newsData['technology'] = [
                    {
                        id: 't1',
                        title: 'Apple Unveils New AI Features at WWDC',
                        summary: 'Apple announced major AI updates across iOS, including on-device generative AI features for photos and messages.',
                        source: 'TechCrunch',
                        time: new Date(now - 1 * 3600000),
                        category: 'Technology',
                        categoryId: 'technology',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 't2',
                        title: 'Nvidia Reports Record Q4 Revenue on AI Chip Demand',
                        summary: 'Chipmaker surpasses estimates with $22 billion in quarterly revenue, driven by explosive growth in AI data center sales.',
                        source: 'The Information',
                        time: new Date(now - 5 * 3600000),
                        category: 'Technology',
                        categoryId: 'technology',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 't3',
                        title: 'Microsoft Launches New Copilot Features for Enterprise',
                        summary: 'Microsoft 365 Copilot now includes advanced data analysis and automation tools for business users.',
                        source: 'VentureBeat',
                        time: new Date(now - 7 * 3600000),
                        category: 'Technology',
                        categoryId: 'technology',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // Economy News
                this.newsData['economy'] = [
                    {
                        id: 'e1',
                        title: 'US Inflation Eases to 3.1% in January',
                        summary: 'Consumer price index rises less than expected, reinforcing bets on Fed rate cuts in the first half of the year.',
                        source: 'Bloomberg',
                        time: new Date(now - 3 * 3600000),
                        category: 'Economy',
                        categoryId: 'economy',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'e2',
                        title: 'Job Market Remains Resilient with 353K New Positions',
                        summary: 'Nonfarm payrolls far exceed expectations, demonstrating continued strength in the labor market.',
                        source: 'WSJ',
                        time: new Date(now - 12 * 3600000),
                        category: 'Economy',
                        categoryId: 'economy',
                        image: null,
                        url: '#',
                        sentiment: 'neutral'
                    },
                    {
                        id: 'e3',
                        title: 'Retail Sales Drop 0.8% in January',
                        summary: 'Consumer spending unexpectedly falls as cold weather and reduced gas prices impact sales.',
                        source: 'CNBC',
                        time: new Date(now - 18 * 3600000),
                        category: 'Economy',
                        categoryId: 'economy',
                        image: null,
                        url: '#',
                        sentiment: 'negative'
                    }
                ];
                
                // Central Banking News
                this.newsData['central-banking'] = [
                    {
                        id: 'cb1',
                        title: 'Powell: Fed is "Not Far" from Confidence to Cut Rates',
                        summary: 'Federal Reserve Chair suggests policy makers are gaining confidence that inflation is sustainably moving toward 2%.',
                        source: 'Reuters',
                        time: new Date(now - 2.5 * 3600000),
                        category: 'Central Banking',
                        categoryId: 'central-banking',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'cb2',
                        title: 'ECB Holds Rates Steady, Signals June Cut',
                        summary: 'European Central Bank maintains benchmark rate at 4% as Lagarde hints at policy easing in mid-2024.',
                        source: 'FT',
                        time: new Date(now - 15 * 3600000),
                        category: 'Central Banking',
                        categoryId: 'central-banking',
                        image: null,
                        url: '#',
                        sentiment: 'neutral'
                    }
                ];
                
                // Commodities News
                this.newsData['commodities'] = [
                    {
                        id: 'c1',
                        title: 'Oil Prices Surge 3% on Middle East Tensions',
                        summary: 'Brent crude tops $83 as geopolitical risks escalate and OPEC+ considers extending production cuts.',
                        source: 'Reuters',
                        time: new Date(now - 1.5 * 3600000),
                        category: 'Commodities',
                        categoryId: 'commodities',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'c2',
                        title: 'Gold Nears Record High as Rate Cut Bets Intensify',
                        summary: 'Precious metal approaches $2,100/oz as investors seek safe-haven assets amid currency volatility.',
                        source: 'Kitco',
                        time: new Date(now - 6 * 3600000),
                        category: 'Commodities',
                        categoryId: 'commodities',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // Cryptocurrency News
                this.newsData['crypto'] = [
                    {
                        id: 'cr1',
                        title: 'Bitcoin Tops $50,000 for First Time Since 2021',
                        summary: 'Leading cryptocurrency rallies on spot ETF inflows and anticipation of April halving event.',
                        source: 'CoinDesk',
                        time: new Date(now - 1 * 3600000),
                        category: 'Cryptocurrency',
                        categoryId: 'crypto',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'cr2',
                        title: 'Ethereum ETFs Next? SEC Faces Deadline Decisions',
                        summary: 'Regulator must rule on multiple spot Ethereum ETF applications by May, with industry optimistic.',
                        source: 'The Block',
                        time: new Date(now - 9 * 3600000),
                        category: 'Cryptocurrency',
                        categoryId: 'crypto',
                        image: null,
                        url: '#',
                        sentiment: 'neutral'
                    }
                ];
                
                // Earnings News
                this.newsData['earnings'] = [
                    {
                        id: 'er1',
                        title: 'NVIDIA Earnings Blow Past Estimates on AI Boom',
                        summary: 'Chip giant reports EPS of $5.16 vs $4.64 expected, revenue up 265% year-over-year.',
                        source: 'Bloomberg',
                        time: new Date(now - 8 * 3600000),
                        category: 'Earnings',
                        categoryId: 'earnings',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    },
                    {
                        id: 'er2',
                        title: 'Disney Beats Subscriber Goals, Announces Dividend',
                        summary: 'Streaming profitability improves as company raises guidance and reinstates shareholder payout.',
                        source: 'CNBC',
                        time: new Date(now - 14 * 3600000),
                        category: 'Earnings',
                        categoryId: 'earnings',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // IPO News
                this.newsData['ipo'] = [
                    {
                        id: 'ip1',
                        title: 'Reddit Files for NYSE Listing Under Symbol "RDDT"',
                        summary: 'Social media platform reveals profitability in confidentially filed IPO prospectus.',
                        source: 'WSJ',
                        time: new Date(now - 20 * 3600000),
                        category: 'IPO',
                        categoryId: 'ipo',
                        image: null,
                        url: '#',
                        sentiment: 'neutral'
                    }
                ];
                
                // ESG News
                this.newsData['esg'] = [
                    {
                        id: 'esg1',
                        title: 'BlackRock Launches New Climate Transition Fund',
                        summary: 'Asset manager expands sustainable investing lineup with focus on renewable energy infrastructure.',
                        source: 'FT',
                        time: new Date(now - 24 * 3600000),
                        category: 'ESG',
                        categoryId: 'esg',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // Real Estate News
                this.newsData['real-estate'] = [
                    {
                        id: 're1',
                        title: 'Mortgage Rates Drop to 6.6%, Spurring Refinance Demand',
                        summary: 'Average 30-year fixed rate falls to lowest level since May, boosting homebuyer affordability.',
                        source: 'Realtor.com',
                        time: new Date(now - 5 * 3600000),
                        category: 'Real Estate',
                        categoryId: 'real-estate',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // Personal Finance News
                this.newsData['personal-finance'] = [
                    {
                        id: 'pf1',
                        title: '401(k) Contribution Limits Rise to $23,000 for 2024',
                        summary: 'IRS announces inflation-adjusted increase, allowing workers to save additional $500 pre-tax.',
                        source: 'Investopedia',
                        time: new Date(now - 30 * 3600000),
                        category: 'Personal Finance',
                        categoryId: 'personal-finance',
                        image: null,
                        url: '#',
                        sentiment: 'positive'
                    }
                ];
                
                // Combine all news for "All News" category
                this.newsData['all'] = Object.values(this.newsData).flat();
                
                // Sort by time (most recent first)
                Object.keys(this.newsData).forEach(key => {
                    this.newsData[key].sort((a, b) => b.time - a.time);
                });
            }
            
            renderPinnedCategories() {
                const pinnedContainer = document.getElementById('pinnedCategories');
                if (!pinnedContainer) return;
                
                const pinnedCats = this.categories.filter(cat => cat.pinned);
                
                pinnedContainer.innerHTML = pinnedCats.map(cat => `
                    <button class="pin-item ${this.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                        <span class="pin-icon">${cat.icon}</span>
                        <span class="pin-name">${cat.name}</span>
                        ${cat.id !== 'all' ? '<span class="pin-remove" data-category-id="' + cat.id + '">✕</span>' : ''}
                    </button>
                `).join('');
                
                // Add event listeners to pin items
                pinnedContainer.querySelectorAll('.pin-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        // Don't trigger if clicking on remove button
                        if (e.target.classList.contains('pin-remove')) {
                            e.stopPropagation();
                            const categoryId = e.target.dataset.categoryId;
                            this.unpinCategory(categoryId);
                            return;
                        }
                        
                        const category = item.dataset.category;
                        if (category) {
                            this.activeCategory = category;
                            this.renderPinnedCategories();
                            this.renderNewsGrid();
                        }
                    });
                });
                
                // Add remove button event listeners
                pinnedContainer.querySelectorAll('.pin-remove').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const categoryId = btn.dataset.categoryId;
                        this.unpinCategory(categoryId);
                    });
                });
            }
            
            renderNewsGrid() {
                const gridContainer = document.getElementById('newsGridContainer');
                if (!gridContainer) return;
                
                const categories = this.categories.filter(cat => 
                    cat.pinned || cat.id === this.activeCategory
                );
                
                // If viewing a specific category, show only that
                if (this.activeCategory !== 'all') {
                    const category = this.categories.find(c => c.id === this.activeCategory);
                    if (category) {
                        gridContainer.innerHTML = this.renderCategorySection(category, this.newsData[category.id] || []);
                        return;
                    }
                }
                
                // Show all pinned categories
                const pinnedCats = this.categories.filter(cat => cat.pinned && cat.id !== 'all');
                
                if (pinnedCats.length === 0) {
                    gridContainer.innerHTML = `
                        <div class="empty-news-state">
                            <div class="empty-icon">📰</div>
                            <h3>No Pinned Categories</h3>
                            <p>Pin your favorite categories to see news here</p>
                            <button class="btn-primary" id="openPinManagerBtn">Manage Pins</button>
                        </div>
                    `;
                    
                    const openPinBtn = document.getElementById('openPinManagerBtn');
                    if (openPinBtn) {
                        openPinBtn.addEventListener('click', () => this.openPinManager());
                    }
                    return;
                }
                
                let html = '';
                pinnedCats.forEach(category => {
                    const categoryNews = (this.newsData[category.id] || []).slice(0, 3);
                    html += this.renderCategorySection(category, categoryNews);
                });
                
                gridContainer.innerHTML = html;
                
                // Add event listeners to "View All" buttons
                gridContainer.querySelectorAll('.view-all-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const categoryId = e.target.dataset.categoryId;
                        this.activeCategory = categoryId;
                        this.renderPinnedCategories();
                        this.renderNewsGrid();
                    });
                });
                
                // Add event listeners to news cards
                gridContainer.querySelectorAll('.news-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const articleId = card.dataset.articleId;
                        const categoryId = card.dataset.categoryId;
                        this.openNewsDetail(articleId, categoryId);
                    });
                });
            }
            
            renderCategorySection(category, articles) {
                return `
                    <section class="news-category-section" data-category="${category.id}">
                        <div class="category-header">
                            <div class="category-title">
                                <span class="category-icon">${category.icon}</span>
                                <h2>${category.name}</h2>
                                ${category.pinned ? '<span class="pinned-badge">📌</span>' : ''}
                            </div>
                            <button class="btn-outline view-all-btn" data-category-id="${category.id}">View All</button>
                        </div>
                        
                        <div class="news-grid">
                            ${articles.map(article => this.renderNewsCard(article)).join('')}
                            ${articles.length === 0 ? `
                                <div class="no-articles-message">
                                    <p>No recent articles in this category</p>
                                </div>
                            ` : ''}
                        </div>
                    </section>
                `;
            }
            
            renderNewsCard(article) {
                const timeAgo = this.timeAgo(article.time);
                const sentimentClass = article.sentiment || 'neutral';
                
                return `
                    <div class="news-card" data-article-id="${article.id}" data-category-id="${article.categoryId}">
                        <div class="news-image">
                            ${article.image ? `<img src="${article.image}" alt="${article.title}">` : `
                                <div class="placeholder-image">
                                    ${this.getCategoryIcon(article.categoryId)}
                                </div>
                            `}
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-source">${article.source}</span>
                                <span class="news-time">${timeAgo}</span>
                                <span class="sentiment-badge ${sentimentClass}">${sentimentClass}</span>
                            </div>
                            <h3 class="news-title">${article.title}</h3>
                            <p class="news-summary">${article.summary}</p>
                        </div>
                    </div>
                `;
            }
            
            getCategoryIcon(categoryId) {
                const icons = {
                    'markets': '📊',
                    'technology': '💻',
                    'economy': '🏛️',
                    'central-banking': '🏦',
                    'commodities': '🛢️',
                    'crypto': '₿',
                    'earnings': '📈',
                    'ipo': '🚀',
                    'esg': '🌱',
                    'real-estate': '🏠',
                    'personal-finance': '💰'
                };
                return icons[categoryId] || '📰';
            }
            
            // Enhanced pin management with modal like portfolio.html
            openPinManager() {
                const modal = document.getElementById('pinManagementModal');
                const listContainer = document.getElementById('pinManagementList');
                
                if (!modal || !listContainer) return;
                
                const allCategories = this.categories.filter(cat => cat.id !== 'all');
                
                listContainer.innerHTML = allCategories.map(cat => `
                    <div class="pin-management-item" data-category-id="${cat.id}">
                        <div class="pin-item-info">
                            <span class="drag-handle">⋮⋮</span>
                            <span class="pin-icon">${cat.icon}</span>
                            <span class="pin-name">${cat.name}</span>
                        </div>
                        <button class="pin-toggle-btn ${cat.pinned ? 'pinned' : ''}" data-category-id="${cat.id}">
                            📌 ${cat.pinned ? 'Pinned' : 'Pin'}
                        </button>
                    </div>
                `).join('');
                
                modal.classList.add('active');
                modal.style.display = 'flex';
                
                // Add event listeners to toggle buttons
                listContainer.querySelectorAll('.pin-toggle-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const categoryId = btn.dataset.categoryId;
                        this.togglePinCategory(categoryId);
                        
                        // Update button text and class
                        const category = this.categories.find(c => c.id === categoryId);
                        if (category) {
                            btn.textContent = category.pinned ? '📌 Pinned' : '📌 Pin';
                            btn.classList.toggle('pinned', category.pinned);
                        }
                    });
                });
                
                // Add drag and drop functionality
                this.enableDragAndDrop();
            }
            
            enableDragAndDrop() {
                const listContainer = document.getElementById('pinManagementList');
                const items = listContainer.querySelectorAll('.pin-management-item');
                
                items.forEach(item => {
                    const dragHandle = item.querySelector('.drag-handle');
                    
                    dragHandle.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        this.startDragging(item, e.clientY);
                    });
                });
            }
            
            startDragging(item, startY) {
                const listContainer = document.getElementById('pinManagementList');
                const items = Array.from(listContainer.children);
                const itemHeight = item.offsetHeight;
                const startIndex = items.indexOf(item);
                
                const onMouseMove = (e) => {
                    const deltaY = e.clientY - startY;
                    const moveIndex = Math.round(deltaY / itemHeight);
                    const newIndex = Math.max(0, Math.min(items.length - 1, startIndex + moveIndex));
                    
                    if (newIndex !== startIndex) {
                        this.reorderItems(listContainer, startIndex, newIndex);
                    }
                };
                
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    
                    // Save new order
                    this.savePinOrder();
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
            
            reorderItems(container, fromIndex, toIndex) {
                const items = Array.from(container.children);
                const item = items[fromIndex];
                
                if (fromIndex < toIndex) {
                    container.insertBefore(item, items[toIndex].nextSibling);
                } else {
                    container.insertBefore(item, items[toIndex]);
                }
            }
            
            savePinOrder() {
                const listContainer = document.getElementById('pinManagementList');
                const items = listContainer.querySelectorAll('.pin-management-item');
                
                items.forEach((item, index) => {
                    const categoryId = item.dataset.categoryId;
                    const category = this.categories.find(c => c.id === categoryId);
                    if (category && category.pinned) {
                        category.pinOrder = index + 1;
                    }
                });
                
                this.savePins();
            }
            
            togglePinCategory(categoryId) {
                const category = this.categories.find(c => c.id === categoryId);
                if (category) {
                    category.pinned = !category.pinned;
                    if (category.pinned) {
                        // Assign next available pin order
                        const maxOrder = Math.max(...this.categories.filter(c => c.pinOrder).map(c => c.pinOrder), 0);
                        category.pinOrder = maxOrder + 1;
                    } else {
                        category.pinOrder = null;
                    }
                    
                    this.savePins();
                    this.renderPinnedCategories();
                    this.renderNewsGrid();
                }
            }
            
            unpinCategory(categoryId) {
                const category = this.categories.find(c => c.id === categoryId);
                if (category && category.id !== 'all') {
                    category.pinned = false;
                    category.pinOrder = null;
                    this.savePins();
                    this.renderPinnedCategories();
                    this.renderNewsGrid();
                }
            }
            
            savePins() {
                const pinData = this.categories
                    .filter(cat => cat.pinned)
                    .map(cat => ({
                        id: cat.id,
                        pinned: true,
                        pinOrder: cat.pinOrder
                    }));
                
                localStorage.setItem('theta_news_pins', JSON.stringify(pinData));
            }
            
            closePinManager() {
                const modal = document.getElementById('pinManagementModal');
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            
            openNewsDetail(articleId, categoryId) {
                const articles = this.newsData[categoryId] || [];
                const article = articles.find(a => a.id === articleId);
                
                if (!article) return;
                
                const modal = document.getElementById('newsDetailModal');
                const title = document.getElementById('newsDetailTitle');
                const source = document.getElementById('newsDetailSource');
                const time = document.getElementById('newsDetailTime');
                const category = document.getElementById('newsDetailCategory');
                const summary = document.getElementById('newsDetailSummary');
                
                title.textContent = article.title;
                source.textContent = article.source;
                time.textContent = this.timeAgo(article.time);
                category.textContent = article.category;
                category.className = `news-detail-category ${article.categoryId}`;
                summary.textContent = article.summary;
                
                modal.classList.add('active');
                modal.style.display = 'flex';
            }
            
            closeNewsDetail() {
                const modal = document.getElementById('newsDetailModal');
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            
            timeAgo(date) {
                const seconds = Math.floor((new Date() - date) / 1000);
                
                let interval = seconds / 31536000;
                if (interval > 1) return Math.floor(interval) + ' years ago';
                
                interval = seconds / 2592000;
                if (interval > 1) return Math.floor(interval) + ' months ago';
                
                interval = seconds / 86400;
                if (interval > 1) return Math.floor(interval) + ' days ago';
                
                interval = seconds / 3600;
                if (interval > 1) return Math.floor(interval) + ' hours ago';
                
                interval = seconds / 60;
                if (interval > 1) return Math.floor(interval) + ' minutes ago';
                
                return Math.floor(seconds) + ' seconds ago';
            }
            
            updateBreakingNews() {
                const ticker = document.getElementById('breakingNewsTicker');
                if (!ticker) return;
                
                const breakingItems = [
                    'Federal Reserve signals potential rate cuts in Q2',
                    'Tech stocks rally on AI optimism, NVIDIA hits all-time high',
                    'Oil prices surge 3% amid Middle East tensions, supply concerns',
                    'Bitcoin tops $50,000 for first time since 2021',
                    'Apple unveils major AI features at WWDC keynote'
                ];
                
                let index = 0;
                setInterval(() => {
                    ticker.style.opacity = '0';
                    setTimeout(() => {
                        ticker.textContent = breakingItems[index % breakingItems.length];
                        ticker.style.opacity = '1';
                        index++;
                    }, 300);
                }, 5000);
            }
            
            startAutoRefresh() {
                // Refresh news data every 5 minutes
                setInterval(() => {
                    this.generateNewsData();
                    this.renderNewsGrid();
                }, 300000);
            }
            
            setupEventListeners() {
                // Manage pins button
                const managePinsBtn = document.getElementById('managePinsBtn');
                if (managePinsBtn) {
                    managePinsBtn.addEventListener('click', () => this.openPinManager());
                }
                
                // Pin modal close buttons
                const closePinModal = document.getElementById('closePinModal');
                const cancelPinModal = document.getElementById('cancelPinModal');
                const savePinsBtn = document.getElementById('savePinsBtn');
                
                if (closePinModal) {
                    closePinModal.addEventListener('click', () => this.closePinManager());
                }
                
                if (cancelPinModal) {
                    cancelPinModal.addEventListener('click', () => {
                        // Reload original pins
                        this.loadUserPreferences();
                        this.renderPinnedCategories();
                        this.closePinManager();
                    });
                }
                
                if (savePinsBtn) {
                    savePinsBtn.addEventListener('click', () => {
                        this.savePins();
                        this.renderPinnedCategories();
                        this.renderNewsGrid();
                        this.closePinManager();
                    });
                }
                
                // News detail modal close buttons
                const closeNewsModal = document.getElementById('closeNewsModal');
                const closeNewsDetailBtn = document.getElementById('closeNewsDetailBtn');
                const readFullArticleBtn = document.getElementById('readFullArticleBtn');
                
                if (closeNewsModal) {
                    closeNewsModal.addEventListener('click', () => this.closeNewsDetail());
                }
                
                if (closeNewsDetailBtn) {
                    closeNewsDetailBtn.addEventListener('click', () => this.closeNewsDetail());
                }
                
                if (readFullArticleBtn) {
                    readFullArticleBtn.addEventListener('click', () => {
                        alert('Full article would open in a new tab');
                    });
                }
                
                // Load more button
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) {
                    loadMoreBtn.addEventListener('click', () => {
                        loadMoreBtn.textContent = 'Loading...';
                        loadMoreBtn.disabled = true;
                        
                        setTimeout(() => {
                            loadMoreBtn.textContent = 'Load More Articles';
                            loadMoreBtn.disabled = false;
                            alert('More articles would be loaded here');
                        }, 1000);
                    });
                }
                
                // News search
                const searchInput = document.getElementById('newsSearchInput');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        this.searchQuery = e.target.value.toLowerCase();
                        this.renderNewsGrid();
                    });
                }
                
                // Close modal when clicking outside
                window.addEventListener('click', (e) => {
                    const pinModal = document.getElementById('pinManagementModal');
                    const newsModal = document.getElementById('newsDetailModal');
                    
                    if (e.target === pinModal) {
                        this.closePinManager();
                    }
                    
                    if (e.target === newsModal) {
                        this.closeNewsDetail();
                    }
                });
            }
        }

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            // Set current date
            const currentDate = new Date();
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateElement = document.getElementById('currentDate');
            if (dateElement) {
                dateElement.textContent = currentDate.toLocaleDateString('en-US', dateOptions);
            }
            
            // Initialize News Manager
            window.newsManager = new NewsManager();
        });