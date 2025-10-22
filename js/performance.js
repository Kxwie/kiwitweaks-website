// Performance optimizations
function optimizePerformance() {
    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }

    // Preload critical resources
    const preloadLinks = [
        { href: 'css/clean-tabs.css', as: 'style' },
        { href: 'js/clean-tabs.js', as: 'script' }
    ];

    preloadLinks.forEach(link => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = link.href;
        preloadLink.as = link.as;
        document.head.appendChild(preloadLink);
    });
}

// Run optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', optimizePerformance);
