// Main JavaScript File - KiwiTweaks
// Enhanced with modern interactive features and animations

console.log('[Main] DOM Content Loaded - Starting initialization...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Main] DOM fully loaded, initializing components...');
    try {
        // Initialize core components
        console.log('[Main] Initializing mobile menu...');
        initMobileMenu();
        console.log('[Main] Initializing cookie consent...');
        initCookieConsent();
        
        // Initialize animation system
        if (typeof Animations !== 'undefined') {
            console.log('[Main] Initializing animations...');
            Animations.initSmoothScrolling();
            Animations.initScrollAnimations();
            Animations.initHoverEffects();
            Animations.initPageTransitions();
            Animations.initParallaxEffects();
            Animations.init3DHoverEffects();
            Animations.initRippleEffects();
            Animations.initScrollProgress();
            Animations.initCustomCursors();
        } else {
            console.warn('[Main] Animations module not found');
        }
        
        // Initialize 3D visualizations
        init3DHeroVisualization();
        init3DVisualization();
        
        // Initialize other components
        initTestimonials();
        initTooltips();
        initCounters();
        
        // Initialize product showcase after a short delay to ensure DOM is ready
        console.log('[Main] Scheduling product showcase initialization...');
        setTimeout(() => {
            console.log('[Main] Initializing product showcase...');
            initProductShowcase();
            
            // Verify initialization
            setTimeout(() => {
                const activeTab = document.querySelector('.product-tab.active');
                const activePane = document.querySelector('.product-pane.active');
                console.log('[Main] Product Showcase Status:', {
                    tabs: document.querySelectorAll('.product-tab').length,
                    panes: document.querySelectorAll('.product-pane').length,
                    activeTab: activeTab ? 'Found' : 'Missing',
                    activePane: activePane ? 'Found' : 'Missing',
                    tabText: activeTab ? activeTab.textContent.trim() : 'N/A',
                    paneContent: activePane ? activePane.innerHTML.substring(0, 100) + '...' : 'N/A'
                });
            }, 500);
            
        }, 100);
        
    } catch (error) {
        console.error('[Main] Error during initialization:', error);
    }
        // Initialize 3D visualizations - only if not already initialized
    if (typeof window.threeInitialized === 'undefined') {
        init3DHeroVisualization();
        init3DVisualization();
        window.threeInitialized = true;
    }
    
    // Initialize other components
    if (typeof window.componentsInitialized === 'undefined') {
        initTestimonials();
        initTooltips();
        initCounters();
        window.componentsInitialized = true;
    }
    
    // Add loaded class to body for animations
    setTimeout(() => {
        document.body.classList.remove('preload');
        document.body.classList.add('loaded');
        
        // Trigger initial animations
        if (typeof Animations !== 'undefined') {
            Animations.animatePageLoad();
        } else {
            // Fallback animation
            const animatedElements = document.querySelectorAll('[data-aos]');
            animatedElements.forEach((el, index) => {
                const delay = el.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    el.classList.add('aos-animate');
                }, 100 * index + parseFloat(delay) * 1000);
            });
        }
    }, 100);
    
    // Animate stats counters
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statValues.forEach(stat => observer.observe(stat));
    }
    
    console.log('KiwiTweaks - Enhanced system optimization tools initialized');
});

// Enhanced Mobile Menu with Accessibility
function initMobileMenu() {
    console.log('[MobileMenu] Initializing mobile menu...');
    
    const menuBtn = document.querySelector('.menu-btn'); // Changed from .mobile-menu-btn
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuBtn || !navLinks) {
        console.warn('[MobileMenu] Required elements not found. Looking for:', {
            menuBtn: '.menu-btn',
            navLinks: '.nav-links'
        });
        return;
    }
    const body = document.body;
    
    if (menuBtn && navLinks) {
        // Set initial ARIA attributes
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'main-navigation');
        navLinks.setAttribute('id', 'main-navigation');
        
        // Toggle menu function
        const toggleMenu = () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.style.overflow = !isExpanded ? 'hidden' : '';
            
            // Toggle body class for menu open state
            body.classList.toggle('menu-open', !isExpanded);
            
            // Focus management
            if (!isExpanded) {
                // Focus first focusable element in nav
                const firstNavItem = navLinks.querySelector('a, button');
                if (firstNavItem) firstNavItem.focus();
            }
        };
        
        // Toggle menu on button click
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                toggleMenu();
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu();
                menuBtn.focus();
            }
        });
        
        // Close menu when clicking on a nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) { // Only close on mobile
                    toggleMenu();
                }
            });
        });
    }
}

