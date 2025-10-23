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
                        <p>Welcome to KiwiTweaks! Before you continue, please review and accept our terms:</p>
                        
                        <div class="terms-list">
                            <div class="term-item">
                                <i class="fas fa-check-circle"></i>
                                <span>You must be 13 years or older to use KiwiTweaks</span>
                            </div>
                            <div class="term-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Use of optimization software is at your own risk</span>
                            </div>
                            <div class="term-item">
                                <i class="fas fa-check-circle"></i>
                                <span>We recommend creating a system restore point before using</span>
                            </div>
                            <div class="term-item">
                                <i class="fas fa-check-circle"></i>
                                <span>Your data will be handled according to our Privacy Policy</span>
                            </div>
                        </div>
                        
                        <div class="terms-checkbox">
                            <label class="checkbox-container">
                                <input type="checkbox" id="acceptTermsCheckbox">
                                <span class="checkmark"></span>
                                I have read and agree to the 
                                <a href="user-agreement.html" target="_blank">Terms of Service</a> 
                                and 
                                <a href="privacy-policy.html" target="_blank">Privacy Policy</a>
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
