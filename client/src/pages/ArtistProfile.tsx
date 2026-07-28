import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { Track } from '@/types';
import { trackService } from '@/services/trackService';
import { usePlayerStore } from '@/store/playerStore';
import TrackRow from '@/components/ui/TrackRow';

export default function ArtistProfile() {
  const { name } = useParams<{ name: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    trackService
      .search(decodeURIComponent(name))
      .then((results) => setTracks(results.filter((t) => t.artist.toLowerCase() === decodeURIComponent(name).toLowerCase())))
      .finally(() => setLoading(false));
  }, [name]);

  const artistName = name ? decodeURIComponent(name) : '';
  const totalPlays = tracks.reduce((sum, t) => sum + (t.playCount || 0), 0);

  return (
    <div>
      <div className="mb-8 flex items-center gap-6">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-pink text-4xl font-bold text-white shadow-[0_0_30px_var(--color-neon-purple)]">
          {artistName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-text-muted">Artist</p>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{artistName}</h1>
          <p className="mt-1 text-sm text-text-muted">{totalPlays.toLocaleString()} total plays</p>
          <button
            onClick={() => tracks[0] && playTrack(tracks[0], tracks)}
            disabled={tracks.length === 0}
            className="mt-4 flex items-center gap-2 rounded-full bg-neon-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_14px_var(--color-neon-purple)] disabled:opacity-50"
          >
            <Play size={16} className="fill-white" /> Play All
          </button>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Tracks</h2>
      {loading && <p className="text-sm text-text-muted">Loading tracks...</p>}
      <div className="space-y-1">
        {tracks.map((t, i) => (
          <TrackRow key={t._id} track={t} index={i} queue={tracks} />
        ))}
        {!loading && tracks.length === 0 && <p className="text-sm text-text-muted">No tracks found for this artist.</p>}
      </div>
    </div>
  );
}
