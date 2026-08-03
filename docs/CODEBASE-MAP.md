# CODEBASE MAP -- prototype/index.html (single file, ~10,150 lines)

> **Purpose: NO agent re-reads this file end-to-end. Grep the function name below, read only that region.**
> Line numbers drift with edits -- function names are the stable anchors. Updated 2026-07-16.

## File layout
| Range | What |
|---|---|
| 1-19 | head/meta |
| 20-2179 | ALL CSS (section comments inside: palette ~L38, angular design ~L100, per-screen grading ~L234, politics zone ~L1408, zone reskins ~L1515, hub monetization ~L1976, drop-rates overlay ~L2010, sponsor break ~L2088) |
| 2195-3072 | ALL markup: screens + overlays. `#match-result` ~L3326, `#pack-overlay` ~L3329 (RESOLVED 2026-08-02: pack overlay now has its own class `.pack-open-overlay`, no longer shares `.match-result-overlay` -- verified during pack-cinematic pass) |
| 3073-10151 | ALL game JS |

## JS regions (anchor function -> approx line)
| System | Anchors |
|---|---|
| Save/load/analytics | `save` 3131, `trackEvent` 3154, `load` 3491, `exportSaveString` 3520, `cloudBackup` 3569 |
| In-app browser / WebView warning | `_isInAppBrowser` ~4040, `_checkCrossSessionPersistence` ~4075, `_showInAppBrowserBanner` ~4155 (banner `#inapp-banner` near `#toast`) |
| Daily login | `processDailyLogin` 3312, `claimDailyLogin` 3362 |
| Empire/theme | `computeNetWorth` 3394, `applyTheme` 3430 |
| World init | `initRivalData` 3608, `initFactions` 3619 |
| Audio/FX/anim | `getAudio` 3784 .. `screenShake` 3990, `animateBallDelivery` 4000 |
| Generated art | `generateCrest` 4447, `generatePlayerSilhouette` 4508 |
| UI utils | `show`/`hide`/`toast` 4565-4568 (toast auto-hides 2.5s), `updateCurrency` 4575 |
| Core stats/alignment | `getOVR` 4619, `getAlignmentZone` 4627, `applyAlignShift` 4677, debts 4696-4755 |
| Rivals/underworld | 4761-5835: `processRivalAI` 4796, `bribeRivalToThrow` 4890, `checkInvestigation` 5080, `processUnderworldWeek` 5151, syndicate/neta/bhai screens 5387-5779, `resolveTribunal` 5780 |
| Squad/cards UI | `renderPlayerCard` 5866, `showPlayerDetail` 5916, training 5999-6039 |
| Navigation/hub | `goScreen` 6040, `updateHub` 6073, `updateSquadScreen` 6248, `updateCardsScreen` 6287, `updateLeagueTable` 6331 |
| **AUCTION** | `startAuction` 6384, `auctionTick` 6450, **`aiBid` 6460 (bot aggression)**, `placeBid` 6475, `passBid` 6485, `resolveCard` 6500, `endAuction` 6514 (end toast lives here) |
| **MATCH ENGINE** | `buildPlayingXI` 6564, `calcBallOutcome` 6629, weather 6719-6761, DRS 6762, super over 6853, injuries 6892-6959, `showSquadSelect` 7192 + `startPreMatch` 7340 (**min-squad-3 guards**), `startMatch` 7395, `simBall` 7502, `switchInnings` 7875, `skipMatch` 7909, `endMatch` 7979 (result HTML ~8135, `.show` 8198) |
| Mentorship/knockout | 8240-8486; `endSeason` 8615 |
| Packs/mafia/market | `openPack` 8695, `showMafiaOffer` 8766, market 8882-9000 |
| Customise/stats | `showCustomise` 9009, `updateSeasonStats` 9068 |
| Tutorial + events | `showTutorial` 9169, **`bindEvents` 9248 (ALL event wiring, ~470 lines)** |
| Season pass/store/ads | pass 9719-9850, store+IAP 9851-9962 (`requestPurchase` 9893), rewarded ads 9963-10031, gacha odds 10032 |

## Standing agent rules (founder-mandated 2026-07-16)
1. **Map-first**: grep anchors above; read only the region you need. Never read the whole file.
2. **No auto-testing**: do NOT run Playwright/browser verification unless the founder explicitly asks. Implement, commit, report what needs testing. Founder calls when to test.
3. Keep this map fresh: if you add/move a major system, update the anchor table (function names, not line numbers, matter most).

