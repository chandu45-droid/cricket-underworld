import { CONCEPTS } from '../data/concepts';
import { Concept1, Concept2, Concept3, Concept4, Concept5, Concept6 } from './Logos';
import type { ReactNode } from 'react';

const CONCEPT_COMPONENTS: Record<number, ReactNode> = {
  1: <Concept1 />,
  2: <Concept2 />,
  3: <Concept3 />,
  4: <Concept4 />,
  5: <Concept5 />,
  6: <Concept6 />,
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider text-white/35 w-20 font-heading">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ember-orange to-ember-gold"
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="text-[10px] text-white/40 font-heading w-4 text-right">{value}</span>
    </div>
  );
}

export function ConceptGallery() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-3">
            Phase 01 — Exploration
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-none">
            Six Concepts. One Identity.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-white/40 leading-relaxed">
            Every concept approaches the same challenge from a different angle: how to make cricket feel
            powerful, mysterious, and premium — without looking like a sports app.
          </p>
        </div>

        {/* Concept grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONCEPTS.map((concept) => (
            <div key={concept.id} className="cu-card rounded-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-1">
              {/* Logo display */}
              <div className="p-6 pb-0">
                {CONCEPT_COMPONENTS[concept.id]}
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-[9px] uppercase tracking-[3px] text-ember-orange/50 font-heading">
                    Concept {String(concept.id).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] uppercase tracking-[2px] text-white/25 font-heading">
                    {concept.tagline}
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{concept.name}</h3>

                <p className="text-[12.5px] text-white/45 leading-relaxed mb-4">
                  {concept.psychology}
                </p>

                {/* Strengths & risks */}
                <div className="space-y-1.5 mb-4">
                  {concept.strengths.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[11px] text-white/50">
                      <span className="text-ember-orange text-[8px]">▲</span>
                      {s}
                    </div>
                  ))}
                  {concept.risks.map((r) => (
                    <div key={r} className="flex items-center gap-2 text-[11px] text-white/30">
                      <span className="text-white/20 text-[8px]">▽</span>
                      {r}
                    </div>
                  ))}
                </div>

                {/* Scores */}
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  <ScoreBar label="Silhouette" value={concept.silhouetteScore} />
                  <ScoreBar label="Prestige" value={concept.prestigeScore} />
                  <ScoreBar label="Mystery" value={concept.mysteryScore} />
                  <ScoreBar label="Scale" value={concept.scalabilityScore} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