// Enhanced Smooth Scrolling with Offset and History
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                const menuBtn = document.querySelector('.mobile-menu-btn');
                if (menuBtn && menuBtn.classList.contains('active')) {
                    menuBtn.click();
                }
                
                // Calculate scroll position with offset for fixed header
                const headerHeight = document.querySelector('header').offsetHeight;
                const additionalOffset = parseInt(this.getAttribute('data-offset') || '0', 10);
                const targetPosition = targetElement.getBoundingClientRect().top + 
                                    window.pageYOffset - 
                                    headerHeight - 
                                    additionalOffset;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    location.hash = targetId;
                }
                
                // Focus the target element for accessibility
                setTimeout(() => {
                    if (!targetElement.getAttribute('tabindex')) {
                        targetElement.setAttribute('tabindex', '-1');
                    }
                    targetElement.focus({ preventScroll: true });
                }, 1000);
            }
        });
    });
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView();
            }
        }
    });
}

// Enhanced Scroll Effects with Intersection Observer
function initScrollEffects() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');
    let lastScroll = 0;
    
    // Initialize Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Remove observer after animation
                if (entry.target.dataset.animateOnce !== 'false') {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right, .stagger-item, .feature-card, .pricing-card, .testimonial').forEach(el => {
        observer.observe(el);
    });
    
    // Enhanced header scroll effect
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class to header with threshold
        if (currentScroll > 10) {
            document.body.classList.add('scrolled');
            if (header) header.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
            if (header) header.classList.remove('scrolled');
        }
        
        // Hide header on scroll down, show on scroll up (only on desktop)
        if (window.innerWidth > 1024) {
            if (currentScroll > 100 && currentScroll > lastScroll && currentScroll - lastScroll > 5) {
                // Scrolling down
                if (header) header.style.transform = 'translateY(-100%)';
            } else if (currentScroll < lastScroll) {
                // Scrolling up
                if (header) header.style.transform = 'translateY(0)';
            }
        } else {
            if (header) header.style.transform = 'translateY(0)';
        }
        
        // Parallax effect for hero section
        if (heroSection) {
            const scrolled = currentScroll / (heroSection.offsetHeight * 0.5);
            heroSection.style.setProperty('--scroll-pos', Math.min(scrolled, 1));
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
    
    // Initial check for elements in viewport
    if (window.IntersectionObserver) {
        // Already handled by IntersectionObserver
    } else {
        // Fallback for browsers without IntersectionObserver
        animateOnScroll();
        window.addEventListener('scroll', animateOnScroll);
    }
}

// Initialize tooltips for interactive elements
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        // Create tooltip element
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.setAttribute('role', 'tooltip');
        
        // Position the tooltip
        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (element.offsetWidth / 2) - (tooltip.offsetWidth / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        };
        
        // Add tooltip to the DOM
        document.body.appendChild(tooltip);
        
        // Show/hide tooltip
        const showTooltip = () => {
            tooltip.classList.add('visible');
            updatePosition();
        };
        
        const hideTooltip = () => {
            tooltip.classList.remove('visible');
        };
        
        // Event listeners
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('blur', hideTooltip);
        
        // Update position on window resize
        window.addEventListener('resize', updatePosition);
    });
}

// Initialize animated counters
function initCounters() {
    const counterElements = document.querySelectorAll('.counter');
    if (!counterElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                animateCounter(entry.target);
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.5 });
    
    counterElements.forEach(counter => observer.observe(counter));
}

// Animate counter from 0 to target value
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count')) || 0;
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    const easeOutQuad = t => t * (2 - t);
    
    let frame = 0;
    const countTo = target;
    
    const counter = setInterval(() => {
        frame++;
        const progress = easeOutQuad(frame / totalFrames);
        const currentCount = Math.round(countTo * progress);
        
        if (element.getAttribute('data-suffix')) {
            element.textContent = currentCount + element.getAttribute('data-suffix');
        } else {
            element.textContent = currentCount;
        }
        
        if (frame === totalFrames) {
            clearInterval(counter);
        }
    }, frameDuration);
}

