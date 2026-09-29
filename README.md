# monotether-web

Landing page for **Monotether** — makers of **ChoirMaster OS**.
Tagline: *One tether, all together.*

Plain HTML + CSS, no build step.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy
Any static host works (Vercel, Netlify, GitHub Pages). Point it at the repo root.

## Files
- `index.html` — the page
- `styles.css` — the styles (colors live at the top in `:root`)
- `assets/` — logo mark, penguin, favicon, social share image
- `integrations/waitlist-google-sheet.gs` — Google Sheet waitlist script

## Waitlist → Google Sheet (10 min, one time)
1. Create a new Google Sheet (e.g. "Monotether Waitlist").
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste in
   `integrations/waitlist-google-sheet.gs`, and click **Save**.
3. **Deploy → New deployment →** gear icon **→ Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, allow the permissions, and copy the **Web app URL**
   (ends in `/exec`).
5. In `index.html`, paste it into `const SHEET_ENDPOINT = '';`.

Signups show up in a `Waitlist` tab with timestamp, email and page.
Duplicates are skipped, and a hidden field blocks simple bots.

If you edit the script later, use **Deploy → Manage deployments → Edit →
New version** so the URL stays the same.

Until `SHEET_ENDPOINT` is set, the form falls back to opening an email to
`CONTACT_EMAIL`.
