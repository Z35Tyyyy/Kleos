'use strict';

const { callLLMJSON } = require('../utils/llmClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Compare a parsed resume against a parsed JD and identify gaps.
 * @param {object} parsedResume
 * @param {object} parsedJD
 * @returns {Promise<object>}
 */
async function analyzeGaps(parsedResume, parsedJD) {
  logger.info('Running gap analysis…');
  const prompt = getPrompt('gapAnalysis', {
    PARSED_RESUME: parsedResume,
    PARSED_JD    : parsedJD,
  });
  const result = await callLLMJSON(prompt);
  logger.info(`Gap analysis complete — match: ${result.match_percentage}%`);
  return result;
}

module.exports = { analyzeGaps };
