/*
 * SWEET MOMENTS - GOOGLE SHEETS WEB APP
 *
 * Sheet columns:
 * Name | Email | Mobile | Location | Source | Date
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    sheet.appendRow([
      data.name || "",
      data.email || "",
      data.phone || "",
      data.location || "",
      data.source || "Google Ads Landing Page",
      new Date()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({success:true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({success:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Sweet Moments Google Sheets Web App is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
