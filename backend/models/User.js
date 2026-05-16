'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const SALT_ROUNDS        = 12;
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
const LOCK_DURATION_MS   = (parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 15) * 60 * 1000;
const MAX_SESSIONS       = parseInt(process.env.MAX_SESSIONS, 10) || 5;

// ── Refresh Token Sub-Schema ──────────────────────────────────────────────────
const refreshTokenSchema = new mongoose.Schema({
  token:     { type: String, required: true },
  device:    { type: String, default: 'unknown' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
}, { _id: true });

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email: {
    type     : String,
    required : true,
    unique   : true,
    lowercase: true,
    trim     : true,
    match    : [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  passwordHash: { type: String },  // null for OAuth-only users
  name        : { type: String, trim: true, default: '' },
  role        : { type: String, enum: ['user', 'admin'], default: 'user' },

  // Google OAuth
  googleId: { type: String, unique: true, sparse: true },

  // Refresh tokens (per-device sessions)
  refreshTokens: {
    type    : [refreshTokenSchema],
    default : [],
    validate: {
      validator: (v) => v.length <= MAX_SESSIONS + 1, // +1 buffer for rotation
      message  : 'Too many active sessions',
    },
  },

  // Password reset
  resetToken      : { type: String, default: null },
  resetTokenExpiry: { type: Date,   default: null },

  // Account security
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil          : { type: Date,   default: null },
  lastLoginAt        : { type: Date,   default: null },
}, {
  timestamps: true,
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if passwordHash was modified (or is new)
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Methods ───────────────────────────────────────────────────────────────────

/** Compare plaintext password against stored hash. */
userSchema.methods.comparePassword = async function (plaintext) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plaintext, this.passwordHash);
};

/** Record a failed login attempt; lock if threshold reached. */
userSchema.methods.recordFailedLogin = async function () {
  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }
  await this.constructor.updateOne({ _id: this._id }, updates);
};

/** Reset failed attempts on successful login. */
userSchema.methods.recordSuccessfulLogin = async function () {
  await this.constructor.updateOne({ _id: this._id }, {
    $set  : { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
  });
};

/** Add a refresh token (hash it first). Evict oldest if over limit. */
userSchema.methods.addRefreshToken = async function (rawToken, device, expiresAt) {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Evict expired tokens
  this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > new Date());

  // Evict oldest if at session limit
  if (this.refreshTokens.length >= MAX_SESSIONS) {
    this.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
    while (this.refreshTokens.length >= MAX_SESSIONS) {
      this.refreshTokens.shift();
    }
  }

  this.refreshTokens.push({ token: hashed, device, expiresAt });
  await this.save();
};

/** Find and remove a matching refresh token. Returns true if found. */
userSchema.methods.consumeRefreshToken = async function (rawToken) {
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const index  = this.refreshTokens.findIndex((t) => t.token === hashed);

  if (index !== -1) {
    this.refreshTokens.splice(index, 1);
    await this.save();
    return true;
  }
  return false;
};

/** Revoke all refresh tokens (e.g. password reset). */
userSchema.methods.revokeAllTokens = async function () {
  this.refreshTokens = [];
  await this.save();
};

// ── JSON transform — never expose sensitive fields ────────────────────────────
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
