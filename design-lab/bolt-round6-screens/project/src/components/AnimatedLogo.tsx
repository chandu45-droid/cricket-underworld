import { useState } from 'react';
import { LogoRecommended } from './Logos';

const ANIMATIONS = [
  {
    id: 'sweep',
    name: 'Light Sweep',
    desc: 'Golden light band crosses the mark',
  },
  {
    id: 'pulse',
    name: 'Ember Pulse',
    desc: 'Glow ring breathes with energy',
  },
  {
    id: 'strike',
    name: 'Stump Strike',
    desc: 'Stumps slam down in sequence',
  },
  {
    id: 'smoke',
    name: 'Smoke Reveal',
    desc: 'Logo emerges from shadow',
  },
];

export function AnimatedLogo() {
  const [active, setActive] = useState('sweep');
  const [key, setKey] = useState(0);

  const replay = (id: string) => {
    setActive(id);
    setKey((k) => k + 1);
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ember-orange/[0.02] to-transparent" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-3">
            Phase 04 — Motion
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-none">
            The Animated Logo
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-white/40 leading-relaxed">
            The logo is not static. It breathes, glows, and reacts. Select an animation to preview.
          </p>
        </div>

        {/* Stage */}
        <div className="cu-card rounded-3xl p-8 md:p-16 mb-8 relative overflow-hidden">
          {/* Smoke background */}
          <div className="cu-smoke" style={{ top: '10%', left: '10%', opacity: 0.5 }} />
          <div className="cu-smoke" style={{ bottom: '10%', right: '10%', opacity: 0.5, animationDelay: '3s' }} />

          {/* Logo stage */}
          <div className="relative flex items-center justify-center min-h-[300px]">
            {active === 'sweep' && (
              <div key={key} className="cu-sweep rounded-3xl w-48 h-48">
                <LogoRecommended animated />
              </div>
            )}
            {active === 'pulse' && (
              <div key={key} className="w-48 h-48 animate-pulse-glow rounded-3xl">
                <LogoRecommended />
              </div>
            )}
            {active === 'strike' && (
              <div key={key} className="cu-hammer-strike w-48 h-48">
                <LogoRecommended />
              </div>
            )}
            {active === 'smoke' && (
              <div key={key} className="cu-logo-reveal w-48 h-48">
                <LogoRecommended animated />
              </div>
            )}
          </div>

          {/* Ember particles in stage */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="cu-ember animate-ember-float"
              style={{
                left: `${15 + i * 13}%`,
                top: `${30 + (i % 2) * 30}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${3 + (i % 2)}s`,
              }}
            />
          ))}
        </div>

        {/* Animation selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ANIMATIONS.map((anim) => (
            <button
              key={anim.id}
              onClick={() => replay(anim.id)}
              className={`cu-card rounded-xl p-4 text-left transition-all ${
                active === anim.id
                  ? 'border-ember-orange/40 bg-ember-orange/5 -translate-y-0.5'
                  : 'hover:border-white/15'
              }`}
            >
              <div className={`text-sm font-semibold ${active === anim.id ? 'text-white' : 'text-white/60'}`}>
                {anim.name}
              </div>
              <div className="text-[10px] text-white/35 mt-1">{anim.desc}</div>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">
          Click any animation to replay it on the stage above.
        </p>
      </div>
    </section>
  );
}
