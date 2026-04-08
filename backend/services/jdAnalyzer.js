'use strict';

const { callGeminiJSON } = require('../utils/geminiClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Analyse a job description and return structured requirements.
 * @param {string} jdText
 * @returns {Promise<object>}
 */
async function analyzeJD(jdText) {
  logger.info('Analysing job description…');
  const prompt = getPrompt('jdAnalyzer', { JD_TEXT: jdText });
  const parsed = await callGeminiJSON(prompt);
  logger.info('JD analysed successfully');
  return parsed;
}

module.exports = { analyzeJD };
