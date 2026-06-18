# Cricket Underworld — UI Visual & Structural Audit

**Date:** 2026-06-18
**Viewport:** 390×844 (iPhone 14 Pro equivalent, 2× DPR)
**Source:** Single-file HTML5/PWA — `prototype/index.html` (~431 KB)
**Live URL:** https://chandu45-droid.github.io/cricket-underworld/

---

## 1. SCREENSHOTS (390×844 mobile viewport)

All screenshots saved to `audit-screenshots/` within the project root.

| # | Screen | File | Notes |
|---|--------|------|-------|
| 1 | Hub / Home | `audit-screenshots/01-hub.png` | Manager profile, action tiles (Auction/Match), quick nav, sponsor panel, facilities |
| 2 | Auction (empty state) | `audit-screenshots/02-auction.png` | Pre-auction with "Start Auction" CTA, no player card displayed yet |
| 3 | Squad (empty state) | `audit-screenshots/03-squad.png` | 0/15 squad, team stat boxes (Batting/Bowling/Overall/Morale), "Go to Auction" CTA |
| 4 | Cards / Collection | `audit-screenshots/04-cards.png` | Filter tabs (All/Batters/Bowlers/All-Round/Keepers), pack shop (Standard 500C, Premium 15G) |
| 5 | League Table | `audit-screenshots/05-league.png` | 8-team table with position badges, form dots (W/L), record, points. Player row highlighted gold |
| 6 | Transfer Market | `audit-screenshots/06-market.png` | Buy/Sell tabs, player listings with OVR badge, stats, price, BUY action buttons |
| 7 | Customise / Settings | `audit-screenshots/07-customise.png` | Team name, manager name inputs, color picker swatches, player nicknames, reset button |

> **Match/Live gameplay and Pack Opening** could not be captured in empty state — they require an active squad and running match. A populated save state would be needed to screenshot those screens.

---

## 2. DESIGN TOKENS

### 2.1 Color Palette (CSS Custom Properties on `:root`)

#### Background / Surface Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `#020408` | Deepest background, app base, loading screen |
| `--pitch` | `#060A16` | Screen gradient end, secondary bg |
| `--dugout` | `#0B1222` | Modal backgrounds, card backgrounds |
| `--pavilion` | `#141E34` | Lighter panel bg, card gradient start |
| `--sight` | `#1C2E4A` | Tertiary surface, some badges |
| `--black-money` | `#0C0A16` | Special dark surface |
| `--fixer` | `#162B48` | Blue-tinted dark surface |

#### Gold Spectrum (Primary Brand)
| Token | Value | Usage |
|-------|-------|-------|
| `--gold` | `#C49A15` | Primary gold, gradients |
| `--gold-bright` | `#FFD23F` | Primary accent, headings, CTAs, highlights |
| `--gold-dim` | `rgba(255,210,63,0.08)` | Subtle gold backgrounds |
| `--gold-glow` | `rgba(255,210,63,0.15)` | Gold glow effects |

#### Crimson / Blood Spectrum (Danger / Corruption)
| Token | Value | Usage |
|-------|-------|-------|
| `--crimson` | `#7A0F22` | Deep red, gradient anchors |
| `--blood` | `#EF2D2D` | Error, danger, loss, corruption |
| `--blood-dim` | `rgba(239,45,45,0.08)` | Subtle red bg |
| `--blood-glow` | `rgba(239,45,45,0.15)` | Red glow |

#### Accent Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--amber` | `#F59E0B` | Warnings, heat meter, investigation |
| `--green` | `#059669` | Success base |
| `--green-bright` | `#34D399` | Win, positive, match, batting |
| `--blue` | `#3B82F6` | Info, bowling, some badges |
| `--blue-bright` | `#60A5FA` | Light blue accent |
| `--purple` | `#A78BFA` | Cards screen, DRS button |
| `--purple-bright` | `#C4B5FD` | Light purple |
| `--cyan` | `#22D3EE` | Impact player, dew weather |

#### Text / Neutral Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--white` | `#F2ECE0` | Primary text (warm off-white) |
| `--white-60` | `rgba(242,236,224,0.6)` | Secondary text |
| `--white-40` | `rgba(242,236,224,0.4)` | Tertiary text |
| `--white-20` | `rgba(242,236,224,0.2)` | Placeholder text |
| `--white-10` | `rgba(242,236,224,0.1)` | Very faint text |
| `--white-06` | `rgba(242,236,224,0.06)` | Near-invisible |
| `--white-03` | `rgba(242,236,224,0.03)` | Ultra-subtle |
| `--slip` | `#94A3B8` | Muted text (labels, secondary info) |
| `--disabled` | `#475569` | Disabled state icons/text |

