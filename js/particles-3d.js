// 3D Particle Background System
console.log('[Particles 3D] Initializing particle system...');

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.particleCount = 800; // Reduced from 1500
        this.mouse = { x: 0, y: 0 };
        this.initialized = false;
    }

    init() {
        if (this.initialized || typeof THREE === 'undefined') {
            console.warn('[Particles 3D] Three.js not loaded or already initialized');
            return;
        }

        try {
            // Create canvas for particles
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particles-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.zIndex = '1';
            this.canvas.style.pointerEvents = 'none';
            
            // Insert after header (in hero section)
            const header = document.querySelector('.header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(this.canvas, header.nextSibling);
            } else {
                document.body.insertBefore(this.canvas, document.body.firstChild);
            }

            // Setup Three.js scene
            this.scene = new THREE.Scene();
            
            // Setup camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = 50;

            // Setup renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Create particles
            this.createParticles();

            // Mouse move listener
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });

            // Window resize listener
            window.addEventListener('resize', () => this.onWindowResize());

            // Start animation
            this.animate();
            this.initialized = true;

            console.log('[Particles 3D] Particle system initialized successfully');
        } catch (error) {
            console.error('[Particles 3D] Error initializing particles:', error);
        }
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        // Primary color (purple)
        const color1 = new THREE.Color(0x8b5cf6);
        // Secondary color (blue)
        const color2 = new THREE.Color(0x6366f1);

        for (let i = 0; i < this.particleCount; i++) {
            // Position
            positions.push(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );

            // Color (mix between primary and secondary)
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors.push(mixedColor.r, mixedColor.g, mixedColor.b);

            // Size - Much smaller and more varied
            sizes.push(Math.random() * 0.8 + 0.2); // Reduced from 2.5 max to 1.0 max
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Create circular particle texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw a circular gradient
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create material with circular texture
        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.15,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            map: texture, // Add circular texture
            alphaTest: 0.01 // Remove square edges
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.particles) return;

        // Rotate particles very slowly for subtle effect
        this.particles.rotation.y += 0.0003;
        this.particles.rotation.x += 0.0002;

        // Move particles based on mouse
        const positions = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Add very subtle wave motion
            const time = Date.now() * 0.0001;
            positions[i + 1] += Math.sin(time + positions[i]) * 0.005; // Reduced from 0.01 to 0.005
            
            // Mouse interaction - much more subtle
            const dx = this.mouse.x * 3 - positions[i];
            const dy = this.mouse.y * 3 - positions[i + 1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 8) {
                positions[i] -= dx * 0.0003; // Reduced from 0.001 to 0.0003
                positions[i + 1] -= dy * 0.0003;
            }

            // Boundary check - wrap around
            if (positions[i] > 50) positions[i] = -50;
            if (positions[i] < -50) positions[i] = 50;
            if (positions[i + 1] > 50) positions[i + 1] = -50;
            if (positions[i + 1] < -50) positions[i + 1] = 50;
            if (positions[i + 2] > 50) positions[i + 2] = -50;
            if (positions[i + 2] < -50) positions[i + 2] = 50;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.initialized = false;
    }
}

// Initialize particle system when DOM is ready
let particleSystem = null;

function initParticles() {
    // Wait for Three.js to load
    if (typeof THREE !== 'undefined') {
        particleSystem = new ParticleSystem();
        particleSystem.init();
    } else {
        console.warn('[Particles 3D] Three.js not loaded, retrying...');
        setTimeout(initParticles, 500);
    }
}

// Auto-initialize after a delay to ensure Three.js is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initParticles, 100);
    });
} else {
    setTimeout(initParticles, 100);
}

// Export for manual control
if (typeof window !== 'undefined') {
    window.ParticleSystem3D = {
        init: initParticles,
        destroy: () => particleSystem && particleSystem.destroy()
    };
}