// Initialize product showcase with interactive features and smooth animations
function initProductShowcase() {
    console.log('[ProductShowcase] Initializing product showcase...');
    
    const tabs = document.querySelectorAll('.product-tab');
    const panes = document.querySelectorAll('.product-pane');
    const tabsContainer = document.querySelector('.product-tabs');
    
    console.log(`[ProductShowcase] Found ${tabs.length} tabs and ${panes.length} panes`);
    
    if (!tabs.length || !panes.length || !tabsContainer) {
        console.warn('Product showcase elements not found');
        return;
    }
    
    // Create and style tab indicator if it doesn't exist
    let tabIndicator = document.querySelector('.tab-indicator');
    if (!tabIndicator) {
        tabIndicator = document.createElement('div');
        tabIndicator.className = 'tab-indicator';
        tabsContainer.appendChild(tabIndicator);
    }
    
    // Set initial active tab (first one or the one with active class)
    let activeTab = document.querySelector('.product-tab.active');
    if (!activeTab && tabs.length > 0) {
        activeTab = tabs[0];
        activeTab.classList.add('active');
        // Ensure corresponding pane is active
        const tabId = activeTab.getAttribute('data-tab');
        document.querySelector(`#${tabId}`)?.classList.add('active');
    }
    
    // Set initial tab indicator position
    function updateTabIndicator(tab) {
        if (!tab) return;
        const tabRect = tab.getBoundingClientRect();
        const containerRect = tabsContainer.getBoundingClientRect();
        const indicatorWidth = tabRect.width * 0.8;
        
        tabIndicator.style.width = `${indicatorWidth}px`;
        tabIndicator.style.left = `${tabRect.left - containerRect.left + (tabRect.width - indicatorWidth) / 2}px`;
    }
    
    // Handle tab click
    function handleTabClick(e) {
        e.preventDefault();
        const tab = e.currentTarget;
        if (tab.classList.contains('active')) return;
        
        setActiveTab(tab, true);
    }
    
    // Add click event listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    // Update tab indicator on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const activeTab = document.querySelector('.product-tab.active');
            if (activeTab) updateTabIndicator(activeTab);
        }, 250);
    });
    
    // Initialize tab indicator position
    const currentActiveTab = document.querySelector('.product-tab.active');
    if (currentActiveTab) {
        updateTabIndicator(currentActiveTab);
    }
    
    // Set active tab and show corresponding pane
    function setActiveTab(tab, animate = true) {
        if (!tab) return;
        
        const tabId = tab.getAttribute('data-tab');
        if (!tabId) return;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update tab indicator
        updateTabIndicator(tab);
        
        // Show corresponding pane with animation
        panes.forEach(pane => {
            if (pane.id === tabId) {
                // Hide all panes first
                panes.forEach(p => {
                    p.style.opacity = '0';
                    p.style.pointerEvents = 'none';
                    p.style.transform = 'translateY(10px)';
                    p.classList.remove('active');
                });
                
                // Show new active pane with animation
                pane.style.display = 'block';
                pane.style.opacity = '0';
                pane.style.transform = 'translateY(0)';
                pane.classList.add('active');
                
                // Trigger reflow
                void pane.offsetWidth;
                
                // Animate in
                pane.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                setTimeout(() => {
                    pane.style.opacity = '1';
                    pane.style.pointerEvents = 'auto';
                    pane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    }
    
    // Set initial active tab
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        const activePane = document.getElementById(tabId);
        
        if (activePane) {
            // Show active pane
            activePane.style.display = 'block';
            activePane.style.opacity = '1';
            activePane.style.pointerEvents = 'auto';
            activePane.style.transform = 'translateY(0)';
            
            // Position indicator
            const tabRect = activeTab.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();
            const indicatorWidth = tabRect.width * 0.8;
            
            tabIndicator.style.width = `${indicatorWidth}px`;
            tabIndicator.style.left = `${tabRect.left - containerRect.left + (tabRect.width - indicatorWidth) / 2}px`;
            
            // Hide other panes
            panes.forEach(pane => {
                if (pane !== activePane) {
                    pane.style.display = 'none';
                    pane.style.opacity = '0';
                    pane.style.pointerEvents = 'none';
                }
            });
        }
    }
    
    // Add click event to tabs with debounce
    let isAnimating = false;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (isAnimating || tab.classList.contains('active')) return;
            
            isAnimating = true;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the target pane
            const tabId = tab.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            const currentPane = document.querySelector('.product-pane.active');
            
            if (targetPane) {
                // Hide current pane
                if (currentPane) {
                    currentPane.style.opacity = '0';
                    currentPane.style.transform = 'translateY(10px)';
                    currentPane.style.pointerEvents = 'none';
                    
                    // After fade out, hide it and show new one
                    setTimeout(() => {
                        currentPane.style.display = 'none';
                        currentPane.classList.remove('active');
                        
                        // Show new pane
                        targetPane.style.display = 'block';
                        targetPane.style.opacity = '0';
                        targetPane.style.transform = 'translateY(20px)';
                        targetPane.classList.add('active');
                        
                        // Trigger reflow
                        void targetPane.offsetWidth;
                        
                        // Animate in
                        targetPane.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                        targetPane.style.opacity = '1';
                        targetPane.style.transform = 'translateY(0)';
                        targetPane.style.pointerEvents = 'auto';
                        
                        // Update tab indicator position
                        const tabRect = tab.getBoundingClientRect();
                        const containerRect = tabsContainer.getBoundingClientRect();
                        const indicatorWidth = tabRect.width * 0.8;
                        
                        tabIndicator.style.width = `${indicatorWidth}px`;
                        tabIndicator.style.left = `${tabRect.left - containerRect.left + (tabRect.width - indicatorWidth) / 2}px`;
                        
                        isAnimating = false;
                    }, 300);
                }
            }
        });
        
        // Add hover effects
        tab.addEventListener('mouseenter', () => {
            if (!tab.classList.contains('active')) {
                tab.style.transform = 'translateY(-3px)';
            }
        });
        
        tab.addEventListener('mouseleave', () => {
            tab.style.transform = '';
        });
    });
    
    // Initialize 3D product viewer if available
    init3DProductViewer();
    
    // Auto-rotate through tabs (optional)
    let currentTabIndex = 0;
    const autoRotateInterval = setInterval(() => {
        currentTabIndex = (currentTabIndex + 1) % tabs.length;
        setActiveTab(tabs[currentTabIndex]);
    }, 8000);
    
    // Pause auto-rotate on hover
    const showcase = document.querySelector('.product-showcase');
    if (showcase) {
        showcase.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
    }
}

