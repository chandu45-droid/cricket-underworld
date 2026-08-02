import { LogoRecommended, Wordmark } from './Logos';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cu-grain cu-vignette">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-underworld-black via-underworld-void to-underworld-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,106,0,0.08),transparent_60%)]" />

      {/* Smoke layers */}
      <div className="cu-smoke" style={{ top: '10%', left: '5%' }} />
      <div className="cu-smoke" style={{ bottom: '15%', right: '8%', animationDelay: '2s' }} />
      <div className="cu-smoke" style={{ top: '40%', right: '15%', animationDelay: '4s' }} />

      {/* Ember particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="cu-ember animate-ember-float"
          style={{
            left: `${5 + i * 8}%`,
            top: `${20 + (i % 4) * 20}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo */}
        <div className="cu-logo-reveal cu-sweep rounded-3xl">
          <div className="w-40 h-40 md:w-52 md:h-52">
            <LogoRecommended animated />
          </div>
        </div>

        {/* Title */}
        <div className="mt-8">
          <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-4">
            Brand Identity System
          </div>
          <Wordmark size="lg" />
        </div>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-sm md:text-base text-white/45 leading-relaxed font-body">
          A premium, cinematic, high-stakes cricket universe. Not a simulator. Not a league.
          An underground empire built through auctions, secret deals, and the pursuit of power.
        </p>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <div className="text-[9px] uppercase tracking-[4px] text-white/25 font-heading">Scroll to explore</div>
          <div className="w-px h-12 bg-gradient-to-b from-ember-orange/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
