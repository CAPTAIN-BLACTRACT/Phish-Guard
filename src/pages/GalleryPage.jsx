import { useState, useEffect, useRef } from "react";
import { T } from "../styles";
import { GALLERY_DATA } from "../constants";
import { getGalleryEntries, addGalleryEntry, likeGalleryEntry, uploadGalleryImage } from "../firebase";
import { useAuth } from "../context";

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function tagStyle(status) {
  if (status === "phish") return T.tagPhish;
  if (status === "review") return T.tagReview;
  return T.tagDismissed;
}
function tagText(status) {
  if (status === "phish") return "🎣 Confirmed Phish";
  if (status === "review") return "🔍 Under Review";
  return "✓ Dismissed";
}
function thumbBg(type) {
  if (type === "email") return "linear-gradient(135deg,rgba(0,12,26,.98),rgba(0,5,14,1))";
  if (type === "sms") return "linear-gradient(135deg,rgba(14,0,26,.98),rgba(0,5,14,1))";
  return "linear-gradient(135deg,rgba(26,10,0,.98),rgba(0,5,14,1))";
}

// ─── SUBMIT MODAL ─────────────────────────────────────────────────────────────
function SubmitModal({ onClose, showToast }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Email Phishing"
  });

  const handleUpload = async () => {
    if (!user) { showToast("Please sign in to submit!", "ng"); return; }
    if (!file) { showToast("Please select a screenshot!", "ng"); return; }
    if (!formData.title) { showToast("Title is required!", "ng"); return; }

    setBusy(true);
    try {
      // 1. Upload file to Storage
      let imageURL = null;
      if (file) {
        imageURL = await uploadGalleryImage(user.uid, file, (pct) => setProgress(pct));
      }

      // 2. Add entry to Firestore
      await addGalleryEntry({
        uid: user.uid,
        displayName: user.displayName || "Agent",
        title: formData.title,
        description: formData.description,
        imageURL,
        tags: [formData.category.toLowerCase()]
      });

      showToast("🚀 Phishing example reported and shared!", "ok");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Upload failed: " + err.message, "ng");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,5,9,.85)",
        zIndex: 3000,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...T.card, width: "90%", maxWidth: 520, padding: 36, animation: "popIn .4s ease both" }}
      >
        <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: 20 }}>
          📤 Submit Phishing Example
        </div>

        {busy && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: ".75rem", color: "#00f5ff", marginBottom: 4 }}>Uploading: {progress}%</div>
            <div style={{ height: 4, background: "rgba(0,245,255,.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", background: "#00f5ff", width: `${progress}%`, transition: "width .2s" }} />
            </div>
          </div>
        )}

        <div style={{ padding: "10px 14px", background: "rgba(255,109,0,.06)", border: "1px solid rgba(255,109,0,.2)", borderRadius: 4, fontSize: ".78rem", color: "#ff6d00", marginBottom: 16, lineHeight: 1.6 }}>
          ⚠️ Only submit real phishing attempts. Do not include personal information.
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "#546e7a", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,8,18,.95)", border: "1px solid rgba(0,245,255,.15)", borderRadius: 3, color: "#e0f7fa", fontFamily: "Share Tech Mono, monospace" }}
          >
            {["Email Phishing", "SMS / Smishing", "Fake Website", "Voice / Vishing"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "#546e7a", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Short Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Fake PayPal billing email"
            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,8,18,.95)", border: "1px solid rgba(0,245,255,.15)", borderRadius: 3, color: "#e0f7fa", fontFamily: "Share Tech Mono, monospace" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "#546e7a", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Screenshot Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={{ display: "block", border: "1px dashed rgba(0,245,255,.2)", borderRadius: 4, padding: 28, textAlign: "center", cursor: "pointer", fontSize: ".85rem", color: file ? "#00f5ff" : "#546e7a" }}>
            {file ? `📎 ${file.name}` : "📎 Click to select screenshot"}
            <br />
            <small style={{ fontSize: ".75rem" }}>PNG, JPG — Max 5 MB</small>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "#546e7a", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Additional Notes</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Any additional context about this phishing attempt..."
            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,8,18,.95)", border: "1px solid rgba(0,245,255,.15)", borderRadius: 3, color: "#e0f7fa", fontFamily: "Share Tech Mono, monospace", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button style={T.btnG} onClick={onClose} disabled={busy}>Cancel</button>
          <button
            style={T.btnP}
            onClick={handleUpload}
            disabled={busy}
          >
            {busy ? `Uploading...` : "Submit Example"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY CARD ─────────────────────────────────────────────────────────────
function GalleryCard({ g, liked, likeCount, onToggleLike, onFavourite }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...T.card,
        overflow: "hidden",
        transition: "all .3s",
        borderColor: hov ? "rgba(0,245,255,.35)" : "rgba(0,245,255,0.12)",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 0 30px rgba(0,245,255,.07)" : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        background: thumbBg(g.tags?.[0] || g.type),
        borderBottom: "1px solid rgba(0,245,255,.08)",
        height: 160,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {g.imageURL ? (
          <img src={g.imageURL} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".65rem", color: "#546e7a", padding: 12 }}>{g.thumb}</div>
        )}

        {/* channel badge */}
        <span style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "2px 8px",
          borderRadius: 2,
          fontSize: ".62rem",
          fontFamily: "Share Tech Mono, monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: "rgba(0,245,255,.2)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(0,245,255,.3)",
          color: "#00f5ff",
        }}>
          {g.tags?.[0] || g.type || "Threat"}
        </span>
      </div>

      {/* Meta */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: ".85rem", fontWeight: 700, marginBottom: 6, color: "#e0f7fa" }}>
          {g.title}
        </div>
        <div style={{ fontSize: ".82rem", color: "#546e7a", marginBottom: 12, lineHeight: 1.5, height: 40, overflow: "hidden" }}>
          {g.description || g.caption}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={tagStyle(g.status || "phish")}>{tagText(g.status || "phish")}</span>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => onToggleLike(g.id)}
              style={{
                background: liked ? "rgba(255,23,68,.08)" : "transparent",
                border: `1px solid ${liked ? "rgba(255,23,68,.4)" : "rgba(255,255,255,.08)"}`,
                borderRadius: 3,
                color: liked ? "#ff1744" : "#546e7a",
                fontSize: ".78rem",
                padding: "4px 10px",
                cursor: "pointer",
                fontFamily: "Share Tech Mono, monospace",
                transition: "all .2s",
              }}
            >
              👍 {likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY PAGE ─────────────────────────────────────────────────────────────
export function GalleryPage({ showToast }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Load from Firestore
  useEffect(() => {
    getGalleryEntries()
      .then(data => {
        // Merge with static data for demo if empty, or just use live data
        setEntries(data.length > 0 ? data : GALLERY_DATA);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((g) => {
    const text = (g.title + (g.description || "") + (g.caption || "")).toLowerCase();
    if (search && !text.includes(search)) return false;
    if (typeFilter && !(g.tags || []).includes(typeFilter.toLowerCase()) && g.type !== typeFilter) return false;
    return true;
  });

  const toggleLike = async (id) => {
    if (!user) { showToast("Sign in to like!", "ng"); return; }
    const wasLiked = !!liked[id];
    setLiked((p) => ({ ...p, [id]: !wasLiked }));
    setEntries(prev => prev.map(e => e.id === id ? { ...e, likes: (e.likes || 0) + (wasLiked ? -1 : 1) } : e));

    // Persist to DB
    if (!wasLiked) await likeGalleryEntry(id);
  };

  const selectStyle = {
    padding: "10px 14px",
    background: "rgba(0,8,18,.95)",
    border: "1px solid rgba(0,245,255,.15)",
    borderRadius: 3,
    color: "#546e7a",
    fontFamily: "Share Tech Mono, monospace",
    fontSize: ".82rem",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{
      ...T.page,
      background: "#000509",
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes orbF           { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.08)} }
        @keyframes scanlineScroll { 0%{background-position:0 0} 100%{background-position:0 100px} }
        @keyframes streamFall     { 0%{top:-300px;opacity:0} 10%{opacity:.7} 90%{opacity:.3} 100%{top:110vh;opacity:0} }
        @keyframes fuA            { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn          { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes cardIn         { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <CyberBackground />

      <div style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px" }}>
        <div style={T.secLbl}>
          <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> COMMUNITY GALLERY
        </div>
        <h2 style={{ ...T.secTitle, marginBottom: 8 }}>
          Real <span style={{ color: "#ff1744" }}>Phishing</span> Examples
        </h2>
        <p style={{ color: "#546e7a", marginBottom: 32, fontFamily: "Rajdhani, sans-serif", fontSize: ".95rem" }}>
          Browse user-submitted phishing screenshots. Learn from real attacks.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            placeholder="🔍 Search phishing examples..."
            style={{
              flex: 1, minWidth: 200,
              padding: "10px 14px",
              background: "rgba(0,8,18,.95)",
              border: "1px solid rgba(0,245,255,.15)",
              borderRadius: 3,
              color: "#e0f7fa",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: ".82rem",
              outline: "none",
            }}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="">All Channels</option>
            <option value="email phishing">Email</option>
            <option value="sms / smishing">SMS</option>
            <option value="fake website">Fake Website</option>
          </select>

          <div style={{
            display: "flex", alignItems: "center",
            padding: "0 14px",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: ".72rem",
            color: "#546e7a",
            border: "1px solid rgba(0,245,255,.08)",
            borderRadius: 3,
            background: "rgba(0,8,18,.6)",
            whiteSpace: "nowrap",
          }}>
            {loading ? "Scanning..." : `${filtered.length} entries`}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((g, idx) => (
            <div key={g.id || idx} style={{ animation: `cardIn .4s ${idx * 0.05}s ease both` }}>
              <GalleryCard
                g={g}
                liked={!!liked[g.id]}
                likeCount={g.likes || 0}
                onToggleLike={() => toggleLike(g.id)}
                onFavourite={() => showToast("⭐ Added to favorites!", "ok")}
              />
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div style={{
              gridColumn: "1/-1", textAlign: "center", padding: 64,
              color: "#546e7a", fontFamily: "Share Tech Mono, monospace",
              fontSize: ".9rem", animation: "fuA .4s ease both",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>🔍</div>
              No records match your scan.
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button style={T.btnHP} onClick={() => setShowModal(true)}>
            + Submit a Phishing Example
          </button>
        </div>
      </div>

      {showModal && (
        <SubmitModal onClose={() => setShowModal(false)} showToast={showToast} />
      )}
    </div>
  );
}
