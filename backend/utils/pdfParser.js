'use strict';

const pdfParse = require('pdf-parse');
const logger   = require('./logger');

/**
 * Extract plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(buffer) {
  logger.debug('Extracting text from PDF buffer…');
  const data = await pdfParse(buffer);
  if (!data.text || data.text.trim().length === 0) {
    throw new Error('PDF appears to be empty or image-only. Please provide a text-based PDF.');
  }
  logger.info(`Extracted ${data.text.length} chars from PDF (${data.numpages} pages)`);
  return data.text;
}

module.exports = { extractTextFromPDF };
