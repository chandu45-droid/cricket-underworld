import type { ReactNode } from 'react';

function SystemBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cu-card rounded-2xl p-6">
      <div className="text-[9px] uppercase tracking-[3px] text-ember-orange/50 font-heading mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function ColorSwatch({ name, hex, sub }: { name: string; hex: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="aspect-square rounded-xl border border-white/8"
        style={{ background: hex, boxShadow: `0 4px 20px ${hex}30` }}
      />
      <div>
        <div className="text-[11px] font-semibold text-white">{name}</div>
        <div className="text-[9px] text-white/35 font-heading uppercase tracking-wider">{sub}</div>
        <div className="text-[9px] text-white/25 font-mono mt-0.5">{hex}</div>
      </div>
    </div>
  );
}

export function BrandSystem() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-3">
            Phase 03 — Foundation
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-none">
            The Identity System
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-white/40 leading-relaxed">
            The complete visual foundation for Cricket Underworld — every element designed to feel
            expensive, cinematic, and unmistakably premium.
          </p>
        </div>

        {/* ─── Color Palette ─── */}
        <div className="mb-12">
          <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Color Palette
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary */}
            <SystemBlock title="Primary">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Matte Black" hex="#050608" sub="Base" />
                <ColorSwatch name="Void" hex="#0A0B0F" sub="Surface" />
                <ColorSwatch name="Charcoal" hex="#12141A" sub="Elevated" />
                <ColorSwatch name="Slate" hex="#1A1D26" sub="Card" />
              </div>
            </SystemBlock>

            {/* Secondary */}
            <SystemBlock title="Secondary">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Burnt Orange" hex="#B5470D" sub="Deep" />
                <ColorSwatch name="Molten" hex="#D4621A" sub="Warm" />
                <ColorSwatch name="Amber" hex="#F59E0B" sub="Glow" />
                <ColorSwatch name="Copper" hex="#B87333" sub="Metallic" />
              </div>
            </SystemBlock>

            {/* Accents */}
            <SystemBlock title="Highlights">
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch name="Electric Orange" hex="#FF6A00" sub="Primary Accent" />
                <ColorSwatch name="Bright Ember" hex="#FF7A1A" sub="Energy" />
                <ColorSwatch name="Metallic Gold" hex="#E8B84A" sub="Premium" />
                <ColorSwatch name="Pure Gold" hex="#FFD700" sub="Spark" />
              </div>
            </SystemBlock>
          </div>
        </div>

        {/* ─── Typography ─── */}
        <div className="mb-12">
          <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Typography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SystemBlock title="Display — Teko">
              <div className="font-display text-5xl font-bold text-white leading-none mb-2">CRICKET</div>
              <div className="font-display text-5xl font-bold cu-ember-text leading-none">UNDERWORLD</div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Condensed, bold, cinematic. Used for the wordmark, hero titles, and screen headers.
                Conveys power and scale without aggression.
              </p>
            </SystemBlock>

            <SystemBlock title="Heading — Rajdhani">
              <div className="font-heading text-2xl font-bold text-white uppercase tracking-wide mb-1">
                Auction Live
              </div>
              <div className="font-heading text-lg font-semibold text-white/70 uppercase tracking-wider mb-1">
    Squad Management
              </div>
              <div className="font-heading text-sm font-medium text-white/50 uppercase tracking-widest">
    Underworld Deals
              </div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Geometric, modern, technical. Used for section labels, button text, and UI headers.
                Clean and authoritative.
              </p>
            </SystemBlock>

            <SystemBlock title="Body — Inter">
              <div className="font-body text-sm text-white/70 leading-relaxed mb-2">
                Build your underground cricket empire through auctions, secret deals, and strategic
                decisions. Every choice shapes your reputation.
              </div>
              <div className="font-body text-xs text-white/40 leading-relaxed">
                Your bid of 2.5M has been accepted. The player joins your squad.
              </div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Neutral, highly legible, invisible. Used for body copy, descriptions, and data.
                Never competes with the display or heading fonts.
              </p>
            </SystemBlock>
          </div>
        </div>

        {/* ─── UI Components ─── */}
        <div className="mb-12">
          <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            UI Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Button Style */}
            <SystemBlock title="Button Style">
              <div className="space-y-3">
                <button className="cu-btn-primary px-6 py-3 rounded-lg text-sm w-full">
                  ENTER THE AUCTION
                </button>
                <button className="cu-btn-ghost px-6 py-3 rounded-lg text-sm w-full">
                  VIEW SQUAD
                </button>
                <button className="px-6 py-3 rounded-lg text-sm w-full bg-gradient-to-r from-ember-burnt to-ember-molten text-white font-bold tracking-wide opacity-80 hover:opacity-100 transition-opacity">
                  CONFIRM DEAL
                </button>
              </div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Primary buttons use molten orange gradient with inset highlights.
                Ghost buttons use dark glass with subtle borders. No flat colors.
              </p>
            </SystemBlock>

            {/* Card Style */}
            <SystemBlock title="Card Style">
              <div className="rounded-xl border border-white/8 bg-gradient-to-b from-underworld-slate/60 to-underworld-void/80 p-4 backdrop-blur">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ember-orange to-ember-burnt flex items-center justify-center text-white font-bold text-sm">
                    87
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Virat Storm</div>
                    <div className="text-[10px] text-ember-gold/60 uppercase tracking-wider font-heading">Legendary</div>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-ember-orange to-ember-gold" />
                </div>
              </div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Dark glass surfaces with subtle gradients, thin borders, and backdrop blur.
                Cards glow on hover. No shadows — only depth through layering.
              </p>
            </SystemBlock>

            {/* Iconography */}
            <SystemBlock title="Iconography">
              <div className="grid grid-cols-4 gap-3">
                {['M5 3l11 6v14L5 17z', 'M3 12h18M3 6h18M3 18h18', 'M12 2v20M2 12h20', 'M5 12l5 5L20 7'].map((d, i) => (
                  <div key={i} className="aspect-square rounded-lg border border-white/8 bg-underworld-charcoal/50 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-ember-orange" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
                Thin-stroke, geometric, minimal. Icons use ember orange on dark surfaces.
                Never decorative — always functional. Consistent 1.5px stroke weight.
              </p>
            </SystemBlock>
          </div>
        </div>

        {/* ─── Atmosphere ─── */}
        <div className="mb-12">
          <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Atmosphere & Motion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Background */}
            <SystemBlock title="Background Language">
              <div className="aspect-video rounded-lg bg-gradient-to-b from-underworld-black via-underworld-void to-underworld-charcoal relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,106,0,0.1),transparent_60%)]" />
                <div className="absolute inset-0 cu-grain" />
              </div>
              <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                Deep matte black with radial ember glow. Never flat. Always a light source
                from above-center, like stadium floodlights through smoke.
              </p>
            </SystemBlock>

            {/* Lighting */}
            <SystemBlock title="Lighting Style">
              <div className="aspect-video rounded-lg bg-underworld-void relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-ember-orange/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-ember-gold/10 rounded-full blur-2xl" />
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-ember-molten/10 rounded-full blur-2xl" />
              </div>
              <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                Volumetric, cinematic. Light pools through smoke like floodlights.
                Warm orange and gold only — never cold blue or green.
              </p>
            </SystemBlock>

            {/* Texture */}
            <SystemBlock title="Texture Language">
              <div className="aspect-video rounded-lg bg-underworld-charcoal relative overflow-hidden">
                <div className="absolute inset-0 cu-grain opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-br from-ember-copper/5 via-transparent to-ember-burnt/5" />
              </div>
              <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                Fine film grain at 3% opacity. Subtle metallic sheen on borders.
                No rough textures. Everything feels smooth, polished, expensive.
              </p>
            </SystemBlock>

            {/* Particles */}
            <SystemBlock title="Particle Style">
              <div className="aspect-video rounded-lg bg-underworld-void relative overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="cu-ember animate-ember-float"
                    style={{
                      left: `${10 + i * 11}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                Ember particles — tiny orange-gold motes that drift upward like sparks
                from a fire. Used sparingly. Never decorative noise. Always purposeful.
              </p>
            </SystemBlock>
          </div>
        </div>

        {/* ─── Animation ─── */}
        <div>
          <h3 className="font-heading text-sm font-semibold text-white/70 uppercase tracking-wider mb-6">
            Animation Style
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Light Sweep', desc: 'A golden light band sweeps across the logo every 4 seconds. Subtle, premium, like light catching polished metal.' },
              { name: 'Ember Pulse', desc: 'The logo\'s glow ring breathes — expanding and contracting at 2.5s intervals. Communicates that the mark is alive.' },
              { name: 'Stump Strike', desc: 'On key moments (auction win, match victory), the three stumps slam down in sequence with a screen shake and ember burst.' },
              { name: 'Smoke Reveal', desc: 'On app launch, the logo emerges from drifting smoke — like floodlights revealing a stadium through fog.' },
            ].map((anim) => (
              <SystemBlock key={anim.name} title={anim.name}>
                <div className="aspect-video rounded-lg bg-underworld-void relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.08),transparent_60%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-orange/30 to-ember-gold/20 animate-pulse-glow" />
                  </div>
                </div>
                <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                  {anim.desc}
                </p>
              </SystemBlock>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
