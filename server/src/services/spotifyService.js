const axios = require('axios');
const logger = require('../utils/logger');

const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

/**
 * Client-credentials token — used for catalog reads that don't need a
 * specific user's data (search, artist info, new releases).
 */
let appToken = { value: null, expiresAt: 0 };

async function getAppAccessToken() {
  if (appToken.value && Date.now() < appToken.expiresAt - 5000) {
    return appToken.value;
  }

  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const { data } = await axios.post(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    new URLSearchParams({ grant_type: 'client_credentials' }),
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  appToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return appToken.value;
}

/** Exchanges an authorization code for a user access/refresh token pair (OAuth login flow). */
async function exchangeCodeForToken(code) {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const { data } = await axios.post(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return data; // { access_token, refresh_token, expires_in, ... }
}

async function refreshUserToken(refreshToken) {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const { data } = await axios.post(
    `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return data;
}

async function searchTracks(query, limit = 20) {
  const token = await getAppAccessToken();
  const { data } = await axios.get(`${SPOTIFY_API_URL}/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, type: 'track', limit },
  });
  return data.tracks.items;
}

async function getUserPlaylists(userAccessToken) {
  const { data } = await axios.get(`${SPOTIFY_API_URL}/me/playlists`, {
    headers: { Authorization: `Bearer ${userAccessToken}` },
    params: { limit: 50 },
  });
  return data.items;
}

async function getPlaylistTracks(userAccessToken, playlistId) {
  const tracks = [];
  let url = `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${userAccessToken}` } });
    tracks.push(...data.items.map((item) => item.track).filter(Boolean));
    url = data.next;
  }

  return tracks;
}

async function getLikedSongs(userAccessToken) {
  const tracks = [];
  let url = `${SPOTIFY_API_URL}/me/tracks?limit=50`;

  while (url) {
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${userAccessToken}` } });
    tracks.push(...data.items.map((item) => item.track).filter(Boolean));
    url = data.next;
  }

  return tracks;
}

async function getArtistRecommendations(seedArtistIds = [], limit = 20) {
  const token = await getAppAccessToken();
  const { data } = await axios.get(`${SPOTIFY_API_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { seed_artists: seedArtistIds.slice(0, 5).join(','), limit },
  });
  return data.tracks;
}

module.exports = {
  getAppAccessToken,
  exchangeCodeForToken,
  refreshUserToken,
  searchTracks,
  getUserPlaylists,
  getPlaylistTracks,
  getLikedSongs,
  getArtistRecommendations,
};
