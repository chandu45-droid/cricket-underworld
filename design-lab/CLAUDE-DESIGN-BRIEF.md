# Cricket Underworld — Claude Design (web) Brief

> For the **Claude Design** web app (Anthropic Labs), the repo-connected workflow —
> supersedes the old paste-one-screen flow in `CLAUDE-DESIGN-PROMPT.txt` (that prompt's
> *content* is still the source brief; this file adapts it for the connect-repo tool).

## Step 0 — connect the repo
In Claude Design → **Connect codebase / GitHub** → point it at:
`https://github.com/chandu45-droid/cricket-underworld` (public — no extra auth).

## Step 1 — paste this framing FIRST (before asking for any screen)

You are designing for **Cricket Underworld**, a premium mobile game. I have connected
the repo. Two hard rules about how to read it:

1. **Design-system source of truth = `docs/visual-design-system.md`.** Extract the
   palette, typography, angular/chamfered language, depth planes, and gold-austerity
   rules from THAT document. It is the north star.
2. **Do NOT reproduce the current implementation.** The existing `index.html` /
   `prototype` screens are flat dark-blue glass panels — I rated them **1/10**. They
   are what I want to *replace*, not clone. Treat them only as a content/structure
   reference (what data each screen shows), never as a visual reference.

The category jump I need — every screen must deliver all five:
1. **Art & world** — lit, deep, atmospheric (floodlit-stadium × crime-noir), not flat glass.
2. **Material** — physical, expensive surfaces: brushed metal, gold foil, embossed edges, faceted accents. No plain rectangles.
3. **A hero moment** — one dominant focal element (money/net-worth) staged like a trophy, in solid gold.
4. **Money that feels expensive** — currency is the star: big, gold, celebratory, climbing.
5. **Gold austerity** — solid gold on ONLY two things (hero number + primary CTA); restraint everywhere else so gold reads as valuable.

**Non-negotiable identity:** angular design language (sharp 3–4px corners, clip-path
facets, no rounded cards); fictional everything (no real cricketer names/faces/likenesses —
original illustrated archetypes only); India-first; mobile portrait 390×844.

**Ceiling to match:** EA Sports FC Ultimate Team card material, IPL auction broadcast
presentation, Dream11 polish, crime-noir color grading. Make it look like a $10M game.

## Step 2 — ask for screens one at a time

Generate these, in this order (full content specs are in `CLAUDE-DESIGN-PROMPT.txt`):
1. **HUB** — empire net-worth hero, 3 currencies (Coins/Gems/Black Money), daily streak, next-rival battle card, faction "Power Web", START AUCTION gold CTA, bottom nav.
2. **AUCTION** — live current-bid hero in gold, player card up for bid, bid controls + quick-raise chips, purse pressure, rival bidders, going-once countdown.
3. **SQUAD** — total squad market value hero, grid of premium foil player cards (OVR + rarity), role/rarity filter chips, captain marker, inspiring empty-slot state.

## Guardrail (read before you implement anything)
The premium UI redesign is **PAUSED** under the ship-and-measure pivot (CORE-MEMORY §7).
This brief is for **design exploration + investor-pitch demo assets** — it does not by
itself un-pause implementation into the codebase. Ship a redesign only on the founder's
explicit "ship it."
