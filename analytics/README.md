# Analytics — from on-device events to fleet D1/D7 (Pillar 3)

The game logs events to `localStorage` (`cu_analytics_v1`) — that part shipped as F4.
Pillar 3 adds the **remote sink** so events from *all* players aggregate into the
fleet D1/D7 number the sale needs.

## How it flows

```
game (trackEvent) ──► localStorage queue ──► flushAnalytics() POST ──► collector ──► Google Sheet
                        (sentIdx cursor)      boot · 4s debounce ·        (apps-script-sink.gs)
                                              pagehide sendBeacon
```

- **No endpoint configured → exactly the old behavior** (local-only, offline PWA untouched).
- Failed sends stay queued and retry on the next flush; duplicates are possible
  by design (dedupe by `uid`+`event_ts` if it ever matters).
- First-touch **UTM params + referrer** are captured once per install
  (`?utm_source=reddit&utm_campaign=wave1` → `acquisition` event + `firstTouch`),
  so every distribution wave in the kit is attributable.

## Turn it on (~3 minutes, free)

1. Deploy `apps-script-sink.gs` as a Google Apps Script web app
   (steps are at the top of that file) and copy the `/exec` URL.
2. In `prototype/index.html`, set:
   ```js
   var ANALYTICS_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec';
   ```
3. Push to master (GitHub Pages redeploys). Done — every player's events now
   land in the "CU Analytics" spreadsheet in your Drive.

## Read the numbers

- **Fleet D1/D7:** open the `/exec` URL in a browser — returns JSON:
  `{"installs": 213, "d1": "16.4%", "d7": "4.2%", ...}` (cohort-aware: users too
  young for a window are excluded from its denominator).
- **Raw events:** the `events` sheet (one row per event, with UTM columns).
- **On-device debug:** in the game's console, `computeRetention()` shows this
  device's view; `getAnalytics()` dumps the local queue.

## Quick smoke test (before distributing)

In the deployed game's console:

```js
localStorage.setItem('cu_analytics_endpoint', 'https://script.google.com/macros/s/XXXX/exec');
location.reload();            // boot flush fires
// … then check the spreadsheet for rows, and GET the /exec URL for the summary
```

## Privacy note

Only an anonymous per-install id (`u_…`), event names, timestamps, and coarse
UTM/referrer strings leave the device. No personal data, no device fingerprint —
keep it that way; it is part of the "clean asset" story for a buyer.
