const express = require('express');
const {
  getProfile,
  updateProfile,
  toggleFavoriteTrack,
  getFavoriteTracks,
  recordListeningEvent,
  getRecentlyPlayed,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.post('/me/favorites/:trackId', toggleFavoriteTrack);
router.get('/me/favorites', getFavoriteTracks);
router.post('/me/history', recordListeningEvent);
router.get('/me/history', getRecentlyPlayed);

module.exports = router;
