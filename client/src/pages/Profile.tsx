import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { api } from '@/services/api';
import type { Track } from '@/types';
import TrackRow from '@/components/ui/TrackRow';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Track[]>([]);

  useEffect(() => {
    api.get('/users/me/favorites').then(({ data }) => setFavorites(data.tracks));
  }, []);

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-5">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-neon-purple/50 bg-surface-soft">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-neon-purple">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user?.username}</h1>
          <p className="text-sm text-text-muted">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neon-pink hover:bg-white/10"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">Favorite Tracks</h2>
      <div className="space-y-1">
        {favorites.map((t, i) => (
          <TrackRow key={t._id} track={t} index={i} queue={favorites} />
        ))}
        {favorites.length === 0 && <p className="text-sm text-text-muted">No favorites yet — tap the heart on any track.</p>}
      </div>
    </div>
  );
}
