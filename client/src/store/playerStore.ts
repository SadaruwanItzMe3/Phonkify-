import { create } from 'zustand';
import type { Track, RepeatMode } from '@/types';

interface PlayerState {
  queue: Track[];
  originalQueue: Track[]; // preserved order, used when shuffle turns off
  currentIndex: number;
  currentTrack: Track | null;

  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  volume: number; // 0-1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  isMiniPlayer: boolean;

  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (ms: number) => void;
  setProgress: (ms: number) => void;
  setDuration: (ms: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  setMiniPlayer: (v: boolean) => void;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  currentTrack: null,

  isPlaying: false,
  progressMs: 0,
  durationMs: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeatMode: 'off',
  isMiniPlayer: false,

  playTrack: (track, queue) => {
    const baseQueue = queue && queue.length ? queue : [track];
    const index = baseQueue.findIndex((t) => t._id === track._id);
    set({
      originalQueue: baseQueue,
      queue: get().shuffle ? shuffleArray(baseQueue) : baseQueue,
      currentIndex: index === -1 ? 0 : index,
      currentTrack: track,
      isPlaying: true,
      progressMs: 0,
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  playNext: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (!queue.length) return;

    if (repeatMode === 'one') {
      set({ progressMs: 0, isPlaying: true });
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        set({ currentIndex: 0, currentTrack: queue[0], progressMs: 0, isPlaying: true });
      } else {
        set({ isPlaying: false });
      }
      return;
    }

    set({ currentIndex: nextIndex, currentTrack: queue[nextIndex], progressMs: 0, isPlaying: true });
  },

  playPrevious: () => {
    const { queue, currentIndex, progressMs } = get();
    if (!queue.length) return;

    // If more than 3s into the track, restart it instead of going back
    if (progressMs > 3000) {
      set({ progressMs: 0 });
      return;
    }

    const prevIndex = Math.max(0, currentIndex - 1);
    set({ currentIndex: prevIndex, currentTrack: queue[prevIndex], progressMs: 0, isPlaying: true });
  },

  seek: (ms) => set({ progressMs: ms }),
  setProgress: (ms) => set({ progressMs: ms }),
  setDuration: (ms) => set({ durationMs: ms }),

  setVolume: (v) => set({ volume: v, isMuted: v === 0 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleShuffle: () => {
    const { shuffle, originalQueue, currentTrack } = get();
    if (shuffle) {
      // turning shuffle off — restore original order
      const idx = originalQueue.findIndex((t) => t._id === currentTrack?._id);
      set({ shuffle: false, queue: originalQueue, currentIndex: idx === -1 ? 0 : idx });
    } else {
      const shuffled = shuffleArray(originalQueue);
      const idx = shuffled.findIndex((t) => t._id === currentTrack?._id);
      set({ shuffle: true, queue: shuffled, currentIndex: idx === -1 ? 0 : idx });
    }
  },

  cycleRepeatMode: () => {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    const next = order[(order.indexOf(get().repeatMode) + 1) % order.length];
    set({ repeatMode: next });
  },

  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track], originalQueue: [...s.originalQueue, track] })),

  removeFromQueue: (trackId) =>
    set((s) => ({
      queue: s.queue.filter((t) => t._id !== trackId),
      originalQueue: s.originalQueue.filter((t) => t._id !== trackId),
    })),

  setMiniPlayer: (v) => set({ isMiniPlayer: v }),
}));
