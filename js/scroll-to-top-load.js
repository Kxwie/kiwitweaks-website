/**
 * Ensure pages always load from top to bottom
 */

(function() {
    'use strict';

    // Force scroll to top on page load/refresh
    function scrollToTop() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    // Disable scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    scrollToTop();

    // Force scroll to top on page load
    window.addEventListener('load', scrollToTop);

    // Force scroll to top before page unload
    window.addEventListener('beforeunload', scrollToTop);

    // Force scroll to top on DOM content loaded
    document.addEventListener('DOMContentLoaded', scrollToTop);

    // Additional safety - force scroll after a short delay
    setTimeout(scrollToTop, 100);

    console.log('✅ Scroll-to-top on load initialized');

})();
