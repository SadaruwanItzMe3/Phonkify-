import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';

/**
 * Import this once from the web client's entry point (main.tsx), guarded by
 * a Capacitor platform check, to wire up native lock-screen media controls,
 * splash screen dismissal, back-button handling, and offline preference
 * storage. It is intentionally kept in /mobile rather than /client so the
 * web client has zero native dependencies when run in a plain browser.
 *
 * Usage in client/src/main.tsx:
 *   import { Capacitor } from '@capacitor/core';
 *   if (Capacitor.isNativePlatform()) {
 *     import('../../mobile/src/nativeBridge').then((m) => m.initNativeBridge());
 *   }
 */
export async function initNativeBridge() {
  await SplashScreen.hide();
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

  // Android hardware back button: navigate back instead of exiting the app
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else CapacitorApp.exitApp();
  });
}

/** Updates the OS-level lock-screen / notification media controls (Android). */
export async function updateMediaSession(track: {
  title: string;
  artist: string;
  artworkUrl?: string;
  isPlaying: boolean;
}) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    artwork: track.artworkUrl ? [{ src: track.artworkUrl, sizes: '512x512', type: 'image/png' }] : [],
  });
  navigator.mediaSession.playbackState = track.isPlaying ? 'playing' : 'paused';
}

/** Thin wrapper around Capacitor Preferences, used for the offline track-cache index. */
export const offlineCache = {
  get: (key: string) => Preferences.get({ key }).then((r) => r.value),
  set: (key: string, value: string) => Preferences.set({ key, value }),
  remove: (key: string) => Preferences.remove({ key }),
};
