// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Shared inline-style objects used across all components.

const css = (s) => s;

// ── BASE CARD ────────────────────────────────────────────────────────────────
export const card = css({
  background: "linear-gradient(135deg,rgba(0,12,26,0.95) 0%,rgba(0,5,14,0.98) 100%)",
  border: "1px solid rgba(0,245,255,0.12)",
  borderRadius: 6,
  backdropFilter: "blur(24px)",
  transition: "all .3s",
});

// ── BUTTONS ──────────────────────────────────────────────────────────────────
export const btnP = css({
  padding: "8px 20px",
  background: "transparent",
  border: "1px solid #00f5ff",
  borderRadius: 3,
  color: "#00f5ff",
  fontSize: ".78rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Share Tech Mono, monospace",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  boxShadow: "0 0 20px rgba(0,245,255,.2), inset 0 0 20px rgba(0,245,255,.05)",
  transition: "all .2s",
});

export const btnG = css({
  padding: "6px 16px",
  border: "1px solid rgba(0,245,255,.3)",
  borderRadius: 3,
  color: "#00f5ff",
  fontSize: ".78rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  fontFamily: "Share Tech Mono, monospace",
  letterSpacing: "0.05em",
  transition: "all .2s",
});

export const btnHP = css({
  padding: "12px 28px",
  background: "transparent",
  border: "1px solid #00f5ff",
  borderRadius: 3,
  color: "#00f5ff",
  fontSize: ".85rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "Share Tech Mono, monospace",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  boxShadow: "0 0 25px rgba(0,245,255,.2), inset 0 0 25px rgba(0,245,255,.05)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "all .25s",
});

export const btnHS = css({
  padding: "12px 26px",
  background: "rgba(255,255,255,.02)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 3,
  color: "#e0f7fa",
  fontSize: ".85rem",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "Share Tech Mono, monospace",
  display: "flex",
  alignItems: "center",
  gap: 8,
  letterSpacing: "0.05em",
  transition: "all .25s",
});

// ── TYPOGRAPHY ───────────────────────────────────────────────────────────────
export const secLbl = css({
  fontFamily: "Share Tech Mono, monospace",
  fontSize: ".7rem",
  letterSpacing: "4px",
  textTransform: "uppercase",
  color: "#00f5ff",
  marginBottom: 10,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
});

export const secTitle = css({
  fontFamily: "Orbitron, sans-serif",
  fontSize: "clamp(1.7rem,3.5vw,2.5rem)",
  fontWeight: 900,
  lineHeight: 1.15,
  marginBottom: 14,
  letterSpacing: "-0.02em",
});

// ── LAYOUT ────────────────────────────────────────────────────────────────────
export const page = css({
  position: "relative",
  zIndex: 1,
  minHeight: "100vh",
  paddingTop: 40,
});

export const sec = css({
  padding: "40px 24px",
  position: "relative",
  zIndex: 1,
});

// ── TAGS ─────────────────────────────────────────────────────────────────────
export const tagPhish = css({
  background: "rgba(255,23,68,.08)",
  border: "1px solid rgba(255,23,68,.3)",
  color: "#ff1744",
  borderRadius: 2,
  padding: "2px 8px",
  fontSize: ".68rem",
  fontFamily: "Share Tech Mono, monospace",
});

export const tagReview = css({
  background: "rgba(255,214,0,.06)",
  border: "1px solid rgba(255,214,0,.25)",
  color: "#ffd600",
  borderRadius: 2,
  padding: "2px 8px",
  fontSize: ".68rem",
  fontFamily: "Share Tech Mono, monospace",
});

export const tagDismissed = css({
  background: "rgba(0,255,157,.06)",
  border: "1px solid rgba(0,255,157,.2)",
  color: "#00ff9d",
  borderRadius: 2,
  padding: "2px 8px",
  fontSize: ".68rem",
  fontFamily: "Share Tech Mono, monospace",
});

export const nav = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
  background: "rgba(0,5,9,0.94)",
  backdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(0,245,255,.15)",
  boxShadow: "0 1px 30px rgba(0,245,255,0.08)",
});

export const logo = css({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontFamily: "Orbitron, sans-serif",
  fontSize: "1.1rem",
  fontWeight: 900,
  color: "#e0f7fa",
  textDecoration: "none",
  letterSpacing: "0.08em",
  animation: "glitch 8s infinite",
});
