# Balance / Systems Audit — 2026-09-11

Scope: exploits & dominant strategies, difficulty curve, progression walls, pay-to-win, edge cases.
(Economy pricing and cricket authenticity are covered by two parallel agents — deliberately light here.)

**Method.** Every finding below was traced in `prototype/index.html` by reading the actual code. Where a
balance claim is made, it was verified by re-implementing the real functions (`getOVR`, `getTeamStrength`,
`generateRivalXI`, `buildPlayingXI`, `extractBowlers`, `pickBowler`, `calcBallOutcome`, `simBall`'s innings
loop) in a throwaway Monte-Carlo harness seeded from the real `ALL_PLAYERS` table, and running 700–5,000
matches per cell. No game files were modified; no tests, dev server or browser automation were run.
Numbers labelled **MEASURED** come from that harness. Anything not measured is labelled **INFERRED**.

---

## 🔴 Game-breaking / exploitable

### Standard Pack → instant resale is an unbounded coin printer
- **System:** Packs / Transfer Market
- **Location:** `prototype/index.html:11856` (`openPack`), `:11860-11862` (cost), `:11882` (uniform draw), `:12194-12204` (`sellPlayer`), `:12087` (`getPlayerPrice`)
- **What:** A Standard Pack costs **500 coins** and grants **3 cards drawn uniformly at random from every unowned player**. Selling a card pays `round(getPlayerPrice(p) * 0.6)`. The expected payout of a pack far exceeds its price, and the loop is repeatable forever.
- **Evidence:** `getPlayerPrice = (bat*3 + bwl*3 + fld + fit) * rarityMult`. Computed over all 50 rows of `ALL_PLAYERS` (lines 5331–5386): mean price **599** → mean sell **359/card**. A 3-card pack returns **~1,078 coins for 500** (+115%). The *floor* case is also profitable: the cheapest card in the whole table prices at 345 → sells for 207, so three worst-case commons still return **621 > 500**. There is **no losing draw**. Per-rarity mean sell: common 230, uncommon 329, rare 395, epic 529, legendary 875. Cycle: hold squad at 12/15 → `openPack('standard')` (guard is only `squad.length >= maxSquad`, line 11859) → 15/15 → sell 3 (guard is only `squad.length <= 3`, line 12196) → 12/15. Sold cards return to the `avail` pool (line 11857), so the loop never exhausts.
- **Severity:** 🔴 breaks the game / exploitable

### Opponent strength is generated from YOUR squad average — padding the squad with junk wins matches
- **System:** Match engine / rival generation
- **Location:** `prototype/index.html:9120-9141` (`generateRivalXI`), `:9123-9124` (`base = getTeamStrength() + rand`), `:6466-6471` (`getTeamStrength`), `:10213` (`match.oppXI = ... generateRivalXI(...)`)
- **What:** The opposition XI's every stat is derived from `getTeamStrength()`, which is the **mean OVR of the whole 15-man squad — bench included**. Your playing XI comes from `GS.selectedXI` (`buildSelectedXI`, line 10128). The two are decoupled, so adding cheap junk players you never select silently weakens every opponent you face.
- **Evidence:** `base = teamStr + Math.floor(Math.random()*8) - 3`; batters get `bat = min(95, base+v)`, bowlers `bwl = min(95, base+v)` with `v ∈ [-8, +7]`. **MEASURED** (1,500 matches per cell, identical XI in both arms):
  - Elite 11-man squad, teamStr 76 → **85.8% win rate**. Same 11 + 4 junk cards (bat 40/bwl 18/fld 42/fit 48 — the existing `netaNephewCard` statline, line 5425), teamStr drops to 66 → **98.2% win rate**.
  - Mid-tier 15-man squad, teamStr 70 → **78.3%**. Same squad + 4 junk, teamStr 64 → **90.4%**.
  Cost of the exploit: four commons (~350c each at market, or free from the daily Sponsor Pack). It also means a player who diligently fills all 15 slots with good cards gets *harder* opponents than one who stops at 11 — the collection loop is actively punished.
- **Severity:** 🔴 breaks the game / exploitable

