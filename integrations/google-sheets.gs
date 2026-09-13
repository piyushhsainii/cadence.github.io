// Paste into a Google Sheet's Extensions > Apps Script editor.
// In Project Settings > Script properties, set SHEET_ID and SITE_ORIGIN.
// SITE_ORIGIN must be the exact website origin, e.g. https://yourdomain.com (no path).
function doPost(e) {
  const config = PropertiesService.getScriptProperties();
  const origin = config.getProperty('SITE_ORIGIN');
  const p = e && e.parameter || {};
  const requestId = String(p.requestId || '');
  let ok = false;
  if (!origin || p.origin !== origin || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return HtmlService.createHtmlOutput('Invalid request.');
  }
  const lock = LockService.getScriptLock();
  try {
    const name = String(p.name || '').trim(), email = String(p.email || '').trim();
    const company = String(p.company || '').trim(), message = String(p.message || '').trim();
    const services = ['Content that converts', 'Brand & website revamp', 'Product & MVP development', 'Social media performance marketing', 'A mix of services'];
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || company.length > 200 || !message || message.length > 2000 || !services.includes(p.service) || p.consent !== 'yes' || p.website_check) throw Error('Invalid fields');
    lock.waitLock(10000);
    const book = SpreadsheetApp.openById(config.getProperty('SHEET_ID'));
    const sheet = book.getSheetByName('Demo requests') || book.insertSheet('Demo requests');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Request ID', 'Received at', 'Name', 'Email', 'Company / website', 'Service', 'Project', 'Contact consent']);
      sheet.setFrozenRows(1);
    }
    const duplicate = sheet.getLastRow() > 1 && sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(requestId).matchEntireCell(true).findNext();
    // Neutralize spreadsheet formulas in all visitor-supplied strings.
    const text = value => /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
    if (!duplicate) sheet.appendRow([requestId, new Date(), text(name), text(email), text(company), text(p.service), text(message), 'Yes']);
    SpreadsheetApp.flush(); ok = true;
  } catch (error) {
    // Do not echo personal details or internal errors into the browser.
    ok = false;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
  const payload = JSON.stringify({ type: 'cadence-lead', requestId: requestId, ok: ok }).replace(/</g, '\\u003c');
  const destination = JSON.stringify(origin).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + payload + ',' + destination + ');</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
