/**
 * Sign In Endpoint
 * POST /api/auth/signin
 */

const { Auth } = require("@auth/core");
const authConfig = require("../../lib/auth-config");

module.exports = async (req, res) => {
  req.query = { nextauth: ['signin'] };
  
  try {
    return await Auth(req, {
      ...authConfig,
      basePath: '/api/auth',
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({ error: error.message });
  }
};
