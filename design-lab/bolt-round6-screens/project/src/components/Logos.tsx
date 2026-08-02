import type { ReactNode } from 'react';

// Shared gradient defs used across concepts
function ConceptFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-underworld-void to-underworld-black cu-grain cu-vignette flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,106,0,0.06),transparent_60%)]" />
      <div className="relative z-10 w-3/5">{children}</div>
      <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] uppercase tracking-[3px] text-white/25 font-heading">
        {label}
      </div>
    </div>
  );
}

// ─── Concept 1: CU Monogram ───
// Interlocked C and U forming a geometric seal. The C wraps the U like a vault.
export function LogoCU() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <linearGradient id="cu-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B84A" />
          <stop offset="50%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#B5470D" />
        </linearGradient>
      </defs>
      {/* Outer C - thick arc */}
      <path
        d="M 140 30 A 70 70 0 1 0 140 170 L 130 145 A 45 45 0 1 1 130 55 Z"
        fill="url(#cu-grad)"
      />
      {/* Inner U - negative space cut */}
      <path
        d="M 75 65 L 75 120 Q 75 140 100 140 Q 125 140 125 120 L 125 65 L 110 65 L 110 120 Q 110 125 100 125 Q 90 125 90 120 L 90 65 Z"
        fill="url(#cu-grad)"
      />
      {/* Top serif mark */}
      <rect x="70" y="58" width="60" height="8" rx="2" fill="url(#cu-grad)" />
    </svg>
  );
}

export function Concept1() {
  return (
    <ConceptFrame label="Concept 01 — CU Monogram">
      <LogoCU />
    </ConceptFrame>
  );
}

// ─── Concept 2: Hammer-Bat ───
// Auction hammer head fused with a cricket bat silhouette. Power + commerce.
export function LogoHammerBat() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <linearGradient id="hb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B84A" />
          <stop offset="40%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#8B5A2B" />
        </linearGradient>
        <linearGradient id="hb-handle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B87333" />
          <stop offset="100%" stopColor="#6B4423" />
        </linearGradient>
      </defs>
      {/* Bat blade shaped like hammer head */}
      <path
        d="M 60 40 L 140 40 L 150 55 L 150 95 L 140 110 L 60 110 L 50 95 L 50 55 Z"
        fill="url(#hb-grad)"
      />
      {/* Hammer band */}
      <rect x="48" y="68" width="104" height="10" rx="2" fill="#050608" opacity="0.5" />
      {/* Center seam line */}
      <line x1="100" y1="40" x2="100" y2="110" stroke="#050608" strokeWidth="2" opacity="0.3" />
      {/* Handle - cricket bat handle style */}
      <rect x="92" y="110" width="16" height="55" rx="3" fill="url(#hb-handle)" />
      {/* Grip lines */}
      <line x1="92" y1="125" x2="108" y2="125" stroke="#3A1F0D" strokeWidth="2" />
      <line x1="92" y1="135" x2="108" y2="135" stroke="#3A1F0D" strokeWidth="2" />
      <line x1="92" y1="145" x2="108" y2="145" stroke="#3A1F0D" strokeWidth="2" />
      {/* Impact spark */}
      <circle cx="100" cy="40" r="3" fill="#FFD700" />
      <line x1="100" y1="30" x2="100" y2="22" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      <line x1="85" y1="35" x2="78" y2="28" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="115" y1="35" x2="122" y2="28" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Concept2() {
  return (
    <ConceptFrame label="Concept 02 — Hammer-Bat">
      <LogoHammerBat />
    </ConceptFrame>
  );
}

// ─── Concept 3: Seam Ball ───
// Minimalist cricket ball where the raised seam forms "CU"
export function LogoSeamBall() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <radialGradient id="sb-grad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#2A2D38" />
          <stop offset="60%" stopColor="#12141A" />
          <stop offset="100%" stopColor="#050608" />
        </radialGradient>
        <linearGradient id="sb-seam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6A00" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF6A00" />
        </linearGradient>
      </defs>
      {/* Ball */}
      <circle cx="100" cy="100" r="65" fill="url(#sb-grad)" stroke="rgba(255,106,0,0.15)" strokeWidth="1" />
      {/* Highlight */}
      <ellipse cx="80" cy="75" rx="20" ry="12" fill="rgba(255,255,255,0.04)" />
      {/* Seam forming CU - curved C on left, U shape on right */}
      <path
        d="M 65 85 Q 50 100 65 115"
        fill="none"
        stroke="url(#sb-seam)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 80 85 L 80 115 Q 80 122 87 122 Q 94 122 94 115 L 94 85"
        fill="none"
        stroke="url(#sb-seam)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Stitch marks */}
      <line x1="60" y1="92" x2="64" y2="90" stroke="#FFD700" strokeWidth="1" />
      <line x1="58" y1="100" x2="62" y2="100" stroke="#FFD700" strokeWidth="1" />
      <line x1="60" y1="108" x2="64" y2="110" stroke="#FFD700" strokeWidth="1" />
      <line x1="80" y1="92" x2="84" y2="90" stroke="#FFD700" strokeWidth="1" />
      <line x1="80" y1="108" x2="84" y2="110" stroke="#FFD700" strokeWidth="1" />
    </svg>
  );
}

