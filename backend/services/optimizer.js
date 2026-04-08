'use strict';

const { callGeminiJSON } = require('../utils/geminiClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Rewrite and optimise resume bullets using gap analysis insights.
 * @param {object} parsedResume
 * @param {object} gapAnalysis
 * @param {string[]} targetKeywords
 * @returns {Promise<object>}
 */
async function optimizeResume(parsedResume, gapAnalysis, targetKeywords) {
  logger.info('Optimising resume…');
  const prompt = getPrompt('optimizer', {
    PARSED_RESUME  : parsedResume,
    GAP_ANALYSIS   : gapAnalysis,
    TARGET_KEYWORDS: targetKeywords,
  });
  const result = await callGeminiJSON(prompt);
  logger.info(`Resume optimised — ${result.keywords_added?.length || 0} keywords added`);
  return result;
}

module.exports = { optimizeResume };
