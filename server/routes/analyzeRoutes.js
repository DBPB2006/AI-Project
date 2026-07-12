const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Route requests to POST /api/analyze to the stock analysis controller
// Use optional authentication middleware to retrieve user info if a token is present
router.post('/', optionalAuth, analyzeController.analyzeStock);

module.exports = router;
