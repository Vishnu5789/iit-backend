const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Check if OAuth credentials are configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Google OAuth Strategy (only if configured)
if (isGoogleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ 
          $or: [
            { oauthId: profile.id, oauthProvider: 'google' },
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          // Update OAuth info if user exists but wasn't OAuth user
          if (!user.oauthProvider) {
            user.oauthProvider = 'google';
            user.oauthId = profile.id;
            await user.save();
          }
          
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          fullName: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          oauthProvider: 'google',
          oauthId: profile.id,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          isVerified: profile.emails[0].verified || true,
          lastLogin: new Date()
        });

        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
    )
  );
  console.log('✓ Google OAuth configured');
} else {
  console.warn('⚠ Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

module.exports = passport;

