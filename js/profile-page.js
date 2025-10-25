/**
 * Complete Profile Page with KeyAuth Integration
 * Handles all profile functionality, orders, downloads, and license management
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initProfilePage);

    function initProfilePage() {
        checkAuthentication();
        initTabSwitching();
        initFAQToggles();
        initAvatarUpload();
        loadUserData();
        loadUserOrders();
        initSettingsForms();
        initToggleSwitches();
    }

    /**
     * Check if user is authenticated
     */
    function checkAuthentication() {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = 'auth.html';
            return;
        }
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
                
                // Reload data for specific tabs
                if (tabName === 'orders') {
                    loadUserOrders();
                } else if (tabName === 'downloads') {
                    loadDownloads();
                }
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
            
            if (question) {
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
            }
        });
    }

    /**
     * Avatar Upload
     */
    function initAvatarUpload() {
        const avatarUploadBtn = document.querySelector('.avatar-upload');
        
        if (avatarUploadBtn) {
            avatarUploadBtn.addEventListener('click', function() {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                
                fileInput.addEventListener('change', async function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        // Validate file size (max 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                            showNotification('Image size must be less than 2MB', 'error');
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const avatarImg = document.getElementById('avatarImg');
                            if (avatarImg) {
                                avatarImg.src = event.target.result;
                                
                                // Save to user data
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                user.avatar = event.target.result;
                                localStorage.setItem('user', JSON.stringify(user));
                                
                                showNotification('Avatar updated successfully!', 'success');
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
     */
    async function loadUserData() {
        try {
            // First try to fetch fresh data from server
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            let user = null;
            
            try {
                const response = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    user = data.user;
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (error) {
                // If server fails, use localStorage
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    window.location.href = 'auth.html';
                    return;
                }
                user = JSON.parse(userStr);
            }
            
            if (!user) {
                window.location.href = 'auth.html';
                return;
            }
            
            // Update user name - use username field from database
            const userNameElements = document.querySelectorAll('#userName, #welcomeName');
            userNameElements.forEach(el => {
                const displayName = user.username || user.name || user.email.split('@')[0];
                if (el.id === 'welcomeName') {
                    el.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                } else {
                    el.textContent = displayName;
                }
            });
            
            // Update email - use actual email from database
            const userEmailEl = document.getElementById('userEmail');
            if (userEmailEl) userEmailEl.textContent = user.email;
            
            // Update plan badge
            const userPlanEl = document.getElementById('userPlan');
            if (userPlanEl) {
                userPlanEl.textContent = user.isPremium ? 'Premium Member' : 'Free Member';
            }
            
            // Update avatar
            const avatarImg = document.getElementById('avatarImg');
            if (avatarImg) {
                if (user.avatar) {
                    avatarImg.src = user.avatar;
                } else {
                    const name = user.username || user.email.split('@')[0];
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=8b5cf6&color=fff&bold=true`;
                }
            }
            
            // Load account stats
            loadAccountStats(user);
            
            // Update settings form
            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            if (fullNameInput) fullNameInput.value = user.username || user.email.split('@')[0];
            if (emailInput) emailInput.value = user.email;
            
        } catch (error) {
            showNotification('Error loading user data', 'error');
        }
    }

    /**
     * Load Account Statistics
     */
    async function loadAccountStats(user) {
        try {
            // Calculate days active
            const createdDate = new Date(user.createdAt || Date.now());
            const now = new Date();
            const daysActive = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            // Update days active
            const statValues = document.querySelectorAll('.stat-value');
            if (statValues[0]) {
                statValues[0].textContent = daysActive;
            }
            
            // Load order count
            const orders = await getUserOrders();
            if (statValues[1]) {
                statValues[1].textContent = orders.length;
            }
            
        } catch (error) {
            // Silently fail
        }
    }

    /**
     * Load User Orders
     */
    async function loadUserOrders() {
        try {
            const orders = await getUserOrders();
            displayOrders(orders);
        } catch (error) {
            showNotification('Error loading orders', 'error');
        }
    }

    /**
     * Get User Orders
     */
    async function getUserOrders() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            
            // Try to fetch from server
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.orders || [];
            }
        } catch (error) {
            // Fallback to localStorage
            const ordersStr = localStorage.getItem('userOrders');
            if (ordersStr) {
                return JSON.parse(ordersStr);
            }
        }
        
        return [];
    }

    /**
     * Display Orders
     */
    function displayOrders(orders) {
        const ordersList = document.querySelector('.orders-list');
        if (!ordersList) return;
        
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem; color: #8b5cf6;"></i>
                    <h3 style="color: white; margin-bottom: 0.5rem;">No orders yet</h3>
                    <p style="margin-bottom: 1.5rem;">Your purchase history will appear here</p>
                    <a href="index.html#pricing" class="btn btn-primary">
                        <i class="fas fa-shopping-cart"></i>
                        Browse Products
                    </a>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        });
    }

    /**
     * Create Order Card with License Key
     */
    function createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'order-card';
        
        const statusClass = order.status === 'completed' ? 'success' : '';
        const statusText = order.status === 'completed' ? 'Completed' : order.status;
        
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Order #${order.orderId}</h3>
                    <p class="order-date">${formatDate(order.createdAt)}</p>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-items">
                <div class="order-item">
                    <i class="fas fa-crown"></i>
                    <div>
                        <h4>${order.productName}</h4>
                        <p>${order.productDescription || 'Lifetime License'}</p>
                    </div>
                    <span class="order-price">$${order.amount.toFixed(2)}</span>
                </div>
            </div>
            ${order.licenseKey ? `
                <div class="order-license" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
                    <div class="license-header" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <i class="fas fa-key" style="color: #8b5cf6;"></i>
                        <span style="color: white; font-weight: 600;">Your License Key</span>
                    </div>
                    <div class="license-key-box" style="display: flex; align-items: center; gap: 1rem; background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px;">
                        <code id="license-${order.orderId}" style="flex: 1; color: #a78bfa; font-size: 1.1rem; letter-spacing: 1px; font-weight: 600;">${order.licenseKey}</code>
                        <button class="btn-copy" onclick="copyLicenseKey('license-${order.orderId}')" style="background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 6px; padding: 0.5rem 1rem; color: white; cursor: pointer; transition: all 0.3s;" title="Copy to clipboard">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="license-note" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                        <i class="fas fa-info-circle" style="color: #8b5cf6;"></i>
                        Keep this key safe. You'll need it to activate KiwiTweaks.
                    </p>
                </div>
            ` : ''}
            <div class="order-actions">
                ${order.status === 'completed' ? `
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    /**
     * Copy License Key
     */
    window.copyLicenseKey = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const text = element.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            showNotification('License key copied to clipboard!', 'success');
            
            const button = element.nextElementSibling;
            if (button) {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, 2000);
            }
        }).catch(err => {
            showNotification('Failed to copy license key', 'error');
        });
    };

    /**
     * Load Downloads
     */
    function loadDownloads() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.isPremium) {
            const downloadsGrid = document.querySelector('.downloads-grid');
            if (downloadsGrid) {
                downloadsGrid.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7); grid-column: 1 / -1;">
                        <i class="fas fa-lock" style="font-size: 3rem; margin-bottom: 1rem; color: #8b5cf6;"></i>
                        <h3 style="color: white; margin-bottom: 0.5rem;">Premium Access Required</h3>
                        <p style="margin-bottom: 1.5rem;">Purchase KiwiTweaks to access downloads</p>
                        <a href="index.html#pricing" class="btn btn-primary">
                            <i class="fas fa-crown"></i>
                            Get Premium
                        </a>
                    </div>
                `;
            }
        }
    }

    /**
     * Initialize Settings Forms
     */
    function initSettingsForms() {
        const settingsForms = document.querySelectorAll('.settings-form');
        
        settingsForms.forEach(form => {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const fullName = form.querySelector('#fullName').value;
                const email = form.querySelector('#email').value;
                
                try {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    user.username = fullName;
                    user.email = email;
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    showNotification('Settings saved successfully!', 'success');
                    
                    // Reload user data to update display
                    loadUserData();
                } catch (error) {
                    showNotification('Failed to save settings', 'error');
                }
            });
        });
    }

    /**
     * Initialize Toggle Switches
     */
    function initToggleSwitches() {
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                showNotification('Notification preferences updated', 'success');
            });
        });
    }

    /**
     * Handle Logout
     */
    window.handleLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear all session/local storage
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userOrders');
            
            // Redirect to home
            window.location.href = 'index.html';
        }
    };

    /**
     * Utility Functions
     */
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

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
        }, 4000);
    }

    // Add animation styles
    if (!document.getElementById('profile-animations')) {
        const style = document.createElement('style');
        style.id = 'profile-animations';
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
