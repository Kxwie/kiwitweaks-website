/**
 * Profile Page JavaScript
 * Handles tab switching, FAQ toggles, and profile interactions
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', initProfilePage);

    function initProfilePage() {
        console.log('[Profile] Initializing profile page...');
        
        initTabSwitching();
        initFAQToggles();
        initAvatarUpload();
        loadUserData();
    }

    /**
     * Tab Switching
     */
    function initTabSwitching() {
        const navItems = document.querySelectorAll('.profile-nav-item:not(.logout)');
        const tabs = document.querySelectorAll('.profile-tab');

        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Remove active class from all nav items and tabs
                navItems.forEach(nav => nav.classList.remove('active'));
                tabs.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked nav item and corresponding tab
                this.classList.add('active');
                const activeTab = document.getElementById(tabName);
                if (activeTab) {
                    activeTab.classList.add('active');
                }
                
                console.log(`[Profile] Switched to tab: ${tabName}`);
            });
        });
    }

    /**
     * FAQ Toggles
     */
    function initFAQToggles() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
        
        console.log(`[Profile] Initialized ${faqItems.length} FAQ items`);
    }

    /**
     * Avatar Upload
     */
    function initAvatarUpload() {
        const avatarUploadBtn = document.querySelector('.avatar-upload');
        
        if (avatarUploadBtn) {
            avatarUploadBtn.addEventListener('click', function() {
                // Create file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                
                fileInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const avatarImg = document.getElementById('avatarImg');
                            if (avatarImg) {
                                avatarImg.src = event.target.result;
                                console.log('[Profile] Avatar updated');
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                fileInput.click();
            });
        }
    }

    /**
     * Load User Data
     * In a real app, this would fetch from an API
     */
    function loadUserData() {
        // Simulate loading user data
        const userData = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            plan: 'Premium Member',
            daysActive: 127,
            orderCount: 3
        };
        
        // Update DOM elements
        const userNameElements = document.querySelectorAll('#userName, #welcomeName');
        userNameElements.forEach(el => {
            if (el.id === 'welcomeName') {
                el.textContent = userData.name.split(' ')[0]; // First name only
            } else {
                el.textContent = userData.name;
            }
        });
        
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) userEmailEl.textContent = userData.email;
        
        const userPlanEl = document.getElementById('userPlan');
        if (userPlanEl) userPlanEl.textContent = userData.plan;
        
        console.log('[Profile] User data loaded:', userData);
    }

    /**
     * Handle Logout
     */
    window.handleLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('[Profile] User logged out');
            // Clear session/local storage
            localStorage.removeItem('isLoggedIn');
            // Redirect to home or login
            window.location.href = 'index.html';
        }
    };

    /**
     * Form Submission Handling
     */
    document.addEventListener('submit', function(e) {
        // Prevent default form submission for settings forms
        if (e.target.classList.contains('settings-form')) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            console.log('[Profile] Settings updated:', data);
            
            // Show success message (you can add a toast notification here)
            alert('Settings saved successfully!');
        }
    });

})();
