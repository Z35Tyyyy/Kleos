'use strict';

const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const logger = require('../utils/logger');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

/**
 * authenticate — verify JWT access token and attach req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access token required.' });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Access token expired.' : 'Invalid access token.';
      return res.status(401).json({ success: false, error: message });
    }

    const user = await User.findById(payload.id).select('-passwordHash -refreshTokens');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists.' });
    }

    if (user.isLocked) {
      return res.status(423).json({ success: false, error: 'Account is temporarily locked.' });
    }

    req.user = { id: user._id.toString(), email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
}

/**
 * authorizeRoles — restrict to specific roles
 * Usage: router.get('/admin', authenticate, authorizeRoles('admin'), handler)
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
