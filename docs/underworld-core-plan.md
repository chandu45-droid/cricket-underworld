# Underworld Core Plan — Making the Fantasy the Spine

**Founder direction (2026-07-08):** *"the core game play is underworld, politicians, mafia, local leaders, other team boss bribes, police cases — majorly missing at the current structure. Also, screens need not keep the current colors — re-plan them properly."*

**Diagnosis (verified in code):** Mafia = offer menu only. Politicians = a personality tag on 2 rivals. Police = zero mentions (investigation/tribunal is abstract). Local leaders = zero. Rival bribes = one-directional collusion only. The underworld fantasy is a side-menu, not the spine.

---

## 1. The Power Web — five factions, always visible

A new hub panel (and later its own screen) showing five faction relationships at a glance, plus active threats (open police case stage, election countdown, hafta due, mafia debt clock). The player should feel the web every single session.

State: `GS.factions = { syndicate, neta, thana, bhai, bosses }` — each with `rel` (-100..100), named head character, active events.

### F1. The Syndicate (mafia) — UPGRADE existing
- Give it a face: a named don + 2 lieutenants (fictional Indian names), persistent like rivals.
- Relationship tiers unlock/lock offers; betrayal memory (refuse too many → they sabotage; owe too much → seizures already exist).
- Existing offers/debt/heat/tribunal code stays — this wraps identity around it.

### F2. The Thana (police cases) — NEW, replaces abstract investigation trigger
- Visible case pipeline: **FIR filed → evidence gathering → chargesheet → court date → verdict.**
- Named inspectors with traits: *greedy* (bribable, cheaper), *ambitious* (bribable, expensive, may double-cross), *incorruptible* (must fight in court).
- Counterplay per stage: bribe inspector (heat risk), Lawyer fixer (already built), Evidence Destruction (mafia offer already built), political pressure (needs Neta favor).
- Existing tribunal becomes the court stage of a case.

### F3. The Neta (politicians) — NEW
- Election cycle every ~8 matches. Fund a candidate (coins) → if they win: heat decay bonus, facility clearances, court influence. Lose: opposition targets you (random FIRs, facility raids).
- They DEMAND too: fundraiser match (give up gate revenue), throw a match in their constituency, sign their nephew (a bad card into your squad).
- Fictional party names only. No real parties, colors kept generic.

### F4. The Bhai (local leaders) — NEW
- Your home ground has an area don. Pay hafta (recurring small cost) or court him.
- Friendly: crowd support (+home morale), ticket racket income, pitch prepared your way.
- Hostile: crowd trouble (match penalty), pitch tampering against you, blocked facility upgrades.

### F5. Rival Team Bosses — EXTEND existing collusion
- Two-way bribes: rivals offer YOU money to throw matches (accept = coins + align down + heat; refuse = rivalry escalates). You can offer bribes to rival bosses pre-match.
- Uses existing rival personality/relationship code.

## 2. Loop integration (session rule stays 3–5 min)
Every match week surfaces **at least one underworld event card** (offer / demand / case-stage advance / election news / hafta due) → one decision → match. Strategy over reflexes; every event is a decision, never a timer.

## 3. Zone-based color re-plan (founder freed the palette)

| Zone | Screens | Palette |
|---|---|---|
| Empire (base) | Hub, Power Web | Noir black + gold (current) |
| Underworld | Mafia offers, Grey Zone, debts | Blood red + smoke black, film-noir |
| Law | Police cases, tribunal/court | Cold steel blue + khaki, file/document texture |
| Politics | Neta screen, elections | Ivory + deep amber, poster style, fictional party colors |
| Streets | Local leader, home ground | Sodium-lamp orange + concrete grey |
| Cricket | Match, squad, XI, league, scorecard | Broadcast green + floodlight white/gold |
| Economy | Market, packs, vault | Neon teal + dark |

Implementation: per-zone CSS custom properties (`--zone-accent`, `--zone-glow`, `--zone-bg`) layered on the existing token system. Angular design language unchanged (3–4px corners, clip-paths).

## 4. Execution order (merges with the 10-screen redesign queue)

1. **Power Web hub panel + `GS.factions` skeleton** — underworld visible from session one
2. **Police case pipeline** (F2) + Law-zone styling
3. **Rival boss two-way bribes** (F5) — smallest lift, extends live code
4. **Grey Zone / Mafia screen redesign** (original queue #5) with Underworld-zone palette + Syndicate faces (F1)
5. **Politicians + elections** (F3) + Politics zone
6. **Local leaders** (F4) + Streets zone
7. Remaining redesign screens (tutorial, league, XI, scorecard, market, scout, facilities, settings) each in their zone palette

Each step: designed → built → `npx playwright test` green (114 + new tests) → committed individually → pushed.

## 5. Guardrails (unchanged, non-negotiable)
- Fictional names/parties only; no real people, teams, or political parties
- Virtual currency only, no cash-out; gacha rates published
- Getting caught = setback, not game over
- Systems-driven; alignment stays a spectrum
