import { useState } from "react";
import { T } from "../styles";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

const LINKS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "simulator", label: "Simulator", icon: "🎯" },
  { id: "quiz", label: "Quiz", icon: "🧠" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { id: "gallery", label: "Gallery", icon: "🖼️" },
  { id: "progress", label: "Progress", icon: "📈" },
];

/**
 * Navbar
 * Fixed top navigation bar with Firebase auth integration.
 * Shows user avatar + sign-out when logged in, or login button when not.
 * Includes a hamburger menu for mobile.
 */
export function Navbar({ page, setPage, xp, streak, onLoginClick }) {
  const { user, signOutUser } = useAuth();
  const { profile } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayXP = profile?.xp ?? xp ?? 0;
  const displayStreak = profile?.streak ?? streak ?? 0;

  return (
    <>
      <nav style={T.nav}>
        {/* Bottom gradient accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
          opacity: 0.5, pointerEvents: "none",
        }} />

        {/* Logo */}
        <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); setMenuOpen(false); }} style={T.logo}>
          <svg width={32} height={32} viewBox="0 0 36 36" fill="none">
            <path d="M18 2L4 8v12c0 8 6.67 14.93 14 16 7.33-1.07 14-7.99 14-16V8L18 2z"
              fill="rgba(0,245,255,.1)" stroke="#00f5ff" strokeWidth="1.5" />
            <path d="M12 18l4 4 8-8" stroke="#00f5ff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Phish<span style={{ color: "#00f5ff", textShadow: "0 0 20px #00f5ff" }}>Guard</span>
        </a>

        {/* Desktop nav links */}
        <ul style={{
          display: "flex", listStyle: "none", gap: 24, margin: 0,
          "@media(max-width:768px)": { display: "none" },
        }} className="nav-links">
          {LINKS.map(({ id, label }) => (
            <li key={id}>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage(id); }}
                style={{
                  color: page === id ? "#00f5ff" : "#546e7a",
                  textDecoration: "none", fontSize: ".72rem",
                  fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Share Tech Mono, monospace",
                  transition: "color .2s",
                  textShadow: page === id ? "0 0 12px rgba(0,245,255,.6)" : "none",
                }}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* XP badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 14px",
            background: "rgba(0,245,255,.06)",
            border: "1px solid rgba(0,245,255,.25)",
            borderRadius: 4,
            fontFamily: "Share Tech Mono, monospace",
            fontSize: ".72rem", color: "#00f5ff",
            boxShadow: "0 0 12px rgba(0,245,255,0.1)",
          }}>
            ⚡ {displayXP.toLocaleString()} XP
          </div>

          {/* Streak */}
          <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#ff6d00" }}
            className="hide-mobile">
            🔥 {displayStreak} day streak
          </div>

          {/* Auth button */}
          {user ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={user.photoURL ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
                alt="avatar"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "2px solid #00f5ff", cursor: "pointer"
                }}
                onClick={() => signOutUser()}
                title="Click to sign out"
              />
              <span style={{
                fontFamily: "Share Tech Mono, monospace",
                fontSize: ".68rem", color: "#00f5ff", maxWidth: 80,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} className="hide-mobile">
                {user.displayName?.split(" ")[0] ?? "Agent"}
              </span>
            </div>
          ) : (
            <button style={{
              ...T.btnP, padding: "6px 14px", fontSize: ".72rem",
            }} onClick={onLoginClick}>
              Sign In
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "none", background: "none", border: "none",
              color: "#00f5ff", fontSize: "1.4rem", cursor: "pointer",
              padding: "4px 8px",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 998,
          background: "rgba(10,14,26,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,245,255,0.15)",
          padding: "1rem",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {LINKS.map(({ id, label, icon }) => (
            <a key={id} href="#"
              onClick={(e) => { e.preventDefault(); setPage(id); setMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0.75rem 1rem",
                borderRadius: 8,
                background: page === id ? "rgba(0,245,255,0.1)" : "transparent",
                border: page === id ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent",
                color: page === id ? "#00f5ff" : "rgba(255,255,255,0.6)",
                textDecoration: "none", fontSize: "0.9rem",
                fontFamily: "Share Tech Mono, monospace",
                transition: "all .2s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              {label}
            </a>
          ))}
          {!user && (
            <button style={{ ...T.btnP, marginTop: 8 }} onClick={() => { onLoginClick?.(); setMenuOpen(false); }}>
              Sign In
            </button>
          )}
          {user && (
            <button
              onClick={() => { signOutUser(); setMenuOpen(false); }}
              style={{
                ...T.btnP, marginTop: 8,
                background: "linear-gradient(135deg,#ff4757,#ff6b81)",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </>
  );
}
