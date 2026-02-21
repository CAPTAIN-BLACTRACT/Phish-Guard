/**
 * XPBar
 * Reusable XP progress bar with level label and "to-next" counter.
 */
export function XPBar({ xp, level, xpPct, xpToNext }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize:   ".78rem",
            color:      "#00f5ff",
          }}
        >
          ⚡ XP: {xp.toLocaleString()} · Level {level}
        </span>
        <span style={{ fontSize: ".78rem", color: "#ffd600" }}>
          {xpToNext()} XP to Level {level + 1}
        </span>
      </div>

      <div
        style={{
          height:       8,
          background:   "rgba(0,245,255,.08)",
          borderRadius: 2,
          overflow:     "hidden",
          border:       "1px solid rgba(0,245,255,0.1)",
        }}
      >
        <div
          style={{
            height:     "100%",
            background: "linear-gradient(90deg,#00f5ff,#00ff9d)",
            borderRadius: 2,
            width:      `${xpPct()}%`,
            boxShadow:  "0 0 12px #00f5ff",
            transition: "width .6s",
          }}
        />
      </div>
    </div>
  );
}
