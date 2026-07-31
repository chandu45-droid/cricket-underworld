# Cricket Underworld — bolt.new UI Redesign Brief (Design-Generator mode)

> **Purpose:** hand bolt.new a *design* brief + current-state screenshots and get back a
> premium UI **direction** (standalone mockups) — NOT a rewrite of the game. The game is one
> 10.7k-line vanilla-JS PWA (`prototype/index.html`); we port bolt's winning look back in-house,
> screen by screen, logic untouched. Do NOT paste the game file into bolt.
> Prepared 2026-07-31 for the sell-now pivot (the live demo is the asset being sold — must look premium).

---

## PART 1 — PASTE THIS INTO bolt.new (attach the screenshots from Part 2)

```
You are redesigning the UI of "Cricket Underworld", a mobile-first cricket AUCTION + card-strategy
game for the Indian market (16-35, budget Android). Players bid on cricket cards in IPL-style
auctions, build a squad, set match strategy, and run a corrupt-vs-clean underworld storyline
(favors, debts, heat, tribunals). It is a STRATEGY game — dense numbers, not a casual toy.

I am attaching screenshots of the CURRENT screens. Your job: produce a REDESIGNED, more premium
UI DIRECTION as standalone HTML+CSS mockups (one file per screen, mock data, no framework, no build
step). Do NOT rebuild the game logic. Do NOT use React/Vue — plain HTML + CSS + minimal inline SVG only.

=== IDENTITY (KEEP — do not replace, SHARPEN) ===
Two worlds fused: THE STADIUM (broadcast-clean data, floodlight glow, scoreboard type) layered over
THE UNDERWORLD (smoke-filled noir, dim amber, weathered paper, 70s Bombay gangster). Broadcast-clean
stats sitting inside a private-club noir atmosphere. Reference feels: Star Sports/IPL broadcast
graphics + Gangs of Wasseypur color grade. Premium console-grade, gritty NOT glossy.

=== HARD CONSTRAINTS (breaking any = rejected) ===
1. ANGULAR ONLY. Chamfered corners cut on TWO opposite corners (top-left + bottom-right) via CSS
   clip-path polygons. Sizes: 14px (panels/cards), 10px (buttons), 6px (chips). NO rounded corners,
   NO pill shapes, ever.
2. TWO FONTS ONLY (Google Fonts): Teko (display/titles/dramatic + hero numbers, condensed, 600/700)
   and Rajdhani (body + dense stat numbers, tabular figures, 400/500/600/700). No other font.
3. TWO THEMES, both must render:
   - LIGHT (the enforced default): warm ivory surfaces. void #F4EFE6, base #EDE7DA, panel #E3DBCB,
     text ink #1A2333, gold #9A7A08, blood #C81E2E.
   - DARK NOIR (toggle): void #080B11, base #0D1117, panel #161B26, elevated #1E2536,
     text warm-white #E8E0D4, gold #DAA520, crimson #8B0000, blood #CC1100.
4. ALIGNMENT-RESPONSIVE COLOR: the UI temperature shifts with the player's morality. Clean/spotless
   = burnished GOLD accents + warm glow. Corrupt = CRIMSON/blood accents + red vignette closing in.
   Show at least the clean-gold and corrupt-crimson variants of the Hub.
5. ONE RED HERO CTA per screen (the primary action: PLACE BID, START MATCH, GO TO AUCTION) —
   gradient linear-gradient(160deg,#E43A1F,#8B0000), the single highest-contrast element on screen.
6. NO EMOJI anywhere. All icons = custom monoline SVG, ~2px stroke.
7. Subtle TEXTURE on surfaces (5-8% opacity SVG noise): concrete grain on backgrounds, linen on cards.
   Gritty, never flat/material.
8. MOBILE-FIRST 360-390px, single column always, 44px min tap targets, primary actions in the
   thumb-zone (bottom 60%). Fixed top currency/status bar + fixed 5-item bottom nav.
9. PERFORMANCE (cheap Android): total under 500KB incl fonts, CSS transforms only, max ~1 heavy
   gradient per screen, SVG textures not bitmaps. No layout-thrashing animation.

=== WHERE TO PUSH (this is what "redesign" means) ===
- Broadcast command bar: fold season/day/league + currency into ONE cohesive broadcast header
  instead of stacked strips.
- Diegetic framing: the Hub should read as the manager's DESK / control room — an object in the
  world — not a floating list of app cards.
- Motion as the premium layer (describe, since these are static): tactile press states, number
  roll-ups, staggered entrance, ONE signature transition. This is where 2026 "premium" is won.
- Progressive reveal: ONE primary action above the fold; secondary / monetization on demand.
- ONE signature spotlight motif (radial grade + a fine gold hairline) so every screen reads as one product.

=== DELIVERABLE ===
For EACH attached screen, output a standalone .html file (inline CSS + inline SVG, mock data) that:
- Renders at 390x844, single column, all constraints above respected.
- Includes a light/dark toggle OR two side-by-side frames.
- Beats the current screenshot on hierarchy, cohesion, and premium feel while keeping the identity.
Start with the HUB (the hero screen). Show clean-gold and corrupt-crimson variants of it.
Then Auction, then the others. Explain each key design decision in 1-2 lines.
```

---

## PART 2 — SCREENS TO SCREENSHOT (attach to bolt, in this priority order)

Capture from the live demo: `https://chandu45-droid.github.io/cricket-underworld/prototype/index.html`
(or local `npx serve prototype -l 8080`). **All at 390x844 (primary), a few at 320x568.**
Use a save with a populated squad + mid-season state so screens aren't empty.

| # | Screen | Why it matters | Priority |
|---|--------|----------------|----------|
| 1 | **Hub** (home) | Hero screen — the look is decided here first | ★★★ must |
| 2 | **Active Auction** (mid-bid) | Core loop, highest-tension screen | ★★★ must |
| 3 | **Squad Overview** | Dense data / list-heavy screen (hardest to make premium) | ★★★ must |
| 4 | **Match Simulation** | Broadcast-scoreboard moment | ★★ strong |
| 5 | **Post-Match / Victory report** | The payoff / celebration beat | ★★ strong |
| 6 | **Pack Opening** | Monetization + spectacle | ★ nice |
| 7 | **Player Detail** | Stat-breakdown card | ★ nice |
| 8 | **Deals / Favor Board** | The underworld/noir panels (mafia styling) | ★ nice |

Also capture ONE screen in **dark-noir theme** (Settings → theme toggle) so bolt sees both worlds.
(Full game is 16 screens; 8 above are enough to set the direction — the rest inherit the system.)

---

## PART 3 — WHAT TO REJECT FROM BOLT (sanity gate on the way back)

- ❌ Any React/Vue/Next/Tailwind rewrite — we need plain HTML/CSS mockups only.
- ❌ Rounded corners / pill buttons / material-design flatness.
- ❌ A 3rd or 4th font; emoji as icons.
- ❌ A single-theme design that ignores light-default or dark-noir.
- ❌ "Clean SaaS dashboard" energy — this is a gritty noir strategy game, not a fintech app.
- ❌ Anything that only works on desktop width or blows the <500KB / 1-gradient perf budget.
- ✅ Accept: a sharper hierarchy, broadcast header, diegetic Hub, one signature motif, motion notes —
  then WE port the winning direction into `prototype/index.html` in-house (ui-designer + shilpi),
  one screen at a time, tests green, game logic untouched.

---

*Source of truth for exact tokens: `docs/visual-design-system.md`. Direction rationale: `docs/look-direction-v2.md`.*
