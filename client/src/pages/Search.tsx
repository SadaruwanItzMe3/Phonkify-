import { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import type { Track } from '@/types';
import { trackService } from '@/services/trackService';
import TrackRow from '@/components/ui/TrackRow';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const tracks = await trackService.search(query);
        setResults(tracks);
      } finally {
        setLoading(false);
      }
    }, 350); // debounce

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold sm:text-3xl">Search</h1>

      <div className="glass mb-6 flex items-center gap-3 rounded-2xl px-4 py-3">
        <SearchIcon size={18} className="text-text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, albums, artists, playlists..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
        />
      </div>

      {loading && <p className="text-sm text-text-muted">Searching...</p>}

      {!loading && query && results.length === 0 && (
        <p className="text-sm text-text-muted">No results for "{query}" in the local catalog yet.</p>
      )}

      <div className="space-y-1">
        {results.map((t, i) => (
          <TrackRow key={t._id} track={t} index={i} queue={results} />
        ))}
      </div>
    </div>
  );
}
