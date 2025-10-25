/**
 * KeyAuth License Generation API Endpoint
 * Generates REAL KeyAuth license keys
 * 
 * This is a Vercel serverless function
 * File: /api/keyauth/generate-license.js
 */

// Import required modules
const fetch = require('node-fetch');

// KeyAuth Configuration
const KEYAUTH_SELLER_API = 'https://keyauth.win/api/seller/';
const KEYAUTH_APP_API = 'https://keyauth.win/api/1.2/';

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'Unauthorized' 
            });
        }

        const token = authHeader.substring(7);
        
        // Verify token (implement your JWT verification here)
        // const user = verifyToken(token);
        // if (!user) {
        //     return res.status(401).json({ success: false, error: 'Invalid token' });
        // }

        // Get request data
        const { username, duration = 99999999, productId = 'premium', note = '' } = req.body;

        if (!username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username is required' 
            });
        }

        // Generate KeyAuth license key
        const licenseKey = await generateKeyAuthLicense({
            username,
            duration,
            productId,
            note
        });

        if (!licenseKey) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to generate license key' 
            });
        }

        // Return the license key
        return res.status(200).json({
            success: true,
            licenseKey: licenseKey,
            message: 'License key generated successfully'
        });

    } catch (error) {
        console.error('KeyAuth API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};

/**
 * Generate KeyAuth License Key
 * Calls KeyAuth Seller API to create a license
 */
async function generateKeyAuthLicense({ username, duration, productId, note }) {
    try {
        // Get environment variables
        const sellerKey = process.env.Seller_Key;
        const appName = process.env.App_name || 'Kiwi';
        const ownerId = process.env.ownerID;

        if (!sellerKey || !ownerId) {
            throw new Error('KeyAuth credentials not configured');
        }

        // Prepare request body for KeyAuth Seller API
        const params = new URLSearchParams({
            sellerkey: sellerKey,
            type: 'add',
            format: 'JSON',
            expiry: duration.toString(),
            mask: 'XXXX-XXXX-XXXX-XXXX', // License key format
            level: '1', // License level (1 = basic, can customize)
            amount: '1', // Number of keys to generate
            owner: ownerId,
            character: '2', // Character set (2 = alphanumeric)
            note: note || `Generated for ${username}`
        });

        // Call KeyAuth Seller API
        const response = await fetch(KEYAUTH_SELLER_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();

        // Check if successful
        if (data.success) {
            // KeyAuth returns either 'key' or 'keys' array
            const licenseKey = data.key || (data.keys && data.keys[0]);
            
            if (licenseKey) {
                // Optionally verify the key was created
                const isValid = await verifyKeyAuthLicense(licenseKey);
                
                if (isValid) {
                    return licenseKey;
                } else {
                    throw new Error('Generated key failed verification');
                }
            }
        }

        throw new Error(data.message || 'KeyAuth API returned error');

    } catch (error) {
        console.error('KeyAuth generation error:', error);
        throw error;
    }
}

/**
 * Verify KeyAuth License Key
 * Checks if the license key is valid in KeyAuth system
 */
async function verifyKeyAuthLicense(licenseKey) {
    try {
        const appName = process.env.App_name || 'Kiwi';
        const ownerId = process.env.ownerID;

        const params = new URLSearchParams({
            type: 'license',
            key: licenseKey,
            name: appName,
            ownerid: ownerId
        });

        const response = await fetch(KEYAUTH_APP_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();
        return data.success === true;

    } catch (error) {
        console.error('KeyAuth verification error:', error);
        return false;
    }
}

/**
 * Example JWT Token Verification (implement based on your auth system)
 */
function verifyToken(token) {
    // Implement your JWT verification here
    // Example using jsonwebtoken:
    // const jwt = require('jsonwebtoken');
    // try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //     return decoded;
    // } catch (error) {
    //     return null;
    // }
    
    // For now, return true (implement proper verification!)
    return { userId: 'demo' };
}
