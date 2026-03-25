// alerts.js
class AlertsManager {
    constructor() {
        this.alerts = [];
        this.calendar = null;
        this.events = [];
        this.userEvents = [];
        this.checkInterval = null;
        
        this.init();
    }

    async init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        await this.loadAlerts();
        await this.loadCalendarEvents();
        await this.loadUserEvents();
        this.setupAlertChecker();
        this.loadStockSuggestions();
    }

    setupEventListeners() {
        // Calendar filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterCalendarEvents(filter);
                
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Alert filter
        const alertFilter = document.getElementById('alertFilter');
        if (alertFilter) {
            alertFilter.addEventListener('change', () => this.filterAlerts());
        }

        // Quick alert form
        const quickSymbol = document.getElementById('quickSymbol');
        if (quickSymbol) {
            quickSymbol.addEventListener('input', (e) => this.searchStocks(e.target.value, 'quick'));
        }

        // Alert symbol search 
        const alertSymbol = document.getElementById('alertSymbol');
        if (alertSymbol) {
            let searchTimeout;
            alertSymbol.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value;
                if (query.length >= 1) {
                    searchTimeout = setTimeout(() => {
                        this.searchStocks(query, 'alert');
                    }, 300);
                } else {
                    document.getElementById('symbolSearchResults').classList.remove('active');
                }
            });
            
            // Add enter key handler to fetch price directly
            alertSymbol.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const symbol = e.target.value.trim().toUpperCase();
                    if (symbol) {
                        this.fetchAndDisplayPrice(symbol);
                    }
                }
            });
            
            // Add blur handler to hide search results
            alertSymbol.addEventListener('blur', () => {
                setTimeout(() => {
                    document.getElementById('symbolSearchResults').classList.remove('active');
                }, 200);
            });
        }

        // Add click outside to close search results
        document.addEventListener('click', (e) => {
            const searchResults = document.getElementById('symbolSearchResults');
            const alertSymbol = document.getElementById('alertSymbol');
            if (searchResults && alertSymbol && !alertSymbol.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }

    updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    async loadAlerts() {
        try {
            this.alerts = await alertsAPI.getAlerts();
            this.renderAlerts();
            this.updateAlertStats();
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.showError('Failed to load alerts');
        }
    }

    renderAlerts() {
        const container = document.getElementById('alertsList');
        const filter = document.getElementById('alertFilter')?.value || 'all';
        
        let filteredAlerts = this.alerts;
        if (filter !== 'all') {
            filteredAlerts = this.alerts.filter(alert => alert.status === filter);
        }

        if (filteredAlerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="text-align:center;padding:40px;">
                        <div style="font-size:3rem;margin-bottom:16px;">🔔</div>
                        <h3 style="color:var(--text-secondary);margin-bottom:8px;">No Alerts Found</h3>
                        <p style="color:var(--text-muted);margin-bottom:16px;">Create your first price alert to get started</p>
                        <button class="btn-primary" onclick="openCreateAlertModal()">Create Alert</button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredAlerts.map(alert => this.renderAlertItem(alert)).join('');
    }

    renderAlertItem(alert) {
        const statusClass = alert.status;
        const daysLeft = Math.ceil((new Date(alert.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="alert-item ${statusClass}" data-alert-id="${alert.id}">
                <div class="alert-header">
                    <div class="alert-symbol">
                        <span class="symbol-badge">${alert.symbol}</span>
                        <span class="alert-name">${alert.name}</span>
                    </div>
                    <span class="alert-status ${statusClass}">${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span>
                </div>
                <div class="alert-body">
                    <div class="alert-condition">
                        <span class="condition-type">${alert.condition === 'above' ? '↑ Above' : '↓ Below'}</span>
                        <span class="condition-value">$${alert.targetPrice.toFixed(2)}</span>
                    </div>
                    <div class="current-price">
                        Current: <span class="${alert.currentPrice >= alert.targetPrice ? 'positive' : 'negative'}">$${alert.currentPrice.toFixed(2)}</span>
                    </div>
                    ${alert.note ? `<div class="alert-note">📝 ${alert.note}</div>` : ''}
                </div>
                <div class="alert-footer">
                    <div class="alert-time">
                        <span>Created: ${this.formatDate(alert.createdAt)}</span>
                        ${alert.status === 'active' ? `<span> • ${daysLeft > 0 ? daysLeft + ' days left' : 'Expires today'}</span>` : ''}
                        ${alert.triggeredAt ? `<span> • Triggered: ${this.formatDate(alert.triggeredAt)}</span>` : ''}
                    </div>
                    <div class="alert-actions">
                        <button class="edit-btn" onclick="editAlert(${alert.id})">✏️</button>
                        <button class="delete-btn" onclick="deleteAlert(${alert.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateAlertStats() {
        const active = this.alerts.filter(a => a.status === 'active').length;
        const triggered = this.alerts.filter(a => a.status === 'triggered').length;
        const successRate = this.alerts.length > 0 ? Math.round((triggered / this.alerts.length) * 100) : 0;
        
        document.getElementById('activeAlertsCount').textContent = active;
        document.getElementById('triggeredToday').textContent = triggered;
        document.getElementById('successRate').textContent = successRate + '%';
        
        // Find most alerted stock
        const symbolCounts = {};
        this.alerts.forEach(alert => {
            symbolCounts[alert.symbol] = (symbolCounts[alert.symbol] || 0) + 1;
        });
        
        let mostAlerted = 'N/A';
        let maxCount = 0;
        for (const [symbol, count] of Object.entries(symbolCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostAlerted = symbol;
            }
        }
        document.getElementById('mostAlerted').textContent = mostAlerted;
    }

    async loadCalendarEvents() {
        try {
            const events = await alertsAPI.getCalendarEvents();
            const userEvents = await alertsAPI.getUserEvents();
            this.events = [...events, ...userEvents];
            
            this.initializeCalendar();
            this.renderUpcomingEvents();
            document.getElementById('upcomingEventsCount').textContent = this.events.length;
            
            // Count dividends this month
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            const dividendsThisMonth = this.events.filter(event => {
                const eventDate = new Date(event.start);
                return event.type === 'dividend' && 
                       eventDate.getMonth() === thisMonth && 
                       eventDate.getFullYear() === thisYear;
            }).length;
            document.getElementById('dividendsThisMonth').textContent = dividendsThisMonth;
            
        } catch (error) {
            console.error('Error loading calendar events:', error);
        }
    }

    initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            events: this.events,
            eventClick: (info) => this.handleEventClick(info),
            dateClick: (info) => this.handleDateClick(info),
            eventDidMount: (info) => this.customizeEventDisplay(info),
            height: 500,
            themeSystem: 'standard',
            firstDay: 1 // Monday
        });
        
        this.calendar.render();
    }

    customizeEventDisplay(info) {
        // Add tooltip with event details
        const event = info.event;
        const extendedProps = event.extendedProps;
        
        let tooltip = `${event.title}`;
        if (extendedProps.amount) {
            tooltip += `\nAmount: $${extendedProps.amount}`;
        }
        if (extendedProps.symbol) {
            tooltip += `\nSymbol: ${extendedProps.symbol}`;
        }
        
        info.el.setAttribute('title', tooltip);
    }

    handleEventClick(info) {
        const event = info.event;
        const extendedProps = event.extendedProps;
        
        // Show event details in a modal
        const details = `
            <strong>${event.title}</strong><br>
            Date: ${event.start.toLocaleDateString()}<br>
            ${extendedProps.symbol ? `Symbol: ${extendedProps.symbol}<br>` : ''}
            ${extendedProps.amount ? `Amount: $${extendedProps.amount}<br>` : ''}
            ${extendedProps.description ? `Description: ${extendedProps.description}` : ''}
        `;
        
        alert(details); 
    }

    handleDateClick(info) {
        // Open create event modal with selected date
        const date = info.dateStr;
        openCreateEventModal(date);
    }

    filterCalendarEvents(filter) {
        if (!this.calendar) return;
        
        if (filter === 'all') {
            this.calendar.getEvents().forEach(event => event.setProp('display', 'auto'));
        } else {
            this.calendar.getEvents().forEach(event => {
                if (event.extendedProps.type === filter) {
                    event.setProp('display', 'auto');
                } else {
                    event.setProp('display', 'none');
                }
            });
        }
    }

    async loadUserEvents() {
        try {
            this.userEvents = await alertsAPI.getUserEvents();
            this.renderUserEvents();
        } catch (error) {
            console.error('Error loading user events:', error);
        }
    }

    renderUserEvents() {
        const container = document.getElementById('myEventsList');
        
        if (this.userEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="text-align:center;padding:40px;">
                        <div style="font-size:3rem;margin-bottom:16px;">📅</div>
                        <h3 style="color:var(--text-secondary);margin-bottom:8px;">No Planned Events</h3>
                        <p style="color:var(--text-muted);margin-bottom:16px;">Add your first custom event to track important dates</p>
                        <button class="btn-secondary" onclick="openCreateEventModal()">Add Event</button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.userEvents.map(event => `
            <div class="my-event-card">
                <div class="event-header">
                    <span class="event-type ${event.type}">${this.formatEventType(event.type)}</span>
                    <div class="event-actions">
                        <button onclick="editUserEvent(${event.id})">✏️</button>
                        <button onclick="deleteUserEvent(${event.id})">🗑️</button>
                    </div>
                </div>
                <div class="event-title">${event.title}</div>
                <div class="event-dates">
                    ${this.formatEventDates(event)}
                </div>
                ${event.targetPrice ? `
                    <div class="event-price">Target: $${event.targetPrice.toFixed(2)}</div>
                ` : ''}
                ${event.description ? `
                    <div class="event-description">${event.description}</div>
                ` : ''}
                <div class="event-footer">
                    <span>${event.symbol ? event.symbol : 'General'}</span>
                    <span>${this.formatDate(event.start)}</span>
                </div>
            </div>
        `).join('');
    }

    renderUpcomingEvents() {
        const container = document.getElementById('upcomingEventsList');
        const upcoming = this.events
            .filter(event => new Date(event.start) > new Date())
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 6);

        if (upcoming.length === 0) {
            container.innerHTML = '<div class="no-events">No upcoming events</div>';
            return;
        }

        container.innerHTML = upcoming.map(event => {
            const date = new Date(event.start);
            const eventType = event.type || (event.extendedProps?.type || 'custom');
            const symbol = event.symbol || event.extendedProps?.symbol || '';
            
            return `
                <div class="event-card">
                    <div class="event-date">
                        <div class="event-day">${date.getDate()}</div>
                        <div class="event-month">${date.toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div class="event-details">
                        <div class="event-title">${event.title}</div>
                        <div class="event-meta">
                            ${symbol ? `${symbol} • ` : ''}
                            ${event.extendedProps?.amount ? `$${event.extendedProps.amount} • ` : ''}
                            <span class="event-badge ${eventType}">${this.formatEventType(eventType)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatEventType(type) {
        const types = {
            'dividend': 'Dividend',
            'ex-rights': 'Ex-Rights',
            'earnings': 'Earnings',
            'planned-sell': 'Planned Sell',
            'planned-buy': 'Planned Buy',
            'review': 'Review',
            'custom': 'Custom'
        };
        return types[type] || type;
    }

    formatEventDates(event) {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : null;
        
        if (!end || start.toDateString() === end.toDateString()) {
            return start.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } else {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }

    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return 'Today';
        } else if (diff < 48 * 60 * 60 * 1000) {
            return 'Yesterday';
        } else {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    filterAlerts() {
        this.renderAlerts();
    }

    async searchStocks(query, target) {
        if (query.length < 1) return;
        
        try {
            const results = await alertsAPI.searchStocks(query);
            this.displaySearchResults(results, target);
        } catch (error) {
            console.error('Error searching stocks:', error);
        }
    }

    displaySearchResults(results, target) {
        const container = document.getElementById('symbolSearchResults');
        if (!container) return;
        
        if (results.length === 0) {
            container.classList.remove('active');
            return;
        }
        
        container.innerHTML = results.map(stock => `
            <div class="search-result-item" onclick="selectStock('${stock.symbol}', '${stock.name}', ${stock.price})">
                <span class="symbol">${stock.symbol}</span>
                <span class="name">${stock.name}</span>
                <span class="price">$${stock.price.toFixed(2)}</span>
            </div>
        `).join('');
        
        container.classList.add('active');
    }

    async fetchAndDisplayPrice(symbol) {
        try {
            const price = await alertsAPI.getStockPrice(symbol);
            const stockInfo = await alertsAPI.searchStocks(symbol);
            const stock = stockInfo.find(s => s.symbol === symbol) || { name: symbol, price: price };
            
            this.displayCurrentPrice(symbol, stock.name, price);
        } catch (error) {
            console.error('Error fetching price:', error);
        }
    }

    displayCurrentPrice(symbol, name, price) {
        const priceInfo = document.getElementById('currentPriceInfo');
        if (priceInfo) {
            priceInfo.innerHTML = `
                <div class="price-info-row">
                    <span class="price-info-label">Symbol:</span>
                    <span class="price-info-value">${symbol} - ${name}</span>
                </div>
                <div class="price-info-row">
                    <span class="price-info-label">Current Price:</span>
                    <span class="price-info-value">$${price.toFixed(2)}</span>
                </div>
            `;
        }
    }

    async loadStockSuggestions() {
        const suggestions = [
            { symbol: 'AAPL', desc: 'Break above $150', price: 152.34 },
            { symbol: 'MSFT', desc: 'Drop below $370', price: 378.85 },
            { symbol: 'GOOGL', desc: 'Break above $145', price: 142.50 },
            { symbol: 'TSLA', desc: 'Drop below $200', price: 245.33 }
        ];
        
        const container = document.getElementById('suggestedAlerts');
        container.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" onclick="quickSetSuggestion('${s.symbol}', ${s.price})">
                <div class="suggestion-info">
                    <span class="suggestion-symbol">${s.symbol}</span>
                    <span class="suggestion-desc">${s.desc}</span>
                </div>
                <span class="suggestion-price">$${s.price.toFixed(2)}</span>
            </div>
        `).join('');
    }

    async createAlert(alertData) {
        try {
            const newAlert = await alertsAPI.createAlert(alertData);
            this.alerts.push(newAlert);
            this.renderAlerts();
            this.updateAlertStats();
            this.showNotification('Alert created successfully!', 'success');
            closeCreateAlertModal();
        } catch (error) {
            console.error('Error creating alert:', error);
            this.showError('Failed to create alert');
        }
    }

    async deleteAlert(alertId) {
        if (!confirm('Are you sure you want to delete this alert?')) return;
        
        try {
            await alertsAPI.deleteAlert(alertId);
            this.alerts = this.alerts.filter(a => a.id !== alertId);
            this.renderAlerts();
            this.updateAlertStats();
            this.showNotification('Alert deleted', 'info');
        } catch (error) {
            console.error('Error deleting alert:', error);
            this.showError('Failed to delete alert');
        }
    }

    setupAlertChecker() {
        // Check alerts every minute
        this.checkInterval = setInterval(() => this.checkAlerts(), 60000);
    }

    async checkAlerts() {
        const activeAlerts = this.alerts.filter(a => a.status === 'active');
        
        for (const alert of activeAlerts) {
            try {
                const currentPrice = await alertsAPI.getStockPrice(alert.symbol);
                
                let triggered = false;
                if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                    triggered = true;
                } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                    triggered = true;
                }
                
                if (triggered) {
                    this.triggerAlert(alert, currentPrice);
                }
            } catch (error) {
                console.error(`Error checking alert ${alert.id}:`, error);
            }
        }
    }

    triggerAlert(alert, currentPrice) {
        alert.status = 'triggered';
        alert.triggeredAt = new Date();
        
        // Update alert in storage
        alertsAPI.updateAlert(alert.id, alert);
        
        // Show notification
        this.showAlertNotification(alert, currentPrice);
        
        // Re-render alerts
        this.renderAlerts();
        this.updateAlertStats();
    }

    showAlertNotification(alert, currentPrice) {
        const notification = document.getElementById('alertNotification');
        const title = document.getElementById('notificationTitle');
        const body = document.getElementById('notificationBody');
        
        title.textContent = '🔔 Alert Triggered!';
        body.textContent = `${alert.symbol} has ${alert.condition === 'above' ? 'reached' : 'dropped to'} $${currentPrice.toFixed(2)}`;
        
        notification.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 10000);
    }

    showNotification(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    // Modal functions
    openCreateAlertModal() {
        document.getElementById('createAlertModal').classList.add('active');
        document.getElementById('currentPriceInfo').innerHTML = '';
    }

    closeCreateAlertModal() {
        document.getElementById('createAlertModal').classList.remove('active');
        document.getElementById('createAlertForm').reset();
        document.getElementById('currentPriceInfo').innerHTML = '';
    }

    openCreateEventModal(date = null) {
        const modal = document.getElementById('createEventModal');
        if (date) {
            document.getElementById('eventStart').value = date;
        }
        modal.classList.add('active');
    }

    closeCreateEventModal() {
        document.getElementById('createEventModal').classList.remove('active');
        document.getElementById('createEventForm').reset();
    }

    async createCustomEvent() {
        const eventData = {
            title: document.getElementById('eventTitle').value,
            start: document.getElementById('eventStart').value,
            end: document.getElementById('eventEnd').value || document.getElementById('eventStart').value,
            type: document.getElementById('eventType').value,
            symbol: document.getElementById('eventSymbol').value,
            targetPrice: parseFloat(document.getElementById('eventTargetPrice').value) || null,
            description: document.getElementById('eventDescription').value,
            backgroundColor: this.getEventColor(document.getElementById('eventColor').value),
            borderColor: this.getEventColor(document.getElementById('eventColor').value),
            textColor: '#ffffff',
            reminder: document.getElementById('eventReminder').checked
        };

        try {
            const newEvent = await alertsAPI.createUserEvent(eventData);
            this.userEvents.push(newEvent);
            this.renderUserEvents();
            
            // Add to calendar
            this.calendar.addEvent(newEvent);
            
            this.showNotification('Event created successfully!', 'success');
            this.closeCreateEventModal();
        } catch (error) {
            console.error('Error creating event:', error);
            this.showError('Failed to create event');
        }
    }

    getEventColor(color) {
        const colors = {
            'blue': '#6366f1',
            'green': '#10b981',
            'red': '#ef4444',
            'purple': '#8b5cf6',
            'orange': '#f59e0b'
        };
        return colors[color] || colors.blue;
    }

    async deleteUserEvent(eventId) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
            await alertsAPI.deleteUserEvent(eventId);
            this.userEvents = this.userEvents.filter(e => e.id !== eventId);
            this.renderUserEvents();
            
            const event = this.calendar.getEventById(eventId.toString());
            if (event) event.remove();
            
            this.showNotification('Event deleted', 'info');
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showError('Failed to delete event');
        }
    }

    quickSetSuggestion(symbol, price) {
        document.getElementById('quickSymbol').value = symbol;
        document.getElementById('quickPrice').value = price;
    }

    async createQuickAlert() {
        const symbol = document.getElementById('quickSymbol').value.toUpperCase();
        const price = parseFloat(document.getElementById('quickPrice').value);
        const condition = document.querySelector('input[name="quickCondition"]:checked')?.value || 'above';
        
        if (!symbol || !price) {
            alert('Please enter both symbol and price');
            return;
        }

        try {
            const currentPrice = await alertsAPI.getStockPrice(symbol);
            
            const alertData = {
                symbol: symbol,
                name: symbol,
                condition: condition,
                targetPrice: price,
                currentPrice: currentPrice,
                status: 'active',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                notifications: ['email', 'push']
            };

            await this.createAlert(alertData);
            
            // Clear quick form
            document.getElementById('quickSymbol').value = '';
            document.getElementById('quickPrice').value = '';
        } catch (error) {
            console.error('Error creating quick alert:', error);
            this.showError('Failed to create alert');
        }
    }
}

