import { useState } from 'react';
import { AUCTION_PLAYERS } from '../../data/game';
import type { Player } from '../../data/game';
import { PlayerCard, formatPrice, Pill } from './ui';

export function AuctionScreen() {
  const [players] = useState<Player[]>(AUCTION_PLAYERS);
  const [selected, setSelected] = useState<Player | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidHistory, setBidHistory] = useState<Record<string, { amount: number; bidder: string }[]>>({});
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [sold, setSold] = useState<Record<string, boolean>>({});

  const rivals = ['Shadow Syndicate', 'Crimson Order', 'Iron Pact', 'Night Cartel'];

  const placeBid = (player: Player) => {
    const newAmount = player.currentBid + Math.max(bidAmount, 50000);
    player.currentBid = newAmount;
    player.bidLeader = 'You';
    setLastAction(`You bid ${formatPrice(newAmount)} on ${player.name}`);
    setBidHistory((prev) => ({
      ...prev,
      [player.id]: [...(prev[player.id] || []), { amount: newAmount, bidder: 'You' }],
    }));

    // Rival auto-bid
    if (Math.random() > 0.4) {
      const rival = rivals[Math.floor(Math.random() * rivals.length)];
      const rivalBid = newAmount + Math.floor(Math.random() * 200000) + 50000;
      setTimeout(() => {
        player.currentBid = rivalBid;
        player.bidLeader = rival;
        setLastAction(`${rival} countered with ${formatPrice(rivalBid)}`);
        setBidHistory((prev) => ({
          ...prev,
          [player.id]: [...(prev[player.id] || []), { amount: rivalBid, bidder: rival }],
        }));
      }, 1200);
    }
  };

  const buyNow = (player: Player) => {
    setSold((prev) => ({ ...prev, [player.id]: true }));
    setLastAction(`${player.name} SOLD to you for ${formatPrice(player.currentBid)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cu-card rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-ember-orange/[0.05] rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[6px] text-ember-orange/60 font-heading mb-1">
              Live Auction
            </div>
            <h2 className="font-display text-4xl font-bold text-white leading-none">THE PIT</h2>
            <p className="text-[11px] text-white/40 mt-2">Bid against rival empires. Winner takes the player.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ember-orange animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-ember-orange font-heading">LIVE</span>
          </div>
        </div>
      </div>

      {/* Last action toast */}
      {lastAction && (
        <div className="cu-card rounded-xl px-4 py-3 border-ember-orange/20 animate-flicker">
          <span className="text-[11px] text-ember-gold font-heading uppercase tracking-wider">{lastAction}</span>
        </div>
      )}

      {/* Player grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => {
          const isSold = sold[player.id];
          return (
            <PlayerCard key={player.id} player={player} onClick={() => setSelected(player)}>
              {/* Bid status */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">Current Bid</div>
                  <div className="font-display text-2xl font-bold cu-ember-text">
                    {formatPrice(player.currentBid)}
                  </div>
                </div>
                {player.bidLeader && (
                  <Pill text={player.bidLeader === 'You' ? 'YOU LEAD' : player.bidLeader} color={player.bidLeader === 'You' ? '#FF6A00' : '#6B7280'} />
                )}
              </div>

              {isSold ? (
                <div className="rounded-lg bg-ember-gold/10 border border-ember-gold/20 py-2 text-center">
                  <span className="text-[11px] font-bold text-ember-gold uppercase tracking-wider">SOLD</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); placeBid(player); }}
                    className="cu-btn-primary flex-1 px-3 py-2 rounded-lg text-[11px]"
                  >
                    BID +50K
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); buyNow(player); }}
                    className="cu-btn-ghost px-3 py-2 rounded-lg text-[11px]"
                  >
                    BUY NOW
                  </button>
                </div>
              )}
            </PlayerCard>
          );
        })}
      </div>

      {/* Bid history modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-underworld-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="cu-card rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold text-white">Bid History</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>
            <div className="text-sm font-semibold text-white mb-3">{selected.name}</div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(bidHistory[selected.id] || [{ amount: selected.basePrice, bidder: 'Auctioneer' }]).map((bid, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className={`text-[11px] font-heading uppercase tracking-wider ${bid.bidder === 'You' ? 'text-ember-orange' : 'text-white/50'}`}>
                    {bid.bidder}
                  </span>
                  <span className="text-sm font-semibold text-white">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
