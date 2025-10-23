/**
 * Force all pages to load from top
 * Prevents browser from remembering scroll position
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

    // Force scroll to top when page loads
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

    // Handle page show event (back/forward navigation)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            window.scrollTo(0, 0);
        }
    });

    // Handle hash changes but still scroll to top
    window.addEventListener('hashchange', function() {
        // Allow a brief moment for hash navigation, then scroll to top
        setTimeout(function() {
            if (window.location.hash === '') {
                window.scrollTo(0, 0);
            }
        }, 100);
    });

    console.log('✅ Scroll-to-top loader initialized');
})();
