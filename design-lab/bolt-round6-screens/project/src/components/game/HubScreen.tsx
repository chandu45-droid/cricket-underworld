import { EMPIRE_STATS, RIVAL_EMPIRES } from '../../data/game';
import { formatPrice } from './ui';
import { LogoRecommended } from '../Logos';
import type { ReactNode } from 'react';

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="cu-card rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-ember-orange/5 rounded-full blur-2xl group-hover:bg-ember-orange/10 transition-all" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-ember-orange/10 flex items-center justify-center text-ember-orange">
            {icon}
          </div>
          <span className="text-[9px] uppercase tracking-wider text-white/40 font-heading">{label}</span>
        </div>
        <div className="font-display text-3xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

export function HubScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const stats = EMPIRE_STATS;

  return (
    <div className="space-y-8">
      {/* Empire header */}
      <div className="cu-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ember-orange/[0.04] rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
            <LogoRecommended />
          </div>
          <div className="flex-1">
            <div className="text-[9px] uppercase tracking-[4px] text-ember-gold/60 font-heading mb-1">
              Your Empire
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-none">
              THE UNDERWORLD
            </h1>
            <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-white/45">
              <span>Reputation <span className="text-ember-orange font-semibold">{stats.reputation}</span></span>
              <span>Influence <span className="text-ember-orange font-semibold">{stats.influence}</span></span>
              <span>Squad <span className="text-ember-orange font-semibold">{stats.squadSize}</span></span>
              <span>Tournaments Won <span className="text-ember-orange font-semibold">{stats.tournamentsWon}</span></span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-white/40 font-heading">Treasury</div>
            <div className="font-display text-4xl font-bold cu-ember-text">{formatPrice(stats.treasury)}</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Treasury" value={formatPrice(stats.treasury)} icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        } />
        <StatCard label="Reputation" value={`${stats.reputation}`} icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        } />
        <StatCard label="Influence" value={`${stats.influence}`} icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
        } />
        <StatCard label="Deals Done" value={`${stats.dealsCompleted}`} icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        } />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'auction', label: 'Enter Auction', desc: 'Bid for elite talent', color: '#FF6A00' },
            { id: 'squad', label: 'Manage Squad', desc: 'View your roster', color: '#E8B84A' },
            { id: 'deals', label: 'Underground Deals', desc: 'Negotiate in shadow', color: '#B87333' },
            { id: 'match', label: 'Play Match', desc: 'Compete for glory', color: '#D4621A' },
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="cu-card rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 group"
            >
              <div
                className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${action.color}, ${action.color}44)`, boxShadow: `0 4px 16px ${action.color}25` }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: '#050608', opacity: 0.4 }} />
              </div>
              <div className="text-sm font-semibold text-white">{action.label}</div>
              <div className="text-[10px] text-white/35 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Rival empires */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
          Rival Empires
        </h3>
        <div className="space-y-3">
          {RIVAL_EMPIRES.map((rival, i) => (
            <div key={rival.name} className="cu-card rounded-xl p-4 flex items-center gap-4">
              <div className="text-[10px] text-white/25 font-heading w-4">{i + 1}</div>
              <div
                className="w-8 h-8 rounded-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${rival.color}, ${rival.color}44)` }}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{rival.name}</div>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${rival.power}%`, background: `linear-gradient(90deg, ${rival.color}, ${rival.color}88)` }}
                  />
                </div>
              </div>
              <div className="text-sm font-display font-bold text-white/60">{rival.power}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
