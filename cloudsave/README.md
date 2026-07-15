# Cloud Save & Backup (playtest #4)

Progress lives in `localStorage` — it dies with a cleared cache or a new phone.
This gives players two ways to keep it, both billing-model-agnostic and needing
**no auth server**. It's also the prerequisite the value-spender persona named
before any real-money purchase (BUILD-SHEET Path C, C2).

## Two layers

1. **Backup code (always available, zero infra).** Settings → *Cloud Save & Backup*
   → **Show Backup Code** produces a `CUSAVE1:…` string that encodes the entire
   save (checksummed so a mistyped/truncated code fails cleanly). The player copies
   it somewhere safe (Notes / WhatsApp to self). **Restore This Save** pastes it back
   on any device. Works fully offline.

2. **Cloud sync (optional, one 3-minute deploy).** When a cloud endpoint is
   configured, the section also shows the player's short **Save Code** (e.g. `K7P2QM`)
   with **Back Up to Cloud** / **Restore by Code**. Back up on the old phone, type
   the code on the new one.

## Turn on cloud sync

1. Deploy `apps-script-cloudsave.gs` as a Google Apps Script web app (steps at the
   top of that file), copy the `/exec` URL.
2. In `prototype/index.html` set:
   ```js
   var CLOUDSAVE_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec';
   ```
3. Push (GitHub Pages redeploys). Saves now round-trip through a "CU CloudSaves"
   sheet in your Drive, keyed by Save Code.

With no endpoint set, the cloud buttons stay hidden and the backup-code layer is
unaffected — exactly the pre-feature behavior otherwise.

## Protocol

```
POST {op:'put', code, save}  -> {ok:true}
POST {op:'get', code}        -> {ok:true, save} | {ok:false, error:'not-found'}
```

`save` is the opaque `CUSAVE1:` string; the endpoint never parses it, so no personal
data is interpreted server-side. Only game state and an anonymous Save Code leave the
device — part of the clean-asset story for a buyer.

## Test hook

`localStorage['cu_cloudsave_endpoint']` overrides the compiled endpoint (used by the
E2E suite with a mocked route). Game-side API, all on `window`:
`exportSaveString()`, `importSaveString(str)`, `parseSaveString(str)`,
`ensureSaveCode()`, `cloudSaveEnabled()`, `cloudBackup(cb)`, `cloudRestore(code, cb)`.
