'use strict';

const Groq = require('groq-sdk');
const logger = require('./logger');

// ── Key Rotation & Client Factory ─────────────────────────────────────────────
const keys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_FALLBACK_1,
  process.env.GROQ_API_KEY_FALLBACK_2,
  process.env.GROQ_API_KEY_FALLBACK_3,
].filter(Boolean);

let currentKeyIndex = 0;

function getGroqClient() {
  if (keys.length === 0) throw new Error('No GROQ_API_KEY defined');
  return new Groq({ apiKey: keys[currentKeyIndex] });
}

const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-120b';
const MAX_RETRIES = parseInt(process.env.LLM_RETRY_ATTEMPTS, 10) || 3;
const BASE_DELAY = parseInt(process.env.LLM_RETRY_DELAY_MS, 10) || 1000;

/**
 * Send a prompt to Groq and return the raw text response.
 * Retries with exponential backoff on transient failures.
 * @param {{ system: string, user: string }} prompt
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @returns {Promise<string>}
 */
async function callGroq({ system, user }, opts = {}) {
  const modelName = opts.model || FALLBACK_MODEL;
  
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getGroqClient();
      logger.debug(`Groq call (attempt ${attempt}/${MAX_RETRIES}) → ${modelName} [key index: ${currentKeyIndex}]`);
      
      // We append the JSON requirement for groq if jsonMode is selected.
      let responseFormat = undefined;
      let systemContent = system;
      if (opts.jsonMode) {
        responseFormat = { type: 'json_object' };
        // Explicitly instruct Groq to output JSON. This is crucial for JSON object mode.
        systemContent = system + '\n\nIMPORTANT: You must output your response in valid JSON format.';
      }

      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: user }
        ],
        response_format: responseFormat,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err) {
      lastError = err;
      logger.warn(`Groq attempt ${attempt} failed: ${err.message}`);

      // Auto-rotate API key on quota/rate-limit issues
      if (err.status === 429 || err.message?.includes('429') || err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('rate limit')) {
        if (keys.length > 1) {
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          logger.info(`Rate limit hit. Rotating to Groq API key index ${currentKeyIndex}.`);
        }
      }

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  
  logger.error(`Groq error after exhaustive retries: ${lastError.message}`);
  throw lastError;
}

async function callGroqJSON(prompt, opts = {}) {
  const JSON_RETRIES = 2;
  let lastErr;

  for (let attempt = 1; attempt <= JSON_RETRIES; attempt++) {
    const raw = await callGroq(prompt, { ...opts, jsonMode: true });

    // Strip possible markdown formatting if Groq returns it despite JSON mode
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      lastErr = err;
      logger.warn(`Groq JSON parse failed on attempt ${attempt}. Retrying prompt. snippet: ${cleaned.substring(0, 50)}...`);
    }
  }
  
  logger.error('Failed to parse Groq response as JSON definitively');
  throw new Error('Fallback LLM returned invalid JSON. Raw output logged for debugging.');
}

module.exports = { callGroq, callGroqJSON };
