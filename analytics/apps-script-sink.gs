/**
 * Cricket Underworld — free analytics collector (Google Apps Script)
 * ===================================================================
 * Receives the game's JSON event beacons and appends them to a Google
 * Sheet, plus computes fleet D1/D7 retention on demand.
 *
 * DEPLOY (one time, ~3 minutes, free):
 *  1. Go to https://script.google.com → New project.
 *  2. Delete the default code, paste this entire file, save.
 *  3. Deploy → New deployment → type "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     → Deploy → copy the /exec URL.
 *  4. Paste that URL into ANALYTICS_ENDPOINT in prototype/index.html
 *     (or set localStorage 'cu_analytics_endpoint' for a quick test).
 *  5. First POST auto-creates a spreadsheet named "CU Analytics" in
 *     your Drive with an `events` sheet.
 *
 * READ THE NUMBERS:
 *  - Open the "CU Analytics" spreadsheet for raw events.
 *  - Visit the /exec URL in a browser (GET) for a JSON retention
 *    summary: installs, actives, fleet D1 / D7.
 */

var SHEET_NAME = 'CU Analytics';

function _book() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('bookId');
  var book;
  if (id) {
    try { book = SpreadsheetApp.openById(id); } catch (e) { book = null; }
  }
  if (!book) {
    book = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('bookId', book.getId());
    var sh = book.getSheets()[0];
    sh.setName('events');
    sh.appendRow(['received_at', 'uid', 'install_ts', 'event', 'event_ts', 'day_index', 'props', 'utm_source', 'utm_campaign', 'referrer']);
  }
  return book;
}

// POST — the game's beacon: {uid, created, firstTouch, from, events:[{n,t,p}]}
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body || !body.uid || !Array.isArray(body.events)) return _json({ ok: false });
    var sh = _book().getSheetByName('events');
    var ft = body.firstTouch || {};
    var rows = [];
    var installDay = new Date(body.created); installDay.setHours(0, 0, 0, 0);
    for (var i = 0; i < body.events.length; i++) {
      var ev = body.events[i];
      var dayIdx = Math.floor((ev.t - installDay.getTime()) / 86400000);
      rows.push([
        new Date(), body.uid, body.created, ev.n, ev.t, dayIdx,
        ev.p ? JSON.stringify(ev.p) : '',
        ft.source || '', ft.campaign || '', ft.ref || ''
      ]);
    }
    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
    return _json({ ok: true, stored: rows.length });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// GET — fleet retention + "what did they try" aggregates as JSON
