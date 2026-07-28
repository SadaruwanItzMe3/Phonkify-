import { api } from './api';
import type { Track } from '@/types';

export const recommendationService = {
  discoverWeekly: () =>
    api.get<{ tracks: Track[] }>('/recommendations/discover-weekly').then((r) => r.data.tracks),

  dailyMix: (genre?: string) =>
    api.get<{ tracks: Track[] }>('/recommendations/daily-mix', { params: { genre } }).then((r) => r.data.tracks),

  mood: (mood: string) =>
    api.get<{ tracks: Track[] }>('/recommendations/mood', { params: { mood } }).then((r) => r.data.tracks),
};
