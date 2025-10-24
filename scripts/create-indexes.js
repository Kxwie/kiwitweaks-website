/**
 * Database Initialization Script
 * Creates all required indexes for optimal query performance
 * Run with: node scripts/create-indexes.js
 */

require('dotenv').config();
const { createIndexes } = require('../utils/database');
const logger = require('../utils/logger');

async function main() {
  try {
    logger.info('Creating database indexes...');
    await createIndexes();
    logger.info('✅ All indexes created successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create indexes', { error: error.message });
    process.exit(1);
  }
}

main();
