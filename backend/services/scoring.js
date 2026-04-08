'use strict';

const { callGeminiJSON } = require('../utils/geminiClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Score the resume against the JD using ATS simulation criteria.
 * @param {object} parsedResume
 * @param {object} parsedJD
 * @returns {Promise<object>}
 */
async function scoreResume(parsedResume, parsedJD) {
  logger.info('Scoring resume (ATS simulation)…');
  const prompt = getPrompt('scoring', {
    PARSED_RESUME: parsedResume,
    PARSED_JD    : parsedJD,
  });
  const result = await callGeminiJSON(prompt);
  logger.info(`ATS score: ${result.overall_score}/100 (${result.verdict})`);
  return result;
}

module.exports = { scoreResume };
