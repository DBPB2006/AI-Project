const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/analyze
// Attach req.user if JWT is provided
router.post('/', optionalAuth, analyzeController.analyzeStock);

module.exports = router;
