/**
 * Reset Password Page JavaScript
 * Handles password reset request and confirmation
 */

(function() {
    'use strict';

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initResetPassword);

    function initResetPassword() {
        if (resetToken) {
            // Show confirm reset form (user clicked email link)
            showConfirmResetForm();
        } else {
            // Show request reset form (user doesn't have token)
            showRequestResetForm();
        }
    }

    /**
     * Show Request Reset Form
     */
    function showRequestResetForm() {
        document.getElementById('pageTitle').textContent = 'Forgot Password?';
        document.getElementById('pageDescription').textContent = 'Enter your email to receive a reset link';
        
        const requestForm = document.getElementById('requestResetForm');
        const confirmForm = document.getElementById('confirmResetForm');
        
        requestForm.style.display = 'block';
        confirmForm.style.display = 'none';
        
        requestForm.addEventListener('submit', handleRequestReset);
    }

    /**
     * Show Confirm Reset Form
     */
    function showConfirmResetForm() {
        document.getElementById('pageTitle').textContent = 'Reset Password';
        document.getElementById('pageDescription').textContent = 'Enter your new password below';
        
        const requestForm = document.getElementById('requestResetForm');
        const confirmForm = document.getElementById('confirmResetForm');
        
        requestForm.style.display = 'none';
        confirmForm.style.display = 'block';
        
        confirmForm.addEventListener('submit', handleConfirmReset);
    }

    /**
     * Handle Request Reset Form Submission
     */
    async function handleRequestReset(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.textContent;
        
        // Disable button and show loading
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        
        const email = form.querySelector('#resetEmail').value;
        
        try {
            const response = await fetch('/api/auth/password-reset-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification(data.message || 'If an account exists with that email, a password reset link has been sent', 'success');
                form.reset();
                
                // Show success message
                setTimeout(() => {
                    document.getElementById('pageDescription').innerHTML = `
                        <div style="color: #10b981; font-weight: 500;">
                            <i class="fas fa-check-circle"></i> 
                            Check your email for the reset link
                        </div>
                    `;
                }, 500);
            } else {
                showNotification(data.error || 'Failed to send reset email', 'error');
            }
        } catch (error) {
            showNotification('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    }

    /**
     * Handle Confirm Reset Form Submission
     */
    async function handleConfirmReset(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.textContent;
        
        const password = form.querySelector('#newPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Validate password strength
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        // Disable button and show loading
        submitBtn.disabled = true;
        btnText.textContent = 'Resetting...';
        
        try {
            const response = await fetch('/api/auth/password-reset-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: resetToken,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Password reset successful! Redirecting to login...', 'success');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 2000);
            } else {
                showNotification(data.error || 'Failed to reset password', 'error');
                submitBtn.disabled = false;
                btnText.textContent = originalText;
            }
        } catch (error) {
            showNotification('Connection error. Please try again.', 'error');
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    }

    /**
     * Show Notification
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
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
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add animation styles
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

})();
