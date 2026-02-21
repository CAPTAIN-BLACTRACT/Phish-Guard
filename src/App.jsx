import { useState, useEffect, useRef } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { seedDatabase } from "./firebase/seed";

import { GLOBAL_CSS } from "./styles/globalStyles";
import { useXPSystem } from "./hooks/useXPSystem";
import { useToast } from "./hooks/useToast";
import { useFinnTip } from "./hooks/useFinnTip";
import {
  Navbar, Toast,
  LevelUpOverlay, Finn, CyberBackground
} from "./components";
import {
  HomePage, QuizPage, SimulatorPage,
  LeaderboardPage, GalleryPage,
  ProgressPage, AdminPage, InformationPage,
  ProfilePage, AILearningPage
} from "./pages";
import { LoginPage } from "./pages";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider, useUser } from "./context/UserContext";

// ─── AMBIENT BACKGROUND ORBS ─────────────────────────────────────────────────
const ORBS = [
  { w: 700, h: 700, bg: "rgba(0,245,255,0.07)", top: -200, left: -200, delay: "0s" },
  { w: 500, h: 500, bg: "rgba(213,0,249,0.09)", top: "40%", right: -200, delay: "-3s" },
  { w: 400, h: 400, bg: "rgba(0,255,157,0.05)", bottom: "10%", left: "20%", delay: "-6s" },
  { w: 300, h: 300, bg: "rgba(255,23,68,0.06)", top: "60%", left: "10%", delay: "-2s" },
];

// ─── PWA INSTALL PROMPT ───────────────────────────────────────────────────────
function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || !visible) return null;

  const install = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };


  return (
    <div className="pwa-banner" style={{
      position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
      zIndex: 9001, background: "rgba(10,14,26,0.95)",
      border: "2px solid #00f5ff", borderRadius: 16,
      padding: "20px 30px", display: "flex", alignItems: "center", gap: 20,
      boxShadow: "0 0 50px rgba(0,245,255,0.4)",
      fontFamily: "Share Tech Mono, monospace", fontSize: "1rem",
      color: "#fff",
      backdropFilter: "blur(12px)",
      animation: "fuA 0.5s ease both"
    }}>
      <span style={{ fontSize: "1.5rem" }} className="hide-mobile">📱</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <b style={{ color: "#00f5ff" }}>Install PhishGuard App</b>
        <span style={{ fontSize: "0.75rem", color: "var(--txt2)" }}>Access training directly from your home screen</span>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={install} style={{
          flex: 1,
          background: "linear-gradient(135deg,#00f5ff,#d500f9)",
          border: "none", borderRadius: 8, color: "#fff",
          padding: "10px 24px", cursor: "pointer", fontFamily: "inherit",
          fontSize: "0.9rem", fontWeight: 800,
          boxShadow: "0 0 15px rgba(0,245,255,0.4)",
          transition: "transform 0.2s"
        }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>INSTALL NOW</button>
        <button onClick={() => setVisible(false)} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
          borderRadius: 8, padding: "0 15px",
          cursor: "pointer", fontSize: "0.8rem", fontWeight: 600
        }}>LATER</button>
      </div>
    </div>
  );
}

// ─── ADMIN PROTECTION ROUTE ───────────────────────────────────────────────────
function AdminRoute({ children }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");

  if (authed) return children;

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === "demo") {
      setAuthed(true);
    } else {
      alert("Invalid admin password");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleLogin} style={{ background: "rgba(0,12,26,0.95)", padding: 40, border: "1px solid rgba(0,245,255,0.2)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: "Orbitron, sans-serif", color: "#00f5ff", textAlign: "center", margin: 0 }}>ADMIN ACCESS</h2>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter password (demo)" style={{ padding: 10, background: "rgba(255,255,255,0.05)", border: "1px solid #00f5ff", color: "white" }} />
        <button type="submit" style={{ padding: 10, background: "#00f5ff", border: "none", color: "black", fontWeight: 'bold', cursor: 'pointer' }}>LOGIN</button>
      </form>
    </div>
  );
}