// (open the /exec URL in a browser, or point analytics/dashboard.html at it).
// Backward compatible: installs/d1/d7 keys are unchanged from the original
// shape; everything else is additive.
function doGet() {
  try {
    var sh = _book().getSheetByName('events');
    var last = sh.getLastRow();
    if (last < 2) return _json({ installs: 0, d1: null, d7: null, note: 'no data yet' });
    // uid, install_ts, event, event_ts, day_index, props (columns B:G)
    var data = sh.getRange(2, 2, last - 1, 6).getValues();
    var users = {}; // uid -> {installTs, days:{}, lastSeen, totalEvents, sessions}
    var eventCounts = {}; // event name -> count
    var screens = {}; // screen name -> count
    var tutStep = {}; // step index -> count
    var matches = { started: 0, completed: 0, wins: 0, losses: 0, ties: 0 };
    var auctions = { entered: 0, firstBid: 0, completed: 0 };
    var packs = { opened: 0, byType: {} };
    var reckoning = { shown: 0, choices: {} };
    var seasons = { ended: 0, promoted: 0, relegated: 0, survived: 0 };

    for (var i = 0; i < data.length; i++) {
      var uid = data[i][0], installTs = data[i][1], ev = data[i][2],
          evTs = data[i][3], dayIdx = data[i][4], propsRaw = data[i][5];
      if (!users[uid]) users[uid] = { installTs: installTs, days: {}, lastSeen: 0, totalEvents: 0, sessions: 0 };
      var u = users[uid];
      if (dayIdx >= 0) u.days[dayIdx] = true;
      if (evTs > u.lastSeen) u.lastSeen = evTs;
      u.totalEvents++;
      if (ev === 'session_start') u.sessions++;

      eventCounts[ev] = (eventCounts[ev] || 0) + 1;
      var props = _parseProps(propsRaw);

      if (ev === 'screen_view' && props.screen) screens[props.screen] = (screens[props.screen] || 0) + 1;
      if (ev === 'tutorial_step' && props.step !== undefined) tutStep[props.step] = (tutStep[props.step] || 0) + 1;
      if (ev === 'auction_entered') auctions.entered++;
      if (ev === 'auction_first_bid') auctions.firstBid++;
      if (ev === 'auction_completed') auctions.completed++;
      if (ev === 'match_started') matches.started++;
      if (ev === 'match_completed') {
        matches.completed++;
        if (props.result === 'win') matches.wins++;
        else if (props.result === 'loss') matches.losses++;
        else if (props.result === 'tie') matches.ties++;
      }
      if (ev === 'pack_opened') {
        packs.opened++;
        var pt = props.type || 'unknown';
        packs.byType[pt] = (packs.byType[pt] || 0) + 1;
      }
      if (ev === 'reckoning_shown') reckoning.shown++;
      if (ev === 'reckoning_choice' && props.branch) reckoning.choices[props.branch] = (reckoning.choices[props.branch] || 0) + 1;
      if (ev === 'season_ended') {
        seasons.ended++;
        if (props.result === 'PROMOTED') seasons.promoted++;
        else if (props.result === 'RELEGATED') seasons.relegated++;
        else if (props.result === 'SURVIVED') seasons.survived++;
      }
    }

    var now = Date.now();
    var installs = 0, d1Eligible = 0, d1Hit = 0, d7Eligible = 0, d7Hit = 0;
    var devices = [];
    for (var uidKey in users) {
      installs++;
      var rec = users[uidKey];
      var ageDays = Math.floor((now - rec.installTs) / 86400000);
      if (ageDays >= 1) { d1Eligible++; if (rec.days[1]) d1Hit++; }
      if (ageDays >= 7) { d7Eligible++; if (rec.days[7]) d7Hit++; }
      devices.push({
        uid: uidKey,
        installDay: new Date(rec.installTs).toISOString().slice(0, 10),
        lastActive: new Date(rec.lastSeen).toISOString().slice(0, 10),
        sessions: rec.sessions,
        totalEvents: rec.totalEvents
      });
    }
    // Most-recently-active first; cap to 200 rows so the payload stays small.
    devices.sort(function(a, b) { return b.lastActive < a.lastActive ? -1 : b.lastActive > a.lastActive ? 1 : 0; });
    devices = devices.slice(0, 200);

    return _json({
      installs: installs,
      d1: d1Eligible ? Math.round(1000 * d1Hit / d1Eligible) / 10 + '%' : 'n/a (no cohort old enough)',
      d1_cohort: d1Eligible,
      d7: d7Eligible ? Math.round(1000 * d7Hit / d7Eligible) / 10 + '%' : 'n/a (no cohort old enough)',
      d7_cohort: d7Eligible,
      sessions: eventCounts['session_start'] || 0,
      funnel: {
        tutorial_started: eventCounts['tutorial_started'] || 0,
        tutorial_step: tutStep,
        tutorial_done: eventCounts['tutorial_done'] || 0,
        tutorial_skipped: eventCounts['tutorial_skipped'] || 0
      },
      screens: screens,
      auctions: auctions,
      xi_confirmed: eventCounts['xi_confirmed'] || 0,
      matches: matches,
      seasons: seasons,
      packs: packs,
      store: {
        opened: eventCounts['store_opened'] || 0,
        intent: eventCounts['store_intent'] || 0,
        purchases: eventCounts['purchase_stub'] || 0
      },
      reckoning: reckoning,
      devices: devices,
      generated: new Date().toISOString()
    });
  } catch (err) {
    return _json({ error: String(err) });
  }
}

function _parseProps(raw) {
  if (!raw) return {};
  try { var p = JSON.parse(raw); return p && typeof p === 'object' ? p : {}; } catch (e) { return {}; }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
