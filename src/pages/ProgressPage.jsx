import { useState, useEffect, useRef } from "react";
import { T } from "../styles";
import { BADGES } from "../constants";
import { XPBar } from "../components";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

const MODULES = [
  { name: "Email Phishing Basics", sub: "5 levels completed", status: "done" },
  { name: "Red Flag Identification", sub: "6 levels completed", status: "done" },
  { name: "SMS / Smishing", sub: "Level 2 of 5 in progress", status: "active" },
  { name: "Spear Phishing", sub: "Unlock at Level 10", status: "locked" },
  { name: "Advanced Social Engineering", sub: "Unlock at Level 15", status: "locked" },
];

const ACTIVITY_STATS = [
  ["Quizzes Completed", "23", "#00f5ff"],
  ["Simulations Done", "8", "#00ff9d"],
  ["Streak Record", "12 days", "#ff6d00"],
  ["Community Flags", "15", "#d500f9"],
];

function dotColor(s) { return s === "done" ? "#00ff9d" : s === "active" ? "#00f5ff" : "#546e7a"; }
function badgeText(s) { return s === "done" ? "✓ DONE" : s === "active" ? "→ ACTIVE" : "🔒 LOCKED"; }

// ─── CANVAS: MATRIX RAIN ─────────────────────────────────────────────────────
function MatrixCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトNULL PHISHGUARD XOR AES SHA256 EXPLOIT PAYLOAD THREAT DETECT VOID";
    let W, H, drops;
    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const cols = Math.floor(W / 12);
      drops = Array.from({ length: cols }, () => (Math.random() * -H) / 12);
    };
    const draw = () => {
      ctx.fillStyle = "rgba(0,5,9,0.048)";
      ctx.fillRect(0, 0, W, H);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        if (y > 0) {
          ctx.font = "bold 12px 'Share Tech Mono', monospace";
          ctx.fillStyle = i % 4 === 0 ? "#00ff9d" : i % 6 === 0 ? "#d500f9" : "#00f5ff";
          ctx.globalAlpha = 0.85;
          ctx.fillText(char, i * 12, y * 12);
          for (let t = 1; t < 10; t++) {
            ctx.globalAlpha = (1 - t / 10) * 0.4;
            ctx.font = "11px 'Share Tech Mono', monospace";
            ctx.fillStyle = "#00f5ff";
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 12, (y - t) * 12);
          }
        }
        ctx.globalAlpha = 1;
        if (y * 12 > H && Math.random() > 0.972) drops[i] = 0;
        drops[i] += 0.5 + Math.random() * 0.2;
      });
    };
    init();
    window.addEventListener("resize", init);
    const id = setInterval(draw, 50);
    return () => { clearInterval(id); window.removeEventListener("resize", init); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none", opacity: 0.045,
    }} />
  );
}

// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [];
    let mouse = { x: -9999, y: -9999 };
    let targetDark = { x: -9999, y: -9999 };
    let currentDark = { x: -9999, y: -9999 };
    const CONN = 120, MDIST = 150, DARK_R = 220;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const initP = () => {
      resize();
      const n = Math.floor((W * H) / 16000);
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.4,
        color: Math.random() > 0.65 ? [255, 23, 68] : Math.random() > 0.4 ? [0, 245, 255] : Math.random() > 0.5 ? [0, 255, 157] : [213, 0, 249],
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    initP();

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; targetDark.x = e.clientX; targetDark.y = e.clientY; };
    const onLeave = () => { targetDark.x = -9999; targetDark.y = -9999; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", initP);

    let raf;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      currentDark.x += (targetDark.x - currentDark.x) * 0.1;
      currentDark.y += (targetDark.y - currentDark.y) * 0.1;
      if (currentDark.x > -500) {
        const grad = ctx.createRadialGradient(currentDark.x, currentDark.y, 0, currentDark.x, currentDark.y, DARK_R);
        grad.addColorStop(0, "rgba(0,0,0,0.82)"); grad.addColorStop(0.35, "rgba(0,0,0,0.6)");
        grad.addColorStop(0.65, "rgba(0,0,0,0.25)"); grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      }
      particles.forEach((p) => {
        p.pulse += 0.018;
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MDIST) { p.vx += (mdx / md) * 0.012; p.vy += (mdy / md) * 0.012; }
        p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN) {
            const alpha = (1 - d / CONN) * 0.22;
            const [r, g, bl] = a.color;
            ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const p = particles[i];
        const mdx2 = p.x - mouse.x, mdy2 = p.y - mouse.y;
        const md2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
        if (md2 < MDIST) {
          const alpha = (1 - md2 / MDIST) * 0.55;
          const [r, g, bl] = p.color;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      particles.forEach((p) => {
        const [r, g, b] = p.color;
        const pr = p.r * (0.75 + Math.sin(p.pulse) * 0.25);
        ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`; ctx.shadowBlur = 7;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      if (mouse.x > -500) {
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,245,255,0.9)"; ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00f5ff"; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,245,255,0.2)"; ctx.lineWidth = 1; ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", initP);
    };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none", opacity: 0.9,
    }} />
  );
}

// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────
function HexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, t = 0, raf;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const hex = (x, y, s, a) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        ctx.lineTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,245,255,${a})`; ctx.lineWidth = 0.5; ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); t += 0.004;
      const s = 42, hx = s * Math.sqrt(3), hy = s * 1.5;
      const cols = Math.ceil(W / hx) + 2, rows = Math.ceil(H / hy) + 2;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * hx + (r % 2 === 0 ? hx / 2 : 0), y = r * hy;
          const dx = (x - W / 2) / W, dy = (y - H / 2) / H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.abs(Math.sin(dist * 5 - t * 2));
          const a = (0.25 + 0.75 * (1 - dist)) * wave * 0.55;
          if (a > 0.005) hex(x, y, s - 4, a);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none", opacity: 0.065,
    }} />
  );
}

// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────
function LightningStreaks() {
  const [streaks, setStreaks] = useState([]);
  useEffect(() => {
    let id = 0;
    const spawn = () => {
      const newId = id++;
      const colors = ["rgba(0,245,255,", "rgba(0,255,157,", "rgba(213,0,249,", "rgba(255,23,68,"];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const h = 80 + Math.random() * 220;
      const streak = { id: newId, left: Math.random() * 100, height: h, color: c, duration: 2.5 + Math.random() * 5, delay: Math.random() * 0.5 };
      setStreaks((s) => [...s.slice(-14), streak]);
      setTimeout(() => setStreaks((s) => s.filter((x) => x.id !== newId)), 8000);
    };
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 400);
    const interval = setInterval(() => { if (Math.random() > 0.3) spawn(); }, 600);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {streaks.map((s) => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.left}%`, width: 1, height: s.height, top: -s.height,
          background: `linear-gradient(180deg, transparent, ${s.color}0.9), ${s.color}0.4), transparent)`,
          boxShadow: `0 0 4px ${s.color}0.6)`, borderRadius: 1,
          animation: `streamFall ${s.duration}s ${s.delay}s linear forwards`,
        }} />
      ))}
    </div>
  );
}

// ─── CYBER BACKGROUND ────────────────────────────────────────────────────────
function CyberBackground() {
  return (
    <>
      <MatrixCanvas />
      <ParticleCanvas />
      <HexCanvas />
      <LightningStreaks />

      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        animation: "scanlineScroll 8s linear infinite",
      }} />

      {/* Ambient orbs */}
      {[
        { w: 800, h: 800, bg: "rgba(0,245,255,0.09)", top: -250, left: -250, delay: "0s" },
        { w: 600, h: 600, bg: "rgba(213,0,249,0.1)", top: "40%", right: -220, delay: "-3s" },
        { w: 500, h: 500, bg: "rgba(0,255,157,0.06)", bottom: "5%", left: "15%", delay: "-6s" },
        { w: 380, h: 380, bg: "rgba(255,23,68,0.07)", top: "55%", left: "8%", delay: "-2s" },
      ].map((o, i) => (
        <div key={i} style={{
          position: "fixed", borderRadius: "50%", filter: "blur(120px)",
          pointerEvents: "none", zIndex: 0,
          width: o.w, height: o.h, background: o.bg,
          top: o.top ?? "auto", left: o.left ?? "auto",
          right: o.right ?? "auto", bottom: o.bottom ?? "auto",
          animation: `orbF 8s ${o.delay} ease-in-out infinite`,
        }} />
      ))}

      {/* Dot / line grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,245,255,.04) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,245,255,.04) 1px,transparent 1px),
          linear-gradient(rgba(0,245,255,.015) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,245,255,.015) 1px,transparent 1px)`,
        backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
      }} />

      {/* Radial ambient gradients */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,245,255,0.04) 0%,transparent 60%),
          radial-gradient(ellipse 40% 40% at 100% 50%,rgba(213,0,249,0.04) 0%,transparent 60%)`,
      }} />
    </>
  );
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "Orbitron, sans-serif", fontSize: ".85rem", fontWeight: 700,
      marginBottom: 20, color: "#00f5ff", letterSpacing: "0.08em",
    }}>
      // {children}
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────
export function ProgressPage({ xp, level, xpPct, xpToNext }) {
  const { user } = useAuth();
  const { profile } = useUser();

  const ACTIVITY_STATS = [
    ["Quizzes Completed", profile?.quizzesCompleted || "0", "#00f5ff"],
    ["Simulations Done", profile?.simulationsDone || "0", "#00ff9d"],
    ["Streak Record", `${profile?.streak || 0} days`, "#ff6d00"],
    ["Community Flags", profile?.communityFlags || "0", "#d500f9"],
  ];

  const agentName = profile?.displayName || user?.displayName || "Guest Agent";
  const agentInitials = agentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div style={{
      ...T.page,
      background: "#000509",
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes orbF           { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.08)} }
        @keyframes scanlineScroll { 0%{background-position:0 0} 100%{background-position:0 100px} }
        @keyframes streamFall     { 0%{top:-300px;opacity:0} 10%{opacity:.7} 90%{opacity:.3} 100%{top:110vh;opacity:0} }
        @keyframes fuA            { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse          { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        @keyframes avatarGlow     {
          0%,100% { box-shadow: 0 0 40px rgba(0,245,255,.25), 0 0 80px rgba(213,0,249,.15); }
          50%     { box-shadow: 0 0 60px rgba(0,245,255,.45), 0 0 100px rgba(213,0,249,.3); }
        }
        @keyframes statIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 6px currentColor; }
          50%     { box-shadow: 0 0 14px currentColor; }
        }
      `}</style>

      {/* ── Full background stack ── */}
      <CyberBackground />

      {/* ── Page content ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Profile header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 28, marginBottom: 48,
          flexWrap: "wrap", animation: "fuA .5s ease both",
        }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 6,
            background: "linear-gradient(135deg,#00f5ff,#d500f9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Orbitron, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#000",
            animation: "avatarGlow 4s ease-in-out infinite",
            flexShrink: 0,
          }}>
            {agentInitials || "CK"}
          </div>

          <div>
            <h2 style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800,
              marginBottom: 6, letterSpacing: "-0.01em",
            }}>
              {agentName}
            </h2>
            <p style={{ color: "#546e7a", fontFamily: "Share Tech Mono, monospace", fontSize: ".82rem" }}>
              Level {level} · {profile?.specialization || "Awareness Recruit"} · Joined {profile?.createdAt ? "recently" : "60 days ago"}
            </p>
            {/* Live status dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#00ff9d", boxShadow: "0 0 10px #00ff9d",
                display: "inline-block", animation: "pulse 2s infinite",
              }} />
              <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".68rem", color: "#00ff9d", letterSpacing: "0.1em" }}>
                ONLINE · ACTIVE SESSION
              </span>
            </div>
          </div>

          {/* Global rank */}
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{
              fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem",
              color: "#546e7a", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Global Rank
            </div>
            <div style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "2.4rem", fontWeight: 800,
              color: "#ffd600", textShadow: "0 0 30px rgba(255,214,0,0.5)", lineHeight: 1,
            }}>
              #47
            </div>
            <div style={{
              fontFamily: "Share Tech Mono, monospace", fontSize: ".68rem",
              color: "#546e7a", marginTop: 4,
            }}>
              Top 5% worldwide
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            ["⚡", xp.toLocaleString(), "Total XP", "#00f5ff"],
            ["🔥", profile?.streak || 0, "Day Streak", "#ff6d00"],
            ["🎯", profile?.accuracy || "0%", "Accuracy", "#00ff9d"],
            ["📧", "34", "Emails Flagged", "#d500f9"],
          ].map(([icon, val, lbl, color], idx) => (
            <div
              key={lbl}
              style={{
                ...T.card,
                padding: "24px 20px",
                textAlign: "center",
                animation: `statIn .5s ${idx * 0.08}s ease both`,
                borderColor: `${color}22`,
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                borderRadius: "6px 6px 0 0", opacity: 0.7,
              }} />
              <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>{icon}</span>
              <div style={{
                fontFamily: "Orbitron, sans-serif", fontSize: "1.6rem", fontWeight: 800,
                color, marginBottom: 4, textShadow: `0 0 20px ${color}60`,
              }}>
                {val}
              </div>
              <div style={{
                fontSize: ".72rem", color: "#546e7a",
                fontFamily: "Share Tech Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── LEFT col: badges + learning map ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Badge rack */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>ACHIEVEMENT BADGES</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {BADGES.map((b, idx) => (
                  <div
                    key={b.name}
                    title={b.name + (b.prog ? " · " + b.prog : "")}
                    style={{
                      textAlign: "center",
                      padding: "14px 8px",
                      borderRadius: 6,
                      cursor: b.earned ? "pointer" : "default",
                      transition: "all .2s",
                      animation: `statIn .4s ${idx * 0.04}s ease both`,
                      ...(b.earned
                        ? {
                          background: "linear-gradient(135deg,rgba(0,245,255,.06),rgba(0,12,26,0.95))",
                          border: "1px solid rgba(0,245,255,.25)",
                          boxShadow: "0 0 20px rgba(0,245,255,.06)",
                        }
                        : {
                          background: "rgba(0,5,14,0.8)",
                          border: "1px solid rgba(255,255,255,.06)",
                          opacity: 0.5,
                          filter: "grayscale(0.8)",
                        }),
                    }}
                  >
                    <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{b.icon}</div>
                    <div style={{
                      fontFamily: "Share Tech Mono, monospace", fontSize: ".6rem",
                      color: b.earned ? "#e0f7fa" : "#546e7a",
                    }}>
                      {b.name}
                    </div>
                    {!b.earned && b.prog && (
                      <div style={{ fontSize: ".58rem", color: "#546e7a", marginTop: 2 }}>{b.prog}</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 16, padding: "10px 14px",
                background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.1)",
                borderRadius: 4, fontSize: ".78rem", color: "#546e7a",
                fontFamily: "Share Tech Mono, monospace",
              }}>
                300 XP until next badge →{" "}
                <span style={{ color: "#00f5ff" }}>Spear Expert</span>
              </div>
            </div>

            {/* Learning map */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>LEARNING MAP</SectionLabel>
              {MODULES.map((m, i) => {
                const dc = dotColor(m.status);
                return (
                  <div
                    key={m.name}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 0",
                      borderBottom: i < MODULES.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
                      animation: `statIn .4s ${i * 0.07}s ease both`,
                    }}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: dc, boxShadow: `0 0 8px ${dc}`,
                      flexShrink: 0,
                      animation: m.status === "active" ? "pulse 2s infinite" : "none",
                    }} />

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: ".88rem", fontWeight: 600,
                        color: m.status === "locked" ? "#546e7a" : "#e0f7fa",
                      }}>
                        {m.name}
                      </div>
                      <div style={{
                        fontSize: ".73rem", color: "#546e7a",
                        fontFamily: "Share Tech Mono, monospace", marginTop: 2,
                      }}>
                        {m.sub}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontFamily: "Share Tech Mono, monospace", fontSize: ".68rem",
                      color: dc, padding: "2px 8px", borderRadius: 2,
                      border: `1px solid ${dc}40`,
                      background: `${dc}0a`,
                      whiteSpace: "nowrap",
                    }}>
                      {badgeText(m.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT col: XP + activity + Sheldon ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* XP block */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>XP PROGRESS</SectionLabel>
              <XPBar xp={xp} level={level} xpPct={xpPct} xpToNext={xpToNext} />
              <div style={{ marginTop: 16 }}>
                {ACTIVITY_STATS.map(([lbl, val, color], idx) => (
                  <div
                    key={lbl}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "11px 0",
                      borderBottom: idx < ACTIVITY_STATS.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
                      animation: `statIn .4s ${idx * 0.07}s ease both`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: color, boxShadow: `0 0 6px ${color}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: ".85rem", color: "#546e7a" }}>{lbl}</span>
                    </div>
                    <span style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: ".9rem",
                      fontWeight: 700, color,
                      textShadow: `0 0 12px ${color}60`,
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly activity mini-chart */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>WEEKLY ACTIVITY</SectionLabel>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 70 }}>
                {[40, 75, 55, 90, 60, 100, 80].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%",
                      height: `${h}%`,
                      background: i === 6
                        ? "linear-gradient(180deg,#00f5ff,#00ff9d)"
                        : "rgba(0,245,255,.18)",
                      borderRadius: "3px 3px 0 0",
                      boxShadow: i === 6 ? "0 0 12px rgba(0,245,255,.4)" : "none",
                      transition: "all .3s",
                    }} />
                    <span style={{
                      fontFamily: "Share Tech Mono, monospace", fontSize: ".58rem",
                      color: i === 6 ? "#00f5ff" : "#546e7a",
                    }}>
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, fontFamily: "Share Tech Mono, monospace",
                fontSize: ".72rem", color: "#546e7a", textAlign: "right",
              }}>
                This week: <span style={{ color: "#00f5ff" }}>247 XP earned</span>
              </div>
            </div>

            {/* Finn's Advisor tip */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>FINN-AI NEURAL ADVISOR</SectionLabel>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  fontSize: "2rem", flexShrink: 0,
                  filter: "drop-shadow(0 0 8px rgba(0,245,255,.3))",
                }}>
                  📡
                </div>
                <p style={{
                  fontSize: ".85rem", color: "#546e7a",
                  lineHeight: 1.7, fontStyle: "italic", margin: 0,
                }}>
                  "Neural analysis complete. Your performance metrics are stabilizing. Keep the momentum — just{" "}
                  <span style={{ color: "#00ff9d" }}>2 more days</span> to unlock the{" "}
                  <span style={{ color: "#ffd600" }}>Dedication Badge</span>. Today, try the Spear Phishing simulator!"
                </p>
              </div>
              {/* Tip action */}
              <div style={{
                marginTop: 14, padding: "8px 14px",
                background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)",
                borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#00f5ff" }}>
                  → Recommendation: Execute High-Fidelity Simulation
                </span>
                <span style={{ fontSize: ".72rem", color: "#546e7a", fontFamily: "Share Tech Mono, monospace" }}>
                  +150 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}