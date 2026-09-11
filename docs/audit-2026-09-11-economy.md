# Economy Audit — Cricket Underworld (2026-09-11)

Scope: currency-flow integrity, purchase honesty, black-money economy, monetization design,
F2P-vs-spender pacing, anti-inflation. Balance-math and cricket-authenticity are covered by two
parallel agents and are deliberately not duplicated here.

**Method:** every claim below was traced by reading the actual handler in
`prototype/index.html`. Card-pool figures were computed from the real `ALL_PLAYERS` array
(lines 5330–5386, 50 cards) with the real `getPlayerPrice()` formula, not estimated.
Findings are labelled VERIFIED (read in code) or INFERRED (reasoned from verified code).

---

## Reference numbers computed from the real card pool

`getPlayerPrice(p) = round((bat*3 + bwl*3 + fld + fit) * rarityMult)`, `prototype/index.html:12087`
rarityMult = common 1 · uncommon 1.3 · rare 1.6 · epic 2.0 · legendary 2.5

| Rarity | Count (of 50) | Avg price | Min | Max |
|---|---|---|---|---|
| common | 13 (26%) | 384 | 345 | 459 |
| uncommon | 16 (32%) | 548 | 460 | 688 |
| rare | 13 (26%) | 659 | 565 | 851 |
| epic | 7 (14%) | 881 | 768 | 1126 |
| legendary | 1 (2%) | 1458 | 1458 | 1458 |
| **all** | **50** | **599** | 345 | 1458 |

Market sell price = `0.6 × getPlayerPrice` (`:12198`) → pool average **359 coins per card**.

---

# FINDINGS

### Standard pack is an unbounded coin printer (open → sell → repeat)
- **System:** Packs / Transfer Market
- **Location:** `prototype/index.html:11856` (`openPack`), `prototype/index.html:12194` (`sellPlayer`)
- **What:** A 500-coin Standard Pack yields 3 cards whose *instant resale value* averages
  **1,124 coins**. Selling all three and re-opening is a repeatable, uncapped +624 coins per
  cycle — 125% ROI, no cooldown, no cost beyond taps.
- **Evidence:** VERIFIED. `openPack('standard')` deducts 500 (`:11862`), draws 3 cards; cards 1–2 are
  uniform over the unowned pool (avg price 599), card 3 is forced to `RARITIES.indexOf >= 1`
  i.e. uncommon-or-better (`:11874`, `:11879`), whose sub-pool (37 cards) averages 675.
  Pack expected market value = 599 + 599 + 675 = **1,873**; `sellPlayer()` pays
  `round(getPlayerPrice(p) * 0.6)` = **1,124**. Net **+624 per 500 spent**.
  The loop is legal at any squad size 4–12: `openPack` only requires `GS.squad.length < GS.maxSquad`
  (`:11859`), `sellPlayer` only requires `GS.squad.length > 3` (`:12197`), and `avail` stays large
  (50 cards in pool, max 15 ownable).
  The 2026-08-03 logic audit closed exactly this exploit for the **auction** (floor moved to
  `0.6 × getPlayerPrice` so a win breaks even — comment at `:8859`) but never checked the pack,
  which sells the same goods at a flat 500.
- **Consequence:** every coin sink in the game is nullified, and all three coin IAP tiers
  (₹49 / ₹129 / ₹299, `:13103`–`:13105`) are worthless the moment a player finds this.
- **Severity:** 🔴 broken economy

### Free Sponsor Pack is a second, ad-gated coin faucet worth ~719 coins/day
- **System:** Rewarded ads / Packs
- **Location:** `prototype/index.html:13291` (`pack-ad-btn`), `prototype/index.html:11864`
- **What:** The 1/day rewarded-ad pack calls `openPack('ad')` — 2 cards, **free**, last card forced
  uncommon-or-better. Flipped in the market that is ~719 coins/day for a 3-second stub ad.
- **Evidence:** VERIFIED. `count = type === 'ad' ? 2` (`:11864`), no currency deduction for `'ad'`
  (`:11862` only charges standard/premium). 2 cards' resale = 0.6 × (599 + 675) = 764; conservatively
  ~719 using pool average. For comparison a **match win pays 80 coins** (`:10889`). One free ad pack
  = ~9 match wins.
