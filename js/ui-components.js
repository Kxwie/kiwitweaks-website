// UI Components - Mobile Menu & FAQ Accordion
console.log('[UI Components] Loading UI components...');

// Mobile Menu Toggle
function initMobileMenuToggle() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) {
        console.warn('[Mobile Menu] Menu toggle or nav links not found');
        return;
    }
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    console.log('[Mobile Menu] Mobile menu initialized');
}

// FAQ Accordion
function initFAQAccordion() {
    const faqContainer = document.querySelector('.faq-grid');
    
    if (!faqContainer) {
        console.warn('[FAQ] FAQ container not found');
        return;
    }
    
    // Check if already initialized to prevent double binding
    if (faqContainer.hasAttribute('data-faq-initialized')) {
        console.log('[FAQ] Already initialized, skipping');
        return;
    }
    faqContainer.setAttribute('data-faq-initialized', 'true');
    
    // Get all FAQ items
    const allFaqItems = faqContainer.querySelectorAll('.faq-item');
    
    // Add click handler to each FAQ question directly
    allFaqItems.forEach(faqItem => {
        const question = faqItem.querySelector('.faq-question');
        
        if (!question) return;
        
        // Mark as initialized to prevent double binding
        if (question.hasAttribute('data-question-initialized')) {
            return;
        }
        question.setAttribute('data-question-initialized', 'true');
        
        question.addEventListener('click', function(e) {
            // Prevent any default behavior and stop propagation
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Check if this item is currently active
            const isCurrentlyActive = faqItem.classList.contains('active');
            
            // Close ALL FAQ items first
            allFaqItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // If this item wasn't active, open it
            if (!isCurrentlyActive) {
                faqItem.classList.add('active');
            }
            
            console.log(`[FAQ] Toggled: ${question.querySelector('h3').textContent}`);
        }, { capture: true }); // Use capture phase to handle event early
    });
    
    console.log(`[FAQ] Initialized ${allFaqItems.length} FAQ items with direct handlers`);
}

// Smooth Scroll with offset for fixed header
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('[Smooth Scroll] Smooth scrolling initialized');
}

// Initialize all UI components
document.addEventListener('DOMContentLoaded', () => {
    console.log('[UI Components] DOM loaded, initializing components...');
    
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        initMobileMenuToggle();
        initFAQAccordion();
        initSmoothScroll();
    }, 100);
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.UIComponents = {
        initMobileMenuToggle,
        initFAQAccordion,
        initSmoothScroll
    };
}
