import type { ReactNode } from 'react';

export function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function tierColor(tier: string): string {
  switch (tier) {
    case 'Legendary': return '#FF6A00';
    case 'Elite': return '#E8B84A';
    case 'Pro': return '#B87333';
    case 'Rising': return '#6B7280';
    default: return '#6B7280';
  }
}

export function riskColor(risk: string): string {
  switch (risk) {
    case 'Low': return '#22C55E';
    case 'Medium': return '#F59E0B';
    case 'High': return '#FF6A00';
    case 'Extreme': return '#EF4444';
    default: return '#6B7280';
  }
}

export function StatBar({ label, value, color = '#FF6A00' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider text-white/35 w-12 font-heading">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
      <span className="text-[10px] text-white/40 font-heading w-6 text-right">{value}</span>
    </div>
  );
}

export function PlayerCard({
  player,
  children,
  onClick,
}: {
  player: {
    name: string;
    role: string;
    tier: string;
    rating: number;
    nationality: string;
    stats: { batting: number; bowling: number; fielding: number; power: number };
  };
  children?: ReactNode;
  onClick?: () => void;
}) {
  const tc = tierColor(player.tier);
  return (
    <div
      onClick={onClick}
      className="cu-card rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 group"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${tc}, ${tc}55)`, boxShadow: `0 4px 16px ${tc}30` }}
        >
          {player.rating}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{player.name}</span>
            <span className="text-[9px] text-white/30 font-heading">{player.nationality}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] uppercase tracking-wider font-heading px-1.5 py-0.5 rounded"
              style={{ color: tc, background: `${tc}15` }}
            >
              {player.tier}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-white/40 font-heading">{player.role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1.5 mb-3">
        <StatBar label="BAT" value={player.stats.batting} color={tc} />
        <StatBar label="BWL" value={player.stats.bowling} color={tc} />
        <StatBar label="FLD" value={player.stats.fielding} color={tc} />
        <StatBar label="PWR" value={player.stats.power} color={tc} />
      </div>

      {children}
    </div>
  );
}

export function SectionHeader({
  phase,
  title,
  subtitle,
}: {
  phase: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-2">
        {phase}
      </div>
      <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-none">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-white/40 max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function Pill({
  text,
  color = '#FF6A00',
}: {
  text: string;
  color?: string;
}) {
  return (
    <span
      className="text-[9px] uppercase tracking-wider font-heading px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
    >
      {text}
    </span>
  );
}
