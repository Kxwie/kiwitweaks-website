/**
 * NextAuth.js Configuration
 * Works with vanilla JavaScript and serverless functions
 */

const { MongoDBAdapter } = require("@next-auth/mongodb-adapter");
const clientPromise = require("./mongodb");
const bcrypt = require('bcryptjs');
const CredentialsProvider = require("next-auth/providers/credentials");

/**
 * NextAuth Configuration
 * Email/Password authentication only
 */
const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    // Email/Password (Credentials)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        const client = await clientPromise;
        const db = client.db('kiwitweaks');
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(
          credentials.password, 
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'user'
        };
      }
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Pages
  pages: {
    signIn: '/auth.html',
    signOut: '/auth.html',
    error: '/auth.html',
    verifyRequest: '/auth.html?verify=true',
  },

  // Callbacks
  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      
      if (account?.provider) {
        token.provider = account.provider;
      }

      return token;
    },

    // Called when session is checked
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.provider = token.provider;
      }
      return session;
    },

    // Called on sign in
    async signIn({ user, account, profile }) {
      // Allow OAuth and credentials
      return true;
    },

    // Called on redirect
    async redirect({ url, baseUrl }) {
      // Redirect to homepage after sign in
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Events
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} via ${account.provider}`);
      
      // Log to database
      const client = await clientPromise;
      const db = client.db('kiwitweaks');
      await db.collection('auth_logs').insertOne({
        type: 'signIn',
        userId: user.id,
        email: user.email,
        provider: account.provider,
        isNewUser,
        timestamp: new Date(),
        ip: null, // Can be added from request
      });
    },

    async signOut({ token }) {
      console.log(`👋 User signed out: ${token.email}`);
    },

    async createUser({ user }) {
      console.log(`🆕 New user created: ${user.email}`);
    },
  },

  // Security
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  
  // Trust host for Vercel deployment
  trustHost: true,

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',
};

module.exports = authConfig;
