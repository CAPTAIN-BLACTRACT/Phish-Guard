import React, { useState, useEffect, useRef } from 'react';

// ─── STAT DIVIDER ────────────────────────────────────────────────────────────
// Fixed: use a fixed-height div instead of alignSelf:stretch which requires flex parent height
export function StatDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 40,
        background: "rgba(0,245,255,.1)",
        flexShrink: 0,
      }}
    />
  );
}
