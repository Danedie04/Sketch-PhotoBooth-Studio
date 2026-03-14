# 📸 Sketch PhotoBooth Studio

A hand-drawn sketch-style photobooth that runs entirely in the browser — no server, no backend, no build step.

![Sketch PhotoBooth Studio](https://img.shields.io/badge/version-1.0.0-black) ![License](https://img.shields.io/badge/license-MIT-black)

---

## ✨ Features

| Feature | Details |
|---|---|
| 📸 4-Shot capture | Automatic countdown + flash for 4 photos |
| 🎛 12 Live filters | Draggable dial — B&W, Vintage, Neon, Gold, and more |
| 🖼 7 Frames | Classic, Rounded, Vintage, Polaroid, Minimal, Wedding, Birthday |
| 🎞 Photo strip | Auto-generated vertical strip on HTML5 Canvas |
| ⬇ Download | Save strip as PNG |
| ↗ Share | Web Share API (mobile) or download fallback |
| 🖨 Print | Open browser print dialog |
| 🎀 Stickers | Drop emoji stickers onto the final strip |
| 📁 Upload mode | Works without a camera — just upload 1–4 photos |
| 📱 Responsive | Works on mobile and desktop |

---

## 🗂 Project Structure

```
photobooth/
├── index.html          ← Main HTML (all screens)
├── netlify.toml        ← Netlify deployment config
├── README.md
├── css/
│   ├── base.css        ← Reset, variables, shared utilities
│   ├── entrance.css    ← Screen 1: landing page
│   ├── camera.css      ← Screen 2: camera interface
│   ├── delivery.css    ← Screen 3: delivery animation
│   └── result.css      ← Screen 4: result screen
└── js/
    ├── data.js         ← FRAMES and FILTERS constants
    ├── frames.js       ← SVG frame drawing
    ├── dial.js         ← Rotatable filter dial
    ├── camera.js       ← WebRTC + upload
    ├── capture.js      ← Countdown, flash, shutter, capture
    ├── strip.js        ← Canvas photo strip generator
    ├── delivery.js     ← Delivery animation
    ├── result.js       ← Download, share, print, stickers
    └── app.js          ← Init, routing, event wiring
```

---

## 🚀 Deploy to Netlify (Recommended)

### Option A — Drag & Drop (instant, no account required)

1. Zip the entire `photobooth/` folder
2. Go to **[app.netlify.com](https://app.netlify.com)**
3. Drag and drop the zip onto the **"Deploy manually"** drop zone
4. Your site is live in seconds! 🎉

### Option B — Connect GitHub (auto-deploys on every push)

1. Push this repo to GitHub (see instructions below)
2. Log in to **[app.netlify.com](https://app.netlify.com)**
3. Click **"Add new site" → "Import an existing project"**
4. Choose **GitHub** and select your repository
5. Build settings:
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.`
6. Click **"Deploy site"**

Every `git push` to `main` will auto-deploy. ✅

---

## 🐙 Push to GitHub

```bash
# 1. Create a new repo on github.com (don't initialise with README)

# 2. In this folder:
git init
git add .
git commit -m "Initial commit — Sketch PhotoBooth Studio"

# 3. Add your remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 4. Push
git branch -M main
git push -u origin main
```

---

## 💻 Run Locally

No build step needed! Open directly in a browser:

```bash
# Option 1 — Just open the file
open index.html

# Option 2 — Local dev server (recommended for camera on some browsers)
npx serve .
# then visit http://localhost:3000
```

> **Note:** Chrome and Firefox require HTTPS or `localhost` for `getUserMedia` (camera). Use `npx serve` or deploy to Netlify for reliable camera access.

---

## 🛠 Tech Stack

- **Vanilla HTML5, CSS3, JavaScript** — zero dependencies, no build step
- **WebRTC** (`navigator.mediaDevices.getUserMedia`) — live camera
- **HTML5 Canvas API** — photo strip generation
- **Web Share API** — native share sheet on mobile
- **CSS custom properties** — theming
- **Google Fonts** — Caveat, Special Elite, Patrick Hand

---

## 🔒 Privacy

All photo processing happens **100% in the browser**. No images are uploaded, stored, or sent to any server.

---

## 📄 License

MIT — free to use, modify, and deploy.
