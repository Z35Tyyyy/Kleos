'use strict';

const { callGeminiJSON } = require('../utils/geminiClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Generate a tailored cover letter based on resume + JD + gap analysis.
 * @param {string} candidateSummary
 * @param {object} parsedJD
 * @param {object} gapAnalysis
 * @returns {Promise<object>}
 */
async function generateCoverLetter(candidateSummary, parsedJD, gapAnalysis) {
  logger.info('Generating cover letter…');
  const prompt = getPrompt('coverLetter', {
    CANDIDATE_SUMMARY: candidateSummary,
    PARSED_JD        : parsedJD,
    GAP_ANALYSIS     : gapAnalysis,
  });
  const result = await callGeminiJSON(prompt);
  logger.info('Cover letter generated');
  return result;
}

module.exports = { generateCoverLetter };
