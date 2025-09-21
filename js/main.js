// Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initMobileMenu();
    initSmoothScroll();
    initScrollEffects();
    initCookieConsent();
    init3DVisualization();
    initTestimonials();
    
    console.log('KiwiTweaks - System optimization tools initialized');
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Effects
function initScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class to header
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header on scroll down, show on scroll up
        if (currentScroll > 100 && currentScroll > lastScroll) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        
        // Animate elements on scroll
        animateOnScroll();
    });
    
    // Initial check for elements in viewport
    animateOnScroll();
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial');
    
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
