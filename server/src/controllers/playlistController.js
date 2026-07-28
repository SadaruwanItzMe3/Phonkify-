const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Playlist = require('../models/Playlist');

const isOwnerOrCollaborator = (playlist, userId) =>
  playlist.owner.toString() === userId.toString() ||
  playlist.collaborators.some((c) => c.toString() === userId.toString());

// @route  POST /api/playlists
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPublic, isCollaborative, coverImageUrl } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Playlist name is required');
  }

  const playlist = await Playlist.create({
    name,
    description,
    isPublic: !!isPublic,
    isCollaborative: !!isCollaborative,
    coverImageUrl,
    owner: req.user._id,
  });

  res.status(201).json({ success: true, playlist });
});

// @route  GET /api/playlists/mine
const getMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({
    $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
  }).sort({ updatedAt: -1 });
  res.json({ success: true, playlists });
});

// @route  GET /api/playlists/:id
const getPlaylistById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate('tracks.track')
    .populate('owner', 'username avatarUrl');

  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }

  const isOwner = req.user && playlist.owner._id.toString() === req.user._id.toString();
  if (!playlist.isPublic && !isOwner) {
    res.status(403);
    throw new Error('This playlist is private');
  }

  res.json({ success: true, playlist });
});

// @route  PATCH /api/playlists/:id
const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }
  if (!isOwnerOrCollaborator(playlist, req.user._id)) {
    res.status(403);
    throw new Error('You do not have permission to edit this playlist');
  }

  const editableFields = ['name', 'description', 'isPublic', 'isCollaborative', 'coverImageUrl'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) playlist[field] = req.body[field];
  });

  await playlist.save();
  res.json({ success: true, playlist });
});

// @route  DELETE /api/playlists/:id
const deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }
  if (playlist.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the owner can delete this playlist');
  }

  await playlist.deleteOne();
  res.json({ success: true, message: 'Playlist deleted' });
});

// @route  POST /api/playlists/:id/tracks
const addTrackToPlaylist = asyncHandler(async (req, res) => {
  const { trackId } = req.body;
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }
  if (!isOwnerOrCollaborator(playlist, req.user._id)) {
    res.status(403);
    throw new Error('You do not have permission to edit this playlist');
  }

  const alreadyAdded = playlist.tracks.some((t) => t.track.toString() === trackId);
  if (!alreadyAdded) {
    playlist.tracks.push({ track: trackId, addedBy: req.user._id });
    await playlist.save();
  }

  res.status(201).json({ success: true, playlist });
});

// @route  DELETE /api/playlists/:id/tracks/:trackId
const removeTrackFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }
  if (!isOwnerOrCollaborator(playlist, req.user._id)) {
    res.status(403);
    throw new Error('You do not have permission to edit this playlist');
  }

  playlist.tracks = playlist.tracks.filter((t) => t.track.toString() !== req.params.trackId);
  await playlist.save();
  res.json({ success: true, playlist });
});

// @route  POST /api/playlists/:id/share
// Generates (or returns existing) a public share slug for the playlist
const sharePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist not found');
  }
  if (playlist.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the owner can share this playlist');
  }

  if (!playlist.shareSlug) {
    playlist.shareSlug = crypto.randomBytes(6).toString('hex');
  }
  playlist.isPublic = true;
  await playlist.save();

  res.json({ success: true, shareSlug: playlist.shareSlug });
});

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  sharePlaylist,
};