### "Contain" field setting is strictly dominant when bowling — free, one tap, no downside
- **System:** Match tactics
- **Location:** `prototype/index.html:9309-9311` (field modifiers), `:10319-10328` (`setFieldSetting`), `:12556-12561` (binding)
- **What:** `fs === 'defensive'` multiplies the batting side's `fourP × 0.75`, `sixP × 0.70`, `dotP × 1.15`, `dblP × 1.20` and `wktP × 0.70`. It is switchable at any moment, unlimited times, for zero cost, with no counter-effect anywhere in the code. Because a 20-over innings almost never reaches 10 wickets, the wicket-rate penalty costs nothing while the boundary suppression is enormous.
- **Evidence:** **MEASURED** (2,000 opponent innings each, FLAT pitch, mid-tier squad, teamStr 70):
  | strategy | field | opp score | opp wkts |
  |---|---|---|---|
  | balanced | standard | **176.1** | 6.30 |
  | balanced | attacking | 172.7 | 7.96 |
  | balanced | **defensive** | **158.1** | 4.41 |
  | defensive | **defensive** | **152.6** | 3.97 |
  Full-match win rate, same squad/XI, 700 matches per cell: naive `balanced/balanced/standard` = **75.7%**; anything with `field=defensive` = **84.1–91.3%**. Every one of the 9 rows with `field=defensive` beat every row without it. "Attacking" buys +1.7 wickets for −3 runs — worthless, because you need 10 wickets and get ~8.
- **Severity:** 🔴 breaks the game / exploitable

### Aggressive batting is STILL strictly dominant — the 2026-08-03 fix changed the mechanism, not the outcome
- **System:** Match tactics
- **Location:** `prototype/index.html:9297-9307` (strategy block), `:9234-9235` (`stratBatMod`/`stratBwlMod`)
- **What:** The fix correctly removed strategy from the `batStr/bwlStr` ratio and re-applied it as an explicit `wktP × 1.10` / boundaries `× 1.15`. But the trade is still one-sided, because a T20 innings is terminated by **overs, not wickets** — you only lose ~4.7 wickets in 20 overs, so a +10% wicket rate is nearly free.
- **Evidence:** **MEASURED**, your batting innings only, 4,000 innings each, FLAT pitch, mid squad, opponent regenerated every innings:
  | strategy | avg score | avg wickets |
  |---|---|---|
  | defensive | 195.1 | 4.22 |
  | balanced | 209.7 | 4.70 |
  | **aggressive** | **222.7** | 5.18 |
  +13.0 runs for +0.48 wickets, in an innings that ends 5.3 wickets short of all-out. Whole-match win rate (700/cell, standard field, balanced bowling): balanced **75.7%**, aggressive **80.7%**, defensive **72.0%**. There is no situation in which balanced or defensive batting is correct. The trade-off GDD 6.2 describes cannot exist while wickets are a non-binding constraint.
- **Severity:** 🔴 exploitable (dominant strategy)

### Clean-streak coin bonus is unbounded and never resets across seasons
- **System:** Economy / match rewards
- **Location:** `prototype/index.html:10891-10896`, `:11770-11771` (`endSeason` reset list)
- **What:** `GS.cleanStreak++` on every non-fixed match; `cleanBonus = GS.cleanStreak * 10` is added to every win. It is reset **only** when a match is fixed (`else { GS.cleanStreak = 0; }`, line 10895). `endSeason()` resets `wins`, `losses`, `seasonStats`, `rivalWins`, `winStreak`, `streakShield` and the whole season pass — but **not** `cleanStreak`.
- **Evidence:** Base win reward is `Math.round(80 * zone.coinMult * fanMod)` (line 10889), i.e. 80–120 coins. By the end of season 1 (14 clean matches) the bonus is already +140/win. At season 5 (~match 70) it is +700/win; at season 14 (~match 196) it is **+1,960/win — 16× the base reward**. There is no cap anywhere. Combined with the rewarded "Sponsor Bonus" ad that *doubles* `coinR` 3×/day (line 11089-11105), late-game coin income is effectively unlimited and the entire coin economy (packs, training, market, the Vault) becomes irrelevant. It also inverts the game's central tension: the clean path becomes vastly richer than the corrupt one, so corruption has no economic pull after ~season 2.
- **Severity:** 🔴 unbounded currency scaling

