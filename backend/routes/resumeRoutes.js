'use strict';

const express = require('express');
const multer  = require('multer');

const {
  optimizeResumeHandler,
  optimizeResumeUploadHandler,
  getResultHandler,
  getResultsHistoryHandler,
} = require('../controllers/resumeController');

const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer — in-memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits : { fileSize: parseInt(process.env.MAX_PDF_SIZE, 10) || 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are accepted.'));
    }
    cb(null, true);
  },
});

// All routes require authentication
router.use(authenticate);

// Optimize (JSON body)
router.post('/optimize-resume', optimizeResumeHandler);

// Optimize (PDF upload)
router.post('/optimize-resume/upload', upload.single('resume'), optimizeResumeUploadHandler);

// Results history
router.get('/results', getResultsHistoryHandler);

// Single result (owner-only via controller)
router.get('/results/:resultId', getResultHandler);

module.exports = router;
