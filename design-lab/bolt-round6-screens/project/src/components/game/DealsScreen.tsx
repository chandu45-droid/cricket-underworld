import { useState } from 'react';
import { DEALS } from '../../data/game';
import type { Deal } from '../../data/game';
import { formatPrice, riskColor, Pill } from './ui';

export function DealsScreen() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const acceptDeal = (deal: Deal) => {
    setAccepted((prev) => ({ ...prev, [deal.id]: true }));
    setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cu-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-ember-copper/[0.05] rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-copper/70 font-heading mb-1">
            Underground Network
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-none">SHADOW DEALS</h2>
          <p className="text-[11px] text-white/40 mt-2 max-w-lg">
            Negotiate in the dark. Every deal carries risk and reward. The underworld remembers who you deal with.
          </p>
        </div>
      </div>

      {/* Active deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deals.map((deal) => {
          const rc = riskColor(deal.risk);
          return (
            <div
              key={deal.id}
              className="cu-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              onClick={() => setSelected(deal)}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Pill text={deal.type} color={rc} />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ color: rc, background: `${rc}15` }}
                  >
                    {deal.expiresIn}h
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:cu-ember-text transition-all">
                {deal.title}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-white/40 leading-relaxed mb-4 line-clamp-2">
                {deal.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Risk</div>
                  <div className="text-[11px] font-semibold" style={{ color: rc }}>{deal.risk}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Reward</div>
                  <div className="text-[11px] font-semibold text-ember-gold">{deal.reward}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {deals.length === 0 && (
        <div className="cu-card rounded-2xl p-12 text-center">
          <div className="text-[11px] uppercase tracking-wider text-white/30 font-heading mb-2">
            All Deals Settled
          </div>
          <p className="text-sm text-white/40">
            The underworld is quiet. New deals will surface soon.
          </p>
        </div>
      )}

      {/* Deal modal */}
      {selected && !accepted[selected.id] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-underworld-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="cu-card cu-anim-border rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <Pill text={selected.type} color={riskColor(selected.risk)} />
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>

            <h3 className="font-display text-2xl font-bold text-white mb-3">{selected.title}</h3>
            <p className="text-[12px] text-white/50 leading-relaxed mb-5">{selected.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading mb-1">Cost</div>
                <div className="text-sm font-bold text-white">{selected.cost === 0 ? 'FREE' : formatPrice(selected.cost)}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading mb-1">Risk</div>
                <div className="text-sm font-bold" style={{ color: riskColor(selected.risk) }}>{selected.risk}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading mb-1">Expires</div>
                <div className="text-sm font-bold text-ember-orange">{selected.expiresIn}h</div>
              </div>
            </div>

            <div className="rounded-lg bg-ember-gold/5 border border-ember-gold/15 p-3 mb-5">
              <div className="text-[9px] uppercase tracking-wider text-ember-gold/60 font-heading mb-1">Reward</div>
              <div className="text-[12px] font-semibold text-ember-gold">{selected.reward}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => acceptDeal(selected)}
                className="cu-btn-primary flex-1 px-4 py-2.5 rounded-lg text-[11px]"
              >
                ACCEPT DEAL
              </button>
              <button
                onClick={() => setSelected(null)}
                className="cu-btn-ghost flex-1 px-4 py-2.5 rounded-lg text-[11px]"
              >
                WALK AWAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
