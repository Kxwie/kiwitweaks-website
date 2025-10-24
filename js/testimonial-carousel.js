// Testimonial Carousel Constructor
function TestimonialCarousel() {
    // DOM Elements
    this.track = document.querySelector('.testimonials-track');
    this.cards = Array.from(document.querySelectorAll('.testimonial-card'));
    this.prevBtn = document.querySelector('.carousel-btn.prev');
    this.nextBtn = document.querySelector('.carousel-btn.next');
    this.dotsContainer = document.querySelector('.carousel-dots');
    
    // Carousel state
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 8000;
    this.transitionDuration = 600;
    
    // Initialize the carousel
    this.init();
};

// Initialize the carousel
TestimonialCarousel.prototype.init = function() {
    if (!this.track || this.cards.length === 0) return;
    
    var self = this;
    
    // Set initial states
    this.cards.forEach(function(card, index) {
        // Reset all cards
        card.classList.remove('active', 'prev', 'next');
        
        if (index === 0) {
            card.classList.add('active');
            card.setAttribute('aria-hidden', 'false');
        } else if (index === 1) {
            card.classList.add('next');
            card.setAttribute('aria-hidden', 'true');
        } else if (index === this.cards.length - 1) {
            card.classList.add('prev');
            card.setAttribute('aria-hidden', 'true');
        } else {
            card.style.display = 'none';
            card.setAttribute('aria-hidden', 'true');
        }
    }.bind(this));
    
    // Update profile pictures with kiwi icons
    this.updateProfilePictures();
    
    this.createDots();
    this.updateCarousel();
    this.startAutoPlay();
    this.setupEventListeners();
    
    // Initial animation
    this.track.style.opacity = '1';
    this.track.style.transform = 'translateY(0)';
};

// Update profile pictures with kiwi icons
TestimonialCarousel.prototype.updateProfilePictures = function() {
    var colors = ['#8BC34A', '#689F38', '#558B2F', '#33691E'];
    
    this.cards.forEach(function(card) {
        var avatar = card.querySelector('.author-avatar');
        if (avatar) {
            // Generate a random color for the kiwi
            var randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Create a container for the kiwi icon
            var kiwiContainer = document.createElement('div');
            kiwiContainer.style.width = '100%';
            kiwiContainer.style.height = '100%';
            kiwiContainer.style.display = 'flex';
            kiwiContainer.style.alignItems = 'center';
            kiwiContainer.style.justifyContent = 'center';
            
            // Create the kiwi icon with the random color
            kiwiContainer.innerHTML = [
                '<svg viewBox="0 0 24 24" width="100%" height="100%">',
                '<path fill="' + randomColor + '" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4M12,5C8.14,5 5,8.14 5,12C5,15.86 8.14,19 12,19C15.86,19 19,15.86 19,12C19,8.14 15.86,5 12,5M12,6.5C15.04,6.5 17.5,8.96 17.5,12C17.5,15.04 15.04,17.5 12,17.5C8.96,17.5 6.5,15.04 6.5,12C6.5,8.96 8.96,6.5 12,6.5M12,7.5C9.52,7.5 7.5,9.52 7.5,12C7.5,14.48 9.52,16.5 12,16.5C14.48,16.5 16.5,14.48 16.5,12C16.5,9.52 14.48,7.5 12,7.5Z"/>',
                '</svg>'
            ].join('');
            
            // Clear existing content and append the new kiwi icon
            avatar.innerHTML = '';
            avatar.appendChild(kiwiContainer);
        }
    });
};

// Create navigation dots
TestimonialCarousel.prototype.createDots = function() {
    if (!this.dotsContainer) return;
    
    var self = this;
    this.dotsContainer.innerHTML = ''; // Clear existing dots
    
    this.cards.forEach(function(_, index) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'View testimonial ' + (index + 1));
        dot.setAttribute('type', 'button');
        
        if (index === self.currentIndex) {
            dot.classList.add('active');
            dot.setAttribute('aria-current', 'true');
        }
        
        dot.addEventListener('click', function() {
            self.goToIndex(index);
        });
        
        self.dotsContainer.appendChild(dot);
    });
};

