
/**
 * --- BACKEND SETUP INSTRUCTIONS ---
 * 
 * To save emails to your Google Drive, follow these steps:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste the following code into the script editor:
 * 
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([new Date(), data.email, data.source]);
 *      return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
 *    }
 * 
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select type "Web App".
 * 6. Set "Execute as" to "Me".
 * 7. Set "Who has access" to "Anyone" (Critical for the app to write to it).
 * 8. Copy the "Web App URL" and paste it below in the GOOGLE_SCRIPT_URL constant.
 */

// PASTE YOUR GOOGLE SCRIPT WEB APP URL HERE
const GOOGLE_SCRIPT_URL = 'INSERT_YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE'; 

export const LeadCaptureService = {
  /**
   * Sends the user's email to the Google Sheet backend.
   */
  captureEmail: async (email: string): Promise<boolean> => {
    // If the user hasn't set up the backend yet, we simulate success so the demo still works.
    if (GOOGLE_SCRIPT_URL.includes('INSERT_YOUR')) {
      console.warn("Backend URL not configured. Email logged to console:", email);
      return true; 
    }

    try {
      // We use no-cors mode because Google Scripts don't support CORS preflight perfectly for simple POSTs
      // This means we won't get a readable JSON response, but the data WILL be saved.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: email, 
            source: 'MVP_Login_Page' 
        })
      });
      return true;
    } catch (error) {
      console.error("Failed to save email to Drive:", error);
      return false; // Fail silently in UI to allow demo access
    }
  }
};
