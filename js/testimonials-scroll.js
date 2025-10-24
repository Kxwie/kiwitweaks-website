/**
 * Testimonials Scroll Animations
 * Simple scroll reveal for testimonial items
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initScrollAnimations();
    });

    function initScrollAnimations() {
        const testimonialItems = document.querySelectorAll('.testimonial-item[data-scroll]');
        
        if (!testimonialItems.length) return;

        // Create Intersection Observer
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all testimonial items
        testimonialItems.forEach(function(item) {
            observer.observe(item);
        });
    }
})();
