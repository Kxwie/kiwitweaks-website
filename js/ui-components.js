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
    
    // Use event delegation on the container instead of individual items
    faqContainer.addEventListener('click', (e) => {
        // Find the closest .faq-question element
        const question = e.target.closest('.faq-question');
        
        if (!question) return;
        
        // Find the parent .faq-item
        const item = question.closest('.faq-item');
        
        if (!item) return;
        
        // Prevent event bubbling
        e.stopPropagation();
        
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        const allFaqItems = faqContainer.querySelectorAll('.faq-item');
        allFaqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
    
    const faqCount = faqContainer.querySelectorAll('.faq-item').length;
    console.log(`[FAQ] Initialized ${faqCount} FAQ items using event delegation`);
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
