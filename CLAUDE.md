# Cricket Underworld — Agent Entry File

Cricket auction + card strategy game for the Indian market. Players bid on cricket cards in IPL-style auctions, build squads, set strategy, and compete in auto-simulated matches.

**Platform:** HTML5/PWA, single-file (`prototype/index.html`), vanilla JS
**Audience:** Cricket-obsessed Indians, 16-35, mobile-first
**Builder:** Solo, bootstrapped, AI-assisted

## Quick Start

```bash
# Serve the game
npx serve prototype -l 8080

# Run all tests (server must be running)
npx playwright test

# Run specific tests
npx playwright test --grep "Match Engine"
```

## Hard Constraints (NON-NEGOTIABLE)

1. **Strategy over reflexes.** Every interaction is a decision, never a reaction-time test.
2. **No real player names/likenesses.** Use archetypes or fictional Indian names only.
3. **No real-money gambling.** Virtual currency only, no cash-out.
4. **Gacha rates must be published** (Google Play policy).
5. **F2P competitive.** Free players can reach every tier. Spending buys speed and style.
6. **Session-friendly.** Complete loop in 3-5 minutes.
7. **India-first.** Pricing, UX, device targets, cultural references optimized for India.
8. **Angular design.** Sharp corners (3-4px max), clip-path polygons, no rounded cards.
9. **No default/generic styling.** Every screen must look distinct and premium.
10. **Test before claiming done.** Run `npx playwright test` and verify in browser.

## Session Protocol

**Starting a session:**
1. Type `/resume` to auto-load all progress, memory, and test status
   - Or manually: read `PROGRESS.md`, `feature_list.json`, and the memory file
2. Run `npx playwright test` to verify repo is green

**During work:**
- WIP=1 — finish and verify one feature before starting next
- Update `feature_list.json` state when verification passes
- Commit after each completed feature

**Ending a session:**
1. Run `npx playwright test` — must pass
2. Update `PROGRESS.md` (completed work, decisions, next steps)
3. Update `feature_list.json` states
4. Commit and push

## Topic Docs (read when relevant)

| Doc | When to read |
|-----|-------------|
| [`docs/architecture.md`](docs/architecture.md) | File structure, tech stack, conventions, key globals |
| [`docs/testing-guide.md`](docs/testing-guide.md) | Verification commands, test patterns, how to add tests |
| [`docs/core-systems-gdd.md`](docs/core-systems-gdd.md) | Game design: alignment, auction, match sim, economy (10 systems) |
| [`docs/visual-design-system.md`](docs/visual-design-system.md) | Color palette, typography, design tokens |
| [`feature_list.json`](feature_list.json) | Machine-readable feature tracker with verification commands |
| [`PROGRESS.md`](PROGRESS.md) | Cross-session state: what's done, what's next, decisions log |

## Subagent Panel

| Agent | When to consult |
|---|---|
| **game-designer** | New mechanic, system, or progression design |
| **economy-architect** | Pricing, currency, IAP, gacha, or retention economics |
| **cricket-consultant** | Cricket-related mechanic, card design, or match simulation |
| **player-experience** | UI flow, onboarding, session design, or tutorial |
| **market-scout** | Before major feature decisions — competitive reality check |
| **balance-tester** | Last gate before committing any design — exploit/fairness check |
| **player-advocate** | Reads code + tests to find missing features, broken flows, untested paths |

**Skills:**
- `/resume` — loads all progress, memory, and test status at session start
- `/design-review` — runs a design through all review agents in parallel

## Codebase map (MANDATORY for all agents)
`prototype/index.html` is ~10,150 lines. **Read `docs/CODEBASE-MAP.md` first, grep the anchor function, read only that region. Never read the file end-to-end.**
Testing is founder-gated: do NOT run Playwright/browser verification unless the founder explicitly asks. Implement, commit, report "needs testing".
