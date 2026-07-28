const express = require('express');
const { discoverWeekly, dailyMix, moodPlaylist } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/discover-weekly', protect, discoverWeekly);
router.get('/daily-mix', dailyMix);
router.get('/mood', moodPlaylist);

module.exports = router;
