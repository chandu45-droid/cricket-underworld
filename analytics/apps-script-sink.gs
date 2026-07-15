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

// GET — fleet retention summary as JSON (open the /exec URL in a browser)
function doGet() {
  try {
    var sh = _book().getSheetByName('events');
    var last = sh.getLastRow();
    if (last < 2) return _json({ installs: 0, d1: null, d7: null, note: 'no data yet' });
    var data = sh.getRange(2, 2, last - 1, 5).getValues(); // uid, install_ts, event, event_ts, day_index
    var users = {}; // uid -> {installTs, days:{}}
    for (var i = 0; i < data.length; i++) {
      var uid = data[i][0], installTs = data[i][1], dayIdx = data[i][4];
      if (!users[uid]) users[uid] = { installTs: installTs, days: {} };
      if (dayIdx >= 0) users[uid].days[dayIdx] = true;
    }
    var now = Date.now();
    var installs = 0, d1Eligible = 0, d1Hit = 0, d7Eligible = 0, d7Hit = 0;
    for (var u in users) {
      installs++;
      var ageDays = Math.floor((now - users[u].installTs) / 86400000);
      if (ageDays >= 1) { d1Eligible++; if (users[u].days[1]) d1Hit++; }
      if (ageDays >= 7) { d7Eligible++; if (users[u].days[7]) d7Hit++; }
    }
    return _json({
      installs: installs,
      d1: d1Eligible ? Math.round(1000 * d1Hit / d1Eligible) / 10 + '%' : 'n/a (no cohort old enough)',
      d1_cohort: d1Eligible,
      d7: d7Eligible ? Math.round(1000 * d7Hit / d7Eligible) / 10 + '%' : 'n/a (no cohort old enough)',
      d7_cohort: d7Eligible,
      generated: new Date().toISOString()
    });
  } catch (err) {
    return _json({ error: String(err) });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
