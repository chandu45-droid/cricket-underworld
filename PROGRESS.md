# Progress — Cricket Underworld

**Last updated:** 2026-07-08
**Last commit:** ac78820 — Premium UI redesign Screen 08 (Card Collection + Pack Ceremony)

## Current State

- **Build:** HTML5 single-file PWA (`prototype/index.html`, ~7000+ lines)
- **Tests:** 114 Playwright E2E tests across 3 spec files — last full run: all 114 passing
- **Features:** 38/38 passing — **FEATURE-COMPLETE.** F33–F38 all shipped (bug audit c40ac4c → PWA 8318376 → Season Pass 819d5b5 → Vault IAP 77ef349 → Sponsor Break rewarded ads)
- **Phase:** ▶ Premium UI Redesign **RESUMED by founder decision 2026-07-08** (6/16 screens done, 10 remaining — see below)

## FOUNDER DECISION 2026-07-08: UI Redesign resumes NOW

Founder verdict: *"the game UI is very basic and I am not okay with it"* — redesign with rich, modern frames that hook players. This **overrides** the ship-and-measure pause on UI work. Rationale: shipping a basic-feeling game would poison the D7 measurement anyway — first impressions gate retention. Ship-and-measure (analytics + distribution) remains the step AFTER the redesign, not cancelled.

- [x] ~~1. Card Collection + pack opening~~ **DONE 2026-07-08 (ac78820)** — collection progress strip, angular filter chips w/ live counts, card deal-in stagger, premium pack showcase, full reveal ceremony (spotlight rays, rarity-tinted rings, spark bursts, legendary flash, NEW badges); also fixed pre-existing hidden-toast peek. 114/114 tests green.

## FOUNDER DIRECTION 2026-07-08 (#2): Underworld Core — supersedes the screen queue order

Founder verdict: *"the core game play is underworld, politicians, mafia, local leaders, other team boss bribes, police cases — majorly missing at the current structure. Also colors need not stay the same — re-plan them properly."*

Code audit confirmed it: mafia = offer menu only; politicians = a tag on 2 rivals; police = zero mentions; local leaders = zero; rival bribes one-directional. **Full plan: `docs/underworld-core-plan.md`** — 5-faction Power Web (Syndicate / Thana police cases / Neta politicians / Bhai local leaders / rival bosses two-way bribes) + zone-based color re-plan (Underworld=blood red noir, Law=steel blue, Politics=ivory/amber, Streets=sodium orange, Cricket=broadcast green, Economy=neon teal).

**New execution order (each built → tested → committed individually):**
1. Power Web hub panel + `GS.factions` skeleton ← NEXT
2. Police case pipeline (FIR → evidence → chargesheet → court) + Law zone
3. Rival boss two-way bribes
4. Grey Zone / Mafia screen redesign + Syndicate faces (Underworld zone)
5. Politicians + elections (Politics zone)
6. Local leaders (Streets zone)
7. Remaining redesign screens in their zone palettes: tutorial, league, XI, scorecard, market, scout, facilities, settings

## STRATEGIC PIVOT: Ship & Measure (2026-07-06 — Vidura portfolio audit)

**Verdict: PIVOT** — from "keep building" to "ship and validate". Cricket Underworld ranked #3 of 5 in the portfolio viability audit (see workspace `PORTFOLIO-AUDIT-2026-07-06.md`): biggest ceiling, wrong quarter.

**Why (researched live):**
- India gaming $5.91B → $16.72B by 2034; PROG Act 2026 banned real-money gaming while permitting social games — this game's no-RMG design is regulation-proof. The market thesis holds.
- BUT: gaming CPI up 30% YoY (~$0.56 blended), founder ad budget ₹0, PWA has zero store discovery, and 43 built systems have produced **zero users and zero retention data** — the only numbers that matter for both revenue and the investor pitch.
- Every additional polished screen deepens sunk cost without touching the real bottleneck: players.

**New plan — one Shipping Weekend, then hands off:**
1. Deploy/refresh public URL (GitHub Pages already live at `chandu45-droid.github.io/cricket-underworld/prototype/`)
2. F37: PWA manifest + service worker (installability drives return visits)
3. Analytics: anonymous localStorage user ID + events (session start, match completed, return visit) → D1/D7 cohorts
4. Mobile QA pass on a real device
5. Distribution: itch.io listing + Reddit (r/incremental_games, r/WebGames, cricket gaming subs) + X; time promo waves to cricket moments (Asia Cup window)
6. FREEZE all new systems/screens until ~200 organic users generate D7 data

