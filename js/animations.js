/**
 * Smooth Animations & Interactions
 * Inspired by Igloo Inc.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initSmoothScrolling();
    initScrollAnimations();
    initHoverEffects();
    initPageTransitions();
    initParallaxEffects();
    init3DHoverEffects();
    initRippleEffects();
    initScrollProgress();
    initCustomCursors();
    
    // Handle page load animations
    window.addEventListener('load', function() {
        document.body.classList.add('page-loaded');
        animatePageLoad();
    });
});

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Add smooth scroll class to html element
                document.documentElement.style.scrollBehavior = 'smooth';
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const offset = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                // Scroll to target
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
                
                // Reset scroll behavior
                setTimeout(() => {
                    document.documentElement.style.scrollBehavior = '';
                }, 1000);
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
    
    // Add smooth scroll to all elements with data-scroll-to
    document.querySelectorAll('[data-scroll-to]').forEach(element => {
        element.addEventListener('click', function() {
            const target = this.getAttribute('data-scroll-to');
            const targetElement = document.querySelector(target);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const offset = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll-triggered animations
 */
function initScrollAnimations() {
    // Create Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle scroll-triggered animations
                handleScrollAnimation(entry.target, 'in');
                
                // If element has data-animate-once, unobserve after animation
                if (entry.target.hasAttribute('data-animate-once')) {
                    observer.unobserve(entry.target);
                }
            } else if (!entry.target.hasAttribute('data-animate-once')) {
                // Reset animation if not set to animate once
                handleScrollAnimation(entry.target, 'out');
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-scroll attribute
    document.querySelectorAll('[data-scroll]').forEach(element => {
        observer.observe(element);
    });
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .fade-up, .fade-down, .fade-left, .fade-right, .scale-in, .stagger-children > *').forEach(element => {
        observer.observe(element);
    });
    
    // Initial check for elements already in view
    checkElementsInView();
}

/**
 * Handle scroll animation for an element
 */
function handleScrollAnimation(element, state) {
    // Handle data-scroll attribute
    if (element.hasAttribute('data-scroll')) {
        element.setAttribute('data-scroll', state);
    }
    
    // Handle animation classes
    if (element.classList.contains('fade-in') && state === 'in') {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }
    
    if (element.classList.contains('fade-up') && state === 'in') {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    } else if (element.classList.contains('fade-up') && state === 'out') {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
    }
    
    // Add more animation class handlers as needed
    // ...
}

/**
 * Check if elements are already in view on page load
 */
function checkElementsInView() {
    const elements = document.querySelectorAll('[data-scroll], .fade-in, .fade-up, .fade-down, .fade-left, .fade-right, .scale-in');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isInView = (
            rect.top <= (window.innerHeight * 0.9) && 
            rect.bottom >= (window.innerHeight * 0.1)
        );
        
        if (isInView) {
            handleScrollAnimation(element, 'in');
        }
    });
}

/**
 * Initialize hover effects
 */
function initHoverEffects() {
    // Add hover class on hover
    document.querySelectorAll('.hover-scale, .hover-lift, .hover-glow').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.classList.add('hover-active');
        });
        
        element.addEventListener('mouseleave', function() {
            this.classList.remove('hover-active');
        });
    });
    
    // Tilt effect for cards
    if (window.innerWidth > 992) { // Only on desktop
        document.querySelectorAll('.tilt-effect').forEach(element => {
            element.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 5;
                const rotateX = ((centerY - y) / centerY) * 5;
                
                this.style.setProperty('--rotate-x', `${rotateX}deg`);
                this.style.setProperty('--rotate-y', `${rotateY}deg`);
                
                // Parallax effect for child elements
                const layers = this.querySelectorAll('[data-depth]');
                layers.forEach(layer => {
                    const depth = parseFloat(layer.getAttribute('data-depth') || '0.1');
                    const xPos = (x - centerX) * depth;
                    const yPos = (y - centerY) * depth;
                    
                    layer.style.transform = `translate(${xPos}px, ${yPos}px)`;
                });
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.setProperty('--rotate-x', '0deg');
                this.style.setProperty('--rotate-y', '0deg');
                
                // Reset parallax layers
                const layers = this.querySelectorAll('[data-depth]');
                layers.forEach(layer => {
                    layer.style.transform = 'translate(0, 0)';
                });
            });
        });
    }
}

/**
 * Initialize page transition effects
 */