// Initialize 3D product viewer for product showcase
function init3DProductViewer() {
    const productViewer = document.querySelector('.product-3d-viewer');
    if (!productViewer || !window.THREE) return;
    
    // Implementation for 3D product viewer
    // This would be similar to init3DVisualization but for product models
    console.log('3D Product Viewer initialized');
}

// Fallback animation for scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial, .counter');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Cookie Consent
function initCookieConsent() {
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const settingsBtn = document.getElementById('cookie-settings');
    
    // Check if user has already made a choice
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        return;
    }
    
    // Show cookie consent after a delay
    setTimeout(() => {
        cookieConsent.classList.add('show');
    }, 2000);
    
    // Handle accept button
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.remove('show');
            // Add your analytics/tracking code here
        });
    }
    
    // Handle settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            alert('Cookie settings would open here');
            // Implement your cookie settings modal
        });
    }
}

// 3D Hero Visualization with Three.js
function init3DHeroVisualization() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    
    const posArray = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    
    // Create particles in a sphere
    for (let i = 0; i < particleCount * 3; i++) {
        const radius = Math.random() * 5 + 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i * 3 + 2] = radius * Math.cos(phi);
        
        // Color variation
        colorsArray[i * 3] = 0.5 + Math.random() * 0.5;     // R
        colorsArray[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
        colorsArray[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    // Points
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Camera position
    camera.position.z = 5;
    
    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;
    
    // Handle mouse move
    const handleMouseMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Rotate particles
        particlesMesh.rotation.x = mouseY * 0.2;
        particlesMesh.rotation.y = mouseX * 0.2;
        
        // Pulsing effect
        const scale = 1 + Math.sin(elapsedTime * 0.5) * 0.1;
        particlesMesh.scale.set(scale, scale, scale);
        
        // Render
        renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
    };
}

