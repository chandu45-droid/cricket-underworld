/**
 * Cricket Underworld — free cloud-save endpoint (Google Apps Script)
 * ==================================================================
 * Stores one save slot per Save Code in a Google Sheet, so a player can
 * back up on one device and restore on another. No auth server, free.
 *
 * DEPLOY (one time, ~3 minutes):
 *  1. https://script.google.com → New project. Paste this whole file, save.
 *  2. Deploy → New deployment → type "Web app":
 *       Execute as: Me   ·   Who has access: Anyone
 *     → Deploy → copy the /exec URL.
 *  3. Put that URL in CLOUDSAVE_ENDPOINT in prototype/index.html
 *     (or set localStorage 'cu_cloudsave_endpoint' for a quick test).
 *  4. First request auto-creates a "CU CloudSaves" spreadsheet in Drive.
 *
 * PROTOCOL (matches the game's cloudBackup/cloudRestore):
 *   POST {op:'put', code, save}  → {ok:true}          (upsert slot)
 *   POST {op:'get', code}        → {ok:true, save}     or {ok:false, error:'not-found'}
 *
 * The `save` value is the opaque CUSAVE1: backup string the game produces;
 * this endpoint never parses it, so no personal data is interpreted here.
 */

function _sheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('bookId');
  var book = null;
  if (id) { try { book = SpreadsheetApp.openById(id); } catch (e) { book = null; } }
  if (!book) {
    book = SpreadsheetApp.create('CU CloudSaves');
    props.setProperty('bookId', book.getId());
    var sh0 = book.getSheets()[0];
    sh0.setName('saves');
    sh0.appendRow(['code', 'save', 'updated_at']);
  }
  return book.getSheetByName('saves');
}

function _findRow(sh, code) {
  var codes = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 0), 1).getValues();
  for (var i = 0; i < codes.length; i++) {
    if (String(codes[i][0]) === code) return i + 2;
  }
  return -1;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var code = String(body.code || '').trim().toUpperCase();
    if (!code) return _json({ ok: false, error: 'no-code' });
    var sh = _sheet();

    if (body.op === 'put') {
      if (!body.save) return _json({ ok: false, error: 'no-save' });
      var row = _findRow(sh, code);
      var vals = [code, String(body.save), new Date()];
      if (row > 0) sh.getRange(row, 1, 1, 3).setValues([vals]);
      else sh.appendRow(vals);
      return _json({ ok: true, code: code });
    }

    if (body.op === 'get') {
      var r = _findRow(sh, code);
      if (r < 0) return _json({ ok: false, error: 'not-found' });
      var save = sh.getRange(r, 2).getValue();
      return _json({ ok: true, save: save });
    }

    return _json({ ok: false, error: 'bad-op' });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  // health check
  return _json({ ok: true, service: 'cu-cloudsave' });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
