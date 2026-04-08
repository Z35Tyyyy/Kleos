'use strict';

/**
 * promptLoader.js
 * ---------------
 * Loads backend/config/prompts.yaml once at startup (cached) and exposes
 * a helper to retrieve + interpolate prompts for any named agent.
 *
 * Usage:
 *   const { getPrompt } = require('./promptLoader');
 *
 *   const { system, user } = getPrompt('resumeParser', {
 *     RESUME_TEXT: rawText,
 *   });
 */

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PROMPTS_PATH = path.resolve(__dirname, '../config/prompts.yaml');

// ── Load & cache once ─────────────────────────────────────────────────────────
let _cache = null;

function loadPrompts() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(PROMPTS_PATH, 'utf8');
  _cache = yaml.load(raw);
  return _cache;
}

// ── Interpolate {{VARIABLE}} placeholders ─────────────────────────────────────
function interpolate(template, variables = {}) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in variables)) {
      throw new Error(`promptLoader: missing variable "{{${key}}}" for prompt interpolation`);
    }
    const val = variables[key];
    // Stringify objects/arrays so they embed cleanly in the prompt text
    return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  });
}

/**
 * getPrompt(agentName, variables)
 *
 * @param {string} agentName   - Top-level key in prompts.yaml (e.g. 'resumeParser')
 * @param {Object} variables   - Map of UPPER_SNAKE_CASE keys to replacement values
 * @returns {{ system: string, user: string }}
 */
function getPrompt(agentName, variables = {}) {
  const prompts = loadPrompts();

  if (!prompts[agentName]) {
    throw new Error(`promptLoader: unknown agent "${agentName}". Check backend/config/prompts.yaml.`);
  }

  const { system, user } = prompts[agentName];

  return {
    system: interpolate(system, variables),
    user  : interpolate(user,   variables),
  };
}

module.exports = { getPrompt, loadPrompts };