export function Concept3() {
  return (
    <ConceptFrame label="Concept 03 — Seam Ball CU">
      <LogoSeamBall />
    </ConceptFrame>
  );
}

// ─── Concept 4: Stump Crown ───
// Three cricket stumps arranged as a crown. Prestige + dominance.
export function LogoStumpCrown() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <linearGradient id="sc-stump" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8B84A" />
          <stop offset="40%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B5A2B" />
        </linearGradient>
        <linearGradient id="sc-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#B5470D" />
        </linearGradient>
      </defs>
      {/* Three stumps - center taller */}
      <rect x="55" y="55" width="14" height="80" rx="2" fill="url(#sc-stump)" />
      <rect x="93" y="40" width="14" height="95" rx="2" fill="url(#sc-stump)" />
      <rect x="131" y="55" width="14" height="80" rx="2" fill="url(#sc-stump)" />
      {/* Stump tops - pointed */}
      <path d="M 55 55 L 62 48 L 69 55 Z" fill="#FFD700" />
      <path d="M 93 40 L 100 32 L 107 40 Z" fill="#FFD700" />
      <path d="M 131 55 L 138 48 L 145 55 Z" fill="#FFD700" />
      {/* Bails connecting tops - crown shape */}
      <path
        d="M 62 50 L 100 36 L 138 50 L 138 56 L 100 42 L 62 56 Z"
        fill="url(#sc-base)"
      />
      {/* Base bar */}
      <rect x="40" y="135" width="120" height="10" rx="3" fill="url(#sc-base)" />
      {/* Diamond accent below */}
      <path d="M 100 150 L 110 160 L 100 170 L 90 160 Z" fill="#FF6A00" />
    </svg>
  );
}

export function Concept4() {
  return (
    <ConceptFrame label="Concept 04 — Stump Crown">
      <LogoStumpCrown />
    </ConceptFrame>
  );
}

// ─── Concept 5: Geometric Emblem ───
// Secret society / elite club geometric mark with hidden cricket references
export function LogoGeometric() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <linearGradient id="ge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B84A" />
          <stop offset="50%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#B5470D" />
        </linearGradient>
      </defs>
      {/* Outer hexagon */}
      <path
        d="M 100 25 L 165 62 L 165 138 L 100 175 L 35 138 L 35 62 Z"
        fill="none"
        stroke="url(#ge-grad)"
        strokeWidth="3"
      />
      {/* Inner triangle pointing up */}
      <path
        d="M 100 50 L 145 125 L 55 125 Z"
        fill="none"
        stroke="url(#ge-grad)"
        strokeWidth="2.5"
      />
      {/* Inner inverted triangle - forming star */}
      <path
        d="M 100 150 L 145 75 L 55 75 Z"
        fill="none"
        stroke="url(#ge-grad)"
        strokeWidth="2.5"
      />
      {/* Center diamond - cricket ball reference */}
      <path
        d="M 100 85 L 115 100 L 100 115 L 85 100 Z"
        fill="url(#ge-grad)"
      />
      {/* Seam line through diamond */}
      <line x1="85" y1="100" x2="115" y2="100" stroke="#050608" strokeWidth="1.5" />
      {/* Outer corner accents */}
      <circle cx="100" cy="25" r="3" fill="#FFD700" />
      <circle cx="165" cy="62" r="3" fill="#FFD700" />
      <circle cx="165" cy="138" r="3" fill="#FFD700" />
      <circle cx="100" cy="175" r="3" fill="#FFD700" />
      <circle cx="35" cy="138" r="3" fill="#FFD700" />
      <circle cx="35" cy="62" r="3" fill="#FFD700" />
    </svg>
  );
}

export function Concept5() {
  return (
    <ConceptFrame label="Concept 05 — Geometric Emblem">
      <LogoGeometric />
    </ConceptFrame>
  );
}

