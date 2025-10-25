/**
 * Orders API Endpoint - Combined
 * Handles both creating and retrieving orders
 * POST = Create new order
 * GET = Get user's orders
 */

const { ObjectId } = require('mongodb');
const clientPromise = require('../lib/mongodb');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        let decoded;
        
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.userId;

        // Connect to database
        const client = await clientPromise;
        const db = client.db('kiwitweaks');
        const usersCollection = db.collection('users');
        const ordersCollection = db.collection('orders');

        // GET = Retrieve orders
        if (req.method === 'GET') {
            const orders = await ordersCollection
                .find({ userId: new ObjectId(userId) })
                .sort({ orderDate: -1 })
                .toArray();

            return res.status(200).json({
                success: true,
                orders: orders.map(order => ({
                    orderId: order.orderId,
                    productName: order.productName,
                    amount: order.amount,
                    currency: order.currency,
                    licenseKey: order.licenseKey,
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    orderDate: order.orderDate,
                    accountCreatedDate: order.accountCreatedDate,
                    lastLoginDate: order.lastLoginDate,
                    lastDownloadDate: order.lastDownloadDate,
                    accountDays: order.accountDays
                }))
            });
        }

        // POST = Create order
        if (req.method === 'POST') {
            const { productName, amount, licenseKey } = req.body;

            if (!productName || amount === undefined) {
                return res.status(400).json({ error: 'Product name and amount are required' });
            }

            // Get user data
            const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Generate order ID
            const orderDate = new Date();
            const orderId = `KWT-${orderDate.getFullYear()}-${String(Date.now()).slice(-6)}`;

            // Create order with REAL data from user's account
            const order = {
                orderId: orderId,
                userId: user._id,
                userEmail: user.email,
                username: user.username || user.email.split('@')[0],
                
                // Product Info
                productName: productName,
                amount: amount,
                currency: 'USD',
                
                // License Key
                licenseKey: licenseKey || null,
                
                // Order Status
                status: 'completed',
                paymentMethod: 'demo',
                
                // REAL User Account Data
                accountCreatedDate: user.createdAt,
                lastLoginDate: user.lastLogin,
                lastDownloadDate: user.lastDownload || null,
                accountDays: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
                
                // Order Dates
                orderDate: orderDate,
                createdAt: orderDate,
                updatedAt: orderDate
            };

            // Insert order
            await ordersCollection.insertOne(order);

            // Add order to user's purchases array
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $push: {
                        purchases: {
                            orderId: orderId,
                            productName: productName,
                            amount: amount,
                            licenseKey: licenseKey || null,
                            date: orderDate
                        }
                    }
                }
            );

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order: {
                    orderId: orderId,
                    productName: productName,
                    amount: amount,
                    licenseKey: licenseKey,
                    status: 'completed',
                    orderDate: orderDate,
                    accountInfo: {
                        createdDate: user.createdAt,
                        lastLogin: user.lastLogin,
                        accountDays: order.accountDays
                    }
                }
            });
        }

        // Method not allowed
        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Orders API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