**Tripwire:**
- **D7 > 15%** → premium UI redesign resumes with priority; retention data becomes the spine of the investor pitch
- **D7 < 15%** → diagnose drop-off via funnel events, fix only that, re-measure; still failing → park as portfolio piece

**Status: awaiting founder "ship it" confirmation.** Until then, no new build work. The 10 remaining redesign screens and Phase 4 features (F33–F36, F38) resume only if the tripwire passes.

## Completed (Phase 1-3)

- [x] Auction system (IPL-style, AI bidders)
- [x] Match engine (ball-by-ball, DRS, impact player, weather, super over, injuries)
- [x] Squad management (training, release, XI selection, overseas cap)
- [x] Cards & collection (packs, 3D flip, filters, holographic foil)
- [x] Alignment system (5 zones, inertia, theming, sponsor tiers)
- [x] Mafia + debt + investigation + tribunal systems
- [x] League table with promotion/relegation zones
- [x] Transfer market (buy/sell)
- [x] Tutorial & onboarding
- [x] 50 Indianized players, commentary, social media
- [x] Visual rebuild (P1.5): crests, silhouettes, power ring, battle card, spring physics, animated gradients, glass panels
- [x] Canvas match ground, sound, gestures, mentorship, academy, staff, bans
- [x] **Premium UI Redesign — Screen 01 (Hub):** FIFA/WCC3-tier hub with glass panels, animated gradient mesh, power ring, battle card, spring physics
- [x] **Premium UI Redesign — Screen 03 (Auction):** Spotlight stage with rotating conic-gradient rays, glass bid arena, angular purse zone, dual timer (SVG circle + drain bar), bid urgency pulse, mafia intel panel, premium empty state with SVG gavel
- [x] **Premium UI Redesign — Screen 04 (Squad):** Glass stat panels with colored accent bars (bat/bwl/ovr/morale), gradient morale bar, role-grouped roster (Batters/All-Rounders/Bowlers), squad-specific card borders, SVG empty state
- [x] **Premium UI Redesign — Screen 05 (Player Detail):** Glass stat bars with colored fills, hexagonal OVR badge, angular training buttons, premium section headers with accent lines
- [x] **Premium UI Redesign — Screen 06 (Pre-Match Strategy):** Match Day header with season badge, hexagonal VS divider, SVG section icons (star/clock), glass pitch info with green accent, strategy opts with gold accent bar, pulsing fix banner, angular gradient Start Match CTA
- [x] **Premium UI Redesign — Screen 07 (Match Simulation):** Angular VS/status badges (clip-path), 56px score with text-shadow, glass match phases with glow, glass momentum bar with spring transitions, angular moment icons, glass tactics with enhanced pulse, hook panels with type-specific inset glow, glass streak milestones + daily challenges, weather banners with glass blur, DRS/Impact glow, dramatic match result overlay (20px blur, glass rewards panel, glowing value text), POTM with gold glow + shadow, corruption report with red inset, glass bowler picker with angular avatars, field setting with color-keyed glow

## Phase 4 — COMPLETE (2026-07-07/08)

- [x] F33: Full team/player name customisation (was already built — tracker corrected c5173d3)
- [x] F34: Season/battle pass — Syndicate Contract, 10 tiers free+premium (819d5b5)
- [x] F35: IAP stubs — The Vault, test-mode payments (77ef349)
- [x] F36: Rewarded ads — Sponsor Break: purse boost, free pack, post-match coin doubler, daily caps 1/1/3
- [x] F37: PWA — manifest, service worker, install prompt, icons (8318376)
- [x] F38: Knockout bracket tournament (was already built — tracker corrected c5173d3)

## Known Issues

- F09, F25, F27, F29, F32: Implemented but lack automated E2E tests
- F28 (gestures): Only testable on touch devices, no Playwright coverage
- Some systems (DRS, weather, injuries) have no automated verification

## Decisions Log

- **Single-file architecture**: All game code in one `index.html` — keeps deployment trivial, avoids build tooling. Will split when file exceeds ~10K lines.
- **Playwright over unit tests**: E2E tests against real browser cover interface mismatches that unit tests miss. Worth the slower run time.
- **50-card pool before economy**: Content depth before monetisation — players need enough cards to feel collection variety.
- **Indianized names**: All player/team/sponsor names are Indian — legal compliance (no real player names) + audience fit.

## Next Session Checklist

1. Read this file for current state
2. Read `feature_list.json` for system-level status
3. Run `npx playwright test` to verify repo is green
4. Pick next feature from `feature_list.json` (state: `not_started`) or address known issues
5. WIP=1: finish and verify one feature before starting next
