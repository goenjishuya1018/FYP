// Sample data for suggestions
const sampleSuggestions = [
    "A", "AAPL", "AMZN", "AMD", "ASML", "ASMLF"
    // , "Fig", "Grape", "Honeydew", "Kiwi", "Lemon",
    // "Mango", "Nectarine", "Orange", "Peach", "Quince"
];

const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');

// Function to show suggestions
function showSuggestions() {
    const inputValue = searchInput.value.toLowerCase();
    
    if (inputValue.length === 0) {
        hideSuggestions();
        return;
    }

    // Filter suggestions based on input
    const filteredSuggestions = sampleSuggestions.filter(item =>
        item.toLowerCase().includes(inputValue)
    );

    if (filteredSuggestions.length === 0) {
        hideSuggestions();
        return;
    }

    // Create suggestion items
    const suggestionsHTML = filteredSuggestions.map(item =>
        `<div class="suggestion-item" onclick="selectSuggestion('${item}')">${item}</div>`
    ).join('');

    // Show suggestions box
    suggestionsBox.innerHTML = suggestionsHTML;
    suggestionsBox.style.display = 'block';
}

// Function to hide suggestions
function hideSuggestions() {
    suggestionsBox.style.display = 'none';
}

// Function to select a suggestion
function selectSuggestion(value) {
    searchInput.value = value;
    hideSuggestions();
}

// Event listeners
searchInput.addEventListener('input', showSuggestions);
searchInput.addEventListener('focus', showSuggestions);

// Hide suggestions when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
        hideSuggestions();
    }
});

// Keyboard navigation
searchInput.addEventListener('keydown', function(event) {
    const suggestions = suggestionsBox.getElementsByClassName('suggestion-item');
    const activeSuggestion = suggestionsBox.querySelector('.suggestion-item.active');
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!activeSuggestion) {
            suggestions[0]?.classList.add('active');
        } else {
            const next = activeSuggestion.nextElementSibling;
            if (next) {
                activeSuggestion.classList.remove('active');
                next.classList.add('active');
            }
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (activeSuggestion) {
            const prev = activeSuggestion.previousElementSibling;
            activeSuggestion.classList.remove('active');
            if (prev) {
                prev.classList.add('active');
            }
        }
    } else if (event.key === 'Enter') {
        if (activeSuggestion) {
            selectSuggestion(activeSuggestion.textContent);
            event.preventDefault();
        }
    }
});