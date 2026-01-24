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

// Navigation click handler - FIXED VERSION
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
    // You can add search functionality here
    console.log('Searching for:', value);
}

// Event listeners for search
searchInput.addEventListener('input', showSuggestions);
searchInput.addEventListener('focus', showSuggestions);

document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-box')) {
        hideSuggestions();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentFrame = document.getElementById('contentFrame');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // 1. Remove active class from all, add to clicked
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 2. Get the URL from the data-url attribute we added
            const targetUrl = item.getAttribute('data-url');
            
            // 3. Update the iframe source
            contentFrame.src = targetUrl;

            // 4. Update the header title text
            const text = item.querySelector('.nav-text').innerText;
            pageTitle.innerText = text;
        });
    });
});


// Make functions available globally for onclick
window.selectSuggestion = selectSuggestion;

});