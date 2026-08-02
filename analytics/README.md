# Analytics — from on-device events to "who logged in and what they tried"

The game logs events to `localStorage` (`cu_analytics_v1`) on every device — that
part is always on, works fully offline, and never leaves the device by default.
This doc covers the **remote sink** (events from *all* players land in one Google
Sheet) and the **dashboard** (a human-readable view of that Sheet) — together
these are what let you, the founder, actually see who opened the game and what
they tried.

## How it flows

```
game (trackEvent) ──► localStorage queue ──► flushAnalytics() POST ──► collector ──► Google Sheet
                        (sentIdx cursor)      boot · 4s debounce ·        (apps-script-sink.gs)
                                              pagehide sendBeacon              │
                                                                               ▼
                                                                    analytics/dashboard.html
                                                                    (fetches the /exec URL,
                                                                     renders it as charts/tables)
```

- **No endpoint configured → exactly the old behavior** (local-only, offline PWA
  untouched, nothing ever transmitted). This is the state the repo ships in.
- Failed sends stay queued and retry on the next flush; duplicates are possible
  by design (dedupe by `uid`+`event_ts` if it ever matters).
- First-touch **UTM params + referrer** are captured once per install
  (`?utm_source=reddit&utm_campaign=wave1` → `acquisition` event + `firstTouch`),
  so every distribution wave in the kit is attributable.

## What's actually instrumented

Every meaningful "what did they try" moment fires a `trackEvent(name, props)`
call — small, non-identifying payloads only (no names, no free text the player
typed). Current event list:

| Event | Fires when | Where in `prototype/index.html` |
|---|---|---|
| `session_start`, `return_visit` | app boot | `analyticsSessionStart()` |
| `acquisition` | first UTM/referrer capture | `captureAcquisition()` |
| `tutorial_started` | onboarding overlay first shown | `showTutorial()` |
| `tutorial_step` | each "Next" tap, with the step index left | `nextTutStep()` |
| `tutorial_done` / `tutorial_skipped` | tutorial finished vs. skipped/dismissed early | `closeTutorial()` |
| `screen_view` | any bottom-nav screen change | `goScreen()` |
| `auction_entered` / `auction_first_bid` / `auction_completed` | auction room opened / first bid this session / auction resolved | `startAuction()`, `placeBid()`, `endAuction()` |
| `xi_confirmed` | Playing XI + captain confirmed | `confirmSquadSelect()` |
| `match_started` / `match_completed` | match kicks off / result decided (win/loss/tie + match number) | `startMatch()`, `endMatch()` |
| `season_ended` | season result decided (promoted/relegated/survived) | `endSeason()` |
| `daily_login_claim` | daily login reward claimed | `claimDailyLogin()` |
| `pack_opened` | a card pack opened, by type | `openPack()` |
| `store_opened` / `store_intent` | Vault opened / buy tapped (no billing live yet, nothing charged) | `showStore()`, `requestPurchase()` |
| `purchase_stub` | a (stubbed, non-charging) purchase completes once billing is live | `completePurchase()` |
| `odds_view` | odds panel opened | `showOdds()` |
| `reckoning_shown` / `reckoning_choice` | the Reckoning climax card appears / which branch the player picked | `bindUwClimax()` |

## Turn it on

Three steps, roughly **5 minutes total, ₹0**. Do them in order.

### 1. Deploy the collector (~3 min, one time)

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the default code, paste the entire contents of
   `analytics/apps-script-sink.gs`, save (Ctrl/Cmd+S).
3. **Deploy → New deployment**:
   - Select type **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy**. The first time, Google will ask you to authorize the
     script (it's your own script — click through the "unverified app"
     warning, it's expected for a personal script).
   - Copy the `/exec` URL it gives you — you'll paste it twice below.
4. You don't need to create the Sheet yourself: the first POST from the game
   auto-creates a spreadsheet named **"CU Analytics"** in your Google Drive,
   with an `events` sheet.

### 2. Turn on the game's sender (~1 min)

1. Open `prototype/index.html`, search for `ANALYTICS_ENDPOINT` (there's a
   large comment block right above it signposting this exact step).
2. Change:
   ```js
   var ANALYTICS_ENDPOINT = '';
   ```
   to:
   ```js
   var ANALYTICS_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec'; // your URL from step 1
   ```
3. Commit and push to `master` — GitHub Pages redeploys and every player's
   device starts sending anonymous events to your Sheet from their next visit.

### 3. Open the dashboard (~1 min, repeatable any time)

1. Open `analytics/dashboard.html` directly in a browser (double-click the
   file, or serve the `analytics/` folder — either works, it's a static
   page with no build step).
2. Paste the **same** `/exec` URL from step 1 into the box at the top, click
   **Load**. The URL is saved in that browser's `localStorage` only — it is
   never written back into the repo.
3. Click **Refresh** any time you want the latest numbers. There is no
   auto-polling (keeps it free and simple) — reload the page or hit Refresh.

If **Load** fails with a network/CORS-looking error: double-check the
deployment's access is set to **Anyone** (not "Anyone with Google account" —
that will 401 for a plain `fetch()`), and that the URL ends in `/exec` (not
`/dev`).

## What you WILL and will NOT see

- **WILL:** anonymous distinct devices (`u_...` ids), when each first opened
  the game, when it was last active, how many sessions, and exactly which
  funnel/screen/match/story events each one fired — i.e. real answers to
  "what did they try."
- **WILL NOT:** any name, email, phone number, or IP address — none of that
  is collected, so none of it can appear. **"Who logged in" can only ever mean
  anonymous devices, not people** — this game has no login system, and that's
  the correct, privacy-safe answer for an app in this position, not a
  limitation to work around.

## Read the numbers without the dashboard

- **Fleet aggregates as raw JSON:** open the `/exec` URL directly in a
  browser (GET) — same data the dashboard renders, unformatted.
- **Raw events:** the `events` sheet in the "CU Analytics" spreadsheet — one
  row per event, with UTM columns.
- **On-device debug (your own device only):** in the game's console,
  `computeRetention()` shows this device's view; `getAnalytics()` dumps the
  local queue.

## Quick smoke test (before distributing to real testers)

In the deployed game's console:

```js
localStorage.setItem('cu_analytics_endpoint', 'https://script.google.com/macros/s/XXXX/exec');
location.reload();            // boot flush fires
// … then check the spreadsheet for rows, and load the URL in analytics/dashboard.html
```

## If you edit `apps-script-sink.gs` again later

Editing the file in this repo does **not** update the live collector by
itself — Apps Script deployments are pinned to a version. To push a code
change to the same `/exec` URL:

1. Paste the updated file into the same Apps Script project (script.google.com).
2. **Deploy → Manage deployments** → pencil/edit icon on the existing
   deployment → **Version: New version** → **Deploy**.
3. The `/exec` URL stays identical — nothing to re-paste in the game or the
   dashboard.

## Privacy note

Only an anonymous per-install id (`u_…`), event names, timestamps, and coarse
UTM/referrer strings leave the device. No personal data, no device
fingerprint — keep it that way; it is part of the "clean asset" story for a
buyer, and it's also just the right way to build this.
