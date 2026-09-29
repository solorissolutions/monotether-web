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
- `index.html` — Monotether home page
- `choirmaster/index.html` — ChoirMaster OS product page (`/choirmaster`)
- `script.js` — shared JS (waitlist form, footer year)
- `vercel.json` — clean URLs (`/choirmaster` instead of `/choirmaster/`)
- `styles.css` — the styles (colors live at the top in `:root`)
- `assets/` — logo mark, penguin, favicon, social share image

## Waitlist
The early access form posts to Formspree (`https://formspree.io/f/mjykjoln`).
Signups arrive by email and in the Formspree dashboard. A hidden `_gotcha`
field blocks simple bots. To change the form, update the `action` on
`#signup` in `index.html`.