### Morale is a null stat — it buffs the opponent's batting too
- **System:** Match engine / Facilities
- **Location:** `prototype/index.html:9236` (`moraleMod`), `:9252` (`batStr = ... * moraleMod * ...`), `:10360` (always passed `GS.morale`), `:12646-12650` (150-coin Morale Boost)
- **What:** `moraleMod = 0.9 + morale/500` is applied to `batStr` — the strength of **whoever is currently batting**, with no `isYourBatting` gate. `simBall` passes `GS.morale` for both innings. So raising your morale makes the *opposition* bat better by exactly the same factor when they bat.
- **Evidence:** Compare with the correctly-gated modifiers a few lines below: `match.bhaiCrowd` (line 9271-9274) explicitly does `isYourBatting ? batStr *= 1.10 : batStr *= 0.90`, and `boostBalls` (line 9282-9283) branches on `isYourBatting`. `moraleMod` does neither. **MEASURED** win rate, same squad/XI, 1,200 matches per cell: morale 20 → **80.5%**, morale 50 → 77.2%, morale 75 → 78.2%, morale 100 → 77.6% (SE ≈ 1.2pp — flat, with a slight edge to *low* morale). Every morale mechanic is therefore decorative: the ±5/−3 per match (line 10911), +10 at season end (11772), −10 board inquiry (10965), the Pep Talk, and the **150-coin Morale Boost purchase** (12647), which buys literally nothing.
- **Severity:** 🔴 a whole advertised system does nothing; a coin sink sells a non-effect

---

## 🟡 Unfun / imbalanced

### Fielding (`fld`) does nothing in the match sim but makes your opponents stronger
- **System:** Player stats / training
- **Location:** `prototype/index.html:6440-6443` (`getOVR`), `:9919` (Fielding Camp training option), `:12088` (`getPlayerPrice`)
- **What:** A whole-file grep for `.fld` returns only: the four `getOVR` branches, two display strings, the training menu, and the price formula. It appears **nowhere** in `calcBallOutcome`, `simBall`, catching, run-outs or DRS. Yet it carries **20% of OVR** (35% for a Wicket-Keeper), and OVR feeds `getTeamStrength()` → the generated opponent.
- **Evidence:** So paying `getTrainCost(fld) = 50 + fld*3` coins for "Fielding Camp" spends coins to raise a stat with zero gameplay effect, *and* raises your squad-average OVR, *and* therefore strengthens every future opponent. It is a strictly negative purchase. Magnitude: a squad-wide fld difference of 40 points shifts `getTeamStrength()` by 8 → every opponent batter and bowler gains 8 stat points, ≈11% on a base of ~70, which moves `ratio` and hence `wktP` by ~10%.
- **Severity:** 🟡 (borderline 🔴 — an inverted-sign stat the UI sells as an upgrade)

### Training fitness past 85 unlocks a 3%-per-match doping ban
- **System:** Bans / training
- **Location:** `prototype/index.html:10568-10573` (`rollBanEvents`), `:10540` (`BAN_REASONS.doping`), `:9554` (`rollInjury` chance)
- **What:** `if (p.fit >= 85 && Math.random() < 0.03)` → 3-match ban + 12 heat. The only upside of `fit` is injury chance `(100 - fit)/800`.
- **Evidence:** Raising a player 70 → 85 fit costs ~`50+3*77 ≈ 280` coins/step over ~8 steps ≈ 2,200 coins. Benefit: per-match injury chance 3.75% → 1.875% (≈0.26 fewer injuries over a 14-match season, each 1–3 matches). Cost: a new 3%/match doping risk → `1 - 0.97^14 = 35%` chance of a 3-match ban per season for that one player, plus +12 heat. **INFERRED** (arithmetic from the two formulas, not simulated): net strongly negative. Plus the same `getTeamStrength()` inflation as `fld`.
- **Severity:** 🟡 unfun — a signposted upgrade that makes you worse

### Injuries are ticked down in the same `endMatch()` that creates them
- **System:** Injuries
- **Location:** `prototype/index.html:10983-10984`, `:9571-9584` (`processMatchInjuries`), `:9587-9599` (`processInjuryTick`)
- **What:** `processMatchInjuries()` runs at line 10983 and sets `sp.injured = { matchesLeft: inj.matchesOut }`. `processInjuryTick()` runs on the very next line and decrements **every** injured player, including the ones just created.
- **Evidence:** Of the six injury types (lines 9557-9564), `Shoulder Niggle` and `Groin Pull` have `matches: 1` → decremented to 0 → healed inside the same call, so 33% of injuries are purely cosmetic. Every other injury is one match shorter than the result screen states. With the Physio hired (`hasPhysio ? 2 : 1`, line 9592) even 2-match injuries vanish instantly. The result screen can print "INJURY: X — Groin Pull (1 matches)" and "Recovered: X" simultaneously. Contrast `processBanTick()` at line 10981, which correctly runs *before* `rollBanEvents()` at 10982 — bans are handled right, injuries are not.
- **Severity:** 🟡 imbalanced — the injury system is ~half as punishing as designed, and self-contradicting on screen

