import { useState, useEffect, useRef } from 'react';
import { MATCH_EVENTS } from '../../data/game';
import type { MatchEvent } from '../../data/game';

const EVENT_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  boundary: { color: '#E8B84A', bg: 'rgba(232,184,74,0.1)', label: '4' },
  six: { color: '#FF6A00', bg: 'rgba(255,106,0,0.12)', label: '6' },
  wicket: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'W' },
  dot: { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', label: '•' },
  run: { color: '#22C55E', bg: 'rgba(34,197,94,0.08)', label: 'R' },
  info: { color: '#3A3F4D', bg: 'rgba(58,63,77,0.08)', label: 'i' },
};

export function MatchScreen() {
  const [playing, setPlaying] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [score, setScore] = useState({ runs: 0, wickets: 0, balls: 0 });
  const [complete, setComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;

    if (events.length >= MATCH_EVENTS.length) {
      setPlaying(false);
      setComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      const nextEvent = MATCH_EVENTS[events.length];
      setEvents((prev) => [...prev, nextEvent]);

      setScore((prev) => {
        let runs = prev.runs;
        let wickets = prev.wickets;
        if (nextEvent.type === 'boundary') runs += 4;
        else if (nextEvent.type === 'six') runs += 6;
        else if (nextEvent.type === 'wicket') wickets += 1;
        else if (nextEvent.type === 'run') runs += 2;
        return { runs, wickets, balls: prev.balls + 1 };
      });
    }, 1400);

    return () => clearTimeout(timer);
  }, [playing, events.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const startMatch = () => {
    setEvents([]);
    setScore({ runs: 0, wickets: 0, balls: 0 });
    setComplete(false);
    setPlaying(true);
  };

  const overs = `${Math.floor(score.balls / 6)}.${score.balls % 6}`;

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="cu-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ember-orange/0 via-ember-orange/40 to-ember-orange/0" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-ember-orange/[0.05] rounded-full blur-3xl" />

        <div className="relative">
          {/* Teams */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[9px] uppercase tracking-[4px] text-ember-orange/60 font-heading mb-1">Batting</div>
              <div className="font-display text-2xl font-bold text-white">THE UNDERWORLD</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">VS</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[4px] text-white/40 font-heading mb-1">Bowling</div>
              <div className="font-display text-2xl font-bold text-white/60">SHADOW SYNDICATE</div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="font-display text-6xl md:text-7xl font-bold text-white leading-none">
                {score.runs}
                <span className="text-white/30 text-4xl">/{score.wickets}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-heading mt-2">
                {overs} overs
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-3">
            {complete ? (
              <div className="text-center">
                <div className="font-display text-3xl font-bold cu-ember-text">VICTORY</div>
                <div className="text-[11px] text-white/40 mt-1">The Underworld claims the match</div>
              </div>
            ) : playing ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ember-orange animate-pulse" />
                <span className="text-[11px] uppercase tracking-wider text-ember-orange font-heading">LIVE</span>
              </div>
            ) : (
              <button onClick={startMatch} className="cu-btn-primary px-8 py-3 rounded-lg text-sm">
                START MATCH
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Commentary feed */}
      <div className="cu-card rounded-2xl p-5">
        <div className="text-[9px] uppercase tracking-[3px] text-white/40 font-heading mb-4">
          Live Commentary
        </div>
        <div ref={scrollRef} className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {events.length === 0 && !playing && (
            <div className="text-center py-8 text-[12px] text-white/30">
              Press START MATCH to begin the simulation
            </div>
          )}
          {events.map((event, i) => {
            const style = EVENT_STYLES[event.type] || EVENT_STYLES.info;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg transition-all"
                style={{ background: style.bg }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                  style={{ color: style.color, background: `${style.color}20` }}
                >
                  {style.label}
                </div>
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-wider text-white/30 font-heading">
                    Over {event.over}
                  </div>
                  <div className="text-[12px] text-white/70 leading-relaxed">{event.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