function initPageTransitions() {
    // Add transition class to all links
    document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach(link => {
        if (link.href && link.href.indexOf(window.location.origin) === 0) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.href;
                
                // Add page transition class
                document.body.classList.add('page-transition-out');
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            });
        }
    });
    
    // Handle back/forward navigation
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            document.body.classList.remove('page-transition-out');
            document.body.classList.add('page-transition-in');
            
            setTimeout(() => {
                document.body.classList.remove('page-transition-in');
            }, 500);
        }
    });
}

/**
 * Initialize parallax effects
 */
function initParallaxEffects() {
    if (window.innerWidth > 768) { // Only on desktop
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', handleParallax);
            window.addEventListener('resize', handleParallax);
            handleParallax(); // Initial call
        }
    }
}

function handleParallax() {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    document.querySelectorAll('[data-parallax]').forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax-speed') || '0.5');
        const offset = element.getBoundingClientRect().top + scrollPosition;
        const elementHeight = element.offsetHeight;
        
        // Only animate when element is in or near viewport
        if (offset + elementHeight > scrollPosition && offset < scrollPosition + windowHeight) {
            const yPos = (scrollPosition - offset) * speed;
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
    });
}

/**
 * Initialize 3D hover effects
 */
function init3DHoverEffects() {
    if (window.innerWidth > 992) { // Only on desktop
        document.querySelectorAll('.card-3d').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.setProperty('--rotate-x', `${rotateX}deg`);
                this.style.setProperty('--rotate-y', `${rotateY}deg`);
                this.style.setProperty('--glow-opacity', '0.3');
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.setProperty('--rotate-x', '0deg');
                this.style.setProperty('--rotate-y', '0deg');
                this.style.setProperty('--glow-opacity', '0');
            });
        });
    }
}

/**
 * Initialize ripple effects for buttons
 */
function initRippleEffects() {
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            // Remove any existing ripples
            const existingRipples = this.querySelectorAll('.ripple-effect');
            existingRipples.forEach(ripple => {
                ripple.remove();
            });
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            // Set ripple size
            const diameter = Math.max(this.offsetWidth, this.offsetHeight);
            const radius = diameter / 2;
            
            // Set ripple position
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - radius;
            const y = e.clientY - rect.top - radius;
            
            // Apply styles
            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add ripple to button
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    
    if (progressBar) {
        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        });
    }
}

/**
 * Initialize custom cursors
 */
function initCustomCursors() {
    if (window.innerWidth > 992) { // Only on desktop
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);
        
        const cursorFollower = document.createElement('div');
        cursorFollower.classList.add('custom-cursor-follower');
        document.body.appendChild(cursorFollower);
        
        // Update cursor position
        document.addEventListener('mousemove', function(e) {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            
            // Add slight delay to follower for smooth trailing effect
            setTimeout(() => {
                cursorFollower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }, 100);
        });
        
        // Add hover effects for interactive elements
        const interactiveElements = [
            'a', 'button', '.btn', '.card', 'input', 'textarea', 'select',
            '[data-cursor="pointer"]', '[data-cursor="zoom"]'
        ];
        
        interactiveElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.addEventListener('mouseenter', function() {
                    cursor.classList.add('cursor-hover');
                    cursorFollower.classList.add('cursor-follower-hover');
                    
                    if (this.hasAttribute('data-cursor')) {
                        const cursorType = this.getAttribute('data-cursor');
                        cursor.classList.add(`cursor-${cursorType}`);
                        cursorFollower.classList.add(`cursor-follower-${cursorType}`);
                    }
                });
                
                element.addEventListener('mouseleave', function() {
                    cursor.classList.remove('cursor-hover');
                    cursorFollower.classList.remove('cursor-follower-hover');
                    
                    if (this.hasAttribute('data-cursor')) {
                        const cursorType = this.getAttribute('data-cursor');
                        cursor.classList.remove(`cursor-${cursorType}`);
                        cursorFollower.classList.remove(`cursor-follower-${cursorType}`);
                    }
                });
            });
        });
    }
}

/**
 * Animate page load
 */
function animatePageLoad() {
    // Add loaded class to body
    document.body.classList.add('page-loaded');
    
    // Animate hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('animate-in');
    }
    
    // Animate sections with delay
    document.querySelectorAll('section').forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
}

// Export functions for use in other modules
window.Animations = {
    initSmoothScrolling,
    initScrollAnimations,
    initHoverEffects,
    initPageTransitions,
    initParallaxEffects,
    init3DHoverEffects,
    initRippleEffects,
    initScrollProgress,
    initCustomCursors,
    animatePageLoad
};
