import { Hero } from '@/components/Hero';
import { ConceptGallery } from '@/components/ConceptGallery';
import { Recommendation } from '@/components/Recommendation';
import { BrandSystem } from '@/components/BrandSystem';
import { AnimatedLogo } from '@/components/AnimatedLogo';

export default function App() {
  return (
    <div className="min-h-screen bg-underworld-black text-white font-body">
      <Hero />
      <div className="cu-divider max-w-5xl mx-auto" />
      <ConceptGallery />
      <div className="cu-divider max-w-5xl mx-auto" />
      <Recommendation />
      <div className="cu-divider max-w-5xl mx-auto" />
      <BrandSystem />
      <div className="cu-divider max-w-5xl mx-auto" />
      <AnimatedLogo />

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
