'use strict';

const logger = require('./logger');
const { callGemini, callGeminiJSON } = require('./geminiClient');
const { callGroq, callGroqJSON } = require('./groqClient');

/**
 * Send a prompt to the primary LLM (Gemini). If it fails after all retries,
 * fallback to Groq.
 * @param {{ system: string, user: string }} prompt
 * @param {object} [opts]
 * @returns {Promise<string>}
 */
async function callLLM(prompt, opts = {}) {
  try {
    return await callGemini(prompt, opts);
  } catch (geminiError) {
    logger.warn(`Primary LLM (Gemini) completely failed: ${geminiError.message}. Switching to Fallback LLM (Groq).`);
    return await callGroq(prompt, opts);
  }
}

/**
 * Send a prompt to the primary LLM (Gemini) to get JSON. If it fails after 
 * all retries, fallback to Groq JSON mode.
 * @param {{ system: string, user: string }} prompt
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
async function callLLMJSON(prompt, opts = {}) {
  try {
    return await callGeminiJSON(prompt, opts);
  } catch (geminiError) {
    logger.warn(`Primary LLM (Gemini) JSON completely failed: ${geminiError.message}. Switching to Fallback LLM (Groq).`);
    return await callGroqJSON(prompt, opts);
  }
}

module.exports = { callLLM, callLLMJSON };
