// Authentication functions for PEAK website

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('peak_current_user') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('peak_current_user'));
}

// Update auth UI elements
function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const authElements = document.querySelectorAll('.auth-state');
    
    if (isLoggedIn()) {
        // User is logged in
        const user = getCurrentUser();
        
        // Update auth link
        if (authLink) {
            authLink.textContent = 'My Account';
        }
        
        // Update auth state elements
        authElements.forEach(el => {
            if (el.classList.contains('logged-in')) {
                el.style.display = 'block';
            } else if (el.classList.contains('logged-out')) {
                el.style.display = 'none';
            }
        });
        
        // Update user profile elements
        const userProfileElements = document.querySelectorAll('.user-profile-name');
        userProfileElements.forEach(el => {
            el.textContent = user.name;
        });
    } else {
        // User is logged out
        // Update auth link
        if (authLink) {
            authLink.textContent = 'Sign In';
        }
        
        // Update auth state elements
        authElements.forEach(el => {
            if (el.classList.contains('logged-out')) {
                el.style.display = 'block';
            } else if (el.classList.contains('logged-in')) {
                el.style.display = 'none';
            }
        });
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Add logout functionality to logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});

// Logout function
function logout() {
    localStorage.removeItem('peak_current_user');
    updateAuthUI();
    
    // Redirect to home page if on auth page
    if (window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }
}