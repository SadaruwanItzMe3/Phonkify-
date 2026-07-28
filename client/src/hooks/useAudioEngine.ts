import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

/**
 * Owns a single <audio> element for the whole app and keeps it in sync with
 * the player store. In production, `src` would resolve to a proxied
 * audio-only stream URL derived from the track's YouTube video ID (fetched
 * server-side to avoid exposing extraction logic to the client). Here it
 * falls back to `track.previewUrl`-style sources so the engine is fully
 * wired and testable independent of any specific extraction backend.
 *
 * Also exposes a shared AnalyserNode via `getAnalyser()` so the Visualizer
 * component can read live frequency data without owning the audio element.
 */
let sharedAudioContext: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;

export function getAnalyser() {
  return sharedAnalyser;
}

export function useAudioEngine(resolveSrc: (youtubeVideoId?: string) => string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setProgress,
    setDuration,
    playNext,
  } = usePlayerStore();

  // Create the <audio> element + Web Audio graph once
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    try {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      sourceNode = sharedAudioContext.createMediaElementSource(audio);
      sharedAnalyser = sharedAudioContext.createAnalyser();
      sharedAnalyser.fftSize = 256;
      sourceNode.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioContext.destination);
    } catch (err) {
      // Web Audio API unavailable (e.g. some webviews) — playback still works,
      // the visualizer will just fall back to a decorative animation.
      console.warn('Web Audio API unavailable, visualizer will use fallback mode', err);
    }

    const handleTimeUpdate = () => setProgress(audio.currentTime * 1000);
    const handleLoadedMetadata = () => setDuration(audio.duration * 1000);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new source when the current track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const src = resolveSrc(currentTrack.youtubeVideoId);
    if (src) {
      audio.src = src;
      if (isPlaying) audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?._id]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (sharedAudioContext?.state === 'suspended') sharedAudioContext.resume();
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Volume / mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const seekTo = (ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = ms / 1000;
    setProgress(ms);
  };

  return { seekTo };
}
