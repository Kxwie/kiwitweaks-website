document.addEventListener('DOMContentLoaded', function() {
    // Initialize the comparison table
    const comparisonTable = document.querySelector('.comparison-table');
    if (!comparisonTable) return;

    // Add hover effect to rows
    const rows = comparisonTable.querySelectorAll('.comparison-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });

    // Add click effect to version headers
    const versionHeaders = comparisonTable.querySelectorAll('.feature-version');
    versionHeaders.forEach(header => {
        if (header.querySelector('a')) {
            header.style.cursor = 'pointer';
            
            header.addEventListener('click', function(e) {
                // Don't trigger if clicking on a link
                if (e.target.tagName === 'A') return;
                
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            });
        }
    });

    // Add animation to feature items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe each section for scroll animations
    const sections = document.querySelectorAll('.comparison-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Handle mobile touch events for better UX
    let touchStartX = 0;
    let touchEndX = 0;
    
    comparisonTable.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    comparisonTable.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance in pixels
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            comparisonTable.scrollBy({
                left: 100,
                behavior: 'smooth'
            });
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            comparisonTable.scrollBy({
                left: -100,
                behavior: 'smooth'
            });
        }
    }

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            comparisonTable.scrollBy({
                left: 100,
                behavior: 'smooth'
            });
        } else if (e.key === 'ArrowLeft') {
            comparisonTable.scrollBy({
                left: -100,
                behavior: 'smooth'
            });
        }
    });
});
