/**
 * Authentication Module - REFACTORED VERSION
 * 
 * This module handles all authentication-related functionality including:
 * - Login and registration form management
 * - Password strength validation
 * - Form submission and API communication
 * - User feedback and notifications
 * 
 * @module js/auth-REFACTORED
 * @requires config/constants
 */

import { AUTH, UI_TIMINGS, API, ROUTES, STORAGE_KEYS, NOTIFICATION_TYPES } from '../config/constants.js';

(function() {
    'use strict';

    // ===================================================================
    // INITIALIZATION
    // ===================================================================

    /**
     * Initialize authentication module when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', initAuth);

    /**
     * Main initialization function
     * Sets up all authentication features
     */
    function initAuth() {
        initAuthSwitcher();
        initPasswordToggle();
        initPasswordStrength();
        initFormValidation();
        initFormSubmission();
    }

    // ===================================================================
    // AUTH FORM SWITCHING
    // ===================================================================

    /**
     * Initialize authentication form switcher
     * Allows switching between login and registration forms
     * 
     * @returns {void}
     */
    function initAuthSwitcher() {
        const switchLinks = document.querySelectorAll('.switch-auth');
        
        switchLinks.forEach(link => {
            link.addEventListener('click', handleAuthSwitch);
        });
    }

    /**
     * Handle authentication form switch
     * 
     * @param {Event} event - Click event
     * @returns {void}
     */
    function handleAuthSwitch(event) {
        event.preventDefault();
        
        const targetForm = this.getAttribute('data-target');
        const loginCard = document.querySelector('.login-card');
        const registerCard = document.querySelector('.register-card');
        
        if (targetForm === 'register') {
            loginCard.classList.remove('active');
            registerCard.classList.add('active');
        } else if (targetForm === 'login') {
            registerCard.classList.remove('active');
            loginCard.classList.add('active');
        }
    }

    // ===================================================================
    // PASSWORD VISIBILITY TOGGLE
    // ===================================================================

    /**
     * Initialize password visibility toggle buttons
     * Allows users to show/hide password text
     * 
     * @returns {void}
     */
    function initPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', handlePasswordToggle);
        });
    }

    /**
     * Handle password visibility toggle
     * 
     * @param {Event} event - Click event
     * @returns {void}
     */
    function handlePasswordToggle(event) {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');
        
        if (!input || !icon) return;
        
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
    }

    // ===================================================================
    // PASSWORD STRENGTH INDICATOR
    // ===================================================================

    /**
     * Initialize password strength indicator
     * Provides real-time feedback on password strength
     * 
     * @returns {void}
     */
    function initPasswordStrength() {
        const registerPassword = document.getElementById('registerPassword');
        const strengthBar = document.querySelector('.strength-bar');
        
        if (!registerPassword || !strengthBar) return;
        
        registerPassword.addEventListener('input', (event) => {
            const strength = calculatePasswordStrength(event.target.value);
            updateStrengthIndicator(strengthBar, strength);
        });
    }

    /**
     * Calculate password strength based on multiple criteria
     * Each criterion contributes to the overall strength score
     * 
     * @param {string} password - Password to evaluate
     * @returns {number} Strength score from 0-100
     * 
     * @example
     * calculatePasswordStrength('weak') // Returns 25
     * calculatePasswordStrength('Strong1!') // Returns 100
     */
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= AUTH.PASSWORD.MIN_LENGTH) {
            strength += AUTH.PASSWORD.STRENGTH_POINTS.LENGTH;
        }
        
        // Mixed case check
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
            strength += AUTH.PASSWORD.STRENGTH_POINTS.MIXED_CASE;
        }
        
        // Number check
        if (password.match(/\d/)) {
            strength += AUTH.PASSWORD.STRENGTH_POINTS.NUMBERS;
        }
        
        // Special character check
        if (password.match(/[^a-zA-Z\d]/)) {
            strength += AUTH.PASSWORD.STRENGTH_POINTS.SPECIAL_CHARS;
        }
        
        return strength;
    }

    /**
     * Update password strength visual indicator
     * 
     * @param {HTMLElement} strengthBar - Strength indicator element
     * @param {number} strength - Strength score (0-100)
     * @returns {void}
     */
    function updateStrengthIndicator(strengthBar, strength) {
        strengthBar.style.width = `${strength}%`;
        
        // Update color based on strength
        strengthBar.classList.remove('weak', 'medium', 'strong');
        
        if (strength < 50) {
            strengthBar.classList.add('weak');
        } else if (strength < 75) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
    }

    // ===================================================================
    // FORM VALIDATION
    // ===================================================================

    /**
     * Initialize real-time form validation
     * Provides immediate feedback on input errors
     * 
     * @returns {void}
     */
    function initFormValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', validateEmailInput);
        });
        
        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', validatePasswordInput);
        });
    }

    /**
     * Validate email input field
     * 
     * @param {Event} event - Blur event
     * @returns {boolean} True if valid, false otherwise
     */
    function validateEmailInput(event) {
        const input = event.target;
        const email = input.value.trim();
        
        if (!email) return false;
        
        const isValid = AUTH.EMAIL.REGEX.test(email);
        
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    /**
     * Validate password input field
     * 
     * @param {Event} event - Blur event
     * @returns {boolean} True if valid, false otherwise
     */
    function validatePasswordInput(event) {
        const input = event.target;
        const password = input.value;
        
        if (!password) return false;
        
        const isValid = password.length >= AUTH.PASSWORD.MIN_LENGTH;
        
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    // ===================================================================
    // FORM SUBMISSION
    // ===================================================================

    /**
     * Initialize form submission handlers
     * Sets up event listeners for login and registration forms
     * 
     * @returns {void}
     */
    function initFormSubmission() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegisterSubmit);
        }
    }

    /**
     * Handle login form submission
     * 
     * @param {Event} event - Submit event
     * @returns {Promise<void>}
     */
    async function handleLoginSubmit(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        // Validate inputs
        if (!validateLoginForm(email, password)) {
            return;
        }
        
        try {
            // Show loading state
            setButtonLoading(submitButton, true, 'Logging in...');
            
            // Attempt login
            const result = await login(email, password);
            
            // Store session
            storeSession(result.token, result.user);
            
            // Show success notification
            showNotification('Login successful!', NOTIFICATION_TYPES.SUCCESS);
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = ROUTES.HOME;
            }, UI_TIMINGS.TRANSITIONS.REDIRECT_DELAY);
            
        } catch (error) {
            // Show error notification
            showNotification(error.message, NOTIFICATION_TYPES.ERROR);
        } finally {
            // Restore button state
            setButtonLoading(submitButton, false, 'Login');
        }
    }

    /**
     * Handle registration form submission
     * 
     * @param {Event} event - Submit event
     * @returns {Promise<void>}
     */
    async function handleRegisterSubmit(event) {
        event.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAccepted = document.querySelector('input[name="terms"]').checked;
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        // Validate inputs
        if (!validateRegisterForm(username, email, password, confirmPassword, termsAccepted)) {
            return;
        }
        
        try {
            // Show loading state
            setButtonLoading(submitButton, true, 'Creating Account...');
            
            // Attempt registration
            const result = await register(username, email, password);
            
            // Store session
            storeSession(result.token, result.user);
            
            // Show success notification
            showNotification('Account created successfully!', NOTIFICATION_TYPES.SUCCESS);
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = ROUTES.HOME;
            }, UI_TIMINGS.TRANSITIONS.REDIRECT_DELAY);
            
        } catch (error) {
            // Show error notification
            showNotification(error.message, NOTIFICATION_TYPES.ERROR);
        } finally {
            // Restore button state
            setButtonLoading(submitButton, false, 'Create Account');
        }
    }

    // ===================================================================
    // VALIDATION FUNCTIONS
    // ===================================================================

    /**
     * Validate login form inputs
     * 
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {boolean} True if valid, false otherwise
     */
    function validateLoginForm(email, password) {
        if (!email || !password) {
            showNotification('Please fill in all fields', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        if (!AUTH.EMAIL.REGEX.test(email)) {
            showNotification('Please enter a valid email address', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        return true;
    }

    /**
     * Validate registration form inputs
     * 
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {string} password - Password
     * @param {string} confirmPassword - Password confirmation
     * @param {boolean} termsAccepted - Terms of service acceptance
     * @returns {boolean} True if valid, false otherwise
     */
    function validateRegisterForm(username, email, password, confirmPassword, termsAccepted) {
        if (!username || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        if (!AUTH.EMAIL.REGEX.test(email)) {
            showNotification('Please enter a valid email address', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        if (password.length < AUTH.PASSWORD.MIN_LENGTH) {
            showNotification(`Password must be at least ${AUTH.PASSWORD.MIN_LENGTH} characters`, NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        if (!termsAccepted) {
            showNotification('Please accept the Terms of Service', NOTIFICATION_TYPES.ERROR);
            return false;
        }
        
        return true;
    }

    // ===================================================================
    // API COMMUNICATION
    // ===================================================================

    /**
     * Authenticate user with email and password
     * 
     * @async
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{token: string, user: Object}>} Authentication result
     * @throws {Error} If authentication fails
     */
    async function login(email, password) {
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Login failed');
        }
        
        return data;
    }

    /**
     * Register new user account
     * 
     * @async
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Promise<{token: string, user: Object}>} Registration result
     * @throws {Error} If registration fails
     */
    async function register(username, email, password) {
        const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Registration failed');
        }
        
        return data;
    }

    // ===================================================================
    // SESSION MANAGEMENT
    // ===================================================================

    /**
     * Store user session in localStorage
     * 
     * @param {string} token - JWT authentication token
     * @param {Object} user - User data object
     * @returns {void}
     */
    function storeSession(token, user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }

    // ===================================================================
    // UI FEEDBACK
    // ===================================================================

    /**
     * Set button loading state
     * 
     * @param {HTMLButtonElement} button - Button element
     * @param {boolean} isLoading - Whether button is in loading state
     * @param {string} text - Button text to display
     * @returns {void}
     */
    function setButtonLoading(button, isLoading, text) {
        if (!button) return;
        
        button.disabled = isLoading;
        
        if (isLoading) {
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        } else {
            button.innerHTML = text;
        }
    }

    /**
     * Show notification to user
     * 
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @returns {void}
     * 
     * @example
     * showNotification('Login successful!', 'success');
     * showNotification('Invalid password', 'error');
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), UI_TIMINGS.NOTIFICATION.FADE_OUT_DURATION);
        }, UI_TIMINGS.NOTIFICATION.DISPLAY_DURATION);
    }
})();
