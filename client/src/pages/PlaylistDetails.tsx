import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Share2, Lock, Globe } from 'lucide-react';
import type { Playlist } from '@/types';
import { playlistService } from '@/services/playlistService';
import { usePlayerStore } from '@/store/playerStore';
import TrackRow from '@/components/ui/TrackRow';
import { useAuthStore } from '@/store/authStore';

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    playlistService
      .getById(id)
      .then(setPlaylist)
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!id) return;
    const slug = await playlistService.share(id);
    navigator.clipboard?.writeText(`${window.location.origin}/shared/${slug}`);
    alert('Share link copied to clipboard!');
  };

  if (loading) return <p className="text-sm text-text-muted">Loading playlist...</p>;
  if (!playlist) return <p className="text-sm text-text-muted">Playlist not found.</p>;

  const tracks = playlist.tracks.map((t) => t.track);
  const isOwner =
    user && (typeof playlist.owner === 'string' ? playlist.owner === user._id : playlist.owner._id === user._id);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-surface-soft shadow-2xl">
          {playlist.coverImageUrl ? (
            <img src={playlist.coverImageUrl} alt={playlist.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-neon-purple/40">♫</div>
          )}
        </div>
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
            {playlist.isPublic ? <Globe size={12} /> : <Lock size={12} />}
            Playlist
          </p>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{playlist.name}</h1>
          {playlist.description && <p className="mt-2 max-w-lg text-sm text-text-muted">{playlist.description}</p>}
          <p className="mt-2 text-sm text-text-muted">{tracks.length} tracks</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => tracks[0] && playTrack(tracks[0], tracks)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 rounded-full bg-neon-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_14px_var(--color-neon-purple)] disabled:opacity-50"
            >
              <Play size={16} className="fill-white" /> Play
            </button>
            {isOwner && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
              >
                <Share2 size={16} /> Share
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {tracks.map((t, i) => (
          <TrackRow key={t._id} track={t} index={i} queue={tracks} />
        ))}
        {tracks.length === 0 && <p className="text-sm text-text-muted">No tracks in this playlist yet.</p>}
      </div>
    </div>
  );
}
