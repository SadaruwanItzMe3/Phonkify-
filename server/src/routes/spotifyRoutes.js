const express = require('express');
const {
  getAuthUrl,
  callback,
  importPlaylists,
  importLikedSongs,
  searchSpotify,
} = require('../controllers/spotifyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/auth-url', protect, getAuthUrl);
router.get('/callback', protect, callback);
router.post('/import/playlists', protect, importPlaylists);
router.post('/import/liked-songs', protect, importLikedSongs);
router.get('/search', searchSpotify);

module.exports = router;
