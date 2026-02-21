import { T } from "../styles";

/**
 * XPBar
 * Reusable XP progress bar with level label and "to-next" counter.
 */
export function XPBar({ xp, level, xpPct, xpToNext }) {
  const xpRemaining = Number(xpToNext?.() ?? 0);
  const maxLevelReached = level >= 10 || xpRemaining <= 0;

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
          {maxLevelReached ? "MAX LEVEL" : `${xpRemaining} XP to Level ${level + 1}`}
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
            ...T.xpBarFill,
            width:      `${xpPct()}%`,
          }}
        />
      </div>
    </div>
  );
}
