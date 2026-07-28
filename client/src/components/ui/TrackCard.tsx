import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import type { Track } from '@/types';
import { usePlayerStore } from '@/store/playerStore';

interface TrackCardProps {
  track: Track;
  queue?: Track[];
}

export default function TrackCard({ track, queue }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const isCurrent = currentTrack?._id === track._id;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="glass group w-40 shrink-0 cursor-pointer rounded-2xl p-3 sm:w-44"
      onClick={handleClick}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-surface-soft">
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-neon-purple/40">♪</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-purple shadow-[0_0_16px_var(--color-neon-purple)]">
            {isCurrent && isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="ml-0.5 text-white" />}
          </span>
        </div>
      </div>
      <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-neon-purple' : 'text-text-primary'}`}>
        {track.title}
      </p>
      <p className="truncate text-xs text-text-muted">{track.artist}</p>
    </motion.div>
  );
}
