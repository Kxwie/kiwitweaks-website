class TestimonialCarousel {
    constructor() {
        this.track = document.querySelector('.testimonials-track');
        this.cards = Array.from(document.querySelectorAll('.testimonial-card'));
        this.prevBtn = document.querySelector('.carousel-btn.prev');
        this.nextBtn = document.querySelector('.carousel-btn.next');
        this.dotsContainer = document.querySelector('.carousel-dots');
        
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 8000;
        this.visibleCards = 3; // Number of cards to show at once
        this.cardWidth = 380; // Fixed card width
        this.cardGap = 20; // Gap between cards
        
        // Initialize the carousel
        if (this.track && this.cards.length > 0) {
            this.init();
        } else {
            console.warn('Testimonial carousel elements not found');
        }
    }
    
    init() {
        // Set initial styles for the track
        this.track.style.display = 'flex';
        this.track.style.justifyContent = 'center';
        this.track.style.alignItems = 'flex-start';
        this.track.style.gap = `${this.cardGap}px`;
        this.track.style.padding = '20px 0';
        this.track.style.overflow = 'visible';
        this.track.style.position = 'relative';
        this.track.style.minHeight = '400px';
        
        // Set initial styles for cards
        this.cards.forEach((card, index) => {
            card.style.display = 'block';
            card.style.position = 'relative';
            card.style.width = `${this.cardWidth}px`;
            card.style.minWidth = `${this.cardWidth}px`;
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.boxSizing = 'border-box';
        });
        
        // Initialize the carousel
        this.updateCarousel();
        this.createDots();
        this.setupEventListeners();
        this.startAutoPlay();
        
        // Show the track
        this.track.style.opacity = '1';
        
        // Force reflow to ensure transitions work
        this.track.offsetHeight;
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.cards.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `View testimonial ${i + 1}`);
            dot.setAttribute('type', 'button');
            
            if (i === this.currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            }
            
            dot.addEventListener('click', () => this.goToIndex(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateCarousel() {
        // Add smooth fade effect
        this.cards.forEach((card, index) => {
            // First, fade out all cards slightly
            card.style.opacity = '0.3';
            card.style.transform = 'scale(0.88) translateY(20px) translateZ(0)';
        });
        
        // Then after a brief delay, update positions with smooth transitions
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.cards.forEach((card, index) => {
                    // Reset all cards
                    card.classList.remove('active', 'prev', 'next');
                    card.style.display = 'block';
                    card.style.position = 'relative';
                    card.style.zIndex = '1';
                    
                    // Update active card - center with full opacity
                    if (index === this.currentIndex) {
                        card.classList.add('active');
                        card.style.transform = 'scale(1) translateY(0) translateZ(0)';
                        card.style.opacity = '1';
                        card.style.zIndex = '3';
                    } 
                    // Update previous card - left side
                    else if (index === (this.currentIndex - 1 + this.cards.length) % this.cards.length) {
                        card.classList.add('prev');
                        card.style.transform = 'translateX(25%) scale(0.88) translateY(0) translateZ(0)';
                        card.style.opacity = '0.5';
                        card.style.zIndex = '1';
                    } 
                    // Update next card - right side
                    else if (index === (this.currentIndex + 1) % this.cards.length) {
                        card.classList.add('next');
                        card.style.transform = 'translateX(-25%) scale(0.88) translateY(0) translateZ(0)';
                        card.style.opacity = '0.5';
                        card.style.zIndex = '1';
                    } 
                    // Hide other cards smoothly
                    else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.7) translateY(30px) translateZ(0)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                    
                    // Update ARIA attributes
                    card.setAttribute('aria-hidden', index !== this.currentIndex ? 'true' : 'false');
                    
                    // Force hardware acceleration
                    card.style.willChange = 'transform, opacity';
                    card.style.backfaceVisibility = 'hidden';
                    card.style.WebkitBackfaceVisibility = 'hidden';
                });
            });
        });
        
        // Update dots
        this.updateDots();
        
        // Update button states
        this.updateButtonStates();
        
        // Update live region for screen readers
        this.updateLiveRegion();
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive);
        });
    }
    
    updateButtonStates() {
        if (!this.prevBtn || !this.nextBtn) return;
        
        this.prevBtn.disabled = this.currentIndex === 0;
        this.prevBtn.setAttribute('aria-disabled', this.currentIndex === 0);
        
        this.nextBtn.disabled = this.currentIndex >= this.cards.length - 1;
        this.nextBtn.setAttribute('aria-disabled', this.currentIndex >= this.cards.length - 1);
    }
    
    updateLiveRegion() {
        const activeCard = this.cards[this.currentIndex];
        if (!activeCard) return;
        
        const author = activeCard.querySelector('h4')?.textContent || '';
        const role = activeCard.querySelector('.author-role')?.textContent || '';
        const quote = activeCard.querySelector('p')?.textContent || '';
        
        let liveRegion = document.getElementById('testimonial-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'testimonial-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = `Testimonial ${this.currentIndex + 1} of ${this.cards.length}: ${author}, ${role}. ${quote}`;
    }
    
    goToIndex(index) {
        if (index < 0 || index >= this.cards.length || this.isAnimating) return;
        
        this.isAnimating = true;
        const oldIndex = this.currentIndex;
        this.currentIndex = index;
        
        // Add transition class
        this.track.classList.add('transitioning');
        
        // Update carousel after a short delay to allow CSS transition
        setTimeout(() => {
            // Force reflow to ensure transitions work
            this.track.offsetHeight;
            
            // Update carousel state
            this.updateCarousel();
            
            // Reset animation flag after transition
            var self = this;
            setTimeout(function() {
                self.isAnimating = false;
            }, this.transitionDuration);
        }, 10);
        
        this.resetAutoPlay();
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.goToIndex(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.goToIndex(prevIndex);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        if (this.cards.length <= 1) return;
        
        this.autoPlayInterval = setInterval(() => {
            if (!document.hidden) {
                this.nextSlide();
            }
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === 'Home') this.goToIndex(0);
            if (e.key === 'End') this.goToIndex(this.cards.length - 1);
        });
        
        // Pause autoplay on hover/focus
        const pauseAutoPlay = () => this.stopAutoPlay();
        const resumeAutoPlay = () => this.startAutoPlay();
        
        this.track?.addEventListener('mouseenter', pauseAutoPlay);
        this.track?.addEventListener('focusin', pauseAutoPlay);
        this.track?.addEventListener('mouseleave', resumeAutoPlay);
        this.track?.addEventListener('focusout', resumeAutoPlay);
        
        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            document.hidden ? this.stopAutoPlay() : this.startAutoPlay();
        });
        
        // Touch events for swipe
        let touchStartX = 0;
        
        this.track?.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track?.addEventListener('touchend', (e) => {
            if (!touchStartX) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            // Only consider horizontal swipes
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            touchStartX = 0;
        }, { passive: true });
    }
    
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToIndex(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToIndex(this.cards.length - 1);
                break;
        }
    }
    
    setupTouchEvents() {
        if (!this.track) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        const swipeThreshold = 50; // Minimum distance for a swipe
        
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
            this.stopAutoPlay();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            // Prevent scrolling while swiping horizontally
            if (Math.abs(e.changedTouches[0].clientX - touchStartX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Calculate swipe distance
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    // Swipe left - go to next
                    this.nextSlide();
                } else {
                    // Swipe right - go to previous
                    this.prevSlide();
                }
            }
            
            this.startAutoPlay();
        }, { passive: true });
    }
    
    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch events for mobile
        this.setupTouchEvents();
        
        // Pause auto-play on hover/focus
        if (this.track) {
            this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            this.track.addEventListener('focusin', () => this.stopAutoPlay());
            this.track.addEventListener('focusout', () => this.startAutoPlay());
        }
        
        // Pause auto-play when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }
}

// Initialize the carousel when the DOM is fully loaded
function initTestimonialCarousel() {
    // Ensure the track element exists
    const track = document.querySelector('.testimonials-track');
    if (!track) {
        console.warn('Testimonial track element not found');
        return;
    }
    
    // Check if we have enough cards
    const cards = document.querySelectorAll('.testimonial-card');
    if (cards.length < 1) {
        console.warn('No testimonial cards found');
        return;
    }
    
    // Initialize the carousel
    new TestimonialCarousel();
}

// Wait for both DOM and resources to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
} else {
    initTestimonialCarousel();
}

// Add a class to the body when JavaScript is enabled
document.documentElement.classList.add('js-enabled');
