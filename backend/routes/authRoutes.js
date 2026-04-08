'use strict';

const express   = require('express');
const passport  = require('passport');
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
} = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Rate limiters (stricter for auth) ─────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 5,
  message : { success: false, error: 'Too many registration attempts. Try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 10,
  message : { success: false, error: 'Too many login attempts. Try again later.' },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 20,
  message : { success: false, error: 'Too many refresh requests. Try again later.' },
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 3,
  message : { success: false, error: 'Too many reset requests. Try again later.' },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 5,
  message : { success: false, error: 'Too many reset attempts. Try again later.' },
});

// ── Email/Password Auth ───────────────────────────────────────────────────────
router.post('/register',        registerLimiter, register);
router.post('/login',           loginLimiter,    login);
router.post('/refresh-token',   refreshLimiter,  refreshTokenHandler);
router.post('/logout',          authenticate,    logout);
router.post('/forgot-password', forgotLimiter,   forgotPassword);
router.post('/reset-password',  resetLimiter,    resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false,
    prompt: 'select_account'
  }),
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  googleCallback,
);

router.get('/google/failure', (_req, res) => {
  res.status(401).json({ success: false, error: 'Google authentication failed.' });
});

module.exports = router;
