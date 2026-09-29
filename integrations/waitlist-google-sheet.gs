/**
 * Monotether waitlist -> Google Sheet.
 *
 * Paste this into Extensions > Apps Script on your Google Sheet,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into SHEET_ENDPOINT in index.html.
 */
const SHEET_NAME = 'Waitlist';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};

    // Honeypot: real people never fill this hidden field.
    if (p.company) return json_({ ok: true });

    const email = String(p.email || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'invalid_email' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp', 'Email', 'Source']);

    // Skip duplicates.
    const last = sheet.getLastRow();
    if (last > 1) {
      const existing = sheet.getRange(2, 2, last - 1, 1).getValues().flat();
      if (existing.indexOf(safe_(email)) !== -1) return json_({ ok: true, duplicate: true });
    }

    sheet.appendRow([new Date(), safe_(email), safe_(String(p.source || '').slice(0, 200))]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Stop values like "=..." from being run as spreadsheet formulas.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
