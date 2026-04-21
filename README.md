# Newt — Nutrition Assessment PWA

## Project structure

```
newt/
├── index.html        ← Main PWA
├── manifest.json     ← PWA manifest
├── sw.js             ← Service worker (offline support)
├── config.js         ← Your API key goes here (do not share publicly)
└── icons/            ← Add icon-192.png and icon-512.png here
    ├── icon-192.png
    └── icon-512.png
```

---

## Setup & deploy

### Step 1 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an account
2. Go to **Settings → API Keys → Create Key**
3. Copy the key

### Step 2 — Add your API key

Open `config.js` and replace `YOUR_API_KEY_HERE` with your actual key:

```js
window.NEWT_API_KEY = 'sk-ant-...';
```

### Step 3 — Add app icons

Create an `icons/` folder with two PNG versions of your Newt logo:
- `icons/icon-192.png` — 192×192px
- `icons/icon-512.png` — 512×512px

### Step 4 — Push to GitHub and enable Pages

1. Push all files to your `kirstenq/newt` repo
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your app will be live at `https://kirstenq.github.io/newt`

---

## Install on your phone

Once live:
- **Android (Chrome):** tap the menu (⋮) → "Add to Home Screen"
- **iPhone (Safari):** tap Share (□↑) → "Add to Home Screen"

The app opens fullscreen like a native app.

---

## How it works

1. Pick criteria (Daily Dozen, MIND Diet, or Personalized Profile)
2. Add food via file upload, URL, or camera photo
3. Tap Analyze — the app calls the Anthropic API directly
4. Results appear as a checklist (single meal) or top 3 picks (full menu)

---

## Note on API key security

Since this is a personal prototype hosted on GitHub Pages, the API key lives in `config.js`. This is fine for personal use — just don't share the URL publicly or commit the key to a public repo. If you ever want to open this up to other users, a serverless proxy is the way to go.