## Fix log (2026-08-03 full-game bug audit)
Line numbers in the table above have drifted noticeably (file has grown past ~12,100 lines) -- function names still hold as anchors, grep them. Confirmed-and-fixed this pass (full player-advocate audit + independent verification, see PROGRESS.md):
- **Debt Stage-2 "held player" now actually restricts squad selection.** `processDebts()` sets `p.debtHeld` on the real player object (was previously only a display string on the debt), checked in `toggleSquadPlayer()`, `renderSquadSelect()`, `showSquadSelect()`'s selection filter, and `renderPlayerMini()`. Cleared in `payDebt()`.
- **Removed 'Auction Leak' and 'Scout Intel' mafia offers** (`showMafiaOffer()`) -- both charged real cost and occupied the single `GS.mafiaBonus` slot (blocking every other favor/bribe) but neither effect was ever implemented anywhere. Re-add only alongside a real implementation.
- **`resolveCard()` now saves after each won auction card** (previously only `endAuction()` saved -- an app kill mid-auction lost every card bought that session).
- **`endMatch()` now saves immediately after all reward/consequence state is computed**, not only inside the Continue/Play Again button handlers -- previously closing the app from the result screen before tapping either button silently discarded the whole match's outcome.
- **`showImpactPicker()` Cancel path now removes its click listener** (previously only the successful-substitution path did; repeated open/Cancel/reopen cycles stacked duplicate listeners, causing a real substitution to fire once per stacked copy).
- **`autoSelectXI()` and `showSquadSelect()`'s first-open pre-select now also exclude `injured`/`debtHeld` players**, not just `banned` -- found while browser-testing the Stage-2 fix above (the "Auto" button could still silently draft an injured or held player). See `tests/bugfix-2026-08-03.spec.js` for regression coverage on all 5 fixes; full suite (172 tests, `smoke`+`comprehensive`+`features-10k`+`p15-visual`+this file) verified green 2026-08-03.

Flagged but NOT touched (founder/game-designer decision needed, not a code bug): RTM (Right to Match) has a fully-styled dead CSS/markup stub (`#rtm-banner`) with zero JS wiring -- GDD-specified but never built. "Planted Agent" mole mechanic from the GDD auction-corruption layer is entirely unbuilt. Both are content/scope decisions, not fixed here.

## Fix log (2026-08-03 game-logic/balance audit, second pass same day)
Distinct from the flow/UI audit above -- this pass targeted the actual MATH (formulas, exploits, cricket-authenticity), via a combined Balance-Tester + Cricket-Consultant style review, independently re-verified by reading the code before fixing. Confirmed-and-fixed:
- **Aggressive batting/bowling was strictly dominant (no downside).** `calcBallOutcome()` (~8305): strategy no longer multiplies into `batStr`/`bwlStr` (which fed the same `ratio` driving `wktP` -- aggression bought more boundaries AND fewer wickets with zero risk). Strategy is now a separate, explicit multiplier applied directly to `wktP`/`sixP`/`fourP` after the ratio-based base, matching GDD 6.2's stated "+10% wickets, +15% runs conceded" trade-off in both directions.
- **Auction floor price vs. Transfer Market sell price was a guaranteed coin-farm.** `showNextCard()`'s flat `{common:80,...,legendary:400}` table is now `Math.round(getPlayerPrice(p) * 0.6)` -- the same fraction `sellPlayer()` pays out -- so an uncontested auction win no longer breaks even-or-better on an instant resale.
- **`processAlignDecay()` (~6003) now also blocks decay during `GS.investigation`**, matching all 3 of GDD 1.4 [v2 FIX]'s documented block conditions (debts / heat>30 / under investigation) -- only 2 of 3 were implemented.
- **`endMatch()`'s heat≥90 branch no longer short-circuits the real investigation trigger.** It used to fine the player and drop heat by 40 *before* `checkInvestigation()` ran, so crossing 90 landed heat back under the guaranteed-investigation threshold (86) while 86-89 correctly triggered it -- inverted risk curve, removed. All heat≥86 consequences now flow through `checkInvestigation()`/`resolveTribunal()` only.
- **Added a real T20 4-overs-per-bowler cap.** New `getBowlersAtOversCap()` reads the existing `match.scorecard[side].bowlers[].balls` tally (no new state) and excludes anyone at 24+ balls from `pickBowler()` and `showBowlerPicker()`, with a thin-squad fallback so a match can still be completed.

Flagged but NOT fixed (design-consistency calls, not exploits): captain bonus is a flat +8% with zero eligibility gating vs. GDD's Captaincy-trait/Leadership-stat model. "Match Fix (Lose)" skips the loyalty check every other favor rolls (bounded by existing cooldown/evidence chance, not a runaway exploit). Regression coverage: `tests/bugfix-2026-08-03.spec.js` "LOGIC FIX" tests; full suite (177 tests total across `smoke`/`comprehensive`/`features-10k`/`p15-visual`/this file) verified green 2026-08-03.
