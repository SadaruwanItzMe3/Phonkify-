import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatDuration, cn } from '@/lib/utils';
import Visualizer from '@/components/visualizer/Visualizer';

/**
 * Resolves a playable audio URL for a track. In production this would call
 * a backend endpoint that returns a signed, audio-only stream URL derived
 * from the track's YouTube video ID. Swap this out for a real fetch to
 * `/api/tracks/:id/stream` once that endpoint is deployed.
 */
function resolveStreamSrc(youtubeVideoId?: string): string | null {
  if (!youtubeVideoId) return null;
  return `/api/stream/${youtubeVideoId}`;
}

export default function PlayerBar() {
  const [showQueue, setShowQueue] = useState(false);
  const {
    currentTrack,
    isPlaying,
    progressMs,
    durationMs,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    queue,
    currentIndex,
    isMiniPlayer,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setMiniPlayer,
  } = usePlayerStore();

  const { seekTo } = useAudioEngine(resolveStreamSrc);

  if (!currentTrack) return null;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progressPct = durationMs ? (progressMs / durationMs) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        'glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10',
        isMiniPlayer ? 'h-16 md:left-60' : 'md:left-60'
      )}
    >
      {/* Visualizer strip */}
      {!isMiniPlayer && <Visualizer className="h-10 w-full opacity-70" barCount={64} />}

      <div className="flex items-center gap-4 px-4 py-3">
        {/* Track info */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-initial sm:w-56">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
            {currentTrack.artworkUrl ? (
              <img src={currentTrack.artworkUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neon-purple/50">♪</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{currentTrack.title}</p>
            <p className="truncate text-xs text-text-muted">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Transport controls + progress */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              className={shuffle ? 'text-neon-purple' : 'text-text-muted hover:text-text-primary'}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={playPrevious} aria-label="Previous" className="text-text-primary hover:text-neon-purple">
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-purple text-white shadow-[0_0_14px_var(--color-neon-purple)] transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button onClick={playNext} aria-label="Next" className="text-text-primary hover:text-neon-purple">
              <SkipForward size={18} />
            </button>
            <button
              onClick={cycleRepeatMode}
              aria-label="Repeat mode"
              className={repeatMode !== 'off' ? 'text-neon-purple' : 'text-text-muted hover:text-text-primary'}
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {!isMiniPlayer && (
            <div className="flex w-full max-w-md items-center gap-2 text-[10px] text-text-muted">
              <span>{formatDuration(progressMs)}</span>
              <input
                type="range"
                min={0}
                max={durationMs || 0}
                value={progressMs}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="range-slider flex-1"
                style={{
                  background: `linear-gradient(to right, var(--color-neon-purple) ${progressPct}%, #2a1a3d ${progressPct}%)`,
                }}
              />
              <span>{formatDuration(durationMs)}</span>
            </div>
          )}
        </div>

        {/* Volume + queue + mini toggle */}
        <div className="hidden items-center gap-3 sm:flex sm:w-56 sm:justify-end">
          <button onClick={() => setShowQueue((v) => !v)} aria-label="Toggle queue" className="text-text-muted hover:text-text-primary">
            <ListMusic size={17} />
          </button>
          <button onClick={toggleMute} aria-label="Mute" className="text-text-muted hover:text-text-primary">
            <VolumeIcon size={17} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="range-slider w-20"
          />
          <button
            onClick={() => setMiniPlayer(!isMiniPlayer)}
            aria-label="Toggle mini player"
            className="text-text-muted hover:text-text-primary"
          >
            {isMiniPlayer ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Queue drawer */}
      <AnimatePresence>
        {showQueue && !isMiniPlayer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-h-64 overflow-y-auto border-t border-white/10 px-4 py-2"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Up next</p>
            {queue.slice(currentIndex + 1).map((t) => (
              <div key={t._id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-surface-soft">
                  {t.artworkUrl && <img src={t.artworkUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-text-primary">{t.title}</p>
                  <p className="truncate text-xs text-text-muted">{t.artist}</p>
                </div>
              </div>
            ))}
            {queue.slice(currentIndex + 1).length === 0 && (
              <p className="py-2 text-xs text-text-muted">Queue is empty — add more tracks!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
