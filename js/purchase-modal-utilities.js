/**
 * Purchase Modal Utility Functions
 * Helper functions for error handling, button states, validation, etc.
 */

/**
 * Handle payment errors with user-friendly messages
 */
function handlePaymentError(error) {
    console.error('[Purchase] Payment error:', error);

    const errorMessages = {
        'OFFLINE': {
            title: 'No Internet Connection',
            message: 'Please check your internet connection and try again.',
            canRetry: true
        },
        'TIMEOUT': {
            title: 'Request Timed Out',
            message: 'The payment request took too long. Please try again.',
            canRetry: true
        },
        'RATE_LIMITED': {
            title: 'Too Many Requests',
            message: 'Please wait a moment before trying again.',
            canRetry: true
        },
        'HTTP_500': {
            title: 'Server Error',
            message: 'Our servers are having issues. Please try again in a few minutes.',
            canRetry: true
        },
        'HTTP_502': {
            title: 'Server Error',
            message: 'Service temporarily unavailable. Please try again.',
            canRetry: true
        },
        'HTTP_503': {
            title: 'Service Unavailable',
            message: 'Our payment service is temporarily down. Please try again later.',
            canRetry: true
        },
        'INVALID_RESPONSE': {
            title: 'Invalid Response',
            message: 'We received an unexpected response. Please try again.',
            canRetry: true
        },
        'DEFAULT': {
            title: 'Payment Failed',
            message: 'We couldn\'t process your payment. Please try again or contact support.',
            canRetry: true
        }
    };

    const errorType = error.message || 'DEFAULT';
    const errorInfo = errorMessages[errorType] || errorMessages.DEFAULT;

    showError(errorInfo.title, errorInfo.message, errorInfo.canRetry);
}

/**
 * Show error message in modal
 */
function showError(title, message, canRetry = true) {
    const errorDisplay = document.getElementById('error-display');
    const errorTitle = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('btn-retry');

    if (errorDisplay && errorTitle && errorMessage) {
        errorTitle.textContent = title;
        errorMessage.textContent = message;
        errorDisplay.style.display = 'block';

        if (retryBtn) {
            retryBtn.style.display = canRetry ? 'inline-flex' : 'none';
        }

        announceToScreenReader(`Error: ${title}. ${message}`);
    }
}

/**
 * Hide error message
 */
function hideError() {
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
    }
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.setAttribute('aria-busy', 'true');
        
        const originalContent = button.innerHTML;
        button.setAttribute('data-original-content', originalContent);
        
        // Add spinner
        button.innerHTML = '<span class="btn-spinner"></span> <span>Loading...</span>';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.setAttribute('aria-busy', 'false');
        
        const originalContent = button.getAttribute('data-original-content');
        if (originalContent) {
            button.innerHTML = originalContent;
            button.removeAttribute('data-original-content');
        }
    }
}

/**
 * Validate email address
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Show field error message
 */
function showFieldError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    element.setAttribute('role', 'alert');
}

/**
 * Hide field error message
 */
function hideFieldError(element) {
    if (!element) return;
    element.textContent = '';
    element.style.display = 'none';
    element.removeAttribute('role');
}

/**
 * Check if error should trigger automatic retry
 */
function shouldRetry(error) {
    const retryableErrors = [
        'TIMEOUT',
        'HTTP_500',
        'HTTP_502',
        'HTTP_503',
        'HTTP_504'
    ];
    return retryableErrors.includes(error.message);
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const statusElement = document.getElementById('modal-status');
    if (statusElement) {
        statusElement.textContent = message;
        
        // Clear after announcement to allow repeated messages
        setTimeout(() => {
            statusElement.textContent = '';
        }, 1000);
    }
}

/**
 * Show notification (optional - for additional feedback)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `purchase-notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Format price for display
 */
function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Check network status
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Add network status listeners
 */
function initNetworkListeners() {
    window.addEventListener('online', () => {
        console.log('[Purchase] Network connection restored');
        hideError();
    });

    window.addEventListener('offline', () => {
        console.log('[Purchase] Network connection lost');
        showError(
            'Connection Lost',
            'Your internet connection was lost. Please check your connection.',
            false
        );
    });
}

// Initialize network listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetworkListeners);
} else {
    initNetworkListeners();
}

// Export functions for use in main purchase modal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handlePaymentError,
        showError,
        hideError,
        setButtonLoading,
        validateEmail,
        showFieldError,
        hideFieldError,
        shouldRetry,
        announceToScreenReader,
        showNotification,
        formatPrice,
        isOnline
    };
}
