import React, { useState, useEffect, useRef } from 'react';
import { T } from './styles';

// ─── RED FLAG CARD ───────────────────────────────────────────────────────────
export function RedFlagCard({ icon, name, desc, tip }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...T.card,
        padding: 26,
        cursor: "pointer",
        borderColor: hov ? "rgba(255,23,68,.4)" : "rgba(0,245,255,0.12)",
        boxShadow: hov ? "0 0 30px rgba(255,23,68,.1)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,#ff1744,#ff6d00)",
          transform: hov ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform .3s",
          borderRadius: "6px 6px 0 0",
        }}
      />
      <span style={{ fontSize: "1.7rem", marginBottom: 12, display: "block" }}>
        {icon}
      </span>
      <div
        style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: ".95rem",
          fontWeight: 700,
          marginBottom: 7,
          color: "#ff1744",
          textShadow: "0 0 10px rgba(255,23,68,.3)",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: ".83rem",
          color: "var(--txt2)",
          lineHeight: 1.6,
          marginBottom: 9,
          flex: 1,
        }}
      >
        {desc}
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 11px",
          borderRadius: 100,
          fontSize: ".72rem",
          fontFamily: "'Share Tech Mono',monospace",
          background: "rgba(0,255,157,.08)",
          border: "1px solid rgba(0,255,157,.2)",
          color: "#00ff9d",
          alignSelf: "flex-start",
        }}
      >
        ✓ {tip}
      </span>
    </div>
  );
}
