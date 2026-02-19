// ─── GLOBAL CSS STRING ────────────────────────────────────────────────────────
// Injected via <style>{GLOBAL_CSS}</style> in the root App component.
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

  :root {
    --bg:     #000509;
    --bg2:    #020c16;
    --card:   rgba(0,12,26,0.92);
    --cyan:   #00f5ff;
    --green:  #00ff9d;
    --red:    #ff1744;
    --orange: #ff6d00;
    --purple: #d500f9;
    --gold:   #ffd600;
    --txt:    #e0f7fa;
    --txt2:   #546e7a;
    --glow:   rgba(0,245,255,0.25);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg);
    color: var(--txt);
    overflow-x: hidden;
    font-size: 16px;
    cursor: crosshair;
  }

  #root { min-height: 100vh; }

  /* ── GRID BACKGROUND ── */
  .pg-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,245,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,.04) 1px, transparent 1px),
      linear-gradient(rgba(0,245,255,.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,.012) 1px, transparent 1px);
    background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px;
  }
  .pg-bg::after {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,245,255,.05) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 100% 50%, rgba(213,0,249,.04) 0%, transparent 60%);
  }

  /* ── SCANLINES ── */
  .scanlines {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,.06) 2px,
      rgba(0,0,0,.06) 4px
    );
  }

  /* ── AMBIENT ORBS ── */
  .orb {
    position: fixed; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
    animation: orbF 8s ease-in-out infinite;
  }

  /* ── KEYFRAMES ── */
  @keyframes orbF {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-40px) scale(1.08); }
  }
  @keyframes fuA {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: .4; transform: scale(1.6); }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-14px); }
  }
  @keyframes scan {
    0%   { top: 0; opacity: .8; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes glitch {
    0%,90%,100% { transform: none; }
    92% { transform: translate(-2px, 1px); }
    94% { transform: translate(2px, -1px); }
    96% { transform: translate(-1px, 0); }
    98% { transform: translate(0, 1px); }
  }
  @keyframes popIn {
    from { transform: scale(.6); opacity: 0; }
    to   { transform: scale(1);  opacity: 1; }
  }
  @keyframes confFall {
    0%   { transform: translateY(-10px) rotate(0);    opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes turtleBob {
    from { transform: translateY(0); }
    to   { transform: translateY(-6px); }
  }
  @keyframes ticker {
    0%   { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  /* Responsive Utilities */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .nav-links { display: none !important; }
  }
`;
