import React, { useState, useEffect, useRef } from 'react';

// ─── SCAN LINE ───────────────────────────────────────────────────────────────
// Fixed: uses position relative to EmailMock container correctly
export function ScanLine() {
  return (
    <>
      <style>{`
        @keyframes scanCSS {
          0%   { top: 0%; opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg,transparent,#00f5ff,transparent)",
          boxShadow: "0 0 8px #00f5ff",
          borderRadius: 6,
          zIndex: 2,
          pointerEvents: "none",
          animation: "scanCSS 4s linear infinite",
        }}
      />
    </>
  );
}
