/**
 * Data Transformation Utilities
 * Ensures consistent data formats between system layers
 * 
 * @module utils/data-transformer
 */

const { ObjectId } = require('mongodb');

/**
 * Transform MongoDB user document to API response format
 * Removes sensitive fields and formats data consistently
 * 
 * @param {Object} user - MongoDB user document
 * @returns {Object} Transformed user object
 * 
 * @example
 * const apiUser = transformUserForAPI(dbUser);
 */
function transformUserForAPI(user) {
    if (!user) return null;
    
    return {
        id: user._id.toString(),  // Convert ObjectId to string
        email: user.email,
        username: user.username || null,
        emailVerified: Boolean(user.emailVerified || false),  // Ensure boolean
        createdAt: user.createdAt ? formatDate(user.createdAt) : null,
        purchases: (user.purchases || []).map(transformPurchaseForAPI),
        // Omit sensitive fields: password, resetToken, etc.
    };
}

/**
 * Transform purchase document for API response
 * Standardizes price format to cents
 * 
 * @param {Object} purchase - Purchase document
 * @returns {Object} Transformed purchase
 */
function transformPurchaseForAPI(purchase) {
    return {
        id: purchase._id ? purchase._id.toString() : null,
        product: purchase.product,
        licenseKey: purchase.key,
        purchaseDate: formatDate(purchase.date),
        amount: formatPrice(purchase),  // Standardize to cents
        currency: (purchase.currency || 'USD').toUpperCase(),  // Ensure uppercase
        status: purchase.status || 'completed',
        provider: purchase.stripeSessionId ? 'stripe' : 
                 purchase.paypalOrderId ? 'paypal' : 'unknown'
    };
}

/**
 * Format date for API response
 * Returns multiple format options
 * 
 * @param {Date|string} date - Date to format
 * @returns {Object} Date in multiple formats
 */
function formatDate(date) {
    if (!date) return null;
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) return null;
    
    return {
        iso: dateObj.toISOString(),
        unix: Math.floor(dateObj.getTime() / 1000),
        formatted: dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };
}

/**
 * Format price to cents (consistent format)
 * Handles both Stripe (already cents) and PayPal (dollars string)
 * 
 * @param {Object} purchase - Purchase with amount
 * @returns {number} Price in cents
 */
function formatPrice(purchase) {
    const amount = purchase.amount;
    
    // If from Stripe, already in cents (number >= 100)
    if (typeof amount === 'number' && amount >= 100) {
        return amount;
    }
    
    // If from PayPal or stored as dollars
    if (typeof amount === 'string' || (typeof amount === 'number' && amount < 100)) {
        return Math.round(parseFloat(amount) * 100);
    }
    
    return 0;
}

/**
 * Format price for display
 * 
 * @param {number} cents - Price in cents
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPriceForDisplay(2999) // "$29.99"
 */
function formatPriceForDisplay(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(cents / 100);
}

/**
 * Standardize payment data for database storage
 * Ensures consistent format regardless of payment provider
 * 
 * @param {Object} paymentData - Payment data from provider
 * @param {string} provider - 'stripe' or 'paypal'
 * @returns {Object} Standardized payment data
 */
function standardizePaymentData(paymentData, provider) {
    const standard = {
        product: paymentData.product,
        key: paymentData.licenseKey,
        date: new Date(),
        status: 'completed'
    };
    
    if (provider === 'stripe') {
        standard.amount = paymentData.amount;  // Already in cents
        standard.currency = (paymentData.currency || 'usd').toUpperCase();
        standard.stripeSessionId = paymentData.sessionId;
    } else if (provider === 'paypal') {
        // Convert dollars to cents
        standard.amount = Math.round(parseFloat(paymentData.amount) * 100);
        standard.currency = (paymentData.currency || 'USD').toUpperCase();
        standard.paypalOrderId = paymentData.orderId;
    }
    
    return standard;
}

/**
 * Validate and convert ObjectId
 * 
 * @param {string|ObjectId} id - ID to validate
 * @returns {ObjectId} Valid ObjectId
 * @throws {Error} If ID is invalid
 */
function toObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
    }
    
    if (id instanceof ObjectId) {
        return id;
    }
    
    return new ObjectId(id);
}

/**
 * Safe array conversion
 * Ensures value is always an array
 * 
 * @param {*} value - Value to convert
 * @returns {Array} Array value
 */
function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
}

/**
 * Safe boolean conversion
 * Handles various truthy/falsy values
 * 
 * @param {*} value - Value to convert
 * @returns {boolean} Boolean value
 */
function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return Boolean(value);
}

/**
 * Clean null values from object
 * Converts null/undefined to appropriate defaults
 * 
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
function cleanNullValues(obj) {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === 'null' || value === 'undefined') {
            // Skip null values or use defaults
            continue;
        }
        cleaned[key] = value;
    }
    
    return cleaned;
}

/**
 * Sanitize object for API response
 * Removes MongoDB-specific fields and sensitive data
 * 
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} [excludeFields=[]] - Additional fields to exclude
 * @returns {Object} Sanitized object
 */
function sanitizeForAPI(obj, excludeFields = []) {
    if (!obj) return null;
    
    const defaultExclude = [
        'password',
        'resetToken',
        'resetTokenExpiry',
        'verificationToken',
        '__v',  // Mongoose version key
        ...excludeFields
    ];
    
    const sanitized = { ...obj };
    
    // Convert _id to id
    if (sanitized._id) {
        sanitized.id = sanitized._id.toString();
        delete sanitized._id;
    }
    
    // Remove excluded fields
    defaultExclude.forEach(field => {
        delete sanitized[field];
    });
    
    return sanitized;
}

module.exports = {
    transformUserForAPI,
    transformPurchaseForAPI,
    formatDate,
    formatPrice,
    formatPriceForDisplay,
    standardizePaymentData,
    toObjectId,
    toArray,
    toBoolean,
    cleanNullValues,
    sanitizeForAPI
};
