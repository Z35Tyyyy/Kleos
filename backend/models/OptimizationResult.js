'use strict';

const mongoose = require('mongoose');

const TTL_DAYS = parseInt(process.env.RESULT_TTL_DAYS, 10) || 30;

const optimizationResultSchema = new mongoose.Schema({
  resultId: {
    type    : String,
    required: true,
    unique  : true,
    index   : true,
  },
  userId: {
    type    : mongoose.Schema.Types.ObjectId,
    ref     : 'User',
    required: true,
    index   : true,
  },
  originalResume : { type: mongoose.Schema.Types.Mixed, required: true },
  jobDescription : { type: mongoose.Schema.Types.Mixed, required: true },
  gapAnalysis    : { type: mongoose.Schema.Types.Mixed, required: true },
  improvedResume : { type: mongoose.Schema.Types.Mixed, required: true },
  atsScore       : { type: mongoose.Schema.Types.Mixed, required: true },
  coverLetter    : { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt      : { type: Date, default: Date.now },
});

// TTL index — auto-delete after configured days
optimizationResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: TTL_DAYS * 24 * 60 * 60 });

module.exports = mongoose.model('OptimizationResult', optimizationResultSchema);
