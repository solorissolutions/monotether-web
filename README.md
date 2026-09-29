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

## Before launch
- Waitlist: set `CONTACT_EMAIL` in `index.html`, or swap the form to a real endpoint (Formspree, Resend, etc.).
