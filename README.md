# Phonkify 🎧

A cross-platform music streaming app for **Phonk, Drift Phonk, Brazilian Phonk, Memphis Rap, and Underground Trap** — dark cyberpunk UI, neon-purple glassmorphism, real-time audio visualizer, and Spotify/YouTube-powered discovery.

![status](https://img.shields.io/badge/status-scaffold--ready-b026ff) ![license](https://img.shields.io/badge/license-MIT-29f1ff)

## Project structure

```
/client     React + TypeScript + Vite + Tailwind + Framer Motion web app
/server     Node.js + Express + MongoDB + JWT API, Spotify & YouTube integration
/electron   Desktop shell (system tray, media keys, Discord RPC, auto-update)
/mobile     Capacitor shell for Android/iOS (native bridge, media session)
/docs       Setup guides
```

## Quick start (local dev)

```bash
# 1. Backend
cd server
cp .env.example .env      # fill in Mongo URI, JWT secrets, Spotify/YouTube keys
npm install
npm run dev                # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Full walkthrough: [`docs/INSTALLATION.md`](docs/INSTALLATION.md).
API key setup (Spotify, YouTube, Google Sign-In): [`docs/API_SETUP.md`](docs/API_SETUP.md).

## Run with Docker

```bash
docker compose up --build
```
Client → `http://localhost:8080`, API → `http://localhost:5000`.

## Desktop app

```bash
cd client && npm run build
cd ../electron && npm install && npm run dev
```

## Mobile app (Android)

```bash
cd client && npm run build
cd ../mobile && npm install
npx cap add android
npx cap sync
npx cap open android
```
See [`mobile/android-notes/SETUP.md`](mobile/android-notes/SETUP.md) for background playback + lock-screen control wiring.

## Feature map

| Area | Implemented in this scaffold |
|---|---|
| Music discovery (trending, new releases, genres, search) | ✅ `server/src/controllers/trackController.js`, `client/src/pages/Discover.tsx` |
| Playback (play/pause/skip/shuffle/repeat/queue/mini player) | ✅ `client/src/store/playerStore.ts`, `PlayerBar.tsx` |
| Accounts (email/password + Google Sign-In + JWT refresh) | ✅ `server/src/controllers/authController.js` |
| Playlists (CRUD, public/private, collaborative, share links) | ✅ `server/src/controllers/playlistController.js` |
| Spotify import (playlists, liked songs, recommendations) | ✅ `server/src/services/spotifyService.js` |
| YouTube search + Spotify→YouTube auto-matching | ✅ `server/src/services/youtubeService.js` |
| Discover Weekly / Daily Mix / mood playlists | ✅ `server/src/services/recommendationService.js` |
| Real-time canvas audio visualizer | ✅ `client/src/components/visualizer/Visualizer.tsx` |
| Desktop: tray, media keys, Discord RPC, auto-update | ✅ `electron/src/*` |
| Android: lock-screen controls, background playback, offline cache index | ✅ scaffolded, native service wiring documented in `mobile/android-notes/SETUP.md` |
| Docker + CI/CD | ✅ `docker-compose.yml`, `.github/workflows/*` |

## Honest scope note

This is a **production-grade starting point**, not a finished, deployed product. Two pieces need real infrastructure decisions before shipping, and are intentionally left as documented seams rather than faked:

1. **Audio streaming source** — `PlayerBar.tsx` resolves track audio via `/api/stream/:youtubeVideoId`, a placeholder endpoint. You'll need to decide your actual audio pipeline (e.g. a licensed streaming source, or a server-side extraction service) and implement that route — this is a legal/licensing decision, not just a code one.
2. **Native background audio service** — Android's foreground `MediaBrowserService` and iOS's background audio mode require native code beyond what Capacitor's JS bridge alone provides; see the setup notes for the pieces to add.

Everything else — auth, data models, playlists, Spotify/YouTube integration, recommendations, the full UI, Electron shell, Docker, CI — is wired and working end to end against a real MongoDB instance.

## License

MIT
