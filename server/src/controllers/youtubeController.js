const asyncHandler = require('express-async-handler');
const youtubeService = require('../services/youtubeService');

// @route  GET /api/youtube/search?q=
const search = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Query parameter "q" is required');
  }
  const results = await youtubeService.searchVideos(q);
  res.json({ success: true, results });
});

// @route  GET /api/youtube/videos?ids=id1,id2
const getDetails = asyncHandler(async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    res.status(400);
    throw new Error('Query parameter "ids" is required (comma-separated video IDs)');
  }
  const details = await youtubeService.getVideoDetails(ids.split(','));
  res.json({ success: true, details });
});

module.exports = { search, getDetails };
