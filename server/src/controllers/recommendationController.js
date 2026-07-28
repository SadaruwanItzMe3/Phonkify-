const asyncHandler = require('express-async-handler');
const recommendationService = require('../services/recommendationService');

// @route  GET /api/recommendations/discover-weekly
const discoverWeekly = asyncHandler(async (req, res) => {
  const tracks = await recommendationService.buildDiscoverWeekly(req.user._id);
  res.json({ success: true, tracks });
});

// @route  GET /api/recommendations/daily-mix?genre=
const dailyMix = asyncHandler(async (req, res) => {
  const tracks = await recommendationService.buildDailyMix(req.query.genre);
  res.json({ success: true, tracks });
});

// @route  GET /api/recommendations/mood?mood=
const moodPlaylist = asyncHandler(async (req, res) => {
  const { mood } = req.query;
  if (!mood) {
    res.status(400);
    throw new Error('Query parameter "mood" is required');
  }
  const tracks = await recommendationService.buildMoodPlaylist(mood);
  res.json({ success: true, tracks });
});

module.exports = { discoverWeekly, dailyMix, moodPlaylist };
