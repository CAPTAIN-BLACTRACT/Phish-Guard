import { T } from "../styles";

const CONFETTI_COLORS = ["#00f5ff", "#00ff9d", "#ffd600", "#ff1744", "#d500f9", "#ff6d00"];

/**
 * LevelUpOverlay
 * Full-screen celebration shown when the player levels up.
 * Includes confetti burst and an animated card.
 */
export function LevelUpOverlay({ data, onClose }) {
  if (!data) return null;

  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         4000,
        background:     "rgba(0,5,9,.95)",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        animation:      "fuA .3s ease both",
      }}
    >
      {/* Confetti */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          overflow:      "hidden",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position:         "absolute",
              width:            8,
              height:           8,
              borderRadius:     2,
              left:             `${Math.random() * 100}%`,
              top:              -10,
              background:       CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
              animation:        `confFall ${1.5 + Math.random() * 2}s ${Math.random() * 0.5}s ease forwards`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          textAlign: "center",
          animation: "popIn .5s cubic-bezier(.34,1.56,.64,1) both",
          position:  "relative",
          zIndex:    1,
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: 8 }}>{data.emoji}</div>
        <h2
          style={{
            fontFamily:  "Orbitron, sans-serif",
            fontSize:    "2.5rem",
            fontWeight:  900,
            color:       "#ffd600",
            textShadow:  "0 0 40px #ffd600, 0 0 80px rgba(255,214,0,0.4)",
            marginBottom: 8,
            letterSpacing: "0.1em",
          }}
        >
          {data.title}
        </h2>
        <p
          style={{
            fontSize:   "1rem",
            color:      "var(--txt2)",
            marginBottom: 24,
            fontFamily: "Share Tech Mono, monospace",
          }}
        >
          {data.msg}
        </p>
        <button onClick={onClose} style={{ ...T.btnP, margin: "0 auto" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
