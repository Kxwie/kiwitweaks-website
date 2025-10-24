/**
 * MongoDB Connection - OPTIMIZED VERSION
 * ✅ Connection pooling in all environments
 * ✅ Proper error handling
 * ✅ Health checks
 * ✅ Performance monitoring
 */

const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

const options = {
  maxPoolSize: 10,        // Max connections in pool
  minPoolSize: 2,         // Min connections to maintain
  maxIdleTimeMS: 30000,   // Close idle connections after 30s
  serverSelectionTimeoutMS: 5000,  // Timeout if can't connect
  socketTimeoutMS: 45000, // Socket timeout
  
  // Performance optimizations
  retryWrites: true,
  retryReads: true,
  w: 'majority',          // Write concern
  
  // Connection monitoring
  monitorCommands: process.env.NODE_ENV === 'development'
};

let client;
let clientPromise;

/**
 * Get MongoDB client (reuses connection across warm invocations)
 * FIXED: Now works properly in production (serverless)
 */
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  
  // Connection event listeners for monitoring
  client.on('connectionPoolCreated', () => {
    logger.info('MongoDB connection pool created');
  });
  
  client.on('connectionPoolClosed', () => {
    logger.warn('MongoDB connection pool closed');
  });
  
  client.on('serverHeartbeatFailed', (event) => {
    logger.error('MongoDB heartbeat failed', { error: event.failure });
  });
  
  // Store in global to persist across warm invocations
  global._mongoClientPromise = client.connect()
    .then(connectedClient => {
      logger.info('MongoDB connected successfully', {
        poolSize: options.maxPoolSize,
        environment: process.env.NODE_ENV
      });
      return connectedClient;
    })
    .catch(error => {
      logger.error('MongoDB connection failed', { error: error.message });
      throw error;
    });
}

clientPromise = global._mongoClientPromise;

/**
 * Get database instance with automatic retry
 */
async function getDb(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await clientPromise;
      return client.db('kiwitweaks');
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i + 1} failed`, {
        error: error.message,
        retriesLeft: retries - i - 1
      });
      
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const client = await clientPromise;
    const result = await client.db('kiwitweaks').command({ ping: 1 });
    
    return {
      status: 'healthy',
      timestamp: new Date(),
      details: {
        connected: result.ok === 1,
        poolSize: client.topology?.s?.pool?.totalConnectionCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message
    };
  }
}

/**
 * Graceful shutdown
 */
async function closeConnection() {
  try {
    const client = await clientPromise;
    await client.close();
    delete global._mongoClientPromise;
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection', { error: error.message });
  }
}

// Handle process termination
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', closeConnection);
  process.on('SIGTERM', closeConnection);
}

module.exports = {
  clientPromise,
  getDb,
  healthCheck,
  closeConnection
};
