/**
 * Force all pages to load from top
 * Ensures consistent user experience across all page loads
 */

(function() {
    'use strict';

    // Force scroll to top immediately when page starts loading
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Scroll to top before page unloads
    window.addEventListener('beforeunload', function() {
        window.scrollTo(0, 0);
    });

    // Force scroll to top on page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 0);
    });

    // Force scroll to top on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        window.scrollTo(0, 0);
    });

    // Immediate scroll to top
    window.scrollTo(0, 0);

    // Handle browser back/forward navigation
    window.addEventListener('popstate', function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 0);
    });

    // Handle page refresh
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            window.scrollTo(0, 0);
        }
    });

})();
