import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Track } from '@/types';
import { trackService } from '@/services/trackService';
import { recommendationService } from '@/services/recommendationService';
import { useAuthStore } from '@/store/authStore';
import SectionRow from '@/components/ui/SectionRow';
import TrackCard from '@/components/ui/TrackCard';

export default function Home() {
  const username = useAuthStore((s) => s.user?.username);
  const [trending, setTrending] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [dailyMix, setDailyMix] = useState<Track[]>([]);
  const [discoverWeekly, setDiscoverWeekly] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.allSettled([
        trackService.getTrending(),
        trackService.getNewReleases(),
        recommendationService.dailyMix('Phonk'),
        recommendationService.discoverWeekly(),
      ]);
      if (!mounted) return;
      if (results[0].status === 'fulfilled') setTrending(results[0].value);
      if (results[1].status === 'fulfilled') setNewReleases(results[1].value);
      if (results[2].status === 'fulfilled') setDailyMix(results[2].value);
      if (results[3].status === 'fulfilled') setDiscoverWeekly(results[3].value);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 font-display text-2xl font-bold sm:text-3xl"
      >
        Welcome back{username ? `, ${username}` : ''} 👋
      </motion.h1>

      {loading && <p className="text-sm text-text-muted">Loading your sound...</p>}

      {!loading && trending.length === 0 && newReleases.length === 0 && (
        <div className="glass rounded-2xl p-6 text-sm text-text-muted">
          No tracks yet — connect the backend to a seeded MongoDB instance (see{' '}
          <code className="text-neon-purple">docs/API_SETUP.md</code>) or import your Spotify library from Settings
          to populate Home.
        </div>
      )}

      {trending.length > 0 && (
        <SectionRow title="Trending Phonk" subtitle="Hot right now">
          {trending.map((t) => (
            <TrackCard key={t._id} track={t} queue={trending} />
          ))}
        </SectionRow>
      )}

      {discoverWeekly.length > 0 && (
        <SectionRow title="Discover Weekly" subtitle="Made for you">
          {discoverWeekly.map((t) => (
            <TrackCard key={t._id} track={t} queue={discoverWeekly} />
          ))}
        </SectionRow>
      )}

      {dailyMix.length > 0 && (
        <SectionRow title="Daily Mix — Phonk" subtitle="On repeat">
          {dailyMix.map((t) => (
            <TrackCard key={t._id} track={t} queue={dailyMix} />
          ))}
        </SectionRow>
      )}

      {newReleases.length > 0 && (
        <SectionRow title="New Releases" subtitle="Fresh drops">
          {newReleases.map((t) => (
            <TrackCard key={t._id} track={t} queue={newReleases} />
          ))}
        </SectionRow>
      )}
    </div>
  );
}
