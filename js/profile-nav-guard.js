/**
 * Profile Navigation Guard
 * Ensures user is authenticated before accessing profile page
 */

(function() {
    'use strict';

    /**
     * Check if user is authenticated
     */
    function isAuthenticated() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            
            // User must have both token and user data
            return !!(token && user);
        } catch (error) {
            return false;
        }
    }

    /**
     * Handle profile link clicks
     */
    function handleProfileClick(event) {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            // Prevent default navigation
            event.preventDefault();
            
            // Save intended destination
            sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
            sessionStorage.setItem('intendedDestination', 'profile');
            
            // Redirect to auth page silently
            window.location.href = 'auth.html';
            
            return false;
        }
        
        // User is authenticated, allow navigation
        return true;
    }

    /**
     * Initialize profile guards on page load
     */
    function initProfileGuards() {
        // Find all profile links
        const profileLinks = document.querySelectorAll('a[href="profile.html"], a.nav-link-auth[href="profile.html"]');
        
        profileLinks.forEach(link => {
            link.addEventListener('click', handleProfileClick);
        });
    }

    /**
     * Check if current page is profile.html and user is not authenticated
     */
    function checkProfilePageAccess() {
        const currentPath = window.location.pathname;
        
        // Check if we're on profile.html
        if (currentPath.includes('profile.html')) {
            if (!isAuthenticated()) {
                // Save that they wanted to access profile
                sessionStorage.setItem('redirectAfterAuth', currentPath);
                sessionStorage.setItem('intendedDestination', 'profile');
                
                // Redirect to auth page
                window.location.href = 'auth.html';
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initProfileGuards();
            checkProfilePageAccess();
        });
    } else {
        initProfileGuards();
        checkProfilePageAccess();
    }

})();
