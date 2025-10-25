/**
 * Enhanced Purchase Modal System v2.0
 * ✅ Loading states & disabled buttons
 * ✅ Modern error handling UI
 * ✅ Inline email collection
 * ✅ Network error handling with retry
 * ✅ Cart integration
 * ✅ Accessibility (ARIA, keyboard nav)
 * ✅ State management
 */

(function() {
    'use strict';

    // Global state management
    const PurchaseState = {
        isProcessing: false,
        currentStep: 'initial',
        selectedPlan: 'premium',
        userEmail: null,
        cartData: null,
        retryCount: 0,
        maxRetries: 3,
        lastError: null,
        isAuthenticated: false
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only load purchase modal on index page, not on auth or legal pages
        const excludedPages = ['auth.html', 'privacy-policy.html', 'user-agreement.html', 'refund-policy.html'];
        const currentPath = window.location.pathname;
        
        if (excludedPages.some(page => currentPath.includes(page))) {
            return; // Don't load modal on excluded pages
        }
        
        createPurchaseModal();
        initPurchaseModal();
    });

    function createPurchaseModal() {
        const modal = document.createElement('div');
        modal.id = 'purchaseModal';
        modal.className = 'purchase-modal-overlay';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        modal.innerHTML = `
            <div class="purchase-modal">
                <button class="modal-close" id="closeModal" aria-label="Close purchase modal">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Screen Reader Announcements -->
                <div aria-live="polite" aria-atomic="true" class="sr-only" id="modal-status"></div>
                
                <div class="purchase-modal-content">
                    <div class="purchase-modal-header">
                        <i class="fas fa-kiwi-bird"></i>
                        <h2 id="modal-title">Get KiwiTweaks Premium</h2>
                        <p>Unlock the full potential of your gaming PC</p>
                    </div>

                    <!-- Initial Step -->
                    <div id="step-initial" class="modal-step active">
                        <div class="product-price-box">
                            <span class="price-label">One-time payment</span>
                            <span class="price-amount">$29.99</span>
                        </div>
                        
                        <div class="pricing-comparison">
                            <a href="https://discord.com/channels/1326296916719566982/1335208265679900754" 
                               class="btn btn-outline" 
                               target="_blank" 
                               rel="noopener noreferrer">
                                <i class="fas fa-download"></i>
                                Get Free Version
                            </a>
                            <button class="btn btn-primary" id="btn-purchase-start" onclick="startPurchaseFlow()">
                                <i class="fas fa-shopping-cart"></i>
                                <span>Purchase Premium</span>
                            </button>
                        </div>

                        <div class="payment-info">
                            <h4><i class="fas fa-lock"></i> Secure Payment</h4>
                            <div class="payment-methods">
                                <i class="fab fa-cc-visa"></i>
                                <i class="fab fa-cc-mastercard"></i>
                                <i class="fab fa-cc-paypal"></i>
                            </div>
                        </div>

                        <div class="guarantee-badge">
                            <i class="fas fa-shield-alt"></i>
                            <div>
                                <h4>30-Day Money Back Guarantee</h4>
                                <p>Try risk-free with our full refund policy</p>
                            </div>
                        </div>
                    </div>

                    <!-- Authentication Step (Login/Signup) -->
                    <div id="step-auth" class="modal-step">
                        <h3>Sign In or Create Account</h3>
                        <p>You need an account to purchase KiwiTweaks Premium</p>
                        
                        <!-- Auth Tabs -->
                        <div class="auth-tabs">
                            <button class="auth-tab active" onclick="switchAuthTab('login')" data-tab="login">
                                Sign In
                            </button>
                            <button class="auth-tab" onclick="switchAuthTab('signup')" data-tab="signup">
                                Create Account
                            </button>
                        </div>
                        
                        <!-- Login Form -->
                        <div id="auth-login" class="auth-form-container active">
                            <form id="login-form" onsubmit="handleModalLogin(event)">
                                <div class="form-group">
                                    <label for="login-email">Email</label>
                                    <input 
                                        type="email" 
                                        id="login-email"
                                        placeholder="your@email.com"
                                        autocomplete="email"
                                        required
                                    >
                                    <span class="field-error" id="login-email-error"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="login-password">Password</label>
                                    <input 
                                        type="password" 
                                        id="login-password"
                                        placeholder="Enter your password"
                                        autocomplete="current-password"
                                        required
                                    >
                                    <span class="field-error" id="login-password-error"></span>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn btn-outline" onclick="goBackToStart()">
                                        <i class="fas fa-arrow-left"></i> Back
                                    </button>
                                    <button type="submit" class="btn btn-primary" id="btn-login-submit">
                                        <span>Sign In</span>
                                        <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Signup Form -->
                        <div id="auth-signup" class="auth-form-container">
                            <form id="signup-form" onsubmit="handleModalSignup(event)">
                                <div class="form-group">
                                    <label for="signup-username">Username</label>
                                    <input 
                                        type="text" 
                                        id="signup-username"
                                        placeholder="Choose a username"
                                        autocomplete="username"
                                        required
                                    >
                                    <span class="field-error" id="signup-username-error"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="signup-email">Email</label>
                                    <input 
                                        type="email" 
                                        id="signup-email"
                                        placeholder="your@email.com"
                                        autocomplete="email"
                                        required
                                    >
                                    <span class="field-error" id="signup-email-error"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="signup-password">Password</label>
                                    <input 
                                        type="password" 
                                        id="signup-password"
                                        placeholder="Min. 8 characters"
                                        autocomplete="new-password"
                                        required
                                        minlength="8"
                                    >
                                    <span class="field-error" id="signup-password-error"></span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="signup-confirm-password">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="signup-confirm-password"
                                        placeholder="Re-enter password"
                                        autocomplete="new-password"
                                        required
                                    >
                                    <span class="field-error" id="signup-confirm-error"></span>
                                </div>
                                
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" id="signup-terms" required>
                                        <span>I agree to the <a href="user-agreement.html" target="_blank">Terms of Service</a></span>
                                    </label>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="button" class="btn btn-outline" onclick="goBackToStart()">
                                        <i class="fas fa-arrow-left"></i> Back
                                    </button>
                                    <button type="submit" class="btn btn-primary" id="btn-signup-submit">
                                        <span>Create Account</span>
                                        <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Payment Method Step -->
                    <div id="step-payment" class="modal-step">
                        <h3>Choose Payment Method</h3>
                        <p>Select how you'd like to pay</p>
                        
                        <div class="payment-methods-grid">
                            <button class="payment-method-card" onclick="selectPaymentMethod('stripe')" data-method="stripe">
                                <i class="fab fa-stripe-s"></i>
                                <span>Credit Card</span>
                                <small>via Stripe</small>
                            </button>
                            <button class="payment-method-card" onclick="selectPaymentMethod('paypal')" data-method="paypal">
                                <i class="fab fa-paypal"></i>
                                <span>PayPal</span>
                                <small>Fast & Secure</small>
                            </button>
                        </div>
                        
                        <button class="btn btn-outline btn-block" onclick="goBackToStart()">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                    </div>
                    
                    <!-- Stripe Card Entry Step -->
                    <div id="step-stripe-entry" class="modal-step">
                        <h3>Enter Card Details</h3>
                        <p>Your payment is secured by Stripe</p>
                        
                        <div class="payment-summary">
                            <div class="summary-item">
                                <span>KiwiTweaks Premium</span>
                                <span>$29.99</span>
                            </div>
                            <div class="summary-total">
                                <span>Total</span>
                                <span>$29.99</span>
                            </div>
                        </div>
                        
                        <div id="stripe-card-element" class="stripe-element">
                            <!-- Stripe card element will be mounted here -->
                        </div>
                        <div id="stripe-card-errors" class="field-error" role="alert"></div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="goBackToPaymentMethod()">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-stripe-pay" onclick="processStripeCardPayment()">
                                <i class="fas fa-lock"></i>
                                <span>Pay $29.99</span>
                            </button>
                        </div>
                        
                        <div class="payment-security-note">
                            <i class="fas fa-shield-alt"></i>
                            <span>256-bit SSL encrypted payment</span>
                        </div>
                    </div>
                    
                    <!-- PayPal Payment Step -->
                    <div id="step-paypal-entry" class="modal-step">
                        <h3>Pay with PayPal</h3>
                        <p>Complete your payment securely through PayPal</p>
                        
                        <div class="payment-summary">
                            <div class="summary-item">
                                <span>KiwiTweaks Premium</span>
                                <span>$29.99</span>
                            </div>
                            <div class="summary-total">
                                <span>Total</span>
                                <span>$29.99</span>
                            </div>
                        </div>
                        
                        <div id="paypal-button-container" class="paypal-button-wrapper">
                            <!-- PayPal buttons will be rendered here -->
                        </div>
                        
                        <button class="btn btn-outline btn-block" onclick="goBackToPaymentMethod()">
                            <i class="fas fa-arrow-left"></i> Back to Payment Methods
                        </button>
                    </div>

                    <!-- Processing Step -->
                    <div id="step-processing" class="modal-step">
                        <div class="processing-state">
                            <div class="spinner-large"></div>
                            <h3 id="processing-title">Processing...</h3>
                            <p id="processing-message">Please wait</p>
                        </div>
                    </div>

                    <!-- Error Display -->
                    <div id="error-display" class="error-container" style="display: none;" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3 id="error-title">Error</h3>
                        <p id="error-message">Something went wrong</p>
                        <div class="error-actions">
                            <button class="btn btn-outline" onclick="closeError()">Close</button>
                            <button class="btn btn-primary" id="btn-retry" onclick="retryPayment()">
                                <i class="fas fa-redo"></i> Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append to body - it will be hidden by CSS
        document.body.appendChild(modal);
        console.log('[Purchase Modal] Modal created and hidden');
    }

    function initPurchaseModal() {
        const modal = document.getElementById('purchaseModal');
        const closeBtn = document.getElementById('closeModal');

        // Open modal triggers
        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('[data-purchase-modal]');
            if (trigger) {
                e.preventDefault();
                openModal();
            }
        });

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click (unless processing)
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal && !PurchaseState.isProcessing) {
                    closeModal();
                }
            });
        }

        // Close on Escape key (unless processing)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active') && !PurchaseState.isProcessing) {
                closeModal();
            }
        });

        // Check for existing user session
        checkUserSession();
    }

    function checkUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');
            
            // Check if user has valid session with token
            if (user.email && token) {
                PurchaseState.userEmail = user.email;
                PurchaseState.isAuthenticated = true;
                console.log('[Purchase] User authenticated:', user.email);
            } else {
                PurchaseState.isAuthenticated = false;
                console.log('[Purchase] User not authenticated');
            }
        } catch (error) {
            console.error('[Purchase] Session check failed:', error);
            PurchaseState.isAuthenticated = false;
        }
    }
    
    /**
     * Check if user is authenticated and redirect to auth if not
     */
    function requireAuthentication() {
        if (!PurchaseState.isAuthenticated) {
            // Save current page for redirect after login
            sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
            sessionStorage.setItem('redirectAction', 'purchase');
            
            // Show message and redirect
            if (confirm('You need to create an account or log in to make a purchase. Would you like to go to the login page?')) {
                window.location.href = 'auth.html';
            }
            return false;
        }
        return true;
    }

    function openModal(cartData = null) {
        const modal = document.getElementById('purchaseModal');
        if (!modal) return;

        // Re-check authentication status when modal opens
        checkUserSession();

        if (cartData) {
            PurchaseState.cartData = cartData;
        }

        PurchaseState.currentStep = 'initial';
        showStep('step-initial');
        hideError();

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus management
        setTimeout(() => {
            const firstButton = modal.querySelector('button:not([disabled])');
            if (firstButton) firstButton.focus();
        }, 300);

        announceToScreenReader('Purchase modal opened');
    }

    function closeModal() {
        if (PurchaseState.isProcessing) {
            if (!confirm('Payment in progress. Are you sure you want to cancel?')) {
                return;
            }
        }

        const modal = document.getElementById('purchaseModal');
        if (!modal) return;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        setTimeout(() => {
            PurchaseState.isProcessing = false;
            PurchaseState.currentStep = 'initial';
            showStep('step-initial');
        }, 300);
    }

    function showStep(stepId) {
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });

        const targetStep = document.getElementById(stepId);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    // Navigation functions
    window.startPurchaseFlow = function() {
        const btn = document.getElementById('btn-purchase-start');
        if (PurchaseState.isProcessing) return;

        setButtonLoading(btn, true);

        setTimeout(() => {
            // Check if user is authenticated
            if (PurchaseState.isAuthenticated) {
                // User is authenticated, go to payment method selection
                showStep('step-payment');
                announceToScreenReader('Choose payment method');
            } else {
                // User not authenticated, show login/signup
                showStep('step-auth');
                announceToScreenReader('Sign in or create an account');
            }
            setButtonLoading(btn, false);
        }, 300);
    };

    window.submitEmail = function(event) {
        event.preventDefault();

        const emailInput = document.getElementById('purchase-email');
        const submitBtn = document.getElementById('btn-email-submit');
        const errorDisplay = document.getElementById('email-error');

        if (!emailInput || !submitBtn) return;

        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            showFieldError(errorDisplay, 'Please enter a valid email');
            emailInput.setAttribute('aria-invalid', 'true');
            return;
        }

        hideFieldError(errorDisplay);
        emailInput.setAttribute('aria-invalid', 'false');
        setButtonLoading(submitBtn, true);

        setTimeout(() => {
            PurchaseState.userEmail = email;
            showStep('step-payment');
            announceToScreenReader('Email confirmed. Choose payment method');
            setButtonLoading(submitBtn, false);
        }, 300);
    };

    window.selectPayment = async function(method) {
        if (PurchaseState.isProcessing) return;

        PurchaseState.isProcessing = true;
        showStep('step-processing');

        const title = document.getElementById('processing-title');
        const message = document.getElementById('processing-message');

        if (title) title.textContent = method === 'stripe' ? 'Redirecting to Stripe...' : 'Loading PayPal...';
        if (message) message.textContent = 'Please wait...';

        announceToScreenReader('Processing payment');

        try {
            if (method === 'stripe') {
                await processStripePayment();
            } else {
                await processPayPalPayment();
            }
        } catch (error) {
            PurchaseState.isProcessing = false;
            handlePaymentError(error);
        }
    };

    // Auth tab switching
    window.switchAuthTab = function(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const containers = document.querySelectorAll('.auth-form-container');
        
        tabs.forEach(t => t.classList.remove('active'));
        containers.forEach(c => c.classList.remove('active'));
        
        const selectedTab = document.querySelector(`[data-tab="${tab}"]`);
        const selectedContainer = document.getElementById(`auth-${tab}`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContainer) selectedContainer.classList.add('active');
    };

    // Handle login in modal
    window.handleModalLogin = async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('btn-login-submit');
        
        setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store auth data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Update state
                PurchaseState.isAuthenticated = true;
                PurchaseState.userEmail = data.user.email;
                
                // Show success and proceed to payment
                showStep('step-payment');
                announceToScreenReader('Login successful. Choose payment method');
            } else {
                showFieldError(document.getElementById('login-password-error'), data.error || 'Login failed');
            }
        } catch (error) {
            showFieldError(document.getElementById('login-password-error'), 'Connection error. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    };

    // Handle signup in modal
    window.handleModalSignup = async function(event) {
        event.preventDefault();
        
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const termsAccepted = document.getElementById('signup-terms').checked;
        const submitBtn = document.getElementById('btn-signup-submit');
        
        // Validation
        if (password !== confirmPassword) {
            showFieldError(document.getElementById('signup-confirm-error'), 'Passwords do not match');
            return;
        }
        
        if (!termsAccepted) {
            showFieldError(document.getElementById('signup-confirm-error'), 'Please accept Terms of Service');
            return;
        }
        
        setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store auth data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Update state
                PurchaseState.isAuthenticated = true;
                PurchaseState.userEmail = data.user.email;
                
                // Show success and proceed to payment
                showStep('step-payment');
                announceToScreenReader('Account created successfully. Choose payment method');
            } else {
                showFieldError(document.getElementById('signup-confirm-error'), data.error || 'Registration failed');
            }
        } catch (error) {
            showFieldError(document.getElementById('signup-confirm-error'), 'Connection error. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    };

    // Select payment method and show entry form
    window.selectPaymentMethod = async function(method) {
        if (PurchaseState.isProcessing) return;
        
        PurchaseState.selectedPaymentMethod = method;
        
        if (method === 'stripe') {
            showStep('step-stripe-entry');
            // Initialize Stripe Elements
            await initializeStripeElements();
        } else if (method === 'paypal') {
            showStep('step-paypal-entry');
            // Initialize PayPal buttons
            await initializePayPalButtons();
        }
    };

    window.goBackToStart = function() {
        showStep('step-initial');
    };

    window.goBackToPaymentMethod = function() {
        showStep('step-payment');
    };

    window.closeError = function() {
        hideError();
        showStep('step-payment');
    };

    window.retryPayment = function() {
        hideError();
        PurchaseState.retryCount++;
        showStep('step-payment');
    };

    // Expose functions globally
    window.openPurchaseModal = openModal;
    window.closePurchaseModal = closeModal;
})();

/**
 * Process Stripe payment with retry and error handling
 */
async function processStripePayment(retryAttempt = 0) {
    try {
        if (!navigator.onLine) {
            throw new Error('OFFLINE');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('/api/payment/stripe-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: PurchaseState.userEmail,
                plan: PurchaseState.selectedPlan,
                cartData: PurchaseState.cartData
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 429) throw new Error('RATE_LIMITED');
            throw new Error(`HTTP_${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('INVALID_RESPONSE');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('TIMEOUT');
        }

        if (retryAttempt < PurchaseState.maxRetries && shouldRetry(error)) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));
            return processStripePayment(retryAttempt + 1);
        }

        throw error;
    }
}

