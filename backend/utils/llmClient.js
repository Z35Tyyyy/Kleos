'use strict';

const logger = require('./logger');
const { callGemini, callGeminiJSON } = require('./geminiClient');
const { callGroq, callGroqJSON } = require('./groqClient');

// ── Circuit Breaker State ─────────────────────────────────────────────
// If Gemini goes down, we "open" the circuit to route directly to Groq.
// This prevents every subsequent step (parsing, gap analysis, scoring, etc.) 
// from individually waiting 10+ seconds failing against an unresponsive API.
let circuitOpenUntil = 0;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function isCircuitOpen() {
  return Date.now() < circuitOpenUntil;
}

function openCircuit() {
  circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  logger.warn('Circuit breaker OPENED. Routing all LLM traffic to Groq for the next 5 minutes.');
}

/**
 * Send a prompt to the primary LLM (Gemini). If it fails after all retries,
 * fallback to Groq and open the circuit breaker.
 */
async function callLLM(prompt, opts = {}) {
  if (isCircuitOpen()) {
    logger.debug('Circuit is open — routing directly to Groq');
    return await callGroq(prompt, opts);
  }

  try {
    return await callGemini(prompt, opts);
  } catch (geminiError) {
    logger.warn(`Primary LLM completely failed: ${geminiError.message}. Switching to Fallback LLM.`);
    openCircuit();
    return await callGroq(prompt, opts);
  }
}

/**
 * Send a prompt to the primary LLM (Gemini) to get JSON. If it fails after 
 * all retries, fallback to Groq JSON mode and open the circuit breaker.
 */
async function callLLMJSON(prompt, opts = {}) {
  if (isCircuitOpen()) {
    logger.debug('Circuit is open — routing JSON request directly to Groq');
    return await callGroqJSON(prompt, opts);
  }

  try {
    return await callGeminiJSON(prompt, opts);
  } catch (geminiError) {
    logger.warn(`Primary LLM JSON completely failed: ${geminiError.message}. Switching to Fallback LLM.`);
    openCircuit();
    return await callGroqJSON(prompt, opts);
  }
}

module.exports = { callLLM, callLLMJSON };
