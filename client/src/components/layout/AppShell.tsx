import { Outlet } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PlayerBar from '@/components/player/PlayerBar';
import { usePlayerStore } from '@/store/playerStore';

export default function AppShell() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  return (
    <div className="min-h-screen text-text-primary">
      <AnimatedBackground />
      <Sidebar />
      <div className="md:pl-60">
        <Topbar />
        <main className={`px-4 py-6 md:px-8 ${currentTrack ? 'pb-32' : 'pb-10'}`}>
          <Outlet />
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
