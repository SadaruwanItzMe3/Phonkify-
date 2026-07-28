import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Lock, Globe, Users } from 'lucide-react';
import type { Playlist } from '@/types';
import { playlistService } from '@/services/playlistService';

export default function Library() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const loadPlaylists = () => {
    setLoading(true);
    playlistService
      .getMine()
      .then(setPlaylists)
      .finally(() => setLoading(false));
  };

  useEffect(loadPlaylists, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const playlist = await playlistService.create({ name: newName.trim() });
    setPlaylists((prev) => [playlist, ...prev]);
    setNewName('');
    setCreating(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Your Library</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-full bg-neon-purple px-4 py-2 text-sm font-semibold text-white shadow-[0_0_14px_var(--color-neon-purple)] hover:opacity-90"
        >
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {creating && (
        <div className="glass mb-6 flex items-center gap-3 rounded-2xl p-4">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Playlist name"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
          <button onClick={handleCreate} className="rounded-full bg-neon-purple px-3 py-1.5 text-xs font-semibold text-white">
            Create
          </button>
          <button onClick={() => setCreating(false)} className="text-xs text-text-muted">
            Cancel
          </button>
        </div>
      )}

      <Link
        to="/library/liked"
        className="glass mb-6 flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/5"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink">
          <Heart size={22} className="fill-white text-white" />
        </div>
        <div>
          <p className="font-semibold">Liked Songs</p>
          <p className="text-xs text-text-muted">All your favorited tracks</p>
        </div>
      </Link>

      {loading && <p className="text-sm text-text-muted">Loading playlists...</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {playlists.map((p) => (
          <Link
            key={p._id}
            to={`/playlist/${p._id}`}
            className="glass group rounded-2xl p-3 transition-transform hover:-translate-y-1"
          >
            <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-surface-soft">
              {p.coverImageUrl ? (
                <img src={p.coverImageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-neon-purple/40">♫</div>
              )}
            </div>
            <p className="truncate text-sm font-semibold">{p.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              {p.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {p.isCollaborative && <Users size={12} />}
              <span>{p.tracks?.length ?? 0} tracks</span>
            </div>
          </Link>
        ))}
      </div>

      {!loading && playlists.length === 0 && (
        <p className="mt-4 text-sm text-text-muted">You haven't created any playlists yet.</p>
      )}
    </div>
  );
}
