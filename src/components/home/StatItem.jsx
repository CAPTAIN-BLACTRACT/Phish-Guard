import React, { useState, useEffect, useRef } from 'react';

// ─── STAT ITEM ───────────────────────────────────────────────────────────────
export function StatItem({ num, lbl }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: "1.6rem",
          fontWeight: 900,
          color: "#00f5ff",
          display: "block",
          textShadow: "0 0 25px rgba(0,245,255,.6)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontSize: ".68rem",
          color: "var(--txt2)",
          textTransform: "uppercase",
          letterSpacing: "2px",
          fontFamily: "'Share Tech Mono',monospace",
          marginTop: 4,
        }}
      >
        {lbl}
      </span>
    </div>
  );
}
