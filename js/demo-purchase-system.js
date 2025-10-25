/**
 * Purchase System with REAL Orders and KeyAuth License Keys
 * Creates actual orders in MongoDB with real user data
 */

(function() {
    'use strict';

    /**
     * Create Purchase Button
     * Creates real orders with real data from database
     */
    window.initPurchaseButton = function() {
        // Check if button already exists
        if (document.getElementById('purchaseBtn')) return;
        
        // Create purchase section
        const purchaseSection = document.createElement('div');
        purchaseSection.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        purchaseSection.innerHTML = `
            <button id="purchaseBtn" style="
                background: white;
                color: #8b5cf6;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.95rem;
                transition: all 0.3s;
            ">
                <i class="fas fa-shopping-cart"></i>
                Purchase Premium (FREE)
            </button>
        `;
        
        document.body.appendChild(purchaseSection);
        
        // Add hover effect
        const btn = document.getElementById('purchaseBtn');
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        });
        
        // Handle click
        btn.addEventListener('click', handlePurchase);
    };

    /**
     * Handle Purchase
     * Generates REAL KeyAuth license key and creates order in MongoDB
     */
    async function handlePurchase() {
        const btn = document.getElementById('purchaseBtn');
        if (!btn) return;
        
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email) {
            showNotification('Please login first!', 'error');
            window.location.href = 'auth.html';
            return;
        }
        
        // Disable button and show loading
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating License...';
        
        try {
            // Get token
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Step 1: Generate REAL KeyAuth license key
            const licenseResponse = await fetch('/api/keyauth/generate-license', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user.email,
                    duration: 99999999,
                    productId: 'premium',
                    note: 'KiwiTweaks Premium Purchase'
                })
            });

            const licenseData = await licenseResponse.json();
            if (!licenseData.success || !licenseData.licenseKey) {
                throw new Error('Failed to generate license key');
            }

            const licenseKey = licenseData.licenseKey;

            // Step 2: Create order in MongoDB with REAL user data
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName: 'KiwiTweaks Premium',
                    amount: 0.00,
                    licenseKey: licenseKey
                })
            });

            const orderData = await orderResponse.json();
            if (!orderData.success) {
                throw new Error('Failed to create order');
            }

            const order = orderData.order;
            
            // Show success message
            showSuccessModal(order);
            
            // Reset button
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Purchase Complete!';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Purchase Premium (FREE)';
            }, 3000);

            // Reload page to show new order
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Demo purchase error:', error);
            showNotification('Failed to generate license: ' + error.message, 'error');
            
            // Reset button
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Purchase Premium (FREE)';
        }
    }

    /**
     * Generate REAL KeyAuth License Key
     * This calls your backend which then calls KeyAuth API
     */
    async function generateRealKeyAuthLicense(userEmail) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            
            // Call your backend endpoint that generates KeyAuth license
            const response = await fetch('/api/keyauth/generate-license', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userEmail,
                    duration: 99999999, // Lifetime
                    productId: "premium",
                    note: "Demo Purchase"
                })
            });
            
            if (!response.ok) {
                throw new Error('KeyAuth API failed');
            }
            
            const data = await response.json();
            
            if (data.success && data.licenseKey) {
                return data.licenseKey;
            }
            
            throw new Error('Invalid KeyAuth response');
            
        } catch (error) {
            // If backend fails, show error
            console.error('KeyAuth generation failed:', error);
            throw new Error('Unable to generate license key. Make sure KeyAuth API endpoint is configured.');
        }
    }

    /**
     * Show Success Modal
     */
    function showSuccessModal(order) {
        const modal = document.createElement('div');
        modal.className = 'demo-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
                border-radius: 20px;
                padding: 2.5rem;
                max-width: 500px;
                width: 90%;
                border: 1px solid rgba(139, 92, 246, 0.3);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            ">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: rgba(139, 92, 246, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                    ">
                        <i class="fas fa-check" style="font-size: 2.5rem; color: #10b981;"></i>
                    </div>
                    <h2 style="color: white; font-size: 1.8rem; margin-bottom: 0.5rem;">Purchase Complete!</h2>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem;">Your license key has been generated</p>
                </div>
                
                <div style="
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                ">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <i class="fas fa-key" style="color: #8b5cf6;"></i>
                        <span style="color: white; font-weight: 600;">Your License Key</span>
                    </div>
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        background: rgba(0, 0, 0, 0.3);
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                    ">
                        <code id="modalLicenseKey" style="
                            flex: 1;
                            color: #a78bfa;
                            font-size: 1.1rem;
                            letter-spacing: 1px;
                            font-weight: 600;
                        ">${order.licenseKey}</code>
                        <button onclick="copyModalLicenseKey()" style="
                            background: rgba(139, 92, 246, 0.2);
                            border: 1px solid rgba(139, 92, 246, 0.4);
                            border-radius: 6px;
                            padding: 0.5rem 1rem;
                            color: white;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: rgba(255,255,255,0.7);
                        font-size: 0.9rem;
                    ">
                        <i class="fas fa-info-circle" style="color: #8b5cf6;"></i>
                        This is a REAL verified KeyAuth license key
                    </p>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="this.closest('.demo-success-modal').remove()" style="
                        flex: 1;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        padding: 0.75rem 1.5rem;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: 600;
                    ">
                        Close
                    </button>
                    <a href="profile.html" style="
                        flex: 1;
                        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                        border: none;
                        border-radius: 8px;
                        padding: 0.75rem 1.5rem;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: 600;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                    ">
                        View in Profile
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add copy function
        window.copyModalLicenseKey = function() {
            const key = document.getElementById('modalLicenseKey').textContent;
            navigator.clipboard.writeText(key).then(() => {
                showNotification('License key copied to clipboard!', 'success');
            });
        };
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Generate Order ID
     */
    function generateOrderId() {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        return `KWT-${year}-${randomNum}`;
    }

    /**
     * Show Notification
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-size: 0.95rem;
            max-width: 350px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Add animations
    if (!document.getElementById('demo-purchase-animations')) {
        const style = document.createElement('style');
        style.id = 'demo-purchase-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
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

    // Auto-initialize on profile page
    if (window.location.pathname.includes('profile.html')) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.initDemoPurchaseButton();
            }, 1000);
        });
    }

})();
