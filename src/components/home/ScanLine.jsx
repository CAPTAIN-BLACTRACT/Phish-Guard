import React, { useState, useEffect, useRef } from 'react';

// ─── SCAN LINE ───────────────────────────────────────────────────────────────
// Fixed: uses position relative to EmailMock container correctly
export function ScanLine() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPos((p) => (p >= 100 ? 0 : p + 0.6)), 30);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        background: "linear-gradient(90deg,transparent,#00f5ff,transparent)",
        top: `${pos}%`,
        opacity: 0.8,
        boxShadow: "0 0 8px #00f5ff",
        borderRadius: 6,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}
