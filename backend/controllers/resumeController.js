'use strict';

const { v4: uuidv4 } = require('uuid');

const logger = require('../utils/logger');
const { formatResponse } = require('../utils/outputFormatter');

const { parseResume }          = require('../services/resumeParser');
const { analyzeJD }            = require('../services/jdAnalyzer');
const { analyzeGaps }          = require('../services/gapAnalysis');
const { optimizeResume }       = require('../services/optimizer');
const { scoreResume }          = require('../services/scoring');
const { generateCoverLetter }  = require('../services/coverLetter');
const { extractTextFromPDF }   = require('../utils/pdfParser');

const OptimizationResult = require('../models/OptimizationResult');

/**
 * POST /api/optimize-resume
 * Body: { resume_text: string, job_description: string, include_cover_letter?: boolean }
 * Requires: authenticate middleware (req.user must be set)
 */
async function optimizeResumeHandler(req, res, next) {
  try {
    const { resume_text, include_cover_letter = false } = req.body;
    const raw_jd = req.body.job_description || req.body.jobDescription;
    const isGeneral = !raw_jd || raw_jd.trim().length < 10;
    const job_description = isGeneral 
      ? "GENERAL_OPTIMIZATION_REQUEST: No specific job description provided. Evaluate based on general resume standards and industry best practices for the candidate's field."
      : raw_jd;

    if (!resume_text) {
      return res.status(400).json({
        success: false,
        error  : '"resume_text" is required.',
      });
    }

    logger.info(`Starting resume optimization pipeline for user ${req.user.email}…`);

    // 1. Parse resume
    const parsedResume = await parseResume(resume_text);

    // 2. Analyse job description
    const parsedJD = await analyzeJD(job_description);
    if (isGeneral) parsedJD.isGeneral = true;

    // 3. Gap analysis
    const gapAnalysis = await analyzeGaps(parsedResume, parsedJD);

    // 4. Build target keywords list from the JD
    const targetKeywords = [
      ...(parsedJD.required_skills || []),
      ...(parsedJD.preferred_skills || []),
      ...(parsedJD.keywords || []),
    ];

    // 5. Optimise resume
    const optimizedResume = await optimizeResume(parsedResume, gapAnalysis, targetKeywords);

    // 6. ATS score
    const atsScore = await scoreResume(parsedResume, parsedJD);

    // 7. Optional cover letter
    let coverLetter = null;
    if (include_cover_letter) {
      const candidateSummary = parsedResume.summary
        || `${parsedResume.contact?.name || 'Candidate'} — ${(parsedResume.skills || []).slice(0, 10).join(', ')}`;
      coverLetter = await generateCoverLetter(candidateSummary, parsedJD, gapAnalysis);
    }

    // 8. Assemble response
    const response = formatResponse({
      parsedResume,
      parsedJD,
      gapAnalysis,
      optimizedResume,
      atsScore,
      coverLetter,
    });

    // 9. Persist to MongoDB
    const resultId = uuidv4();
    try {
      await OptimizationResult.create({
        resultId,
        userId         : req.user.id,
        originalResume : parsedResume,
        jobDescription : parsedJD,
        gapAnalysis,
        improvedResume : optimizedResume,
        atsScore,
        coverLetter,
      });
      response.data.resultId = resultId;
      logger.info(`Result saved: ${resultId}`);
    } catch (dbErr) {
      // Don't fail the whole request if DB save fails
      logger.error(`Failed to save result to DB: ${dbErr.message}`);
    }

    logger.info('Pipeline complete ✓');
    return res.json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/optimize-resume/upload
 * Multipart PDF upload (field name: "resume") + "job_description" text field
 */
async function optimizeResumeUploadHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'PDF file is required (field: "resume").' });
    }

    const raw_jd = req.body.job_description || req.body.jobDescription;
    const isGeneral = !raw_jd || raw_jd.trim().length < 10;
    const job_description = isGeneral 
      ? "GENERAL_OPTIMIZATION_REQUEST: No specific job description provided. Evaluate based on general resume standards and industry best practices for the candidate's field."
      : raw_jd;


    const resumeText = await extractTextFromPDF(req.file.buffer);
    const include_cover_letter = req.body.include_cover_letter === 'true';

    // Re-use the text handler
    req.body.resume_text = resumeText;
    req.body.include_cover_letter = include_cover_letter;
    return optimizeResumeHandler(req, res, next);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results/:resultId
 * Fetch a saved result — owner only
 */
async function getResultHandler(req, res, next) {
  try {
    const result = await OptimizationResult.findOne({
      resultId: req.params.resultId,
      userId  : req.user.id,
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/results
 * List all results for the authenticated user (paginated)
 */
async function getResultsHistoryHandler(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const [results, total] = await Promise.all([
      OptimizationResult.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('resultId atsScore.overall_score atsScore.verdict createdAt jobDescription.job_title'),
      OptimizationResult.countDocuments({ userId: req.user.id }),
    ]);

    return res.json({
      success: true,
      data   : results,
      meta   : { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  optimizeResumeHandler,
  optimizeResumeUploadHandler,
  getResultHandler,
  getResultsHistoryHandler,
};