// Initialize alerts manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.alerts-wrapper')) {
        window.alertsManager = new AlertsManager();
        
        // Make functions available globally
        window.openCreateAlertModal = () => alertsManager.openCreateAlertModal();
        window.closeCreateAlertModal = () => alertsManager.closeCreateAlertModal();
        window.openCreateEventModal = (date) => alertsManager.openCreateEventModal(date);
        window.closeCreateEventModal = () => alertsManager.closeCreateEventModal();
        window.createAlert = () => {
            // Collect form data and create alert
            const alertData = {
                symbol: document.getElementById('alertSymbol').value,
                type: document.getElementById('alertType').value,
                condition: document.querySelector('input[name="condition"]:checked')?.value,
                targetPrice: parseFloat(document.getElementById('targetPrice').value),
                expiration: document.getElementById('expiration').value,
                notifications: Array.from(document.querySelectorAll('#createAlertForm input[type="checkbox"]:checked')).map(cb => cb.value),
                note: document.getElementById('alertNote').value
            };
            alertsManager.createAlert(alertData);
        };
        window.createQuickAlert = () => alertsManager.createQuickAlert();
        window.createCustomEvent = () => alertsManager.createCustomEvent();
        window.deleteAlert = (id) => alertsManager.deleteAlert(id);
        window.deleteUserEvent = (id) => alertsManager.deleteUserEvent(id);
        window.editAlert = (id) => {
            // Implement edit functionality
            console.log('Edit alert:', id);
            alert('Edit functionality coming soon!');
        };
        window.editUserEvent = (id) => {
            // Implement edit functionality
            console.log('Edit event:', id);
            alert('Edit functionality coming soon!');
        };
        window.selectStock = (symbol, name, price) => {
            document.getElementById('alertSymbol').value = symbol;
            document.getElementById('symbolSearchResults').classList.remove('active');
            
            // Show current price
            alertsManager.displayCurrentPrice(symbol, name, price);
        };
        window.quickSetSuggestion = (symbol, price) => alertsManager.quickSetSuggestion(symbol, price);
        window.filterAlerts = () => alertsManager.filterAlerts();
        window.refreshAlerts = () => alertsManager.loadAlerts();
        window.closeNotification = () => {
            document.getElementById('alertNotification').style.display = 'none';
        };
    }
});