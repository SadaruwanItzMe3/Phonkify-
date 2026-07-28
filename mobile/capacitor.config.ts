import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the SAME built web client (../client/dist) as a native
 * shell for Android/iOS. Build the client first (`npm run build` in
 * /client), then run `npx cap sync` from this directory to copy the build
 * output into the native projects.
 */
const config: CapacitorConfig = {
  appId: 'com.phonkify.app',
  appName: 'Phonkify',
  webDir: '../client/dist',
  backgroundColor: '#050308',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#050308',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050308',
    },
  },
};

export default config;
