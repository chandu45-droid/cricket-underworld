# Four-Gamer Playtest — Personas, Pain Points, Asks (2026-07-15)

**Method:** four distinct player personas for the target market, each "played" against the
real build — a scripted fresh-install session was driven through the live game (Playwright,
390×844, light theme) to measure what each persona actually hits, plus economy constants
read from code. These are simulated perspectives grounded in measured play, not real users —
wave 1 of distribution replaces guesses with data.

**Measured session facts (fresh install, current build):**
- Playable in **2.5s** (post font-fix); tutorial ~6 taps; **~10 taps / <2 min from install to first ball**
- Auction: pool of 12 is **sorted rarity-first** → a naive bidder spends ~1,450 of the 2,000
  purse on the first 4 cards (1 legendary + 3 epics) and **cannot afford an XI** — day 1 ends
  with a 4-man squad
- Playing XI screen: **nothing pre-selected on first open**, Confirm sits disabled until the
  player finds "Auto" or taps players one by one
- Full match: 0.8s/ball × 240 balls + bowler-picker interrupts ≈ **5–6 min**; Skip exists
- First win with the 4-man squad vs a full XI: **won by 4 wickets** (164 vs 163)
- Economy: win ≈ +80c (zone-multiplied), loss +30c · standard pack 500c (~6 wins) · premium
  pack 15 gems · login streak 200→1,500c over 7 days · store is honest test-mode
  (`BILLING_LIVE=false` — nothing purchasable)

---

## 1 · Rohan, 19 — hostel student, F2P grinder (WCC3 / Free Fire)

**Goal:** top the league without spending a rupee; prove skill; max the squad.

**His session:** blows the purse on the shiny legendary that the auction serves first,
ends day 1 with 4 players, wins anyway, then does the math on packs.

**Pain points**
1. **The purse trap.** Rarity-first auction order punishes exactly the new player it should
   protect — the strategic move (skip early stars, buy value late) is invisible on first play.
2. **Thin coin faucet for a grinder.** 80c/win → one 500c pack per ~6 wins (~35–45 min of
   sim time). Training costs coins too. The grind-to-reward beat is long for a player whose
   whole identity is grinding.
3. **Difficulty credibility.** He won with 4 players against a full XI. If the game can be
   beaten understaffed, squad-building — his favorite system — feels optional. (Echoes the
   June round-1 "match too easy" note; still reproducible.)
4. **Nothing human to beat.** League and Empire Rank are bots-only. A grinder grinds to be
   *seen* — there is no ladder, ghost league, or friend comparison anywhere.

**He'd ask for:** auction pool mixed or budget-tier rounds (cheap cards first) · a weekly
F2P challenge with an exclusive card · pack pity counter (GDD-specced, still unbuilt) ·
any human-shaped leaderboard, even async ghosts.

---

## 2 · Priya, 28 — commuter casual (Ludo King / Candy Crush)

**Goal:** 8–10 pleasant minutes on the metro; zero homework; never feel punished.

**Her session:** loves that it opens in 2.5s and looks premium; the tutorial is short; then a
match asks for 5–6 minutes of attention and pings her to pick a bowler every over.

**Pain points**
1. **No session that fits her commute.** The core loop's 5–6 min sim (plus auction) is one
   long sitting; Skip feels like "not playing". There is no 90-second match format.
2. **XI confirm friction.** First open shows zero selected and a dead Confirm button — she
   doesn't know "Auto" is the answer; this is the first place she can feel stupid.
3. **Concept overload at the front door.** Alignment, Heat, B$, five factions, Syndicate
   Contract, streak, empire — the hub introduces everything at once (density pass helped,
   but systems all *exist* from minute one).
4. **Streak anxiety.** Miss a day and the streak resets — the exact mechanic that makes her
   quit casual games that "guilt" her.

**She'd ask for:** a Quick Match mode (5-over or super-over, under 2 min) · XI auto-selected
by default when squad ≤ 11 (Confirm live immediately) · progressive unlock (underworld
systems reveal at match 3–4, not minute one) · one streak-protection token per week.

---

## 3 · Arjun, 24 — roleplayer who came for the crime (GTA / Sacred Games fan)

**Goal:** BE the corrupt team owner. The cricket is the setting; the underworld is the game.

**His session:** starts in the Grey Zone so the mafia banner is there early (good), meets the
Power Web and named faces (Anna Seth, Sikandar Bhai — exactly what he wants), then notices
the drama arrives on a drip.

**Pain points**
1. **One underworld beat per match-week.** The event engine picks a single card
   (hafta > election > rival offer priority) — on most weeks his crime empire is one
   decision, then back to cricket. The fantasy wants density.
