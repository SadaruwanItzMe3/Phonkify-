# Android Setup Notes

After running `npx cap add android` from `/mobile`, a few manual edits are needed
inside the generated `android/` project to get the features listed in the spec working:

## 1. Background playback + media notification controls

Add a foreground `MediaBrowserService` (or use the `capacitor-media-session` plugin's
native companion) so audio keeps playing when the app is backgrounded, and so
Android shows transport controls in the notification shade + lock screen.

`android/app/src/main/AndroidManifest.xml`:
```xml
<service
    android:name=".PhonkifyPlaybackService"
    android:foregroundServiceType="mediaPlayback"
    android:exported="false">
  <intent-filter>
    <action android:name="android.media.browse.MediaBrowserService" />
  </intent-filter>
</service>

<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## 2. Lock screen controls

Handled automatically once `navigator.mediaSession` metadata is set from the web
layer (see `src/nativeBridge.ts` → `updateMediaSession`) combined with the
foreground service above — Android surfaces the media session on the lock screen.

## 3. Offline cache

Downloaded tracks should be written to the app's scoped storage
(`context.getExternalFilesDir(Environment.DIRECTORY_MUSIC)`) via a small native
plugin or `@capacitor/filesystem`, and indexed in `Preferences` (see
`offlineCache` in `nativeBridge.ts`) so the client knows what's available
without a network round-trip.

## 4. Signing & release build

```bash
cd mobile/android
./gradlew bundleRelease
```
Configure your keystore in `android/app/build.gradle` under `signingConfigs`
before shipping to the Play Store.
