# Installation Guide

## Prerequisites

- Node.js 20+ and npm
- MongoDB 7 (local install, Docker, or MongoDB Atlas)
- (Optional) Android Studio for the mobile shell
- (Optional) Xcode for iOS builds (macOS only)

## 1. Clone & install

```bash
git clone <your-fork-url> phonkify
cd phonkify
```

## 2. Backend setup

```bash
cd server
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — e.g. `mongodb://localhost:27017/phonkify` or an Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`
- Spotify, YouTube, Google keys — see [`API_SETUP.md`](./API_SETUP.md)

```bash
npm install
npm run dev
```

The API boots on `http://localhost:5000`. Check `GET /api/health` for a heartbeat.

## 3. Frontend setup

```bash
cd ../client
cp .env.example .env
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` and proxies `/api/*` to the backend (configured in `vite.config.ts`).

## 4. Seed the database (optional)

The scaffold ships without seed data. The fastest way to populate the catalog is:
1. Register a user in the app.
2. Go to **Settings → Connected Accounts → Connect Spotify**, then import your liked songs/playlists.
3. Or call `POST /api/tracks/match-spotify` / `POST /api/tracks/import-from-youtube` directly with track metadata to backfill the `Track` collection.

## 5. Desktop app

```bash
cd ../client && npm run build
cd ../electron && npm install && npm run dev
```

## 6. Mobile app (Android)

```bash
cd ../client && npm run build
cd ../mobile && npm install
npx cap add android
npx cap sync
npx cap open android   # opens Android Studio
```

## 7. Docker (full stack in one command)

```bash
docker compose up --build
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerSelectionError` on server start | MongoDB isn't running / `MONGO_URI` is wrong. Start `mongod` or check your Atlas IP allowlist. |
| CORS errors in the browser console | Ensure `CLIENT_URL` in `server/.env` matches the origin the client is actually served from. |
| Google Sign-In button does nothing | You still need to wire the Google Identity Services script + `VITE_GOOGLE_CLIENT_ID` — see `API_SETUP.md`. |
| 401 loops after login | Check that `JWT_SECRET`/`JWT_REFRESH_SECRET` are set and that cookies aren't blocked (the refresh token is an httpOnly cookie — `withCredentials: true` is already set in `client/src/services/api.ts`). |
