/**
 * KeyAuth Purchase Integration
 * Generates license keys after successful purchases
 */

(function() {
    'use strict';

    /**
     * Create Order with KeyAuth License
     * Call this after successful payment
     */
    window.createOrderWithKeyAuthLicense = async function(paymentData) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            // Generate order ID
            const orderId = generateOrderId();
            
            // Create order data
            const orderData = {
                orderId: orderId,
                productName: paymentData.productName || "KiwiTweaks Premium",
                productDescription: paymentData.productDescription || "Lifetime License",
                productId: paymentData.productId || "premium",
                amount: paymentData.amount || 29.99,
                currency: paymentData.currency || "USD",
                paymentMethod: paymentData.paymentMethod || "stripe",
                paymentId: paymentData.paymentId,
                status: "completed",
                createdAt: new Date().toISOString()
            };
            
            // Try to generate KeyAuth license
            try {
                const licenseKey = await generateKeyAuthLicense(user.email);
                orderData.licenseKey = licenseKey;
            } catch (error) {
                // If KeyAuth fails, generate a temporary key
                orderData.licenseKey = generateTemporaryLicenseKey();
            }
            
            // Save order to localStorage
            const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            userOrders.unshift(orderData);
            localStorage.setItem('userOrders', JSON.stringify(userOrders));
            
            // Update user to premium
            user.isPremium = true;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Try to save to server
            try {
                await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
            } catch (error) {
                // Silently fail, already saved to localStorage
            }
            
            return orderData;
            
        } catch (error) {
            throw new Error('Failed to create order: ' + error.message);
        }
    };

    /**
     * Generate KeyAuth License
     * Calls the server endpoint to generate a license via KeyAuth API
     */
    async function generateKeyAuthLicense(userEmail) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            
            const response = await fetch('/api/keyauth/generate-license', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userEmail,
                    duration: 99999999, // Lifetime
                    productId: "premium"
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
            throw error;
        }
    }

    /**
     * Generate Temporary License Key
     * Used as fallback if KeyAuth API fails
     */
    function generateTemporaryLicenseKey() {
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(generateRandomString(4));
        }
        return segments.join('-');
    }

    /**
     * Generate Random String
     */
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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
     * Demo: Create Sample Order (for testing without backend)
     * Remove this in production
     */
    window.createDemoOrder = function() {
        const demoOrder = {
            orderId: generateOrderId(),
            productName: "KiwiTweaks Premium",
            productDescription: "Lifetime License",
            productId: "premium",
            amount: 29.99,
            currency: "USD",
            paymentMethod: "demo",
            paymentId: "demo_" + Date.now(),
            licenseKey: generateTemporaryLicenseKey(),
            status: "completed",
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        userOrders.unshift(demoOrder);
        localStorage.setItem('userOrders', JSON.stringify(userOrders));
        
        // Update user to premium
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.isPremium = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('Demo order created! Check your profile orders.', 'success');
        } else {
            alert('Demo order created! Check your profile orders.');
        }
        
        return demoOrder;
    };

})();
