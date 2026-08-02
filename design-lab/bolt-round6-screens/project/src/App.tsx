import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { ConceptGallery } from '@/components/ConceptGallery';
import { Recommendation } from '@/components/Recommendation';
import { BrandSystem } from '@/components/BrandSystem';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { GameShell } from '@/components/GameShell';

type View = 'brand' | 'game';

export default function App() {
  const [view, setView] = useState<View>('brand');

  if (view === 'game') {
    return (
      <div className="min-h-screen bg-underworld-black text-white font-body relative">
        <GameShell />
        {/* Floating switch button */}
        <button
          onClick={() => setView('brand')}
          className="fixed top-4 right-4 z-50 cu-btn-ghost px-4 py-2 rounded-lg text-[11px] font-heading uppercase tracking-wider"
        >
          Brand Identity
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-underworld-black text-white font-body">
      {/* Floating switch button */}
      <button
        onClick={() => setView('game')}
        className="fixed top-4 right-4 z-50 cu-btn-primary px-4 py-2 rounded-lg text-[11px] font-heading uppercase tracking-wider"
      >
        Enter the Game
      </button>

      <Hero />
      <div className="cu-divider max-w-5xl mx-auto" />
      <ConceptGallery />
      <div className="cu-divider max-w-5xl mx-auto" />
      <Recommendation />
      <div className="cu-divider max-w-5xl mx-auto" />
      <BrandSystem />
      <div className="cu-divider max-w-5xl mx-auto" />
      <AnimatedLogo />

      {/* CTA to game */}
      <section className="relative py-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,106,0,0.06),transparent_60%)]" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Build Your Empire?
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto mb-8">
            Enter the underground. Bid at auction. Negotiate in shadow. Rule the game.
          </p>
          <button
            onClick={() => setView('game')}
            className="cu-btn-primary px-10 py-4 rounded-xl text-base"
          >
            ENTER CRICKET UNDERWORLD
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-[10px] uppercase tracking-[6px] text-white/20 font-heading">
            Cricket Underworld — Brand Identity System
          </div>
          <div className="text-[10px] text-white/15 mt-2">
            Designed for the next 10 years of underground cricket empire building
          </div>
        </div>
      </footer>
    </div>
  );
}
