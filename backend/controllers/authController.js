'use strict';

const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const logger = require('../utils/logger');

// ── Config ────────────────────────────────────────────────────────────────────
const ACCESS_SECRET      = process.env.JWT_ACCESS_SECRET  || 'dev-access-secret-change-me';
const REFRESH_SECRET     = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';
const ACCESS_EXPIRES_IN  = process.env.JWT_ACCESS_EXPIRES_IN  || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN },
  );
}

function parseExpiry(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback 7d
  const val  = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return val * unit;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function getDevice(req) {
  return req.headers['user-agent']?.substring(0, 200) || 'unknown';
}

// ── Register ──────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        error  : 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const user = await User.create({
      email       : email.toLowerCase(),
      passwordHash: password,  // pre-save hook hashes it
      name        : name || '',
    });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt    = new Date(Date.now() + parseExpiry(REFRESH_EXPIRES_IN));

    await user.addRefreshToken(refreshToken, getDevice(req), expiresAt);

    logger.info(`User registered: ${user.email}`);
    return res.status(201).json({
      success: true,
      data   : {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    if (user.isLocked) {
      const minsLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        error  : `Account locked. Try again in ${minsLeft} minute(s).`,
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        error  : 'This account uses Google sign-in. Please log in with Google.',
      });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      await user.recordFailedLogin();
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    await user.recordSuccessfulLogin();

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt    = new Date(Date.now() + parseExpiry(REFRESH_EXPIRES_IN));

    await user.addRefreshToken(refreshToken, getDevice(req), expiresAt);

    logger.info(`User logged in: ${user.email}`);
    return res.json({
      success: true,
      data   : {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Refresh Token (rotation) ──────────────────────────────────────────────────
async function refreshTokenHandler(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required.' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    // One-time use: consume the token (removes it from DB)
    const consumed = await user.consumeRefreshToken(refreshToken);
    if (!consumed) {
      // Token reuse detected — potential theft. Revoke ALL tokens.
      logger.warn(`Refresh token reuse detected for user ${user.email}. Revoking all sessions.`);
      await user.revokeAllTokens();
      return res.status(401).json({
        success: false,
        error  : 'Suspicious activity detected. All sessions revoked. Please log in again.',
      });
    }

    // Issue new pair
    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const expiresAt       = new Date(Date.now() + parseExpiry(REFRESH_EXPIRES_IN));

    await user.addRefreshToken(newRefreshToken, getDevice(req), expiresAt);

    return res.json({
      success: true,
      data   : { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findById(req.user.id);
      if (user) {
        await user.consumeRefreshToken(refreshToken);
      }
    }

    logger.info(`User logged out: ${req.user.email}`);
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

// ── Forgot Password ──────────────────────────────────────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const rawToken  = crypto.randomBytes(32).toString('hex');
    const hashed    = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresIn = 60 * 60 * 1000; // 1 hour

    user.resetToken       = hashed;
    user.resetTokenExpiry = new Date(Date.now() + expiresIn);
    await user.save();

    // In production, send this via email. For now, log it.
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}&email=${user.email}`;
    logger.info(`Password reset requested for ${user.email}`);
    logger.info(`Reset URL (dev only): ${resetURL}`);

    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ── Reset Password ───────────────────────────────────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, token, and new password are required.' });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error  : 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email           : email.toLowerCase(),
      resetToken      : hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }

    user.passwordHash      = newPassword;  // pre-save hook hashes it
    user.resetToken        = null;
    user.resetTokenExpiry  = null;
    user.failedLoginAttempts = 0;
    user.lockUntil         = null;
    await user.save();

    // Revoke all sessions — force re-login everywhere
    await user.revokeAllTokens();

    logger.info(`Password reset completed for ${user.email}`);
    return res.json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

// ── Google OAuth Callback ─────────────────────────────────────────────────────
async function googleCallback(req, res, next) {
  try {
    const user = req.user; // set by passport
    if (!user) {
      return res.status(401).json({ success: false, error: 'Google authentication failed.' });
    }

    await user.recordSuccessfulLogin();

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt    = new Date(Date.now() + parseExpiry(REFRESH_EXPIRES_IN));

    await user.addRefreshToken(refreshToken, getDevice(req), expiresAt);

    logger.info(`Google OAuth login: ${user.email}`);

    // If a frontend URL is set, redirect with tokens as query params
    const frontendURL = process.env.FRONTEND_URL;
    if (frontendURL) {
      const userData = encodeURIComponent(JSON.stringify(user.toJSON()));
      return res.redirect(
        `${frontendURL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`,
      );
    }

    // Otherwise return JSON (API-only mode)
    return res.json({
      success: true,
      data   : { user: user.toJSON(), accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
};
