/**
 * License Key Generator
 * Generates unique license keys for purchases
 */

const crypto = require('crypto');

/**
 * Generate a random license key
 */
function generateLicenseKey() {
  // Generate 32 random bytes
  const randomBytes = crypto.randomBytes(16);
  
  // Convert to hex string (32 characters)
  const key = randomBytes.toString('hex');
  
  // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  return key.match(/.{1,4}/g).join('-').toUpperCase();
}

/**
 * Validate license key format
 */
function validateLicenseKeyFormat(key) {
  // Check if key matches format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  const pattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
  return pattern.test(key);
}

module.exports = {
  generateLicenseKey,
  validateLicenseKeyFormat
};
