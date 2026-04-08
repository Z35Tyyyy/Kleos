'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

// ── Key Rotation & Client Factory ─────────────────────────────────────────────
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_FALLBACK_1,
  process.env.GEMINI_API_KEY_FALLBACK_2,
  process.env.GEMINI_API_KEY_FALLBACK_3,
].filter(Boolean);

let currentKeyIndex = 0;

function getGenAI() {
  if (keys.length === 0) throw new Error('No GEMINI_API_KEY defined');
  return new GoogleGenerativeAI(keys[currentKeyIndex]);
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const MAX_RETRIES   = parseInt(process.env.LLM_RETRY_ATTEMPTS, 10) || 3;
const BASE_DELAY    = parseInt(process.env.LLM_RETRY_DELAY_MS, 10) || 1000;

/**
 * Send a prompt to Gemini and return the raw text response.
 * Retries with exponential backoff on transient failures.
 *
 * @param {{ system: string, user: string }} prompt
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @returns {Promise<string>}
 */
async function callGemini({ system, user }, opts = {}) {
  const modelName = opts.model || DEFAULT_MODEL;
  const generationConfig = {};
  if (opts.jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        generationConfig,
      });

      logger.debug(`Gemini call (attempt ${attempt}/${MAX_RETRIES}) → ${modelName} [key index: ${currentKeyIndex}]`);
      const result = await model.generateContent(user);
      const text   = result.response.text();
      return text;
    } catch (err) {
      lastError = err;
      logger.warn(`Gemini attempt ${attempt} failed: ${err.message}`);

      // Auto-rotate API key on quota/rate-limit issues
      if (err.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
        if (keys.length > 1) {
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          logger.info(`Rate limit hit. Rotating to API key index ${currentKeyIndex}.`);
        }
      }

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

async function callGeminiJSON(prompt, opts = {}) {
  const JSON_RETRIES = 2;
  let lastErr;

  for (let attempt = 1; attempt <= JSON_RETRIES; attempt++) {
    const raw = await callGemini(prompt, { ...opts, jsonMode: true });
    
    // Strip ```json ... ``` wrappers
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      lastErr = err;
      logger.warn(`JSON parse failed on attempt ${attempt}. Retrying LLM prompt. snippet: ${cleaned.substring(0, 50)}...`);
    }
  }

  logger.error('Failed to parse Gemini response as JSON definitively');
  throw new Error('LLM returned invalid JSON. Raw output logged for debugging.');
}

module.exports = { callGemini, callGeminiJSON };