#### Border / Glass Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `rgba(148,163,184,0.10)` | Default borders |
| `--border-strong` | `rgba(148,163,184,0.20)` | Emphasized borders |
| `--border-glow` | `rgba(148,163,184,0.06)` | Subtle border glow |
| `--glass-bg` | `linear-gradient(145deg, rgba(255,255,255,0.08)→0.015→0.04→0.06)` | Glass panel background |
| `--glass-border` | `1px solid rgba(255,255,255,0.10)` | Glass panel border |
| `--glass-shadow` | Multi-layer: `0 4px 20px`, `0 12px 48px`, inset highlights | Glass elevation |

### 2.2 Typography

| Token / Property | Value | Usage |
|------------------|-------|-------|
| `--font-d` (Display) | `'Teko', sans-serif` | Headings, numbers, buttons, scores, labels |
| `--font-b` (Body) | `'Rajdhani', sans-serif` | Body text, descriptions, UI text |
| Base font-size | `14px` | Global default |
| Font weights used | `400, 500, 600, 700` | Both font families |

#### Font Sizes in Use
| Size | Where |
|------|-------|
| `9px` | Micro labels (stat-label, role-badge, tactic labels) |
| `10px` | Small labels (currency labels, meter labels, nav labels, badges, custom labels) |
| `11px` | Extra-small text utility, sub-info, stats |
| `12px` | Small text utility, description text, stat bars, moment text |
| `13px` | Body text, toast, flavor text, badge text, bid info |
| `14px` | Base font, form inputs, timer label, season badge |
| `15px` | Larger labels, back button, player names (mini), market items |
| `16px` | Button base, match scoreboard team name, stat values (team-stat), prices |
| `17px` | Section title small, shop item name, market OVR |
| `18px` | Button large, stat values (card), OVR badge (mini) |
| `20px` | Player card name, avatar letter, stat value (phase score) |
| `22px` | Section title, card OVR badge, pitch type, customise title, squad select title |
| `24px` | Error heading, tutorial title, team stat value |
| `26px` | Timer seconds |
| `28px` | Manager name heading |
| `36px` | Season end title |
| `42px` | Auction purse display |
| `48px` | Current bid amount |
| `52px` | Match result text (WIN/LOSS) |
| `60px` | Match score (runs/wickets) |
| `68px` | Loading logo title |

### 2.3 Spacing / Padding Values

| Value | Usage Context |
|-------|---------------|
| `2px-4px` | Micro padding (badges, stat items, mini labels) |
| `5px-6px` | Small gaps, currency padding, inner card padding |
| `8px` | Compact padding, gap between grid items |
| `10px` | Quick tile gap, strategy option gap, market tab padding |
| `12px` | Standard inner padding, card body, margin-bottom small panels |
| `14px` | Glass panel padding, section gap |
| `16px` | Screen horizontal padding, standard margin-bottom, modal padding |
| `18px` | Section title margin-bottom, overlays |
| `20px` | Modal padding, custom content padding |
| `24px` | Error/overlay padding, hub header margin-bottom, tutorial card padding |
| `28px` | Tutorial card inner padding |
| `32px` | Result header margin |
| `40px` | Market empty state padding |
| `48px` | Result text padding-top |
| `60px-80px` | Empty state vertical padding |

### 2.4 Elevation / Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--elevation-1` | `0 2px 6px + 0 4px 12px` | Subtle depth (mini cards, quick tiles) |
| `--elevation-2` | `0 4px 16px + 0 8px 32px + 0 2px 6px` | Standard depth (glass panels, cards) |
| `--elevation-3` | `0 8px 28px + 0 16px 56px + 0 4px 10px` | High depth (action tiles, player cards) |
| `--elevation-4` | `0 12px 40px + 0 24px 72px + 0 6px 14px` | Maximum depth (modals) |
| `--glow-gold` | `0 0 20px gold + 0 0 40px gold` | Gold accent glow |
| `--glow-red` | `0 0 20px red + 0 0 40px red` | Red accent glow |
| `--glow-green` | `0 0 20px green + 0 0 40px green` | Green accent glow |
| `--glow-blue` | `0 0 20px blue + 0 0 40px blue` | Blue accent glow |

