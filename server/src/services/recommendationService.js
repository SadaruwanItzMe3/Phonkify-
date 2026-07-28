const ListeningEvent = require('../models/ListeningEvent');
const Track = require('../models/Track');

const PHONK_GENRES = ['Phonk', 'Drift Phonk', 'Brazilian Phonk', 'Memphis Rap', 'Underground Trap'];

/**
 * Builds a lightweight "Discover Weekly" style playlist for a user based on
 * their most-played genres and artists over the last 30 days, backfilling
 * with globally popular tracks in the same genres when history is thin.
 */
async function buildDiscoverWeekly(userId, limit = 30) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const history = await ListeningEvent.find({ user: userId, createdAt: { $gte: since } })
    .populate('track')
    .limit(200);

  const genreCounts = {};
  const artistCounts = {};

  history.forEach((event) => {
    if (!event.track) return;
    genreCounts[event.track.genre] = (genreCounts[event.track.genre] || 0) + 1;
    artistCounts[event.track.artist] = (artistCounts[event.track.artist] || 0) + 1;
  });

  const topGenres = Object.keys(genreCounts).length
    ? Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g)
    : PHONK_GENRES;

  const listenedTrackIds = history.map((h) => h.track?._id).filter(Boolean);

  const recommendations = await Track.find({
    genre: { $in: topGenres },
    _id: { $nin: listenedTrackIds },
  })
    .sort({ playCount: -1 })
    .limit(limit);

  return recommendations;
}

/** Builds a "Daily Mix" centered on a single genre for quick rotation. */
async function buildDailyMix(genre, limit = 25) {
  const targetGenre = PHONK_GENRES.includes(genre) ? genre : 'Phonk';
  return Track.find({ genre: targetGenre }).sort({ playCount: -1 }).limit(limit);
}

/** Builds a mood-based playlist using simple tag matching against tracks. */
async function buildMoodPlaylist(mood, limit = 25) {
  const moodTagMap = {
    drift: ['drift', 'car', 'racing'],
    workout: ['aggressive', 'hard', 'gym'],
    chill: ['chill', 'lofi', 'slow'],
    hype: ['hype', 'energy', 'bass'],
  };

  const tags = moodTagMap[mood] || [mood];
  return Track.find({ tags: { $in: tags } }).sort({ playCount: -1 }).limit(limit);
}

module.exports = { buildDiscoverWeekly, buildDailyMix, buildMoodPlaylist, PHONK_GENRES };