// 3D Visualization with Three.js
function init3DVisualization() {
    const visual3d = document.querySelector('.visual-3d');
    if (!visual3d || !window.THREE) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, visual3d.clientWidth / visual3d.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(visual3d.clientWidth, visual3d.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    visual3d.appendChild(renderer.domElement);
    
    // Create a 3D object (kiwi fruit)
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x8bc34a,
        shininess: 100,
        flatShading: true
    });
    
    const kiwi = new THREE.Mesh(geometry, material);
    scene.add(kiwi);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Position camera
    camera.position.z = 7;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        kiwi.rotation.x += 0.005;
        kiwi.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = visual3d.clientWidth / visual3d.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(visual3d.clientWidth, visual3d.clientHeight);
    });
    
    animate();
}

// Testimonials Slider
function initTestimonials() {
    const testimonials = [
        {
            quote: "KiwiTweaks gave my old gaming rig new life! I'm getting 30% more FPS in all my games.",
            author: "Alex M.",
            role: "Competitive Gamer"
        },
        {
            quote: "The difference is night and day. My system runs cooler and faster than ever before.",
            author: "Sarah K.",
            role: "Streamer"
        },
        {
            quote: "Best optimization tool I've used. The premium version is worth every penny.",
            author: "James L.",
            role: "Game Developer"
        }
    ];
    
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;
    
    // Clear the default testimonial
    slider.innerHTML = '';
    
    // Add all testimonials to the slider
    testimonials.forEach((testimonial, index) => {
        const testimonialElement = document.createElement('div');
        testimonialElement.className = 'testimonial';
        testimonialElement.style.opacity = index === 0 ? '1' : '0';
        testimonialElement.style.transform = index === 0 ? 'translateY(0)' : 'translateY(20px)';
        testimonialElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        testimonialElement.style.position = 'absolute';
        testimonialElement.style.width = '100%';
        
        testimonialElement.innerHTML = `
            <div class="testimonial-content">
                <p>"${testimonial.quote}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="author-info">
                        <h4>${testimonial.author}</h4>
                        <span>${testimonial.role}</span>
                    </div>
                </div>
            </div>
        `;
        
        slider.appendChild(testimonialElement);
    });
    
    // Auto-rotate testimonials
    let currentIndex = 0;
    const testimonialElements = document.querySelectorAll('.testimonial');
    
    function showNextTestimonial() {
        // Hide current testimonial
        testimonialElements[currentIndex].style.opacity = '0';
        testimonialElements[currentIndex].style.transform = 'translateY(20px)';
        
        // Move to next testimonial
        currentIndex = (currentIndex + 1) % testimonials.length;
        
        // Show next testimonial
        setTimeout(() => {
            testimonialElements[currentIndex].style.opacity = '1';
            testimonialElements[currentIndex].style.transform = 'translateY(0)';
        }, 500);
    }
    
    // Change testimonial every 5 seconds
    setInterval(showNextTestimonial, 5000);
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;
    
    let mouseX = 0, mouseY = 0;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    
    // Update mouse position
    const updateMousePosition = (e) => {
        mouseX = (e.clientX / windowWidth - 0.5) * 2;
        mouseY = (e.clientY / windowHeight - 0.5) * 2;
    };
    
    // Apply parallax effect
    const applyParallax = () => {
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.1;
            const x = mouseX * 20 * speed;
            const y = -mouseY * 20 * speed;
            
            element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        
        requestAnimationFrame(applyParallax);
    };
    
    // Handle window resize
    const handleResize = () => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    };
    
    // Add event listeners
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    applyParallax();
    
    // Cleanup
    return () => {
        window.removeEventListener('mousemove', updateMousePosition);
        window.removeEventListener('resize', handleResize);
    };
}

// Initialize AOS (Animate On Scroll)
function initAOS() {
    // You can add AOS initialization here if you want to use the AOS library
    // For now, we're using custom animations
}

// Add loading class to body and remove when everything is loaded
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add animation classes after a short delay to ensure smooth transitions
    setTimeout(() => {
        document.querySelectorAll('.feature-card, .pricing-card, .testimonial').forEach((el, index) => {
            el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });
    }, 100);
});
