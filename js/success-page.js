/**
 * Success Page Functionality
 * Fetches order details and license key from URL parameters or API
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        loadOrderDetails();
    });

    /**
     * Load order details from URL parameters or API
     */
    async function loadOrderDetails() {
        try {
            // Get session ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session_id');

            if (!sessionId) {
                // No session ID - try to get from localStorage or show generic success
                showGenericSuccess();
                return;
            }

            // Fetch order details from backend
            const response = await fetch(`/api/payment/order-details?session_id=${sessionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();

            if (data.success) {
                displayOrderDetails(data.order);
            } else {
                showGenericSuccess();
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            showGenericSuccess();
        }
    }

    /**
     * Display order details on the page
     */
    function displayOrderDetails(order) {
        // Update order ID
        const orderIdElement = document.getElementById('orderId');
        if (orderIdElement && order.id) {
            orderIdElement.textContent = order.id;
        }

        // Update order date
        const orderDateElement = document.getElementById('orderDate');
        if (orderDateElement && order.date) {
            const date = new Date(order.date);
            orderDateElement.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Update amount
        const orderAmountElement = document.getElementById('orderAmount');
        if (orderAmountElement && order.amount) {
            orderAmountElement.textContent = `$${order.amount.toFixed(2)}`;
        }

        // Update user email
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && order.email) {
            userEmailElement.textContent = order.email;
        }

        // Display license key
        if (order.licenseKey) {
            displayLicenseKey(order.licenseKey);
        } else {
            // License key not ready yet - poll for it
            pollForLicenseKey(order.id);
        }
    }

    /**
     * Display the license key
     */
    function displayLicenseKey(licenseKey) {
        const licenseKeyInput = document.getElementById('licenseKey');
        const licenseLoading = document.getElementById('licenseLoading');
        const licenseContent = document.getElementById('licenseContent');

        if (licenseKeyInput && licenseLoading && licenseContent) {
            licenseKeyInput.value = licenseKey;
            licenseLoading.style.display = 'none';
            licenseContent.style.display = 'flex';
        }
    }

    /**
     * Poll for license key if not immediately available
     */
    async function pollForLicenseKey(orderId, attempts = 0) {
        const MAX_ATTEMPTS = 10;
        const POLL_INTERVAL = 2000; // 2 seconds

        if (attempts >= MAX_ATTEMPTS) {
            showLicenseKeyError();
            return;
        }

        try {
            const response = await fetch(`/api/payment/license-key?order_id=${orderId}`);
            const data = await response.json();

            if (data.success && data.licenseKey) {
                displayLicenseKey(data.licenseKey);
            } else {
                // Try again after delay
                setTimeout(() => {
                    pollForLicenseKey(orderId, attempts + 1);
                }, POLL_INTERVAL);
            }
        } catch (error) {
            console.error('Error polling for license key:', error);
            setTimeout(() => {
                pollForLicenseKey(orderId, attempts + 1);
            }, POLL_INTERVAL);
        }
    }

    /**
     * Show license key error message
     */
    function showLicenseKeyError() {
        const licenseLoading = document.getElementById('licenseLoading');
        
        if (licenseLoading) {
            licenseLoading.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 2rem;"></i>
                <p>We're processing your license key. It will be sent to your email shortly.</p>
                <p style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.5);">
                    If you don't receive it within 10 minutes, please contact support.
                </p>
            `;
        }
    }

    /**
     * Show generic success message if we can't fetch specific order details
     */
    function showGenericSuccess() {
        // Use data from localStorage if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const orderIdElement = document.getElementById('orderId');
        const orderDateElement = document.getElementById('orderDate');
        const userEmailElement = document.getElementById('userEmail');

        if (orderIdElement) {
            orderIdElement.textContent = 'Processing...';
        }

        if (orderDateElement) {
            const today = new Date();
            orderDateElement.textContent = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (userEmailElement && user.email) {
            userEmailElement.textContent = user.email;
        }

        // Show message that license key will be emailed
        const licenseLoading = document.getElementById('licenseLoading');
        if (licenseLoading) {
            licenseLoading.innerHTML = `
                <i class="fas fa-envelope" style="color: #3b82f6; font-size: 2rem;"></i>
                <p>Your license key has been sent to your email!</p>
                <p style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.5);">
                    Check your inbox (and spam folder) for your KiwiTweaks Premium license key.
                </p>
            `;
        }
    }

    /**
     * Copy license key to clipboard
     */
    window.copyLicenseKey = function() {
        const licenseKeyInput = document.getElementById('licenseKey');
        const copyBtn = document.querySelector('.copy-btn');
        const copyBtnText = document.getElementById('copyBtnText');

        if (!licenseKeyInput) return;

        // Select and copy the text
        licenseKeyInput.select();
        licenseKeyInput.setSelectionRange(0, 99999); // For mobile devices

        try {
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(licenseKeyInput.value).then(() => {
                    showCopySuccess(copyBtn, copyBtnText);
                }).catch(() => {
                    // Fallback to older method
                    fallbackCopy(licenseKeyInput, copyBtn, copyBtnText);
                });
            } else {
                // Fallback to older method
                fallbackCopy(licenseKeyInput, copyBtn, copyBtnText);
            }
        } catch (err) {
            fallbackCopy(licenseKeyInput, copyBtn, copyBtnText);
        }
    };

    /**
     * Fallback copy method using execCommand
     */
    function fallbackCopy(input, btn, btnText) {
        try {
            document.execCommand('copy');
            showCopySuccess(btn, btnText);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy. Please select and copy manually.');
        }
    }

    /**
     * Show copy success feedback
     */
    function showCopySuccess(btn, btnText) {
        if (btn) {
            btn.classList.add('copied');
        }

        if (btnText) {
            const originalText = btnText.textContent;
            btnText.innerHTML = '<i class="fas fa-check"></i> Copied!';

            setTimeout(() => {
                btnText.textContent = originalText;
                if (btn) {
                    btn.classList.remove('copied');
                }
            }, 2000);
        }
    }
})();
