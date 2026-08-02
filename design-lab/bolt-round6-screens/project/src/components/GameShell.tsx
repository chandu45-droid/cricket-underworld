import { useState } from 'react';
import { HubScreen } from './game/HubScreen';
import { AuctionScreen } from './game/AuctionScreen';
import { SquadScreen } from './game/SquadScreen';
import { DealsScreen } from './game/DealsScreen';
import { MatchScreen } from './game/MatchScreen';
import { LogoRecommended } from './Logos';

type Screen = 'hub' | 'auction' | 'squad' | 'deals' | 'match';

const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: 'hub', label: 'Empire', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'auction', label: 'Auction', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'squad', label: 'Squad', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'deals', label: 'Deals', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'match', label: 'Match', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export function GameShell() {
  const [screen, setScreen] = useState<Screen>('hub');

  const renderScreen = () => {
    switch (screen) {
      case 'hub': return <HubScreen onNavigate={(s) => setScreen(s as Screen)} />;
      case 'auction': return <AuctionScreen />;
      case 'squad': return <SquadScreen />;
      case 'deals': return <DealsScreen />;
      case 'match': return <MatchScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-underworld-black flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-20 lg:w-60 border-r border-white/5 bg-underworld-void/50 backdrop-blur-xl shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center justify-center md:justify-start gap-3">
          <div className="w-10 h-10 shrink-0">
            <LogoRecommended />
          </div>
          <div className="hidden lg:block">
            <div className="font-display text-sm font-bold text-white leading-none">CRICKET</div>
            <div className="font-display text-sm font-bold cu-ember-text leading-none">UNDERWORLD</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 md:px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                screen === item.id
                  ? 'bg-ember-orange/10 text-ember-orange'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:block text-[12px] font-heading uppercase tracking-wider font-semibold">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Treasury footer */}
        <div className="p-3 border-t border-white/5">
          <div className="hidden lg:block text-[9px] uppercase tracking-wider text-white/30 font-heading mb-1">Treasury</div>
          <div className="font-display text-lg font-bold cu-ember-text">$8.5M</div>
        </div>
      </aside>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-underworld-void/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
              screen === item.id ? 'text-ember-orange' : 'text-white/40'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[8px] font-heading uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-underworld-void/50 backdrop-blur-xl">
          <div className="w-8 h-8">
            <LogoRecommended />
          </div>
          <div className="font-display text-sm font-bold">
            <span className="text-white">CRICKET</span>
            <span className="cu-ember-text ml-1.5">UNDERWORLD</span>
          </div>
          <div className="font-display text-sm font-bold cu-ember-text">$8.5M</div>
        </div>

        {/* Screen content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}
