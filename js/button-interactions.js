/**
 * Enhanced Button Interactions
 * Adds loading states, ripple effects, and improved UX
 */

(function() {
    'use strict';

    // Add loading state to buttons
    function addLoadingState(button, duration = 2000) {
        if (button.classList.contains('loading')) return;
        
        const originalText = button.innerHTML;
        button.classList.add('loading');
        button.disabled = true;
        
        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = originalText;
        }, duration);
    }

    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Enhanced button feedback
    function enhanceButton(button) {
        // Skip if already enhanced
        if (button.hasAttribute('data-enhanced')) return;
        button.setAttribute('data-enhanced', 'true');
        
        // Add ripple effect (don't prevent default)
        button.addEventListener('click', createRipple, { passive: true });
        
        // Don't interfere with button functionality
        // Just add visual enhancements
    }

    // Initialize enhanced buttons
    function initializeButtons() {
        const buttons = document.querySelectorAll(`
            .btn,
            button,
            [class*="btn"],
            .nav-cta,
            .nav-link-auth,
            input[type="submit"],
            input[type="button"]
        `);
        
        buttons.forEach(enhanceButton);
        
        console.log(`✅ Enhanced ${buttons.length} buttons with interactions`);
    }

    // Smooth scroll for anchor buttons
    function initializeSmoothScroll() {
        const scrollButtons = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        scrollButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = button.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Add loading state
                    addLoadingState(button, 800);
                    
                    // Smooth scroll
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Button state management
    function initializeButtonStates() {
        // Handle disabled states
        const disabledButtons = document.querySelectorAll('button[disabled], .btn[disabled]');
        disabledButtons.forEach(button => {
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            button.style.transform = 'none';
        });
        
        // Handle active states
        const activeButtons = document.querySelectorAll('.btn.active, button.active');
        activeButtons.forEach(button => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
        });
    }

    // Mobile touch enhancements
    function initializeMobileEnhancements() {
        if ('ontouchstart' in window) {
            const buttons = document.querySelectorAll('.btn, button, [class*="btn"]');
            
            buttons.forEach(button => {
                button.addEventListener('touchstart', () => {
                    button.style.transform = 'translateY(0) scale(0.98)';
                }, { passive: true });
                
                button.addEventListener('touchend', () => {
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 100);
                }, { passive: true });
            });
        }
    }

    // Initialize everything
    function init() {
        initializeButtons();
        initializeSmoothScroll();
        initializeButtonStates();
        initializeMobileEnhancements();
        
        // Re-initialize for dynamically added buttons
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const newButtons = node.querySelectorAll?.('.btn, button, [class*="btn"]') || [];
                        newButtons.forEach(enhanceButton);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.ButtonInteractions = {
        enhance: enhanceButton,
        addLoading: addLoadingState,
        createRipple: createRipple
    };

})();