### Soft-lock: fewer than 3 *available* players stops the clock permanently
- **System:** Squad select / bans / injuries / debts
- **Location:** `prototype/index.html:9943` (`showSquadSelect` guard), `:10105` (`confirmSquadSelect` guard), `:10146` (`startPreMatch` guard), `:10981` / `:10984` / `:10979` (tick callers)
- **What:** The three entry guards test `GS.squad.length < 3` — the **raw** squad size. The selectable pool excludes `banned || injured || debtHeld` (line 9946/9951). If fewer than 3 players are selectable, `confirmSquadSelect` can never pass its own `sel.length < 3` check, so no match can start. And `processBanTick()`, `processInjuryTick()` and `processDebts()` are called **only from `endMatch()`** — so the ban/injury/debt counters never advance.
- **Evidence:** Reachable state: 4 bans (corruption = 4 matches, doping = 3) plus 2–3 concurrent injuries plus a stage-2 debt hold on a small squad. Escape requires buying/pack-opening new cards, which needs coins and a free squad slot. Worst case — squad at 15/15, coins 0, daily login claimed, both daily ad spots used — the player is locked out until the next local date. `sellPlayer` can free slots (it does not care whether the player is banned), so it is recoverable, but the game gives no hint and the guards never mention availability.
- **Severity:** 🟡 (🔴 if it happens with 0 coins) — hard stop with no in-game explanation

### Going clean with an outstanding mafia debt guarantees a player seizure
- **System:** Debts / alignment
- **Location:** `prototype/index.html:6447-6451` (`getAlignmentZone.bmRate`), `:10897` (`bmR`), `:6547-6561` (debt stage 3), `:6568-6572` (`payDebt`)
- **What:** Debts are denominated in **Black Money only** (`payDebt` checks `GS.blackMoney < d.principal`). Black Money income is `zone.bmRate`, which is `0` for both Clean tiers (alignment ≥ 45) and `10` in the Grey Zone. A player who takes a Budget Injection / Match Fix debt and then reforms has essentially no B$ income at all, while `processDebts()` inflates the principal ×1.2 then ×1.25 and at stage 3 rolls a 50% chance to **permanently seize the highest-OVR player in the squad**.
- **Evidence:** Only non-zone B$ source found in a full-file grep of `blackMoney`: a 15 B$ "politician gift" (line 6747, requires a specific rival personality + relationship + a clean win) and the `grey_win` daily challenge (line 10621), which **requires an active fix**. So the reform path is a trap: the game's headline redemption arc is mechanically punished. Note also that `processAlignDecay` is blocked while debts exist (line 6514), so a debtor cannot even drift back.
- **Severity:** 🟡 unfun — the intended "redemption" path is strictly punished

### `startAuction()` overwrites the purse — sponsor bonus and every purse penalty are dead code
- **System:** Auction / sponsors / tribunal
- **Location:** `prototype/index.html:8836` (`GS.auctionPurse = GS.coins;`), `:11773-11776` (`endSeason` sets purse), `:6481-6493` (`getSponsorForZone`), `:7899` (tribunal −20% purse)
- **What:** `endSeason()` computes `GS.auctionPurse = (2000 + idx*500) + sp.purseBonus`, and `resolveTribunal()`'s SEASON SUSPENSION does `GS.auctionPurse = Math.round(GS.auctionPurse * 0.8)`. Then `startAuction()` unconditionally assigns `GS.auctionPurse = GS.coins`, discarding all of it.
- **Evidence:** Traced: nothing between `endSeason` and `startAuction` reads `GS.auctionPurse` for anything but display. So the sponsor tier spread (`Tata +500` at alignment ≥71 down to `No Sponsor −200`) — the single largest *mechanical* reward for high alignment besides `coinMult` — has **zero effect**, and the harshest tribunal verdict's stated purse penalty is silently voided. Auction spending power is simply `GS.coins`.
- **Severity:** 🟡 an advertised reward ladder that does nothing

### The rewarded "+300 auction purse" ad can drive coin balance negative
- **System:** Rewarded ads / auction
- **Location:** `prototype/index.html:8836-8843` (purse + 300), `:8944` / `:8895` (bid guard is against `auctionPurse`), `:9028` (`GS.coins -= auction.bid`)
- **What:** The ad grants purse, not coins: `GS.auctionPurse = GS.coins; ... GS.auctionPurse += 300;`. Bidding is gated on `newB > GS.auctionPurse`, but `resolveCard()` deducts from **both** `auctionPurse` and `GS.coins`. Spending the full boosted purse therefore leaves `GS.coins` at **−300**.
- **Evidence:** `updateCurrency()` (line 6394) prints the raw value with no clamp, so the HUD shows a negative balance. `affordClass` (line 6647) compares `have < cost`, so nothing crashes, but every coin purchase is blocked until the deficit is earned back. The reward should credit coins, not open an overdraft.
- **Severity:** 🟡 broken state / misleading reward

