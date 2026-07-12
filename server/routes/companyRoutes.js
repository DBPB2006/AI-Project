const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// GET /api/companies?q=AAPL
// Returns an array of matched companies for autocomplete
router.get('/', companyController.searchCompanies);

module.exports = router;
