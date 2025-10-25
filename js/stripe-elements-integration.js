/**
 * Stripe Elements Integration for Purchase Modal
 * Handles card input and payment processing
 */

let stripe = null;
let cardElement = null;

/**
 * Initialize Stripe Elements
 */
async function initializeStripeElements() {
    try {
        // Load Stripe.js if not already loaded
        if (!window.Stripe) {
            await loadStripeJS();
        }
        
        // Initialize Stripe (use your publishable key)
        if (!stripe) {
            // You'll need to set your Stripe publishable key here
            const publishableKey = document.body.getAttribute('data-stripe-key') || 
                                  'pk_test_YOUR_KEY_HERE'; // Replace with your key
            stripe = Stripe(publishableKey);
        }
        
        // Create card element if not already created
        if (!cardElement) {
            const elements = stripe.elements();
            cardElement = elements.create('card', {
                style: {
                    base: {
                        color: '#ffffff',
                        fontFamily: '"Inter", sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    },
                    invalid: {
                        color: '#ef4444',
                        iconColor: '#ef4444'
                    }
                }
            });
            
            // Mount the card element
            const cardElementContainer = document.getElementById('stripe-card-element');
            if (cardElementContainer) {
                cardElement.mount('#stripe-card-element');
                
                // Listen for errors
                cardElement.on('change', function(event) {
                    const displayError = document.getElementById('stripe-card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                        displayError.style.display = 'block';
                    } else {
                        displayError.textContent = '';
                        displayError.style.display = 'none';
                    }
                });
            }
        }
        
        console.log('[Stripe] Elements initialized');
    } catch (error) {
        console.error('[Stripe] Failed to initialize:', error);
        handlePaymentError(new Error('Failed to load payment form'));
    }
}

/**
 * Load Stripe.js library
 */
function loadStripeJS() {
    return new Promise((resolve, reject) => {
        if (window.Stripe) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Stripe.js'));
        document.head.appendChild(script);
    });
}

/**
 * Process Stripe card payment
 */
async function processStripeCardPayment() {
    const payButton = document.getElementById('btn-stripe-pay');
    const errorDisplay = document.getElementById('stripe-card-errors');
    
    if (!stripe || !cardElement) {
        showFieldError(errorDisplay, 'Payment form not initialized');
        return;
    }
    
    setButtonLoading(payButton, true);
    hideFieldError(errorDisplay);
    
    try {
        // Create payment method
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                email: PurchaseState.userEmail
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        // Send payment method to backend
        const response = await fetch('/api/payment/stripe-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                email: PurchaseState.userEmail,
                plan: PurchaseState.selectedPlan,
                cartData: PurchaseState.cartData
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Payment failed');
        }
        
        // Handle payment intent result
        if (data.requiresAction) {
            // 3D Secure or other authentication required
            const {error: confirmError} = await stripe.confirmCardPayment(data.clientSecret);
            
            if (confirmError) {
                throw new Error(confirmError.message);
            }
        }
        
        // Payment successful!
        if (data.success) {
            window.location.href = `/success?payment_intent=${data.paymentIntentId}`;
        } else {
            throw new Error('Payment confirmation failed');
        }
        
    } catch (error) {
        console.error('[Stripe] Payment error:', error);
        showFieldError(errorDisplay, error.message || 'Payment failed. Please try again.');
        setButtonLoading(payButton, false);
    }
}

/**
 * Initialize PayPal buttons in modal
 */
async function initializePayPalButtons() {
    try {
        // Load PayPal SDK if not loaded
        if (!window.paypal) {
            await loadPayPalSDK();
        }
        
        // Clear any existing buttons
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Create PayPal order first
        const response = await fetch('/api/payment/paypal-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: PurchaseState.userEmail,
                plan: PurchaseState.selectedPlan,
                cartData: PurchaseState.cartData
            })
        });
        
        const data = await response.json();
        
        if (!data.success || !data.orderId) {
            throw new Error('Failed to create PayPal order');
        }
        
        // Render PayPal buttons
        window.paypal.Buttons({
            createOrder: () => data.orderId,
            onApprove: async (approveData) => {
                // Show processing
                showStep('step-processing');
                document.getElementById('processing-title').textContent = 'Confirming payment...';
                
                try {
                    const captureResponse = await fetch('/api/payment/paypal-capture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: approveData.orderID })
                    });
                    
                    const result = await captureResponse.json();
                    
                    if (result.success) {
                        window.location.href = `/success?order_id=${result.orderId}`;
                    } else {
                        throw new Error('Payment confirmation failed');
                    }
                } catch (error) {
                    PurchaseState.isProcessing = false;
                    handlePaymentError(error);
                    showStep('step-paypal-entry');
                }
            },
            onCancel: () => {
                // User cancelled, stay on PayPal page
                announceToScreenReader('Payment cancelled');
            },
            onError: (err) => {
                console.error('[PayPal] Error:', err);
                handlePaymentError(new Error('PayPal payment failed'));
                showStep('step-paypal-entry');
            }
        }).render('#paypal-button-container');
        
        console.log('[PayPal] Buttons initialized');
    } catch (error) {
        console.error('[PayPal] Failed to initialize:', error);
        handlePaymentError(error);
    }
}

// Make functions globally available
window.initializeStripeElements = initializeStripeElements;
window.processStripeCardPayment = processStripeCardPayment;
window.initializePayPalButtons = initializePayPalButtons;
