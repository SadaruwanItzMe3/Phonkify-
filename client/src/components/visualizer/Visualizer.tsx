import { useEffect, useRef } from 'react';
import { getAnalyser } from '@/hooks/useAudioEngine';
import { usePlayerStore } from '@/store/playerStore';

interface VisualizerProps {
  className?: string;
  barCount?: number;
}

/**
 * Renders a real-time frequency spectrum when the Web Audio analyser is
 * available, and gracefully falls back to a decorative animated bar pattern
 * (driven by play state, not real audio data) when it isn't — e.g. before
 * the AudioContext has been unlocked by a user gesture.
 */
export default function Visualizer({ className = '', barCount = 48 }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let fallbackPhase = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const analyser = getAnalyser();
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#29f1ff');
      gradient.addColorStop(0.55, '#b026ff');
      gradient.addColorStop(1, '#ff2ec4');
      ctx.fillStyle = gradient;

      const barWidth = width / barCount;
      const gap = barWidth * 0.25;

      if (analyser && isPlaying) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / barCount);

        for (let i = 0; i < barCount; i += 1) {
          const value = data[i * step] || 0;
          const barHeight = (value / 255) * height;
          ctx.fillRect(i * barWidth + gap / 2, height - barHeight, barWidth - gap, barHeight);
        }
      } else {
        // Decorative idle / fallback animation
        fallbackPhase += isPlaying ? 0.08 : 0.02;
        for (let i = 0; i < barCount; i += 1) {
          const wave = Math.sin(fallbackPhase + i * 0.4) * 0.5 + 0.5;
          const barHeight = (isPlaying ? 0.15 + wave * 0.5 : 0.08 + wave * 0.12) * height;
          ctx.fillRect(i * barWidth + gap / 2, height - barHeight, barWidth - gap, barHeight);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [barCount, isPlaying]);

  return <canvas ref={canvasRef} className={className} />;
}
