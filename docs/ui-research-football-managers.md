# UI Research: Football Manager Simulation Apps

**Date:** 2026-06-06
**Purpose:** Study top 3 Play Store football manager sim apps for Cricket Underworld UI inspiration.

---

## Apps Studied

### 1. Top Eleven (Nordeus) — The Market Leader

**What they do well:**
- **Hub/Dashboard:** Stadium campus as visual backdrop, not just a menu. Live club status (finance, morale, form) rendered as visual meters, not text. Quick-action cards show real-time status with notification badges.
- **Auction:** Real-time multiplayer auctions against real players. Rival faces visible. Timer-based tension. Budget bar depletes visually.
- **Match:** 3D match visualization in real-time. Stadium with your fanbase visible.
- **Squad:** Gallery-style collection. Youth Academy as separate progression path.
- **Progression:** Campus feature — customize stadium, build facilities (visual upgrades that affect gameplay).
- **Monetization:** Superstar World Gallery — collect real-world players across nations for rewards.

**Key UI patterns:**
- Layered, data-dense hub with multiple entry points
- Premium card collection with gallery view
- Facility-based visual progression (stadium/campus)
- Fan engagement as a visible system

---

### 2. Soccer Manager 2026 (Invincibles Studio) — The Data-Driven One

**What they do well:**
- **UI Overhaul:** Sleek new UI with improved color scheme and more intuitive navigation. Modernized, clean design.
- **Manager System:** Manager traits skill tree — gain points, level up perks. Visual skill tree layout.
- **Transfer Market:** Advanced transfer market reflecting real financial constraints and negotiation processes. Not just "buy player" — multi-step negotiation flow.
- **Match Engine:** "Match Motion" engine — improved animations, lighting, match flow. Phase transitions feel smooth. Player movement reflects tactical instructions visually.
- **Training:** Players sorted by rating progress. Visual training progression bars.
- **Scale:** 90+ leagues, 54 countries. Deep data presentation without clutter.

**Key UI patterns:**
- Clean, modern color scheme (not just dark = premium)
- Skill tree visualization for manager progression
- Phase-based match display with smooth transitions
- Data-heavy screens that don't feel cluttered

---

### 3. Top Football Manager 2026 (MWM/Gamegou) — The Tactical One

**What they do well:**
- **Auction/Scouting:** Multi-path player acquisition — bid, scout, recruit via agents, or transfer. Each path has its own UI flow.
- **Tactics:** Visual formation editor. Adjust lineup AND tactics mid-game in response to opponent. Mentality/attack direction as visual controls.
- **Match Sim:** Live 3D simulation with stunning graphics. Immersive stadium environment.
- **Training:** Special skills development. Groom promising players with targeted training.
- **Facilities:** Youth Academy, Stadium, Hospital, Utilities, Training Ground — each upgradeable, each visually represented.
- **Multiplayer:** Test tactics against real opponents worldwide.

**Key UI patterns:**
- Formation/tactics as interactive visual editor (drag players on pitch)
- Facility upgrade paths as visual building blocks
- Mid-match tactical adjustment UI
- Multi-path flows for the same goal (acquire a player)

---

## Common Patterns Across All Three

### Hub/Dashboard
- NOT a flat list of buttons — rich, layered dashboard
- Stadium/campus visual as backdrop or header
- Live club metrics as animated visual elements
- Quick-action tiles showing real-time status
- Notification badges with urgency indicators

### Player Cards
- Premium collectible feel — not just data display
- Holographic/foil/shimmer effects for higher rarities
- Detailed stat displays (radar charts, hexagonal)
- Animated card reveals during pack opening
- Card border glows + particle effects for rare cards

### Auction/Transfer
- Timer-based tension with visual countdown
- Rival bidders visible (faces/avatars)
- Budget bar that depletes in real-time
- Player spotlight with stat comparison
- Bid history as live feed

### Match
- Visual pitch representation (2D or 3D)
- Commentary-style text feed with moment icons
- Phase/momentum indicators
- Player performance highlights post-match

### Squad
- Formation-based visual layout on pitch
- Role-specific sections with distinct visual headers
- Chemistry/synergy indicators between players
- Training progress per player

### League
- Premium table with team badges/colors
- Form streak indicators (W/L dots)
- Zone highlighting (promotion/relegation)
- Position change arrows

---

## 2025-2026 Mobile Game UI Trends (from research)

1. **Dark Mode 2.0** — Not just dark backgrounds. Advanced color schemes, gradients, ambient lighting. OLED-optimized true blacks with accent colors.
2. **Glass Morphism** — Frosted glass panels with blur, replacing flat dark boxes.
3. **Purposeful Motion** — Micro-animations as cognitive guides, not decoration. Motion = UX logic.
4. **Card-Based Layouts** — Collectible cards with layered z-index creating physical depth.
5. **Cleaner HUDs** — Reduce visual clutter, improve immersion.
6. **Handcrafted Assets** — Every element (avatars, coins, icons) feels individually designed.
7. **Material Design 3.0** — Advanced animations, motion effects, interactive elements.

---

## Application to Cricket Underworld

### Screen-by-Screen Plan

| Screen | Current State | Target State |
|--------|--------------|--------------|
| **Loading** | Basic progress bar + text | Cinematic — animated cricket ball, atmospheric smoke, pulsing title |
| **Hub** | Flat panel list, same style everywhere | Stadium silhouette backdrop, glass tiles with live data, animated alignment meter |
| **Auction** | Basic card + text timer | Dramatic spotlight, circular SVG timer, rival bidder avatars, bid war tension |
| **Pre-Match** | Simple VS display | Pitch condition visual, tactical formation picker, rival analysis panel |
| **Match** | Text-only ball sim | Mini pitch visualization, commentary feed with icons, phase momentum bar |
| **Squad** | Flat player list | Role-grouped sections on cricket field formation, training indicators |
| **Cards** | Basic 2-column grid | Premium gallery with holographic shimmer, animated pack opening with card flips |
| **League** | Simple table | Premium table with form streaks, zone colors, position change indicators |
| **Mafia** | Basic modal | Noir-themed envelope reveal, red atmosphere, tension animation |

### Design Principles (from research)
1. Every screen must have its own visual identity — distinct ambient color, unique layout
2. Glass morphism panels instead of flat dark boxes
3. Gradient border glow on interactive elements
4. Animated number counters for scores, currency, bids
5. Holographic CSS shimmer on player cards
6. Contextual particles (gold for clean, red for corrupt)
7. Purposeful micro-animations on every interaction
8. Cricket pitch SVG as visual anchor for match/squad screens
