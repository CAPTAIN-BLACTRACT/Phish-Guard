import React, { useState, useEffect, useRef } from 'react';
import { T } from './styles';

// ─── NAV CARD ────────────────────────────────────────────────────────────────
export function NavCard({ icon, title, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...T.card,
        padding: 28,
        cursor: "pointer",
        textAlign: "center",
        borderColor: hov ? "rgba(0,245,255,.35)" : "rgba(0,245,255,0.12)",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 0 40px rgba(0,245,255,.08)" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {hov && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg,rgba(0,245,255,.04),transparent)",
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{icon}</div>
        <div
          style={{
            fontFamily: "'Orbitron',sans-serif",
            fontSize: "1.05rem",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: ".82rem", color: "var(--txt2)", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
