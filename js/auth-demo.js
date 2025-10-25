/**
 * Demo Authentication (Client-Side Only for Local Testing)
 * This is a mock version that works without a backend
 * Replace with auth.js when deploying to production
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initAuthSwitcher();
        initPasswordToggle();
        initPasswordStrength();
        initFormValidation();
    });

    // Switch between login and register forms
    function initAuthSwitcher() {
        const switchLinks = document.querySelectorAll('.switch-auth');
        
        switchLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target');
                
                const loginCard = document.querySelector('.login-card');
                const registerCard = document.querySelector('.register-card');
                
                if (target === 'register') {
                    loginCard.classList.remove('active');
                    registerCard.classList.add('active');
                } else if (target === 'login') {
                    registerCard.classList.remove('active');
                    loginCard.classList.add('active');
                }
            });
        });
    }

    // Toggle password visibility
    function initPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    // Password strength indicator
    function initPasswordStrength() {
        const registerPassword = document.getElementById('registerPassword');
        const strengthBar = document.querySelector('.strength-bar');
        
        if (!registerPassword || !strengthBar) return;
        
        registerPassword.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Calculate strength
            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
            if (password.match(/\d/)) strength += 25;
            if (password.match(/[^a-zA-Z\d]/)) strength += 25;
            
            strengthBar.style.width = strength + '%';
            
            // Update color based on strength
            if (strength <= 25) {
                strengthBar.style.background = '#ef4444';
            } else if (strength <= 50) {
                strengthBar.style.background = '#f59e0b';
            } else if (strength <= 75) {
                strengthBar.style.background = '#eab308';
            } else {
                strengthBar.style.background = '#10b981';
            }
        });
    }

    // Form validation
    function initFormValidation() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegister();
            });
        }
    }

    // DEMO: Mock login function
    function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // DEMO: Simulate API call
        showNotification('Demo Mode: Login simulated successfully!', 'success');
        
        // Create demo user data
        const demoUser = {
            email: email,
            username: email.split('@')[0],
            isPremium: false,
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        const demoToken = 'demo_token_' + Date.now();
        localStorage.setItem('authToken', demoToken);
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        // Redirect after success
        setTimeout(() => {
            const intendedDestination = sessionStorage.getItem('intendedDestination');
            const redirectAfterAuth = sessionStorage.getItem('redirectAfterAuth');
            
            if (intendedDestination === 'profile') {
                sessionStorage.removeItem('redirectAfterAuth');
                sessionStorage.removeItem('intendedDestination');
                window.location.href = 'profile.html';
            } else if (redirectAfterAuth) {
                sessionStorage.removeItem('redirectAfterAuth');
                window.location.href = redirectAfterAuth;
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }

    // DEMO: Mock register function
    function handleRegister() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAccepted = document.querySelector('input[name="terms"]').checked;
        
        // Validation
        if (!email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (!termsAccepted) {
            showNotification('Please accept the Terms of Service', 'error');
            return;
        }
        
        // DEMO: Simulate API call
        showNotification('Demo Mode: Account created successfully!', 'success');
        
        // Create demo user data
        const demoUser = {
            email: email,
            username: email.split('@')[0],
            isPremium: false,
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        const demoToken = 'demo_token_' + Date.now();
        localStorage.setItem('authToken', demoToken);
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        // Redirect after success
        setTimeout(() => {
            const intendedDestination = sessionStorage.getItem('intendedDestination');
            const redirectAfterAuth = sessionStorage.getItem('redirectAfterAuth');
            
            if (intendedDestination === 'profile') {
                sessionStorage.removeItem('redirectAfterAuth');
                sessionStorage.removeItem('intendedDestination');
                window.location.href = 'profile.html';
            } else if (redirectAfterAuth) {
                sessionStorage.removeItem('redirectAfterAuth');
                window.location.href = redirectAfterAuth;
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-size: 0.95rem;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Add animation styles
    if (!document.getElementById('auth-animations')) {
        const style = document.createElement('style');
        style.id = 'auth-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();
