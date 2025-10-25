/**
 * Update HWID Endpoint
 * Updates user's HWID when they activate their license
 * Called from KeyAuth client
 */

const clientPromise = require('../../lib/mongodb');
const jwt = require('jsonwebtoken');

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
        
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }

        const { licenseKey, hwid } = req.body;

        if (!licenseKey || !hwid) {
            return res.status(400).json({ 
                success: false, 
                error: 'License key and HWID are required' 
            });
        }

        // Connect to database
        const client = await clientPromise;
        const db = client.db('kiwitweaks');
        const usersCollection = db.collection('users');

        // Find user by license key and update HWID
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

    } catch (error) {
        console.error('Update HWID error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
