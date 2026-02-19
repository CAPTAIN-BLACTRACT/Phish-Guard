import { useState } from "react";

import { GLOBAL_CSS }                            from "./styles/globalStyles";
import { useXPSystem }                           from "./hooks/useXPSystem";
import { useToast }                              from "./hooks/useToast";
import { useTurtleTip }                          from "./hooks/useTurtleTip";
import { MatrixCanvas, Navbar, Toast,
         LevelUpOverlay, Turtle }                from "./components";
import { HomePage, QuizPage, SimulatorPage,
         LeaderboardPage, GalleryPage,
         ProgressPage }                          from "./pages";

// ─── AMBIENT BACKGROUND ORBS ─────────────────────────────────────────────────
const ORBS = [
  { w: 700, h: 700, bg: "rgba(0,245,255,0.07)",   top: -200,   left: -200,   delay: "0s"  },
  { w: 500, h: 500, bg: "rgba(213,0,249,0.09)",   top: "40%",  right: -200,  delay: "-3s" },
  { w: 400, h: 400, bg: "rgba(0,255,157,0.05)",   bottom:"10%",left: "20%",  delay: "-6s" },
  { w: 300, h: 300, bg: "rgba(255,23,68,0.06)",   top: "60%",  left: "10%",  delay: "-2s" },
];

/**
 * App
 * Root component. Owns global state (page, XP, toast, turtle tip) and
 * renders the correct page component based on `page` state.
 */
export default function App() {
  const [page, setPage] = useState("home");

  // Global systems
  const { xp, level, addXP, xpPct, xpToNext, levelUpData, clearLevelUp } = useXPSystem();
  const { toast, showToast }   = useToast();
  const { currentTip, nextTip } = useTurtleTip();

  const STREAK = 5; // static for demo

  // Shared props passed down to pages that need XP / toast
  const xpProps  = { xp, level, xpPct, xpToNext, addXP };
  const toastProp = { showToast };

  return (
    <>
      {/* ── Global CSS ── */}
      <style>{GLOBAL_CSS}</style>

      {/* ── Background layers ── */}
      <canvas id="matrix-canvas" />   {/* replaced by MatrixCanvas below */}
      <MatrixCanvas />
      <div className="pg-bg" />
      <div className="scanlines" />

      {/* Ambient colour orbs */}
      {ORBS.map((o, i) => (
        <div
          key={i}
          className="orb"
          style={{
            width:             o.w,
            height:            o.h,
            background:        o.bg,
            ...(o.top    !== undefined ? { top:    o.top }    : {}),
            ...(o.bottom !== undefined ? { bottom: o.bottom } : {}),
            ...(o.left   !== undefined ? { left:   o.left }   : {}),
            ...(o.right  !== undefined ? { right:  o.right }  : {}),
            animationDelay:    o.delay,
          }}
        />
      ))}

      {/* ── Hackathon badge ── */}
      <div
        style={{
          position:     "fixed",
          top:          64,
          right:        0,
          zIndex:       999,
          background:   "linear-gradient(135deg,#d500f9,#8b00e8)",
          color:        "white",
          fontFamily:   "Share Tech Mono, monospace",
          fontSize:     ".65rem",
          padding:      "4px 16px 4px 10px",
          letterSpacing:"0.1em",
          clipPath:     "polygon(8px 0,100% 0,100% 100%,0 100%)",
          boxShadow:    "0 0 20px rgba(213,0,249,0.4)",
        }}
      >
        🏆 HACKATHON BUILD
      </div>

      {/* ── Navigation ── */}
      <Navbar page={page} setPage={setPage} xp={xp} streak={STREAK} />

      {/* ── Pages ── */}
      {page === "home"        && <HomePage        setPage={setPage} />}
      {page === "quiz"        && <QuizPage        {...xpProps} {...toastProp} setPage={setPage} />}
      {page === "simulator"   && <SimulatorPage   {...xpProps} {...toastProp} />}
      {page === "leaderboard" && <LeaderboardPage />}
      {page === "gallery"     && <GalleryPage     {...toastProp} />}
      {page === "progress"    && <ProgressPage    {...xpProps} />}

      {/* ── Global overlays ── */}
      <Toast          msg={toast.msg} type={toast.type} visible={toast.visible} />
      <LevelUpOverlay data={levelUpData}  onClose={clearLevelUp} />
      <Turtle         tip={currentTip}    onClick={nextTip} />
    </>
  );
}
