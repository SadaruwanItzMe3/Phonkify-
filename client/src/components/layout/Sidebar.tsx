import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Library, Settings, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Library', icon: Library },
];

const bottomItems = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="glass fixed left-0 top-0 hidden h-screen w-60 flex-col justify-between border-r border-white/5 p-5 md:flex">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <Zap className="text-neon-purple animate-glow" size={22} />
          <span className="font-display text-xl font-extrabold tracking-tight">
            <span className="text-neon-gradient">Phonkify</span>
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neon-purple/15 text-neon-purple shadow-[inset_0_0_0_1px_rgba(176,38,255,0.35)]'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 px-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Genres</p>
          <div className="space-y-1">
            {['Phonk', 'Drift Phonk', 'Brazilian Phonk', 'Memphis Rap', 'Underground Trap'].map((g) => (
              <NavLink
                key={g}
                to={`/discover?genre=${encodeURIComponent(g)}`}
                className="block truncate rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                {g}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {bottomItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-neon-purple/15 text-neon-purple' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
