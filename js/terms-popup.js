/**
 * Terms of Service Acceptance Popup
 * Shows on first visit and must be accepted to use the site
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if user has already accepted terms
        const termsAccepted = localStorage.getItem('kiwitweaks_terms_accepted');
        
        if (!termsAccepted) {
            showTermsPopup();
        }
    });

    function showTermsPopup() {
        // Create popup HTML
        const popupHTML = `
            <div class="terms-popup-overlay" id="termsPopup">
                <div class="terms-popup">
                    <div class="terms-popup-header">
                        <i class="fas fa-file-contract"></i>
                        <h2>Terms of Service</h2>
                    </div>
                    
                    <div class="terms-popup-content">
                        <p>Welcome to KiwiTweaks! Before you continue, please review and accept our legal agreements:</p>
                        
                        <div class="terms-checkbox">
                            <label class="checkbox-container">
                                <input type="checkbox" id="acceptTermsCheckbox">
                                <span class="checkmark"></span>
                                <span class="terms-text">
                                    I have read and agree to the following:
                                    <span class="terms-links">
                                        <a href="user-agreement.html" target="_blank">User Agreement</a>
                                        <span class="separator">•</span>
                                        <a href="privacy-policy.html" target="_blank">Privacy Policy</a>
                                        <span class="separator">•</span>
                                        <a href="refund-policy.html" target="_blank">Refund Policy</a>
                                        <span class="separator">•</span>
                                        <a href="privacy-policy.html#cookies" target="_blank">Cookie Policy</a>
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="terms-popup-footer">
                        <button id="acceptTermsBtn" class="btn btn-primary" disabled>
                            <i class="fas fa-check"></i>
                            Accept & Continue
                        </button>
                        <button id="declineTermsBtn" class="btn btn-outline">
                            <i class="fas fa-times"></i>
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert popup into page
        document.body.insertAdjacentHTML('beforeend', popupHTML);

        // Get elements
        const popup = document.getElementById('termsPopup');
        const checkbox = document.getElementById('acceptTermsCheckbox');
        const acceptBtn = document.getElementById('acceptTermsBtn');
        const declineBtn = document.getElementById('declineTermsBtn');

        // Enable accept button when checkbox is checked
        checkbox.addEventListener('change', function() {
            acceptBtn.disabled = !this.checked;
        });

        // Accept terms
        acceptBtn.addEventListener('click', function() {
            if (checkbox.checked) {
                localStorage.setItem('kiwitweaks_terms_accepted', 'true');
                localStorage.setItem('kiwitweaks_terms_date', new Date().toISOString());
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 300);
            }
        });

        // Decline terms (redirect away)
        declineBtn.addEventListener('click', function() {
            if (confirm('You must accept our Terms of Service to use KiwiTweaks. Are you sure you want to decline?')) {
                window.location.href = 'https://www.google.com';
            }
        });

        // Prevent closing by clicking outside
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                alert('Please accept or decline the Terms of Service to continue.');
            }
        });

        // Show popup with animation
        setTimeout(() => popup.classList.add('active'), 100);
    }
})();
