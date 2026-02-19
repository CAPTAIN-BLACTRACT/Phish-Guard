import { T } from "../styles";

const LINKS = [
  { id: "home",        label: "Home" },
  { id: "simulator",   label: "Simulator" },
  { id: "quiz",        label: "Quiz" },
  { id: "leaderboard", label: "🏆 Leaderboard" },
  { id: "gallery",     label: "Gallery" },
  { id: "progress",    label: "My Progress" },
];

/**
 * Navbar
 * Fixed top navigation bar with glitch-animated logo, page links,
 * live XP counter, streak badge, and a "Start Quiz" CTA.
 */
export function Navbar({ page, setPage, xp, streak }) {
  return (
    <nav style={T.nav}>
      {/* Bottom gradient accent line */}
      <div
        style={{
          position:      "absolute",
          bottom:        0,
          left:          0,
          right:         0,
          height:        1,
          background:    "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
          opacity:       0.5,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setPage("home"); }}
        style={T.logo}
      >
        <svg width={32} height={32} viewBox="0 0 36 36" fill="none">
          <path
            d="M18 2L4 8v12c0 8 6.67 14.93 14 16 7.33-1.07 14-7.99 14-16V8L18 2z"
            fill="rgba(0,245,255,.1)"
            stroke="#00f5ff"
            strokeWidth="1.5"
          />
          <path
            d="M12 18l4 4 8-8"
            stroke="#00f5ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Phish
        <span style={{ color: "#00f5ff", textShadow: "0 0 20px #00f5ff" }}>
          Guard
        </span>
      </a>

      {/* Page links */}
      <ul style={{ display: "flex", listStyle: "none", gap: 24, margin: 0 }}>
        {LINKS.map(({ id, label }) => (
          <li key={id}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(id); }}
              style={{
                color:         page === id ? "#00f5ff" : "#546e7a",
                textDecoration:"none",
                fontSize:      ".72rem",
                fontWeight:    600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily:    "Share Tech Mono, monospace",
                transition:    "color .2s",
                textShadow:    page === id ? "0 0 12px rgba(0,245,255,.6)" : "none",
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right cluster: XP • streak • CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            padding:      "5px 14px",
            background:   "rgba(0,245,255,.06)",
            border:       "1px solid rgba(0,245,255,.25)",
            borderRadius: 4,
            fontFamily:   "Share Tech Mono, monospace",
            fontSize:     ".72rem",
            color:        "#00f5ff",
            boxShadow:    "0 0 12px rgba(0,245,255,0.1)",
          }}
        >
          ⚡ {xp.toLocaleString()} XP
        </div>

        <div
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize:   ".72rem",
            color:      "#ff6d00",
          }}
        >
          🔥 {streak} day streak
        </div>

        <button style={T.btnP} onClick={() => setPage("quiz")}>
          Start Quiz
        </button>
      </div>
    </nav>
  );
}