### 2.5 Angular Design Tokens (Clip-paths)

| Token | Value | Usage |
|-------|-------|-------|
| `--clip-btn` | Hexagonal polygon (6px cuts) | Primary buttons |
| `--clip-btn-sm` | Hexagonal polygon (4px cuts) | Small buttons, badges |
| `--clip-card-tl` | Top-left 12px corner cut | Card variant |
| `--clip-card-tr` | Top-right 12px corner cut | Player cards |
| `--clip-diamond` | Diamond/rhombus | Decorative |
| `--clip-hex` | Regular hexagon | OVR badges |

### 2.6 Animation / Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | General spring motion |
| `--spring-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot spring (buttons, screen transitions) |
| `--spring-snap` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Snap-back spring |
| `--spring-soft` | `cubic-bezier(0.25, 0.8, 0.25, 1)` | Gentle spring |
| `--ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` | Stat bar fills |
| `--ease-dramatic` | `cubic-bezier(0.7, 0, 0.3, 1)` | Dramatic transitions |

#### Named Keyframe Animations (24 total)
`fadeUp`, `fadeSlideUp`, `ballFloat`, `holoSheen`, `shimmer`, `legendaryPulse`, `mafiaGlow`, `spotlightPulse`, `premiumGlow`, `resultGlow`, `pulse`, `timerPulse`, `stagger1`, `cardFlip`, `digitRoll`, `textReveal`, `packBurst`, `loadBgShift`, `logoShimmer`, `purseShimmer`, `hubMesh`, `auctionMesh`, `prematchMesh`, `matchMesh`, `squadMesh`, `cardsMesh`, `leagueMesh`, `statusPulse`, `dangerPulse`, `boostPulse`, `heatPulse`, `goldShimmer`, `corruptPulse`, `pullSpin`

---

## 3. COMPONENT INVENTORY

All components defined in `prototype/index.html`. Line references below.

### Layout Shell
| Component | CSS Lines | JS Lines | Description |
|-----------|-----------|----------|-------------|
| `#app` | 135-136 | — | Fixed-position app shell, flex column |
| `#top-bar` | 178-187 | — | Top currency bar with glass backdrop blur |
| `#bottom-nav` | 192-199 | 6511-6513 | 5-tab bottom nav with animated indicator |
| `#nav-indicator` | 194 | 6499 | Animated underline that slides between nav items |
| `#screens` / `.screen` | 205-212 | Multiple | Screen container with transition-based routing |
| `#loading` | 144-164 | 6485-6505 | Cinematic loading screen with cricket ball animation |
| `#error-display` | 169-173 | 6906-6918 | Error fallback overlay |

### Reusable Components
| Component | CSS Lines | Description |
|-----------|-----------|-------------|
| `.glass` | 319-325 | Frosted glass panel (multi-layer gradient + backdrop-filter + inner glow). Variants: `.accent-gold`, `.accent-red`, `.accent-green`, `.accent-blue` |
| `.btn` | 340-357 | Chamfered button with clip-path hex shape, shine overlay, press animation. Variants: `.btn-gold`, `.btn-red`, `.btn-green`, `.btn-outline`, `.btn.full`, `.btn.lg` |
| `.player-card` | 394-431 | Holographic trading card with rarity strip, portrait area, OVR hex badge, stats grid, loyalty/greed bars, tilt-activated foil effect. Variants: `.epic`, `.legendary`, `.tilt-active` |
| `.player-card-mini` | 434-444 | Compact horizontal player card row with OVR badge, name, role, stats |
| `.stat-bar` | 362-370 | Progress bar with gradient fill + glow tip. Variants: `.fill.green`, `.fill.gold`, `.fill.red`, `.fill.amber`, `.fill.blue` |
| `.badge` | 373-379 | Rarity badge pill. Variants: `.rarity-common`, `.rarity-uncommon`, `.rarity-rare`, `.rarity-epic`, `.rarity-legendary` (animated pulse) |
| `.avatar` | 385-389 | Circular avatar with gradient + glow ring. Variants: `.gold`, `.crimson`, `.green`, `.blue` |
| `.currency` | 180-186 | Currency chip in top bar. Variants: `.coins`, `.gems`, `.bmoney` |
| `.section-title` | 327-329 | Uppercase display font heading with accent line. Variant: `.sm` |
| `.back-btn` | 331-333 | Back navigation button with clip-path |
| `.divider` | 335 | Horizontal gradient divider line |
| `.toast` | 921-925 | Top-center notification toast. Variants: `.success`, `.error`, `.info` |
| `.overlay` / `.modal` | 903-909 | Bottom-sheet modal with drag-to-dismiss, spring animation |
| `.modal-handle` | 907 | Drag handle bar for modals |

