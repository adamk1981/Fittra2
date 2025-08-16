# Fit Tracker (PWA) — Complete Package

A simple, offline-first fitness tracker you can install on your iPhone.  
Features: quick exercise logging, built-in **how-to** tips, **auto rest timer** (starts on Save), **stopwatch**, and **HIIT interval timer** with **bike presets**.

---

## 1) Quick Start (GitHub Pages)

1. **Create a public repo** on GitHub (e.g., `fit-tracker`).
2. **Upload all files** from this folder so that `index.html` is at the repo **root** (not buried inside another folder).
3. **Turn on GitHub Pages**  
   - Repo → **Settings → Pages**  
   - **Source:** Deploy from a branch  
   - **Branch:** `main` and **Folder:** `/ (root)` → **Save**
4. Open your site (the link GitHub shows).  
   Example for your username: **https://adamk1981.github.io/fit-tracker/**

> Prefer a root site? Create a repo named **adamk1981.github.io** and upload the files there. Then your URL is **https://adamk1981.github.io/**.

## 2) Install as an App (iPhone)
- Open your Pages link in **Safari** → **Share** → **Add to Home Screen**.

## 3) Using the App
- **Quick Log:** Enter exercise / weight / sets / reps → **Save**.  
  - A **how-to** box appears when the exercise matches built-in examples.  
  - After **Save**, the **rest timer** auto-starts (default 90s). Adjust to taste.
- **Export CSV:** Tap **Export CSV** to download all your logs.
- **Stopwatch:** Start / Stop / Reset.
- **HIIT Timer:** Set **Work**, **Rest**, **Rounds**, then Start.  
  - Or tap a preset: **Bike 1:00/2:00 ×8**, **30/30 ×10**, **Tabata 20/10 ×8**, **Endurance 3:00/1:00 ×6**.  
  - Beeps + vibrations at phase changes (after your first tap so iOS allows sound).

## 4) Files
- `index.html` — App UI
- `script.js` — Logging, examples, timers, export
- `manifest.json` — PWA install settings
- `service-worker.js` — Offline caching
- `icons/` — App icons (192 & 512)

## 5) Troubleshooting
- **404 or blank page?** Double-check **Settings → Pages** and use the exact link it shows.  
- **index.html not at root?** Move files up so `index.html` is directly under the repo.  
- **Private repo?** GitHub Pages requires **Public**.  
- **Old version stuck?** Safari caches aggressively. On iPhone: remove the Home Screen app and re-add, or in Safari Settings → Advanced → Website Data → remove site data.

## 6) Customize
- App name/theme: edit `manifest.json` and the `<meta name="theme-color">` in `index.html`.
- Add more how-to entries: extend the `examples` array in `script.js`.
- Change default rest time: set the value in the `Rest (sec)` input (it persists during the session).

---

Made for Adam (`adamk1981`) — enjoy!
