document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentFrame = document.getElementById('contentFrame');
    const pageTitle = document.getElementById('pageTitle');
    const currentDate = document.getElementById('currentDate');

    // Set initial date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);

    // Navigation click handler
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            const pageName = this.querySelector('.nav-text').textContent;
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            pageTitle.textContent = pageName;
            
            // Load content in iframe
            contentFrame.src = page;
        });
    });

    // Initialize iframe styles
    const style = document.createElement('style');
    style.textContent = `
        .iframe-container {
            flex: 1;
            overflow: hidden;
        }
        
        #contentFrame {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-left: 280px;
            height: 100vh;
        }
        
        @media (max-width: 1024px) {
            .main-content {
                margin-left: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Load suggestions box functionality
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const sampleSuggestions = ["AAPL", "AMZN", "AMD", "ASML", "GOOGL", "MSFT", "TSLA", "NVDA", "NKE"];

    function showSuggestions() {
        const inputValue = searchInput.value.toLowerCase();
        
        if (inputValue.length === 0) {
            hideSuggestions();
            return;
        }
        
        const filteredSuggestions = sampleSuggestions.filter(item =>
            item.toLowerCase().includes(inputValue)
        );
        
        if (filteredSuggestions.length === 0) {
            hideSuggestions();
            return;
        }
        
        const suggestionsHTML = filteredSuggestions.map(item =>
            `<div class="suggestion-item" onclick="selectSuggestion('${item}')">${item}</div>`
        ).join('');
        
        suggestionsBox.innerHTML = suggestionsHTML;
        suggestionsBox.style.display = 'block';
    }

    function hideSuggestions() {
        suggestionsBox.style.display = 'none';
    }

    function selectSuggestion(value) {
        searchInput.value = value;
        hideSuggestions();
        console.log('Searching for:', value);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', function(event) {
            // Check for Enter key
            if (event.key === 'Enter') {
                const symbol = searchInput.value.trim().toUpperCase();
                
                if (symbol) {
                    console.log('Searching for symbol:', symbol);
                    
                    // Use contentFrame (which you already defined at the top of this file)
                    // This loads the stock page inside your main iframe
                    contentFrame.src = `/stock/${symbol}`;
                    
                    // Update the page title manually since we are bypassing the sidebar clicks
                    const pageTitle = document.getElementById('pageTitle');
                    if (pageTitle) pageTitle.textContent = `Stock: ${symbol}`;
                    
                    // Clear search and hide suggestions
                    searchInput.value = '';
                    hideSuggestions();
                }
            }
        });
    }

    // Event listeners for search
    searchInput.addEventListener('input', showSuggestions);
    searchInput.addEventListener('focus', showSuggestions);

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-box')) {
            hideSuggestions();
        }
    });

    window.selectSuggestion = selectSuggestion;
    // Close mobile sidebar when navigating
    window.addEventListener('message', function(event) {
        if (event.data.type === 'navigate') {
            // Close mobile sidebar on navigation
            closeMobileSidebar();
        }
    });
});