// ─── INNER APP (has access to contexts) ──────────────────────────────────────
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  // Compat for legacy setPage
  const setPage = (path) => {
    if (path === "home") navigate("/");
    else navigate("/" + path);
  };

  useEffect(() => {
    window.pgSetPage = setPage;
  }, [navigate]);

  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();
  const { profile } = useUser();

  useEffect(() => {
    seedDatabase();
  }, []);

  const { xp, level, addXP, xpPct, xpToNext,
    levelUpData, clearLevelUp } = useXPSystem(
      profile?.xp ?? 0, profile?.level ?? 1
    );

  // Sync local XP system when Firestore profile changes (e.g., on login or after earning XP)
  const prevXPRef = useRef(profile?.xp ?? 0);
  useEffect(() => {
    if (!profile) return;
    const diff = (profile.xp ?? 0) - prevXPRef.current;
    if (diff > 0) addXP(diff);
    prevXPRef.current = profile.xp ?? 0;
  }, [profile?.xp]);

  const { toast, showToast } = useToast();
  const { currentTip, nextTip } = useFinnTip();

  // Always read streak from live Firestore profile
  const STREAK = profile?.streak ?? 0;

  const xpProps = { xp, level, xpPct, xpToNext, addXP };
  const toastProp = { showToast };

  // Derive current legacy page name from location
  const pageMap = {
    "/": "home",
    "/quiz": "quiz",
    "/simulator": "simulator",
    "/leaderboard": "leaderboard",
    "/gallery": "gallery",
    "/progress": "progress",
    "/admin": "admin",
    "/ai-learning": "ai-learning",
    "/profile": "profile",
    "/about": "about",
    "/privacy": "privacy",
    "/faq": "faq",
    "/checklist": "checklist"
  };
  const currentPage = pageMap[location.pathname] || "home";

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .hide-mobile { display: none !important; }
          .pg-hero-title { font-size: 2rem !important; }
          .pg-hero-sub { font-size: 0.9rem !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
          .stat-grid  { grid-template-columns: 1fr 1fr !important; }
          .pg-container { padding: 0 1rem !important; }
          .sentinel-grid { grid-template-columns: 1fr !important; }
          .sentinel-section { padding: 40px 20px !important; }
          .pwa-banner { 
            width: 92%; 
            max-width: 400px;
            padding: 24px !important; 
            flex-direction: column; 
            text-align: center;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            gap: 15px !important;
          }
          .pwa-banner b { font-size: 1.1rem; }
          .pwa-banner span { font-size: 0.85rem !important; }
          .pwa-banner .hide-mobile { display: none !important; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
        nav { padding: 0 1rem !important; }
      `}</style>

      <CyberBackground />

      {/* ── Navigation ── */}
      {/* Hide navbar on admin page for safety */}
      {location.pathname !== "/admin" && (
        <Navbar
          page={currentPage}
          setPage={setPage}
          xp={xp}
          streak={STREAK}
          onLoginClick={() => setShowLogin(true)}
        />
      )}

      {/* ── Routes ── */}
      <Routes>
        <Route path="/" element={<HomePage setPage={setPage} />} />
        <Route path="/quiz" element={<QuizPage {...xpProps} {...toastProp} setPage={setPage} />} />
        <Route path="/simulator" element={<SimulatorPage {...xpProps} {...toastProp} />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/gallery" element={<GalleryPage {...toastProp} />} />
        <Route path="/progress" element={<ProgressPage {...xpProps} />} />
        <Route path="/admin" element={<AdminPage {...toastProp} />} />
        <Route path="/ai-learning" element={<AILearningPage />} />
        <Route path="/profile" element={<ProfilePage {...toastProp} />} />
        <Route path="/about" element={<InformationPage type="about" onBack={() => setPage("home")} />} />
        <Route path="/privacy" element={<InformationPage type="privacy" onBack={() => setPage("home")} />} />
        <Route path="/faq" element={<InformationPage type="faq" onBack={() => setPage("home")} />} />
        <Route path="/checklist" element={<InformationPage type="checklist" onBack={() => setPage("home")} />} />
      </Routes>

      {/* ── Global overlays ── */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
      <LevelUpOverlay data={levelUpData} onClose={clearLevelUp} />
      {location.pathname !== "/ai-learning" && (
        <Finn tip={currentTip} onClick={nextTip} />
      )}

      {/* ── Login Modal ── */}
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}

      {/* ── PWA install banner ── */}
      <PWAInstallBanner />
    </>
  );
}

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <UserProvider>
          <AppInner />
        </UserProvider>
      </AuthProvider>
    </HashRouter>
  );
}