- **Severity:** 🔴 (same root cause as above — packs are priced far below resale)

### `media_contact` (60 B$ Fixer) is purchasable and does literally nothing
- **System:** Staff / Fixers
- **Location:** `prototype/index.html:9613` (definition), `prototype/index.html:9655` (purchase handler)
- **What:** "Media Contact — Block 1 negative social post. Cooldown: 3 matches." Costs 60 black money,
  deducts it, marks the row HIRED, and there is **no other reference to `media_contact` anywhere in
  the file**. No social-post blocking exists.
- **Evidence:** VERIFIED. `grep -n "media_contact" index.html` returns exactly one line — `:9613`,
  the `STAFF_TYPES` entry itself. `generateSocialPosts()` (`:11434`) never consults `GS.staff`.
  Every other fixer *is* wired: `pr_manager` `:9691`, `cleaner` `:9694`, `lawyer` `:7867`,
  `inside_man` `:7080`, `bagman` `:10898`.
- **This is the exact scout-bug pattern** the UI pass just closed, still live in the Fixers tab.
- **Severity:** 🔴 dishonest purchase

### Academy graduates are silently deleted when the squad is full — and still reported as delivered
- **System:** Academy
- **Location:** `prototype/index.html:11516` (`processAcademySlots`), `prototype/index.html:11806` (`endSeason` render)
- **What:** `if (GS.squad.length < GS.maxSquad) GS.squad.push(card);` — but `graduated.push(card)` runs
  **unconditionally** on the next line. `endSeason()` then renders
  `"Academy Grad — <name> (<role>)"` on the season-end screen for a card that was never added.
  The player paid 300 coins (`:11564`) and waited 2–3 seasons for a graduate that does not exist.
- **Evidence:** VERIFIED, lines as cited. No toast, no warning, no refund, no "squad full" branch.
- **Severity:** 🔴 dishonest purchase

### The rewarded "+300 auction purse" ad can push coins negative
- **System:** Rewarded ads / Auction
- **Location:** `prototype/index.html:8836`–`8838` (`startAuction`), `prototype/index.html:9028` (`resolveCard`)
- **What:** `GS.auctionPurse = GS.coins;` then `GS.auctionPurse += 300;` — purse is an alias for coins,
  but the boost inflates only the alias. `resolveCard()` then does
  `GS.auctionPurse -= auction.bid; GS.coins -= auction.bid;` with **no clamp**, so spending the boosted
  purse drives `GS.coins` to as low as **−300**.
- **Evidence:** VERIFIED. Bid gating reads the purse only (`:8895` `canBid`, `:8944`), never coins.
  No `Math.max(0, …)` anywhere on `GS.coins`. `updateCurrency()` (`:6394`) prints the raw value,
  so the top bar will read "-300". Negative coins then block every `GS.coins < cost` gate in the
  game until earned back. `computeNetWorth()` (`:4841`) also consumes the negative directly.
- **Severity:** 🔴 a reward that can put the player in debt

### Every season-purse rule in the game is dead code
- **System:** Season / Sponsors / Tribunal / Auction
- **Location:** `prototype/index.html:8836` vs `:11776`, `:7899`, `:6483`–`:6487`, `:8314`
- **What:** `startAuction()` unconditionally overwrites `GS.auctionPurse = GS.coins`, destroying:
  1. `endSeason()`'s league-scaled purse `basePurse = 2000 + idx*500` (`:11773`, `:11776`);
  2. the entire **sponsor `purseBonus`** ladder (Tata +500 / Dream11 +300 / Ceat +100 /
     Gutka King 0 / No Sponsor **−200**, `:6483`–`:6487`) — the headline reward for playing clean;
  3. the tribunal SEASON SUSPENSION penalty `GS.auctionPurse = round(purse * 0.8)` (`:7899`).
  The season-end screen advertises the purse figure (`:11825`) and the Hub tile prints it
  (`:8314`) — both are numbers that will never be used.
- **Evidence:** VERIFIED. `GS.auctionPurse` appears at 11 sites; the only write ordered *after*
  `endSeason`/`resolveTribunal` in the play sequence is `:8836`. `:8838` (+300 ad) is the sole
  surviving modifier because it runs after the overwrite.
