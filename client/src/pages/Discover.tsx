import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Genre, Track } from '@/types';
import { trackService } from '@/services/trackService';
import { recommendationService } from '@/services/recommendationService';
import SectionRow from '@/components/ui/SectionRow';
import TrackCard from '@/components/ui/TrackCard';
import { cn } from '@/lib/utils';

const GENRES: Genre[] = ['Phonk', 'Drift Phonk', 'Brazilian Phonk', 'Memphis Rap', 'Underground Trap'];
const MOODS = ['drift', 'workout', 'chill', 'hype'];

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGenre = (searchParams.get('genre') as Genre) || null;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [moodTracks, setMoodTracks] = useState<Record<string, Track[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const results = activeGenre ? await trackService.getTrending(activeGenre) : await trackService.getTrending();
      if (mounted) {
        setTracks(results);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeGenre]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        MOODS.map(async (m) => [m, await recommendationService.mood(m).catch(() => [])] as const)
      );
      if (mounted) setMoodTracks(Object.fromEntries(entries));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold sm:text-3xl">Discover</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            !activeGenre ? 'bg-neon-purple text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
          )}
        >
          All Genres
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSearchParams({ genre: g })}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeGenre === g ? 'bg-neon-purple text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-text-muted">Loading tracks...</p>}

      {!loading && (
        <SectionRow title={activeGenre ? activeGenre : 'Popular right now'}>
          {tracks.map((t) => (
            <TrackCard key={t._id} track={t} queue={tracks} />
          ))}
          {tracks.length === 0 && <p className="text-sm text-text-muted">No tracks found for this genre yet.</p>}
        </SectionRow>
      )}

      {MOODS.map(
        (mood) =>
          moodTracks[mood]?.length > 0 && (
            <SectionRow key={mood} title={`Mood: ${mood[0].toUpperCase()}${mood.slice(1)}`}>
              {moodTracks[mood].map((t) => (
                <TrackCard key={t._id} track={t} queue={moodTracks[mood]} />
              ))}
            </SectionRow>
          )
      )}
    </div>
  );
}