// ─── Concept 6: Empire Insignia ───
// Luxury crest with underground empire symbolism - arch, keyhole, bat cross
export function LogoInsignia() {
  return (
    <svg viewBox="0 0 200 200" className="w-full">
      <defs>
        <linearGradient id="ins-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8B84A" />
          <stop offset="50%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#8B5A2B" />
        </linearGradient>
      </defs>
      {/* Outer arch frame */}
      <path
        d="M 45 170 L 45 90 Q 45 40 100 40 Q 155 40 155 90 L 155 170"
        fill="none"
        stroke="url(#ins-grad)"
        strokeWidth="3.5"
      />
      {/* Inner arch */}
      <path
        d="M 58 170 L 58 92 Q 58 53 100 53 Q 142 53 142 92 L 142 170"
        fill="none"
        stroke="url(#ins-grad)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      {/* Crossed bats */}
      <g transform="translate(100, 110)">
        <rect x="-3" y="-35" width="6" height="50" rx="2" fill="url(#ins-grad)" transform="rotate(-20)" />
        <rect x="-3" y="-35" width="6" height="50" rx="2" fill="url(#ins-grad)" transform="rotate(20)" />
      </g>
      {/* Central diamond */}
      <path d="M 100 100 L 112 115 L 100 130 L 88 115 Z" fill="url(#ins-grad)" />
      {/* Keyhole dot */}
      <circle cx="100" cy="115" r="4" fill="#050608" />
      {/* Bottom bar */}
      <rect x="55" y="170" width="90" height="6" rx="2" fill="url(#ins-grad)" />
      {/* Top crown point */}
      <path d="M 100 30 L 108 42 L 92 42 Z" fill="#FFD700" />
      {/* Side flourishes */}
      <circle cx="45" cy="170" r="4" fill="#FFD700" />
      <circle cx="155" cy="170" r="4" fill="#FFD700" />
    </svg>
  );
}

export function Concept6() {
  return (
    <ConceptFrame label="Concept 06 — Empire Insignia">
      <LogoInsignia />
    </ConceptFrame>
  );
}

// ─── Recommended: Refined Stump Crown ───
// The chosen concept, refined to its ultimate form
export function LogoRecommended({ animated = false }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full" style={{ filter: 'drop-shadow(0 4px 20px rgba(255,106,0,0.2))' }}>
      <defs>
        <linearGradient id="rec-stump" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="30%" stopColor="#E8B84A" />
          <stop offset="60%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B5A2B" />
        </linearGradient>
        <linearGradient id="rec-bail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A1A" />
          <stop offset="50%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#B5470D" />
        </linearGradient>
        <linearGradient id="rec-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B5470D" />
          <stop offset="50%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#B5470D" />
        </linearGradient>
        <radialGradient id="rec-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,106,0,0.15)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {animated && (
          <linearGradient id="rec-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255,215,0,0.6)" />
            <stop offset="55%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        )}
      </defs>

      {/* Glow background */}
      <circle cx="100" cy="100" r="80" fill="url(#rec-glow)" />

      {/* Three stumps */}
      <rect x="52" y="52" width="13" height="83" rx="1.5" fill="url(#rec-stump)" />
      <rect x="93.5" y="38" width="13" height="97" rx="1.5" fill="url(#rec-stump)" />
      <rect x="135" y="52" width="13" height="83" rx="1.5" fill="url(#rec-stump)" />

      {/* Stump caps - pointed gold */}
      <path d="M 52 52 L 58.5 44 L 65 52 Z" fill="#FFD700" />
      <path d="M 93.5 38 L 100 30 L 106.5 38 Z" fill="#FFD700" />
      <path d="M 135 52 L 141.5 44 L 148 52 Z" fill="#FFD700" />

      {/* Bails - crown arch connecting all three */}
      <path
        d="M 58.5 48 Q 79 35 100 34 Q 121 35 141.5 48 L 141.5 54 Q 121 41 100 40 Q 79 41 58.5 54 Z"
        fill="url(#rec-bail)"
      />

      {/* Base bar */}
      <rect x="38" y="135" width="124" height="9" rx="2" fill="url(#rec-base)" />

      {/* Diamond accent */}
      <path d="M 100 152 L 110 162 L 100 172 L 90 162 Z" fill="url(#rec-bail)" />
      <path d="M 100 156 L 107 162 L 100 168 L 93 162 Z" fill="#050608" opacity="0.4" />

      {/* Animated sweep overlay */}
      {animated && (
        <rect x="0" y="0" width="200" height="200" fill="url(#rec-sweep)" opacity="0.5">
          <animate attributeName="x" values="-200;200" dur="3s" repeatCount="indefinite" />
        </rect>
      )}
    </svg>
  );
}

// ─── Wordmark ───
export function Wordmark({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };
  return (
    <div className={`font-display font-bold leading-none tracking-wide ${sizes[size]}`}>
      <span className="text-white">CRICKET</span>
      <span className="cu-ember-text ml-3">UNDERWORLD</span>
    </div>
  );
}

// ─── App Icon ───
export function AppIcon() {
  return (
    <div className="relative aspect-square w-full rounded-[22%] bg-gradient-to-br from-underworld-slate via-underworld-charcoal to-underworld-black overflow-hidden cu-grain cu-glow-ring">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,106,0,0.12),transparent_65%)]" />
      <div className="absolute inset-0 flex items-center justify-center p-[18%]">
        <LogoRecommended />
      </div>
    </div>
  );
}
