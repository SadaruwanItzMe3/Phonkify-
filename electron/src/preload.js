const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a minimal, safe API to the renderer (the Phonkify web client)
 * under `window.phonkifyDesktop`. The renderer should feature-detect this
 * (`if (window.phonkifyDesktop)`) since the same client bundle also runs in
 * plain browsers and Capacitor's WebView, where it won't exist.
 */
contextBridge.exposeInMainWorld('phonkifyDesktop', {
  onMediaKey: (callback) => {
    ipcRenderer.on('media-key', (_event, key) => callback(key));
  },
  setNowPlaying: (title, artist) => {
    ipcRenderer.send('now-playing', { title, artist });
  },
  setDiscordActivity: (activity) => {
    ipcRenderer.send('discord-activity', activity);
  },
});
