import { useState, useEffect, useRef } from "react";
import { T } from "../styles";
import { LB_DATA } from "../constants";
import { db } from "../firebase/config";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const TABS = ["🌍 Global", "👥 This Week", "🏫 Class"];

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
      const newId = Math.random().toString(36).substring(2, 11);
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

// ─── LEADERBOARD PAGE ─────────────────────────────────────────────────────────
export function LeaderboardPage() {
  const [tab, setTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLeaderboard(LB_DATA); // Fallback if empty
      } else {
        const data = snap.docs.map((doc, idx) => ({
          id: doc.id,
          rank: idx + 1,
          ...doc.data()
        }));
        setLeaderboard(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
        @keyframes rowIn          { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 0 0 transparent; }
          50%     { box-shadow: 0 0 24px rgba(0,245,255,.12); }
        }
      `}</style>

      {/* ── Full background stack ── */}
      <CyberBackground />

      {/* ── Page content ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px", maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={T.secLbl}>
          <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> HALL OF DEFENDERS
        </div>
        <h2 style={{ ...T.secTitle, marginBottom: 8 }}>
          Global <span style={{ color: "#00f5ff" }}>Leaderboard</span>
        </h2>
        <p style={{ color: "#546e7a", marginBottom: 36, fontFamily: "Rajdhani, sans-serif", fontSize: ".95rem" }}>
          Compete with thousands of learners worldwide. Your rank updates in real-time.
        </p>

        {/* ── Stat cards ── */}
        <div style={{ display: "flex", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
          {[
            { val: "#47", color: "#ffd600", lbl: "Your Rank", icon: "🏅" },
            { val: "1,250", color: "#00f5ff", lbl: "Your XP", icon: "⚡" },
            { val: "🔥 5", color: "#ff6d00", lbl: "Day Streak", icon: null },
            { val: "87%", color: "#00ff9d", lbl: "Accuracy", icon: "🎯" },
          ].map(({ val, color, lbl }) => (
            <div
              key={lbl}
              style={{
                ...T.card,
                padding: "22px 28px",
                textAlign: "center",
                flex: 1,
                minWidth: 140,
                animation: "cardGlow 4s ease-in-out infinite",
                borderColor: `${color}22`,
              }}
            >
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                borderRadius: "6px 6px 0 0",
                opacity: 0.6,
              }} />
              <div style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.9rem",
                fontWeight: 800,
                color,
                textShadow: `0 0 20px ${color}88`,
                lineHeight: 1,
                marginBottom: 6,
              }}>
                {val}
              </div>
              <div style={{
                fontSize: ".72rem",
                color: "#546e7a",
                fontFamily: "Share Tech Mono, monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                padding: "8px 22px",
                borderRadius: 4,
                border: tab === i ? "1px solid rgba(0,245,255,.4)" : "1px solid rgba(0,245,255,.12)",
                background: tab === i ? "rgba(0,245,255,.08)" : "transparent",
                fontSize: ".85rem",
                fontWeight: 600,
                cursor: "pointer",
                color: tab === i ? "#00f5ff" : "#546e7a",
                fontFamily: "Share Tech Mono, monospace",
                letterSpacing: "0.05em",
                transition: "all .2s",
                boxShadow: tab === i ? "0 0 14px rgba(0,245,255,.12)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div style={{ ...T.card, overflow: "hidden" }}>

          {/* Table top accent */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
            opacity: 0.5,
          }} />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,245,255,.03)" }}>
                {["Rank", "Defender", "XP", "Streak", "Badges"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: ".68rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(0,245,255,.6)",
                      padding: "12px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(0,245,255,.1)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, rowIdx) => {
                const rankColor =
                  u.rank === 1 ? "#ffd600" :
                    u.rank === 2 ? "#b0bec5" :
                      u.rank === 3 ? "#ff9e80" : "#e0f7fa";

                const rankBg =
                  u.rank === 1 ? "rgba(255,214,0,.06)" :
                    u.rank === 2 ? "rgba(176,190,197,.04)" :
                      u.rank === 3 ? "rgba(255,158,128,.05)" : "transparent";

                return (
                  <tr
                    key={u.rank}
                    style={{
                      background: u.isYou ? "rgba(0,245,255,.05)" : rankBg,
                      borderTop: u.isYou ? "1px solid rgba(0,245,255,.2)" : "none",
                      borderBottom: u.isYou ? "1px solid rgba(0,245,255,.1)" : "none",
                      transition: "background .2s",
                      animation: `rowIn .4s ${rowIdx * 0.05}s ease both`,
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.04)", width: 60 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {u.rank <= 3 && (
                          <span style={{ fontSize: "1rem" }}>
                            {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : "🥉"}
                          </span>
                        )}
                        <span style={{
                          fontFamily: "Orbitron, sans-serif",
                          fontSize: u.rank <= 3 ? "1rem" : ".9rem",
                          fontWeight: 800,
                          color: rankColor,
                          textShadow: u.rank <= 3 ? `0 0 15px ${rankColor}` : "none",
                        }}>
                          {u.rank <= 3 ? "" : `#${u.rank}`}
                        </span>
                      </div>
                    </td>

                    {/* Defender */}
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".82rem", fontWeight: 700,
                          background: u.color, color: "#000",
                          boxShadow: u.isYou ? "0 0 12px rgba(0,245,255,.4)" : "none",
                          border: u.isYou ? "2px solid rgba(0,245,255,.5)" : "2px solid transparent",
                          flexShrink: 0,
                        }}>
                          {u.initials}
                        </div>
                        <div>
                          <div style={{
                            fontSize: ".9rem", fontWeight: 600,
                            color: u.isYou ? "#00f5ff" : "#e0f7fa",
                          }}>
                            {u.name}
                            {u.isYou && (
                              <span style={{
                                marginLeft: 8, fontSize: ".68rem",
                                fontFamily: "Share Tech Mono, monospace",
                                color: "#00f5ff", letterSpacing: "0.1em",
                                padding: "1px 6px",
                                border: "1px solid rgba(0,245,255,.3)",
                                borderRadius: 2,
                                background: "rgba(0,245,255,.06)",
                              }}>YOU</span>
                            )}
                          </div>
                          <div style={{
                            fontSize: ".75rem", color: "#546e7a",
                            fontFamily: "Share Tech Mono, monospace",
                          }}>
                            Level {u.level}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* XP */}
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <span style={{
                        fontFamily: "Share Tech Mono, monospace",
                        fontSize: ".88rem",
                        color: "#00f5ff",
                        fontWeight: 700,
                        textShadow: "0 0 10px rgba(0,245,255,.4)",
                      }}>
                        {u.xp.toLocaleString()} XP
                      </span>
                    </td>

                    {/* Streak */}
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <span style={{
                        fontFamily: "Share Tech Mono, monospace",
                        fontSize: ".82rem",
                        color: "#ff6d00",
                      }}>
                        🔥 {u.streak}d
                      </span>
                    </td>

                    {/* Badges */}
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {u.badges.map((b, i) => (
                          <span
                            key={i}
                            title={b}
                            style={{
                              fontSize: "1.1rem",
                              filter: "drop-shadow(0 0 4px rgba(0,245,255,.3))",
                              cursor: "default",
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}