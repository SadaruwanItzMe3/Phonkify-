const express = require('express');
const {
  getTrending,
  getNewReleases,
  searchTracks,
  getTrackById,
  importFromYouTube,
  matchSpotifyToYouTube,
} = require('../controllers/trackController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/new-releases', getNewReleases);
router.get('/search', searchTracks);
router.get('/:id', getTrackById);
router.post('/import-from-youtube', protect, importFromYouTube);
router.post('/match-spotify', protect, matchSpotifyToYouTube);

module.exports = router;
