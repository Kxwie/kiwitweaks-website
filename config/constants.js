/**
 * Application Constants
 * Central location for all configuration values
 * 
 * @module config/constants
 */

/**
 * Authentication and Password Configuration
 */
const AUTH = {
    /**
     * Password strength requirements
     */
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL_CHAR: true,
        
        /**
         * Password strength calculation points
         * Each criterion contributes 25% to total strength
         */
        STRENGTH_POINTS: {
            LENGTH: 25,
            MIXED_CASE: 25,
            NUMBERS: 25,
            SPECIAL_CHARS: 25
        },
        MAX_STRENGTH: 100
    },
    
    /**
     * Email validation
     */
    EMAIL: {
        REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        MAX_LENGTH: 320
    },
    
    /**
     * Username requirements
     */
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30,
        REGEX: /^[a-zA-Z0-9_-]+$/
    },
    
    /**
     * Session configuration
     */
    SESSION: {
        TOKEN_EXPIRY_DAYS: 7,
        REMEMBER_ME_DAYS: 30
    }
};

/**
 * User Interface Timing Configuration
 */
const UI_TIMINGS = {
    /**
     * Notification display durations (in milliseconds)
     */
    NOTIFICATION: {
        DISPLAY_DURATION: 3000,      // How long to show notification
        FADE_OUT_DURATION: 300,      // Animation duration
        SLIDE_IN_DURATION: 300       // Slide in animation
    },
    
    /**
     * Page transition timings
     */
    TRANSITIONS: {
        REDIRECT_DELAY: 1000,        // Delay before redirect after success
        FADE_DURATION: 300,          // Fade transition duration
        SLIDE_DURATION: 400          // Slide transition duration
    },
    
    /**
     * Loading and feedback
     */
    FEEDBACK: {
        DEBOUNCE_DELAY: 300,         // Debounce user input
        TOOLTIP_DELAY: 500,          // Delay before showing tooltip
        LOADING_MIN_DURATION: 500    // Minimum loading indicator display
    }
};

/**
 * API Configuration
 */
const API = {
    /**
     * Base URL for API endpoints
     * Can be overridden via environment variable
     */
    BASE_URL: process.env.API_BASE_URL || '/api',
    
    /**
     * API endpoint paths
     */
    ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
        PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFICATION: '/auth/resend-verification',
        
        // User
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/update',
        
        // Payment
        STRIPE_CHECKOUT: '/payment/stripe-checkout',
        PAYPAL_CREATE: '/payment/paypal-create',
        PAYPAL_CAPTURE: '/payment/paypal-capture'
    },
    
    /**
     * API timeout settings
     */
    TIMEOUT: {
        DEFAULT: 10000,              // 10 seconds
        UPLOAD: 30000,               // 30 seconds for file uploads
        PAYMENT: 15000               // 15 seconds for payment operations
    }
};

/**
 * Application Routes
 */
const ROUTES = {
    HOME: 'index.html',
    AUTH: 'auth.html',
    PROFILE: 'profile.html',
    PRICING: 'pricing.html',
    FEATURES: 'features.html',
    SUPPORT: 'support.html'
};

/**
 * Local Storage Keys
 */
const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'user',
    PREFERENCES: 'userPreferences',
    THEME: 'theme',
    LANGUAGE: 'language'
};

/**
 * Notification Types
 */
const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Database Configuration (Backend)
 */
const DATABASE = {
    NAME: process.env.DB_NAME || 'kiwitweaks',
    
    /**
     * Collection names
     */
    COLLECTIONS: {
        USERS: 'users',
        PURCHASES: 'purchases',
        AUTH_LOGS: 'auth_logs',
        SESSIONS: 'sessions'
    },
    
    /**
     * Connection pool settings
     */
    POOL: {
        MAX_SIZE: 10,
        MIN_SIZE: 2,
        MAX_IDLE_TIME: 30000
    }
};

/**
 * Regular Expressions
 */
const REGEX = {
    EMAIL: AUTH.EMAIL.REGEX,
    USERNAME: AUTH.USERNAME.REGEX,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
};

/**
 * Feature Flags
 */
const FEATURES = {
    ENABLE_SOCIAL_LOGIN: false,
    ENABLE_TWO_FACTOR_AUTH: false,
    ENABLE_EMAIL_VERIFICATION: true,
    ENABLE_PASSWORD_RESET: true,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_TRACKING: true
};

/**
 * Development and Debug Settings
 */
const DEBUG = {
    ENABLE_LOGGING: process.env.NODE_ENV !== 'production',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_PERFORMANCE_MONITORING: true
};

// Export all constants
module.exports = {
    AUTH,
    UI_TIMINGS,
    API,
    ROUTES,
    STORAGE_KEYS,
    NOTIFICATION_TYPES,
    HTTP_STATUS,
    DATABASE,
    REGEX,
    FEATURES,
    DEBUG
};
