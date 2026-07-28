import { api } from './api';
import type { Track, Genre } from '@/types';

export const trackService = {
  getTrending: (genre?: Genre) =>
    api.get<{ tracks: Track[] }>('/tracks/trending', { params: { genre } }).then((r) => r.data.tracks),

  getNewReleases: (genre?: Genre) =>
    api.get<{ tracks: Track[] }>('/tracks/new-releases', { params: { genre } }).then((r) => r.data.tracks),

  search: (q: string) => api.get<{ tracks: Track[] }>('/tracks/search', { params: { q } }).then((r) => r.data.tracks),

  getById: (id: string) => api.get<{ track: Track }>(`/tracks/${id}`).then((r) => r.data.track),
};
