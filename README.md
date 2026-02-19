# 🛡️ PhishGuard — Cyber Threat Training Platform

> Beast-mode hackathon build · React + Vite · Zero external UI libs

PhishGuard is a fully gamified phishing-awareness training app built entirely in React with an aggressive cyber/military terminal aesthetic.

---

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## 📁 Project Structure

```
phishguard/
├── index.html                  # Vite HTML entry
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Root component — routing + global state
    │
    ├── constants/              # All static data
    │   ├── questions.js        # 8 adaptive quiz questions (easy/medium/hard)
    │   ├── leaderboard.js      # LB_DATA — 9 ranked defenders
    │   ├── gallery.js          # GALLERY_DATA — 6 phishing examples
    │   ├── badges.js           # BADGES — 8 achievement badges
    │   ├── redFlags.js         # RED_FLAGS — 6 universal indicators
    │   ├── simulator.js        # SIM_STAGES — 2 real-vs-fake email stages
    │   ├── tips.js             # TIPS + XP_PER_LEVEL thresholds
    │   └── index.js            # Barrel re-exports
    │
    ├── styles/
    │   ├── globalStyles.js     # GLOBAL_CSS string (fonts, keyframes, bg)
    │   ├── tokens.js           # Shared inline-style objects (T.card, T.btnP …)
    │   └── index.js            # Barrel re-exports
    │
    ├── hooks/
    │   ├── useXPSystem.js      # XP, level, level-up detection
    │   ├── useToast.js         # Bottom-right toast notifications
    │   ├── useTurtleTip.js     # Sheldon's cycling tip system
    │   └── index.js
    │
    ├── components/             # Shared UI components
    │   ├── MatrixCanvas.jsx    # Full-screen matrix rain canvas
    │   ├── Navbar.jsx          # Fixed top nav with XP counter
    │   ├── Toast.jsx           # Slide-in notification
    │   ├── LevelUpOverlay.jsx  # Full-screen level-up celebration + confetti
    │   ├── Turtle.jsx          # Sheldon the cyber mascot (floating + speech bubble)
    │   ├── XPBar.jsx           # Reusable XP progress bar
    │   └── index.js
    │
    └── pages/                  # One file per page/feature
        ├── HomePage.jsx        # Hero, email mock, red flags, footer
        ├── QuizPage.jsx        # Adaptive quiz with timer ring + explanation
        ├── SimulatorPage.jsx   # Split real-vs-fake email trainer
        ├── LeaderboardPage.jsx # Global rankings table
        ├── GalleryPage.jsx     # Filterable phishing examples + submit modal
        ├── ProgressPage.jsx    # Profile, badges, learning map, XP history
        └── index.js
```

---

## 🎮 Features

| Feature | File |
|---|---|
| Adaptive Quiz (8 questions, 3 difficulties) | `pages/QuizPage.jsx` |
| Real-vs-Fake Email Simulator | `pages/SimulatorPage.jsx` |
| Global Leaderboard | `pages/LeaderboardPage.jsx` |
| Community Phishing Gallery | `pages/GalleryPage.jsx` |
| Player Progress & Badge System | `pages/ProgressPage.jsx` |
| XP & Level-up System | `hooks/useXPSystem.js` |
| Matrix Rain Background | `components/MatrixCanvas.jsx` |
| Sheldon Turtle Mascot | `components/Turtle.jsx` + `hooks/useTurtleTip.js` |
| Toast Notifications | `components/Toast.jsx` + `hooks/useToast.js` |
| Beast Cyber Theme | `styles/globalStyles.js` + `styles/tokens.js` |

---

## 🎨 Design System

- **Fonts:** Orbitron (headings) · Rajdhani (body) · Share Tech Mono (labels/code)
- **Colors:** Cyan `#00f5ff` · Green `#00ff9d` · Red `#ff1744` · Purple `#d500f9` · Gold `#ffd600`
- **Effects:** Matrix rain · dual grid background · scanlines · ambient orbs · glitch animation
- **Style approach:** All styles via inline JS objects in `styles/tokens.js` — no CSS modules, no Tailwind

---

## 🏆 Hackathon Notes

- Zero external UI component libraries (pure React)
- Single shared style token object (`T`) used across all components
- All data is static/local — no backend required
- Fully functional quiz scoring, flag detection, and XP system
