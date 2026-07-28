export type Genre = 'Phonk' | 'Drift Phonk' | 'Brazilian Phonk' | 'Memphis Rap' | 'Underground Trap' | 'Other';

export interface Track {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  artworkUrl?: string;
  genre: Genre;
  tags?: string[];
  spotifyId?: string;
  youtubeVideoId?: string;
  matchConfidence?: number | null;
  playCount?: number;
  isExplicit?: boolean;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  owner: string | { _id: string; username: string; avatarUrl?: string };
  collaborators: string[];
  tracks: { track: Track; addedBy?: string; addedAt: string }[];
  isPublic: boolean;
  isCollaborative: boolean;
  shareSlug?: string;
  isSystemGenerated?: boolean;
  systemType?: 'discover-weekly' | 'daily-mix' | 'mood' | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'dark' | 'darker';
  audioQuality: 'low' | 'normal' | 'high' | 'lossless';
  downloadQuality: 'low' | 'normal' | 'high';
  equalizerPreset: string;
  autoplay: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  favoriteTracks: string[];
  preferences: UserPreferences;
  spotify?: { connected: boolean };
}

export type RepeatMode = 'off' | 'all' | 'one';
