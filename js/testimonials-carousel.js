/**
 * Testimonials Carousel
 * Professional carousel with smooth horizontal animations
 */

(function() {
    'use strict';

    let currentSlide = 0;
    let totalSlides = 0;
    let autoplayInterval = null;
    let track = null;
    let slides = null;
    let prevBtn = null;
    let nextBtn = null;
    let dotsContainer = null;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initCarousel();
    });

    function initCarousel() {
        track = document.querySelector('.testimonials-track');
        slides = document.querySelectorAll('.testimonial-slide');
        prevBtn = document.querySelector('.carousel-arrow.prev');
        nextBtn = document.querySelector('.carousel-arrow.next');
        dotsContainer = document.querySelector('.carousel-dots-container');

        if (!track || !slides.length) return;

        totalSlides = slides.length;

        // Create dots navigation
        createDots();

        // Add event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);

        // Touch/swipe support
        initTouchSupport();

        // Start autoplay
        startAutoplay();

        // Pause autoplay on hover
        const carouselWrapper = document.querySelector('.testimonials-carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', stopAutoplay);
            carouselWrapper.addEventListener('mouseleave', startAutoplay);
        }

        // Initial update
        updateCarousel();
    }

    function createDots() {
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            if (i === currentSlide) {
                dot.classList.add('active');
            }

            dot.addEventListener('click', function() {
                goToSlide(i);
            });

            dotsContainer.appendChild(dot);
        }
    }

    function updateCarousel() {
        // Move track
        const offset = -currentSlide * 100;
        track.style.transform = `translateX(${offset}%)`;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update arrow states
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSlide === totalSlides - 1;
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateCarousel();
            resetAutoplay();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
            resetAutoplay();
        }
    }

    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlide = index;
            updateCarousel();
            resetAutoplay();
        }
    }

    function handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    }

    function initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left - go to next
                    nextSlide();
                } else {
                    // Swiped right - go to prev
                    prevSlide();
                }
            }
        }
    }

    function startAutoplay() {
        stopAutoplay(); // Clear any existing interval
        
        autoplayInterval = setInterval(function() {
            if (currentSlide < totalSlides - 1) {
                nextSlide();
            } else {
                // Loop back to start
                currentSlide = 0;
                updateCarousel();
            }
        }, 5000); // Change slide every 5 seconds
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Export functions for external use
    window.testimonialsCarousel = {
        next: nextSlide,
        prev: prevSlide,
        goTo: goToSlide,
        stop: stopAutoplay,
        start: startAutoplay
    };
})();