/**
 * Process PayPal payment with retry and error handling
 */
async function processPayPalPayment(retryAttempt = 0) {
    try {
        if (!navigator.onLine) {
            throw new Error('OFFLINE');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('/api/payment/paypal-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: PurchaseState.userEmail,
                plan: PurchaseState.selectedPlan,
                cartData: PurchaseState.cartData
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.orderId) {
            if (!window.paypal) {
                await loadPayPalSDK();
            }
            showPayPalCheckout(data.orderId);
        } else {
            throw new Error('INVALID_RESPONSE');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('TIMEOUT');
        }

        if (retryAttempt < PurchaseState.maxRetries && shouldRetry(error)) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));
            return processPayPalPayment(retryAttempt + 1);
        }

        throw error;
    }
}

/**
 * Load PayPal SDK
 */
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        const clientId = document.body.getAttribute('data-paypal-client-id') || 
                        'AfHir0qS1C-PrKUV2D1VcqAZ-JDTIA4KRpd40cdJkTojucgv40k-sfpnrpxJfoKKE9b5uszwJOk5qVfR';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.head.appendChild(script);
    });
}

/**
 * Show PayPal checkout
 */
function showPayPalCheckout(orderId) {
    const processingStep = document.getElementById('step-processing');
    if (!processingStep) return;

    processingStep.innerHTML = `
        <div class="paypal-checkout-container">
            <h3>Complete Payment with PayPal</h3>
            <div id="paypal-buttons-container"></div>
            <button class="btn btn-outline btn-sm" onclick="cancelPayPalPayment()">Cancel</button>
        </div>
    `;

    window.paypal.Buttons({
        createOrder: () => orderId,
        onApprove: async (data) => {
            showStep('step-processing');
            const title = document.getElementById('processing-title');
            const message = document.getElementById('processing-message');
            if (title) title.textContent = 'Confirming payment...';
            if (message) message.textContent = 'Please wait';

            try {
                const response = await fetch('/api/payment/paypal-capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: data.orderID })
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = `/success?order_id=${result.orderId || data.orderID}`;
                } else {
                    throw new Error('Payment confirmation failed');
                }
            } catch (error) {
                PurchaseState.isProcessing = false;
                handlePaymentError(error);
            }
        },
        onCancel: () => {
            PurchaseState.isProcessing = false;
            showStep('step-payment');
            announceToScreenReader('Payment cancelled');
        },
        onError: (err) => {
            PurchaseState.isProcessing = false;
            handlePaymentError(new Error('PayPal error: ' + err));
        }
    }).render('#paypal-buttons-container');
}

window.cancelPayPalPayment = function() {
    PurchaseState.isProcessing = false;
    showStep('step-payment');
};
