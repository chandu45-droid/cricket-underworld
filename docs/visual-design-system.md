# Visual Design System — Cricket Underworld
## The Look, Feel, and Identity

**Version:** 2.0 — v2 depth-recipe port (Phases 1–5 shipped 2026-07-10)
**Status:** Live in `prototype/index.html`. This doc is the single source of truth for token values.

> **Theme model:** the game ships **two themes**. **Light is the enforced default**
> (test #124); **premium dark-noir** sits behind a Settings toggle that persists across
> reloads (test #125). Tokens below list **dark → light** pairs. Values are the real
> shipped `:root` / `html[data-theme="light"]` blocks (`prototype/index.html` ~lines 34–205),
> not aspirational. A third, scoped block (~line 1988) re-darkens intentional "dark islands"
> (mafia overlay, shop heroes, corruption report) inside light theme so their light-on-dark
> text stays legible — that is an override, **not** the canonical palette.

---

## 1. Visual Identity

### 1.1 The Two Worlds

This game lives at the intersection of two visual worlds:

| World | Feel | References |
|-------|------|------------|
| **The Stadium** | Floodlights, scoreboard glow, crisp whites, packed stands, broadcast overlays | Star Sports broadcast, IPL graphics, stadium LED boards |
| **The Underworld** | Smoke-filled rooms, dim amber lighting, weathered paper, whispered deals, old money | Gangs of Wasseypur color grading, vintage betting slips, 70s Bombay noir |

The UI blends both — **broadcast-clean data presentation** layered over **noir atmosphere**. Stats feel like a TV scoreboard. Menus feel like a private club.

### 1.2 Design Pillars

1. **Gritty, not glossy.** No flat material design. Surfaces have texture — leather grain, paper fiber, concrete dust. Nothing feels "clean" even when the data is sharp.
2. **Angular, not rounded.** Corners are clipped (chamfered 45°), not pill-shaped. Buttons are trapezoids, not oblongs. Cards have sharp edges. This isn't a friendly app — it's a power game.
3. **Layered depth.** UI elements sit on distinct depth planes — background atmosphere → surface panels → floating cards → overlay notifications. Subtle shadows and parallax.
4. **Information density.** This is a strategy game. Respect the player's intelligence. Show numbers, show stats, show the matrix. Don't hide complexity behind cute icons.
5. **Two-tone drama.** Every screen has a dominant warm tone (gold/amber for clean, crimson/blood for corrupt) modulated by the player's current alignment. The UI itself shifts as you play.

---

## 2. Color System

### 2.1 Core Palette

Every surface/text/border token is **theme-aware**. Format below: `--token` — **dark** / **light**.
The v2 port's headline fix was **lifting the surfaces off pure black** so panels visibly
separate from the base (old base was `#020408`; panels barely lifted). These are the real values.

```
SURFACES (dark → light)              TOKEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Void            #080B11 → #F4EFE6    --void      Deepest layer — behind everything
Pitch (base)    #0D1117 → #EDE7DA    --pitch     Primary background — the screen floor
Dugout (panel)  #161B26 → #E3DBCB    --dugout    Surface panels — visibly lifts off base
Pavilion        #1E2536 → #D6CCB8    --pavilion  Elevated surface — active/hover states
Sight Screen    #2A3247 → #C7BBA3    --sight     Highest surface — tooltips, dropdowns
Panel-lo        #10141D              --panel-lo  Dark gradient stop for solid panels

ACCENT — ALIGNMENT-DRIVEN (dark → light)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Antique Gold    #B8862F → #9A7A08    --gold        Clean path — sponsors, legacy, prestige
Burnished Gold  #DAA520 → #B08D0A    --gold-bright Clean highlight — burnished, NOT lemon
Crimson Deep    #8B0000             --crimson     Corrupt path — mafia, danger, debt
Blood Red       #CC1100 → #C81E2E    --blood       Corrupt highlight — warnings, heat
Amber Warning   #CF6A00             --amber       Heat system — investigations, pressure

FUNCTIONAL (dark → light)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pitch Green     #2FBE6E             --green       Clean wins, positive stat bars
Wicket White    #E8E0D4 → #1A2333    --white       Primary text — warm off-white / dark ink
Slip Cordon     #7A8299 → #57687C    --slip        Secondary text — most-used (muted steel)
Border          rgba(122,130,153,.16) → rgba(26,35,51,.14)   --border         Dividers, inactive
Border-strong   rgba(122,130,153,.30) → rgba(26,35,51,.26)   --border-strong  Emphasized dividers

SPECIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fixer Blue      #2268D1     Rare staff cards, intel
Purple          #5B4A8A     Epic tier accent
Legendary Holo  #D4AF6A → #CC1100 → #2FBE6E    Gradient for legendary card shimmer
```

### 2.2 Alignment-Responsive UI

The UI color temperature shifts based on the player's alignment zone:

| Zone | Dominant Accent | Background Tint | Border Glow |
|------|----------------|-----------------|-------------|
| Spotless (+71 to +100) | Burnished Gold | Warm gold undertone on panels | Soft gold outer glow |
| Clean (+31 to +70) | Antique Gold | Neutral | None |
| Grey (-30 to +30) | Mixed — gold left, crimson right | Neutral with slight amber | None |
| Corrupt (-31 to -70) | Crimson Deep | Red-shifted panel backgrounds | Faint red vignette on screen edges |
| Deep Corrupt (-71 to -100) | Blood Red | Heavy red tint, darker panels | Pulsing red vignette, smoke particle overlay |

This means the game literally looks different based on how you play. A clean player's UI feels warm and prestigious. A corrupt player's UI feels like it's closing in on them.

### 2.3 Texture Layer

Every background surface has a subtle texture overlay (5-8% opacity):

| Surface | Texture |
|---------|---------|
| Void / Pitch | **Concrete grain** — fine noise, like a stadium wall |
| Dugout / Pavilion | **Leather grain** — subtle cross-hatch, like a club chair |
| Cards | **Linen press** — directional fiber, like a premium playing card |
| Mafia panels | **Cigarette smoke** — animated wispy particles, very subtle |
| Investigation panels | **Newsprint dot** — halftone pattern, like a newspaper expose |

Implementation: CSS `background-image` with tiling SVG patterns at low opacity, or canvas noise generation.

### 2.4 v2 Depth-Recipe Tokens (shipped 2026-07-10, Phases 1–5)

The premium "console-grade" feel comes from six techniques, each backed by a token. These replaced
the old flat-black + glassmorphism look. **All values are the real shipped `:root` block.**

**Solid gradient panels (replaces glassmorphism).** Content panels use a solid two-stop gradient +
baked bevel, not translucent blur. `backdrop-filter` is now reserved for true overlays (toasts/modals).
```
--panel-grad : linear-gradient(160deg,#1E2536,#10141D)                 /* default solid panel      */
--glass-bg   : linear-gradient(160deg,#232B40,#141926)   [dark]        /* theme-aware panel surface */
             : linear-gradient(160deg,#FFFFFF,#F4EEE2)    [light]
--glass-shadow : 0 4px 16px rgba(0,0,0,.45), 0 10px 34px rgba(0,0,0,.28),
                 inset 0 1px 0 rgba(232,224,212,.12), inset 0 -1px 0 rgba(0,0,0,.28)   [dark]
               /* light flips the insets to white-highlight + dark-hairline */
--glass-border : 1px solid rgba(232,224,212,.08) [dark] / rgba(26,35,51,.10) [light]
```
> **Panel token rule:** panels bind to `--glass-bg` / `--glass-shadow` / `--glass-border` (all
> theme-aware). `--panel-grad` is the dark-only default gradient; do **not** paint theme-switching
> panels straight onto it. Where a chamfered (`clip-path`) tile needs an edge, use the
> `--glass-shadow` insets as the border — a real CSS `border` clips off at the chamfer corners.

**Bevel-as-border (asymmetric top-lit edge).** A lit top edge over darker sides = cheap tactility.
```
--bevel-top  : inset 0 1px 0 rgba(232,224,212,0.12)     /* panel top highlight     */
--border-lit : rgba(232,224,212,0.14)                   /* lit top edge of a bevel */
```

**Red hero CTA (single highest-impact change).** The primary action on every screen is the red button
(`.btn-hero`): PLAY MATCH, PLACE BID, START AUCTION, GO TO AUCTION, confirm.
```
--cta-red        : linear-gradient(160deg,#E43A1F,#8B0000)
--cta-red-shadow : inset 0 1.5px 0 rgba(255,255,255,.35), 0 8px 18px rgba(204,17,0,.4)
```

**Burnished-gold badge + restrained glows (on state, not everywhere).**
```
--gold-grad  : linear-gradient(160deg,#D4AF6A,#8C6B32)                 /* gold fills            */
--gold-badge : radial-gradient(circle at 35% 30%,#FFE9A8,#C9A44C 70%)  /* OVR/tier badge        */
--gold-ink   : #241A08                                                 /* text on gold          */
--glow-gold  : 0 0 16px rgba(218,165,32,.45), 0 0 4px rgba(218,165,32,.6)   [dark, softer in light]
```

**Strengthened vignette.** Edges fall into shadow so the per-screen spotlight center pops.
```
--vignette-strong : inset 0 0 90px 20px rgba(7,12,13,0.65)
```

**Chamfer geometry — the v2 signature two-opposite-corner cut (top-left + bottom-right).**
```
--clip-14 : polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)
--clip-10 : polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)
--clip-6  : polygon(6px  0, 100% 0, 100% calc(100% -  6px), calc(100% -  6px) 100%, 0 100%, 0  6px)
```
`--clip-14` = large panels/cards, `--clip-10` = buttons, `--clip-6` = chips/small tiles.
Legacy `--clip-hex` / `--clip-diamond` stay for special badges.

**Per-screen radial grading (depth technique #1).** Each screen backdrop is a radial spotlight, not
flat black: most screens cool (`circle at 50% 0%, #1A2130 → #0D1117`), auction red-tense
(`circle at 50% 15%, #241318 → #0D1117`), match/prematch green-tinted, corrupt-alignment red-tinted.

**Empty-states (the "void" killer).** Every empty screen (no cards, market closed/empty, no players
to sell) renders a *designed* state: chamfered `--glass-bg` icon tile (`--clip-14`, monoline SVG in
`--slip`) + Teko title + one-line prompt + a red `.btn-hero` CTA where an action exists. A brand-new
save now has **zero dead-black screens**. (League never empties — always renders team + rivals.)

---

## 3. Typography

### 3.1 Font Stack

**NO system-ui. NO sans-serif fallbacks as primary.** Every text element has a deliberate typeface.

| Role | Font | Weight | Why This Font |
|------|------|--------|---------------|
| **Display / Titles** | **Teko** (Google Fonts) | 600, 700 | Condensed, vertical emphasis, sports-industrial DNA. Designed in India. Feels like a stadium scoreboard crossed with a wanted poster. |
| **UI / Body** | **Rajdhani** (Google Fonts) | 400, 500, 600 | Indian-designed geometric sans. Sharp terminals, not bubbly. Reads clean at small sizes but has character — the angles whisper "this isn't a regular app." |
| **Numbers / Stats / Currency** | **Rajdhani** (tabular figures) | 600, 700 | Rajdhani has clean tabular figures that work for stats. Same font family as body = faster load, consistent feel. Use 700 weight for scores, 600 for tables. |
| **Dramatic / Mafia / Quotes** | **Teko** (condensed, all-caps) | 700 | Teko at max weight with +2px letter-spacing creates gravitas without a fourth font. Used for tribunal verdicts, mafia messages, and season titles. |
| **Micro / Labels / Tags** | **Rajdhani** | 500 | Same as body but smaller (10-11px) with letter-spacing +0.5px for legibility. Tags, badges, countdown timers. |

**[v2 CHANGE]:** Cut from 4 fonts to **2 fonts** (Teko + Rajdhani). Saves ~100-150KB, critical for slow Indian connections (tier-2/3 cities on 2G/slow 4G). Space Grotesk and Cinzel dropped — Rajdhani's tabular figures handle numbers, and Teko bold handles dramatic moments.

**[L3 DECISION 2026-07-11 — two-tier numeric system, ratified]:** the specced-but-absent Space Grotesk + Cinzel were **dropped for good** (not re-added). Numbers split into two tiers by intent, both inside the 2-font system:
- **Hero / dramatic numbers → Teko** (`--font-d`, `tabular-nums`): `.money` currency heroes, match scores, big auction bids. Condensed poster face at large size = broadcast-scoreboard power (this is the deliberate L1 `.money` choice, not drift).
- **Dense data numbers → Rajdhani** (`--font-b`, `tabular-nums`): stat-grid values in cards/tables (`.player-card .stat-val`, `.pd-stat-row .stat-val`). Squarer engineered figures read clean at 18px in small tiles, where Teko condensed read cheap (the defect `CRICKET-REVIEW-2026-07-09` #5 flagged — now fixed with an already-loaded font, zero network cost).

### 3.2 Type Scale

```
DISPLAY HIERARCHY (Teko)
━━━━━━━━━━━━━━━━━━━━━━━
Display 1:   48px / 700 / -0.5px tracking    → Screen titles ("AUCTION", "MATCH DAY")
Display 2:   36px / 700 / -0.3px tracking    → Section headers ("YOUR SQUAD", "LEAGUE TABLE")
Display 3:   28px / 600 / 0px tracking       → Card names, rival names

BODY HIERARCHY (Rajdhani)
━━━━━━━━━━━━━━━━━━━━━━━
Body 1:     16px / 500 / 0px tracking        → Primary body text, descriptions
Body 2:     14px / 400 / 0px tracking        → Secondary text, flavor text
Caption:    12px / 500 / +0.3px tracking     → Labels, timestamps, metadata
Micro:      10px / 500 / +0.5px tracking     → Badges, tiny tags, countdown

NUMBERS (Rajdhani, tabular figures — font-feature-settings:"tnum")
━━━━━━━━━━━━━━━━━━━━━━━
Score Big:  56px / 700 / -1px tracking       → Match score display
Score Med:  32px / 700 / 0px tracking        → Currency totals, stat headers
Stat:       18px / 600 / +0.5px tracking     → Stat values in tables/cards
Stat Small: 14px / 600 / +0.3px tracking     → Inline numbers, small counters

DRAMATIC (Teko, condensed all-caps)
━━━━━━━━━━━━━━━━━━━━━━━
Verdict:    28px / 700 / +2px tracking       → Tribunal verdicts ("GUILTY", "CLEARED")
Quote:      16px / 600 / +1px  tracking       → Mafia messages, flavor quotes
Season:     20px / 700 / +1px tracking       → Season titles ("SEASON III")
```
> **[v2 CHANGE]:** the two blocks above formerly used Space Grotesk (numbers) and Cinzel
> (dramatic). Both fonts were cut in the 4→2 consolidation (§3.1). Numbers now render in
> **Rajdhani tabular figures** (700 for scores, 600 for stats); dramatic copy renders in
> **Teko** at max weight with wider tracking. No third or fourth family ships.

### 3.3 Font Loading Strategy

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@600;700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Total font payload: ~80-100KB** (well within the 500KB page budget). Fallback stack (while loading): `'Segoe UI', 'Roboto', system-ui` — but these should NEVER be the final render. Use `font-display: swap` to ensure custom fonts always load.

---

## 4. Component Design Language

> **Font annotations in the wireframes below (§4–§7) predate the 4→2 font cut.** Read every
> **"Space Grotesk"** annotation as **Rajdhani tabular figures** and every **"Cinzel"** annotation
> as **Teko** (see §3.1/§3.2). The wireframes are illustrative layout sketches; §2–§3 are the
> authoritative token/font values.

### 4.1 Buttons

**Primary (Chamfered Trapezoid)**
```
    ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲
   │    PLACE BID       │
    ╲__________________╱

- Background: gradient from accent to 20% darker
- Clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)
  OR simpler: polygon(4px 0, calc(100% - 4px) 0, 100% 100%, 0 100%)
- Text: Teko 600, 16px, uppercase, +1px tracking
- Active state: inner shadow, slight scale(0.97)
- Glow: 0 0 12px accent-color at 30% opacity
```

**Secondary (Bordered, no fill)**
```
   ┌──────────────────┐
   │    VIEW STATS     │
   └──────────────────┘

- Background: transparent
- Border: 1px solid Boundary Rope
- Text: Rajdhani 500, 14px
- Hover: border color shifts to accent, text brightens
```

**Danger (Mafia actions)**
```
    ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲
   │   ACCEPT FAVOR     │
    ╲__________________╱

- Same shape as primary but Crimson Deep gradient
- Subtle pulse animation (opacity 0.8 → 1.0, 2s cycle)
- Text: slightly larger, Teko 700
```

### 4.2 Cards (Player Cards)

```
┌─────────────────────────┐
│ ▓▓▓▓▓▓ RARITY STRIP ▓▓▓│  ← 4px colored top strip (rarity color)
│                         │
│      ┌───────────┐      │
│      │  PLAYER   │      │  ← Silhouette/abstract avatar area
│      │  VISUAL   │      │
│      └───────────┘      │
│                         │
│  THE WALL          ★★★  │  ← Name (Teko 600) + star rating
│  Top-Order Batter       │  ← Role (Rajdhani 400, Slip Cordon color)
│─────────────────────────│
│  BAT  BWL  FLD  FIT     │  ← Stat labels (Rajdhani micro)
│   87   12   65   78     │  ← Stat values (Space Grotesk 500)
│─────────────────────────│
│  LOY: ████████░░  82    │  ← Loyalty bar (green = high)
│  GRD: ███░░░░░░░  28    │  ← Greed bar (red = high)
│─────────────────────────│
│  FORM ▲ 72              │  ← Current form with trend arrow
└─────────────────────────┘

Card background: Dugout color with linen texture
Border: 1px Boundary Rope, rounded 3px (slight, not bubbly)
Shadow: 0 4px 16px rgba(0,0,0,0.4) — cards float
Rarity strip colors:
  Common:    #4A5568 (Stumps Grey)
  Uncommon:  #2D6A9F (Fixer Blue)
  Rare:      #0E6B3A (Pitch Green)
  Epic:      #B8860B (Antique Gold)
  Legendary: Animated gradient (Gold → Crimson → Green, slow rotation)
```

### 4.3 Panels / Containers

```
STANDARD PANEL
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SECTION TITLE          ┃  ← Teko 600, 20px, accent-colored top border (2px)
┠────────────────────────┨
┃                        ┃  ← Dugout background with leather texture
┃  Content here          ┃
┃                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛

- Top border: 2px solid, accent color (gold or crimson based on content)
- Background: Dugout (#161B26)
- No rounded corners — sharp or 2px max
- Inner padding: 16px

MAFIA PANEL (for favor offers, debt warnings)
╔════════════════════════════╗
║                            ║  ← Crimson Deep border (2px), slight red inner glow
║   Content here             ║  ← Background: Black Money (#1A1A2E)
║                            ║  ← Smoke particle overlay (animated, subtle)
╚════════════════════════════╝

INVESTIGATION PANEL
┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
┆                          ┆  ← Dashed border (Amber Warning color)
┆   Content here           ┆  ← Background: Pitch with newsprint texture
┆                          ┆
└┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
```

### 4.4 Data Tables (Stats, League, etc.)

```
┌──────────────────────────────────────────┐
│ POS  TEAM           W  L  PTS  ALIGNMENT │  ← Header: Rajdhani 500, uppercase
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  1   Your Team      6  2   18  ▓▓▓▓░░░░  │  ← Alignment shown as bar
│  2   The Shark      5  3   15  ░░░░▓▓▓▓  │  ← Corrupt rivals: red-tinted row
│  3   The Purist     5  3   15  ▓▓▓▓▓▓░░  │  ← Clean rivals: subtle gold tint
│  4   The Coward     4  4   12  ░░░▓▓░░░  │
│──────────────────────────────────────────│
│  ...relegation zone below this line...   │  ← Red dashed separator
│  8   The Politician 2  6    6  ░░▓▓▓░░░  │
│  9   Bottom Team    1  7    3  ░░░░░░░░  │
└──────────────────────────────────────────┘

- Alternating row backgrounds: Pitch / Dugout (subtle)
- Numbers: Space Grotesk
- Text: Rajdhani
- Hover row: Pavilion background + left accent border
```

### 4.5 Currency Display Bar

```
 ┌───────────────────────────────────────┐
 │  🪙 12,450    💎 47    💀 380         │
 └───────────────────────────────────────┘

Actually, NO EMOJI. Custom styled:

 ╱ C 12,450 ╱ G 47 ╱ B 380 ╱
   ↑gold      ↑blue   ↑dark red

- C (coins): Antique Gold circle with "C" stamped, like an old coin
- G (gems): Fixer Blue diamond shape
- B (black money): Crimson Deep, number pulses slightly if over 500 threshold
- Font: Space Grotesk 500, 14px
- Background: Void with 80% opacity overlay
- Position: fixed top bar, always visible in game screens
```

### 4.6 Heat Indicator

```
LOW HEAT (0-25):
  No visible indicator.

MEDIUM HEAT (26-50):
  ┌─ Manager portrait ─┐
  │                     │
  │   ┌─────────┐      │
  │   │ AVATAR  │      │  ← Faint amber border appears around portrait
  │   └─────────┘      │
  │                     │
  └─────────────────────┘

HIGH HEAT (51-75):
  Portrait gets a pulsing red border (1s cycle).
  "HEAT: 63" appears below in Amber Warning color.
  Screen edges get a very subtle red vignette.

CRITICAL HEAT (76-100):
  Portrait border is solid Blood Red, thick (3px).
  "⚠ HEAT: 89" in Blood Red, Teko 700.
  Screen edges: heavy red vignette, pulsing.
  Smoke particles increase density.
  Background music shifts (if audio implemented).
```

### 4.7 Iconography

**NO EMOJI anywhere in the game UI.** All icons are custom SVG, monoline style, 2px stroke weight.

| Icon Set | Style | Examples |
|----------|-------|---------|
| **Cricket** | Outlined, geometric | Bat (angled, not cartoon), ball (with seam line), stumps, helmet |
| **Currency** | Filled circles/shapes with embossed letter | Coin (circle + C), Gem (diamond + G), Black money (torn note + B) |
| **Mafia** | Slightly ornate, thicker stroke | Handshake (deal), chain link (debt), eye (surveillance), smoke (favor) |
| **Investigation** | Sharp, angular | Magnifying glass, file folder, gavel (tribunal), shield (defense) |
| **Navigation** | Minimal, 1.5px stroke | Home, squad, auction, league, profile |
| **Stats** | Geometric, data-viz style | Up arrow, down arrow, bar chart, trend line |

Icon color: Slip Cordon (#7A8299) default, accent color when active/important.

---

## 5. Animation & Motion

### 5.1 Principles

- **Quick, not bouncy.** No spring/elastic animations. Ease-out curves only. This is a serious game, not a toy.
- **Cinematic, not decorative.** Every animation serves a purpose — reveals information, confirms action, builds tension.
- **Corruption animations are slower.** Clean actions snap (150ms). Corrupt actions linger (400-600ms) — the weight of the choice.

### 5.2 Timing

| Action | Duration | Easing | Notes |
|--------|----------|--------|-------|
| Button press | 100ms | ease-out | Scale 0.97, inner shadow |
| Panel open/close | 200ms | ease-out | Slide up from bottom or fade |
| Card flip/reveal | 400ms | ease-in-out | 3D rotation on Y axis |
| Favor offer appear | 600ms | ease-out | Slides in from right with red smoke trail |
| Favor accept | 500ms | ease-out | Card crumples slightly, absorbed into screen |
| Score counter | Per digit, 80ms stagger | ease-out | Mechanical counter roll (like an old scoreboard) |
| Heat change | 300ms | linear | Bar fills/drains, color shifts |
| Investigation trigger | 800ms | ease-in | Screen darkens, newspaper-style overlay slides down |
| Tribunal verdict | 1200ms | custom | Cinzel text types out letter by letter, like a typewriter |
| Alignment shift | 400ms | ease-in-out | Meter slides, background color subtly transitions |
| Match simulation | 60-90s total | varied | Phase-by-phase reveals with dramatic pauses |

### 5.3 Corruption Visual Effects

| Effect | Trigger | Implementation |
|--------|---------|----------------|
| **Red vignette** | Heat > 50 | Radial gradient overlay, opacity scales with heat |
| **Smoke particles** | Alignment < -30 | Canvas particle system, 10-20 particles, very slow drift |
| **Screen grain** | During mafia interactions | Film grain noise shader, 3% opacity, animated |
| **Pulse** | Active debt deadline approaching | Border of debt card pulses (opacity 0.5 → 1.0) |
| **Glitch** | Fix failure | Brief (200ms) RGB split + horizontal displacement |
| **Gold shimmer** | Alignment > +50 | Subtle diagonal light sweep on panel borders, every 8s |

---

## 6. Screen Map & Layouts

### 6.1 Screen Architecture

```
SCREENS (total: 16)
━━━━━━━━━━━━━━━━━━━━

ENTRY
  ├── Splash / Loading
  └── Main Hub ← CENTRAL SCREEN (always return here)

FROM HUB
  ├── Auction ──→ Auction Lobby → Active Auction → Post-Auction Summary
  ├── Squad ──→ Squad Overview → Player Detail → Formation Setup
  ├── Match ──→ Pre-Match Strategy → Match Simulation → Post-Match Report
  ├── League ──→ League Table → Rival Profile
  ├── Deals ──→ Favor Board → Debt Ledger
  ├── Collection ──→ Card Gallery → Pack Opening
  ├── Shop ──→ Gem Store → Season Pass
  └── Profile ──→ Stats / History / Achievements / Settings
  
OVERLAY (appear over any screen)
  ├── Favor Offer (slides from right)
  ├── Investigation Alert (drops from top)
  ├── Tribunal (full screen takeover)
  └── Season End Summary (full screen)
```

### 6.2 Screen-by-Screen Specs

---

#### SCREEN 01: Splash / Loading

```
┌────────────────────────────────┐
│                                │
│         ░░░░░░░░░░░            │  ← Void background, concrete texture
│         ░░░░░░░░░░░            │
│                                │
│    C R I C K E T               │  ← Cinzel 700, 32px, letter-spacing 8px
│    UNDERWORLD                  │  ← Teko 700, 48px, Crimson Deep
│                                │
│    ─────── ◆ ───────           │  ← Diamond divider, Antique Gold
│                                │
│    ███████████░░░░░  68%       │  ← Loading bar, thin (2px), gold fill
│                                │
│    Rajdhani 400, 12px          │
│    "Loading the pitch..."      │  ← Flavor loading messages (rotate)
│                                │
└────────────────────────────────┘

Loading messages (cycle every 2s):
  "Loading the pitch..."
  "Preparing the auction room..."
  "The bookies are watching..."
  "Setting the field..."
  "Checking the wicket..."
```

---

#### SCREEN 02: Main Hub

The hub is the central nervous system. Everything is accessible from here.

```
┌────────────────────────────────┐
│ ╱ C 12,450 ╱ G 47 ╱ B 380 ╱   │  ← Currency bar (fixed top)
│────────────────────────────────│
│                                │
│  SEASON III          Day 7/14  │  ← Cinzel 700 / Space Grotesk
│  Silver League                 │  ← Rajdhani 500, Fixer Blue
│                                │
│  ┌──────────────────────────┐  │
│  │  MANAGER CARD            │  │
│  │  ┌────┐                  │  │
│  │  │ AV │  "Your Name"     │  │  ← Avatar + name
│  │  └────┘                  │  │
│  │  ALIGNMENT ▓▓▓▓▓░░░ +42 │  │  ← Alignment bar (gold side)
│  │  HEAT      ▓▓░░░░░░  18 │  │  ← Heat bar (green = low)
│  │  FANS      ▓▓▓▓▓▓░░  72 │  │  ← Fan loyalty bar
│  │  RECORD    6W 2L         │  │  ← Space Grotesk
│  └──────────────────────────┘  │
│                                │
│  ┌─────────┐  ┌─────────┐     │
│  │ AUCTION │  │  MATCH  │     │  ← Primary action tiles (large)
│  │  ◇      │  │  ◇      │     │  ← Custom SVG icons
│  │ Next: 2h│  │ vs Shark│     │  ← Contextual subtitle
│  └─────────┘  └─────────┘     │
│                                │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │SQUAD │ │LEAGUE│ │DEALS │   │  ← Secondary tiles (smaller)
│  └──────┘ └──────┘ └──────┘   │
│                                │
│  ┌──────────────────────────┐  │
│  │ ! MAFIA MESSAGE           │  │  ← If active favor offer, shows here
│  │ "I have information..."   │  │     Mafia panel style (dark, red border)
│  │           [VIEW OFFER →]  │  │
│  └──────────────────────────┘  │
│                                │
│  ╱ HUB ╱ CARDS ╱ SHOP ╱ ME ╱  │  ← Bottom nav bar
└────────────────────────────────┘

Action tiles:
  - Background: Dugout
  - Border-left: 3px accent (gold for Auction, green for Match)
  - Icon: centered, 24px, Slip Cordon color
  - Title: Teko 600, 20px
  - Subtitle: Rajdhani 400, 12px, Slip Cordon
  - Tap: Pavilion background, icon brightens to accent color

Bottom nav:
  - Background: Void
  - Icons: custom SVG, 20px
  - Active: accent color + label visible
  - Inactive: Stumps Grey, no label
  - Border-top: 1px Boundary Rope
```

---

#### SCREEN 03: Active Auction

```
┌────────────────────────────────┐
│ ╱ C 12,450 ╱ G 47 ╱ B 380 ╱   │  ← Currency bar
│ PURSE REMAINING: 1,240         │  ← Space Grotesk 700, Burnished Gold
│────────────────────────────────│
│  ROUND 2 — GENERAL POOL       │  ← Teko 600, 20px
│  Card 4 of 15                  │  ← Rajdhani 400
│────────────────────────────────│
│                                │
│  ┌────────────────────────┐    │
│  │                        │    │
│  │    [PLAYER CARD]       │    │  ← Full player card (see 4.2)
│  │    currently on the    │    │     Centered, slightly larger than normal
│  │    auction block       │    │     Spotlight effect: radial gradient behind
│  │                        │    │
│  └────────────────────────┘    │
│                                │
│  CURRENT BID: 180              │  ← Space Grotesk 700, 32px
│  by: The Shark                 │  ← Rajdhani 500, Crimson (if corrupt rival)
│                                │
│  ┌──────────────────┐          │
│  │  ████████░░ 5.2s │          │  ← Bid timer bar (drains left to right)
│  └──────────────────┘          │     Color shifts green → amber → red
│                                │
│  ┌─────────┐  ┌─────────┐     │
│  │  BID    │  │  PASS   │     │  ← Primary + Secondary buttons
│  │  200    │  │         │     │  ← Bid shows next increment
│  └─────────┘  └─────────┘     │
│                                │
│  ╔═══════════════════════╗     │  ← Mafia intel panel (if leak active)
│  ║ The Shark's purse:    ║     │     Mafia panel style
│  ║ 890 remaining         ║     │
│  ╚═══════════════════════╝     │
│                                │
│  BIDDING LOG:                  │  ← Scrollable log
│  You: 160 → Shark: 180        │  ← Rajdhani 400, 12px
│  Purist: 140 → You: 160       │
│  Base: 120                     │
└────────────────────────────────┘

Bid button behavior:
  - Shows next valid bid amount
  - Tap: value increments by bid step
  - Hold (500ms): opens manual bid entry (type custom amount)
  - Disabled (grey) when purse insufficient
  - Pulsing gold border when timer < 2s (urgency)

RTM notification:
  When RTM is triggered, a banner drops from top:
  "RIGHT TO MATCH — The Pragmatist matches 240 to retain this player"
  Banner: Burnished Gold background, Teko text, slides down 300ms
```

---

#### SCREEN 04: Squad Overview

```
┌────────────────────────────────┐
│ ← YOUR SQUAD          14/15   │  ← Back arrow + squad count
│────────────────────────────────│
│                                │
│  BATTING ORDER                 │  ← Teko 600
│  ┌──┬──┬──┬──┬──┬──┐          │
│  │1 │2 │3 │4 │5 │6 │          │  ← Draggable position slots
│  │AV│AV│AV│AV│AV│AV│          │     Small player avatars
│  │87│82│78│75│71│68│          │     Batting stat below
│  └──┴──┴──┴──┴──┴──┘          │
│                                │
│  PLAYING XI                    │
│  ┌────────────────────────┐    │
│  │ 1. The Wall    BAT 87  │    │  ← List view, each row tappable
│  │    ★★★  Form ▲72  L:82│    │     Loyalty shown as small bar
│  │────────────────────────│    │
│  │ 2. Quick Gun   BAT 82  │    │  ← Green left border = playing
│  │    ★★  Form ─65  L:45 │    │
│  │────────────────────────│    │
│  │ ...                    │    │
│  │────────────────────────│    │
│  │ 11. Death Over BWL 88  │    │
│  │    ★★★  Form ▲78  L:91│    │
│  └────────────────────────┘    │
│                                │
│  BENCH (3 players)             │  ← Dimmed section, same row format
│  ┌────────────────────────┐    │
│  │ 12. Reserve     ALL 55 │    │  ← Grey left border = benched
│  └────────────────────────┘    │
│                                │
│  TEAM MORALE: ▓▓▓▓▓▓░░  68    │  ← Morale bar
│  CHEMISTRY:   ▓▓▓▓▓░░░  +3%   │  ← Chemistry bonus
│                                │
│  ╱ HUB ╱ CARDS ╱ SHOP ╱ ME ╱  │
└────────────────────────────────┘

Player row interaction:
  - Tap: opens Player Detail screen
  - Long press: enters drag mode (reorder batting/bowling)
  - Swipe right: bench/unbench player
  - Left accent border color: green (playing), grey (bench), red (held by mafia)
```

---

#### SCREEN 05: Player Detail

```
┌────────────────────────────────┐
│ ← PLAYER DETAIL                │
│────────────────────────────────│
│                                │
│  ┌────────────────────────┐    │
│  │    [LARGE PLAYER CARD] │    │  ← Full card, hero size
│  │    with all stats      │    │
│  └────────────────────────┘    │
│                                │
│  STAT BREAKDOWN                │  ← Teko 600
│  ┌────────────────────────┐    │
│  │ BAT ▓▓▓▓▓▓▓▓░░  87    │    │  ← Horizontal bars
│  │ BWL ▓░░░░░░░░░  12    │    │     Color: green if >60, amber 40-60, red <40
│  │ FLD ▓▓▓▓▓▓░░░░  65    │    │
│  │ FIT ▓▓▓▓▓▓▓░░░  78    │    │
│  │ FRM ▓▓▓▓▓▓▓░░░  72 ▲  │    │  ← Trend arrow
│  │ LOY ▓▓▓▓▓▓▓▓░░  82    │    │  ← Gold bar
│  │ GRD ▓▓░░░░░░░░  28    │    │  ← Crimson bar
│  └────────────────────────┘    │
│                                │
│  FORM HISTORY (last 5 matches) │
│  72 ← 68 ← 65 ← 70 ← 63     │  ← Space Grotesk, sparkline graph
│  ──────/\──/\───              │
│                                │
│  ARCHETYPE: THE PATRIOT       │  ← Rajdhani 600, Antique Gold
│  "Won't accept bribes.        │
│   Will report corruption."    │  ← Cinzel 400, italic, Slip Cordon
│                                │
│  ┌─────────┐  ┌─────────┐     │
│  │ UPGRADE │  │  BRIBE  │     │  ← Bribe only if on rival team
│  │ 50 coins│  │ 216 B$  │     │     Bribe cost = (100-greed)*3
│  └─────────┘  └─────────┘     │
└────────────────────────────────┘
```

---

#### SCREEN 06: Pre-Match Strategy

```
┌────────────────────────────────┐
│ MATCH DAY                      │  ← Teko 700, 36px
│ SEASON III — Match 8           │
│────────────────────────────────│
│                                │
│  YOUR TEAM    vs    THE SHARK  │  ← Teko 600 both sides
│  ■■■■■ 72         68 ■■■■■    │  ← Squad strength bars
│  +42 alignment    -58 align    │  ← Gold vs Crimson
│                                │
│  PITCH: SEAMING               │  ← Teko 600, Pitch Green
│  "Pace bowlers get extra help" │  ← Rajdhani 400, flavor
│                                │
│  ┌──── DECISIONS ────────┐     │
│  │                       │     │
│  │ TOSS WON — Choose:    │     │  ← Only if toss won
│  │ [BAT FIRST] [BOWL]    │     │
│  │                       │     │
│  │ BOWLING STRATEGY:     │     │
│  │ [AGGRESSIVE]          │     │  ← Toggle between 3 options
│  │ [BALANCED ✓]          │     │     Check mark on selected
│  │ [DEFENSIVE]           │     │
│  │                       │     │
│  │ KEY MATCHUP:          │     │
│  │ Your: [▼ Select bowler]│    │  ← Dropdown selectors
│  │ vs Their: [▼ batter]  │     │
│  │                       │     │
│  │ CAPTAIN: [▼ Select]   │     │
│  └───────────────────────┘     │
│                                │
│  ╔═══════════════════════╗     │  ← Only if fix is active
│  ║ FIX ACTIVE            ║     │     Mafia panel, pulsing border
│  ║ Match Fix (Win)       ║     │
│  ║ Risk: 31% failure     ║     │     Shows loyalty calc result
│  ╚═══════════════════════╝     │
│                                │
│      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲       │
│     │   START MATCH     │      │  ← Primary button, large
│      ╲_________________╱       │
└────────────────────────────────┘
```

---

#### SCREEN 07: Match Simulation

```
┌────────────────────────────────┐
│ YOUR TEAM vs THE SHARK         │  ← Teko 600
│────────────────────────────────│
│                                │
│         156 / 4                │  ← Space Grotesk 700, 56px
│        20.0 overs              │  ← Space Grotesk 500, 16px
│                                │
│  ┌──────────────────────┐      │
│  │ POWERPLAY    48/1    │      │  ← Phase boxes (filled as sim progresses)
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │      │     Completed: filled accent
│  │ MIDDLE OVERS 62/2    │      │     Current: pulsing fill animation
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │      │     Future: empty, Boundary Rope border
│  │ DEATH OVERS  46/1    │      │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ │      │
│  └──────────────────────┘      │
│                                │
│  KEY MOMENTS:                  │  ← Scrolling ticker (bottom to top)
│  ┌──────────────────────┐      │
│  │ ⚡ Quick Gun smashes  │      │  ← Custom icon + Rajdhani 500
│  │   3 sixes in death!  │      │
│  │                       │      │
│  │ 🏏 The Wall anchors  │      │  ← Cricket icon, not emoji
│  │   with steady 45(38) │      │
│  │                       │      │
│  │ ⚠ FIX: Umpire gave   │      │  ← Amber warning icon (if fix active)
│  │   tight LBW in your  │      │
│  │   favor. Evidence     │      │
│  │   may be generated.   │      │
│  └──────────────────────┘      │
│                                │
│  [SKIP →]                      │  ← Secondary button, bottom right
└────────────────────────────────┘

Match simulation animation:
  - Phase boxes fill left-to-right over 15-20 seconds each
  - Key moments type out like a news ticker (typewriter effect)
  - Score counter rolls mechanically (old scoreboard style)
  - If drama trigger: screen flash, score pauses, moment highlighted
  - If fix active: subtle red pulse on screen edges during fixed moments
```

---

#### SCREEN 08: Post-Match Report

```
┌────────────────────────────────┐
│                                │
│        V I C T O R Y           │  ← Cinzel 700, 28px, +2px tracking
│                                │     Gold shimmer animation
│    YOUR TEAM  156/4            │  ← Space Grotesk 700, 32px
│    THE SHARK  142/8            │
│    Won by 14 runs              │  ← Rajdhani 500
│                                │
│────────────────────────────────│
│  REWARDS                       │  ← Teko 600
│  ┌────────────────────────┐    │
│  │ +50 coins    +3 pts    │    │  ← Space Grotesk, each item animates in
│  │ +2 alignment +5 morale │    │
│  │ +2 fan loyalty         │    │
│  └────────────────────────┘    │
│                                │
│  PLAYER OF THE MATCH           │
│  ┌────────────────────────┐    │
│  │ Quick Gun — 62(34)     │    │  ← Highlighted card, gold border
│  │ Form: 65 → 75  ▲      │    │
│  └────────────────────────┘    │
│                                │
│  CORRUPTION REPORT             │  ← Only if corrupt actions occurred
│  ╔════════════════════════╗    │
│  ║ Fix applied. No        ║    │  ← Mafia panel
│  ║ evidence generated.    ║    │     Green check or red warning
│  ║ Heat: 18 → 23 (+5)    ║    │
│  ╚════════════════════════╝    │
│                                │
│      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲       │
│     │    CONTINUE       │      │
│      ╲_________________╱       │
└────────────────────────────────┘
```

---

#### SCREEN 09: Favor Board (Deals)

```
┌────────────────────────────────┐
│ ← DEALS                       │
│────────────────────────────────│
│                                │
│  ACTIVE DEBTS (2/5)            │  ← Teko 600, Crimson if >3
│  ┌────────────────────────┐    │
│  │ ⛓ Auction Leak         │    │  ← Chain link icon
│  │   Owe: 100 B$          │    │  ← Space Grotesk, Crimson
│  │   Due in: 2 matches    │    │  ← Amber if <2, red if overdue
│  │   [PAY NOW]            │    │
│  │────────────────────────│    │
│  │ ⛓ Player Tap           │    │
│  │   Owe: 150 B$          │    │
│  │   Due in: 1 match  ⚠  │    │  ← Warning icon if due soon
│  │   [PAY NOW]            │    │
│  └────────────────────────┘    │
│                                │
│  ─── ◆ ───                     │  ← Divider
│                                │
│  AVAILABLE FAVORS              │  ← Teko 600
│  ┌────────────────────────┐    │
│  ║ SCOUT INTEL            ║    │  ← Mafia panel per favor
│  ║ See hidden stats of 3  ║    │
│  ║ players before auction ║    │
│  ║                        ║    │
│  ║ Cost: 30 B$            ║    │  ← Space Grotesk
│  ║ Heat: +2               ║    │  ← Amber
│  ║ Debt: 60 B$ in 5 games ║    │  ← Crimson
│  ║ Alignment: -3          ║    │  ← Shows direction
│  ║                        ║    │
│  ║  ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲    ║    │
│  ║ │  ACCEPT FAVOR   │    ║    │  ← Danger button (pulsing)
│  ║  ╲______________╱     ║    │
│  └────────────────────────┘    │
│                                │
│  ╱ HUB ╱ CARDS ╱ SHOP ╱ ME ╱  │
└────────────────────────────────┘
```

---

#### SCREEN 10: Investigation / Tribunal

```
INVESTIGATION ACTIVE:
┌────────────────────────────────┐
│                                │
│  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐   │  ← Investigation panel (dashed border)
│  ┆                        ┆   │     Newsprint texture background
│  ┆  FORMAL INVESTIGATION  ┆   │  ← Teko 700, Amber Warning
│  ┆                        ┆   │
│  ┆  Evidence pieces: 3    ┆   │  ← Space Grotesk (hidden types)
│  ┆  Matches until         ┆   │
│  ┆  tribunal: 4           ┆   │
│  ┆                        ┆   │
│  ┆  HEAT: ▓▓▓▓▓▓▓░░ 68   ┆   │  ← Large heat bar, red
│  ┆                        ┆   │
│  ┆  YOUR DEFENSE:         ┆   │
│  ┆  Base:    5            ┆   │
│  ┆  Align:  +3 (+42)      ┆   │
│  ┆  Lawyer: +5 (Epic)     ┆   │
│  ┆  Total:  13            ┆   │
│  ┆                        ┆   │
│  ┆  [HIRE BETTER LAWYER]  ┆   │  ← If no lawyer staff card
│  ┆  [DESTROY EVIDENCE]    ┆   │  ← Danger button (costs B$)
│  ┆  [FIND CHARACTER       ┆   │
│  ┆   WITNESS]             ┆   │  ← Needs clean rival ally
│  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘   │
└────────────────────────────────┘


TRIBUNAL (full screen takeover):
┌────────────────────────────────┐
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  ← Dark overlay, heavy vignette
│                                │
│      T R I B U N A L           │  ← Cinzel 700, 32px, gold
│      ─────── ◆ ───────         │
│                                │
│  PROSECUTION: 18               │  ← Space Grotesk 700, Crimson
│  ┌────────────────────────┐    │
│  │ Financial Record    x2 │    │  ← Evidence revealed one by one
│  │ Witness Statement   x3 │    │     Typewriter animation
│  │ Comm. Intercept     x4 │    │
│  │ Caught on Camera    x5 │    │
│  │                 = 14   │    │
│  │ + Prior warning     +3 │    │
│  │              TOTAL: 18 │    │
│  └────────────────────────┘    │
│                                │
│  DEFENSE: 13                   │  ← Space Grotesk 700, Gold
│  ┌────────────────────────┐    │
│  │ Base                 5 │    │
│  │ Alignment (+42)     +3 │    │
│  │ Legal Advisor       +5 │    │
│  │              TOTAL: 13 │    │
│  └────────────────────────┘    │
│                                │
│  PROSECUTION - DEFENSE = 5     │
│                                │
│                                │
│  V E R D I C T:                │  ← Cinzel 700, letter-spacing 4px
│                                │
│      W A R N I N G             │  ← Cinzel 700, 28px, Amber Warning
│                                │     Typewriter reveal, 1.2s
│  "The board finds insufficient │  ← Cinzel 400, 14px, Slip Cordon
│   evidence for penalty. But    │     Fades in after verdict
│   you are being watched."      │
│                                │
│      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲       │
│     │    ACCEPT         │      │
│      ╲_________________╱       │
└────────────────────────────────┘
```

---

#### SCREEN 11: Rival Profile

```
┌────────────────────────────────┐
│ ← RIVAL: THE SHARK             │
│────────────────────────────────│
│                                │
│  ┌────┐                       │
│  │ AV │  "Vikram Rathore"     │  ← Name (Teko 600)
│  └────┘  Personality: SHARK   │  ← Rajdhani 500, Crimson
│          Season 3 together     │
│                                │
│  ALIGNMENT ░░░░▓▓▓▓ -58       │  ← Crimson bar
│  SQUAD STR ▓▓▓▓▓▓▓░  82      │
│  RECORD    7W 1L              │
│                                │
│  RELATIONSHIP                  │
│  ░░░░░░▓▓▓▓▓  HOSTILE (-35)  │  ← Red zone
│                                │
│  KNOWN INFO:                   │  ← What you've observed/bought
│  ┌────────────────────────┐    │
│  │ • Took 2 favors this   │    │  ← If you have Rival Dossier
│  │   season                │    │
│  │ • Heat: ~45 (est.)     │    │
│  │ • Active debts: 3      │    │
│  │ • Uses auction leaks   │    │
│  └────────────────────────┘    │
│                                │
│  HISTORY:                      │
│  S1: Neutral → S2: He exposed │
│  you → S3: Hostile, competing  │
│  for top 2                     │
│                                │
│  ┌─────────┐ ┌─────────┐      │
│  │ EXPOSE  │ │ COLLUDE │      │
│  │         │ │  (locked)│      │  ← Locked if relationship too low
│  └─────────┘ └─────────┘      │
└────────────────────────────────┘
```

---

#### SCREEN 12: Pack Opening

```
┌────────────────────────────────┐
│                                │
│        PREMIUM PACK            │  ← Teko 700, Burnished Gold
│        5 CARDS                 │  ← Rajdhani 500
│        Guaranteed Rare+        │
│                                │
│  ┌────────────────────────┐    │
│  │                        │    │
│  │   ╔══════════════╗     │    │  ← Pack visual: textured card back
│  │   ║              ║     │    │     Leather + gold foil stamp
│  │   ║  CRICKET     ║     │    │     Rarity glow around edges
│  │   ║  UNDERWORLD  ║     │    │
│  │   ║              ║     │    │     Tap to open (prompt text below)
│  │   ╚══════════════╝     │    │
│  │                        │    │
│  └────────────────────────┘    │
│                                │
│       TAP TO OPEN              │  ← Rajdhani 500, pulsing opacity
│                                │
└────────────────────────────────┘

OPENING ANIMATION:
1. Pack cracks (split down center, light bursts through)
2. Cards fly out one by one (0.5s per card)
3. Each card lands face-down, then flips (3D Y-axis rotation)
4. Rarity revealed by border glow before flip completes
   - Common: dim, no fanfare
   - Uncommon: blue flash
   - Rare: green flash + brief particle burst
   - Epic: gold flash + sustained particle shower + audio sting
   - Legendary: screen darkens, spotlight on card, holographic shimmer, 
     extended reveal (2s), gold + crimson + green gradient border animation
5. All cards shown in row at end for review
6. "NEW" badge on any card not previously owned
```

---

#### SCREEN 13: Season End Summary

```
┌────────────────────────────────┐
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│                                │
│   S E A S O N   I I I          │  ← Cinzel 700, 28px, Gold
│   C O M P L E T E             │
│   ─────── ◆ ───────            │
│                                │
│   FINAL STANDING: 2nd         │  ← Space Grotesk 700, 48px
│   ★ PROMOTED TO GOLD ★        │  ← Teko 700, Burnished Gold, if promoted
│                                │
│   SEASON STATS                 │
│   ┌────────────────────────┐   │
│   │ Record:    8W 6L       │   │  ← Space Grotesk
│   │ Alignment: +42 → +38  │   │  ← Shows drift
│   │ Peak heat: 68          │   │
│   │ Favors taken: 4       │   │
│   │ Tribunals: 1 (Warning) │   │
│   │ Rivals exposed: 1     │   │
│   │ Debts cleared: 3      │   │
│   └────────────────────────┘   │
│                                │
│   LEAGUE DRAMA                 │  ← Teko 600
│   • The Shark BANNED           │  ← Key events, Rajdhani
│     (season suspension)        │
│   • The Coward exposed         │
│     The Politician              │
│   • You survived a tribunal    │
│                                │
│   CARRY FORWARD                │
│   ┌────────────────────────┐   │
│   │ Coins: 1,840           │   │
│   │ Gems: 52               │   │
│   │ Black money: 380       │   │  ← Red if over threshold
│   │ Active debts: 1        │   │  ← Warning if any
│   │ RTM slots: 2           │   │
│   └────────────────────────┘   │
│                                │
│   PROMOTION REWARDS            │  ← Gold border panel
│   +400 coins, +10 gems,       │
│   1x Epic Card Pack            │
│                                │
│      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲       │
│     │  NEXT SEASON      │      │
│      ╲_________________╱       │
└────────────────────────────────┘
```

---

## 7. Responsive Layout Rules

### 7.1 Target Devices

| Device Class | Screen Width | Priority |
|-------------|-------------|----------|
| Budget Android (Redmi, Realme) | 360-390px | **PRIMARY** — design for this first |
| Mid-range Android | 390-430px | Secondary |
| iPhone SE/Mini | 375px | Must work |
| Standard iPhone | 390-430px | Must work |
| Tablets | 768px+ | Nice to have (scale up panels, don't redesign) |

### 7.2 Layout Principles

- **Single column, always.** No side-by-side panels on mobile. Stack vertically.
- **Thumb zone:** primary actions in bottom 60% of screen. Never put critical buttons in top 20%.
- **Min tap target:** 44x44px. No exceptions. Especially in auction (speed matters).
- **Currency bar:** fixed top, always visible. 36px height, doesn't scroll.
- **Bottom nav:** fixed bottom, 56px height. 5 items max.
- **Content area:** scrollable between currency bar and bottom nav.
- **Cards:** max width 300px, centered. On wider screens, allow 2-column grid.

### 7.3 Performance Constraints

Targeting ₹8,000-₹12,000 Android phones:
- **No heavy shadows.** Use solid color borders instead of box-shadow where possible.
- **Limit gradients.** One gradient per visible screen max.
- **Texture overlays:** SVG tiling (tiny file size), not large bitmap textures.
- **Animations:** CSS transforms only (GPU accelerated). No layout-triggering animations.
- **Canvas:** used only for match simulation and pack opening. Everything else is DOM.
- **Total page weight:** under 500KB including fonts.

---

## 8. Audio Design Direction

(Not implemented in v1 prototype, but spec'd for consistency)

| Element | Sound Character |
|---------|----------------|
| **Menu interactions** | Mechanical clicks — typewriter key, not digital beep |
| **Auction bids** | Gavel tap (wood on wood) |
| **Card flip** | Playing card flick |
| **Pack opening** | Paper tear → cards fanning |
| **Match scoring** | Old scoreboard clack (mechanical counter) |
| **Mafia offer** | Low bass drone + distant phone ring |
| **Favor accepted** | Heavy door closing (commitment) |
| **Evidence generated** | Camera shutter click |
| **Investigation** | Newspaper printing press, distant |
| **Tribunal verdict** | Gavel slam (3 slow strikes) |
| **Victory** | Stadium crowd roar (compressed, lo-fi, like through a wall) |
| **Defeat** | Crowd silence → single slow clap |
| **Corruption glow** | Continuous: low hum, barely audible, increases with heat |

---

*End of Visual Design System v1.0*
