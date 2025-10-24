/**
 * NextAuth.js API Handler (Vercel Serverless Function)
 * Handles all authentication requests
 * Routes: /api/auth/signin, /api/auth/signout, /api/auth/session, etc.
 */

const NextAuth = require("next-auth").default;
const authConfig = require("../../lib/auth-config");

module.exports = NextAuth(authConfig);
