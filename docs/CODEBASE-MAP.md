# CODEBASE MAP -- prototype/index.html (single file, ~10,150 lines)

> **Purpose: NO agent re-reads this file end-to-end. Grep the function name below, read only that region.**
> Line numbers drift with edits -- function names are the stable anchors. Updated 2026-07-16.

## File layout
| Range | What |
|---|---|
| 1-19 | head/meta |
| 20-2179 | ALL CSS (section comments inside: palette ~L38, angular design ~L100, per-screen grading ~L234, politics zone ~L1408, zone reskins ~L1515, hub monetization ~L1976, drop-rates overlay ~L2010, sponsor break ~L2088) |
| 2195-3072 | ALL markup: screens + overlays. `#match-result` L2862, `#pack-overlay` L2865 (NOTE: shares class `match-result-overlay` -- known collision) |
| 3073-10151 | ALL game JS |

## JS regions (anchor function -> approx line)
| System | Anchors |
|---|---|
| Save/load/analytics | `save` 3131, `trackEvent` 3154, `load` 3491, `exportSaveString` 3520, `cloudBackup` 3569 |
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
