const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  addHolding,
  updateHolding,
  removeHolding,
  updateCash,
  updateConsent,
  resetPortfolio
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure all portfolio routes are protected

router.get('/', getPortfolio);
router.post('/add', addHolding);
router.put('/update/:symbol', updateHolding);
router.delete('/remove/:symbol', removeHolding);
router.put('/cash', updateCash);
router.put('/consent', updateConsent);
router.delete('/reset', resetPortfolio);

module.exports = router;
