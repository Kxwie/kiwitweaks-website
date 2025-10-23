/**
 * MongoDB Connection Utility
 * Handles database connection with connection pooling
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env file');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

module.exports = clientPromise;
