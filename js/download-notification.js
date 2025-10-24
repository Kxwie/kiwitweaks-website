/**
 * Download Notification System
 * Shows instructions for downloading the free version from Discord
 */

(function() {
    'use strict';

    // Create notification HTML
    function createNotificationHTML() {
        return `
            <div class="download-notification-overlay" id="downloadNotification">
                <div class="download-notification">
                    <button class="download-notification-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="download-notification-header">
                        <div class="download-notification-icon">
                            <i class="fab fa-discord"></i>
                        </div>
                        <h2>Download Free Version</h2>
                        <p>Follow these simple steps to get KiwiTweaks Free!</p>
                    </div>

                    <div class="download-notification-steps">
                        <div class="download-step">
                            <div class="download-step-number">1</div>
                            <div class="download-step-content">
                                <h3>Join Our Discord Server</h3>
                                <p>Click the button below to join our community Discord server where all downloads are hosted.</p>
                            </div>
                        </div>

                        <div class="download-step">
                            <div class="download-step-number">2</div>
                            <div class="download-step-content">
                                <h3>Navigate to Downloads Channel</h3>
                                <p>Once in the server, go to the channel:</p>
                                <code>#free-downloads</code>
                            </div>
                        </div>

                        <div class="download-step">
                            <div class="download-step-number">3</div>
                            <div class="download-step-content">
                                <h3>Download KiwiTweaks Free</h3>
                                <p>Look for the pinned message with the latest version and click the download link. Extract and run the utility!</p>
                            </div>
                        </div>
                    </div>

                    <div class="download-notification-actions">
                        <a href="https://discord.com/channels/1326296916719566982/1335208265679900754" 
                           class="download-notification-btn download-notification-btn-primary" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            <i class="fab fa-discord"></i>
                            <span>Go to Discord</span>
                        </a>
                        <button class="download-notification-btn download-notification-btn-secondary" 
                                id="closeDownloadNotification">
                            <i class="fas fa-times"></i>
                            <span>Maybe Later</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize notification
    function init() {
        // Insert notification HTML into body
        const notificationHTML = createNotificationHTML();
        document.body.insertAdjacentHTML('beforeend', notificationHTML);

        const overlay = document.getElementById('downloadNotification');
        const closeBtn = document.querySelector('.download-notification-close');
        const cancelBtn = document.getElementById('closeDownloadNotification');

        // Find all free download buttons
        const freeDownloadButtons = document.querySelectorAll('a[href*="discord.com"], .btn-outline[href*="discord"]');

        // Add click handlers to free download buttons
        freeDownloadButtons.forEach(button => {
            const href = button.getAttribute('href');
            if (href && href.includes('discord.com')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    showNotification();
                });
            }
        });

        // Close handlers
        function closeNotification() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeNotification);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeNotification);
        }

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeNotification();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeNotification();
            }
        });

        console.log('✅ Download notification system initialized');
    }

    // Show notification
    function showNotification() {
        const overlay = document.getElementById('downloadNotification');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animate steps
            const steps = document.querySelectorAll('.download-step');
            steps.forEach((step, index) => {
                step.style.opacity = '0';
                step.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    step.style.transition = 'all 0.5s ease';
                    step.style.opacity = '1';
                    step.style.transform = 'translateX(0)';
                }, 100 * (index + 1));
            });
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.DownloadNotification = {
        show: showNotification
    };

})();
