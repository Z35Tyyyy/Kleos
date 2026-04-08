'use strict';

const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');
const logger         = require('../utils/logger');

function configurePassport() {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL  = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  if (!clientID || !clientSecret) {
    logger.warn('Google OAuth credentials not set — Google login disabled.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL,
    scope: ['profile', 'email'],
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email    = profile.emails?.[0]?.value;
      const googleId = profile.id;
      const name     = profile.displayName || '';

      if (!email) {
        return done(new Error('Google account has no email associated.'));
      }

      // Check if user exists by googleId or email
      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (user) {
        // Link Google ID if user registered with email/password first
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
          logger.info(`Linked Google account to existing user: ${email}`);
        }
      } else {
        // Create new user (no password — OAuth only)
        user = await User.create({ email, name, googleId });
        logger.info(`New user created via Google OAuth: ${email}`);
      }

      return done(null, user);
    } catch (err) {
      logger.error(`Google OAuth error: ${err.message}`);
      return done(err);
    }
  }));

  // Serialize / deserialize (only needed if using sessions — we use JWT, but passport requires it)
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  logger.info('✅ Google OAuth strategy configured');
}

module.exports = { configurePassport };
