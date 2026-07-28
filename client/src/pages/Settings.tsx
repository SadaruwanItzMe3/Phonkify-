import { useState } from 'react';
import { Music2, HardDrive, KeyRound, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import type { UserPreferences } from '@/types';

const EQ_PRESETS = ['flat', 'bass-boost', 'phonk-punch', 'vocal-clear', 'lo-fi'];

function SettingsSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="glass mb-5 rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2 text-text-primary">
        <Icon size={18} className="text-neon-purple" />
        <h2 className="font-display text-base font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [preferences, setPreferences] = useState<UserPreferences | undefined>(user?.preferences);
  const [saving, setSaving] = useState(false);

  const updatePreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', { preferences: updated });
      setUser(data.user);
    } finally {
      setSaving(false);
    }
  };

  const connectSpotify = async () => {
    const { data } = await api.get('/spotify/auth-url');
    window.location.href = data.url;
  };

  const clearCache = () => {
    if (confirm('Clear all locally cached/downloaded tracks?')) {
      // In a real client-side cache (IndexedDB / Capacitor filesystem) this
      // would clear stored blobs. This scaffold has no local cache yet.
      alert('Cache cleared.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Settings {saving && <span className="text-xs text-text-muted">(saving...)</span>}</h1>

      <SettingsSection icon={Music2} title="Playback">
        <label className="mb-3 block text-sm">
          Audio Quality
          <select
            value={preferences?.audioQuality}
            onChange={(e) => updatePreference('audioQuality', e.target.value as UserPreferences['audioQuality'])}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neon-purple"
          >
            <option value="low">Low (96kbps)</option>
            <option value="normal">Normal (160kbps)</option>
            <option value="high">High (320kbps)</option>
            <option value="lossless">Lossless</option>
          </select>
        </label>

        <label className="mb-3 block text-sm">
          Download Quality
          <select
            value={preferences?.downloadQuality}
            onChange={(e) => updatePreference('downloadQuality', e.target.value as UserPreferences['downloadQuality'])}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-neon-purple"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="flex items-center justify-between text-sm">
          Autoplay
          <input
            type="checkbox"
            checked={preferences?.autoplay ?? true}
            onChange={(e) => updatePreference('autoplay', e.target.checked)}
            className="h-4 w-4 accent-[var(--color-neon-purple)]"
          />
        </label>
      </SettingsSection>

      <SettingsSection icon={SlidersHorizontal} title="Equalizer">
        <div className="flex flex-wrap gap-2">
          {EQ_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => updatePreference('equalizerPreset', preset)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                preferences?.equalizerPreset === preset
                  ? 'bg-neon-purple text-white'
                  : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={KeyRound} title="Connected Accounts">
        <div className="flex items-center justify-between text-sm">
          <span>Spotify</span>
          {user?.spotify?.connected ? (
            <span className="text-xs text-green-400">Connected</span>
          ) : (
            <button
              onClick={connectSpotify}
              className="rounded-full bg-[#1DB954] px-3 py-1.5 text-xs font-semibold text-black"
            >
              Connect
            </button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection icon={HardDrive} title="Storage">
        <button
          onClick={clearCache}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          <Trash2 size={15} /> Clear Cache
        </button>
      </SettingsSection>
    </div>
  );
}
