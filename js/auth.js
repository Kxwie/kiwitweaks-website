/**
 * Authentication Page Functionality
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

    async function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            // Call login API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('token', data.token); // Also store as 'token' for purchase modal
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showNotification('Login successful!', 'success');
                
                // Check if user should be redirected back to purchase flow
                const redirectAfterAuth = sessionStorage.getItem('redirectAfterAuth');
                const redirectAction = sessionStorage.getItem('redirectAction');
                
                setTimeout(() => {
                    if (redirectAction === 'purchase' && redirectAfterAuth) {
                        // Clear redirect data
                        sessionStorage.removeItem('redirectAfterAuth');
                        sessionStorage.removeItem('redirectAction');
                        
                        // Redirect back to original page
                        window.location.href = redirectAfterAuth;
                        
                        // After page loads, open purchase modal
                        setTimeout(() => {
                            if (window.openPurchaseModal) {
                                window.openPurchaseModal();
                            }
                        }, 500);
                    } else {
                        // Normal redirect to home page
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Connection error. Please try again.', 'error');
        }
    }

    async function handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAccepted = document.querySelector('input[name="terms"]').checked;
        
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
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
        
        try {
            // Call register API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('token', data.token); // Also store as 'token' for purchase modal
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showNotification('Account created successfully!', 'success');
                
                // Check if user should be redirected back to purchase flow
                const redirectAfterAuth = sessionStorage.getItem('redirectAfterAuth');
                const redirectAction = sessionStorage.getItem('redirectAction');
                
                setTimeout(() => {
                    if (redirectAction === 'purchase' && redirectAfterAuth) {
                        // Clear redirect data
                        sessionStorage.removeItem('redirectAfterAuth');
                        sessionStorage.removeItem('redirectAction');
                        
                        // Redirect back to original page
                        window.location.href = redirectAfterAuth;
                        
                        // After page loads, open purchase modal
                        setTimeout(() => {
                            if (window.openPurchaseModal) {
                                window.openPurchaseModal();
                            }
                        }, 500);
                    } else {
                        // Normal redirect to home page
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            showNotification('Connection error. Please try again.', 'error');
        }
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
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add animation styles
    const style = document.createElement('style');
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
})();
