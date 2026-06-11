# Progress — Cricket Underworld

**Last updated:** 2026-06-11
**Last commit:** `bba8848` — Phase 3: expand player pool to 50, richer commentary & social media

## Current State

- **Build:** HTML5 single-file PWA (`prototype/index.html`, ~6865 lines)
- **Tests:** ~80 Playwright E2E tests across 3 spec files — last full run: all passing
- **Features:** 32/38 passing, 0 active, 0 blocked, 6 not started
- **Phase:** Phase 3 (content & polish) — 43 systems live

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

## Not Started (Phase 4+)

- [ ] F33: Full team/player name customisation
- [ ] F34: Season/battle pass
- [ ] F35: IAP stubs
- [ ] F36: Rewarded ads
- [ ] F37: PWA service worker + offline
- [ ] F38: Knockout bracket tournament

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