2. **The world doesn't remember out loud.** Relationships move meters, and the inspector
   tracks a failed bribe — but nobody *says* "you burned us in season 1". Consequences are
   numeric, not narrative.
3. **Fear doesn't radiate.** Being a feared don changes nothing about how rival bosses bid
   against him in auctions or approach him with offers — reputation has no teeth outside
   its own meters.
4. **Police cases resolve as stat rolls.** The FIR→Court pipeline is great structure, but the
   tribunal is a report card, not a scene. His favorite moment of the fantasy is its flattest.
5. (Taste, not defect: light-default undercuts noir for him — the dark toggle and the
   noir set-pieces that stay dark are the save.)

**He'd ask for:** 2–3 underworld beats per week or chained mini-storylines · NPC dialogue
that references his history · a visible Notoriety stat that alters rival bidding/offer
behavior · a staged tribunal/raid moment (even 3 beats of dialogue before the verdict).

---

## 4 · Vikram, 35 — IT professional, value-optimizing low spender (₹200–500/mo)

**Goal:** pay to skip grind, but only where value is provable. Also the "would this ever
make money?" lens.

**His session:** taps the coin chip, opens The Vault, sees clean ₹49/₹129/₹299 tiers with
POPULAR/BEST VALUE tags (good retail instincts) — and then the purchase grants nothing
("test mode"). Checks the pass: ₹199, can't preview all 10 tiers before buying. Realizes
his progress lives in one phone's localStorage.

**Pain points**
1. **No account / cloud save.** He will not put money into a save that dies with a cleared
   browser cache or a new phone. This is a hard blocker *before* billing, not after.
2. **Store is a dead end** (correctly gated by `BILLING_LIVE=false`, but for his persona the
   game currently cannot convert its one willing payer).
3. **Randomness is the only thing for sale.** ₹49 → 1,000c → 2 packs → 6 random cards. No
   deterministic purchase (a specific player, a guaranteed-epic bundle) — optimizers hate
   paying for dice.
4. **Dual currency fog.** Coins vs gems roles overlap (both buy packs); no exchange rate
   anchors their relative worth, so *every* price is hard to evaluate.
5. **Pass value is a leap of faith.** The 10-tier ledger shows tiers, but he wants the
   full reward manifest + expected completion time before ₹199 leaves his pocket.

**He'd ask for:** account + cloud save (prereq to C2 billing) · one deterministic starter
bundle (₹49, fixed contents) · full pass preview with "completable in N matches" line ·
collapse or clearly differentiate the two currencies.

---

## Synthesis — ranked cross-persona improvements

| # | Improvement | Serves | Effort | Fits plan |
|---|---|---|---|---|
| 1 ✅ | **Auction purse-trap fix** — SHIPPED 2026-07-15: pool now sells budget lots first, marquee closes the show + first-auction purse tip. Re-measured: same naive bidding keeps 1,118 of 2,000 purse (was 490). | Rohan, Priya, every day-1 user | S | Pre-wave polish — day-1 fairness IS the funnel |
| 2 ✅ | **XI auto-preselect** — SHIPPED 2026-07-15: first open pre-selects a legal XI via buildPlayingXI (overseas cap respected), Confirm live immediately. | Priya, everyone's first match | S | Pre-wave polish |
| 3 ✅ | **Quick Match — SHIPPED 2026-07-15:** Blitz 5-over format on the pre-match screen (defaults back to T20 each match day); innings cap 30 balls in live sim + skip path; match payout and Contract XP halved. E2E green. | Priya + commute sessions = D1 lever | M | Shipped pre-wave |
| 4 ✅ | **Account/cloud save** — SHIPPED 2026-07-15: portable backup code (offline, checksummed) + optional cloud sync by Save Code over a free Apps Script endpoint (`cloudsave/`). Settings → Cloud Save & Backup. Round-trip + reject-corrupt verified. | Vikram (blocks any real revenue), all (device loss) | L | **Gate for C2 billing** — DONE |
| 5 | **Progressive system unlock** (underworld reveals at match 3–4) | Priya; tutorial_done→D1 funnel | M | Post-wave-1, if funnel shows early drop |
| 6 | **Underworld density/chains + notoriety with teeth** | Arjun — the differentiation audience | M–L | Post-signal; deepens the moat §11 named |
| 7 | **Deterministic starter bundle + pass preview** | Vikram; ARPU when billing lands | S–M | Bundle with C2 |
| 8 | **Match difficulty floor** (understaffed XI should struggle) | Rohan; sim credibility | M | Balance pass; June feedback still open |
| 9 | **Ghost/async leaderboard** | Rohan; long-term retention | L | Post-revenue |

**Do-now items 1 + 2: DONE (2026-07-15, same session)** — both shipped with E2E coverage before
distribution wave 1. Remaining items stay ranked for the post-signal phase.
