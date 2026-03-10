class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'system';
        this.init();
    }
    
    init() {
        this.applyTheme(this.theme);
        this.setupSystemThemeListener();
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.setThemeVariables(systemTheme);
        } else {
            this.setThemeVariables(theme);
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
        
        // Update active state in settings
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    setThemeVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // Dark theme variables
            root.style.setProperty('--bg-white', '#1e293b');
            root.style.setProperty('--bg-gray', '#0f172a');
            root.style.setProperty('--text-primary', '#f1f5f9');
            root.style.setProperty('--text-secondary', '#cbd5e1');
            root.style.setProperty('--text-muted', '#94a3b8');
            root.style.setProperty('--border-color', '#334155');
            root.style.setProperty('--border-color-light', '#475569');
            root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.3)');
            root.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.4)');
            root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.4)');
        } else {
            // Light theme variables (default)
            root.style.setProperty('--bg-white', '#ffffff');
            root.style.setProperty('--bg-gray', '#f8fafc');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--text-muted', '#94a3b8');
            root.style.setProperty('--border-color', '#e2e8f0');
            root.style.setProperty('--border-color-light', '#f1f5f9');
            root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)');
            root.style.setProperty('--shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1)');
            root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1)');
        }
    }
    
    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === 'system') {
                this.applyTheme('system');
            }
        });
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.applyTheme(theme);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Global function for theme switching
function setTheme(theme) {
    themeManager.setTheme(theme);
}