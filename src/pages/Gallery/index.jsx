import { useState, useEffect, useRef } from "react";
import { T } from '../../styles';
import { GALLERY_DATA } from '../../constants';
import { getGalleryEntries, addGalleryEntry, likeGalleryEntry, uploadGalleryImage } from '../../firebase';
import { useAuth } from '../../context';

// ─── CANVAS: MATRIX RAIN ─────────────────────────────────────────────────────


// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────


// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────


// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────


// ─── CYBER BACKGROUND ────────────────────────────────────────────────────────


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
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--txt2)", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Category</label>
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
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--txt2)", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Short Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Fake PayPal billing email"
            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,8,18,.95)", border: "1px solid rgba(0,245,255,.15)", borderRadius: 3, color: "#e0f7fa", fontFamily: "Share Tech Mono, monospace" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--txt2)", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Screenshot Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" style={{ display: "block", border: "1px dashed rgba(0,245,255,.2)", borderRadius: 4, padding: 28, textAlign: "center", cursor: "pointer", fontSize: ".85rem", color: file ? "#00f5ff" : "var(--txt2)" }}>
            {file ? `📎 ${file.name}` : "📎 Click to select screenshot"}
            <br />
            <small style={{ fontSize: ".75rem" }}>PNG, JPG — Max 5 MB</small>
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: ".78rem", color: "var(--txt2)", marginBottom: 7, fontFamily: "Share Tech Mono, monospace" }}>Additional Notes</label>
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
          <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".65rem", color: "var(--txt2)", padding: 12 }}>{g.thumb}</div>
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
        <div style={{ fontSize: ".82rem", color: "var(--txt2)", marginBottom: 12, lineHeight: 1.5, height: 40, overflow: "hidden" }}>
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
                color: liked ? "#ff1744" : "var(--txt2)",
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

    // Improved Filter logic
    if (typeFilter) {
      const gType = (g.type || "").toLowerCase();
      const gTags = (g.tags || []).map(t => t.toLowerCase());

      const isEmail = typeFilter === "email" && (gType === "email" || gTags.includes("email phishing"));
      const isSMS = typeFilter === "sms" && (gType === "sms" || gTags.includes("sms / smishing"));
      const isWeb = typeFilter === "web" && (gType === "web" || gTags.includes("fake website"));

      if (!isEmail && !isSMS && !isWeb) return false;
    }
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
    color: "var(--txt2)",
    fontFamily: "Share Tech Mono, monospace",
    fontSize: ".82rem",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{
      ...T.page,
      background: "transparent",
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



      <div style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px" }}>
        <div style={T.secLbl}>
          <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> COMMUNITY GALLERY
        </div>
        <h2 style={{ ...T.secTitle, marginBottom: 8 }}>
          Real <span style={{ color: "#ff1744" }}>Phishing</span> Examples
        </h2>
        <p style={{ color: "var(--txt2)", marginBottom: 32, fontFamily: "Rajdhani, sans-serif", fontSize: ".95rem" }}>
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
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="web">Websites</option>
          </select>

          <div style={{
            display: "flex", alignItems: "center",
            padding: "0 14px",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: ".72rem",
            color: "var(--txt2)",
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
              color: "var(--txt2)", fontFamily: "Share Tech Mono, monospace",
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
