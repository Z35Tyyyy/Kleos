'use strict';

const mongoose = require('mongoose');
const logger   = require('./logger');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.warn('MONGODB_URI not set — skipping database connection. Data will NOT be persisted.');
    return;
  }

  try {
    await mongoose.connect(uri);
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

// Graceful shutdown
async function disconnectDB() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed (app shutdown)');
}

process.on('SIGINT',  () => disconnectDB().then(() => process.exit(0)));
process.on('SIGTERM', () => disconnectDB().then(() => process.exit(0)));

module.exports = { connectDB };
