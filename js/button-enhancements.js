/**
 * Button Enhancement JavaScript
 * Adds interactive features to the enhanced button system
 */

(function() {
    'use strict';

    // Initialize button enhancements
    function initButtonEnhancements() {
        addRippleEffects();
        addLoadingStates();
        addKeyboardSupport();
        addTouchFeedback();
        console.log('✅ Button enhancements initialized');
    }

    // Add ripple effects to buttons with btn-ripple class
    function addRippleEffects() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('.btn-ripple');
            if (!button) return;

            // Remove existing ripple
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }

            // Create new ripple
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            // Calculate ripple position
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            // Apply ripple styles
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
                z-index: 0;
            `;
            
            button.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });

        // Add ripple animation CSS
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .btn-ripple {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add loading states for form buttons
    function addLoadingStates() {
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');
            
            if (submitButton && submitButton.classList.contains('btn')) {
                // Add loading class
                submitButton.classList.add('btn-loading');
                submitButton.disabled = true;
                
                // Store original text
                const originalText = submitButton.innerHTML;
                
                // Reset after 3 seconds (or when form processing completes)
                setTimeout(() => {
                    submitButton.classList.remove('btn-loading');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }, 3000);
            }
        });
    }

    // Add keyboard support for better accessibility
    function addKeyboardSupport() {
        document.addEventListener('keydown', function(e) {
            const button = e.target;
            
            if (button.classList.contains('btn') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                
                // Add active class temporarily
                button.classList.add('btn-active');
                
                // Trigger click
                setTimeout(() => {
                    button.click();
                    button.classList.remove('btn-active');
                }, 100);
            }
        });

        // Add active state CSS
        if (!document.getElementById('keyboard-styles')) {
            const style = document.createElement('style');
            style.id = 'keyboard-styles';
            style.textContent = `
                .btn-active {
                    transform: translateY(0) scale(0.98) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add touch feedback for mobile devices
    function addTouchFeedback() {
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', function(e) {
            const button = e.target.closest('.btn');
            if (!button) return;
            
            touchStartTime = Date.now();
            button.classList.add('btn-touching');
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            const button = e.target.closest('.btn');
            if (!button) return;
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Add haptic feedback for supported devices
            if ('vibrate' in navigator && touchDuration < 500) {
                navigator.vibrate(10);
            }
            
            setTimeout(() => {
                button.classList.remove('btn-touching');
            }, 150);
        }, { passive: true });

        // Add touch state CSS
        if (!document.getElementById('touch-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-styles';
            style.textContent = `
                .btn-touching {
                    transform: translateY(0) scale(0.95) !important;
                    transition: transform 0.1s ease !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add button group enhancements
    function enhanceButtonGroups() {
        const buttonGroups = document.querySelectorAll('.btn-group');
        
        buttonGroups.forEach(group => {
            // Add stagger animation to button groups
            const buttons = group.querySelectorAll('.btn');
            buttons.forEach((button, index) => {
                button.style.animationDelay = `${index * 0.1}s`;
            });
        });
    }

    // Add scroll-triggered button animations
    function addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const buttons = entry.target.querySelectorAll('.btn');
                    buttons.forEach((button, index) => {
                        setTimeout(() => {
                            button.style.opacity = '1';
                            button.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe button groups and CTA sections
        document.querySelectorAll('.btn-group, .cta-buttons, .hero-cta').forEach(element => {
            observer.observe(element);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButtonEnhancements);
    } else {
        initButtonEnhancements();
    }

    // Initialize additional features when page loads
    window.addEventListener('load', function() {
        enhanceButtonGroups();
        addScrollAnimations();
    });

    // Export for external use
    window.ButtonEnhancements = {
        init: initButtonEnhancements,
        addRipple: addRippleEffects,
        addLoading: addLoadingStates
    };

})();
