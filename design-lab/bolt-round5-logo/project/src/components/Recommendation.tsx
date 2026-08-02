import { LogoRecommended, LogoStumpCrown, Wordmark, AppIcon } from './Logos';

export function Recommendation() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ember-orange/[0.03] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,106,0,0.06),transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-3">
            Phase 02 — Decision
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-none">
            The Recommendation
          </h2>
        </div>

        {/* Recommendation banner */}
        <div className="cu-card cu-anim-border rounded-3xl p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Logo display */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-48 h-48 md:w-64 md:h-64 cu-sweep rounded-3xl">
                <LogoRecommended animated />
              </div>
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-[4px] text-ember-gold/60 font-heading mb-1">
                  Selected Concept
                </div>
                <div className="font-display text-3xl font-bold cu-ember-text">Stump Crown</div>
                <div className="text-[11px] text-white/35 mt-1">"The Empire's Crest"</div>
              </div>
            </div>

            {/* Rationale */}
            <div>
              <h3 className="font-heading text-lg font-semibold text-white mb-4 uppercase tracking-wide">
                Why Stump Crown
              </h3>
              <div className="space-y-4 text-[13px] text-white/50 leading-relaxed">
                <p>
                  <span className="text-ember-orange font-semibold">Instant recognition.</span> The stump-crown
                  fusion is readable at 48x48 pixels and on a 50-foot billboard. No ambiguity, no second guess.
                  The silhouette is a crown — universally understood as power and prestige.
                </p>
                <p>
                  <span className="text-ember-orange font-semibold">Perfect duality.</span> Stumps are the heart
                  of cricket — the wicket, the target, the prize. A crown is the ultimate symbol of dominance.
                  Together they say: <span className="text-white/70 italic">rule the game</span>, not just play it.
                </p>
                <p>
                  <span className="text-ember-orange font-semibold">10-year longevity.</span> Unlike trend-driven
                  designs, a crown-and-crest form is timeless. It will not age. It will accumulate prestige.
                </p>
                <p>
                  <span className="text-ember-orange font-semibold">Animation potential.</span> The three stumps
                  can strike down in sequence. The bails can fly off on impact. The diamond can pulse with energy.
                  The crown can assemble from embers. The form invites cinematic motion.
                </p>
                <p>
                  <span className="text-ember-orange font-semibold">Brand extension.</span> The three-stump motif
                  can become a recurring pattern — three pillars, three tiers, three levels of access. It becomes
                  a structural element of the entire game's visual language.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logo variations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Primary */}
          <div className="cu-card rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20">
              <LogoRecommended />
            </div>
            <div className="text-[9px] uppercase tracking-[2px] text-white/30 font-heading text-center">
              Primary Mark
            </div>
          </div>

          {/* Monochrome white */}
          <div className="cu-card rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20">
              <LogoStumpCrown />
            </div>
            <div className="text-[9px] uppercase tracking-[2px] text-white/30 font-heading text-center">
              Monochrome
            </div>
          </div>

          {/* App icon */}
          <div className="cu-card rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20">
              <AppIcon />
            </div>
            <div className="text-[9px] uppercase tracking-[2px] text-white/30 font-heading text-center">
              App Icon
            </div>
          </div>

          {/* Wordmark */}
          <div className="cu-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
            <Wordmark size="sm" />
            <div className="text-[9px] uppercase tracking-[2px] text-white/30 font-heading text-center">
              Wordmark
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
