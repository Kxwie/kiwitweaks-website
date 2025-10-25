/**
 * Verify License Key Endpoint
 * Verifies a license key with KeyAuth
 * Used by software to validate user's license
 */

const clientPromise = require('../../lib/mongodb');

// KeyAuth Configuration
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
        const { licenseKey, hwid } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'License key is required' 
            });
        }

        // Verify with KeyAuth
        const appName = process.env.App_name || 'Kiwi';
        const ownerId = process.env.ownerID;

        const params = new URLSearchParams({
            type: 'license',
            key: licenseKey,
            name: appName,
            ownerid: ownerId,
            hwid: hwid || ''
        });

        const response = await fetch(KEYAUTH_APP_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({
                success: false,
                error: data.message || 'Invalid license key',
                keyauthResponse: data
            });
        }

        // If valid, update user info in database
        const client = await clientPromise;
        const db = client.db('kiwitweaks');
        const usersCollection = db.collection('users');

        // Update user with HWID if provided
        if (hwid) {
            await usersCollection.updateOne(
                { licenseKey: licenseKey },
                { 
                    $set: { 
                        hwid: hwid,
                        lastVerified: new Date()
                    }
                }
            );
        }

        // Get user info
        const user = await usersCollection.findOne({ licenseKey: licenseKey });

        return res.status(200).json({
            success: true,
            message: 'License key is valid',
            user: user ? {
                username: user.username,
                email: user.email,
                isPremium: user.isPremium,
                licenseKey: user.licenseKey,
                hwid: user.hwid
            } : null,
            keyauth: {
                username: data.info?.username,
                subscriptions: data.info?.subscriptions,
                expiry: data.info?.expiry
            }
        });

    } catch (error) {
        console.error('Verify license error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};