// Update dots navigation
TestimonialCarousel.prototype.updateDots = function() {
    if (!this.dotsContainer) return;
    
    var self = this;
    var dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    
    dots.forEach(function(dot, index) {
        if (index === self.currentIndex) {
            dot.classList.add('active');
            dot.setAttribute('aria-current', 'true');
        } else {
            dot.classList.remove('active');
            dot.removeAttribute('aria-current');
        }
    });
};

// Update carousel state
TestimonialCarousel.prototype.updateCarousel = function() {
    if (!this.track) return;
    
    var self = this;
    
    // Update active state for all cards
    this.cards.forEach(function(card, index) {
        if (index === self.currentIndex) {
            card.classList.add('active');
            card.setAttribute('aria-hidden', 'false');
        } else {
            card.classList.remove('active');
            card.setAttribute('aria-hidden', 'true');
        }
    });
    
    // Update dots
    this.updateDots();
    
    // Update button states
    this.updateButtonStates();
    
    // Update ARIA live region for screen readers
    this.updateLiveRegion();
};

// Set up event listeners
TestimonialCarousel.prototype.setupEventListeners = function() {
    var self = this;
    
    if (this.prevBtn) {
        this.prevBtn.addEventListener('click', function() {
            self.prev();
        });
    }
    
    if (this.nextBtn) {
        this.nextBtn.addEventListener('click', function() {
            self.next();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            self.prev();
        } else if (e.key === 'ArrowRight') {
            self.next();
        }
    });
    
    // Pause autoplay on hover
    if (this.track) {
        this.track.addEventListener('mouseenter', function() {
            self.pauseAutoPlay();
        });
        this.track.addEventListener('mouseleave', function() {
            self.startAutoPlay();
        });
        this.track.addEventListener('focusin', function() {
            self.pauseAutoPlay();
        });
        this.track.addEventListener('focusout', function() {
            self.startAutoPlay();
        });
    }
};

// Go to specific slide by index
TestimonialCarousel.prototype.goToIndex = function(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    var direction = index > this.currentIndex ? 'next' : 'prev';
    var oldIndex = this.currentIndex;
    this.currentIndex = index;
    
    // Add animation classes
    var oldCard = this.cards[oldIndex];
    var newCard = this.cards[index];
    
    if (oldCard) {
        oldCard.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
    }
    
    newCard.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
    newCard.classList.add('active');
    
    // Update carousel after animation
    var self = this;
    setTimeout(function() {
        if (oldCard) {
            oldCard.classList.remove('active', 'slide-out-left', 'slide-out-right');
            oldCard.setAttribute('aria-hidden', 'true');
        }
        
        newCard.classList.remove('slide-in-right', 'slide-in-left');
        newCard.setAttribute('aria-hidden', 'false');
        
        self.updateCarousel();
        self.isAnimating = false;
    }, this.transitionDuration);
    
    this.resetAutoPlay();
};

// Go to next slide
TestimonialCarousel.prototype.next = function() {
    if (this.isAnimating || this.cards.length < 3) return;
    this.isAnimating = true;
    
    var prevCard = this.track.querySelector('.prev');
    var activeCard = this.track.querySelector('.active');
    var nextCard = this.track.querySelector('.next');
    
    if (!prevCard || !activeCard || !nextCard) {
        this.isAnimating = false;
        return;
    }
    
    // Update current index
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    
    // Calculate indices for the new cards
    var newPrevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    var newNextIndex = (this.currentIndex + 1) % this.cards.length;
    
    // Update classes for smooth transition
    prevCard.classList.remove('prev');
    activeCard.classList.remove('active');
    nextCard.classList.remove('next');
    
    // Hide the card that's moving out of view
    prevCard.style.display = 'none';
    
    // Set new cards
    this.cards[newPrevIndex].classList.add('prev');
    this.cards[this.currentIndex].classList.add('active');
    this.cards[newNextIndex].classList.add('next');
    
    // Make sure the new cards are visible
    this.cards[newPrevIndex].style.display = 'block';
    this.cards[this.currentIndex].style.display = 'block';
    this.cards[newNextIndex].style.display = 'block';
    
    // Update ARIA attributes
    this.cards.forEach((card, index) => {
        card.setAttribute('aria-hidden', index !== this.currentIndex ? 'true' : 'false');
    });
    
    // Update UI
    this.updateDots();
    this.updateLiveRegion();
    
    // Reset animation flag after transition
    setTimeout(() => {
        this.isAnimating = false;
    }, this.transitionDuration);
};

