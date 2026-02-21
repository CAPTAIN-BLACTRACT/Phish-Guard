# 🛡️ PhishGuard — Advanced Phishing Awareness & Defense Platform

> **React 18 · Vite 6 · Firebase · Finn-AI Neural Engine · Cyber Carnival Hackathon**

PhishGuard is a high-fidelity, gamified phishing awareness and training platform. Built with an aggressive "Cyber-Tactical" aesthetic, it transforms traditional security training into an immersive experience featuring real-time threat simulations, adaptive learning algorithms, and an integrated AI advisor.

---

## 🌌 Core Intelligence Features

### 🤖 Finn-AI Neural Advisor
A sophisticated AI assistant integrated directly into the training grid. Finn-AI provides deep technical analysis of phishing tactics, parses malicious traffic patterns, and acts as a dynamic interlocutor for recruits. Optimized for speed using the latest Google Gemini neural nodes.

### 🎭 High-Fidelity Simulator
Interactive email and SMS simulation engine. Recruits are presented with complex, multi-layered phishing attempts where they must identify "Red Flags" like display name spoofing, mismatched URLs, and psychological triggers.

### 🧠 Adaptive Quiz System
Our awareness modules use a performance-based difficulty algorithm. The system tracks your accuracy in real-time, escalating the complexity of questions as you demonstrate mastery, ensuring that the training remains challenging for all skill levels.

### 📡 Global Hall of Defenders
A real-time synchronization grid powered by Firestore. Compete with defenders globally for XP and rank. Features a dynamic badge system that recognizes achievements in speed, accuracy, and training consistency.

### 👤 Agent Dossier & Badges
Persistent profile management tracking your evolution from a "Recruit" to an "Elite Defender". Integrated with the badge system to showcase earned achievements based on level, XP, and daily streaks.

### 🖼️ Intelligence Gallery
A community-driven threat intelligence hub where users submit and analyze real-world phishing examples, building a collective defense database.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Hooks, Context API)
- **Build System:** Vite 6
- **Database:** Firebase Firestore (Real-time sync)
- **Authentication:** Firebase Auth (Google + Credentials + Guest mode)
- **Storage:** Firebase Storage (Avatar synchronization)
- **AI Engine:** Google Gemini API (Weighted fallback sequence)
- **PWA:** Vite PWA Plugin (Service Workers, Offline support, Installable)
- **Styling:** Vanilla CSS-in-JS Design Tokens (Zero external UI libraries)

---

## 🚀 Deployment & Installation

### 1. Initialize Local Environment
```bash
git clone https://github.com/Binary-Beast25/phish-guard.git
cd phish-guard
npm install
```

### 2. Configure Frequencies (.env)
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_id
```

### 3. Launch Platform
```bash
npm run dev        # Launch local dev server
npm run build      # Compile production binaries
npm run preview    # Verify production build locally
```

---

## 📂 Architecture Overview

```
src/
├── components/         # Atomic UI units & tactical backgrounds
│   ├── canvas/         # Matrix, Hex-grid, and Particle layers
│   ├── Navbar.jsx      # Command header with live XP stream
│   └── Finn.jsx        # Neural advisor mascot
├── context/            # Auth & User state management
├── firebase/           # Data persistence layer & Security rules
├── hooks/              # Reusable logic (XP system, Toasts)
├── pages/              # Core Platform Nodes
│   ├── Home/           # Command Dashboard
│   ├── AILearning/     # Neural Academy (AI Hub)
│   ├── Simulator/      # Threat Trainer
│   ├── Quiz/           # Adaptive Knowledge Check
│   └── Leaderboard/    # Global Synchronization Hub
└── styles/             # Design Tokens & Global CSS Variables
```

---

## 🍱 Design System

PhishGuard utilizes a custom design system centered on "Tactical Readability":

- **Typography:** `Orbitron` for high-level headers, `Share Tech Mono` for system telemetry, and `Rajdhani` for high-speed content delivery.
- **Palette:** High-contrast neon accents against a deep `#000509` void background.
- **Animations:** CSS-based GPU-accelerated keyframes for scanlines, glitch effects, and neural pulses.

---

## 🛂 Admin Command Center

The platform contains a restricted administrative portal for managing training data.
- **Portal URL:** `/admin`
- **Root Password:** `phishguard2026`

---

## 🛡️ License & Mission

Built for the **Cyber Carnival Hackathon**. This platform is designed to turn the human firewall from the weakest link into the strongest defense by providing elite phishing awareness training.

**Over and out. 📡**
