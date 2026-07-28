import { type ClassValue, clsx } from 'clsx';

/** Merges conditional class names (thin wrapper around clsx). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Formats milliseconds as m:ss for track durations / progress bars. */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Formats a raw play count into a compact string, e.g. 12400 -> "12.4K". */
export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
}
