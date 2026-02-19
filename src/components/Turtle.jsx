import { T } from "../styles";

/**
 * Turtle  (Sheldon the cyber mascot)
 * Fixed bottom-right floating turtle emoji with a speech bubble.
 * The bubble appears/disappears based on the `tip` prop.
 */
export function Turtle({ tip, onClick }) {
  return (
    <div
      style={{
        position:      "fixed",
        bottom:        24,
        right:         24,
        zIndex:        999,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           4,
      }}
    >
      {/* Speech bubble */}
      {tip && (
        <div
          style={{
            ...T.card,
            padding:      "12px 16px",
            fontSize:     ".78rem",
            color:        "#e0f7fa",
            maxWidth:     220,
            lineHeight:   1.55,
            fontFamily:   "Share Tech Mono, monospace",
            boxShadow:    "0 0 30px rgba(0,245,255,.15)",
            marginBottom: 8,
            borderRadius: "12px 12px 4px 12px",
            animation:    "fuA .3s ease",
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: tip }} />
        </div>
      )}

      {/* Turtle emoji */}
      <div
        onClick={onClick}
        style={{
          fontSize:   "3rem",
          animation:  "turtleBob .8s ease-in-out infinite alternate",
          cursor:     "pointer",
          filter:     "drop-shadow(0 0 12px rgba(0,255,157,0.4))",
        }}
      >
        🐢
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily:    "Share Tech Mono, monospace",
          fontSize:      ".6rem",
          color:         "rgba(0,245,255,.6)",
          letterSpacing: 1,
        }}
      >
        [SHELDON]
      </div>
    </div>
  );
}
