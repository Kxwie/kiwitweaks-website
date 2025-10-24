/**
 * Caching Layer
 * Provides in-memory caching with TTL and Redis support
 */

const logger = require('./logger');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.redis = null;
    this.enabled = process.env.CACHE_ENABLED !== 'false';
    
    // Optional Redis support
    if (process.env.REDIS_URL) {
      this.initRedis();
    } else {
      logger.info('Using in-memory cache (Redis not configured)');
    }
    
    // Cleanup expired entries every minute
    if (this.enabled) {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    try {
      const redis = require('redis');
      this.redis = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });
      
      this.redis.on('error', (err) => {
        logger.error('Redis error', { error: err.message });
        this.redis = null; // Fallback to in-memory
      });
      
      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });
      
      await this.redis.connect();
    } catch (error) {
      logger.warn('Redis initialization failed, using in-memory cache', {
        error: error.message
      });
      this.redis = null;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.enabled) return null;
    
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          logger.debug('Cache hit (Redis)', { key });
          return JSON.parse(value);
        }
      }
      
      // Fallback to in-memory
      if (this.cache.has(key)) {
        const ttl = this.ttls.get(key);
        
        // Check if expired
        if (ttl && Date.now() > ttl) {
          this.cache.delete(key);
          this.ttls.delete(key);
          logger.debug('Cache expired', { key });
          return null;
        }
        
        logger.debug('Cache hit (memory)', { key });
        return this.cache.get(key);
      }
      
      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.enabled) return;
    
    try {
      // Store in Redis
      if (this.redis) {
        await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
        logger.debug('Cache set (Redis)', { key, ttl: ttlSeconds });
      }
      
      // Also store in memory for faster access
      this.cache.set(key, value);
      this.ttls.set(key, Date.now() + (ttlSeconds * 1000));
      
      logger.debug('Cache set (memory)', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  }

  /**
   * Delete from cache
   */
  async delete(key) {
    if (!this.enabled) return;
    
    try {
      if (this.redis) {
        await this.redis.del(key);
      }
      
      this.cache.delete(key);
      this.ttls.delete(key);
      
      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.enabled) return;
    
    try {
      if (this.redis) {
        await this.redis.flushAll();
      }
      
      this.cache.clear();
      this.ttls.clear();
      
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
    }
  }

  /**
   * Cleanup expired entries (in-memory only)
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, ttl] of this.ttls.entries()) {
      if (ttl < now) {
        this.cache.delete(key);
        this.ttls.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Cache cleanup', { entriesRemoved: cleaned });
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(key, fetchFn, ttlSeconds = 3600) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) return cached;
    
    // Cache miss - fetch data
    const value = await fetchFn();
    
    // Store in cache
    await this.set(key, value, ttlSeconds);
    
    return value;
  }

  /**
   * Cache statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      redis: !!this.redis,
      memoryEntries: this.cache.size,
      memorySize: JSON.stringify([...this.cache.entries()]).length
    };
  }
}

// Singleton instance
const cache = new CacheService();

module.exports = cache;