### Screen-Specific Components
| Component | CSS Lines | Screen |
|-----------|-----------|--------|
| `.hub-header` / `.manager-avatar` | 449-460 | Hub — Manager profile with alignment-responsive border |
| `.action-tiles` / `.action-tile` | 462-482 | Hub — Large 2-column action tiles (Auction, Match) |
| `.quick-tiles` / `.quick-tile` | 484-491 | Hub — 4-column quick nav grid |
| `.mafia-banner` | 493-498 | Hub — Mafia deal banner with crimson glow |
| `.hub-meters` / `.hub-meter` | 456-460 | Hub — Alignment/Heat/Fans progress meters |
| `.facility-cards` / `.facility-card` | 937-960 | Hub — 3-column facility upgrade cards (Pep Talk, Scout, Bribe) |
| `.auction-header` / `.purse` | 503-507 | Auction — Purse display with shimmer gradient text |
| `.auction-card-spotlight` | 509-511 | Auction — Spotlight area for the player card up for bid |
| `.bid-area` / `.bid-timer-circle` | 513-528 | Auction — Circular SVG countdown timer + bid amount |
| `.bid-actions` | 530 | Auction — 2-column bid/pass buttons |
| `.bid-log` | 532-535 | Auction — Scrollable bid history |
| `.prematch-vs` / `.prematch-team` | 549-554 | Pre-match — Team vs team display |
| `.pitch-info` | 556-559 | Pre-match — Pitch type indicator |
| `.strategy-options` / `.strategy-opt` | 562-565 | Pre-match — Strategy selector (Aggressive/Balanced/Defensive) |
| `.match-scoreboard` / `.score` | 574-713 | Match — Live score with digit-roll animation |
| `.match-phases` / `.match-phase` | 715-726 | Match — Powerplay/middle/death phase indicators |
| `.momentum-bar` | 728-735 | Match — Dual-direction momentum indicator |
| `.match-moments` / `.match-moment` | 737-750 | Match — Ball-by-ball commentary feed |
| `.batter-bowler-strip` | 751-758 | Match — Current batter/bowler display |
| `.match-tactics` / `.tactic-btn` | 759-767 | Match — In-game tactic buttons + boost button |
| `.weather-banner` | 787-790 | Match — Weather condition banner (rain/overcast/dew) |
| `.match-result-overlay` | 825-839 | Match — Full-screen result overlay (WIN/LOSS) |
| `.squad-header` / `.team-stats-row` | 844-851 | Squad — Header with count + 4-stat grid |
| `.card-filters` / `.card-filter` | 856-858 | Cards — Horizontal filter tabs |
| `.cards-grid` | 859 | Cards — 2-column card collection grid |
| `.shop-item` | 861-868 | Cards — Pack shop item rows |
| `.league-row` | 881-898 | League — Team row with position, form dots, record, points. Variants: `.you`, `.relegation`, `.promotion` |
| `.market-overlay` / `.market-tabs` | 662-683 | Market — Full-screen overlay with Buy/Sell tabs |
| `.market-item` | 668-681 | Market — Player listing with OVR, stats, price, action |
| `.squad-select-overlay` | 597-629 | Squad Selection — Full-screen player selection for matches |
| `.custom-overlay` | 637-657 | Customisation — Team name, manager name, color picker, nicknames |
| `.tut-overlay` / `.tut-card` | 688-704 | Tutorial — Onboarding step cards with step dots |
| `.scorecard-overlay` / `.sc-table` | 580-591 | Match — Full scorecard overlay with innings breakdown |
| `.tribunal-overlay` | 983-986 | Tribunal — Anti-corruption hearing full-screen |
| `.season-overlay` | 998-1000 | Season End — Results/promotion screen |

### Alignment Theming System (5 zones)
| Class | CSS Line | Theme |
|-------|----------|-------|
| `.align-spotless` | 122-123 | Golden glow, gold borders, shimmer on glass |
| `.align-clean` | 124 | Default gold, subtle |
| `.align-grey` | 125 | Amber tint, neutral |
| `.align-corrupt` | 126-127 | Red tint, red borders, vignette |
| `.align-deep` | 128-129 | Intense red, heavy vignette, smoke particles |

