const express = require('express');
const router = express.Router();
const { getHistory, deleteHistoryItem } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHistory);
router.delete('/:id', deleteHistoryItem);

module.exports = router;
