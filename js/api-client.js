/**
 * Standardized API Client
 * Provides consistent interface for all backend API calls
 * 
 * @module js/api-client
 */

import { API, STORAGE_KEYS } from '../config/constants.js';

/**
 * API Client Class
 * Handles all communication with backend
 */
class APIClient {
    constructor() {
        this.baseURL = API.BASE_URL;
        this.defaultTimeout = API.TIMEOUT.DEFAULT;
    }

    /**
     * Get authentication token from storage
     * @returns {string|null} JWT token
     * @private
     */
    _getAuthToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Make authenticated API request
     * 
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Fetch options
     * @param {number} [timeout] - Request timeout in ms
     * @param {number} [retries=3] - Number of retry attempts
     * @returns {Promise<Object>} API response data
     * @throws {APIError} If request fails
     * 
     * @private
     */
    async _request(endpoint, options = {}, timeout = this.defaultTimeout, retries = 3) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this._getAuthToken();
        
        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add auth token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Retry logic
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(url, {
                    ...options,
                    headers,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                // Parse response
                const data = await response.json();
                
                // Handle standardized error response
                if (!response.ok || !data.success) {
                    throw new APIError(
                        data.error?.message || 'Request failed',
                        response.status,
                        data.error?.code,
                        data.ref
                    );
                }
                
                return data.data;  // Return just the data portion
                
            } catch (error) {
                // Don't retry on client errors (4xx)
                if (error.statusCode >= 400 && error.statusCode < 500) {
                    throw error;
                }
                
                // Don't retry on abort (timeout)
                if (error.name === 'AbortError') {
                    throw new APIError('Request timeout', 408);
                }
                
                // Last attempt - throw error
                if (attempt === retries - 1) {
                    if (error instanceof APIError) {
                        throw error;
                    }
                    throw new APIError('Network error', 0, 'NETWORK_ERROR');
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} [params] - Query parameters
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this._request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data = {}) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} Response data
     */
    async put(endpoint, data = {}) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} Response data
     */
    async delete(endpoint) {
        return this._request(endpoint, {
            method: 'DELETE'
        });
    }

    // =================================================================
    // AUTH API METHODS
    // =================================================================

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{token: string, user: Object}>}
     */
    async login(email, password) {
        const data = await this.post(API.ENDPOINTS.LOGIN, { email, password });
        
        // Store auth token
        if (data.token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
            
            // Verify storage
            const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (!storedToken) {
                throw new Error('Failed to store authentication token');
            }
        }
        
        return data;
    }

    /**
     * Register new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} [username] - Optional username
     * @returns {Promise<{token: string, user: Object}>}
     */
    async register(email, password, username) {
        const data = await this.post(API.ENDPOINTS.REGISTER, { 
            email, 
            password, 
            username 
        });
        
        // Store auth token
        if (data.token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        }
        
        return data;
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>}
     */
    async requestPasswordReset(email) {
        return this.post(API.ENDPOINTS.PASSWORD_RESET_REQUEST, { email });
    }

    /**
     * Confirm password reset
     * @param {string} token - Reset token
     * @param {string} password - New password
     * @returns {Promise<Object>}
     */
    async confirmPasswordReset(token, password) {
        return this.post(API.ENDPOINTS.PASSWORD_RESET_CONFIRM, { 
            token, 
            password,
            confirmPassword: password 
        });
    }

    // =================================================================
    // USER API METHODS
    // =================================================================

    /**
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return this.get(API.ENDPOINTS.PROFILE);
    }

    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Updated user data
     */
    async updateProfile(updates) {
        return this.put(API.ENDPOINTS.UPDATE_PROFILE, updates);
    }

    // =================================================================
    // PAYMENT API METHODS
    // =================================================================

    /**
     * Create Stripe checkout session
     * @param {string} plan - Plan ID
     * @param {string} email - User email
     * @returns {Promise<{sessionId: string, url: string}>}
     */
    async createStripeCheckout(plan, email) {
        return this.post(API.ENDPOINTS.STRIPE_CHECKOUT, { plan, email });
    }

    /**
     * Create PayPal order
     * @param {string} plan - Plan ID
     * @param {string} email - User email
     * @returns {Promise<{orderId: string}>}
     */
    async createPayPalOrder(plan, email) {
        return this.post(API.ENDPOINTS.PAYPAL_CREATE, { plan, email });
    }

    /**
     * Capture PayPal payment
     * @param {string} orderId - PayPal order ID
     * @returns {Promise<Object>}
     */
    async capturePayPalPayment(orderId) {
        return this.post(API.ENDPOINTS.PAYPAL_CAPTURE, { orderId });
    }
}

/**
 * Custom API Error Class
 */
class APIError extends Error {
    constructor(message, statusCode, code, ref) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.code = code;
        this.ref = ref;
    }
}

// Export singleton instance
const apiClient = new APIClient();
export default apiClient;
export { APIClient, APIError };
