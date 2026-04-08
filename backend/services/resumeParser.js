'use strict';

const { callLLMJSON } = require('../utils/llmClient');
const { getPrompt }      = require('../utils/promptLoader');
const logger             = require('../utils/logger');

/**
 * Parse raw resume text into structured JSON via the Gemini LLM.
 * @param {string} resumeText
 * @returns {Promise<object>}
 */
async function parseResume(resumeText) {
  logger.info('Parsing resume…');
  const prompt = getPrompt('resumeParser', { RESUME_TEXT: resumeText });
  const parsed = await callLLMJSON(prompt);
  logger.info('Resume parsed successfully');
  return parsed;
}

module.exports = { parseResume };
