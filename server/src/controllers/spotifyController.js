const asyncHandler = require('express-async-handler');
const spotifyService = require('../services/spotifyService');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

// @route  GET /api/spotify/auth-url
// Returns the URL the client should redirect the user to for Spotify OAuth consent
const getAuthUrl = asyncHandler(async (req, res) => {
  const scopes = ['playlist-read-private', 'playlist-read-collaborative', 'user-library-read', 'user-top-read'];
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes.join(' '),
    state: req.user._id.toString(),
  });
  res.json({ success: true, url: `https://accounts.spotify.com/authorize?${params.toString()}` });
});

// @route  GET /api/spotify/callback?code=...&state=userId
const callback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const tokenData = await spotifyService.exchangeCodeForToken(code);

  req.user.spotify = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    connected: true,
  };
  await req.user.save();

  res.redirect(`${process.env.CLIENT_URL}/settings?spotify=connected`);
});

// @route  POST /api/spotify/import/playlists
const importPlaylists = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.spotify?.connected) {
    res.status(400);
    throw new Error('Spotify account is not connected');
  }

  const spotifyPlaylists = await spotifyService.getUserPlaylists(user.spotify.accessToken);
  const imported = [];

  for (const sp of spotifyPlaylists) {
    const existing = await Playlist.findOne({ 'importedFrom.externalId': sp.id, owner: user._id });
    if (existing) {
      imported.push(existing);
      continue;
    }

    const newPlaylist = await Playlist.create({
      name: sp.name,
      description: sp.description || '',
      coverImageUrl: sp.images?.[0]?.url || '',
      owner: user._id,
      isPublic: sp.public,
      importedFrom: { provider: 'spotify', externalId: sp.id },
    });
    imported.push(newPlaylist);
  }

  res.json({ success: true, playlists: imported });
});

// @route  POST /api/spotify/import/liked-songs
const importLikedSongs = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.spotify?.connected) {
    res.status(400);
    throw new Error('Spotify account is not connected');
  }

  const likedTracks = await spotifyService.getLikedSongs(user.spotify.accessToken);
  const trackIds = [];

  for (const t of likedTracks) {
    if (!t) continue;
    let track = await Track.findOne({ spotifyId: t.id });
    if (!track) {
      track = await Track.create({
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: t.album?.name,
        durationMs: t.duration_ms,
        artworkUrl: t.album?.images?.[0]?.url,
        spotifyId: t.id,
        isExplicit: t.explicit,
      });
    }
    trackIds.push(track._id);
  }

  user.favoriteTracks = [...new Set([...user.favoriteTracks.map(String), ...trackIds.map(String)])];
  await user.save();

  res.json({ success: true, importedCount: trackIds.length });
});

// @route  GET /api/spotify/search?q=
const searchSpotify = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Query parameter "q" is required');
  }
  const results = await spotifyService.searchTracks(q);
  res.json({ success: true, results });
});

module.exports = { getAuthUrl, callback, importPlaylists, importLikedSongs, searchSpotify };
