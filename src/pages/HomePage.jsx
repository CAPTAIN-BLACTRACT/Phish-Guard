import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

const RED_FLAGS = [
  {
    icon: "🔗",
    name: "Suspicious URLs",
    desc: "Attackers use lookalike domains with subtle swaps — 'paypa1.com' instead of 'paypal.com'. Always hover before clicking.",
    tip: "Hover to preview destination",
  },
  {
    icon: "⚡",
    name: "Urgency Tactics",
    desc: "Phrases like 'Act NOW' or 'Account suspended' bypass rational thinking and trigger impulsive clicks.",
    tip: "Take 60 seconds to verify",
  },
  {
    icon: "🏢",
    name: "Sender Spoofing",
    desc: "Display names can be faked. Always check the actual email address domain, not just the friendly name shown.",
    tip: "Expand sender details",
  },
  {
    icon: "📎",
    name: "Dangerous Attachments",
    desc: ".exe, .zip, .docx with macros — unexpected attachments are prime malware vectors. Don't open what you didn't request.",
    tip: "Scan before opening",
  },
  {
    icon: "🔑",
    name: "Credential Requests",
    desc: "Legitimate organizations never ask for passwords or 2FA codes via email. Any such request is a guaranteed red flag.",
    tip: "Never share via email",
  },
  {
    icon: "✍️",
    name: "Generic Greetings",
    desc: "'Dear valued customer' signals mass phishing. Your bank knows your name — impersonators usually don't.",
    tip: "Check for personalization",
  },
];

const T = {
  page: {
    background: "#000509",
    minHeight: "100vh",
    color: "#e0f7fa",
    fontFamily: "'Rajdhani', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  card: {
    background:
      "linear-gradient(135deg,rgba(0,12,26,0.95) 0%,rgba(0,5,14,0.98) 100%)",
    border: "1px solid rgba(0,245,255,0.12)",
    borderRadius: 6,
    backdropFilter: "blur(24px)",
    position: "relative",
    overflow: "hidden",
    transition: "all .3s",
  },
  logo: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: "1.15rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#e0f7fa",
  },
  btnHP: {
    padding: "12px 28px",
    background: "transparent",
    border: "1px solid #00f5ff",
    borderRadius: 3,
    color: "#00f5ff",
    fontSize: ".85rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    boxShadow: "0 0 25px rgba(0,245,255,.2),inset 0 0 25px rgba(0,245,255,.05)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    position: "relative",
    overflow: "hidden",
    transition: "all .25s",
  },
  btnHS: {
    padding: "12px 26px",
    background: "rgba(255,255,255,.02)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 3,
    color: "#e0f7fa",
    fontSize: ".85rem",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Share Tech Mono', monospace",
    display: "flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "0.05em",
    transition: "all .25s",
  },
  secLbl: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: ".68rem",
    letterSpacing: "4px",
    textTransform: "uppercase",
    color: "#00f5ff",
    marginBottom: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  secTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "clamp(1.7rem,3.5vw,2.5rem)",
    fontWeight: 900,
    lineHeight: 1.15,
    marginBottom: 14,
    letterSpacing: "-0.02em",
  },
};

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
          ctx.fillStyle =
            i % 4 === 0 ? "#00ff9d" : i % 6 === 0 ? "#d500f9" : "#00f5ff";
          ctx.globalAlpha = 0.85;
          ctx.fillText(char, i * 12, y * 12);
          for (let t = 1; t < 10; t++) {
            ctx.globalAlpha = (1 - t / 10) * 0.4;
            ctx.font = "11px 'Share Tech Mono', monospace";
            ctx.fillStyle = "#00f5ff";
            ctx.fillText(
              chars[Math.floor(Math.random() * chars.length)],
              i * 12,
              (y - t) * 12,
            );
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
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", init);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.045,
      }}
    />
  );
}

// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles = [];
    let mouse = { x: -9999, y: -9999 };
    let targetDark = { x: -9999, y: -9999 };
    let currentDark = { x: -9999, y: -9999 };
    const CONN = 120,
      MDIST = 150,
      DARK_R = 220;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const initP = () => {
      resize();
      const n = Math.floor((W * H) / 16000);
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.4,
        color:
          Math.random() > 0.65
            ? [255, 23, 68]
            : Math.random() > 0.4
              ? [0, 245, 255]
              : Math.random() > 0.5
                ? [0, 255, 157]
                : [213, 0, 249],
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    initP();

    const onMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      targetDark.x = e.clientX;
      targetDark.y = e.clientY;
    };
    const onLeave = () => {
      targetDark.x = -9999;
      targetDark.y = -9999;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", initP);

    let raf;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      currentDark.x += (targetDark.x - currentDark.x) * 0.1;
      currentDark.y += (targetDark.y - currentDark.y) * 0.1;
      if (currentDark.x > -500) {
        const grad = ctx.createRadialGradient(
          currentDark.x,
          currentDark.y,
          0,
          currentDark.x,
          currentDark.y,
          DARK_R,
        );
        grad.addColorStop(0, "rgba(0,0,0,0.82)");
        grad.addColorStop(0.35, "rgba(0,0,0,0.6)");
        grad.addColorStop(0.65, "rgba(0,0,0,0.25)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
      particles.forEach((p) => {
        p.pulse += 0.018;
        const mdx = mouse.x - p.x,
          mdy = mouse.y - p.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < MDIST) {
          p.vx += (mdx / md) * 0.012;
          p.vy += (mdy / md) * 0.012;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i],
            b = particles[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN) {
            const alpha = (1 - d / CONN) * 0.22;
            const [r, g, bl] = a.color;
            ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const p = particles[i];
        const mdx2 = p.x - mouse.x,
          mdy2 = p.y - mouse.y;
        const md2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
        if (md2 < MDIST) {
          const alpha = (1 - md2 / MDIST) * 0.55;
          const [r, g, bl] = p.color;
          ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      particles.forEach((p) => {
        const [r, g, b] = p.color;
        const pr = p.r * (0.75 + Math.sin(p.pulse) * 0.25);
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      if (mouse.x > -500) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,245,255,0.9)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,245,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
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
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}

// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────
function HexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      t = 0,
      raf;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const hex = (x, y, s, a) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        ctx.lineTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,245,255,${a})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.004;
      const s = 42,
        hx = s * Math.sqrt(3),
        hy = s * 1.5;
      const cols = Math.ceil(W / hx) + 2,
        rows = Math.ceil(H / hy) + 2;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = c * hx + (r % 2 === 0 ? hx / 2 : 0),
            y = r * hy;
          const dx = (x - W / 2) / W,
            dy = (y - H / 2) / H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.abs(Math.sin(dist * 5 - t * 2));
          const a = (0.25 + 0.75 * (1 - dist)) * wave * 0.55;
          if (a > 0.005) hex(x, y, s - 4, a);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.065,
      }}
    />
  );
}

// ─── SCAN LINE ───────────────────────────────────────────────────────────────
// Fixed: uses position relative to EmailMock container correctly
function ScanLine() {
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

// ─── EMAIL MOCK ──────────────────────────────────────────────────────────────
function EmailMock() {
  return (
    <div
      style={{
        background: "rgba(0,8,18,0.97)",
        border: "1px solid rgba(0,245,255,.2)",
        borderRadius: 6,
        padding: 22,
        width: 400,
        backdropFilter: "blur(24px)",
        position: "relative",
        boxShadow:
          "0 0 60px rgba(0,245,255,.1),0 40px 80px rgba(0,0,0,.7),inset 0 0 60px rgba(0,245,255,.02)",
        animation: "floatY 4s ease-in-out infinite",
        // overflow hidden removed so scanline isn't clipped unexpectedly;
        // we clip only scanline within bounds via the container
      }}
    >
      {/* overflow clip wrapper for scanline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 6,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <ScanLine />
      </div>

      <div
        style={{
          position: "absolute",
          top: -10,
          left: 16,
          background: "#000509",
          padding: "0 8px",
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: ".6rem",
          color: "#00f5ff",
          letterSpacing: "0.15em",
          zIndex: 3,
        }}
      >
        THREAT ANALYSIS
      </div>

      {/* Corner brackets */}
      {[
        { top: 6, left: 6, borderWidth: "1px 0 0 1px" },
        { top: 6, right: 6, borderWidth: "1px 1px 0 0" },
        { bottom: 6, left: 6, borderWidth: "0 0 1px 1px" },
        { bottom: 6, right: 6, borderWidth: "0 1px 1px 0" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderColor: "rgba(0,245,255,0.4)",
            borderStyle: "solid",
            zIndex: 3,
            ...s,
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,.06)",
          position: "relative",
          zIndex: 4,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 4,
            background: "linear-gradient(135deg,#ff1744,#ff6d00)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: ".9rem",
            fontWeight: 700,
            boxShadow: "0 0 15px rgba(255,23,68,0.4)",
            flexShrink: 0,
          }}
        >
          ⚠
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: ".78rem",
              color: "#546e7a",
            }}
          >
            From:{" "}
            <strong style={{ color: "#ff1744" }}>billing@paypa1.com</strong>
          </div>
          <div style={{ fontSize: ".85rem", fontWeight: 600 }}>
            🔴 URGENT: Verify Your Account
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 9px",
            background: "rgba(255,23,68,.1)",
            border: "1px solid rgba(255,23,68,.4)",
            borderRadius: 2,
            fontSize: ".68rem",
            color: "#ff1744",
            fontFamily: "'Share Tech Mono',monospace",
            animation: "blinkBorder 2s infinite",
            flexShrink: 0,
          }}
        >
          ⚠ SUSPICIOUS
        </div>
      </div>
      <p
        style={{
          fontSize: ".83rem",
          lineHeight: 1.7,
          color: "#546e7a",
          marginBottom: 14,
          position: "relative",
          zIndex: 4,
        }}
      >
        Dear valued customer, your account has been{" "}
        <strong style={{ color: "#ff1744" }}>suspended</strong>. Click
        immediately to restore access or lose your funds permanently.
      </p>
      <div
        style={{
          display: "block",
          padding: "7px 11px",
          background: "rgba(255,23,68,.06)",
          border: "1px solid rgba(255,23,68,.2)",
          borderRadius: 4,
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: ".74rem",
          color: "#ff1744",
          marginBottom: 14,
          cursor: "pointer",
          wordBreak: "break-all",
          position: "relative",
          zIndex: 4,
        }}
      >
        http://secure-paypal-verify.xyz/login?token=a8c...
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", position: "relative", zIndex: 4 }}>
        {[
          { label: "⚠ Fake Domain", cls: "red" },
          { label: "⚠ Urgency", cls: "red" },
          { label: "🔗 Bad URL", cls: "orange" },
        ].map(({ label, cls }) => (
          <span
            key={label}
            style={{
              padding: "3px 9px",
              borderRadius: 2,
              fontSize: ".68rem",
              fontFamily: "'Share Tech Mono',monospace",
              background:
                cls === "red" ? "rgba(255,23,68,.1)" : "rgba(255,109,0,.1)",
              border:
                cls === "red"
                  ? "1px solid rgba(255,23,68,.35)"
                  : "1px solid rgba(255,109,0,.35)",
              color: cls === "red" ? "#ff1744" : "#ff6d00",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAV CARD ────────────────────────────────────────────────────────────────
function NavCard({ icon, title, desc, onClick }) {
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
        <div style={{ fontSize: ".82rem", color: "#546e7a", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

// ─── RED FLAG CARD ───────────────────────────────────────────────────────────
function RedFlagCard({ icon, name, desc, tip }) {
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
          color: "#546e7a",
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

// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────
function LightningStreaks() {
  const [streaks, setStreaks] = useState([]);

  useEffect(() => {
    let id = 0;
    const spawn = () => {
      const newId = Math.random().toString(36).substring(2, 11);
      const colors = [
        "rgba(0,245,255,",
        "rgba(0,255,157,",
        "rgba(213,0,249,",
        "rgba(255,23,68,",
      ];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const h = 80 + Math.random() * 220;
      const streak = {
        id: newId,
        left: Math.random() * 100,
        height: h,
        color: c,
        duration: 2.5 + Math.random() * 5,
        delay: Math.random() * 0.5,
      };
      setStreaks((s) => [...s.slice(-14), streak]);
      setTimeout(
        () => setStreaks((s) => s.filter((x) => x.id !== newId)),
        8000,
      );
    };
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 400);
    const interval = setInterval(() => {
      if (Math.random() > 0.3) spawn();
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {streaks.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            width: 1,
            height: s.height,
            top: -s.height,
            background: `linear-gradient(180deg, transparent, ${s.color}0.9), ${s.color}0.4), transparent)`,
            boxShadow: `0 0 4px ${s.color}0.6)`,
            borderRadius: 1,
            animation: `streamFall ${s.duration}s ${s.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── STAT ITEM ───────────────────────────────────────────────────────────────
function StatItem({ num, lbl }) {
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
          color: "#546e7a",
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

// ─── STAT DIVIDER ────────────────────────────────────────────────────────────
// Fixed: use a fixed-height div instead of alignSelf:stretch which requires flex parent height
function StatDivider() {
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

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
// Fixed: Extracted into a separate component that only renders once
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }

      body {
        background: #000509;
        font-family: 'Rajdhani', sans-serif;
        overflow-x: hidden;
        cursor: crosshair;
      }

      #root, #__next {
        position: relative;
      }

      .pg-grid-bg::before {
        content:'';
        position: fixed;
        inset: 0;
        background-image:
          linear-gradient(rgba(0,245,255,.04) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,245,255,.04) 1px,transparent 1px),
          linear-gradient(rgba(0,245,255,.015) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,245,255,.015) 1px,transparent 1px);
        background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px;
        pointer-events: none;
        z-index: 0;
      }

      .pg-grid-bg::after {
        content:'';
        position: fixed;
        inset: 0;
        background:
          radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,245,255,0.04) 0%,transparent 60%),
          radial-gradient(ellipse 40% 40% at 100% 50%,rgba(213,0,249,0.04) 0%,transparent 60%);
        pointer-events: none;
        z-index: 0;
      }

      @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes orbF   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.08)} }
      @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
      @keyframes fuA    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes glitch {
        0%,90%,100%{transform:none;text-shadow:0 0 20px #00f5ff}
        92%{transform:translate(-2px,1px);text-shadow:2px 0 #ff1744,-2px 0 #00ff9d}
        94%{transform:translate(2px,-1px);text-shadow:-2px 0 #ff1744,2px 0 #00ff9d}
        96%{transform:translate(-1px,0);text-shadow:2px 0 #d500f9,-1px 0 #00ff9d}
        98%{transform:translate(0,1px);text-shadow:-2px 0 #ff1744,2px 0 #00f5ff}
      }
      @keyframes scanlineScroll { 0%{background-position:0 0} 100%{background-position:0 100px} }
      @keyframes blinkBorder {
        0%,100%{border-color:rgba(255,23,68,.4);box-shadow:0 0 10px rgba(255,23,68,.15)}
        50%{border-color:rgba(255,23,68,.85);box-shadow:0 0 22px rgba(255,23,68,.4)}
      }
      @keyframes streamFall {
        0%{top:-300px;opacity:0} 10%{opacity:.7} 90%{opacity:.3} 100%{top:110vh;opacity:0}
      }
      @keyframes ticker { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }

      .nav-link-item { position: relative; }
      .nav-link-item::after {
        content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;
        background:#00f5ff;transition:width .3s;box-shadow:0 0 8px #00f5ff;
      }
      .nav-link-item:hover { color: #00f5ff !important; text-shadow: 0 0 12px rgba(0,245,255,0.6); }
      .nav-link-item:hover::after { width:100%; }

      .btn-p-hover:hover {
        box-shadow: 0 0 35px rgba(0,245,255,.45),inset 0 0 20px rgba(0,245,255,.1) !important;
        transform: translateY(-1px);
      }

      .ft-lk:hover { color: #00f5ff !important; }
      .soc-btn:hover { border-color:#00f5ff !important; color:#00f5ff !important; box-shadow:0 0 15px rgba(0,245,255,.2); }

      /* ── RESPONSIVE ── */
      @media (max-width:1100px) {
        .nav-cards-grid { grid-template-columns: repeat(2,1fr) !important; }
        .stats-strip-grid { grid-template-columns: repeat(3,1fr) !important; }
        .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
      }

      @media (max-width:900px) {
        .hero-section {
          flex-direction: column !important;
          padding: 60px 24px 40px !important;
          gap: 32px !important;
          min-height: auto !important;
        }
        .hero-left { max-width: 100% !important; }
        .hero-right-vis { display: none !important; }
        .nav-links-row { display: none !important; }
        .section-pad { padding: 40px 24px !important; }
      }

      @media (max-width:600px) {
        .hero-btns { flex-direction: column !important; gap: 12px !important; }
      }
    `}</style>
  );
}

// ─── FEEDBACK SECTION ────────────────────────────────────────────────────────
function FeedbackSection({ user }) {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | ok | ng

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setStatus("sending");
    try {
      const { submitFeedback } = await import("../firebase/db");
      await submitFeedback({
        uid: user?.uid,
        email: user?.email,
        message: msg
      });
      setStatus("ok");
      setMsg("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("ng");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="intel-report" style={{ padding: "80px 40px", background: "rgba(0,245,255,0.02)", borderTop: "1px solid rgba(0,245,255,0.05)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={T.secLbl}>// INTEL REPORT</div>
        <h2 style={{ ...T.secTitle, fontSize: "2rem", marginBottom: 12 }}>Platform Feedback</h2>
        <p style={{ color: "#546e7a", marginBottom: 32, fontFamily: "Share Tech Mono" }}>Help us strengthen the defense grid by reporting bugs or suggesting features.</p>

        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Transmit your message..."
            disabled={status !== "idle"}
            style={{
              width: "100%", background: "#000a12", border: "1px solid rgba(0,245,255,0.2)",
              color: "#fff", padding: 16, borderRadius: 4, minHeight: 120,
              fontFamily: "Share Tech Mono", fontSize: "0.9rem", resize: "none",
              outline: "none", transition: "border-color .25s"
            }}
          />
          <button
            type="submit"
            disabled={status !== "idle" || !msg.trim()}
            style={{
              ...T.btnHP, width: "100%", justifyContent: "center",
              background: status === "ok" ? "#00ff9d" : (status === "ng" ? "#ff1744" : undefined),
              borderColor: status === "ok" ? "#00ff9d" : (status === "ng" ? "#ff1744" : undefined),
              color: (status === "ok" || status === "ng") ? "#000" : undefined
            }}
          >
            {status === "idle" && "SUBMIT REPORT ➔"}
            {status === "sending" && "TRANSMITTING..."}
            {status === "ok" && "REPORT RECEIVED"}
            {status === "ng" && "TRANSMISSION FAILED"}
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── MAIN HOMEPAGE ───────────────────────────────────────────────────────────
// Fixed: self-contained with internal page state + setPage prop is optional
export function HomePage({ setPage: setPageProp }) {
  const { user, signInWithGoogle } = useAuth();
  const { profile } = useUser();
  const [currentPage, setCurrentPage] = useState("home");
  const [navScrolled, setNavScrolled] = useState(false);
  const [recruitCount, setRecruitCount] = useState(12482);

  // Use prop if provided (for integration), otherwise use internal state
  const setPage = setPageProp || setCurrentPage;

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Dynamic recruit count from Firestore
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      if (!snap.empty) setRecruitCount(12482 + snap.size);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      unsub();
    };
  }, []);

  // If using internal state and not on home page, show placeholder
  if (!setPageProp && currentPage !== "home") {
    return (
      <div style={{
        ...T.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: 24,
        zIndex: 10,
        position: "relative",
      }}>
        <GlobalStyles />
        <div style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: "2rem",
          color: "#00f5ff",
          textShadow: "0 0 30px rgba(0,245,255,.5)",
        }}>
          {currentPage.toUpperCase()} PAGE
        </div>
        <p style={{ color: "#546e7a", fontFamily: "'Share Tech Mono',monospace" }}>
          This page would be rendered here in the full app.
        </p>
        <button
          style={T.btnHP}
          onClick={() => setCurrentPage("home")}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="pg-grid-bg" style={{ ...T.page }}>
      <GlobalStyles />

      {/* ── BACKGROUND LAYERS ── */}
      <MatrixCanvas />
      <ParticleCanvas />
      <HexCanvas />
      <LightningStreaks />

      {/* Scanlines overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
          animation: "scanlineScroll 8s linear infinite",
        }}
      />

      {/* Ambient orbs */}
      {[
        { w: 800, h: 800, bg: "rgba(0,245,255,0.09)", top: -250, left: -250, delay: "0s" },
        { w: 600, h: 600, bg: "rgba(213,0,249,0.1)", top: "40%", right: -220, delay: "-3s" },
        { w: 500, h: 500, bg: "rgba(0,255,157,0.06)", bottom: "5%", left: "15%", delay: "-6s" },
        { w: 380, h: 380, bg: "rgba(255,23,68,0.07)", top: "55%", left: "8%", delay: "-2s" },
      ].map((o, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            borderRadius: "50%",
            filter: "blur(120px)",
            pointerEvents: "none",
            zIndex: 0,
            width: o.w,
            height: o.h,
            background: o.bg,
            top: o.top ?? "auto",
            left: o.left ?? "auto",
            right: o.right ?? "auto",
            bottom: o.bottom ?? "auto",
            animation: `orbF 8s ${o.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 62,
          background: navScrolled ? "rgba(0,5,9,0.98)" : "rgba(0,5,9,0.92)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,245,255,.15)",
          boxShadow: "0 1px 30px rgba(0,245,255,0.08),inset 0 -1px 0 rgba(0,245,255,0.1)",
          transition: "background .3s",
        }}
      >
        {/* Bottom gradient line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            ...T.logo,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "glitch 8s infinite",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => setPage("home")}
        >
          <svg
            viewBox="0 0 36 36"
            fill="none"
            width={34}
            height={34}
            style={{ filter: "drop-shadow(0 0 12px #00f5ff)" }}
          >
            <path
              d="M18 2L4 8v12c0 8 6.67 14.93 14 16 7.33-1.07 14-7.99 14-16V8L18 2z"
              fill="rgba(0,229,255,.1)"
              stroke="#00e5ff"
              strokeWidth="1.5"
            />
            <path
              d="M12 18l4 4 8-8"
              stroke="#00e5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Phish
          <span style={{ color: "#00f5ff", textShadow: "0 0 20px #00f5ff" }}>
            Guard
          </span>
        </div>

        {/* Nav links */}
        <ul
          className="nav-links-row"
          style={{
            display: "flex",
            listStyle: "none",
            gap: 24,
            margin: "0 auto",
          }}
        >
          {[
            ["Home", "home"],
            ["Simulator", "simulator"],
            ["Quiz", "quiz"],
            ["🏆 Leaderboard", "leaderboard"],
            ["Gallery", "gallery"],
            ["My Progress", "progress"],
          ].map(([label, pg]) => (
            <li key={pg}>
              <a
                href="#"
                className="nav-link-item"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(pg);
                }}
                style={{
                  color: "#546e7a",
                  textDecoration: "none",
                  fontSize: ".78rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Share Tech Mono',monospace",
                  transition: "color .2s",
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {user ? (
            <>
              <div className="nav-xp-streak" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "5px 14px",
                background: "rgba(0,245,255,.06)", border: "1px solid rgba(0,245,255,.25)",
                borderRadius: 4, fontFamily: "'Share Tech Mono',monospace", fontSize: ".72rem",
                color: "#00f5ff", boxShadow: "0 0 12px rgba(0,245,255,.1)", whiteSpace: "nowrap",
              }}>
                ⚡ {(profile?.xp ?? 0).toLocaleString()} XP
              </div>
              <div className="nav-xp-streak" style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: ".72rem", color: "#ff6d00", whiteSpace: "nowrap",
              }}>
                🔥 {profile?.streak ?? 0}d streak
              </div>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              style={{ ...T.btnHP, padding: "7px 20px", fontSize: ".72rem" }}
            >
              LOGIN TO TRACK XP
            </button>
          )}

          <button
            className="btn-p-hover"
            onClick={() => setPage(user ? "quiz" : "ai-learning")}
            style={{
              padding: "7px 20px", background: "transparent", border: "1px solid #00f5ff",
              borderRadius: 3, color: "#00f5ff", fontSize: ".78rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", letterSpacing: "0.08em",
              textTransform: "uppercase", boxShadow: "0 0 20px rgba(0,245,255,.2)",
              position: "relative", overflow: "hidden", whiteSpace: "nowrap", transition: "all .25s",
            }}
          >
            {user ? "Start Quiz" : "How it Works"}
          </button>
        </div>
      </nav>



      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{
          padding: "0 40px",
          paddingTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 40,
          minHeight: "85vh",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LEFT */}
        <div
          className="hero-left"
          style={{ flex: 1, maxWidth: 580, animation: "fuA .6s ease both" }}
        >
          {/* Live badge */}
          <div
            className="live-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(0,245,255,.05)",
              border: "1px solid rgba(0,245,255,.25)",
              borderRadius: 4,
              fontSize: ".72rem",
              color: "#00f5ff",
              fontFamily: "'Share Tech Mono',monospace",
              marginBottom: 26,
              letterSpacing: "0.15em",
              boxShadow: "0 0 25px rgba(0,245,255,0.15)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              position: "relative",
              zIndex: 5,
              width: "max-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff9d",
                boxShadow: "0 0 15px #00ff9d",
                animation: "pulse 2s infinite",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            LIVE THREAT DETECTION ACTIVE
          </div>

          <h1
            style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: "clamp(2.4rem,5vw,4.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 24,
              animation: "fuA .6s .1s ease both",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ display: "block" }}>
              Detect{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#00f5ff,#00ff9d)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 20px rgba(0,245,255,0.4))",
                }}
              >
                Phishing
              </span>
            </span>
            <span style={{ display: "block", marginTop: 6, fontSize: "0.9em", color: "#90a4ae" }}>
              Before It
            </span>
            <span
              style={{
                display: "block",
                marginTop: 6,
                color: "#ff1744",
                textShadow: "0 0 30px rgba(255,23,68,0.5)",
              }}
            >
              Detects You
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "#546e7a",
              lineHeight: 1.8,
              marginBottom: 32,
              fontWeight: 400,
              animation: "fuA .6s .2s ease both",
            }}
          >
            Master cybersecurity through gamified simulations, real-world
            phishing scenarios, and adaptive learning. Level up your digital
            defenses.
          </p>

          <div
            className="hero-btns"
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 44,
              flexWrap: "wrap",
              animation: "fuA .6s .3s ease both",
            }}
          >
            <button style={T.btnHP} onClick={async () => {
              const { logPlatformAction } = await import("../firebase/db");
              logPlatformAction(user?.uid, "START_SIMULATOR_HERO");
              setPage("simulator");
            }}>
              ⚡ Start Simulation
            </button>
            <button style={T.btnHS} onClick={async () => {
              const { logPlatformAction } = await import("../firebase/db");
              logPlatformAction(user?.uid, "START_QUIZ_HERO");
              setPage("quiz");
            }}>
              📖 Take Adaptive Quiz
            </button>
          </div>

          {/* Fixed: StatDivider uses fixed height instead of alignSelf:stretch */}
          <div
            className="stats-row"
            style={{
              display: "flex",
              gap: 36,
              animation: "fuA .6s .4s ease both",
              alignItems: "center",
            }}
          >
            <StatItem num="3.4B" lbl="Phishing emails/day" />
            <StatDivider />
            <StatItem num="92%" lbl="Malware via email" />
            <StatDivider />
            <StatItem num={`${(recruitCount / 1000).toFixed(1)}K+`} lbl="Users trained" />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="hero-right-vis"
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 460,
            animation: "fuA .6s .2s ease both",
          }}
        >
          <EmailMock />

          {/* Threat blocked badge */}
          <div
            style={{
              position: "absolute",
              top: "8%",
              right: -15,
              background: "rgba(0,8,18,.98)",
              borderRadius: 4,
              padding: "11px 15px",
              border: "1px solid rgba(0,255,157,.3)",
              color: "#00ff9d",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: ".75rem",
              letterSpacing: "0.08em",
              boxShadow: "0 0 20px rgba(0,255,157,.15)",
              animation: "fuA .6s .5s ease both",
            }}
          >
            🛡️ THREAT BLOCKED
            <br />
            <small style={{ color: "#546e7a" }}>Risk Score: 94/100</small>
          </div>

          {/* Flags detected badge */}
          <div
            style={{
              position: "absolute",
              bottom: "12%",
              left: -25,
              background: "rgba(0,8,18,.98)",
              borderRadius: 4,
              padding: "11px 15px",
              border: "1px solid rgba(255,23,68,.3)",
              animation: "floatY 6s 2s ease-in-out infinite",
              backdropFilter: "blur(24px)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: ".68rem",
                color: "#546e7a",
                marginBottom: 3,
                fontFamily: "'Share Tech Mono',monospace",
                letterSpacing: "0.08em",
              }}
            >
              FLAGS DETECTED
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#ff1744",
                textShadow: "0 0 15px rgba(255,23,68,.5)",
              }}
            >
              6 Red Flags
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK NAV CARDS ── */}
      <section
        className="section-pad"
        style={{ padding: "60px 80px", position: "relative", zIndex: 2 }}
      >
        <div
          className="nav-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {[
            { icon: "🎯", title: "Real-vs-Fake Sim", desc: "Compare real and phishing emails side-by-side", page: "simulator" },
            { icon: "🧠", title: "Adaptive Quiz", desc: "Questions get harder as you improve", page: "quiz" },
            { icon: "🏆", title: "Leaderboard", desc: "Rank against global defenders", page: "leaderboard" },
            { icon: "🖼️", title: "Community Gallery", desc: "Browse real phishing examples submitted by users", page: "gallery" },
          ].map((c) => (
            <NavCard key={c.title} {...c} onClick={() => setPage(c.page)} />
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div
        className="stats-strip-grid"
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          background: "rgba(0,245,255,.07)",
          borderTop: "1px solid rgba(0,245,255,.07)",
          borderBottom: "1px solid rgba(0,245,255,.07)",
        }}
      >
        {[
          { num: "3.4B", sub: "Phishing emails sent daily worldwide" },
          { num: "92%", sub: "Of malware delivered via email" },
          { num: "$4.9T", sub: "Global cybercrime cost by 2025" },
        ].map(({ num, sub }, idx) => (
          <div
            key={num}
            style={{
              background: "#000509",
              padding: "52px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              borderRight: idx < 2 ? "1px solid rgba(0,245,255,.07)" : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 0%,rgba(0,245,255,.04),transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: "3.2rem",
                fontWeight: 900,
                color: "#00f5ff",
                display: "block",
                textShadow: "0 0 40px rgba(0,245,255,.5)",
                lineHeight: 1,
              }}
            >
              {num}
            </span>
            <div
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: ".72rem",
                color: "#546e7a",
                textTransform: "uppercase",
                letterSpacing: ".15em",
                marginTop: 12,
                maxWidth: 220,
              }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── SENTINEL EXTENSION SECTION ── */}
      <section style={{ padding: "100px 80px", position: "relative", zIndex: 2, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center",
          background: "linear-gradient(135deg, rgba(0,245,255,0.03), transparent)",
          border: "1px solid rgba(0,245,255,0.1)", borderRadius: 12, padding: 60
        }}>
          <div>
            <div style={T.secLbl}>// REAL-TIME PROTECTION</div>
            <h2 style={{ ...T.secTitle, fontSize: "2.5rem", marginBottom: 20 }}>
              PhishGuard <span style={{ color: "#00f5ff" }}>Sentinel</span>
            </h2>
            <p style={{ color: "#546e7a", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: 30 }}>
              Bring our defense grid to your browser. PhishGuard Sentinel scans every URL you visit, detecting typosquats, homograph attacks, and insecure credential leaks before they harm you.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
              {[
                { i: "🛡️", t: "Live Filtering", d: "Block malicious scripts on the fly." },
                { i: "🔍", t: "URL Analysis", d: "Deep inspect suspicious domains." },
                { i: "⚠️", t: "Alert System", d: "Instant warnings on threat detection." },
                { i: "📊", t: "Threat Logs", d: "Keep track of scanned sites." },
              ].map(f => (
                <div key={f.t} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: "1.5rem" }}>{f.i}</span>
                  <div>
                    <div style={{ color: "#00f5ff", fontWeight: 700, fontSize: "0.9rem" }}>{f.t}</div>
                    <div style={{ color: "#546e7a", fontSize: "0.75rem" }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ ...T.btnHP, fontSize: "1rem", padding: "15px 40px" }}>INSTALL SENTINEL ➔</button>
          </div>

          <div style={{ position: "relative" }}>
            {/* Mock Extension Interface */}
            <div style={{
              background: "#0d1525", border: "1px solid #00f5ff", borderRadius: 8,
              width: 300, padding: 20, margin: "0 auto",
              boxShadow: "0 0 50px rgba(0,245,255,0.2)",
              animation: "floatY 6s ease-in-out infinite"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 10 }}>
                <span style={{ fontFamily: "Orbitron", color: "#00f5ff", fontSize: "0.7rem" }}>PHISHGUARD SENTINEL</span>
                <span style={{ color: "#00ff9d", fontSize: "0.7rem" }}>ACTIVE</span>
              </div>
              <div style={{ background: "rgba(255,23,68,0.1)", border: "1px solid #ff1744", padding: 12, borderRadius: 4, mb: 15 }}>
                <div style={{ color: "#ff1744", fontSize: "0.65rem", fontWeight: 800 }}>THREAT DETECTED</div>
                <div style={{ color: "#fff", fontSize: "0.75rem", mt: 4 }}>Typosquatted Domain: paypa1.com</div>
              </div>
              <div style={{ display: "flex", gap: 5, mt: 10 }}>
                <div style={{ height: 4, flex: 1, background: "#00f5ff" }}></div>
                <div style={{ height: 4, flex: 1, background: "#00f5ff" }}></div>
                <div style={{ height: 4, flex: 1, background: "rgba(255,255,255,0.1)" }}></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div style={{ position: "absolute", top: -20, right: 40, width: 60, height: 60, border: "2px solid #d500f9", borderRadius: "50%", opacity: 0.3 }}></div>
            <div style={{ position: "absolute", bottom: -10, left: 40, width: 40, height: 40, border: "2px solid #00ff9d", transform: "rotate(45deg)", opacity: 0.2 }}></div>
          </div>
        </div>
      </section>


      {/* ── RED FLAGS ── */}
      <section
        className="section-pad"
        style={{
          padding: "80px 80px",
          background: "linear-gradient(180deg,transparent,rgba(0,8,18,.6),transparent)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ marginBottom: 52 }}>
          <div style={T.secLbl}>
            <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> THREAT INDICATORS
          </div>
          <h2 style={T.secTitle}>
            Know the{" "}
            <span style={{ color: "#ff1744", textShadow: "0 0 20px rgba(255,23,68,0.4)" }}>
              Red Flags
            </span>
          </h2>
          <p style={{ fontSize: ".95rem", color: "#546e7a", lineHeight: 1.8, maxWidth: 540 }}>
            Master these 6 universal phishing indicators to protect yourself from 95% of attacks.
          </p>
        </div>
        <div
          className="flags-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {RED_FLAGS.map((f) => (
            <RedFlagCard key={f.name} {...f} />
          ))}
        </div>
      </section>

      <FeedbackSection user={user} />

      {/* ── FOOTER ── */}
      <footer
        className="footer-wrap"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "72px 80px 36px",
          background: "linear-gradient(180deg,transparent,rgba(0,5,9,.98))",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 56,
            marginBottom: 56,
            alignItems: "start",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                ...T.logo,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "1.2rem",
                animation: "glitch 8s infinite",
              }}
            >
              <svg
                viewBox="0 0 36 36"
                fill="none"
                width={28}
                height={28}
                style={{ filter: "drop-shadow(0 0 10px #00f5ff)", flexShrink: 0 }}
              >
                <path
                  d="M18 2L4 8v12c0 8 6.67 14.93 14 16 7.33-1.07 14-7.99 14-16V8L18 2z"
                  fill="rgba(0,229,255,.1)"
                  stroke="#00e5ff"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 18l4 4 8-8"
                  stroke="#00e5ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Phish
              <span style={{ color: "#00f5ff", textShadow: "0 0 18px #00f5ff" }}>Guard</span>
            </div>
            <p
              style={{
                fontSize: ".85rem",
                color: "#546e7a",
                lineHeight: 1.8,
                marginTop: 12,
                maxWidth: 250,
              }}
            >
              Empowering internet users with skills to identify, avoid, and report phishing attacks.
            </p>
            <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
              {["𝕏", "in", "gh", "yt"].map((s) => (
                <a
                  key={s}
                  className="soc-btn"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 4,
                    border: "1px solid rgba(0,245,255,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".88rem",
                    cursor: "pointer",
                    color: "#546e7a",
                    textDecoration: "none",
                    transition: "all .2s",
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Footer link columns */}
          {[
            [
              "Platform",
              [
                { label: "Simulator", page: "simulator" },
                { label: "Quiz", page: "quiz" },
                { label: "Leaderboard", page: "leaderboard" },
                { label: "Gallery", page: "gallery" },
                { label: "Neural Academy", page: "ai-learning" },
              ],
            ],
            [
              "Contact",
              [
                { label: "hello@phishguard.io", page: null },
                { label: "About Us", page: "about" },
                { label: "Privacy Policy", page: "privacy" },
              ],
            ],
            [
              "Resources",
              [
                { label: "Checklist PDF", page: "checklist" },
                { label: "Report Phishing", page: "gallery" },
                { label: "FAQ", page: "faq" },
                { label: "CISA Guidance", page: "about" },
              ],
            ],
          ].map(([title, items]) => (
            <div key={title}>
              <div
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#00f5ff",
                }}
              >
                {title}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {items.map(({ label, page }) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="ft-lk"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page) setPage(page);
                      }}
                      style={{
                        fontSize: ".82rem",
                        color: "#546e7a",
                        textDecoration: "none",
                        fontFamily: "'Share Tech Mono',monospace",
                        transition: "color .2s",
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="footer-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 26,
            borderTop: "1px solid rgba(255,255,255,.04)",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: ".75rem",
              color: "#546e7a",
              fontFamily: "'Share Tech Mono',monospace",
              flexShrink: 0,
            }}
          >
            © 2026 PhishGuard. Protecting internet users worldwide.
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "5px 13px",
              background: "rgba(255,23,68,.06)",
              border: "1px solid rgba(255,23,68,.18)",
              borderRadius: 3,
              fontSize: ".7rem",
              fontFamily: "'Share Tech Mono',monospace",
              color: "#ff1744",
              overflow: "hidden",
              maxWidth: 340,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ff1744",
                boxShadow: "0 0 8px #ff1744",
                flexShrink: 0,
                animation: "pulse 1.5s infinite",
              }}
            />
            <div style={{ overflow: "hidden" }}>
              <span
                style={{
                  whiteSpace: "nowrap",
                  display: "inline-block",
                  animation: "ticker 14s linear infinite",
                }}
              >
                LIVE: 3.4B phishing emails today · 47,291 new phishing sites detected · Stay vigilant · Never click unverified links
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── DEFAULT EXPORT (standalone app entry point) ─────────────────────────────
export default function App() {
  return <HomePage />;
}