// Debug helper functions
function logElementInfo(selector, message = '') {
    const elements = document.querySelectorAll(selector);
    console.log(`[DEBUG] ${message} Found ${elements.length} elements matching '${selector}':`, elements);
    
    elements.forEach((el, index) => {
        console.log(`[DEBUG] Element ${index + 1}:`, {
            tagName: el.tagName,
            id: el.id,
            classes: el.className,
            textContent: el.textContent.trim().substring(0, 50) + '...',
            isVisible: isElementInViewport(el),
            computedStyle: window.getComputedStyle(el)
        });
    });
}

function isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to force show first tab content
function forceShowFirstTab() {
    console.log('[DEBUG] Forcing display of first tab content...');
    
    // Get all tabs and panes
    const tabs = document.querySelectorAll('.product-tab');
    const panes = document.querySelectorAll('.product-pane');
    
    if (tabs.length > 0 && panes.length > 0) {
        console.log(`[DEBUG] Found ${tabs.length} tabs and ${panes.length} panes`);
        
        // First, ensure all panes are visible for debugging
        panes.forEach((pane, index) => {
            console.log(`[DEBUG] Pane ${index + 1} before:`, {
                display: window.getComputedStyle(pane).display,
                opacity: window.getComputedStyle(pane).opacity,
                visibility: window.getComputedStyle(pane).visibility,
                classList: Array.from(pane.classList)
            });
            
            // Force all panes to be visible for debugging
            pane.style.display = 'block';
            pane.style.opacity = '1';
            pane.style.visibility = 'visible';
            pane.style.position = 'relative';
            pane.style.zIndex = '1';
        });
        
        // Remove active classes from all tabs and panes
        tabs.forEach(tab => tab.classList.remove('active'));
        panes.forEach(pane => pane.classList.remove('active'));
        
        // Activate first tab and pane
        tabs[0].classList.add('active');
        panes[0].classList.add('active');
        
        // Force repaint
        const forceRepaint = panes[0].offsetHeight;
        
        console.log('[DEBUG] First tab should now be visible');
        
        // Log after state
        panes.forEach((pane, index) => {
            console.log(`[DEBUG] Pane ${index + 1} after:`, {
                display: window.getComputedStyle(pane).display,
                opacity: window.getComputedStyle(pane).opacity,
                visibility: window.getComputedStyle(pane).visibility,
                classList: Array.from(pane.classList)
            });
        });
    } else {
        console.warn('[DEBUG] No tabs or panes found to activate');
    }
}

// Run debug checks when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Running debug checks...');
    
        // Check product showcase elements with detailed logging
    console.group('=== Product Showcase Debug ===');
    
    // Log all tabs and their states
    const tabs = document.querySelectorAll('.product-tab');
    console.log(`Found ${tabs.length} tabs:`);
    tabs.forEach((tab, index) => {
        console.log(`  Tab ${index + 1}:`, {
            text: tab.textContent.trim(),
            active: tab.classList.contains('active'),
            attributes: Array.from(tab.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            }))
        });
    });
    
    // Log all panes and their states
    const panes = document.querySelectorAll('.product-pane');
    console.log(`\nFound ${panes.length} panes:`);
    panes.forEach((pane, index) => {
        console.log(`  Pane ${index + 1}:`, {
            id: pane.id,
            active: pane.classList.contains('active'),
            display: window.getComputedStyle(pane).display,
            opacity: window.getComputedStyle(pane).opacity,
            visibility: window.getComputedStyle(pane).visibility,
            height: pane.offsetHeight,
            children: pane.children.length
        });
    });
    
    // Log computed styles of the showcase container
    const showcase = document.querySelector('.product-showcase');
    if (showcase) {
        console.log('\nShowcase container styles:', {
            display: window.getComputedStyle(showcase).display,
            visibility: window.getComputedStyle(showcase).visibility,
            opacity: window.getComputedStyle(showcase).opacity,
            height: showcase.offsetHeight,
            width: showcase.offsetWidth,
            position: window.getComputedStyle(showcase).position,
            zIndex: window.getComputedStyle(showcase).zIndex
        });
    }
    
    console.groupEnd();
    
    // Force show first tab after a short delay
    setTimeout(forceShowFirstTab, 500);
    logElementInfo('.product-tabs', 'Product Tabs');
    logElementInfo('.product-tab', 'Product Tab Items');
    logElementInfo('.product-panes', 'Product Panes');
    logElementInfo('.product-pane', 'Product Pane Items');
    
    // Add visual debug styles
    const style = document.createElement('style');
    style.textContent = `
        .product-showcase { border: 2px solid #f00 !important; }
        .product-tabs { border: 2px solid #0f0 !important; }
        .product-tab { border: 1px dashed #00f !important; }
        .product-panes { border: 2px solid #ff0 !important; }
        .product-pane { border: 1px dashed #f0f !important; }
        
        /* Add debug labels */
        .product-showcase::before {
            content: 'PRODUCT-SHOWCASE';
            position: absolute;
            top: 0;
            left: 0;
            background: red;
            color: white;
            padding: 2px 5px;
            font-size: 10px;
            z-index: 9999;
        }
        
        .product-tabs::before {
            content: 'TABS-CONTAINER';
            position: absolute;
            top: -20px;
            left: 0;
            background: green;
            color: white;
            padding: 2px 5px;
            font-size: 10px;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[DEBUG] Debug styles applied. Check elements in the Elements panel.');
});