### The Auto XI has no role quotas — it drops your entire pace attack and can field 1 bowler
- **System:** XI selection / bowling
- **Location:** `prototype/index.html:9107-9116` (`buildPlayingXI`), `:10087-10101` (`autoSelectXI`), `:9951-9952` (first-open pre-select), `:9144-9152` (`extractBowlers`), `:9167-9175` (cap fallback)
- **What:** `buildPlayingXI` sorts by role priority `{TOB:0, WK:1, MOB:2, AR:3, Spin:4, Fast:5}` and takes the first 11. With a 15-man squad the four players cut are **always the last in role order — i.e. your Fast Bowlers**. There is no minimum-bowler rule anywhere. This function is the "Auto" button, the first-open default XI, and the fallback in `buildSelectedXI`.
- **Evidence:** **MEASURED** on a realistic role-balanced 15 (4 TOB / 1 WK / 3 MOB / 2 AR / 2 Spin / 3 Fast): the Auto XI contained **3 usable bowlers** and their real over split in a 20-over innings was **8.0 / 7.0 / 5.0 overs** — the T20 4-over cap added on 2026-08-03 is bypassed in *ordinary* play, not just the documented "thin squad" edge case, because `pickBowler` drops the cap whenever `underCap.length === 0` (line 9175). Win rate cost of using Auto instead of a hand-picked 5-bowler XI, same squad, 1,500 matches each: **81.1% vs 88.5%**. On a batter-heavy squad it degenerates completely: with a top-15-by-OVR squad the Auto XI fielded **one** bowler — a Middle-Order Batter with `bwl: 25` bowling all 20 overs — and win rate collapsed to **6.8%**, with no warning anywhere in the UI.
- **Severity:** 🟡 the default, recommended action is a trap; the 4-over cap is routinely voided

### Premium Contract is self-funding after the first purchase
- **System:** Season pass / monetisation
- **Location:** `prototype/index.html:12961-12976` (`PASS_TIERS`, `PASS_PREMIUM_COST = 150`), `:13072-13080` (`unlockPremiumPass`), `:11771` (reset to `premium:false` each season)
- **What:** Unlocking costs **150 gems** and is wiped every season. The premium track alone pays **120 gems** (10+15+20+25+50) and the free track pays **55** — **175 gems per season** against a 150-gem cost, plus 2,500 premium-track coins.
- **Evidence:** Tier 10 is genuinely reachable on one season: `awardPassXP` (line 12982) gives 50/win +10 clean (+30 daily challenge); 8W/6L clean = 8×60 + 6×35 = **690** of the 700 XP needed, and a single daily challenge closes it. So one 150-gem outlay (≈3 weeks of the daily-login gem drip, see next finding) converts into a permanent, free, renewable +2,500 coins/season. Good news for the "F2P competitive" hard constraint; bad news for the design intent of a repeat-purchase pass.
- **Severity:** 🟡 imbalanced (monetisation, not fairness)

