// Initialize the product showcase
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.product-tab');
    const panes = document.querySelectorAll('.product-pane');
    
    // Initialize first tab as active if none is active
    if (!document.querySelector('.product-tab.active')) {
        tabs[0].classList.add('active');
        panes[0].classList.add('active');
    }
    
    // Tab click handler
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active pane with animation
            panes.forEach(pane => {
                if (pane.id === tabId) {
                    pane.classList.add('active');
                    // Trigger reflow for animation
                    void pane.offsetWidth;
                    pane.style.opacity = '1';
                    pane.style.visibility = 'visible';
                    pane.style.transform = 'translateY(0)';
                } else {
                    pane.classList.remove('active');
                    pane.style.opacity = '0';
                    pane.style.visibility = 'hidden';
                    pane.style.transform = 'translateY(20px)';
                }
            });
            
            // Trigger 3D model update if needed
            update3DModel(tabId);
        });
    });
    
    // Initialize 3D viewer for the active tab
    const activeTab = document.querySelector('.product-tab.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        update3DModel(tabId);
    }
    
    // Initialize scroll animations
    initScrollAnimations();
});

// Update 3D model based on active tab
function update3DModel(tabId) {
    // This is a placeholder for 3D model loading logic
    // In a real implementation, you would load the appropriate 3D model here
    console.log(`Loading 3D model for ${tabId}`);
    
    // Example: Update the product image based on the tab
    const modelElement = document.querySelector(`#${tabId} .product-image`);
    if (modelElement) {
        // Add a subtle animation to the model
        modelElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            modelElement.style.transform = 'scale(1)';
        }, 300);
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-scroll]');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.setAttribute('data-scroll', 'in');
                
                // Animate feature list items with staggered delay
                if (entry.target.classList.contains('feature-list')) {
                    const items = entry.target.querySelectorAll('li');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 100 * index);
                    });
                }
            } else {
                // Reset animation when element is out of view
                if (!entry.target.classList.contains('keep-animation')) {
                    entry.target.setAttribute('data-scroll', 'out');
                    
                    // Reset feature list items
                    if (entry.target.classList.contains('feature-list')) {
                        const items = entry.target.querySelectorAll('li');
                        items.forEach(item => {
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(10px)';
                        });
                    }
                }
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Initialize scroll-triggered animations on page load
    checkScrollPosition();
    
    // Add scroll event listener for scroll-based animations
    window.addEventListener('scroll', checkScrollPosition);
}

// Check scroll position for animations
function checkScrollPosition() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Add parallax effect to elements with data-parallax attribute
    document.querySelectorAll('[data-parallax]').forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax-speed') || '0.5');
        const offset = scrollPosition * speed;
        element.style.transform = `translateY(${offset}px)`;
    });
    
    // Add scroll-based animations
    document.querySelectorAll('[data-scroll-speed]').forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = rect.bottom + window.scrollY;
        
        // Calculate how much of the element is visible
        const visibleHeight = Math.min(elementBottom, scrollPosition + windowHeight) - 
                             Math.max(elementTop, scrollPosition);
        const visibleRatio = visibleHeight / (rect.height || 1);
        
        if (visibleRatio > 0) {
            const speed = parseFloat(element.getAttribute('data-scroll-speed') || '1');
            const offset = (1 - visibleRatio) * 50 * speed;
            element.style.transform = `translateY(${offset}px)`;
            element.style.opacity = visibleRatio;
        }
    });
}

// Debounce function for scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});
