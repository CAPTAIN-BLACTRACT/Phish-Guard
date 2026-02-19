# 🛡️ PhishGuard — Cyber Threat Training Platform

> Beast-mode hackathon build · React + Vite · Firebase Integrated · AI-Academy

PhishGuard is a fully gamified phishing-awareness training app built entirely in React with an aggressive cyber/military terminal aesthetic. It features real-time threat simulations, adaptive quizzes, and an AI-powered neural academy.

---

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## 🔥 New Features

- **🤖 Gemini AI Integration**: Advanced neural link powered by Google Gemini (1.5 Pro/Flash), providing dynamic cybersecurity insights and a responsive AI interlocutor (Finn-AI).
- **📡 Firebase Cloud Infrastructure**: Synchronized defense grid using Firestore for real-time leaderboards, quizzes, and community-driven threat intelligence.
- **🛡️ Neural Academy**: A consolidated learning hub merging interactive tutorials with AI-driven technical analysis and high-fidelity simulations.
- **👤 Agent Dossier**: Encrypted profile management with persistent XP tracking, streak monitoring, and custom avatar synchronization via Firebase Storage.
- **🛂 Admin Command Center**: Restricted access portal (`phishguard2026`) for managing global platform parameters and monitoring recruit progress.

---

## 📁 Project Structure

```
phishguard/
├── index.html                  # Vite HTML entry
├── vite.config.js
├── package.json
├── firebase.json               # Firebase Hosting config
└── src/
    ├── main.jsx                # React root mount
    ├── App.jsx                 # Root component — routing + global state
    │
    ├── firebase/               # Firebase configuration
    │   ├── config.js           # SDK Initialisation
    │   ├── auth.js             # Google Auth providers
    │   └── seed.js             # Automatic DB seeding system
    │
    ├── constants/              # All static/fallback data
    │   ├── questions.js        # Baseline quiz data
    │   ├── leaderboard.js      # LB_DATA fallback
    │   └── ...
    │
    ├── components/             # Shared UI components
    │   ├── canvas/             # Cyber background layers (Particle, Matrix, Hex)
    │   ├── Navbar.jsx          # Fixed top nav with live XP
    │   ├── Finn.jsx            # Updated Mascot (Floating + Neural tips)
    │   └── index.js
    │
    └── pages/                  # Platform Nodes
        ├── HomePage.jsx        # Command Dashboard & Live Metrics
        ├── AILearningPage.jsx  # Neural Academy (Gemini AI Link)
        ├── ProfilePage.jsx     # Agent Dossier & Bio Config
        ├── SimulatorPage.jsx   # Real-vs-Fake Threat Trainer
        ├── QuizPage.jsx        # Adaptive Knowledge Check
        ├── AdminPage.jsx       # Command Center (Restricted Access)
        └── ...
```

---

## 🎨 Design System

- **Fonts:** Orbitron (headings) · Rajdhani (body) · Share Tech Mono (labels/code)
- **Colors:** Cyan `#00f5ff` · Green `#00ff9d` · Red `#ff1744` · Purple `#d500f9` · Gold `#ffd600`
- **Effects:** Neural particle field · Hex-grid distortion · Scanlines · Ambient orbs
- **Philosophy:** No generic external UI libraries (Tailwind, MUI). Pure CSS-in-JS and Vanilla JS logic for maximum tactical performance and artistic cohesion.

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```
The platform uses a priority-based fallback sequence: `Gemini 3.1 Pro (Preview)` → `Gemini 3 Pro` → `Gemini 1.5 Pro` → `Gemini 1.5 Flash`.

---

## 🛂 Admin Access

Access the **Command Center** via the hidden route `/admin`.
- **Default Key:** `phishguard2026`

---

## 🛡️ License

Built for the **Cyber Beast 2026 Hackathon**. Educational Use Only.
