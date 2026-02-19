/**
 * Toast
 * Bottom-right notification that slides in/out.
 * type: "ok" (green) | "ng" (red) | "inf" (cyan)
 */
export function Toast({ msg, type, visible }) {
  if (!msg) return null;

  const palette = {
    ok:  { bg: "rgba(0,255,157,.08)",  border: "rgba(0,255,157,.4)",  color: "#00ff9d" },
    ng:  { bg: "rgba(255,23,68,.08)",  border: "rgba(255,23,68,.4)",  color: "#ff1744" },
    inf: { bg: "rgba(0,245,255,.06)",  border: "rgba(0,245,255,.35)", color: "#00f5ff" },
  };
  const c = palette[type] || palette.inf;

  return (
    <div
      style={{
        position:   "fixed",
        bottom:     28,
        right:      28,
        padding:    "14px 22px",
        borderRadius: 4,
        fontSize:   ".82rem",
        fontWeight: 600,
        zIndex:     3000,
        transform:  visible ? "translateX(0)" : "translateX(200%)",
        transition: "transform .4s cubic-bezier(.34,1.56,.64,1)",
        maxWidth:   310,
        fontFamily: "Share Tech Mono, monospace",
        letterSpacing: "0.05em",
        background: c.bg,
        border:     `1px solid ${c.border}`,
        color:      c.color,
        boxShadow:  `0 0 30px ${c.border}`,
      }}
    >
      {msg}
    </div>
  );
}
