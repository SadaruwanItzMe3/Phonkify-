import { api } from './api';
import type { Playlist } from '@/types';

export const playlistService = {
  getMine: () => api.get<{ playlists: Playlist[] }>('/playlists/mine').then((r) => r.data.playlists),

  getById: (id: string) => api.get<{ playlist: Playlist }>(`/playlists/${id}`).then((r) => r.data.playlist),

  create: (payload: Partial<Playlist>) =>
    api.post<{ playlist: Playlist }>('/playlists', payload).then((r) => r.data.playlist),

  update: (id: string, payload: Partial<Playlist>) =>
    api.patch<{ playlist: Playlist }>(`/playlists/${id}`, payload).then((r) => r.data.playlist),

  remove: (id: string) => api.delete(`/playlists/${id}`),

  addTrack: (id: string, trackId: string) =>
    api.post<{ playlist: Playlist }>(`/playlists/${id}/tracks`, { trackId }).then((r) => r.data.playlist),

  removeTrack: (id: string, trackId: string) =>
    api.delete<{ playlist: Playlist }>(`/playlists/${id}/tracks/${trackId}`).then((r) => r.data.playlist),

  share: (id: string) => api.post<{ shareSlug: string }>(`/playlists/${id}/share`).then((r) => r.data.shareSlug),
};
