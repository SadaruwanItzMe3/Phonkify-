import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { Track } from '@/types';
import { trackService } from '@/services/trackService';
import { usePlayerStore } from '@/store/playerStore';
import TrackRow from '@/components/ui/TrackRow';

export default function Album() {
  const { name } = useParams<{ name: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const albumName = name ? decodeURIComponent(name) : '';

  useEffect(() => {
    if (!albumName) return;
    setLoading(true);
    trackService
      .search(albumName)
      .then((results) => setTracks(results.filter((t) => t.album?.toLowerCase() === albumName.toLowerCase())))
      .finally(() => setLoading(false));
  }, [albumName]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-surface-soft shadow-2xl">
          {tracks[0]?.artworkUrl ? (
            <img src={tracks[0].artworkUrl} alt={albumName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-neon-purple/40">💿</div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-text-muted">Album</p>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{albumName}</h1>
          {tracks[0]?.artist && <p className="mt-1 text-sm text-text-muted">{tracks[0].artist}</p>}
          <button
            onClick={() => tracks[0] && playTrack(tracks[0], tracks)}
            disabled={tracks.length === 0}
            className="mt-4 flex items-center gap-2 rounded-full bg-neon-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_14px_var(--color-neon-purple)] disabled:opacity-50"
          >
            <Play size={16} className="fill-white" /> Play Album
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading tracks...</p>}
      <div className="space-y-1">
        {tracks.map((t, i) => (
          <TrackRow key={t._id} track={t} index={i} queue={tracks} />
        ))}
        {!loading && tracks.length === 0 && <p className="text-sm text-text-muted">No tracks found for this album.</p>}
      </div>
    </div>
  );
}
