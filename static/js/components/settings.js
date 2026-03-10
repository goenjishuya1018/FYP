// settings.js
class SettingsManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedSettings();
        this.setupNavigation();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Form inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => this.markAsUnsaved());
        });
    }
    
    setupNavigation() {
        // Check for hash in URL
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.navigateToSection(hash);
        }
    }
    
    navigateToSection(sectionId) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });
        
        // Update active panel
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === sectionId);
        });
        
        // Update URL hash
        window.location.hash = sectionId;
    }
    
    loadSavedSettings() {
        const savedSettings = localStorage.getItem('thetaSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.applySettings(settings);
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
    
    applySettings(settings) {
        // Account settings
        if (settings.account) {
            this.setValue('displayName', settings.account.displayName);
            this.setValue('email', settings.account.email);
            this.setValue('phone', settings.account.phone);
        }
        
        // Notification settings
        if (settings.notifications) {
            this.setChecked('priceAlerts', settings.notifications.priceAlerts);
            this.setChecked('dividendAlerts', settings.notifications.dividendAlerts);
            this.setChecked('weeklySummary', settings.notifications.weeklySummary);
            this.setChecked('marketNews', settings.notifications.marketNews);
            this.setChecked('pushNotifications', settings.notifications.pushNotifications);
            this.setChecked('tradeConfirmations', settings.notifications.tradeConfirmations);
            this.setChecked('accountActivity', settings.notifications.accountActivity);
            this.setValue('quietStart', settings.notifications.quietStart);
            this.setValue('quietEnd', settings.notifications.quietEnd);
            this.setValue('timezone', settings.notifications.timezone);
        }
        
        // Appearance settings
        if (settings.appearance) {
            // Theme is handled by ThemeManager
            this.setChecked('compactMode', settings.appearance.compactMode);
            this.setChecked('animations', settings.appearance.animations);
            this.setValue('fontSize', settings.appearance.fontSize);
            this.setValue('defaultChartPeriod', settings.appearance.defaultChartPeriod);
            this.setChecked('showGridLines', settings.appearance.showGridLines);
            
            // Apply theme
            if (settings.appearance.theme) {
                setTheme(settings.appearance.theme);
            }
        }
        
        // Privacy settings
        if (settings.privacy) {
            this.setChecked('sharePerformance', settings.privacy.sharePerformance);
            this.setChecked('activityStatus', settings.privacy.activityStatus);
        }
        
        // Preferences
        if (settings.preferences) {
            this.setValue('defaultOrderType', settings.preferences.defaultOrderType);
            this.setValue('defaultCurrency', settings.preferences.defaultCurrency);
            this.setChecked('oneClickTrading', settings.preferences.oneClickTrading);
            this.setValue('defaultDashboard', settings.preferences.defaultDashboard);
            this.setChecked('showWelcome', settings.preferences.showWelcome);
            this.setValue('dateFormat', settings.preferences.dateFormat);
            this.setValue('numberFormat', settings.preferences.numberFormat);
        }
    }
    
    setValue(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.value = value;
        }
    }
    
    setChecked(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.checked = value;
        }
    }
    
    markAsUnsaved() {
        // Visual indicator that there are unsaved changes
        const saveButton = document.querySelector('.btn-primary');
        if (saveButton) {
            saveButton.textContent = 'Save Changes *';
            saveButton.style.animation = 'pulse 1s infinite';
        }
    }
    
    saveSettings() {
        const settings = this.collectSettings();
        localStorage.setItem('thetaSettings', JSON.stringify(settings));
        
        // Reset save button
        const saveButton = document.querySelector('.btn-primary');
        if (saveButton) {
            saveButton.textContent = 'Save Changes';
            saveButton.style.animation = '';
        }
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    collectSettings() {
        return {
            account: {
                displayName: document.getElementById('displayName')?.value,
                email: document.getElementById('email')?.value,
                phone: document.getElementById('phone')?.value
            },
            notifications: {
                priceAlerts: document.getElementById('priceAlerts')?.checked,
                dividendAlerts: document.getElementById('dividendAlerts')?.checked,
                weeklySummary: document.getElementById('weeklySummary')?.checked,
                marketNews: document.getElementById('marketNews')?.checked,
                pushNotifications: document.getElementById('pushNotifications')?.checked,
                tradeConfirmations: document.getElementById('tradeConfirmations')?.checked,
                accountActivity: document.getElementById('accountActivity')?.checked,
                quietStart: document.getElementById('quietStart')?.value,
                quietEnd: document.getElementById('quietEnd')?.value,
                timezone: document.getElementById('timezone')?.value
            },
            appearance: {
                theme: document.querySelector('.theme-option.active')?.dataset.theme || 'system',
                compactMode: document.getElementById('compactMode')?.checked,
                animations: document.getElementById('animations')?.checked,
                fontSize: document.getElementById('fontSize')?.value,
                defaultChartPeriod: document.getElementById('defaultChartPeriod')?.value,
                showGridLines: document.getElementById('showGridLines')?.checked
            },
            privacy: {
                sharePerformance: document.getElementById('sharePerformance')?.checked,
                activityStatus: document.getElementById('activityStatus')?.checked
            },
            preferences: {
                defaultOrderType: document.getElementById('defaultOrderType')?.value,
                defaultCurrency: document.getElementById('defaultCurrency')?.value,
                oneClickTrading: document.getElementById('oneClickTrading')?.checked,
                defaultDashboard: document.getElementById('defaultDashboard')?.value,
                showWelcome: document.getElementById('showWelcome')?.checked,
                dateFormat: document.getElementById('dateFormat')?.value,
                numberFormat: document.getElementById('numberFormat')?.value
            }
        };
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Account switching
    openSwitchAccountModal() {
        document.getElementById('switchAccountModal').classList.add('active');
    }
    
    closeSwitchAccountModal() {
        document.getElementById('switchAccountModal').classList.remove('active');
    }
    
    selectAccount(accountId) {
        document.querySelectorAll('.account-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
    }
    
    confirmSwitchAccount() {
        const activeAccount = document.querySelector('.account-item.active .account-name');
        if (activeAccount) {
            this.showNotification(`Switched to ${activeAccount.textContent}`, 'success');
            this.closeSwitchAccountModal();
            
            // Update header with new account info
            const userAvatar = document.querySelector('.user-avatar');
            const userName = document.querySelector('.user-name');
            if (userAvatar && userName && window.parent !== window) {
                const initials = activeAccount.textContent.split(' ').map(n => n[0]).join('');
                userAvatar.textContent = initials;
                userName.textContent = activeAccount.textContent;
            }
        }
    }
    
    addAccount() {
        alert('Add new account functionality would open here');
    }
    
    // Logout
    openLogoutModal() {
        document.getElementById('logoutModal').classList.add('active');
    }
    
    closeLogoutModal() {
        document.getElementById('logoutModal').classList.remove('active');
    }
    
    confirmLogout() {
        // Clear session
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Redirect to login
        if (window.parent === window) {
            window.location.href = 'login.html';
        } else {
            window.parent.postMessage({ type: 'navigate', page: 'login.html' }, '*');
        }
    }
    
    // Security functions
    setup2FA() {
        alert('Two-factor authentication setup would open here');
    }
    
    changePassword() {
        alert('Change password functionality would open here');
    }
    
    viewLoginHistory() {
        alert('Login history would be displayed here');
    }
    
    manageSessions() {
        alert('Active sessions management would open here');
    }
    
    logoutAllDevices() {
        if (confirm('Are you sure you want to logout from all devices?')) {
            alert('Logged out from all other devices');
        }
    }
    
    // Data functions
    exportData() {
        const data = {
            settings: this.collectSettings(),
            exportDate: new Date().toISOString(),
            version: '2.0.1'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `theta-data-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Data export started', 'success');
    }
    
    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion process would start here');
        }
    }
    
    // Subscription functions
    manageSubscription() {
        alert('Subscription management would open here');
    }
    
    updateBilling() {
        alert('Billing information update would open here');
    }
    
    viewBillingHistory() {
        alert('Billing history would be displayed here');
    }
    
    // Linked accounts
    manageLinkedAccounts() {
        alert('Linked accounts management would open here');
    }
    
    // Profile functions
    changeAvatar() {
        alert('Avatar change functionality would open here');
    }
    
    // Help & Support
    openHelpCenter() {
        window.open('https://help.theta-invest.com', '_blank');
    }
    
    contactSupport() {
        alert('Contact support form would open here');
    }
    
    openForums() {
        window.open('https://community.theta-invest.com', '_blank');
    }
    
    sendFeedback() {
        alert('Feedback form would open here');
    }
    
    reportBug() {
        alert('Bug report form would open here');
    }
}

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.settings-wrapper')) {
        window.settingsManager = new SettingsManager();
        
        // Make functions available globally
        window.saveSettings = () => settingsManager.saveSettings();
        window.switchAccount = () => settingsManager.openSwitchAccountModal();
        window.closeSwitchAccountModal = () => settingsManager.closeSwitchAccountModal();
        window.selectAccount = (id) => settingsManager.selectAccount(id);
        window.confirmSwitchAccount = () => settingsManager.confirmSwitchAccount();
        window.addAccount = () => settingsManager.addAccount();
        window.logout = () => settingsManager.openLogoutModal();
        window.closeLogoutModal = () => settingsManager.closeLogoutModal();
        window.confirmLogout = () => settingsManager.confirmLogout();
        window.setup2FA = () => settingsManager.setup2FA();
        window.changePassword = () => settingsManager.changePassword();
        window.viewLoginHistory = () => settingsManager.viewLoginHistory();
        window.manageSessions = () => settingsManager.manageSessions();
        window.logoutAllDevices = () => settingsManager.logoutAllDevices();
        window.exportData = () => settingsManager.exportData();
        window.deleteAccount = () => settingsManager.deleteAccount();
        window.manageSubscription = () => settingsManager.manageSubscription();
        window.updateBilling = () => settingsManager.updateBilling();
        window.viewBillingHistory = () => settingsManager.viewBillingHistory();
        window.manageLinkedAccounts = () => settingsManager.manageLinkedAccounts();
        window.changeAvatar = () => settingsManager.changeAvatar();
        window.openHelpCenter = () => settingsManager.openHelpCenter();
        window.contactSupport = () => settingsManager.contactSupport();
        window.openForums = () => settingsManager.openForums();
        window.sendFeedback = () => settingsManager.sendFeedback();
        window.reportBug = () => settingsManager.reportBug();
    }
});