### Daily login dwarfs both gameplay income and the largest IAP
- **System:** Retention / economy / P2W
- **Location:** `prototype/index.html:4732-4740` (`LOGIN_REWARDS`), `:10889` (`coinR`), `:13102-13108` (`IAP_PACKS`)
- **What:** The 7-day cycle pays **200+300+500+600+800+1000+1500 = 4,900 coins and 40 gems per week** for zero play. A match win pays 80–120 coins. The top coin IAP, `Boss Vault`, is 8,000 coins for **₹299**.
- **Evidence:** 4,900 coins/week = 700/day ≈ **7 match wins per day of simply opening the app**. The ₹299 pack equals **~11.5 days of free logins**; the ₹49 pack (1,000 coins) equals ~1.5 days. 40 gems/week means the 150-gem Premium Contract is ~26 free days. Consequence for the **pay-to-win audit**: there is effectively no P2W gap at any tier — but only because purchasing is pointless, not because the curve is balanced. Combined with the rubber-banded opponent (see 🔴 #2) and the unbounded clean-streak bonus, money buys no competitive advantage at all. `BILLING_LIVE = false` (line 13115) is correctly enforced in *both* `requestPurchase` (13164) and `completePurchase` (13182).
- **Severity:** 🟡 monetisation and core-loop value are both undercut

### Rival world-state is never persisted — it silently resets on every reload
- **System:** Rival AI
- **Location:** `prototype/index.html:5389-5399` (`var RIVALS`), `:6756-6762` (`driftRivalAlignments`), `:6796-6797` (`r.banned = true; r.strength -= 10`), `:4556-4560` (`save()` persists `GS` only)
- **What:** `RIVALS` is a module-level array, not part of `GS`. `save()` serialises `GS` alone, and `load()` restores only `GS.rivalData` / `GS.rivalWins` / `GS.rivalIntel`. Every mutation to `RIVALS` — seasonal alignment drift, the −10 strength hit and `banned` flag from `processRivalAI()` scandals — is lost the moment the PWA is reloaded.
- **Evidence:** A rival suspended by a scandal (which blocks `bribeRivalToThrow`, line 6869, and changes the league table at line 8501) is un-suspended by closing and reopening the app. For a mobile PWA where sessions are short, the rival-AI simulation is effectively decorative across sessions.
- **Severity:** 🟡 a persistent-world system that isn't persistent; also a trivial reload exploit

### The pre-match screen advertises a rival strength the match never uses
- **System:** Pre-match UI ↔ match engine contract
- **Location:** `prototype/index.html:10160-10161` (`'STR: ' + rival.strength`), `:9123` (`generateRivalXI` uses `getTeamStrength()`)
- **What:** `#opp-strength` renders the hard-coded `RIVALS[i].strength` (60–74). The actual XI you play is generated from **your own** squad average. The number on screen has no causal relationship to the opponent you face.
- **Evidence:** Traced end to end: `rival.strength` is used only for display (10160, 8298, 8304, 6968), the empire rank (4851), the bribe price (6857), the league-table filler (8501/8755) and the knockout (11304-11307) — never in `generateRivalXI` or `calcBallOutcome`. Two rivals with strengths 60 and 74 produce statistically identical opposition. It also means the *knockout* uses `getTeamStrength()` in the **opposite** direction to the league — padding the squad helps you all season and then hurts you in the cup (line 11304: `str: getTeamStrength()`, `aChance = a.str/(a.str+b.str)`).
- **Severity:** 🟡 the headline pre-match decision input is fiction

### Content cliff: nothing exists past promotion to Champions League
- **System:** Progression / retention
- **Location:** `prototype/index.html:11752-11762` (`endSeason`), `:11768` (climax beat), `:8467` (only season-gated content)
- **What:** `leagueOrder` has four entries. At `idx === 3` the `promoted && idx < 3` branch fails and every subsequent season resolves to `SURVIVED` with a 400-coin bonus. The story climax (`uwClimaxCard`) fires exactly once, on entry to Champions. A file-wide grep for season gating finds only a "Season 3" badge.
- **Evidence:** **MEASURED** progression speed: a realistic season-1 squad (the 9 cheapest cards buyable with the starting 2,000 coins at the real `0.6 × getPlayerPrice` auction floor, teamStr 65) wins **49.8%** on naive tactics and **65.3%** with the dominant tactics above. Promotion needs `wins/14 >= 0.57` = 8 wins. So a player who finds the Contain-field button promotes in season 1, and a naive player promotes by season 2. A mid-tier squad wins 78%, an elite squad 83–89%. **INFERRED:** Champions League is reached around season 3–4, after which there is no league goal, no new content, opponents still scale to your own squad, and coin income has begun snowballing via the clean-streak bonus. That is the churn moment.
- **Severity:** 🟡 progression wall — the endgame is empty at ~season 4

### Forced-loss debt punishment is counted as a player-chosen fix
- **System:** Debts / alignment / heat
- **Location:** `prototype/index.html:6556-6557` (`GS.mafiaBonus = { type: 'forcelose' }`), `:10887` (`wasFix = GS.mafiaBonus !== null`)
- **What:** When a stage-3 debt imposes an auto-loss, it does so by setting `GS.mafiaBonus`. `endMatch` then treats the match as player-initiated corruption: `rawAlignC -= 2`, `GS.heat += 5`, `fanC -= 5`, `GS.cleanStreak = 0`, and the "Corruption Report" panel is shown.
- **Evidence:** Lines 10899-10906 and 10892-10895 all branch on `wasFix`. So the mafia's punishment is charged to the player a second time, including resetting a clean streak the player never broke.
- **Severity:** 🟡 feel-bad double punishment

### `GS.matchesPlayed` does not exist — pre-match header reads "Match NaN"
- **System:** Pre-match UI
- **Location:** `prototype/index.html:10157`
- **What:** `$('pm-season').textContent = 'Season ' + GS.season + ' — Match ' + (GS.matchesPlayed + 1);` — `matchesPlayed` appears **exactly once** in the whole file (this line). It is not in the `GS` initialiser (line 4501-4544) and is never assigned.
- **Evidence:** `undefined + 1` → `NaN`. The pre-match screen renders `Season 1 — Match NaN` on every single match of the game. The correct field is `GS.matchNum` (used everywhere else, e.g. line 10204).
- **Severity:** 🟡 (trivial fix, but it is on the most-seen screen in the game)

---

## 🟢 Tuning nits

### Failed rival bribes are free and unlimited
- **Location:** `prototype/index.html:6882-6893` — the `GS.blackMoney -= cost` on line 6893 sits **after** the failure branch returns. A refused approach costs only heat (+4 to +12) and relationship, and there is no per-match cooldown (`if (GS.mafiaBonus) return` only blocks after a *success*). Against a `shark` (85% accept) it is irrelevant; against a `purist` (4%) a player can spam approaches until heat forces an investigation. Bounded by the heat system, so not runaway. 🟢

### Declining a mafia offer is a free, repeatable +3 alignment
- **Location:** `prototype/index.html:12071-12078` — `applyAlignShift(3)` with no cost but −4 syndicate relationship. Mafia offers fire after ~70% of matches in the Grey Zone (line 11149). That is a faster alignment climb than winning matches (+2, line 10899), and it is self-limiting only because `mafiaAccess` ends at alignment 45. 🟢

### Charity buys alignment at a price that collapses as the clean streak inflates
- **Location:** `prototype/index.html:11081-11113` — `charityAmount = round(coinR * 0.2)` for `+5 alignment, +3 morale, +2 fans`. Because `coinR` includes the unbounded clean-streak bonus, the *relative* price is constant but the *absolute* value of +5 alignment for 20% of one match's coins becomes trivial once income snowballs. Fix the clean streak and this is fine. 🟢

### `skipMatch` is marginally stronger than watching
- **Location:** `prototype/index.html:10796-10804` vs `:10732` — `switchInnings()` resets `match.fieldSetting = 'standard'` at the innings break; `skipMatch`'s inline innings switch does not. So a player who sets Contain and then skips keeps it through both innings, while a player who watches must re-tap. `skipMatch` also never updates `match.lastBowler` (contrast line 10355), so the consecutive-over guard in `pickBowler` misbehaves in skip mode. 🟢

### Academy graduate IDs can collide
- **Location:** `prototype/index.html:11507` — `id: 900 + Date.now()%1000 + i` gives a 1,000-value space with no uniqueness check. Two graduates colliding would make `GS.squad.find(p => p.id === id)` (used by training, selling, XI selection, captaincy) silently operate on the wrong player. Low probability, high blast radius. 🟢

### Daily login trusts the local device date
- **Location:** `prototype/index.html:4741-4745` (`_todayStr` uses `new Date()`), `:4809-4821` — the streak and the 4,900-coin weekly cycle can be farmed by changing the device clock. Unavoidable in a local-only PWA and consistent with the ₹0-infra rule; noting for completeness. 🟢

---

## Confirmed healthy

Checked specifically, found sound:

- **Auction floor vs. resale — the 2026-08-03 coin-farm fix holds.** `showNextCard` floor is `max(20, round(getPlayerPrice(p) * 0.6))` (line 8868) and `sellPlayer` pays `round(getPlayerPrice(p) * 0.6)` (line 12198) — an *uncontested* win flips at exactly break-even, and any AI bid makes it a loss. Verified the AI ceiling (`baseMax × bidMult`, max 1.8, line 8927-8928) still contests real cards at those floors.
- **Transfer-market round trip is correctly lossy.** Buy at `getPlayerPrice` (line 12178), sell at 0.6× — a flat −40%. No arbitrage.
- **Training is a pure sink, not a value pump.** `getTrainCost = 50 + stat*3` (8116) vs. resale gain of `0.6 × 3 × gain × rarityMult` ≤ 4.5/point. At stat 50 a 200-coin training returns ≤ 6.75 coins of sell value. Verified no buy-train-flip loop exists.
- **No Black-Money → coins laundering.** Full-file grep of `blackMoney`: the two currencies never convert. Debts, favours, bribes and staff are B$-only; `computeNetWorth` mixes them for display only (4842).
- **`pickBowler`'s locked-lineup branch (2026-09-11 fix) is correct.** Re-read line 9187-9207: it now filters by the cap map *and* `lastBowler`, then picks fewest-balls-bowled with lineup order as the tie-break. It genuinely rotates the whole lineup and cannot exceed 24 balls while a legal alternative exists. (The *fallback* at line 9175 is the remaining hole — see the Auto-XI finding.)
- **Short XIs are a penalty, not an exploit.** I specifically tested whether stacking a tiny XI of elite players beats a full 11 (because `batIdx = Math.min(cWkts, batXI.length - 1)` lets the last man bat repeatedly, line 10344). **MEASURED**, mid squad: XI of 3 → **31.7%**, 4 → 42.2%, 5 → 48.9%, 6 → 61.7%, 7 → 68.4%, 8 → 66.3%, 11 → **76.1%**. Full 11 is correctly optimal.
- **Rewarded-ad caps are enforced correctly.** `AD_CAPS = {purse:1, pack:1, boost:3}` (13228), reset on local-date change (13231), and the spot is consumed on **claim**, not on ad start (13265) — aborting costs nothing, and both entry points to the daily pack share one boolean (13276-13288).
- **IAP kill-switch is defence-in-depth.** `BILLING_LIVE = false` is checked in `requestPurchase` (13164) *and* again in `completePurchase` (13182) before any currency is granted.
- **Promotion / relegation thresholds are reachable and avoidable.** `wins/14 >= 0.57` → 8 wins; `< 0.29` → ≤4 wins (5 wins = 0.357 is safe). Against measured win rates of 50% (season 1) to 89% (optimised elite squad), both outcomes are live and neither is forced.
- **Season Pass tier 10 is reachable free in one season.** 8W/6L clean = 690 XP of the 700 needed; one daily challenge (+30) closes it. Free track pays 1,200 coins + 55 gems.
- **Squad-select constraints are enforced.** `confirmSquadSelect` (10103-10126): 3–11 players, max 4 overseas, captaincy gated on the `captaincy` trait with a clean `captainId = null` fallback (so `capBatMod`/`capBwlMod` default to 1.0 and never crash on legacy saves).
- **Debt stage-2 "held player" restriction holds.** `p.debtHeld` is set on the real squad object (6543) and filtered in `showSquadSelect` (9946), the auto pre-select (9951) and `autoSelectXI` (10089); cleared in `payDebt` (6576-6582).
- **Bans tick in the right order** — `processBanTick()` at 10981 runs *before* `rollBanEvents()` at 10982, so a newly-issued ban isn't immediately decremented. (The injury pair does the opposite; see the 🟡 finding.)
- **Save durability fixes hold.** `resolveCard` saves each won card (9032) and `endMatch` saves immediately after all consequences are computed (10993), not only inside the button handlers.
- **`simKnockoutMatch` is symmetric.** Line 11321-11324 now applies the +5%/75%-cap player bonus in both bracket slots.
- **Alignment inertia works as designed.** `applyAlignShift` (6496-6505) scales raw shifts by `1 + 0.5*max(0,(|align|-30)/70)`, so extreme positions are genuinely sticky; `processAlignDecay` correctly blocks on all three GDD conditions (debts / heat>30 / investigation, line 6514).
- **Max-debt and syndicate cut-off guards exist.** `showMafiaOffer` refuses at 5 debts, under investigation, or when the syndicate has marked you (11951-11956).
- **Zero-coin state does not crash.** With `GS.coins = 0`, `startAuction` sets purse 0, `updateBidUI` disables the bid button, all twelve cards sell to AI, `endAuction` gives the correct "claim daily coins & open a pack" nudge (9047-9048).

---

## If only one thing can be fixed

**Kill the Standard Pack → resale loop** (`openPack` at `:11856` / `sellPlayer` at `:12194`).

It is the cheapest fix and has the largest blast radius: 500 coins reliably returns 621–1,458 coins with a
guaranteed profit floor, repeatable in a ~4-tap cycle, which simultaneously voids the coin economy, the
Vault, the gacha, the auction and every progression gate that spends coins. The obvious fix is to price the
sell value of a *pack-acquired* card below the pack's per-card cost — e.g. drop the market payout to
`0.25 × getPlayerPrice` for cards not bought at auction, or raise the Standard Pack to a price above 3×
mean card value (~1,100 coins), or simply block selling a card within N matches of acquiring it.

**But the deepest problem is not a one-liner:** `generateRivalXI()` deriving opposition strength from
`getTeamStrength()` (`:9123`). That single line produces the squad-padding exploit, makes the advertised
`rival.strength` fiction, punishes collection, and pulls in the opposite direction to the knockout bracket.
Fixing it is a design decision (use `RIVALS[i].strength` scaled by league tier? scale off the *selected XI*
rather than the bench-inclusive squad average?), not a patch — so it needs a founder call, and it should be
the next thing after the pack loop.
