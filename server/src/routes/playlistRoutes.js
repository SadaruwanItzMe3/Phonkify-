const express = require('express');
const {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  sharePlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', protect, getMyPlaylists);
router.post('/', protect, createPlaylist);
router.get('/:id', getPlaylistById); // public playlists viewable without auth; controller checks ownership
router.patch('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/:id/tracks', protect, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', protect, removeTrackFromPlaylist);
router.post('/:id/share', protect, sharePlaylist);

module.exports = router;
