'use strict';

require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const passport      = require('passport');
const rateLimit     = require('express-rate-limit');

const logger              = require('./backend/utils/logger');
const { connectDB }       = require('./backend/utils/db');
const { configurePassport } = require('./backend/config/passport');
const resumeRoutes        = require('./backend/routes/resumeRoutes');
const authRoutes          = require('./backend/routes/authRoutes');

// ─── App Bootstrap ────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ─── Rate Limiting (global API) ───────────────────────────────────────────────
const limiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : parseInt(process.env.RATE_LIMIT_MAX, 10) || 50,
  message  : { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders  : false,
});
app.use('/api/', limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Passport (Google OAuth) ─────────────────────────────────────────────────
app.use(passport.initialize());
configurePassport();

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api',  resumeRoutes);

// Health check
app.get('/health', (_req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const geminiReady = !!process.env.GEMINI_API_KEY;
  const groqReady = !!process.env.GROQ_API_KEY;

  let overallStatus = 'online';
  if (dbStatus !== 'connected' || !geminiReady) {
    overallStatus = 'degraded';
  }
  if (dbStatus !== 'connected' && !geminiReady && !groqReady) {
    overallStatus = 'offline';
  }

  res.json({
    status   : overallStatus,
    service  : 'AI Resume Optimizer',
    version  : '1.0.0',
    timestamp: new Date().toISOString(),
    details: {
      database: dbStatus,
      gemini: geminiReady ? 'ready' : 'missing_key',
      groq: groqReady ? 'ready' : 'missing_key',
    },
    frontend : process.env.FRONTEND_URL || 'Not configured',
    env      : process.env.NODE_ENV || 'development'
  });
});

// ─── Frontend Serving (Optional) ─────────────────────────────────────────────
const path = require('path');
const fs   = require('fs');
const frontendDistPath = path.join(__dirname, 'frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // SPA fallback for frontend routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Production fallback when backend and frontend are separate
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'AI Resume Optimizer API is running.',
      frontend: process.env.FRONTEND_URL || 'Not configured'
    });
  });
}

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  
  let safeErrorMsg = err.message || 'Internal Server Error';
  let status = err.status || 500;

  // Sanitize internal API details from leaving the backend
  if (safeErrorMsg.includes('429') || safeErrorMsg.toLowerCase().includes('quota') || safeErrorMsg.includes('Too Many Requests')) {
      safeErrorMsg = 'Our AI nodes are processing at maximum capacity. Please wait a moment and try again.';
      status = 429;
  } else if (safeErrorMsg.includes('GoogleGenerativeAI Error')) {
      safeErrorMsg = 'The AI engine encountered an unexpected error while processing your request. Please try again.';
      status = 502;
  } else if (safeErrorMsg.includes('LLM returned invalid JSON')) {
      safeErrorMsg = 'The neural analysis yielded an invalid format. Please retry the execution.';
      status = 502;
  }

  res.status(status).json({
    success: false,
    error  : safeErrorMsg,
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    const mode = process.env.NODE_ENV || 'development';
    const url  = mode === 'production' ? 'Render Service' : `http://localhost:${PORT}`;
    
    logger.info(`🚀 AI Resume Optimizer [${mode}] running on ${url}`);
    logger.info(`📄 Frontend: ${process.env.FRONTEND_URL || 'Not set'}`);
    logger.info(`🔑 Gemini model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}`);
  });
}

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

module.exports = app;
