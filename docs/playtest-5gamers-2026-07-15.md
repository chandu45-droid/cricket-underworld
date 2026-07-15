# Playtest #5 — 5 Gamers, Full Game, UI Deep-Dive (2026-07-15)

**Method:** Real build at `localhost:8080`, driven by scripted Playwright fresh-install sessions (390x844, DPR 2, touch). Two independent full-game runs (23:16 and 23:26 IST), 13 screenshots each, JSON ground-truth dumps. Personas are simulated perspectives grounded ONLY in measured evidence -- no invented pain points.

**Build state:** post ship-batch of 2026-07-15 (purse-trap fix, XI auto-preselect, Blitz 5-over, cloud save).

---

## Measured facts (both runs agree)

| Metric | Value |
|---|---|
| Load -> playable | 3,296 ms / 3,413 ms |
| Tutorial | 6 taps, skippable, clear copy |
| Console errors (full session) | **0** in both runs |
| Day-1 auction (spam-bid pattern) | Spent **1,989 of 2,000 on lot 1 of 12** -> purse 11, squad **1/15** |
| Match start with 1 player | **Silently fails** -- no toast, no message, hub looks normal |
| After 2 failed match taps | Hub tiles (#hub-match-btn, #hub-vault-tile) **click-intercepted 30s+** -- session dead |
| Auction-end toast | "Auction complete! Squad: **1 players**" -- green *success* styling |
| Final ground truth | coins 11, gems 50, BM 30, 0W-0L, squad 1, save 2,535 bytes |

---

## THE finding: the purse-trap fix moved, it did not die

Prior report claimed the naive bidder now "keeps 1,118 of 2,000." **Did not reproduce.**
Budget-first lot ordering + the pacing tip ARE live, but a player who just keeps tapping BID
can still dump the entire purse on the first budget lot. Then the run collapses in a chain:

1. **Overspend allowed** -- no confirm, no soft cap, even at 99% of purse on lot 1/12.
2. **Auction ends 1/15** -- toast celebrates it in green ("Auction complete! Squad: 1 players").
3. **MATCH tap does nothing** -- prematch never opens, zero feedback (shot 07: hub looks perfectly normal).
4. **Input lock** -- after two failed match attempts, an invisible blocker (suspected stuck squad-select overlay) intercepts all hub tile clicks. Vault, store, matches 3-8: all timed out. **Day-1 softlock.**
5. Recovery levers exist -- daily CLAIM 200, Sponsor Boost (+300 purse ad) -- but **nothing points the broke player at them.**

This is the exact new player who churns on day 1 and never shows up in D7.

---

## The 5 gamers

### 1. Rohan, 19 -- F2P grinder (plays Stumble Guys, WCC3)
- Hit the softlock chain above. His words: "I bid big on the first guy like in IPL, then the game just... stopped working. Uninstalled."
- Never claimed the daily 200 -- with purse 11 it was his only way back and nothing flagged it.
- Wants: a "you need 11 players to play matches" blocker message, and a re-auction / recovery path.

### 2. Priya, 28 -- commuter casual (10-min sessions)
- Loved: 3.3s to playable, 6-tap tutorial, zero crashes. Best-in-class for her commute.
- Confused by hub numbers: "YOUR EMPIRE C3.6K" while her coins show 11 -- two currency-looking numbers, no explanation. And she is **#2 OF 10 LEAGUE RANK having played 0 matches** -- feels fake.
- The "Checking the wicket..." loading flash when opening settings read as jank to her.

### 3. Arjun, 24 -- crime-fiction roleplayer (here for the underworld)
- Dark theme (shot 08) is the best screen in the game: noir hub, GREY ZONE badge, rival trait line "Aggressive -- doubles down when cornered" in red italics -- exactly the fantasy. **Why is light the default?**
- ALIGN +0 / HEAT 0 / FANS 50 chips render beautifully but did nothing all session -- the underworld never touched him in a full day-1 run.
- Auction is pure cricket; not one shady lever (fixer whisper, black-money bid) on the screen he spends most time on.

### 4. Vikram, 35 -- value spender (Rs 500-2,000/mo across games)
- Sponsor Boost (+300 purse for an ad) on the auction screen is the right monetization instinct -- but it appeared AFTER his auction was already lost. Surface it when purse < next lot base price.
- Cards screen: **1/50 collection, one lonely card, a full screen of empty beige below it, and the Packs & Shop panel collapsed.** That is the moment to sell a pack; instead it is dead air.
- Will not spend on stick-figure card art. Rarity diamonds (0/0/1/0/0) are unlabeled -- he had to guess the tiers.

### 5. Sana, 22 -- design-literate mobile gamer (the UI eye, new this round)
Founder asked for UI scrutiny; Sana's full pass is below.

---

## UI deep-dive (evidence: shots 04, 06, 07, 08, 10, 13)

**What is genuinely premium**
- Dark hub is the flagship: gold shield, 73-rating ring, angular tiles with colored edge-keys, NEXT MATCH panel with rival personality line. Distinct, not generic. Meets constitution rule 9.
- Auction screen: red clip-path BID button, timer ring, bid history, stat color-coding (BWL 5 in red) -- reads like a real broadcast overlay.
- Customise screen (shot 13): gold clip-path SAVE CHANGES, diamond-shaped theme toggle -- on-brand touches.

**Defects, smallest to largest**

| # | Issue | Evidence |
|---|---|---|
| 1 | "1 players" grammar in auction-end toast; styled green/success for a failed outcome | shot 06 |
| 2 | Purse-pacing tooltip overlaps the "< HUB" back button | shot 04 |
| 3 | PASS button is a plain grey rectangle next to the angular clip-path BID -- inconsistent pair | shot 04 |
| 4 | Cards filter tab clipped at screen edge ("ALL-ROUN") with no scroll affordance | shot 10 |
| 5 | Card art is a green stick figure on every card -- placeholder shipping as product | shots 04, 10 |
| 6 | **Team-color swatches are rounded squares** -- violates hard constraint 8 (3-4px max, angular) | shot 13 |
| 7 | Nickname input truncates its own value ("Devraj Padmanabt") | shot 13 |
| 8 | Cards screen empty state: ~70% blank beige, no CTA | shot 10 |
| 9 | Star ratings: DOM text reports 5 filled stars for every card (filled/unfilled glyphs identical to screen readers); visual is correct | log + shot 04 |
| 10 | Hub shows league rank #2/10 and EMPIRE 3.6K to a player with 0 matches and 11 coins -- numbers that map to nothing the player did | shots 07, 08 |
| 11 | Silent-failure MATCH tile + subsequent invisible click-blocker | log, shot 07 |

---

## Ranked synthesis (what to fix, in order)

| # | Item | Sev | Why |
|---|---|---|---|
| 1 | **Day-1 softlock chain**: min-squad gate message on MATCH ("Need 11 players -- go to Auction"), overspend confirm when a single bid > ~50% purse, surface CLAIM 200 + Sponsor Boost when broke | P0 | Direct D1-churn path, reproduced twice |
| 2 | **Stuck input-blocker bug** after failed match start (repro: 1-player squad -> tap MATCH x2 -> hub tiles dead) | P0 | Hard bug; kills the session even if #1 messaging ships |
| 3 | Auction-end toast: warn (amber) below 11 players; fix "1 players" | P1 | Cheap, high-clarity |
| 4 | Cards empty state -> pack CTA; label rarity diamonds | P1 | Monetization moment currently wasted |
| 5 | Angular-rule violations (color swatches), PASS/BID styling pair, tooltip/HUB overlap, tab clipping, nickname truncation | P2 | Polish batch, one sitting |
| 6 | Hub number honesty: hide/zero league rank + empire until match 1; label empire value | P2 | Trust with new players |
| 7 | Real card art to replace stick figures (even 5 archetype illustrations) | P2 | Spend-blocker per Vikram |
| 8 | Star-glyph accessibility (aria-label the rating) | P3 | Screen-reader correctness |

**Positive signal worth keeping:** 0 console errors across two full fresh-install sessions, 3.3s load, 6-tap tutorial, dark theme quality, cloud save written correctly. The foundation is stable -- the failures are all in guardrails and empty states, not the engine.

---
*Harness: _playtest5.cjs (temp, not committed). Runs: 2026-07-15 23:16 and 23:26 IST.*
