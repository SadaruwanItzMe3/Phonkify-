import { motion } from 'framer-motion';
import { Play, Pause, Heart } from 'lucide-react';
import type { Track } from '@/types';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';

interface TrackRowProps {
  track: Track;
  index?: number;
  queue?: Track[];
  isLiked?: boolean;
  onToggleLike?: (track: Track) => void;
}

export default function TrackRow({ track, index, queue, isLiked, onToggleLike }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const isCurrent = currentTrack?._id === track._id;

  const handlePlayClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue);
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={`group flex items-center gap-4 rounded-xl px-3 py-2 transition-colors ${
        isCurrent ? 'bg-neon-purple/15' : 'hover:bg-white/5'
      }`}
    >
      <button
        onClick={handlePlayClick}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-soft"
        aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
      >
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-text-muted">{index !== undefined ? index + 1 : ''}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isCurrent && isPlaying ? (
            <Pause size={16} className="text-white" />
          ) : (
            <Play size={16} className="text-white" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isCurrent ? 'text-neon-purple' : 'text-text-primary'}`}>
          {track.title}
        </p>
        <p className="truncate text-xs text-text-muted">{track.artist}</p>
      </div>

      <span className="hidden shrink-0 rounded-full border border-neon-purple/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-muted sm:block">
        {track.genre}
      </span>

      {onToggleLike && (
        <button onClick={() => onToggleLike(track)} aria-label="Toggle favorite" className="shrink-0">
          <Heart size={16} className={isLiked ? 'fill-neon-pink text-neon-pink' : 'text-text-muted'} />
        </button>
      )}

      <span className="w-10 shrink-0 text-right text-xs text-text-muted">
        {formatDuration(track.durationMs || 0)}
      </span>
    </motion.div>
  );
}
