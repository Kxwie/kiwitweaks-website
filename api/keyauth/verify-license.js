/**
 * Verify License Key Endpoint
 * Verifies a license key with KeyAuth AND updates HWID
 * Combined endpoint to save serverless function count
 * Used by software to validate user's license
 */

const clientPromise = require('../../lib/mongodb');
const jwt = require('jsonwebtoken');

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
        const { licenseKey, hwid, action } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'License key is required' 
            });
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db('kiwitweaks');
        const usersCollection = db.collection('users');

        // Handle different actions
        if (action === 'update-hwid') {
            // Update HWID only (requires authentication)
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Unauthorized' 
                });
            }

            const token = authHeader.substring(7);
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (error) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid token' 
                });
            }

            if (!hwid) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'HWID is required' 
                });
            }

            const result = await usersCollection.updateOne(
                { licenseKey: licenseKey },
                { 
                    $set: { 
                        hwid: hwid,
                        hwidUpdatedAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Invalid license key' 
                });
            }

            return res.status(200).json({
                success: true,
                message: 'HWID updated successfully'
            });
        }

        // Default action: Verify with KeyAuth
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
