# Cricket Card Strategy Game — Project Constitution

This file is the control tower for the game-design project. Auto-loaded every session.

## What we're building

A **cricket auction + card strategy** mobile game for the Indian market. Players bid on cricket player cards in IPL-style auctions, build squads, set strategy, and compete in auto-simulated matches. Core hook: auction tension + collection dopamine + strategic depth.

**Platform:** HTML5/PWA first (browser-playable, installable). Native wrapper later if traction warrants it.
**Audience:** Cricket-obsessed Indians, 16-35, mobile-first.
**Monetization model:** F2P with card packs (gacha), season/battle pass, cosmetics, rewarded ads. No pay-to-win. No real-money gambling.
**Builder:** Solo, bootstrapped, AI-assisted.

## Design principles (NON-NEGOTIABLE)

1. **Strategy over reflexes.** Every interaction is a decision, never a reaction-time test.
2. **Cricket-authentic, not cricket-simulated.** Capture the *feel*, not the physics.
3. **F2P competitive.** Free players can reach every tier. Spending buys speed and style.
4. **Session-friendly.** Complete loop in 3-5 minutes. Depth is opt-in.
5. **India-first.** Pricing, UX, device targets, and cultural references optimized for India.

## Legal constraints

- **No real player names/likenesses** unless licensed. Use archetypes or fictional players.
- **Gacha rates must be published** (Google Play policy).
- **No real-money gambling.** Virtual currency only. No cash-out.
- **Age-appropriate.** No content requiring 18+ rating.

## The team (subagents)

| Agent | When to consult |
|---|---|
| **game-designer** | Any new mechanic, system, or progression design |
| **economy-architect** | Any pricing, currency, IAP, gacha, or retention economics decision |
| **cricket-consultant** | Any cricket-related mechanic, card design, or match simulation logic |
| **player-experience** | Any UI flow, onboarding change, session design, or tutorial |
| **market-scout** | Before major feature decisions — ground them in competitive reality |
| **balance-tester** | Last gate before committing any design — stress-test for exploits and fairness |

**Skill:** `design-review` — runs a design through all 5 review agents in parallel.

## Tech approach

- Single `index.html` with Canvas rendering (proven pattern from CLAIM prototype)
- PWA with service worker for offline/install
- No framework dependencies in MVP — vanilla JS, keep it lean
- Game state in localStorage, structured for future cloud-sync

## Build phases

1. **Design lock** — GDD, economy model, card system, match sim spec (current phase)
2. **Playable prototype** — auction + match core loop, placeholder art, 20 cards
3. **Content & polish** — full card set, animations, sound, tutorial
4. **Economy integration** — IAP stubs, ad placement, season pass
5. **Soft launch** — limited release, metrics, balance tuning
6. **Scale** — marketing, content updates, competitive features
