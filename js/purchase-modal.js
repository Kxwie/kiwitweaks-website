/**
 * Purchase Modal Functionality
 */

(function() {
    'use strict';

    let selectedPlan = 'premium';

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
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'purchaseModal';
        modal.className = 'purchase-modal-overlay';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        // Build modal content using DOM methods (not innerHTML to avoid parsing issues)
        modal.innerHTML = `
            <div class="purchase-modal">
                <button class="modal-close" id="closeModal" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="purchase-modal-content">
                    <div class="purchase-modal-header">
                        <i class="fas fa-kiwi-bird"></i>
                        <h2>Get KiwiTweaks Premium</h2>
                        <p>Unlock the full potential of your gaming PC</p>
                    </div>

                    <div class="pricing-comparison">
                        <a href="https://discord.com/channels/1326296916719566982/1335208265679900754" 
                           class="btn btn-outline" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="margin-right: 1rem;">
                            <i class="fas fa-download"></i>
                            Get Free Version
                        </a>
                        <button class="btn btn-primary" onclick="handlePurchase('premium')">
                            <i class="fas fa-shopping-cart"></i>
                            Purchase Premium - $29.99
                        </button>
                    </div>

                    <div class="payment-info">
                        <h4><i class="fas fa-credit-card"></i> Secure Payment via Payhip</h4>
                        <div class="payment-methods">
                            <i class="fab fa-cc-visa"></i>
                            <i class="fab fa-cc-mastercard"></i>
                            <i class="fab fa-cc-paypal"></i>
                            <i class="fab fa-bitcoin"></i>
                        </div>
                    </div>

                    <div class="guarantee-badge">
                        <i class="fas fa-shield-alt"></i>
                        <div>
                            <h4>30-Day Money Back Guarantee</h4>
                            <p>Try KiwiTweaks risk-free. Get a full refund as long as you're within our refund requirements!</p>
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
        const pricingCards = document.querySelectorAll('.pricing-card');

        // Open modal triggers
        document.addEventListener('click', function(e) {
            // Check if clicked element or its parent is a purchase trigger
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

        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Pricing card selection
        pricingCards.forEach(card => {
            card.addEventListener('click', function() {
                pricingCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedPlan = this.getAttribute('data-plan');
            });
        });
    }

    function openModal() {
        const modal = document.getElementById('purchaseModal');
        if (modal) {
            // Simply add active class - CSS handles all display properties with !important
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        const modal = document.getElementById('purchaseModal');
        if (modal) {
            // Simply remove active class - CSS handles all display properties with !important
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Expose functions globally
    window.openPurchaseModal = openModal;
    window.closePurchaseModal = closeModal;
    window.handlePurchase = handlePurchase;
})();

/**
 * Handle purchase with Stripe or PayPal
 */
async function handlePurchase(plan) {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;
    
    if (!email) {
        // Prompt for email or redirect to login
        const userEmail = prompt('Please enter your email address:');
        if (!userEmail) return;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            alert('Please enter a valid email address');
            return;
        }
    }
    
    // Show payment method selection
    const paymentMethod = await showPaymentMethodSelection();
    
    if (paymentMethod === 'stripe') {
        await processStripePayment(email || userEmail, plan);
    } else if (paymentMethod === 'paypal') {
        await processPayPalPayment(email || userEmail, plan);
    }
}

/**
 * Show payment method selection dialog
 */
function showPaymentMethodSelection() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(20, 20, 35, 0.99) 100%);
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(139, 92, 246, 0.3);
            z-index: 10000;
            text-align: center;
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #ffffff; margin-bottom: 1.5rem;">Select Payment Method</h3>
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button id="stripeBtn" class="btn btn-primary" style="flex: 1;">
                    <i class="fab fa-cc-stripe"></i> Stripe
                </button>
                <button id="paypalBtn" class="btn btn-primary" style="flex: 1;">
                    <i class="fab fa-paypal"></i> PayPal
                </button>
            </div>
            <button id="cancelBtn" class="btn btn-outline">Cancel</button>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#stripeBtn').onclick = () => {
            document.body.removeChild(dialog);
            resolve('stripe');
        };
        
        dialog.querySelector('#paypalBtn').onclick = () => {
            document.body.removeChild(dialog);
            resolve('paypal');
        };
        
        dialog.querySelector('#cancelBtn').onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };
    });
}

/**
 * Process Stripe payment
 */
async function processStripePayment(email, plan) {
    try {
        const response = await fetch('/api/payment/stripe-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, plan })
        });
        
        const data = await response.json();
        
        if (data.success && data.url) {
            // Redirect to Stripe checkout
            window.location.href = data.url;
        } else {
            alert('Failed to create checkout session. Please try again.');
        }
    } catch (error) {
        console.error('Stripe payment error:', error);
        alert('Payment error. Please try again.');
    }
}

/**
 * Process PayPal payment
 */
async function processPayPalPayment(email, plan) {
    try {
        const response = await fetch('/api/payment/paypal-create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, plan })
        });
        
        const data = await response.json();
        
        if (data.success && data.orderId) {
            // Load PayPal SDK if not already loaded
            if (!window.paypal) {
                await loadPayPalSDK();
            }
            
            // Render PayPal button
            showPayPalCheckout(data.orderId, email);
        } else {
            alert('Failed to create PayPal order. Please try again.');
        }
    } catch (error) {
        console.error('PayPal payment error:', error);
        alert('Payment error. Please try again.');
    }
}

/**
 * Load PayPal SDK
 */
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID || 'AfHir0qS1C-PrKUV2D1VcqAZ-JDTIA4KRpd40cdJkTojucgv40k-sfpnrpxJfoKKE9b5uszwJOk5qVfR'}&currency=USD`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Show PayPal checkout
 */
function showPayPalCheckout(orderId, email) {
    const container = document.createElement('div');
    container.id = 'paypal-button-container';
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 16px;
        z-index: 10000;
        min-width: 400px;
    `;
    
    document.body.appendChild(container);
    
    paypal.Buttons({
        createOrder: () => orderId,
        onApprove: async (data) => {
            const response = await fetch('/api/payment/paypal-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Payment successful! Thank you for your purchase.');
                document.body.removeChild(container);
                window.location.href = '/success';
            }
        },
        onCancel: () => {
            document.body.removeChild(container);
        },
        onError: (err) => {
            console.error('PayPal error:', err);
            alert('Payment failed. Please try again.');
            document.body.removeChild(container);
        }
    }).render('#paypal-button-container');
}
