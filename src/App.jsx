import { useState } from "react";

import { GLOBAL_CSS } from "./styles/globalStyles";
import { useXPSystem } from "./hooks/useXPSystem";
import { useToast } from "./hooks/useToast";
import { useTurtleTip } from "./hooks/useTurtleTip";
import {
  MatrixCanvas, Navbar, Toast,
  LevelUpOverlay, Turtle
} from "./components";
import {
  HomePage, QuizPage, SimulatorPage,
  LeaderboardPage, GalleryPage,
  ProgressPage
} from "./pages";
import LoginPage from "./pages/LoginPage";
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
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function PWAInstallBanner() {
  const [show, setShow] = useState(!!deferredPrompt);
  if (!show) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") deferredPrompt = null;
    setShow(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 9001, background: "linear-gradient(135deg,#0a0e1a,#0d1525)",
      border: "1px solid rgba(0,245,255,0.3)", borderRadius: 12,
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 0 30px rgba(0,245,255,0.2)",
      fontFamily: "Share Tech Mono, monospace", fontSize: "0.8rem",
      color: "#fff", whiteSpace: "nowrap",
    }}>
      📱 Install PhishGuard as an app
      <button onClick={install} style={{
        background: "linear-gradient(135deg,#00f5ff,#d500f9)",
        border: "none", borderRadius: 6, color: "#fff",
        padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
        fontSize: "0.75rem", fontWeight: 700,
      }}>Install</button>
      <button onClick={() => setShow(false)} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.4)",
        cursor: "pointer", fontSize: "1rem",
      }}>✕</button>
    </div>
  );
}

// ─── INNER APP (has access to contexts) ──────────────────────────────────────
function AppInner() {
  const [page, setPage] = useState("home");
  const [showLogin, setShowLogin] = useState(false);

  const { user } = useAuth();
  const { profile } = useUser();
  const { xp, level, addXP, xpPct, xpToNext,
    levelUpData, clearLevelUp } = useXPSystem(
      profile?.xp ?? 1250, profile?.level ?? 1
    );
  const { toast, showToast } = useToast();
  const { currentTip, nextTip } = useTurtleTip();

  const STREAK = profile?.streak ?? 5;

  const xpProps = { xp, level, xpPct, xpToNext, addXP };
  const toastProp = { showToast };

  return (
    <>
      {/* ── Global CSS ── */}
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
        }
        @media (max-width: 480px) {
          .pg-hero-title { font-size: 1.6rem !important; }
          .stat-grid { grid-template-columns: 1fr !important; }
        }
        nav { padding: 0 1rem !important; }
      `}</style>

      {/* ── Background layers ── */}
      <canvas id="matrix-canvas" />
      <MatrixCanvas />
      <div className="pg-bg" />
      <div className="scanlines" />

      {/* Ambient orbs */}
      {ORBS.map((o, i) => (
        <div key={i} className="orb" style={{
          width: o.w, height: o.h, background: o.bg,
          ...(o.top !== undefined ? { top: o.top } : {}),
          ...(o.bottom !== undefined ? { bottom: o.bottom } : {}),
          ...(o.left !== undefined ? { left: o.left } : {}),
          ...(o.right !== undefined ? { right: o.right } : {}),
          animationDelay: o.delay,
        }} />
      ))}

      {/* ── Hackathon badge ── */}
      <div style={{
        position: "fixed", top: 64, right: 0, zIndex: 999,
        background: "linear-gradient(135deg,#d500f9,#8b00e8)",
        color: "white", fontFamily: "Share Tech Mono, monospace",
        fontSize: ".65rem", padding: "4px 16px 4px 10px",
        letterSpacing: "0.1em",
        clipPath: "polygon(8px 0,100% 0,100% 100%,0 100%)",
        boxShadow: "0 0 20px rgba(213,0,249,0.4)",
      }}>
        🏆 HACKATHON BUILD
      </div>

      {/* ── Navigation ── */}
      <Navbar
        page={page}
        setPage={setPage}
        xp={xp}
        streak={STREAK}
        onLoginClick={() => setShowLogin(true)}
      />

      {/* ── Pages ── */}
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "quiz" && <QuizPage        {...xpProps} {...toastProp} setPage={setPage} />}
      {page === "simulator" && <SimulatorPage   {...xpProps} {...toastProp} />}
      {page === "leaderboard" && <LeaderboardPage />}
      {page === "gallery" && <GalleryPage     {...toastProp} />}
      {page === "progress" && <ProgressPage    {...xpProps} />}

      {/* ── Global overlays ── */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
      <LevelUpOverlay data={levelUpData} onClose={clearLevelUp} />
      <Turtle tip={currentTip} onClick={nextTip} />

      {/* ── Login Modal ── */}
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}

      {/* ── PWA install banner ── */}
      <PWAInstallBanner />
    </>
  );
}

/**
 * App
 * Root component. Wraps everything in Auth + User providers.
 */
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppInner />
      </UserProvider>
    </AuthProvider>
  );
}
