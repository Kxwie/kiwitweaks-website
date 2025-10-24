(function() {
    'use strict';

    // Ensure page starts at top on load
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function() {
            window.scrollTo(0, 0);
        };
    }

    // Initialize when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Force scroll to top on initial load
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Remove preload class to enable transitions
        document.body.classList.remove('preload');

        // Initialize scroll-to-top button if it exists
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            // Show/hide scroll to top button based on scroll position
            var scrollHandler = function() {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            };

            // Initial check
            scrollHandler();

            // Add scroll event listener
            window.addEventListener('scroll', scrollHandler, { passive: true });

            // Smooth scroll to top when button is clicked
            scrollToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Handle smooth scrolling for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId !== '#' && !this.classList.contains('no-smooth-scroll')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        // Close mobile menu if open
                        const mobileMenu = document.querySelector('.mobile-menu-toggle');
                        if (mobileMenu && mobileMenu.classList.contains('active')) {
                            mobileMenu.click();
                        }
                        
                        // Calculate offset for fixed header
                        const header = document.querySelector('.header');
                        const headerOffset = header ? header.offsetHeight : 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Extra 20px padding
                        
                        // Smooth scroll to target with offset
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Update URL without adding to history
                        if (history.pushState) {
                            history.pushState(null, null, targetId);
                        } else {
                            window.location.hash = targetId;
                        }
                    }
                }
            });
        });
    });
})();
