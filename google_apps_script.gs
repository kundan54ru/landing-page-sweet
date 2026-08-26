/**
 * SWEET MOMENTS - Google Sheets Lead Receiver
 *
 * SETUP:
 * 1. Create a Google Sheet.
 * 2. Rename the first sheet to "Leads" (optional; this script will create it if missing).
 * 3. In Google Sheets: Extensions -> Apps Script.
 * 4. Paste this entire code into Code.gs.
 * 5. Save.
 * 6. Deploy -> New deployment -> Web app.
 * 7. Execute as: Me.
 * 8. Who has access: Anyone.
 * 9. Deploy and copy the Web app URL.
 * 10. Paste that URL into script.js as GOOGLE_SHEETS_WEB_APP_URL.
 *
 * The sheet will contain:
 * Timestamp | Name | Email | Phone | Area / Location | Source
 */

const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "No data received." });
    }

    const data = JSON.parse(e.postData.contents);

    const name = clean(data.name);
    const email = clean(data.email);
    const phone = clean(data.phone);
    const location = clean(data.location);
    const source = clean(data.source) || "Website";

    if (!name || !email || !phone || !location) {
      return jsonResponse({ success: false, error: "Required fields are missing." });
    }

    const sheet = getLeadSheet();

    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      location,
      source
    ]);

    return jsonResponse({ success: true });

  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      error: String(error)
    });
  }
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Area / Location",
      "Source"
    ]);

    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function clean(value) {
  return String(value == null ? "" : value).trim().slice(0, 500);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
