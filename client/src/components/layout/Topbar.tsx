import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 md:px-8">
      <button
        onClick={() => navigate('/search')}
        className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-muted transition-colors hover:border-neon-purple/40 hover:text-text-primary"
      >
        <Search size={16} />
        Search phonk, artists, playlists...
      </button>

      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="text-text-muted transition-colors hover:text-neon-purple">
          <Bell size={18} />
        </button>
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-neon-purple/40 bg-surface-soft">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neon-purple">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