---

## 4. TECH STACK FOR STYLING

| Aspect | Status |
|--------|--------|
| **CSS approach** | Raw CSS in a single `<style>` block (~1035 lines). No external stylesheets. |
| **CSS variables** | Yes — extensive. ~80+ custom properties on `:root` covering colors, typography, spacing, glass, elevation, clip-paths, animations. |
| **Preprocessor** | None (no Sass, PostCSS, Tailwind). Raw CSS only. |
| **Build step** | None. Single HTML file served directly. |
| **CSS Reset** | Minimal custom reset (`*{margin:0;padding:0;box-sizing:border-box}`) |
| **Utility classes** | ~30 hand-rolled utilities (`.flex`, `.gap-8`, `.text-gold`, `.mt-8`, etc.) at lines 1010-1014 |
| **Fonts** | Google Fonts — Teko (display) + Rajdhani (body), loaded via `<link>` |
| **Animation library** | None (no GSAP, Framer Motion). All animations are CSS `@keyframes` (~34 named animations) + CSS `transition` with custom spring cubic-beziers |
| **JS animation** | Canvas-based particle system (`#particle-canvas`), parallax via `requestAnimationFrame`, digit-roll score animation via DOM class toggling |
| **Houdini** | `@property` declarations for animatable CSS custom properties (mesh gradient positions) — progressive enhancement |
| **Responsive** | Mobile-only fixed layout (no media queries, designed for 390px width). `env(safe-area-inset-bottom)` for notch devices |
| **PWA** | `<meta>` tags for theme-color, apple-mobile-web-app-capable. No service worker detected in single-file |

---

## 5. KNOWN ISSUES & OBSERVATIONS

### 5.1 "Something went wrong" Error
**Status:** NOT reproducible in current build. The error overlay (`#error-display`) exists at line 1288 but did NOT trigger during screenshot capture. The error mechanism:
- `window.onerror` handler at line 1881 catches runtime errors and shows the overlay with the error message + line number
- `try/catch` around `init()` at line 6906 catches initialization failures
- If this error appears on GitHub Pages but not locally, likely causes:
  - **Font loading failure** — Google Fonts blocked or slow → JS executes before fonts load (shouldn't cause error though)
  - **localStorage quota** — save data exceeds quota on some browsers
  - **Stale cached version** — browser serving old cached version with a bug

### 5.2 Visual Issues Observed in Screenshots
1. **Transfer Market** (06-market.png): Top bar is invisible/missing — the market overlay covers it, and the overlay's own back button sits very high with awkward spacing
2. **Customise** (07-customise.png): Same issue — overlay covers top bar, back button and section title float at the very top
3. **Hub screen**: The "50" reputation/season badge in the top-right of the manager area looks disconnected from the layout — it's a raw number without clear context
4. **Empty states**: Auction and Squad show minimal empty states — just text + CTA. Could benefit from richer illustrations
5. **League Table**: The "Season Stats & Leaderboard" subtitle sits inside a glass panel but the form/record columns show "0W 0L" for all teams — this is expected for a new game but the "0W 0L" formatting is tight

### 5.3 Architecture Notes for Design Session
- **Single file** means any design changes require editing one 431KB file
- **No component framework** — everything is vanilla DOM manipulation
- **Alignment theming** is a sophisticated system — CSS classes on `#app` cascade theme changes to all components. Any redesign must preserve this system
- **Angular design language** (clip-paths, sharp corners) is a core brand constraint — do not round corners
- **Glass morphism** is the primary surface treatment — all panels use backdrop-filter blur

---

## Summary for Design Feedback Session

**Strengths:**
- Cohesive dark theme with well-defined token system
- Sophisticated glass morphism + elevation hierarchy
- Angular clip-path design language is distinctive
- Alignment theming system (spotless → deep corrupt) adds dynamic visual storytelling
- 34+ CSS animations create premium feel (holographic cards, digit rolls, mesh gradients)

**Areas for Design Attention:**
- Empty states need richer visual treatment
- Overlay screens (Market, Customise) lose the top bar context
- Some number displays lack labeling (the "50" on hub)
- Match screen could not be audited — needs populated state
- No media queries — rigid 390px layout, may break on larger/smaller screens
- Utility class system is minimal — could be expanded for consistency
