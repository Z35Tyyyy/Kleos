'use strict';

/**
 * Assemble the final API response from all pipeline stage outputs.
 *
 * @param {object} params
 * @param {object} params.parsedResume
 * @param {object} params.parsedJD
 * @param {object} params.gapAnalysis
 * @param {object} params.optimizedResume
 * @param {object} params.atsScore
 * @param {object} [params.coverLetter]
 * @returns {object}
 */
function formatResponse({ parsedResume, parsedJD, gapAnalysis, optimizedResume, atsScore, coverLetter }) {
  return {
    success: true,
    data: {
      original_resume : parsedResume,
      job_description : parsedJD,
      gap_analysis    : gapAnalysis,
      improved_resume : optimizedResume,
      ats_score       : atsScore,
      ...(coverLetter && { cover_letter: coverLetter }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version  : '1.0.0',
    },
  };
}

module.exports = { formatResponse };
