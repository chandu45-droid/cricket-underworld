# Core Systems Design Document
## Cricket Underworld: Card Strategy Game

**Version:** 2.0
**Status:** Design Review Complete — Revised
**Last Updated:** 2026-06-05
**Changelog v2.0:** Applied fixes from 5-agent design review (game-designer, economy-architect, cricket-consultant, player-experience, balance-tester). 23 fixes across all 8 systems + 2 new systems added.

---

## Table of Contents

1. [Alignment System](#1-alignment-system)
2. [The Favor Economy](#2-the-favor-economy)
3. [Heat & Exposure System](#3-heat--exposure-system)
4. [Rival Manager System](#4-rival-manager-system)
5. [Auction System](#5-auction-system)
6. [Match Simulation System](#6-match-simulation-system)
7. [Card / Player System](#7-card--player-system)
8. [Economy & Progression](#8-economy--progression)
9. [Clean Path Mechanics](#9-clean-path-mechanics) *(NEW in v2)*
10. [Onboarding & Progressive Disclosure](#10-onboarding--progressive-disclosure) *(NEW in v2)*

---

## 1. Alignment System

### 1.1 The Scale

Alignment is a **signed integer from -100 (fully corrupt) to +100 (fully clean)**. All players start at **+10** (slightly clean — you entered this world with good intentions).

| Zone | Range | Label | Color |
|------|-------|-------|-------|
| Deep Corrupt | -100 to -71 | Kingpin | Black |
| Corrupt | -70 to -31 | Fixer | Dark Red |
| Grey Zone | -30 to +30 | Pragmatist | Amber |
| Clean | +31 to +70 | Gentleman | Blue |
| Spotless | +71 to +100 | Icon | White/Gold |

### 1.2 Actions That Shift Alignment

| Action | Shift | Notes |
|--------|-------|-------|
| Accept a mafia favor | -3 to -8 | Depends on favor severity |
| Fix a match | -12 | Major corrupt act |
| Bribe an umpire | -6 | |
| Tap a rival's player | -5 | |
| Pay off a debt on time | -2 | You're fulfilling a corrupt bargain |
| Refuse a mafia favor | +3 | But may anger the favor giver |
| Expose a rival's corruption | +8 | But makes an enemy |
| Report corruption to the board | +10 | Generates heat on the target, not you |
| Win a match cleanly | +2 | Only if no corrupt actions that match |
| Bench a corrupt player voluntarily | +4 | |
| Donate winnings to charity (in-game) | +5 | Costs 20% of match earnings |
| Collude with a rival | -6 | Mutual corruption pact |
| Accept a clean sponsor | +2 | Only available above -10 alignment |
| Hold black money > 500 | -1/season tick | Passive decay while holding dirty cash |
| Mentor a young player (clean exclusive) | +3 | See Section 9 |
| Win Fan Vote award (clean exclusive) | +4 | See Section 9 |

### 1.3 Zone Effects

#### Sponsors

| Zone | Available Sponsor Tiers | Purse Bonus |
|------|------------------------|-------------|
| Spotless (+71 to +100) | Tier 1 (Premium brands) | +30% auction purse |
| Clean (+31 to +70) | Tier 2 (Major brands) | +15% auction purse |
| Grey (-30 to +30) | Tier 3 (Generic brands) | +0% |
| Corrupt (-31 to -70) | Tier 4 (Shell companies) | -10% purse, but mafia injections available |
| Deep Corrupt (-71 to -100) | Tier 5 (Mafia fronts only) | -25% purse, but large mafia injections |

Sponsors review alignment at the **start of each season**. Dropping a tier mid-season triggers a **sponsor warning** — drop again and they pull out, losing purse mid-season (15% of remaining budget vanishes).

#### Mafia Access

| Zone | Mafia Relationship |
|------|-------------------|
| Spotless | No access. Mafia won't approach you. But clean-exclusive mechanics available (Section 9). |
| Clean | Mafia approaches rarely (1 offer per 3 matches). Can refuse without consequence. |
| Grey | Full access. 1 offer per match. Refusal costs reputation with mafia (-5 mafia rep). |
| Corrupt | Priority access. 2 offers per match. Better favor terms. Refusal costs -10 mafia rep and may trigger debt recall. |
| Deep Corrupt | Embedded. 3 offers per match. Best terms. But you can't refuse without severe consequences (forced debt, player seizure). |

#### Fan Loyalty

Fan loyalty is a **0-100 meter** that affects match-day income and morale.

| Zone | Fan Loyalty Modifier |
|------|---------------------|
| Spotless | +20 base, +3 per clean win |
| Clean | +10 base, +2 per clean win |
| Grey | +0 base, +1 per win |
| Corrupt | -10 base, -2 per loss, but +3 per win (fans love winners regardless) |
| Deep Corrupt | -25 base, but if winning streak > 3: fans start ignoring corruption (+5 per win in streak) |

#### Investigation Frequency

| Zone | Base Investigation Chance Per Season |
|------|--------------------------------------|
| Spotless | 2% (false flag only) |
| Clean | 5% |
| Grey | 15% |
| Corrupt | 35% |
| Deep Corrupt | 60% |

These are **base** chances, modified by Heat (see Section 3).

### 1.4 Alignment Momentum & Inertia

Moving toward extremes gets **harder**. The formula for effective alignment shift:

```
effective_shift = raw_shift / (1 + 0.5 * max(0, (abs(current_alignment) - 30) / 70))
```

Examples:
- At alignment 0, a -12 action shifts by -12 (full effect).
- At alignment -50, a -12 action shifts by -12 / (1 + 0.5 * 20/70) = -12 / 1.14 ≈ -10.5.
- At alignment -80, a -12 action shifts by -12 / (1 + 0.5 * 50/70) = -12 / 1.36 ≈ -8.8.

This means:
- Reaching -100 or +100 requires sustained, deliberate commitment.
- The Grey Zone is easy to fall into, hard to escape permanently.
- A single corrupt act from Spotless drops you more meaningfully (psychologically and mechanically) than the same act at -60.

**Alignment Decay:** If a player takes no alignment-shifting actions for 3 consecutive matches, alignment drifts **2 points toward 0** (the system pulls you toward the grey). This prevents parking at an extreme passively.

**[v2 FIX] Decay is BLOCKED when:**
- Player has any active debts
- Player's heat is > 30
- Player is under investigation

This prevents the exploit of cycling between corrupt bursts and passive decay to stay safely in the Grey Zone.

### 1.5 Why the Grey Zone is Most Interesting

The Grey Zone (-30 to +30) is designed as the **most tactically rich** space:

- **Access to both worlds.** You can take mafia favors AND hold Tier 3 sponsors. Neither side fully trusts you, but neither shuts you out.
- **Maximum optionality.** You can pivot in either direction based on the current game state.
- **Highest rival interaction range.** Grey managers can collude with corrupt rivals OR expose them, giving the most diplomatic options.
- **The trust problem.** Both clean and corrupt rivals distrust Grey managers. Relationship gains are halved with managers more than 40 points from your alignment.
- **Sponsor volatility.** Grey managers are one bad decision from losing sponsors, creating real tension.

The design intent: the Grey Zone should feel like walking a tightrope, not sitting on a fence.

### 1.6 Alignment and Match Outcomes

Alignment does not directly buff or nerf match stats. Instead, it affects:

- **Player morale** (see Section 7.8): Clean teams with a corrupt manager lose morale on high-loyalty players. Corrupt teams with a clean manager see greedy players underperform.
- **Team chemistry bonus**: When alignment is consistent with the squad's average loyalty, a +5% overall team performance modifier applies.
- **Clutch moments** (see Section 6.5): Clean managers get a slight edge in "hero moments" (last-ball finishes). Corrupt managers get an edge in "manufactured outcomes" (mid-innings collapses by opponents).

---

## 2. The Favor Economy

### 2.1 Concept

The mafia is not a character. It is a **system** — a distributed network of bookies, fixers, agents, and officials who offer favors with strings attached. Every favor creates a **debt**. Debts have **deadlines**. Missing deadlines has **consequences**.

The player never interacts with "the don." They interact with intermediaries who represent a faceless system. This makes the mafia feel systemic, inescapable, and morally grey rather than cartoonishly evil.

### 2.2 Favor Types

| Favor | Benefit | Upfront Cost | Heat Generated | Debt Created | Alignment Shift | Cooldown |
|-------|---------|-------------|----------------|-------------|-----------------|----------|
| **Auction Leak** | See one rival's remaining budget before an auction round | 50 black money | +5 | 100 black money due in 3 matches | -3 | 1 per auction |
| **Player Tap** | Reduce a rival's key player's form by 15 for 1 match | 80 black money | +8 | 150 black money due in 2 matches | -5 | 1 per 2 matches |
| **Umpire Influence** | +10% chance of favorable LBW/caught-behind decisions for 1 match | 120 black money | +12 | 200 black money due in 2 matches | -6 | 1 per 3 matches |
| **Budget Injection** | Receive 500 coins added to auction purse | 0 (free upfront) | +3 | Must throw 1 match within 5 matches | -4 | 1 per season |
| **Scout Intel** | Reveal hidden stats of 3 players before auction | 30 black money | +2 | 60 black money due in 5 matches | -3 | Unlimited |
| **Match Fix (Win)** | Guarantee a win in a non-playoff match | 200 black money | +20 | 400 black money due in 1 match OR must lose a future match on demand | -12 | 1 per 4 matches |
| **Match Fix (Lose)** | Deliberately lose a match (fulfills a debt or earns money) | Earns 300 black money | +18 | None (you're paying, not borrowing) | -8 | **1 per 5 matches** |
| **Evidence Destruction** | Remove 1 piece of evidence from your file | 150 black money | +5 | 250 black money due in 3 matches | -4 | 1 per investigation |
| **Rival Dossier** | Learn a rival's alignment, current heat, and active debts | 40 black money | +2 | 80 black money due in 4 matches | -3 | 1 per rival per season |

**[v2 CHANGES]:**
- Match Fix (Lose) cooldown increased from 1/3 matches to **1/5 matches** (prevents farming loop)
- Match Fix (Lose) heat increased from +15 to **+18**
- Evidence Destruction heat increased from +3 to **+5**

### 2.3 The Debt System

#### Debt Structure

Each debt has:

| Property | Description |
|----------|-------------|
| **Principal** | The amount owed (black money or action) |
| **Deadline** | Matches remaining to pay |
| **Interest** | +20% of principal per match past deadline |
| **Max Escalation** | 3 stages before forced resolution |

#### Debt Lifecycle

```
Favor Accepted → Debt Created → Countdown Starts
                                      │
                         ┌─────────────┼─────────────┐
                         │             │              │
                    Paid On Time    Missed Once    Missed 3+
                         │             │              │
                    Debt Cleared   Stage 1:        Stage 3:
                    (no extra       Warning         Forced
                     penalty)       (+20% interest)  Resolution
                                       │
                                   Stage 2:
                                   Pressure
                                   (Player seized
                                    as collateral)
```

#### Escalation Stages

| Stage | Trigger | Consequence |
|-------|---------|-------------|
| **0: Active** | Debt created | Countdown timer visible. No pressure yet. |
| **1: Warning** | 1 match past deadline | Interest applied (+20%). Mafia sends a "reminder" (UI notification, menacing). Next favor costs +50% more. |
| **2: Pressure** | 2 matches past deadline | Interest now +50% total. One random player from your squad is "held" — they cannot play until debt is paid. Alignment shifts -5. |
| **3: Forced Resolution** | 3 matches past deadline | The mafia resolves it for you: either (a) your next match is auto-fixed as a loss, or (b) your highest-value card is permanently seized. Debt cleared. Alignment -10. Heat +15. |

#### Debt Cap

A player can hold a maximum of **5 active debts**. At 5, no new favors are offered until at least one is cleared. This prevents infinite debt spiraling but creates pressure to manage cash flow.

### 2.4 Scaling with Alignment

| Alignment Zone | Favor Pricing | Debt Terms | Availability |
|----------------|--------------|------------|--------------|
| Spotless | N/A — no offers | N/A | None |
| Clean | +50% cost | +1 match deadline grace | Limited (1 per 3 matches) |
| Grey | Standard pricing | Standard terms | Standard (1 per match) |
| Corrupt | -15% cost | -1 match deadline | Enhanced (2 per match, better favors) |
| Deep Corrupt | -30% cost | No deadline grace, immediate Stage 1 if missed | Full (3 per match, exclusive favors) |

### 2.5 Favor Chains — The Slippery Slope

Favor chains are the key psychological mechanic. They work like this:

1. **Entry favor:** Scout Intel (cheap, low heat, minor alignment hit). The player thinks: "This is harmless."
2. **The hook:** Armed with intel, the player sees a must-have player in auction. They don't have the budget. A Budget Injection offer appears. "Just this once."
3. **The debt:** Budget Injection requires throwing a match. The player now needs to lose deliberately. A Match Fix (Lose) offer appears.
4. **The spiral:** Losing that match drops league position. A crucial match is coming. A Match Fix (Win) offer appears. "I'll clean up after this."
5. **The trap:** The Match Fix (Win) generates massive debt. The player needs black money fast. More favors. More debt.

**Implementation:** The system tracks **consecutive favors accepted**. After each favor, the next offered favor is **contextually appropriate** to the player's current situation:

| Consecutive Favors | System Behavior |
|--------------------|----------------|
| 1 | Random offer from available pool |
| 2 | Offer is contextually linked to previous favor's outcome |
| 3+ | Offers become "solutions" to problems created by previous favors |

This is not scripted narrative. It is **emergent from system interaction**. The favor chain emerges because each favor changes the player's state in ways that make the next favor appealing.

---

## 3. Heat & Exposure System

### 3.1 Heat Scale

Heat is a **0-100 integer** representing how much suspicion surrounds the player. It is **invisible to other players** but visible to the player themselves.

| Heat Range | Status | Visual Indicator |
|------------|--------|-----------------|
| 0-15 | Cold | No indicator |
| 16-35 | Warm | Faint amber glow on manager portrait |
| 36-55 | Hot | Pulsing red border on manager portrait |
| 56-75 | Burning | Red border + occasional "journalist" popup events |
| 76-100 | Inferno | Constant red, investigation imminent |

### 3.2 Heat Generation

Every corrupt action generates heat. See the Favor Table (Section 2.2) for per-favor heat values. Additional sources:

| Action | Heat Generated |
|--------|---------------|
| Holding > 500 black money | +2 per season tick (every 3 matches) |
| Holding > 1000 black money | +5 per season tick |
| Winning a fixed match (opponent reports anomalies) | +5 (on top of fix heat) |
| Losing a fixed match (obvious underperformance) | +10 (on top of fix heat) |
| Colluding with a rival under investigation | +10 |
| Player with loyalty > 70 witnesses corruption | +3 (they might talk) |
| Debt escalation to Stage 2+ | +5 per stage |
| **[v2] Collusion leak event** | +8 per leak (see Section 4.4) |

**[v2 CHANGE]:** Fixed-match-lose heat increased from +8 to +10 to further discourage farming.

### 3.3 Heat Decay

Heat decays **naturally** but slowly:

| Condition | Decay Rate |
|-----------|-----------|
| Base decay | -2 per match (always active) |
| Clean win (no corrupt actions that match) | -3 bonus |
| 3 consecutive clean matches | -5 bonus |
| Alignment in Clean/Spotless zone | -1 additional per match |
| Alignment in Corrupt/Deep Corrupt | +1 per match (suspicion lingers) |

**Minimum Heat:** Heat cannot drop below 0. Maximum is hard-capped at 100.

**Heat Half-Life:** From any given point, it takes approximately **8-12 clean matches** to halve your heat, assuming no new corrupt actions. This means consequences linger meaningfully.

### 3.4 Investigation Thresholds

Investigations are triggered by **threshold checks** that happen at the end of each match:

| Heat Level | Check Result |
|------------|-------------|
| 0-25 | No check |
| 26-40 | 10% chance of **Rumors** |
| 41-55 | 20% chance of Rumors, 10% chance of **Media Story** |
| 56-70 | 30% chance of Media Story, 15% chance of **Formal Investigation** |
| 71-85 | 40% chance of Formal Investigation |
| 86-100 | **Automatic Formal Investigation** |

#### Investigation Stages

```
Rumors → Media Story → Formal Investigation → Tribunal
  │          │                │                    │
  │          │                │                 Verdict
  │          │           Evidence Review
  │       Sponsor Warning
  Fan Loyalty -5
```

| Stage | Effect | Duration | Escalation Chance |
|-------|--------|----------|-------------------|
| **Rumors** | Fan loyalty -5. No mechanical penalty. Warning only. | 2 matches | 25% to escalate to Media Story if heat stays > 30 |
| **Media Story** | Fan loyalty -10. Sponsor warning (one more and they pull out). Morale -5 for high-loyalty players. | 3 matches | 35% to escalate to Formal Investigation if heat stays > 45 |
| **Formal Investigation** | Fan loyalty -15. Sponsor pulls out if below Tier 3. Cannot take new favors. Evidence reviewed. | 5 matches, then Tribunal |
| **Tribunal** | See Section 3.6 | 1 match (suspended during tribunal) | N/A |

### 3.5 Evidence System

**Every corrupt action has a percentage chance of generating a piece of evidence.** Evidence is persistent — it does not decay with time.

| Action | Evidence Generation Chance |
|--------|--------------------------|
| Scout Intel | 5% |
| Auction Leak | 10% |
| Rival Dossier | 5% |
| Player Tap | 20% |
| Umpire Influence | 25% |
| Budget Injection | 15% |
| Match Fix (Win) | 50% |
| **Match Fix (Lose)** | **65%** |
| **Evidence Destruction** | **100% (guaranteed meta-evidence)** |

**[v2 CHANGES]:**
- Match Fix (Win) evidence: 40% → **50%**
- Match Fix (Lose) evidence: 35% → **65%** (key fix for farming exploit)
- Evidence Destruction meta-evidence: 10% → **100% guaranteed** (destroying evidence always creates a paper trail — this is the critical anti-exploit fix)

**Evidence Types:**

| Type | Weight in Tribunal | How Generated |
|------|-------------------|---------------|
| Financial Record | 2 | Budget injections, black money transactions |
| Witness Statement | 3 | High-loyalty players witnessing corruption, rival exposure |
| Communication Intercept | 4 | Match fixes, umpire influence |
| Caught on Camera | 5 | Match fix failures (player performs obviously badly) |
| **Destruction Trail** | **3** | **Evidence Destruction attempts (always generated)** |

Evidence is **hidden from the player** until a Formal Investigation begins. At that point, the player sees how many pieces exist but not the specific types until the Tribunal.

### 3.6 Tribunal System

When a Formal Investigation concludes (after 5 matches), a **Tribunal** convenes. The outcome is determined by:

**Prosecution Score** = Sum of all evidence weights

**Defense Score** = Base 5 + Alignment bonus + Staff bonuses + Coins spent on legal defense

| Factor | Defense Bonus |
|--------|--------------|
| Base | 5 |
| Alignment > +50 | +5 |
| Alignment > +30 | +3 |
| Alignment > 0 | +1 |
| Alignment < -30 | -3 (penalty, not bonus) |
| Legal Advisor staff card | +3 to +8 (depends on card rarity) |
| Coins spent on defense (max 500) | +1 per 100 coins spent |
| Character witness (clean rival vouches) | +3 per witness |
| Destroyed evidence (via Fixer) | Reduces prosecution score |

**Verdict Table:**

| Prosecution - Defense | Verdict | Consequence |
|-----------------------|---------|-------------|
| < 0 (Defense wins) | **Cleared** | No penalty. Heat -20. Fan loyalty +10. |
| 0-5 | **Warning** | Heat -10. No penalty. But next tribunal has +3 prosecution bonus. |
| 6-10 | **Fine** | Lose 300 coins. Heat -5. |
| 11-15 | **Points Deduction** | Lose 4 league points. Fan loyalty -10. |
| 16-20 | **Match Ban** | Cannot play next 2 matches (auto-loss). Alignment +5 (served your time). |
| 21-30 | **Card Seizure** | Lose your highest-rated player card in **full squad** permanently. Match ban 1 match. |
| 31+ | **Season Suspension** | Banned for remainder of season. Restart next season with -20% purse. **Debts carry forward with +50% interest.** |

**[v2 CHANGES]:**
- **Card Seizure** now targets highest-rated card in **full squad**, not just playing XI. Additionally, the highest-rated card is marked **"under investigation"** 3 matches before the tribunal — it cannot be sold, traded, or moved to a different slot to game the system.
- **Season Suspension** no longer clears debts. Debts **carry forward with +50% interest**. This prevents the exploit of deliberately triggering suspension to wipe debts.

**Critical design note:** No verdict ends the game. Even Season Suspension just fast-forwards to next season. Getting caught is a setback, never a hard reset.

### 3.7 The Fixer Mechanic

Fixers are **staff cards** (see Section 7) that provide heat management:

| Fixer Type | Ability | Cost to Activate | Cooldown |
|------------|---------|-------------------|----------|
| **PR Manager** | Reduce heat by 10 | 50 coins | 3 matches |
| **Lawyer** | +5 defense in next tribunal | Passive (always active) | N/A |
| **Media Contact** | Prevent a Rumors → Media Story escalation (one-time block) | 100 coins | Once per season |
| **Cleaner** | Destroy 1 piece of evidence (but generates guaranteed Destruction Trail evidence) | 200 black money | 5 matches |
| **Inside Man** | View your current evidence count at any time | Passive | N/A |
| **Bagman** | Reduce black money heat threshold from 500 to 800 | Passive | N/A |

Fixers are **rare staff cards** obtained through auctions, season rewards, or (ironically) mafia favors. Having a good fixer doesn't make corruption safe — it makes it **slightly less reckless**.

---

## 4. Rival Manager System

### 4.1 Overview

Each league season features **9 rival managers** (plus the player = 10 total). Rivals are persistent characters who carry forward across seasons within a league tier. When the player promotes to a new tier, they face a new set of rivals.

### 4.2 Rival Profiles

Each rival has:

| Attribute | Type | Range | Description |
|-----------|------|-------|-------------|
| **Name** | String | — | Procedurally generated Indian name |
| **Personality** | Enum | 5 types | Governs decision patterns |
| **Alignment Tendency** | Float | -1.0 to +1.0 | How likely to drift corrupt vs clean |
| **Current Alignment** | Int | -100 to +100 | Changes each season based on decisions |
| **Heat** | Int | 0-100 | Their suspicion level |
| **Active Debts** | Int | 0-5 | How deep they are with the mafia |
| **Relationship to Player** | Int | -100 to +100 | Positive = friendly, negative = hostile |
| **Squad Strength** | Int | 40-95 | Overall team quality rating |

#### Personality Types

| Personality | Behavior Pattern | Alignment Tendency |
|-------------|-----------------|-------------------|
| **The Purist** | Never takes favors. Reports corruption. Will expose you if they have evidence. | +0.8 (strongly clean) |
| **The Pragmatist** | Takes favors only when losing. Manages heat carefully. Hard to catch. | +0.1 (slightly clean default, adapts) |
| **The Shark** | Aggressively corrupt. Takes every advantage. High heat but high squad strength. | -0.7 (strongly corrupt) |
| **The Coward** | Takes favors but panics. Likely to expose others to save themselves when investigated. | -0.3 (weakly corrupt, flips under pressure) |
| **The Politician** | Plays both sides. Colludes with anyone, betrays when beneficial. Alignment oscillates. | 0.0 (true neutral, maximum variance) |

### 4.3 Rival AI Decision Logic

Each match, rivals run a simplified decision loop:

```
FOR each rival:
  1. CHECK league position
  2. IF losing (bottom 4) AND alignment_tendency < 0:
     → 60% chance to accept a favor this match
  3. IF winning (top 4) AND alignment_tendency > 0:
     → 80% chance to refuse any favor
  4. IF under investigation:
     → Coward: 70% chance to expose someone they have intel on
     → Purist: continues clean play
     → Shark: doubles down (more favors)
     → Pragmatist: goes silent (no favors until investigation ends)
     → Politician: tries to cut a deal (collude with investigator rival)
  5. UPDATE alignment, heat, debts based on actions taken
  6. CHECK for tribunal triggers (same rules as player)
```

**Rivals can get caught, punished, banned, and have cards seized.** This makes the league feel alive. A season might see 2-3 scandals among rivals, creating emergent drama.

### 4.4 Player-Rival Interactions

#### Expose

**Trigger:** Player has intel on a rival's corruption (obtained via Rival Dossier favor, or observed suspicious match results).

| Effect | Details |
|--------|---------|
| Target's heat | +20 |
| Target's relationship to you | -50 (permanent enemy) |
| Your heat | -10 (seen as whistleblower) |
| Your alignment | +8 |
| Your fan loyalty | +5 |
| Risk | If you are also corrupt, target may counter-expose you (50% chance if relationship was < 0) |

#### Collude

**Trigger:** Both you and the rival are in Grey or Corrupt zones. Relationship > -20.

| Effect | Details |
|--------|---------|
| Shared favor access | You can pool black money for joint favors at 30% discount |
| Mutual blackmail | Each holds info on the other. If one exposes, both go down. |
| Match coordination | Can arrange result-sharing (you win home, they win away) |
| Your alignment | -6 |
| Risk | If either gets investigated, the other is implicated (+15 heat) |
| Cooldown | Collusion pact lasts 1 season. Must re-establish next season. |
| **[v2] Max simultaneous pacts** | **2** |
| **[v2] Leak chance** | **10% per match per active pact — generates Witness Statement evidence independently** |
| **[v2] Investigation flip** | **Rivals under investigation have a 50% chance to betray the pact and expose you to reduce their own sentence, regardless of mutual blackmail** |

**[v2 CHANGES]:** Collusion is now capped at 2 simultaneous pacts. Each pact has a 10% per-match leak chance that generates evidence independently. Rivals under investigation may flip and expose you (50% chance). This prevents the deadlock where mutual blackmail makes collusion risk-free.

#### Ignore

**Effect:** No interaction. Relationship drifts toward 0 over time (-2 per season if positive, +2 per season if negative). Safe but forfeits opportunities.

### 4.5 Relationship Dynamics

| Relationship Range | Status | Interaction Options |
|--------------------|--------|-------------------|
| +50 to +100 | Ally | Collude, share intel, vouch in tribunal |
| +10 to +49 | Friendly | Can propose collusion, trade favors |
| -9 to +9 | Neutral | Standard interactions only |
| -10 to -49 | Hostile | Will refuse collusion. May expose you opportunistically. |
| -50 to -100 | Enemy | Will actively seek to expose you. May player-tap your squad. Counter-bids aggressively in auctions. |

**Relationship modifiers per action:**

| Action | Relationship Change |
|--------|-------------------|
| Expose them | -50 |
| Collude with them | +20 |
| Beat them in a match | -3 |
| Lose to them | +2 |
| Help them avoid investigation (vouch) | +15 |
| Outbid them on a marquee player | -10 |
| Ignore them for a full season | Drift toward 0 |

### 4.6 Cross-Season Persistence

When a season ends:

- Rival alignment shifts by their tendency (e.g., Shark drifts -5, Purist drifts +5).
- Relationships carry forward but decay 20% toward 0.
- Rivals who received Season Suspension are replaced by a new rival next season.
- Rivals who were in the same league for 3+ seasons develop "history" — their decisions weight past interactions more heavily.

---

## 5. Auction System

### 5.1 Base Mechanics

Each season begins with an **auction** to build squads. The auction is the core acquisition mechanic and where many corruption decisions surface.

#### Purse

| League Tier | Base Purse (coins) | Max Squad Size | Min Squad Size |
|-------------|-------------------|----------------|----------------|
| Tier 4 (Gully Cricket) | 1000 | 15 | 11 |
| Tier 3 (Syed Mushtaq Ali) | 2000 | 16 | 11 |
| Tier 2 (IPL Challenger) | 3500 | 17 | 12 |
| Tier 1 (Champions League) | 5000 | 18 | 13 |

Purse is modified by **sponsor tier** (see Section 1.3) and **budget injections** (see Section 2.2).

#### Bidding Rules

- **Base price** for each card is set by rarity (see Section 7.6).
- **Bid increment:** 10 coins (Gully/SMA), 20 coins (IPL Challenger), 50 coins (Champions).
- **Bid timer:** 8 seconds per bid. If no counter-bid, card is sold.
- **Pass:** A manager can pass on any card. Once passed, cannot re-enter bidding for that card.
- **Unsold:** If no manager bids at base price, card goes to the **unsold pool** and returns in the accelerated round.

### 5.2 Auction Rounds

| Round | Cards Available | Special Rules |
|-------|----------------|--------------|
| **Marquee** (Round 1) | 10 cards, all Legendary or Epic rarity | Each manager can win max 2 marquee cards. Base prices are 2x normal. |
| **General** (Rounds 2-5) | 15 cards per round, mixed rarity | Standard rules. |
| **Accelerated** (Round 6) | All unsold cards + 10 new Common cards | Base prices reduced by 30%. Bid timer reduced to 5 seconds. |

**[v2] Auction Session Splitting:** A full 6-round auction is too long for a single session (10-15 minutes). The auction can be split across multiple sessions:
- **Quick Auction mode (default):** Rounds auto-progress. AI bids resolve instantly (no timer for AI-only bids). Player only bids on cards they tap "interested" on. Reduces full auction to 3-5 minutes.
- **Full Auction mode (opt-in):** Watch every bid in real-time. 10-15 minutes. For players who enjoy the auction drama.
- **Auto-Draft mode:** AI builds your squad based on priorities you set (batting-heavy, bowling-heavy, balanced). Instant. For players who just want to play matches.

**RTM (Right to Match):** Before the auction, each manager can tag **up to 2 players from their previous season's squad** as RTM candidates. When that player comes up in auction, after bidding concludes, the RTM holder can **match the winning bid** to retain the player. Costs the winning bid amount from their purse. RTM is announced publicly (rivals know which players you're protecting).

**[v2] Offline Grace:** If a player loses connection mid-auction, the game auto-bids on their behalf using a simple heuristic: bid up to 1.5x base price on cards matching squad gaps, pass on others. The player sees a summary of auto-bids when they reconnect.

### 5.3 Auction AI (Rival Bidding)

Rivals bid according to their **squad needs** and **personality**:

| Personality | Bidding Behavior |
|-------------|-----------------|
| Purist | Bids methodically. Won't overpay. Stops at 1.5x base price. |
| Pragmatist | Bids based on team gaps. Will push to 2x for a critical need. |
| Shark | Bids aggressively to deny rivals. Will push to 2.5x for spite. Uses auction leaks. |
| Coward | Conservative bidder. Rarely exceeds 1.3x. Hoards purse. |
| Politician | Mirrors the highest bidder's strategy. Drops out strategically to build alliances. |

### 5.4 Corruption Layer in Auctions

| Corrupt Action | Mechanic | Detection Risk |
|----------------|----------|----------------|
| **Auction Leak** | See one rival's remaining purse before a round. Shown as a tooltip. | Low (5% evidence chance) |
| **Bid Manipulation** | Force a rival to overbid on a card you don't want (you bid, they counter, you drop — they've spent more than planned). Not a favor; just strategy. | None (legitimate tactic) |
| **Planted Agent** | A card in the auction is secretly loyal to you. If a rival buys them, that player has a hidden "mole" tag — leaks rival's strategy to you for 3 matches, then gets "injured" (removed from rival's squad). Costs 200 black money. | 15% evidence chance when mole activates |
| **Insider Info** | Part of Scout Intel favor. See hidden stats (loyalty, greed) before bidding. | 5% evidence chance |
| **Budget Injection** | +500 coins to purse from mafia. Must throw a match later. | 15% evidence chance |

### 5.5 Clean vs Corrupt Auction Strategy

| Path | Advantage | Disadvantage |
|------|-----------|--------------|
| **Clean** | Better sponsor purse (+15-30%). Retain high-loyalty players easily. High-loyalty overseas players prefer clean managers. | Smaller total budget. No intel advantage. |
| **Corrupt** | Mafia injections. Intel on rivals. Planted agents. | Purse penalty from sponsor tier. Debts created. High-loyalty players may refuse to join. |

**Design intent:** Neither path is strictly better for auctions. Clean managers have more reliable but smaller budgets. Corrupt managers have volatile but potentially larger budgets with hidden costs.

---

## 6. Match Simulation System

### 6.1 Overview

Matches are **auto-simulated** with results determined by input factors. The player does not control ball-by-ball action. Instead, they make **pre-match strategic decisions** and watch outcomes unfold as a narrated summary.

**Match Duration (real-time):** 45-90 seconds for the simulation summary. Skip option available (instant result with 10-second summary).

### 6.2 Pre-Match Decisions

Before each match, the player sets:

| Decision | Options | Impact |
|----------|---------|--------|
| **Batting Order** | Arrange top 6 batters from squad | Top-order players face more balls, higher impact on result |
| **Bowling Strategy** | Aggressive / Balanced / Defensive | Aggressive: +10% wickets, +15% runs conceded. Defensive: opposite. |
| **Key Matchup** | Assign 1 bowler to target 1 rival batter | If stats favor your bowler, +20% chance of dismissing that batter |
| **Captain Choice** | Select captain from squad (must have Captaincy trait) | Captain's leadership stat adds 0-5% team performance |
| **Pitch Read** | Bat first / Bowl first | Correct read (based on hidden pitch type) gives +5% overall performance |
| **[v2] DRS Strategy** | Save review / Use early | 1 review per innings. Can counter umpire-influence fixes. See Section 6.6. |
| **[v2] Impact Player** | Select 1 bench player as substitute | Can replace 1 playing XI member between innings. See Section 6.7. |

### 6.3 Simulation Engine

The match is resolved as a **series of phase outcomes**, not ball-by-ball:

#### Phases (T20 format)

| Phase | Overs | Key Stats Used | Active Batters |
|-------|-------|----------------|----------------|
| **Powerplay** | 1-6 | Batting: aggression. Bowling: pace/swing. | Batting positions 1-3 |
| **Middle Overs** | 7-14 | Batting: rotation. Bowling: spin/variation. | Batting positions 3-5 (overlap with PP dismissals) |
| **Death Overs** | 15-20 | Batting: power. Bowling: yorker/death bowling. | Batting positions 5-7+ (remaining batters) |

#### Score Calculation (per phase)

```
// Step 1: Calculate raw batting output
Active_Batter_Stats = Sum of (each active batter's batting stat * form_modifier)
form_modifier = 0.6 + (form / 250)    // form 0 = 0.6x, form 50 = 0.8x, form 100 = 1.0x... 
                                        // wait, recalibrate: form 50 = 1.0x (baseline)
form_modifier = 0.6 + (form * 0.008)   // form 0 = 0.6x, form 50 = 1.0x, form 100 = 1.4x

Base_Runs = Active_Batter_Stats * Phase_Batting_Multiplier / num_active_batters * run_scale
run_scale = 3.5  // tuning constant to produce realistic T20 phase scores

// Step 2: Calculate bowling reduction
Active_Bowler_Stats = Sum of (each active bowler's bowling stat * form_modifier * bowling_type_modifier)
Bowling_Reduction = Active_Bowler_Stats * Phase_Bowling_Multiplier / num_active_bowlers * reduction_scale
reduction_scale = 2.0  // tuning constant

// Step 3: Calculate phase result
Phase_Runs = max(0, Base_Runs - Bowling_Reduction + Random(-12, +12))
Bowling_Advantage = max(0, Active_Bowler_Stats - Active_Batter_Stats * 0.7)
Phase_Wickets = min(3, floor(Bowling_Advantage / 25) + Random(0, 1))

// Step 4: Wickets reduce subsequent phases
// Each wicket lost shifts remaining batters down the order
// If 10 wickets fall before death overs, innings ends (all out)
Total_Runs = sum of all Phase_Runs, capped if all out
```

**[v2] Key fixes:**
- Runs floored at 0 (no negative runs)
- Active batters defined per phase (positions 1-3, 3-5, 5-7+)
- Wickets cap at 3 per phase (prevents unrealistic collapses)
- Bowling Advantage explicitly defined
- Second innings uses identical calculation but with a **chase modifier**: if chasing team needs < 8 runs/over, batting multiplier +5%. If > 10 runs/over, bowling multiplier +10% (pressure).

**Phase Multipliers:**

| Phase | Batting Multiplier | Bowling Multiplier |
|-------|-------------------|-------------------|
| Powerplay | 1.3 | 0.9 |
| Middle | 1.0 | 1.1 |
| Death | 1.4 | 1.0 |

#### Bowling Type Modifiers (per pitch)

**[v2 NEW — replaces flat +15% pitch bonus]**

| Pitch Type | Pace Bowling Modifier | Spin Bowling Modifier | Batting Modifier |
|------------|----------------------|----------------------|-----------------|
| **Seaming** | **+25%** | **-35%** | -5% |
| **Turning** | **-25%** | **+30%** | -5% |
| **Flat** | +0% | +0% | +10% |
| **Dew (night match)** | -10% (2nd innings only) | -15% (2nd innings only) | +8% (2nd innings only) |

This means 11 spinners on a seaming pitch get a brutal -35% bowling effectiveness — they will get destroyed. Conversely, an all-pace attack on a turning pitch loses -25%. You **must** build a balanced squad for varying conditions.

#### Additional Modifiers

| Factor | Effect |
|--------|--------|
| Home advantage | +5% overall performance for higher-seeded team |
| Form | See form_modifier formula above |
| Morale | Team morale (0-100) applies a -10% to +10% modifier |
| Team chemistry | If alignment matches squad loyalty average: +5% |
| Captain bonus | Captain leadership stat / 20 = % bonus (max +5%) |
| **[v2] Experience** | Players with experience > 70: +3% in clutch phases (death overs, super overs) |
| **[v2] Overseas synergy** | If 3+ overseas players in XI: -2% chemistry (communication friction). If 4 overseas: -5%. Balances the overseas cap. |

### 6.4 Corruption Layer in Matches

#### Fixed Moments

When a match fix is active, the simulation engine inserts **fixed moments**:

| Fix Type | Simulation Effect | Failure Chance |
|----------|------------------|----------------|
| Match Fix (Win) | +30 runs to your total OR -30 runs from opponent | 10% base failure chance, modified by player loyalty |
| Match Fix (Lose) | -30 runs from your total OR +30 runs to opponent | 5% failure chance (easier to lose) |
| Umpire Influence | 2 additional wickets given in your favor | 15% failure chance. **[v2] Can be countered by opponent's DRS review.** |
| Player Tap (on rival) | Target player's stats reduced by 40% for this match | 20% failure chance (based on target's loyalty) |

#### Fix Failure

When a fix **fails**, one of these happens:

| Outcome | Chance | Effect |
|---------|--------|--------|
| Player refuses (loyalty check) | Based on player's loyalty stat | Fix doesn't apply. Player's loyalty +10 (proud of refusing). No evidence. |
| Player performs obviously badly | 40% of failures | Fix applies partially (-15 instead of -30), but generates **Caught on Camera** evidence (weight 5). |
| Player reports you | 10% of failures (only if loyalty > 80) | Fix doesn't apply. +25 heat. Automatic evidence generated. |

**Loyalty Check Formula:**

```
Fix Success Chance = 100 - (Player Loyalty * 0.8) + (Player Greed * 0.3)
```

A player with Loyalty 90 and Greed 10: Success = 100 - 72 + 3 = 31% chance of success.
A player with Loyalty 20 and Greed 80: Success = 100 - 16 + 24 = 108% = guaranteed success.

### 6.5 Emergent Drama

The simulation engine has a **drama injection** system for memorable moments:

| Trigger Condition | Drama Event | Chance |
|-------------------|-------------|--------|
| Run difference < 10 in death overs | **Last Over Thriller** — extended narration, outcome weighted toward dramatic finish | 40% |
| Scores tied after 20 overs | **Super Over** — separate mini-simulation using best batter vs best bowler | 100% (forced) |
| One player scores > 50% of team runs | **Heroic Innings** — player gets +10 form for next match | 100% (triggered) |
| Fixed match + drama trigger | **Fix Tension** — the fix might unravel. Extra narrative tension. +5% fix failure chance. | 30% |
| Rival's star player vs your star bowler | **Marquee Duel** — highlighted matchup, stat bonuses for winner | 25% |
| **[v2] Rain event** | **Rain Interruption** — match truncated to reduced overs (simplified DLS). Both teams' remaining overs cut by 30-50%. Pace bowlers lose advantage (wet ball). | 8% per match |

### 6.6 [v2 NEW] DRS System

Each team gets **1 DRS review per innings**. The player chooses pre-match whether to save it or use it aggressively.

| DRS Usage | Effect |
|-----------|--------|
| **Counter umpire fix** | If opponent used Umpire Influence, your DRS has a 70% chance of overturning one of the 2 fixed wickets. This is the primary counter to umpire corruption. |
| **Challenge dismissal** | If your key batter was dismissed in a tight call, DRS has a 50% chance of overturning it (batter stays). |
| **Failed review** | Review used up with no benefit. No penalty. |

**Design intent:** DRS gives clean players a tool to fight corruption without needing to be corrupt themselves. If a clean player suspects umpire fixing, they can burn their DRS to counter it.

### 6.7 [v2 NEW] Impact Player Substitution

Between innings, the batting team can **substitute 1 player from their bench** into the playing XI, replacing any one player. This mirrors the IPL's Impact Player rule.

| Constraint | Details |
|------------|---------|
| Timing | Between innings only (not mid-innings) |
| Limit | 1 substitution per match |
| Who | Any bench player can replace any XI player |
| Why | Allows tactical pivots: bring in an extra batter if chasing big, or a specialist bowler if defending |
| Overseas rule | The substitution must not push overseas count above 4 |

### 6.8 Post-Match Effects

| Outcome | Effect |
|---------|--------|
| **Win** | +50 coins, +3 league points, +5 morale, +2 fan loyalty |
| **Loss** | +20 coins (participation), +0 league points, -5 morale, -1 fan loyalty |
| **Win (clean, alignment > +30)** | Bonus: +2 alignment, +20 coins |
| **Win (fixed)** | No morale boost. High-loyalty players: -3 morale each. Heat per fix table. |
| **Loss (fixed, deliberate)** | +300 black money earned. Morale -10. Fan loyalty -5. |
| **Super Over Win** | +80 coins, +5 morale, +5 fan loyalty |
| **Fix Failure (exposed)** | No win/loss modifier. +25 heat. Morale -15. Fan loyalty -10. |
| **[v2] Rain-affected win** | +40 coins (reduced), +3 league points, +3 morale |

---

## 7. Card / Player System

### 7.1 Core Stats

Every player card has **10 stats** (7 primary + 3 corruption/meta):

| Stat | Description | Range | Primary Use |
|------|-------------|-------|------------|
| **Batting** | Run-scoring ability | 0-99 | Determines runs in simulation phases |
| **Bowling** | Wicket-taking and economy | 0-99 | Determines bowling reduction and wickets |
| **Fielding** | Catching, ground fielding | 0-99 | Reduces opponent runs by 0-5% based on team average |
| **Fitness** | Injury resistance, stamina | 0-99 | Low fitness = higher injury chance. Fatigue accumulator. |
| **Form** | Current performance level (volatile) | 0-100 | Scales all stats by 60-140% |
| **[v2] Experience** | Matches played, composure under pressure | 0-99 | +3% in clutch moments (death overs, super overs). Reduces form volatility. |
| **Loyalty** | Resistance to corruption | 0-99 | Determines fix success/failure, bribe resistance |
| **Greed** | Susceptibility to money | 0-99 | Determines bribe cost and corruption acceptance |

**[v2] Additional Card Properties:**

| Property | Type | Description |
|----------|------|-------------|
| **Origin** | Domestic / Overseas | **Max 4 overseas in playing XI** (IPL's defining constraint) |
| **Bowling Type** | Pace / Spin / N/A | Determines pitch modifier interaction (Section 6.3) |
| **Captaincy** | Boolean (trait) | Only players with Captaincy trait can be selected as captain. Not all players can captain. |
| **Leadership** | 0-99 (only if Captaincy = true) | Captain's contribution to team performance. Rare trait — ~15% of cards have it. |

### 7.2 Stat Interactions

**Loyalty and Greed are inversely correlated but not perfectly.** A player can have moderate loyalty AND moderate greed (conflicted). The four archetypes:

| Archetype | Loyalty | Greed | Behavior |
|-----------|---------|-------|----------|
| **The Patriot** | 80-99 | 0-30 | Won't accept bribes. Will report corruption. Expensive to buy in auction. |
| **The Mercenary** | 0-30 | 70-99 | Cheap to bribe. Will flip to highest bidder. Unreliable in fixes (might take counter-bribes). |
| **The Conflicted** | 40-60 | 40-60 | Unpredictable. Might accept, might refuse. Creates tension. |
| **The Professional** | 70-90 | 0-20 | Won't accept bribes but also won't report you. Minds their own business. |

### 7.3 Form System

Form is the only stat that changes frequently:

| Event | Form Change |
|-------|-------------|
| Match win | +5 |
| Match loss | -3 |
| Heroic innings / 3+ wickets | +10 |
| Dropped catch / expensive over | -5 |
| Benched for a match | -3 |
| Rest for a match (if fitness < 40) | +5 |
| Team corruption exposed | -8 (high loyalty players), +3 (low loyalty players) |
| Consecutive wins (3+) | +3 per additional win |
| Consecutive losses (3+) | -5 per additional loss |

**Form Range:** Clamped to 0-100. Starting form for a new season: **50 + random(-10, +10)**.

**[v2] Experience reduces form volatility:** Players with experience > 60 have form changes scaled by 0.7x (they're steadier). High-experience players don't swing wildly between 30 and 90 form — they hover near their baseline.

### 7.4 [v2 NEW] Fatigue & Workload Management

Playing consecutive matches accumulates fatigue:

| Consecutive Matches | Fitness Effect |
|--------------------|----------------|
| 1-3 | No effect |
| 4-5 | -3 fitness per match |
| 6+ | -5 fitness per match, +5% injury risk |

**Resting** a player (benching for 1 match) resets their consecutive match counter and restores +5 fitness.

This forces squad rotation, makes bench depth matter, and mirrors real IPL workload debates (resting Bumrah before playoffs). Low-fitness players become liabilities if overplayed.

### 7.5 Morale

Morale is a **team-wide stat** (0-100), not per-player. It affects all players equally.

| Event | Morale Change |
|-------|--------------|
| Match win | +5 |
| Match loss | -5 |
| Win streak (3+) | +3 per additional win |
| Loss streak (3+) | -5 per additional loss |
| Corruption exposed publicly | -15 |
| Player seized by mafia | -10 |
| Tribunal (any verdict except cleared) | -10 |
| Tribunal (cleared) | +10 |
| Sign a marquee player | +5 |
| Lose a player to injury | -3 |
| Manager alignment shift > 20 in one season | -5 (instability) |
| Charity donation | +3 |

**Morale Effect on Performance:** (Morale - 50) / 500 = performance modifier. At morale 100: +10%. At morale 0: -10%. At morale 50: neutral.

### 7.6 Card Rarity Tiers

| Rarity | Stat Range (batting or bowling primary) | Base Auction Price | Drop Rate (packs) | Cricket Archetype Examples |
|--------|----------------------------------------|-------------------|-------------------|---------------------------|
| **Common** | 30-50 | 30 coins | 55% | Domestic player, uncapped talent, net bowler |
| **Uncommon** | 45-65 | 60 coins | 25% | IPL squad player, useful domestic performer |
| **Rare** | 60-75 | 120 coins | 12% | Established international, IPL regular |
| **Epic** | 72-88 | 250 coins | 6% | Star all-rounder, match-winner, franchise player |
| **Legendary** | 85-99 | 500 coins | 2% | All-time great archetype, generational talent |

**All-rounder bonus:** Players with both batting and bowling > 55 get a hidden +3% performance modifier (versatility premium).

### 7.7 Player Roles & Squad Constraints

Each card has a primary role that determines where they slot in the squad:

| Role | Required Stats | Squad Limit |
|------|---------------|-------------|
| **Top-Order Batter** | Batting > 60 | 3-5 in playing XI |
| **Middle-Order Batter** | Batting > 50, can have bowling | 2-3 |
| **Finisher** | Batting power (special sub-stat) | 1-2 |
| **All-Rounder** | Batting > 50, Bowling > 50 | 1-3 |
| **Pace Bowler** | Bowling > 55, pace type | 2-4 |
| **Spinner** | Bowling > 55, spin type | 1-3 |
| **Wicketkeeper** | Fielding > 60, keeping sub-stat | Exactly 1 |

**Playing XI Constraints:**
- 11 players must be selected.
- At least 5 bowling options (players with bowling > 40).
- At least 6 batting options (players with batting > 40).
- Exactly 1 keeper.
- **[v2] Maximum 4 overseas players.** This is the single most important squad-building constraint — it forces agonizing trade-offs between overseas stars.
- **[v2] Minimum 2 pace bowlers and 1 spinner** (prevents cheese strategies with all-spin or all-pace).

**[v2 NEW] Squad Salary Cap / Stat Ceiling:**

To prevent whales from stacking full Legendary XIs that dominate auto-sim:

| League Tier | Max Total Primary Stats (batting+bowling sum for XI) | Effect |
|-------------|------------------------------------------------------|--------|
| Gully Cricket | 700 | If over cap, lowest-form player auto-benched |
| Syed Mushtaq Ali | 850 | Same |
| IPL Challenger | 1000 | Same |
| Champions League | No cap | Unrestricted at top tier |

This means at lower tiers, you can't field 11 Legendaries — you must balance star players with role players. At Champions League tier, everything goes, rewarding collection depth.

### 7.8 Corruption Interaction with Players

| Scenario | Player Response (based on loyalty/greed) |
|----------|----------------------------------------|
| You ask a player to underperform (fix) | Loyalty check (see Section 6.4). If refused, relationship strain (-10 to player hidden relationship stat). |
| You bribe a rival's player (player tap) | Greed check: if target greed > 50, success likely. Cost = (100 - greed) * 3 black money. |
| Your corruption is exposed | Players with loyalty > 70: form -10, morale contribution -5. Players with loyalty < 30: no effect. |
| You sign a player with conflicting alignment | If your alignment is < -30 and player loyalty > 70: player refuses to join (even if you win auction bid). You lose the bid amount. |

**Player Loyalty Drift:** Over a season, player loyalty drifts toward the team's culture:
- If manager alignment > +30: all players' loyalty drifts +2 per season.
- If manager alignment < -30: all players' loyalty drifts -3 per season.
- Grey zone: no drift.

---

## 8. Economy & Progression

### 8.1 Currencies

| Currency | Type | Earned From | Spent On | Risk |
|----------|------|------------|----------|------|
| **Coins** | Soft (primary) | Match rewards, season milestones, daily login, ads | Auction bids, legal defense, charity, **card upgrades, training facility, scout network** | None |
| **Gems** | Hard (premium) | Real-money purchase, rare achievements, season pass | Card packs, cosmetics, season pass, instant cooldown resets | None |
| **Black Money** | Corruption | Mafia favors (earning type), match fix payouts | Bribe costs, favor purchases, evidence destruction, fixer activation | Holding > 500 generates heat. Seizure risk during tribunal. |

#### Currency Earning Rates

| Source | Coins | Gems | Black Money |
|--------|-------|------|-------------|
| Match win | 50 | 0 | 0 |
| Match loss | 20 | 0 | 0 |
| Match fix (lose deliberately) | 0 | 0 | 300 |
| Daily login | 30 | 1 (day 7 bonus: **free Rare card pack**) | 0 |
| Season milestone (every 5 wins) | 100 | 3 | 0 |
| League promotion | 500 | 10 | 0 |
| **Rewarded ad** | **40** | **1 (cap 2/day)** | 0 |
| Tribunal cleared | 0 | 5 | 0 |
| Expose a rival | 50 | 2 | 0 |
| **[v2] Win streak (3+)** | **+20 per additional win** | 0 | 0 |
| **[v2] Daily quest completion** | **30-80 (varies)** | **1-3** | 0 |

**[v2 CHANGES]:**
- Rewarded ad: 20 → **40 coins + 1 gem** (capped at 5 ad watches/day for coins, 2/day for gems). This makes ads worth watching.
- Day-7 login: 5 gems → **free Rare card pack** (collection dopamine on day 7 drives retention).
- Added win streak coin bonus and daily quests as engagement hooks.

#### [v2 NEW] Coin Sinks (Anti-Inflation)

The original design had coins accumulating with no meaningful sink between auctions. Fixed:

| Sink | Cost | Effect | Frequency |
|------|------|--------|-----------|
| **Card Upgrade** | 100-500 coins per level | +1 to a chosen primary stat (batting OR bowling). Max +5 per card. | Per card, per season |
| **Training Facility** | 300 coins per season | All players start season with +5 morale (55 instead of 50). | Once per season |
| **Scout Network** | 200 coins per auction | See 2 additional cards before each auction round (better draft picks). | Per auction |
| **Net Practice** | 50 coins per session | Assign a player to specific training: +3 temporary bonus to one phase (e.g., death bowling) for 2 matches. | Between matches |
| **Charity Donation** | 20% of match earnings | +5 alignment, +3 morale, +2 fan loyalty | Per match (opt-in) |

#### Black Money Rules

- **Cannot be converted to coins or gems.** Ever. It exists in a parallel economy.
- **Holding threshold:** Above 500 black money, you generate +2 heat per 3 matches. Above 1000, +5 per 3 matches.
- **Tribunal seizure:** If convicted (Points Deduction or worse), 50% of held black money is confiscated.
- **Laundering (future feature placeholder):** A potential future mechanic where black money can be slowly converted to coins at a steep loss ratio (10:1) via a "shell company" staff card. Not in v1.

### 8.2 Gem Economy (Monetization)

| Item | Gem Cost | Notes |
|------|----------|-------|
| Card Pack (3 cards, guaranteed Uncommon+) | 50 gems | Standard pack |
| Premium Pack (5 cards, guaranteed Rare+) | 150 gems | |
| Legendary Pack (5 cards, guaranteed Epic+, 10% Legendary) | 400 gems | |
| **Season Pass** | **250 gems** | 30-day pass, daily rewards, exclusive cosmetic. **Premium track includes 80 gems back.** |
| Cooldown Reset (any favor/fixer) | 20 gems | |
| Extra RTM Slot | 100 gems | 3rd RTM for next auction |
| Cosmetic: Team Kit | 80 gems | Visual only |
| Cosmetic: Stadium Theme | 120 gems | Visual only |
| Cosmetic: Manager Avatar | 50 gems | Visual only |
| **[v2] Cosmetic: Card Border/Frame** | **40 gems** | Visual only — custom frame for player cards |
| **[v2] Cosmetic: Celebration Animation** | **60 gems** | Visual only — custom victory celebration |
| **[v2] Cosmetic: League Promotion Effect** | **100 gems** | Visual only — flashy promotion animation |

**[v2 CHANGES]:**
- Season Pass: 500 → **250 gems** (achievable in ~7 weeks F2P). Premium track returns 80 gems, making effective cost 170 gems for repeat buyers.
- Added 3 cosmetic types for deeper cosmetic monetization (pure margin).

**[v2 NEW] Pity System (Guaranteed Pulls):**

| Pack Type | Pity Counter | Guarantee |
|-----------|-------------|-----------|
| Standard Pack (50 gems) | Every 50 packs (150 cards) | 1 guaranteed Legendary |
| Premium Pack (150 gems) | Every 10 packs (50 cards) | 1 guaranteed Epic |
| Legendary Pack (400 gems) | Every 5 packs (25 cards) | 1 guaranteed Legendary |

Pity counter is **persistent across sessions** and visible in the shop UI ("Next guaranteed Legendary in 23 packs"). Resets to 0 when a Legendary drops naturally. Published per Google Play policy.

**[v2 NEW] Duplicate Card → Fragment System:**

When a pack contains a card already owned:

| Duplicate Rarity | Fragments Received |
|-----------------|-------------------|
| Common | 5 fragments |
| Uncommon | 15 fragments |
| Rare | 40 fragments |
| Epic | 100 fragments |
| Legendary | 300 fragments |

**Fragment redemption:** 100 fragments = 1 Uncommon pull. 250 = 1 Rare pull. 500 = 1 Epic pull. 1000 = 1 Legendary pull. This ensures every pack has value, even late in collection.

**[v2 NEW] Starter Pack (one-time purchase):**

| Item | Content | Price (INR) | Value vs normal |
|------|---------|-------------|-----------------|
| **Starter Pack** | 100 gems + 1 Rare card + 500 coins | ₹29 | ~3x normal value |

Available only once. Designed as the lowest-friction first purchase. Converting a player from F2P to "has spent money" is the highest-leverage conversion in mobile gaming.

**Gem Pricing (INR):**

| Bundle | Gems | Price (INR) | Bonus |
|--------|------|-------------|-------|
| **[v2] Starter** | **100** | **29** | **One-time, ~3x value** |
| Starter | 60 | 79 | — |
| **[v2] Bridge** | **150** | **149** | **+10%** |
| Value | 300 | 329 | +15% |
| Popular | 700 | 699 | +25% |
| Premium | 1500 | 1299 | +35% |
| Whale | 4000 | 2999 | +50% |

**[v2] Added ₹29 starter and ₹149 bridge** tier to smooth the spending curve. The gap between ₹79 (60 gems) and ₹329 (300 gems) was too large.

**F2P Gem Income:** A free player earns approximately **40-55 gems per week** (up from 30-40) through daily logins, milestones, achievements, daily quests, and rewarded ad gems. This means a season pass every ~5-6 weeks, or a standard pack every 7-9 days.

**Pay-to-compete analysis:** Gems buy card packs (speed up collection) and cosmetics. They do NOT buy:
- Alignment shifts
- Heat reduction
- Black money
- Favor access
- Tribunal defense
- Match results

**[v2] Squad salary cap (Section 7.7)** further limits whale advantage at lower tiers.

### 8.3 Season Structure

A **season** = 1 league cycle. Length: **14 matches** (each rival played once home, once away, minus yourself = 9 rivals x... simplified to 14 matches for pacing).

| Season Phase | Matches | Key Events |
|-------------|---------|------------|
| **Pre-Season** | 0 | Auction, squad building, strategy setting |
| **Early Season** | 1-4 | Establishing form. Mafia makes first contact. Lower stakes. |
| **Mid-Season** | 5-10 | Playoff race heats up. Favor offers increase. Rival dynamics crystallize. |
| **Late Season** | 11-14 | Desperation phase. Debts come due. Investigations peak. |
| **Playoffs** | +2-3 matches | Top 4 qualify. Semi-final + Final. No match fixing allowed in playoffs (mafia won't touch it — too visible). Heat generation 2x for any corrupt action. |
| **Off-Season** | 0 | Results, rewards, carry-forward calculations |

**Real-time season duration:** At 1 match per session (3-5 minutes per session), a season takes approximately **17 sessions** (14 league + 3 playoffs). At 2-3 sessions/day, a season lasts roughly **6-9 days**. This provides a satisfying weekly-ish loop.

**[v2] Session-end cliffhanger:** After each match, display a teaser for the next match: "Your next opponent is The Shark. He's been talking to the bookies..." This creates pull-back curiosity.

### 8.4 What Resets vs What Carries Forward

| Element | Carries Forward? | Notes |
|---------|-----------------|-------|
| Player cards in squad | No — new auction each season | RTM allows retaining 2 |
| Coins | Yes | Full carry-forward |
| Gems | Yes | Full carry-forward |
| Black money | Yes | But risky to stockpile |
| Manager alignment | Yes | Carries between seasons |
| Heat | Partial | Resets to 50% of current value |
| Evidence | No | Cleared at season end (statute of limitations) |
| **Active debts** | **Yes** | **Debts persist across seasons. Deadlines continue. [v2] Season Suspension does NOT clear debts.** |
| Rival relationships | Partial | 80% carry-forward (20% decay toward 0) |
| Rival alignment | Yes | They evolve too |
| League position / tier | Yes | Promotion/relegation based on final standing |
| Fan loyalty | Partial | Resets to 50 + (carry_value - 50) * 0.3 |
| Morale | Reset | Starts at 50 each season (55 with Training Facility) |
| Player form | Reset | 50 +/- 10 random each season |
| Season pass progress | No | Resets each season |
| Staff cards (fixers, etc.) | Yes | Persistent collection |
| **[v2] Card upgrades** | **Yes** | Upgrades persist on cards you retain via RTM |
| **[v2] Pity counter** | **Yes** | Persists across seasons |

### 8.5 League Tiers & Progression

| Tier | Name | Entry Requirement | Rival Difficulty | Unique Feature |
|------|------|------------------|-----------------|----------------|
| **4** | **Gully Cricket** | Default starting tier | Weak squads, predictable AI, low corruption | Tutorial-like. Only 2 favor types available (Scout Intel, Auction Leak). Squad salary cap: 700. |
| **3** | **Syed Mushtaq Ali** | Finish top 4 in Gully Cricket | Moderate squads, 2-3 rivals take favors | Full favor table unlocked. First exposure to rival collusion. Squad salary cap: 850. |
| **2** | **IPL Challenger** | Finish top 4 in SMA | Strong squads, 4-5 corrupt rivals, aggressive bidding | Planted agents available. Rival exposure/collusion mechanics fully active. Media story investigations possible. Squad salary cap: 1000. |
| **1** | **Champions League** | Finish top 2 in IPL Challenger | Elite squads, all rivals are dangerous, mafia is aggressive | All mechanics at maximum intensity. Tribunal consequences are harshest. But rewards are highest. **No squad salary cap.** |

**[v2] Tier names changed** from Bronze/Silver/Gold/Diamond to cricket-authentic names. "Ranji" (red-ball cricket) was wrong for a T20 game. "Gully Cricket" → "Syed Mushtaq Ali" (India's real domestic T20) → "IPL Challenger" → "Champions League" maps to recognizable Indian cricket hierarchy.

**Relegation:** Finishing bottom 2 in any tier drops you down one tier. Your coins and gems carry, but you face weaker competition (and earn less).

**Promotion rewards:**

| Promotion | Reward |
|-----------|--------|
| Gully → SMA | 200 coins, 5 gems, 1 Rare card pack |
| SMA → IPL Challenger | 400 coins, 10 gems, 1 Epic card pack |
| IPL Challenger → Champions | 800 coins, 20 gems, 1 Legendary card pack |

### 8.6 Progression Pacing

**Target milestones for a free-to-play player:**

| Milestone | Expected Time |
|-----------|--------------|
| Complete first season | ~1 week |
| Reach Syed Mushtaq Ali | ~2 weeks |
| First mafia interaction | **Match 2 (mini-auction mafia tease)** |
| First full auction | Season 1, pre-season |
| First tribunal | Season 2-3 (if corrupt path) |
| Reach IPL Challenger | ~4-6 weeks |
| Full staff card collection | ~8-12 weeks |
| Reach Champions League | ~10-16 weeks |
| Reach alignment extreme (-80 or +80) | ~6-10 seasons of sustained play |

### 8.7 [v2 NEW] Daily Quest System

Quests rotate daily and provide engagement hooks between matches:

| Quest Type | Examples | Reward |
|------------|---------|--------|
| **Match quests** | "Win 2 matches today" / "Win a match without using any favors" | 50-80 coins + 1-2 gems |
| **Strategy quests** | "Win a match bowling first" / "Use DRS successfully" | 40-60 coins + 1 gem |
| **Collection quests** | "Upgrade a player card" / "Open a pack" | 30-50 coins |
| **Corruption quests** | "Refuse a mafia favor" / "Expose a rival" | 50-80 coins + 2 gems |
| **Social quests** | "Share a match result" | 20 coins |

3 quests available daily. Completing all 3 grants a **bonus chest** (50 coins + 2 gems + random card). Quest completion is the primary gem income source for F2P players.

---

## 9. [v2 NEW] Clean Path Mechanics

**Problem:** Clean players interact with ~40% fewer systems than corrupt players (no mafia, no investigations, no debt management). This creates a retention gap for moral-compass players.

**Solution:** Clean-exclusive mechanics that give the clean path its own depth, not just "corruption minus the fun parts."

### 9.1 Clean-Exclusive Systems

| Mechanic | Requirement | Effect |
|----------|-------------|--------|
| **Mentorship Program** | Alignment > +40 | Select a Common/Uncommon player to mentor each season. That player gains +3 to two stats per season. After 3 seasons of mentoring, the player's rarity tier upgrades (e.g., Common → Uncommon). Long-term investment. |
| **Fan Vote Awards** | Alignment > +30 | At season end, fans vote for "Manager of the Season" among clean managers. Winner gets +200 coins, +5 gems, +10 fan loyalty, exclusive cosmetic. Creates competition among clean players. |
| **Sponsor Events** | Alignment > +50 | Premium sponsors offer special events: charity matches (exhibition game, +100 coins, +5 alignment), brand campaigns (+50 coins/match for 3 matches), media tours (+fan loyalty). |
| **Academy Pipeline** | Alignment > +60 | Unlock an "academy" that generates 1 free Common/Uncommon card per season with higher-than-normal loyalty (70+). Clean managers build loyal squads from the ground up. |
| **Integrity Shield** | Alignment > +70 | If a rival attempts to player-tap your squad, there's a 30% chance the attempt is automatically blocked (your players refuse the bribe). This is a passive defense against corruption. |

### 9.2 Clean vs Corrupt — System Parity

| System Area | Corrupt Player | Clean Player |
|------------|---------------|-------------|
| Squad building | Mafia intel + injections | Sponsor purse + academy + mentorship |
| Opponent disruption | Player tap, planted agents | Expose rivals, integrity shield |
| Recovery from setbacks | Favors, fixes | Fan loyalty bonuses, sponsor events |
| Long-term power | Black money hoard | Mentored players, loyal squads |
| Engagement depth | Debt management, heat management, tribunal | Mentorship, fan votes, sponsor events, academy |

**Design intent:** Clean isn't "easy mode without the cool stuff." It's a different game — slower power curve, more stable, with unique rewards that corrupt players can't access.

---

## 10. [v2 NEW] Onboarding & Progressive Disclosure

### 10.1 First-Session Flow (Revised)

The original flow (3 tutorial matches → mafia contact) buried the auction behind 5+ minutes of gameplay. Revised:

```
MINUTE 0-1: MINI-AUCTION (the hook)
  Player opens the game. After a 3-second splash, they're thrown into a
  mini-auction: 5 cards, 3 rival managers bidding against them, 200-coin
  budget. No tutorial text — just "TAP TO BID" over the bid button.
  
  The auction is exciting, immediate, and teaches the core mechanic by doing.
  Player builds a partial squad in 60 seconds.

MINUTE 1-2: FIRST MATCH (the payoff)
  Immediate match with the squad they just built. Pre-match decisions are
  auto-set (one decision unlocked: choose batting order only). Match sim
  runs in 30 seconds (skip-by-default for first match). Win is likely
  but not guaranteed — depends on auction choices.
  
  Player sees: their auction decisions led to this result. Connection made.

MINUTE 2-3: THE WHISPER (the hook deepens)
  Post-match, a mysterious message: "Interesting squad you built. I know
  things about your next opponent that could help. No charge — this time."
  
  Free Scout Intel reveals a hidden stat about an opponent's player.
  Player realizes: information is power. The next favor won't be free.

MINUTE 3-5: SECOND MATCH + FULL HUB UNLOCK
  Second match with one more pre-match decision unlocked (bowling strategy).
  After match 2, the full Hub opens with all tiles visible.
  
  Session complete. Player has experienced: auction, match, mafia tease.
  Under 5 minutes. Core loop demonstrated.
```

### 10.2 Progressive Disclosure Rules

Not everything should be visible on the Hub from day 1. Systems reveal as the player encounters them:

| Element | Visible From | Trigger |
|---------|-------------|---------|
| Coins | Match 1 | Always visible |
| Squad Strength | Match 1 | Always visible |
| Next Match tile | Match 1 | Always visible |
| Batting Order | Match 1 | First pre-match decision |
| Bowling Strategy | Match 2 | Second pre-match decision |
| Full pre-match decisions | Match 3+ | All decisions unlocked |
| Alignment meter | After first corrupt/clean action | First alignment shift |
| Gems counter | After first gem earned | Day 2 login |
| Black Money counter | After first mafia interaction | First favor accepted |
| Heat indicator | After first corrupt action | Heat > 0 |
| Fan Loyalty bar | Season 1, match 5 | Mid-season unlock |
| Rival profiles | Season 1, match 3 | After facing 3 different rivals |
| Collusion/Expose buttons | Season 2+ (SMA tier) | After first rival exposure or collusion opportunity |
| Staff cards | Season 1, match 7 | First fixer card earned |
| Card upgrades | Season 1 end | Post-season unlock |
| DRS | Season 2 | Tier 3 unlock |
| Impact Player | Season 2 | Tier 3 unlock |

### 10.3 Tutorial Overlays

Coach-mark style overlays (dark backdrop + spotlight + text bubble) for key moments:

| Moment | Overlay Text | Spotlight Target |
|--------|-------------|-----------------|
| First auction bid | "Tap to bid. Watch your budget." | Bid button |
| First batting order set | "Drag your best batters to the top." | Batting order slots |
| First mafia offer | "The underworld is watching. Accept... or refuse." | Favor offer panel |
| First alignment shift | "Your choices have consequences. This meter tracks them." | Alignment bar |
| First heat gain | "Careful. Suspicion is building." | Heat indicator |
| First debt created | "You owe them now. Pay before the deadline." | Debt card |

Overlays are **one-time** per account. Dismissable with a single tap. No walls of text.

---

## Appendix A: System Interaction Map

The ten systems interlock as follows:

```
                    ┌─────────────┐
                    │  ALIGNMENT  │
                    └──────┬──────┘
                           │ affects
              ┌────────────┼────────────┐
              │            │            │
              v            v            v
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ SPONSORS │ │  MAFIA   │ │    FANS      │
        │ (purse)  │ │ (favors) │ │ (loyalty)    │
        └────┬─────┘ └────┬─────┘ └──────┬───────┘
             │            │              │
             v            v              v
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ AUCTION  │ │  HEAT    │ │   MORALE     │
        │ (squad)  │ │(exposure)│ │  (team)      │
        └────┬─────┘ └────┬─────┘ └──────┬───────┘
             │            │              │
             └────────────┼──────────────┘
                          v
                    ┌──────────┐
                    │  MATCH   │◄── DRS, Impact Player,
                    │  ENGINE  │    Rain, Bowling Types
                    └────┬─────┘
                         │ results feed back to
                         v
              ┌──────────────────────┐
              │ ALIGNMENT, HEAT,     │
              │ ECONOMY, RIVALS,     │
              │ FORM, MORALE,        │
              │ FATIGUE, CLEAN PATH  │
              └──────────────────────┘
```

Every system feeds into at least two others. No system exists in isolation.

---

## Appendix B: Balance Levers

These are the numbers most likely to need tuning during playtesting:

| Lever | Current Value | Tuning Range | What It Controls |
|-------|--------------|-------------|-----------------|
| Heat decay per match | -2 | -1 to -5 | How quickly you can "go clean" |
| Evidence generation % | 5-65% per action | 2-80% | How risky corruption feels |
| Debt deadline (matches) | 1-5 | 1-8 | Pressure of mafia debts |
| Fix success formula | Loyalty * 0.8 - Greed * 0.3 | Coefficients adjustable | How reliable corruption is |
| Sponsor purse bonus | -25% to +30% | -40% to +50% | Clean vs corrupt economy |
| Black money heat threshold | 500 | 300-1000 | How much dirty cash you can safely hold |
| Alignment shift per action | -12 to +10 | -20 to +15 | Speed of alignment change |
| Tribunal defense base | 5 | 3-10 | How easy it is to beat investigations |
| Season length (matches) | 14 | 10-20 | Session commitment per season |
| Form volatility | +/-10 per event | +/-5 to +/-15 | How swingy player performance is |
| **[v2] Bowling type pitch modifier** | **+25/-35%** | **+15/-25% to +40/-50%** | **How much pitch matters for squad balance** |
| **[v2] Squad salary cap** | **700-1000** | **600-1200** | **How much whale stacking is allowed per tier** |
| **[v2] Collusion leak chance** | **10% per match** | **5-20%** | **How risky collusion is** |
| **[v2] Fix-lose cooldown** | **5 matches** | **3-8** | **How farmable black money is** |
| **[v2] Evidence Destruction meta-evidence** | **100%** | **80-100%** | **How safe evidence cleanup is** |

---

*End of Core Systems Design Document v2.0*
