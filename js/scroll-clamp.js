/**
 * Scroll Clamp - Prevents scrolling past footer
 * This is a failsafe in case CSS alone doesn't prevent overflow
 */

(function() {
    'use strict';

    let isScrolling;

    function clampScroll() {
        // Get the maximum scroll position (document height minus viewport height)
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        // Get current scroll position
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // If user scrolled past the maximum (beyond footer), clamp it
        if (currentScroll > maxScroll) {
            window.scrollTo({
                top: maxScroll,
                behavior: 'instant'
            });
            console.log('[Scroll Clamp] Prevented scroll past footer');
        }
    }

    // Debounced scroll handler for better performance
    function handleScroll() {
        // Clear our timeout throughout the scroll
        window.clearTimeout(isScrolling);

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {
            clampScroll();
        }, 50);
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also check on resize (viewport size changes)
    window.addEventListener('resize', clampScroll, { passive: true });

    // Check once on load
    window.addEventListener('load', clampScroll);

    console.log('[Scroll Clamp] Initialized scroll position limiter');

})();