- **Severity:** 🔴 (the alignment system's main *economic* payoff is unimplemented)

### Daily login pays ~7× more than actually playing the game
- **System:** Daily login vs match rewards
- **Location:** `prototype/index.html:4732`–`4739` (`LOGIN_REWARDS`), `prototype/index.html:10889` (`endMatch`)
- **What:** The 7-day cycle pays 200/300/500/600/800/1000/**1500** = **4,900 coins/week, passive**.
  A match win pays `round(80 × zoneMult × fanMod)` = **80 coins** in Grey Zone at 50 fan loyalty.
  A loss pays a flat **30**. Day 7 alone = 18.75 match wins.
- **Evidence:** VERIFIED. Over a 14-match season played one match/day: login = **9,800**; all
  match-derived coin income (wins 640 + losses 180 + clean-streak ~480 + daily challenges ~770
  + streak milestones ≤1,000 + free pass 1,200 + season bonus 100 + knockout 300) ≈ **4,670**.
  Passive income is **~68%** of total coin inflow. Note also that the loss payout (30) ignores
  `zone.coinMult` and `fanMod` entirely, so a Clean Hero (1.25×) gains nothing on losses while a
  Deep Corrupt (0.75×) loses nothing — the alignment multiplier only bites on wins.
- **Consequence:** the optimal play pattern is "open app, claim, close". Retention metrics will
  look healthy while session depth collapses.
- **Severity:** 🔴 the core loop is not the earning loop

### Premium Contract nearly pays for itself in gems — forever
- **System:** Season pass
- **Location:** `prototype/index.html:12964` (`PASS_PREMIUM_COST = 150`), `:12965`–`:12975` (`PASS_TIERS`)
- **What:** The premium track returns **120 gems** (10+15+20+25+50) plus 2,500 coins for a
  **150 gem** unlock. Net cost of a full season of premium = **30 gems**. Daily login alone pays
  **40 gems/week** (days 3/5/7 = 5+10+25, `:4735`/`:4737`/`:4739`), and the *free* pass track pays
  another 55 gems/season.
- **Evidence:** VERIFIED. `endSeason()` resets `GS.seasonPass` (`:11771`) so it must be re-bought
  each season — but a 14-day season yields ~80 gems from login + 55 from the free track = 135,
  against a 30-gem net cost. After the first unlock the premium pass is **permanently
  self-funding** without ever spending money, which is precisely what the parallel ₹199 SKU
  (`:13109`) is meant to sell.
- **Severity:** 🔴 the premium monetization anchor has no economic floor

### The ₹199 Premium Contract SKU is strictly dominated by the ₹199 gem pack
- **System:** IAP pricing
- **Location:** `prototype/index.html:13102`–`13109` (`IAP_PACKS`)
- **What:** Premium Contract = ₹199. Gem Case = 300 gems for ₹199 (`:13107`). The pass costs 150 gems
  (`:12964`). A player who buys the Gem Case gets the **same pass plus 150 gems left over**, for the
  same ₹199. There is no reason to ever tap the pass card.
- **Evidence:** VERIFIED from the two constants. Both routes are wired: `requestPurchase('pass_premium')`
  (`:13216`) and `unlockPremiumPass()` (`:13072`).
- **Severity:** 🟡 unclear value / self-cannibalizing SKU

### Coin IAP tiers are ~6× worse value than gem tiers once gems are converted
- **System:** IAP pricing
- **Location:** `prototype/index.html:13102`–`13108`
- **What:** Coins: ₹49→1,000 (20.4 c/₹), ₹129→3,000 (23.3), ₹299→8,000 (26.8).
  Gems: ₹79→100 (1.27 g/₹), ₹199→300 (1.51), ₹449→800 (1.78).
  A Premium Pack costs 15 gems for 5 cards = ~1,898 coins of resale value → **~126 coins per gem**.
  At 1.78 gems/₹ that is **~225 coins/₹** vs 26.8 coins/₹ from the coin tier.
- **Evidence:** INFERRED from VERIFIED numbers — the conversion rate depends on the pack-flip
  exploit above. If the flip is closed, this collapses too; if it is not, the coin SKUs are dead.
- **Severity:** 🟡 (becomes 🟢 once the pack exploit is fixed)

### Two staff effect descriptions do not describe what the code does
- **System:** Staff
- **Location:** `prototype/index.html:9606`–`9609`, `:8128`, `:9720`/`:9736`
- **What:**
  - `batting_coach` / `bowling_coach` advertise **"+5% BAT/BWL training gains"**. The code does
    `gain++` (`:8128`–`:8129`, `:8144`–`:8145`) on a base gain of `1 + floor(random*2)` = 1 or 2.
    That is **+50% to +100%**, not +5%. Strongly in the player's favour, but the label is wrong by an
    order of magnitude, so nobody can price the 400-coin hire.
  - `analyst` advertises **"Better scout intel, rival preview"**. The code gives a flat **50% discount
    on all scout costs** (`:9724`, `:9736`) and nothing else — no better intel, no rival preview.
    Scouting output is byte-identical with or without the analyst.
- **Evidence:** VERIFIED by exhaustive grep of `GS.staff.<id>`; `analyst` appears only at `:9720`/`:9736`.
- **Severity:** 🟡 (real effects exist and are good value — but they are not the advertised ones)

### "Release" always pays less than "Sell", and Release is the more prominent button
- **System:** Squad / Transfer Market
- **Location:** `prototype/index.html:8106` (release refund) vs `prototype/index.html:12198` (sell price)
- **What:** Release refunds `round(bat*2 + bwl*1.5)`. Selling the same card pays
  `round(getPlayerPrice(p) * 0.6)`. The two formulas are unrelated, and **Sell wins in every case in
  the shipped pool**. Release sits on the player-detail overlay (one tap from any card); Sell is two
  navigations deep (Hub → Market → Sell tab).
- **Evidence:** VERIFIED. Worked example — `Rajesh Sharma` (id 1, epic, bat 87 / bwl 12 / fld 65 / fit 78):
  Release = 174 + 18 = **192**. Sell = 0.6 × (261+36+65+78) × 2.0 = **528**. A 2.75× penalty for
  tapping the nearer button. Checked across archetypes (pure batter, pure bowler, low-rarity):
  Sell dominates in all of them because Release ignores `fld`, `fit` and rarity entirely.
- **Severity:** 🟡 value trap

### Published gacha rates drift from real rates as the collection fills, and are never re-derived
- **System:** Drop-rates page (Google Play compliance surface)
- **Location:** `prototype/index.html:13305` (`poolRarityPct`), `prototype/index.html:11857` (`openPack`)
- **What:** `poolRarityPct()` computes percentages over the **entire** `ALL_PLAYERS` array (50 cards).
  `openPack()` draws from `avail` = **unowned cards only**. With exactly **one legendary in the game**,
  a player who owns it still sees a published **2.0% legendary rate** while the true rate is **0%**.
  The same drift applies to every rarity as the squad fills (up to 15 of 50 cards removed).
- **Evidence:** VERIFIED. `poolRarityPct` iterates `ALL_PLAYERS` unfiltered (`:13307`); `openPack`
  filters by ownership (`:11857`) and re-filters `avail` after each draw (`:11885`).
  Real pool: 13/16/13/7/1 → 26% / 32% / 26% / 14% / 2%.
- **Note:** the guaranteed-floor divergence *is* disclosed ("Final card guaranteed Uncommon or better",
  `:13301`), so that part is honest. The ownership exclusion is not disclosed anywhere.
- **Severity:** 🟡 (Play policy requires published rates to be accurate; a 2%→0% gap is the awkward case)

### The auction can never offer a common or uncommon card
- **System:** Auction
- **Location:** `prototype/index.html:8829`–`8830`
- **What:** `avail.sort(rarity DESC)` then `.slice(0, 12)` — the auction pool is always the **12 rarest
  unowned cards**. With 21 rare-or-better cards in the game and a squad cap of 15, the 29
  common/uncommon cards (58% of the pool) can never reach an auction. The subsequent
  `sort(getPlayerPrice ASC)` (`:8834`) only reorders those same 12, so the "budget lots first" comment
  (`:8831`) means "the cheapest of the twelve most expensive".
- **Evidence:** VERIFIED. Cheapest possible auction lot is therefore a rare at floor
  `0.6 × 565` = **339 coins**; typical lots run 461–875.
- **Severity:** 🟡 (a whole tier of the collection is auction-invisible; also makes the day-1
  purse feel tighter than the design intends)

### Season-pass free track: completable, but only just — and worth less than 4 days of logging in
- **System:** Season pass
- **Location:** `prototype/index.html:12962`–`12991`
- **What:** Tier 10 needs `10 × 70 = 700 XP`. XP = 50 win / 25 loss, +10 if clean, +30 daily challenge,
  **×0.5 in Blitz** (`:12985`).
- **Evidence:** VERIFIED arithmetic. All-clean 14 matches: 9W/5L = 540 + 175 = **715 XP** (completes);
  **8W/6L = 480 + 210 = 690 XP — misses tier 10 by 10 XP** without at least one daily challenge.
  All-loss = 490 (tier 7). So "completable in 14 matches" holds only at a >57% win rate or with
  challenge support. Total free-track value = **1,200 coins + 55 gems** for a whole season —
  less than four days of daily login (200+300+500+600 = 1,600).
  Surplus XP is discarded (`Math.min` cap at `:12988`), so the last matches of a good season pay no
  pass progress at all.
- **Severity:** 🟡 imbalanced — the retention centrepiece is out-earned by the passive faucet

### Black money is well-gated at the top but structurally unavailable to clean players
- **System:** Black money
- **Location:** `prototype/index.html:6447`–`6451` (`getAlignmentZone`), `:10897`, `:11962`–`:11968`
- **What:** `bmRate` is **0** for Clean (align ≥ 45) and Clean Hero (≥ 71). Match B$ income is
  0 / 0 / 10 / 25 / 50 per win by zone (half on a loss, `:10897`). Starting stock is 30 B$ (`:4502`).
  Every other meaningful B$ source is itself a corrupt act. A player who commits to the clean path
  therefore permanently loses access to the entire Fixers tab (60–150 B$ each) and to
  `bhai` pitch-prep (110 B$) — with no clean-side equivalent purchasable at all.
- **Evidence:** VERIFIED. B$ sources: `:10910` match, `:6747` +15 rival gift, `:7324` event payout,
  `:10647` `grey_win` challenge (+20, 1 of 8 challenges), `:12035` matchfixlose +300,
  `:11707`/`:11741` one-time Reckoning +500/+200. Sinks: `:6572` debts, `:6893` rival bribe
  (150 + rival.strength ≈ 200–250), `:7104` inspector bribe (200 or 450, ×1.6 when late — `:7103`),
  `:7748` bhai favour, `:9661` fixer hires, `:12013` favour cost.
- **Balance check (VERIFIED, favourable):** favour *costs* scale down with corruption
  (`priceMod = 0.7 … 1.5 × syndicateTier 0.85 … 1.5`, `:11959`) but the **debts they create are not
  discounted** (`offer.debt` is never multiplied — only `offer.cost` is, `:11982`), and debts
  escalate ×1.2 then ×1.25 on default (`:6533`, `:6537`). That is a genuinely well-shaped sink:
  a Deep Corrupt / Made Man player pays 18 B$ for a Match Fix but still owes the full 150 B$ debt.
  This part of the economy is the healthiest thing in the audit.
- **Severity:** 🟡 (clean-path dead end, not a broken sink)

### "Match Fix (Lose)" pays 300 B$ up front with no clawback if you win anyway
- **System:** Mafia favours / black money
- **Location:** `prototype/index.html:11966`, `prototype/index.html:12034`–`12036`, `prototype/index.html:9258`
- **What:** Cost 0 B$, debt 0, pays **+300 B$ immediately on acceptance**. The only enforcement is a
  45% strength debuff during the match (`:9259`–`:9260`); winning regardless keeps both the 300 B$
  *and* the win rewards. Bounded only by `mafiaFixLoseCooldown = 5` (`:12036`).
- **Evidence:** VERIFIED. Over a 14-match season ≈ 3 uses = **900 B$** — roughly 60% of a Deep
  Corrupt player's entire season B$ income (14 matches at 50/25 ≈ 550, +15% with Bagman ≈ 632).
- **Severity:** 🟡 (heat +18 and alignment −8 per use are real costs, so not a runaway — but it is
  the single largest B$ faucet and it is outcome-independent)

### Hub auction tile shows a stale purse figure
- **System:** Hub
- **Location:** `prototype/index.html:8314`
- **What:** `"N slots open · <formatCompactCoins(GS.auctionPurse)> purse"` renders whatever
  `GS.auctionPurse` was left at when the last auction ended — typically near 0 after a spending spree —
  while the purse you will *actually* get is `GS.coins` at the moment you tap in (`:8836`).
- **Evidence:** VERIFIED. Nothing between `resolveCard()`'s decrement and the next `startAuction()`
  refreshes `GS.auctionPurse`, and it is persisted in the save (`save()` serializes all of `GS`).
- **Severity:** 🟡 (a purchase-decision number that is wrong by an arbitrary amount)

### Academy Graduate bypasses the 15-player squad cap
- **System:** Season end / Academy
- **Location:** `prototype/index.html:11793`
- **What:** `GS.squad.push(academyCard);` with **no `maxSquad` check** (unlike `processAcademySlots`
  at `:11516`, which does check). A player at alignment ≥ 60 (`:7920`) can end a season at 16 players.
- **Evidence:** VERIFIED. The cap gates pack-opening (`:11859`), auction bidding (`:8895`, `:8944`)
  and market buys (`:12183`), so exceeding it silently locks those three systems until the player
  sells down — with no explanation.
- **Severity:** 🟡

### "Weakness Analysis" (300C) only works while you are bowling
- **System:** Scouting
- **Location:** `prototype/index.html:9716`, `prototype/index.html:9279`
- **What:** Advertised as "Find rival's weakest link (**+10% vs them**)". Implemented as
  `if (… && !isYourBatting) bwlStr *= 1.10` — a bowling-only buff. Half the match gets nothing.
- **Evidence:** VERIFIED, both lines. The effect *is* persistent and real (`GS.scoutWeakness` set at
  `:9795`, cleared at `:10925`) — the description just overstates its coverage.
- **Severity:** 🟢 tuning/copy nit

### "Brand Campaign" sponsor event pays a lump sum, not a per-match stipend
- **System:** Sponsor events
- **Location:** `prototype/index.html:7024`
- **What:** Reward text reads "+50 coins/match for 3 matches"; `apply()` is `GS.coins += 150` once.
  The total is identical, but the player is told to expect income across their next three matches
  and will not see it.
- **Evidence:** VERIFIED, single line.
- **Severity:** 🟢 copy nit

### Nothing to spend coins on at squad-max
- **System:** Late-game sinks
- **Location:** `prototype/index.html:11859`, `:8895`, `:12183`
- **What:** At 15/15 squad, the three largest coin sinks all hard-block: packs ("Squad full — release a
  player first"), auction bidding (`canBid` requires `squad.length < maxSquad`), and market buys.
  What remains: training (200–520 per +1–2 stat), five one-off staff hires (300–500, permanent),
  scouting (100–300/match), pep talk (150/match), media bribe (300), academy (300), market refresh (100).
- **Evidence:** VERIFIED gates, as cited. INFERRED consequence: an endgame player's only repeatable
  sink is training, at ~275 coins for +1–2 points on a 99-capped stat — against a passive income of
  4,900/week. Coins become a meaningless number well before the collection is complete.
- **Severity:** 🟡 no terminal sink

---

## Currency source / sink table

Model: one 14-match season, Grey Zone (`coinMult 1.0`, `bmRate 10`), fan loyalty 50 (`fanMod 1.0`),
8W/6L, never fixing, one match per day (14 days). All figures traced to the cited lines.

### COINS — sources

| Source | Line | Per event | Per season |
|---|---|---|---|
| Match win | `:10889` | `round(80 × coinMult × fanMod)` = 80 | 640 |
| Match loss | `:10889` | flat **30** (ignores both multipliers) | 180 |
| Clean-streak bonus | `:10894` | `cleanStreak × 10` on wins, streak ≥ 3 | ~480 |
| **Daily login** | `:4732` | 200/300/500/600/800/1000/**1500** | **9,800** (2 cycles) |
| Daily challenge | `:10615` | 80–150 (7 of 8 are coins) | ~770 |
| Win-streak milestones | `:10654` | 50 / 150 / 300 / 500 at 3/5/7/10 | ≤ 1,000 |
| Season pass — free track | `:12966` | 100+150+250+300+400 | 1,200 |
| Season pass — premium track | `:12966` | 250+350+500+600+800 | 2,500 (costs 150 gems) |
| Season-end bonus | `:11759` | survived `100×(idx+1)` / promoted `200×(idx+2)` | 100–800 |
| Fan Vote award | `:11780` | 200 (align>30 & loyalty≥60) | 200 |
| Knockout title | `:11401` | `300 × (leagueIdx+1)` | 300–1,200 |
| Rewarded "Sponsor Bonus" ad | `:11099` | doubles `coinR` (~80), cap 3/day | ~1,120 |
| Free Sponsor Pack (ad) | `:13293` | 2 cards ≈ **719** resale, 1/day | **~10,066 if flipped** |
| Mafia "Budget Injection" | `:12025` | +500 (creates 200 B$ debt) | 500 |
| Sponsor events | `:7023` | 100 (charity) / 150 (campaign) | ~300 |
| Sell player | `:12198` | `0.6 × getPlayerPrice` (avg **359**) | unbounded |
| Release player | `:8106` | `bat*2 + bwl*1.5` (always worse) | — |
| **Pack flip** | `:11856`+`:12194` | **+624 per 500-coin pack** | **unbounded** |

**Passive (login) share of non-exploit income ≈ 68%.**

### COINS — sinks

| Sink | Line | Cost |
|---|---|---|
| Auction bid | `:8868` | floor `max(20, 0.6 × price)` = 339–875 in practice; step 15% |
| Market buy | `:12184` | `1.0 × getPlayerPrice` = 345–1,458 |
| Market refresh | `:12623` | 100 (also happens free after every match, `:10940`) |
| Standard pack | `:11862` | 500 → 3 cards (**worth 1,124 resale**) |
| Training (normal) | `:8117` | `50 + 3×stat` = 200–347 for +1–2 |
| Training (intensive) | `:8140` | `1.5×` above = 300–520 |
| Staff — legit | `:9606` | 300–500, one-off, permanent |
| Scouting | `:9712` | 100 / 150 / 250 / 300 (half with analyst) |
| Pep talk | `:12647` | 150 → +15 morale, 1 per match day |
| Media bribe | `:12660` | 300 → heat −15, alignment −3 |
| Academy recruit | `:11564` | 300 (max 2 slots, alignment ≥ 30) |
| Bhai: respects / crowd / hafta | `:7724`/`:5436`/`:7765` | 130 / 90 / 40–200 |
| Neta: campaign / fundraiser / nephew | `:7558`/`:7574`/`:7580` | 300 / 220 / 150 |
| Charity donation | `:11110` | variable, +5 alignment |
| Tribunal fine | `:7882` | 300 |

### GEMS — the whole economy

| | Line | Amount |
|---|---|---|
| **Source** — daily login (days 3/5/7) | `:4735`,`:4737`,`:4739` | 5 + 10 + 25 = **40/week** |
| **Source** — pass free track | `:12967`+ | 5+5+10+10+25 = **55/season** |
| **Source** — pass premium track | `:12967`+ | 10+15+20+25+50 = **120/season** |
| **Sink** — Premium Pack | `:11862` | **15** (5 cards) |
| **Sink** — Premium Contract | `:12964` | **150/season** |

That is the complete list — two sinks. Net premium-pass cost after rebates = **30 gems/season**
against ~80 gems/season of login income. Gems inflate with nowhere to go, and inflate *faster* once
the squad is full (Premium Pack blocked at 15/15, `:11859`).

### BLACK MONEY

| Source | Line | Amount |
|---|---|---|
| Match (by zone) | `:10897` | win 0 / 0 / **10** / **25** / **50**; loss = half |
| Bagman bonus | `:10898` | ×1.15, **only when alignment < −10** (not stated in the effect text, `:9616`) |
| `grey_win` daily challenge | `:10621` | 20 (1 of 8 challenges) |
| Match Fix (Lose) | `:12035` | **+300**, 5-match cooldown, paid regardless of result |
| Rival "politician" gift | `:6747` | +15 |
| Reckoning climax (one-time) | `:11707`/`:11741` | +500 / +200 |

| Sink | Line | Amount |
|---|---|---|
| Mafia favour cost | `:12013` | 20–150 × `priceMod` (0.595–2.25) |
| Debt created by favour | `:12040` | 80–250, **not discounted**, ×1.2 then ×1.25 on default |
| Debt repayment | `:6572` | full escalated principal |
| Fixer staff | `:9661` | 60–150 one-off |
| Bribe rival to throw | `:6857` | `150 + rival.strength` ≈ 200–250 |
| Bribe inspector | `:7104` | 200 (greedy) / 450 (ambitious), ×1.6 if ≤ 2 matches left |
| Bhai pitch-prep | `:5437` | 110 |

---

## Confirmed healthy (checked, found sound)

- **`claimDailyLogin`** (`:4809`) — date-keyed, cannot be re-claimed same day; streak logic in
  `processDailyLogin` (`:4759`) is reload-proof and resets correctly on a missed day. Grants persist
  via `save()` before `updateCurrency()`.
- **`trainPlayer` / `trainPlayerAdvanced`** (`:8120`, `:8137`) — deduct, apply to the real squad
  object, clamp at 99, `save()`. Coach bonuses genuinely apply. Training is strongly **value-negative
  for resale** (a +1 bat point costs ≥ 200 coins and adds at most 4.5 coins of sell value at
  legendary rarity), so there is no train-and-flip exploit.
- **Auction floor vs market sell** (`:8868` vs `:12198`) — both at `0.6 × getPlayerPrice`, so an
  uncontested auction win breaks exactly even on an instant flip. The 2026-08-03 fix holds.
- **Market buy** at `1.0×` vs sell at `0.6×` (`:12184`/`:12198`) — a clean 40% spread, no round-trip
  profit.
- **`payDebt`** (`:6568`) — checks funds, deducts, splices, releases the held player only when no
  *other* debt still holds them, bumps syndicate relations, saves.
- **`BILLING_LIVE = false` guard** (`:13115`) — defended in depth at both `requestPurchase` (`:13164`)
  and `completePurchase` (`:13181`). No currency can be granted without live billing. Buy-intent is
  still logged (`store_intent`, `:13166`) — good acquisition telemetry.
- **Rewarded-ad accounting** (`:13236`–`:13263`) — the daily spot is consumed on **claim**, not on ad
  start, so aborting costs nothing; caps reset on local date, consistent with daily login.
- **Facilities pep talk (150C)** (`:12647`) and **media bribe (300C)** (`:12660`) — both write real,
  persistent state (`GS.morale` feeds `calcBallOutcome` at `:10360`; `GS.heat` feeds
  `checkInvestigation`), both gated, both saved.
- **Scouting** (`:9752`–`:9780`) — post-fix, all four options now write persistent state
  (`GS.scoutedXI` / `GS.scoutWeakness` / market listings), and `getOrLockRivalXI` makes repeat
  purchases self-consistent. The original scout bug is genuinely closed.
- **Mentorship** (`:11213`–`:11245`) — free, applies +3 to the two weakest stats per season on the
  real squad object, upgrades rarity at completion. Delivers exactly what the picker advertises.
- **Fixer staff** `pr_manager` / `lawyer` / `cleaner` / `inside_man` / `bagman` — all five verified
  wired to real effects at `:9691`, `:7867`, `:9694`, `:7080`, `:10898`.
- **Favour debt pricing** (`:11982` vs `:12040`) — alignment/relationship discounts apply to the
  *cost* but never to the *debt*, which is the right shape: going deeper into the underworld makes
  favours cheaper to start and just as expensive to survive.
- **Drop-rates page exists and is reachable** (`:13300`–`:13339`), satisfying the Play publish-rates
  requirement in principle (accuracy caveat above).

---

## If only one thing gets fixed

**Close the pack-flip loop.** `openPack` sells 3 cards worth 1,124 coins of instant resale for 500
coins (`prototype/index.html:11856` + `:12194`). It is a repeatable, uncapped 125% ROI that makes
every coin sink, every coin IAP tier, and most of the balance work in this game irrelevant the moment
one player posts it. The cheapest correct fix is the same one the 2026-08-03 audit applied to the
auction: make disposal, not acquisition, the lossy side — e.g. price the Standard Pack at
`~1,800` coins (its true expected value) **or** apply a "recently acquired" sell penalty so a card
bought/pulled this session resells at a steep discount. Everything else in this document is a
tuning or honesty problem; this one is the economy failing open.
