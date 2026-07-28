const asyncHandler = require('express-async-handler');
const Track = require('../models/Track');
const youtubeService = require('../services/youtubeService');
const spotifyService = require('../services/spotifyService');

// @route  GET /api/tracks/trending
const getTrending = asyncHandler(async (req, res) => {
  const { genre } = req.query;
  const filter = genre ? { genre } : {};
  const tracks = await Track.find(filter).sort({ playCount: -1 }).limit(50);
  res.json({ success: true, tracks });
});

// @route  GET /api/tracks/new-releases
const getNewReleases = asyncHandler(async (req, res) => {
  const { genre } = req.query;
  const filter = genre ? { genre } : {};
  const tracks = await Track.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, tracks });
});

// @route  GET /api/tracks/search?q=
const searchTracks = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Query parameter "q" is required');
  }

  const localResults = await Track.find({ $text: { $search: q } }).limit(30);
  res.json({ success: true, tracks: localResults });
});

// @route  GET /api/tracks/:id
const getTrackById = asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.id);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }
  res.json({ success: true, track });
});

// @route  POST /api/tracks/import-from-youtube
// Body: { videoId } — pulls metadata from YouTube and creates a playable Track
const importFromYouTube = asyncHandler(async (req, res) => {
  const { videoId, genre } = req.body;
  if (!videoId) {
    res.status(400);
    throw new Error('videoId is required');
  }

  let track = await Track.findOne({ youtubeVideoId: videoId });
  if (track) {
    return res.json({ success: true, track, alreadyExisted: true });
  }

  const [details] = await youtubeService.getVideoDetails([videoId]);
  if (!details) {
    res.status(404);
    throw new Error('YouTube video not found');
  }

  track = await Track.create({
    title: details.title,
    artist: details.channelTitle,
    artworkUrl: details.thumbnail,
    youtubeVideoId: details.videoId,
    genre: genre || 'Phonk',
    addedBy: req.user?._id,
  });

  res.status(201).json({ success: true, track });
});

// @route  POST /api/tracks/match-spotify
// Body: { spotifyTrackId } — finds the Spotify track, then auto-matches it to a YouTube video
const matchSpotifyToYouTube = asyncHandler(async (req, res) => {
  const { title, artist, spotifyTrackId, genre } = req.body;
  if (!title || !artist) {
    res.status(400);
    throw new Error('title and artist are required');
  }

  const existing = spotifyTrackId ? await Track.findOne({ spotifyId: spotifyTrackId }) : null;
  if (existing) return res.json({ success: true, track: existing, alreadyExisted: true });

  const match = await youtubeService.matchSpotifyTrackToYouTube(title, artist);
  if (!match) {
    res.status(404);
    throw new Error('No matching YouTube video found');
  }

  const track = await Track.create({
    title,
    artist,
    spotifyId: spotifyTrackId || null,
    youtubeVideoId: match.videoId,
    artworkUrl: match.thumbnail,
    matchConfidence: match.confidence,
    genre: genre || 'Phonk',
    addedBy: req.user?._id,
  });

  res.status(201).json({ success: true, track });
});

module.exports = {
  getTrending,
  getNewReleases,
  searchTracks,
  getTrackById,
  importFromYouTube,
  matchSpotifyToYouTube,
};
