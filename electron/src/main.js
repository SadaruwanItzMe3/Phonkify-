const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const isDev = process.env.PHONKIFY_DEV === 'true';
const CLIENT_DEV_URL = 'http://localhost:5173';
const CLIENT_BUILD_PATH = path.join(__dirname, '..', '..', 'client', 'dist', 'index.html');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#050308',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL(CLIENT_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(CLIENT_BUILD_PATH);
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Minimize to tray instead of quitting, matching typical music-player behavior
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', 'build', 'icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Play/Pause', click: () => mainWindow?.webContents.send('media-key', 'playpause') },
    { label: 'Next Track', click: () => mainWindow?.webContents.send('media-key', 'next') },
    { label: 'Previous Track', click: () => mainWindow?.webContents.send('media-key', 'previous') },
    { type: 'separator' },
    { label: 'Open Phonkify', click: () => mainWindow?.show() },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Phonkify');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

function registerMediaKeys() {
  globalShortcut.register('MediaPlayPause', () => mainWindow?.webContents.send('media-key', 'playpause'));
  globalShortcut.register('MediaNextTrack', () => mainWindow?.webContents.send('media-key', 'next'));
  globalShortcut.register('MediaPreviousTrack', () => mainWindow?.webContents.send('media-key', 'previous'));
  globalShortcut.register('MediaStop', () => mainWindow?.webContents.send('media-key', 'stop'));
}

// IPC bridge so the renderer can update the tray tooltip with "now playing" info
ipcMain.on('now-playing', (_event, { title, artist }) => {
  tray?.setToolTip(title ? `${title} — ${artist}` : 'Phonkify');
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerMediaKeys();
  require('./discordRpc').init();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
