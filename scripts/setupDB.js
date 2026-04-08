'use strict';

/**
 * scripts/setupDB.js
 * ──────────────────
 * Connects to MongoDB Atlas and ensures all collections + indexes exist.
 *
 * Usage:
 *   node scripts/setupDB.js
 *
 * Requires MONGODB_URI in .env (or pass as env var).
 */

require('dotenv').config();

const mongoose           = require('mongoose');
const User               = require('../backend/models/User');
const OptimizationResult = require('../backend/models/OptimizationResult');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Add it to your .env file.');
  process.exit(1);
}

async function setup() {
  console.log('🔌 Connecting to MongoDB Atlas…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');

  const db = mongoose.connection.db;

  // ── List existing collections ───────────────────────────────────────────────
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  console.log(`📦 Existing collections: ${existing.length ? existing.join(', ') : '(none)'}\n`);

  // ── Ensure User collection + indexes ────────────────────────────────────────
  console.log('👤 Setting up "users" collection…');
  await User.createCollection();
  await User.ensureIndexes();

  const userIndexes = await User.collection.indexes();
  console.log('   Indexes:');
  userIndexes.forEach((idx) => {
    console.log(`     • ${idx.name} → ${JSON.stringify(idx.key)}${idx.unique ? ' (unique)' : ''}${idx.sparse ? ' (sparse)' : ''}`);
  });
  console.log('   ✅ users ready\n');

  // ── Ensure OptimizationResult collection + indexes ──────────────────────────
  console.log('📄 Setting up "optimizationresults" collection…');
  await OptimizationResult.createCollection();
  await OptimizationResult.ensureIndexes();

  const resultIndexes = await OptimizationResult.collection.indexes();
  console.log('   Indexes:');
  resultIndexes.forEach((idx) => {
    const extras = [];
    if (idx.unique) extras.push('unique');
    if (idx.expireAfterSeconds != null) extras.push(`TTL: ${idx.expireAfterSeconds}s (${Math.round(idx.expireAfterSeconds / 86400)}d)`);
    const suffix = extras.length ? ` (${extras.join(', ')})` : '';
    console.log(`     • ${idx.name} → ${JSON.stringify(idx.key)}${suffix}`);
  });
  console.log('   ✅ optimizationresults ready\n');

  // ── Summary ─────────────────────────────────────────────────────────────────
  const finalCollections = (await db.listCollections().toArray()).map((c) => c.name);
  console.log('─'.repeat(50));
  console.log('🎉 Database setup complete!');
  console.log(`   Database : ${db.databaseName}`);
  console.log(`   Collections: ${finalCollections.join(', ')}`);
  console.log('─'.repeat(50));

  await mongoose.connection.close();
  console.log('\n🔒 Connection closed.');
}

setup().catch((err) => {
  console.error(`\n❌ Setup failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
