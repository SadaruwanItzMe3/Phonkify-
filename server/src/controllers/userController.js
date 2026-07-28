const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Track = require('../models/Track');
const ListeningEvent = require('../models/ListeningEvent');

// @route  GET /api/users/me
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @route  PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['username', 'avatarUrl', 'preferences'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @route  POST /api/users/me/favorites/:trackId
const toggleFavoriteTrack = asyncHandler(async (req, res) => {
  const { trackId } = req.params;
  const track = await Track.findById(trackId);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  const idx = req.user.favoriteTracks.findIndex((id) => id.toString() === trackId);
  let liked;
  if (idx === -1) {
    req.user.favoriteTracks.push(trackId);
    liked = true;
  } else {
    req.user.favoriteTracks.splice(idx, 1);
    liked = false;
  }
  await req.user.save();
  res.json({ success: true, liked });
});

// @route  GET /api/users/me/favorites
const getFavoriteTracks = asyncHandler(async (req, res) => {
  const user = await req.user.populate('favoriteTracks');
  res.json({ success: true, tracks: user.favoriteTracks });
});

// @route  POST /api/users/me/history
// Records a listening event and updates recently-played (called by the player on track start/complete)
const recordListeningEvent = asyncHandler(async (req, res) => {
  const { trackId, msPlayed, completed, source } = req.body;

  const track = await Track.findById(trackId);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  await ListeningEvent.create({ user: req.user._id, track: trackId, msPlayed, completed, source });
  await Track.updateOne({ _id: trackId }, { $inc: { playCount: 1 } });

  req.user.recentlyPlayed.unshift({ track: trackId, playedAt: new Date() });
  req.user.recentlyPlayed = req.user.recentlyPlayed.slice(0, 50);
  await req.user.save();

  res.status(201).json({ success: true });
});

// @route  GET /api/users/me/history
const getRecentlyPlayed = asyncHandler(async (req, res) => {
  const user = await req.user.populate('recentlyPlayed.track');
  res.json({ success: true, recentlyPlayed: user.recentlyPlayed });
});

module.exports = {
  getProfile,
  updateProfile,
  toggleFavoriteTrack,
  getFavoriteTracks,
  recordListeningEvent,
  getRecentlyPlayed,
};
