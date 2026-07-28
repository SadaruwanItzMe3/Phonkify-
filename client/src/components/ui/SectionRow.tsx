import type { ReactNode } from 'react';

interface SectionRowProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function SectionRow({ title, subtitle, children }: SectionRowProps) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-text-primary sm:text-xl">{title}</h2>
        {subtitle && <span className="text-xs text-text-muted">{subtitle}</span>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">{children}</div>
    </section>
  );
}
