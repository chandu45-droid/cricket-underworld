import { useState } from 'react';
import { INITIAL_SQUAD } from '../../data/game';
import type { SquadPlayer } from '../../data/game';
import { PlayerCard, StatBar, formatPrice, tierColor } from './ui';

export function SquadScreen() {
  const [squad] = useState<SquadPlayer[]>(INITIAL_SQUAD);
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const filters = ['All', 'Batter', 'Bowler', 'All-Rounder', 'Keeper'];
  const filtered = filter === 'All' ? squad : squad.filter((p) => p.role === filter);

  const avgRating = Math.round(squad.reduce((sum, p) => sum + p.rating, 0) / squad.length);
  const totalValue = squad.reduce((sum, p) => sum + p.acquiredFor, 0);
  const avgMorale = Math.round(squad.reduce((sum, p) => sum + p.morale, 0) / squad.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cu-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-ember-gold/[0.04] rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-gold/60 font-heading mb-1">
            Your Roster
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-none">THE SQUAD</h2>
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Squad Rating</div>
              <div className="font-display text-2xl font-bold text-white">{avgRating}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Total Value</div>
              <div className="font-display text-2xl font-bold cu-gold-text">{formatPrice(totalValue)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Avg Morale</div>
              <div className="font-display text-2xl font-bold text-white">{avgMorale}%</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Players</div>
              <div className="font-display text-2xl font-bold text-white">{squad.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[11px] font-heading uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-ember-orange/15 text-ember-orange border border-ember-orange/30'
                : 'cu-card text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Squad grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={() => setSelected(player)}>
            <div className="space-y-1.5 mb-3">
              <StatBar label="MOR" value={player.morale} color={player.morale > 80 ? '#22C55E' : player.morale > 60 ? '#F59E0B' : '#EF4444'} />
              <StatBar label="FORM" value={player.form} color={player.form > 80 ? '#22C55E' : player.form > 60 ? '#F59E0B' : '#EF4444'} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Acquired</span>
              <span className="text-[11px] font-semibold text-white/60">{formatPrice(player.acquiredFor)}</span>
            </div>
          </PlayerCard>
        ))}
      </div>

      {/* Player detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-underworld-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="cu-card rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold text-white">Player Profile</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-display font-bold text-2xl text-white"
                style={{ background: `linear-gradient(135deg, ${tierColor(selected.tier)}, ${tierColor(selected.tier)}55)`, boxShadow: `0 4px 16px ${tierColor(selected.tier)}30` }}
              >
                {selected.rating}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{selected.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-heading">
                  {selected.tier} {selected.role} · {selected.nationality}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <StatBar label="BAT" value={selected.stats.batting} color={tierColor(selected.tier)} />
              <StatBar label="BWL" value={selected.stats.bowling} color={tierColor(selected.tier)} />
              <StatBar label="FLD" value={selected.stats.fielding} color={tierColor(selected.tier)} />
              <StatBar label="PWR" value={selected.stats.power} color={tierColor(selected.tier)} />
              <StatBar label="MOR" value={selected.morale} color={selected.morale > 80 ? '#22C55E' : selected.morale > 60 ? '#F59E0B' : '#EF4444'} />
              <StatBar label="FORM" value={selected.form} color={selected.form > 80 ? '#22C55E' : selected.form > 60 ? '#F59E0B' : '#EF4444'} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="cu-btn-primary px-4 py-2.5 rounded-lg text-[11px]">TRAIN</button>
              <button className="cu-btn-ghost px-4 py-2.5 rounded-lg text-[11px]">PUT ON MARKET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
