const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Route requests to GET /api/companies to search companies by query parameters
// Retrieve a list of matching company documents for frontend autocomplete widgets
router.get('/', companyController.searchCompanies);

module.exports = router;
