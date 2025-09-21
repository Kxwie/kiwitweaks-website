// Hero 3D Background Animation with Scroll Effects
class HeroBackground {
    constructor() {
        this.canvas = document.getElementById('hero-canvas');
        this.scrollElements = document.querySelectorAll('[data-scroll]');
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
        this.header = document.querySelector('.header');
        this.lastScrollY = 0;
        this.ticking = false;
        this.mouseX = 0;
        this.mouseY = 0;
        
        if (!this.canvas) return;

        // Initialize components
        this.setupCanvas();
        this.setupLights();
        this.createParticles();
        this.initScrollAnimations();
        this.initParallax();
        this.animate();
        this.addEventListeners();
    }

    setupCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Get WebGL context
        this.gl = this.canvas.getContext('webgl') || 
                 this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported in your browser');
            return;
        }

        // Set clear color to dark blue
        this.gl.clearColor(0.05, 0.1, 0.2, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    setupLights() {
        // Create shader program
        const vsSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying vec3 vColor;
            varying float vDist;
            
            void main() {
                vec4 mvPosition = uModelViewMatrix * vec4(aPosition, 1.0);
                vDist = length(mvPosition.xyz);
                vColor = aColor;
                gl_Position = uProjectionMatrix * mvPosition;
                gl_PointSize = 8.0 * (1.0 / -mvPosition.z);
            }
        `;

        const fsSource = `
            precision mediump float;
            
            varying vec3 vColor;
            varying float vDist;
            
            void main() {
                float alpha = smoothstep(0.0, 1.0, 1.0 - vDist * 0.001);
                gl_FragColor = vec4(vColor, alpha * 0.6);
                
                // Add glow effect
                float dist = length(gl_PointCoord - 0.5);
                float circle = smoothstep(0.5, 0.0, dist);
                gl_FragColor.a *= circle;
            }
        `;

        // Compile shaders
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        // Create shader program
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
            return;
        }
        
        // Get attribute and uniform locations
        this.attribLocations = {
            position: this.gl.getAttribLocation(this.shaderProgram, 'aPosition'),
            color: this.gl.getAttribLocation(this.shaderProgram, 'aColor')
        };
        
        this.uniformLocations = {
            projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix')
        };
        
        // Set up projection matrix
        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, 75 * Math.PI / 180, this.width / this.height, 0.1, 1000.0);
        
        // Set up camera
        this.cameraPosition = [0, 0, 5];
        this.modelViewMatrix = mat4.create();
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -10]);
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createParticles() {
        const particleCount = 2000;
        this.positions = [];
        this.colors = [];
        this.velocities = [];
        
        // Create particles in a spherical formation
        for (let i = 0; i < particleCount; i++) {
            // Random position in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5 + Math.random() * 10;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            this.positions.push(x, y, z);
            
            // Random color with blue/purple tint
            const r = 0.2 + Math.random() * 0.3;
            const g = 0.3 + Math.random() * 0.3;
            const b = 0.8 + Math.random() * 0.5;
            this.colors.push(r, g, b);
            
            // Random velocity
            this.velocities.push(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            );
        }
        
        // Create position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.DYNAMIC_DRAW);
        
        // Create color buffer
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
        
        // Store the number of points
        this.particleCount = particleCount;
    }

    updateParticles() {
        // Update particle positions
        for (let i = 0; i < this.positions.length; i += 3) {
            // Update position based on velocity
            this.positions[i] += this.velocities[i];
            this.positions[i + 1] += this.velocities[i + 1];
            this.positions[i + 2] += this.velocities[i + 2];
            
            // Bounce off the edges of the sphere
            const radius = Math.sqrt(
                this.positions[i] * this.positions[i] +
                this.positions[i + 1] * this.positions[i + 1] +
                this.positions[i + 2] * this.positions[i + 2]
            );
            
            if (radius > 15) {
                // Reverse velocity when hitting the edge
                this.velocities[i] *= -0.5;
                this.velocities[i + 1] *= -0.5;
                this.velocities[i + 2] *= -0.5;
            }
        }
        
        // Update the position buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.positions));
    }

    render() {
        if (!this.gl) return;
        
        // Clear the canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Update camera position based on mouse movement
        const time = Date.now() * 0.001;
        const x = Math.sin(time * 0.2) * 2;
        const y = Math.cos(time * 0.1) * 2;
        
        // Update model view matrix
        mat4.identity(this.modelViewMatrix);
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, -15]);
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, time * 0.1);
        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, time * 0.05);
        
        // Update particles
        this.updateParticles();
        
        // Draw particles
        this.gl.useProgram(this.shaderProgram);
        
        // Set up position attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            this.attribLocations.position,
            3,          // 3 components per iteration
            this.gl.FLOAT, // the data is 32bit floats
            false,      // don't normalize the data
            0,          // stride (0 = move forward size*sizeof(type) each iteration)
            0           // offset
        );
        this.gl.enableVertexAttribArray(this.attribLocations.position);
        
        // Set up color attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            this.attribLocations.color,
            3,          // 3 components per iteration
            this.gl.FLOAT, // the data is 32bit floats
            false,      // don't normalize the data
            0,          // stride (0 = move forward size*sizeof(type) each iteration)
            0           // offset
        );
        this.gl.enableVertexAttribArray(this.attribLocations.color);
        
        // Set the uniforms
        this.gl.uniformMatrix4fv(
            this.uniformLocations.projectionMatrix,
            false,
            this.projectionMatrix
        );
        this.gl.uniformMatrix4fv(
            this.uniformLocations.modelViewMatrix,
            false,
            this.modelViewMatrix
        );
        
        // Draw the points
        this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
    }

    animate() {
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.gl.viewport(0, 0, this.width, this.height);
        mat4.perspective(this.projectionMatrix, 75 * Math.PI / 180, this.width / this.height, 0.1, 1000.0);

        this.addEventListeners();
        this.initStats();
        this.initScrollAnimations();
        this.initParallax();
        this.animate();
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
            });
        }, { threshold: 0.5 });

        statValues.forEach(stat => observer.observe(stat));
    }

    animateValue(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const isDecimal = element.getAttribute('data-count').includes('.');
        const duration = 2000; // 2 seconds
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const easedProgress = 1 - Math.pow(1 - progress, 4);
            
            let currentValue = start + (target - start) * easedProgress;
            
            if (isDecimal) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// Initialize the hero background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load gl-matrix library if not already loaded
    if (typeof mat4 === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js';
        script.onload = () => new HeroBackground();
        document.head.appendChild(script);
    } else {
        new HeroBackground();
    }
    
    // Smooth scroll for anchor links
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
});
