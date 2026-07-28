# API Setup Guide

Phonkify integrates three external APIs. Here's how to get credentials for each.

## 1. Spotify Web API

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. **Create app** → fill in name/description.
3. Add a Redirect URI: `http://localhost:5000/api/spotify/callback` (must match `SPOTIFY_REDIRECT_URI` in `server/.env` exactly, including in production).
4. Copy the **Client ID** and **Client Secret** into `server/.env`:
   ```
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback
   ```
5. Scopes requested by Phonkify (see `spotifyController.js#getAuthUrl`): `playlist-read-private`, `playlist-read-collaborative`, `user-library-read`, `user-top-read`.

> The Spotify Web API does not provide direct audio streaming/download — it's used here for **metadata, playlists, and recommendations only**. Actual playback audio comes from your chosen streaming source (see the README's "Honest scope note").

## 2. YouTube Data API v3

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or reuse one) → **APIs & Services → Library** → enable **YouTube Data API v3**.
3. **APIs & Services → Credentials → Create Credentials → API key**.
4. Restrict the key to the YouTube Data API v3 (recommended) and add HTTP referrer / IP restrictions for production.
5. Add to `server/.env`:
   ```
   YOUTUBE_API_KEY=...
   ```

**Quota note:** the free tier is 10,000 units/day. A `search.list` call costs 100 units, so search-heavy features (auto-matching, discovery) can burn through quota quickly at scale — cache `Track` documents (already done in `trackController.js`) rather than re-searching on every request.

## 3. Google Sign-In (OAuth 2.0 / Google Identity Services)

1. In the same Google Cloud project, go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Authorized JavaScript origins: `http://localhost:5173` (and your production domain).
4. Copy the **Client ID** into both:
   - `server/.env` → `GOOGLE_CLIENT_ID` (used to verify the ID token server-side)
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID` (used to render the Sign-In button)
5. On the client, load the Google Identity Services script and render the button, then POST the resulting `idToken` to `/api/auth/google` (already implemented in `authController.js#googleSignIn`). The `Login.tsx` page has a placeholder button — wire it to:
   ```html
   <script src="https://accounts.google.com/gsi/client" async></script>
   ```
   ```js
   google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID, callback: handleCredentialResponse });
   google.accounts.id.renderButton(document.getElementById('google-btn'), { theme: 'filled_black' });
   ```

## Environment variable summary

| Variable | Where | Purpose |
|---|---|---|
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REDIRECT_URI` | `server/.env` | Spotify OAuth + catalog API |
| `YOUTUBE_API_KEY` | `server/.env` | Video search, metadata, auto-matching |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `server/.env` | Verifying Google Sign-In ID tokens |
| `VITE_GOOGLE_CLIENT_ID` | `client/.env` | Rendering the Google Sign-In button |
| `DISCORD_CLIENT_ID` | `electron/.env` (optional) | Discord Rich Presence |
