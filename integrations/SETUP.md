# Activate demo requests in Google Sheets

The form is implemented, but submissions are disabled until a real endpoint is configured. It never reports success without the server confirming a saved row.

1. Create a private Google Sheet called **Cadence demo requests**.
2. Open **Extensions → Apps Script**. Replace the editor contents with `google-sheets.gs` from this folder.
3. In **Project Settings → Script properties**, add:
   - `SITE_ORIGIN`: `https://piyushhsainii.github.io` for this website. A full URL such as `https://piyushhsainii.github.io/cadence.github.io/` is also normalized by the supplied script. For local testing use your exact `http://localhost:PORT` origin, then change it for production. The script uses the spreadsheet it is bound to; no `SHEET_ID` property is required.
4. Choose **Deploy → New deployment → Web app**. Execute as **Me** and allow access to **Anyone**. Authorize the requested spreadsheet access. Keep the spreadsheet itself private. Some managed Google accounts restrict anonymous web apps.
5. Copy the deployed URL ending in `/exec` into `window.CADENCE_LEADS_ENDPOINT` in `leads-config.js`.
6. Publish the site files. Submit one clearly labelled test request through the dialog and verify one new row in **Demo requests**, followed by the confirmation message. Every valid submission appends a new row, including retries. Verify invalid fields and a network failure too.

If the endpoint opens an **Authorization needed** page (as in the browser network response), the deployment is not public yet. Edit the deployment, set **Execute as: Me**, set **Who has access: Anyone**, authorize the spreadsheet permission as the owner, and deploy a new version. Do not use “Only myself” or “Anyone within your organization”; those settings prevent a public GitHub Pages site from submitting. Re-test the `/exec` URL in an incognito window before testing the form.

The site submits a simple cross-origin `no-cors` POST, so it does not frame Google’s response and avoids X-Frame-Options errors. The browser cannot read an opaque cross-origin response; the UI confirms after the request completes, while the Sheet is the source of truth. Every valid submission appends a new row. No credentials belong in the website files. This is a public lead endpoint with validation and a honeypot, not an authenticated API; consider managed anti-spam protection if unsolicited submissions become a problem.

The 24-hour reply is a promise in the copy, not an automated reply or notification. Check the sheet regularly. Customer details are used only to respond to their inquiry; honor deletion requests made to your contact email.

Official deployment reference: https://developers.google.com/apps-script/guides/web

<!-- https://script.google.com/macros/s/AKfycbxJjo-SbPPgM34indREeE2FE1ZVIAujZZJgmHo00ULH38BdyHRpSo8Z4x0l-8VaLaog5w/exec -->