// Go to previous slide
TestimonialCarousel.prototype.prev = function() {
    if (this.isAnimating || this.cards.length < 3) return;
    this.isAnimating = true;
    
    var prevCard = this.track.querySelector('.prev');
    var activeCard = this.track.querySelector('.active');
    var nextCard = this.track.querySelector('.next');
    
    if (!prevCard || !activeCard || !nextCard) {
        this.isAnimating = false;
        return;
    }
    
    // Update current index
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    
    // Calculate indices for the new cards
    var newPrevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    var newNextIndex = (this.currentIndex + 1) % this.cards.length;
    
    // Update classes for smooth transition
    prevCard.classList.remove('prev');
    activeCard.classList.remove('active');
    nextCard.classList.remove('next');
    
    // Hide the card that's moving out of view
    nextCard.style.display = 'none';
    
    // Set new cards
    this.cards[newPrevIndex].classList.add('prev');
    this.cards[this.currentIndex].classList.add('active');
    this.cards[newNextIndex].classList.add('next');
    
    // Make sure the new cards are visible
    this.cards[newPrevIndex].style.display = 'block';
    this.cards[this.currentIndex].style.display = 'block';
    this.cards[newNextIndex].style.display = 'block';
    
    // Update ARIA attributes
    this.cards.forEach((card, index) => {
        card.setAttribute('aria-hidden', index !== this.currentIndex ? 'true' : 'false');
    });
    
    // Update UI
    this.updateDots();
    this.updateLiveRegion();
    
    // Reset animation flag after transition
    setTimeout(() => {
        this.isAnimating = false;
    }, this.transitionDuration);
};

// Update live region for screen readers
TestimonialCarousel.prototype.updateLiveRegion = function() {
    var liveRegion = document.getElementById('carousel-live-region');
    if (!liveRegion) return;
    
    var activeCard = this.cards[this.currentIndex];
    if (!activeCard) return;
    
    var authorElement = activeCard.querySelector('.author-name');
    var roleElement = activeCard.querySelector('.author-role');
    
    var author = authorElement ? authorElement.textContent : 'Author';
    var role = roleElement ? roleElement.textContent : '';
    
    liveRegion.textContent = 'Viewing testimonial ' + (this.currentIndex + 1) + ' of ' + 
                           this.cards.length + ' by ' + author + 
                           (role ? ', ' + role : '');
};

// Update button states
TestimonialCarousel.prototype.updateButtonStates = function() {
    if (!this.prevBtn || !this.nextBtn) return;
    
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.cards.length - 1;
};

// Start autoplay
TestimonialCarousel.prototype.startAutoPlay = function() {
    var self = this;
    
    if (this.autoPlayInterval) return;
    
    this.autoPlayInterval = setInterval(function() {
        self.next();
    }, this.autoPlayDelay);
};

// Pause autoplay
TestimonialCarousel.prototype.pauseAutoPlay = function() {
    if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
    }
};

// Initialize the carousel when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        new TestimonialCarousel();
    });
} else {
    new TestimonialCarousel();
}

// Make carousel available globally
window.TestimonialCarousel = TestimonialCarousel;
