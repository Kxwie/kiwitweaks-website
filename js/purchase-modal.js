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
        lastError: null
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

                    <!-- Email Collection Step -->
                    <div id="step-email" class="modal-step">
                        <h3>Enter Your Email</h3>
                        <p>We'll send your license key to this address</p>
                        
                        <form id="email-form" onsubmit="submitEmail(event)">
                            <div class="form-group">
                                <input 
                                    type="email" 
                                    id="purchase-email"
                                    placeholder="your@email.com"
                                    autocomplete="email"
                                    required
                                    aria-label="Email address"
                                    aria-describedby="email-error"
                                >
                                <span class="field-error" id="email-error" role="alert"></span>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-outline" onclick="goBackToStart()">
                                    <i class="fas fa-arrow-left"></i> Back
                                </button>
                                <button type="submit" class="btn btn-primary" id="btn-email-submit">
                                    <span>Continue</span>
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Payment Method Step -->
                    <div id="step-payment" class="modal-step">
                        <h3>Choose Payment Method</h3>
                        <p>Select how you'd like to pay</p>
                        
                        <div class="payment-methods-grid">
                            <button class="payment-method-card" onclick="selectPayment('stripe')" data-method="stripe">
                                <i class="fab fa-stripe-s"></i>
                                <span>Credit Card</span>
                                <small>via Stripe</small>
                            </button>
                            <button class="payment-method-card" onclick="selectPayment('paypal')" data-method="paypal">
                                <i class="fab fa-paypal"></i>
                                <span>PayPal</span>
                                <small>Fast & Secure</small>
                            </button>
                        </div>
                        
                        <button class="btn btn-outline btn-block" onclick="goBackToEmail()">
                            <i class="fas fa-arrow-left"></i> Back
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
            if (user.email) {
                PurchaseState.userEmail = user.email;
            }
        } catch (error) {
            console.error('[Purchase] Session check failed:', error);
        }
    }

    function openModal(cartData = null) {
        const modal = document.getElementById('purchaseModal');
        if (!modal) return;

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
            if (PurchaseState.userEmail) {
                showStep('step-payment');
                announceToScreenReader('Choose payment method');
            } else {
                showStep('step-email');
                announceToScreenReader('Enter your email');
                setTimeout(() => {
                    const emailInput = document.getElementById('purchase-email');
                    if (emailInput) emailInput.focus();
                }, 100);
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

    window.goBackToStart = function() {
        showStep('step-initial');
    };

    window.goBackToEmail = function() {
        showStep('step-email');
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
