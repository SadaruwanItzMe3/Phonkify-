const axios = require('axios');

const YT_API_URL = 'https://www.googleapis.com/youtube/v3';

/** Searches YouTube for videos matching a query (used for playback + auto-matching). */
async function searchVideos(query, maxResults = 10) {
  const { data } = await axios.get(`${YT_API_URL}/search`, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: query,
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults,
    },
  });

  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
  }));
}

/** Fetches full metadata + duration for a set of video IDs. */
async function getVideoDetails(videoIds = []) {
  if (!videoIds.length) return [];

  const { data } = await axios.get(`${YT_API_URL}/videos`, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      id: videoIds.join(','),
      part: 'snippet,contentDetails,statistics',
    },
  });

  return data.items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url,
    duration: item.contentDetails.duration, // ISO 8601, e.g. PT3M42S
    viewCount: Number(item.statistics?.viewCount || 0),
  }));
}

/**
 * Attempts to find the best-matching YouTube video for a given Spotify track
 * (title + artist), returning a confidence score based on string similarity
 * between the Spotify metadata and the top YouTube result.
 */
async function matchSpotifyTrackToYouTube(title, artist) {
  const results = await searchVideos(`${artist} - ${title}`, 5);
  if (!results.length) return null;

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = normalize(`${artist}${title}`);

  let best = results[0];
  let bestScore = 0;

  for (const candidate of results) {
    const candidateStr = normalize(candidate.title + candidate.channelTitle);
    let matches = 0;
    for (const char of target) {
      if (candidateStr.includes(char)) matches += 1;
    }
    const score = matches / target.length;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return { ...best, confidence: Math.min(bestScore, 1) };
}

module.exports = { searchVideos, getVideoDetails, matchSpotifyTrackToYouTube };
