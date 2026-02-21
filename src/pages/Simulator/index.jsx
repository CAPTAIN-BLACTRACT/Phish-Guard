import { useState, useEffect } from "react";
import { T } from '../../styles';
import { SIM_STAGES } from '../../constants';
import { logSimulatorAttempt, logPlatformAction, signInGuest, getAdminSimScenarios } from '../../firebase';
import { useUser, useAuth } from '../../context';
import { PageHeader } from '../../components';


// ─── HELPERS ─────────────────────────────────────────────────────────────────
function FlagElement({ id, text, hint, flagged, submitted, revealed, onToggle }) {
  const isFlagged = flagged.has(id);
  const isRevealed = revealed && !isFlagged;
  let bg = "rgba(255,199,0,.1)", border = "2px dashed #ffd600", color = "#e0f7fa";
  if (isFlagged) { bg = "rgba(255,23,68,.18)"; border = "2px solid #ff1744"; color = "#ff1744"; }
  if (isRevealed) { bg = "rgba(255,109,0,.15)"; border = "2px solid #ff6d00"; color = "#ff6d00"; }

  return (
    <span title={hint} onClick={() => onToggle(id)} style={{ background: bg, border, borderRadius: 3, padding: "0 4px", cursor: "pointer", color, fontFamily: "Share Tech Mono, monospace", fontSize: ".85em", transition: "all .2s", display: "inline" }}>
      {text}
      {!submitted && <sup style={{ fontSize: ".6em", marginLeft: 2, color: "#ffd600" }}>?</sup>}
      {submitted && isFlagged && <sup style={{ fontSize: ".65em", marginLeft: 2 }}>✓</sup>}
      {isRevealed && <sup style={{ fontSize: ".65em", marginLeft: 2 }}>!</sup>}
    </span>
  );
}

function PhishBody({ stage, flagged, submitted, revealed, onToggle }) {
  const lines = stage.phish.body.split("\n");
  const flags = stage.phish.flags.slice(1);
  return (
    <p>
      {lines.map((line, li) => {
        let rest = line;
        const parts = [];
        flags.forEach((f) => {
          const idx = rest.indexOf(f.text);
          if (idx >= 0) {
            if (idx > 0) parts.push(rest.slice(0, idx));
            parts.push(<FlagElement key={f.id} id={f.id} text={f.text} hint={f.hint} flagged={flagged} submitted={submitted} revealed={revealed} onToggle={onToggle} />);
            rest = rest.slice(idx + f.text.length);
          }
        });
        parts.push(rest);
        return <span key={li}>{parts}{li < lines.length - 1 ? <br /> : null}</span>;
      })}
    </p>
  );
}

function normalizeStage(raw, idx) {
  const legit = raw?.legit || {};
  const phish = raw?.phish || {};
  const rawFlags = Array.isArray(phish.flags) ? phish.flags.filter((f) => f?.hint || f?.text || f?.id) : [];
  const flags = rawFlags.map((flag, flagIdx) => ({
    id: flag?.id || `f${flagIdx + 1}`,
    text: flag?.text || "",
    hint: flag?.hint || "Potential phishing indicator.",
  }));

  if (flags.length === 0) {
    flags.push({
      id: "f1",
      text: phish.addr || "suspicious-sender@example.com",
      hint: "Sender identity requires verification.",
    });
  }

  if (!flags[0]?.text) {
    flags[0] = {
      ...flags[0],
      text: phish.addr || "suspicious-sender@example.com",
    };
  }

  return {
    id: raw?.id || `sim-stage-${idx + 1}`,
    legit: {
      from: legit.from || "Trusted Sender",
      addr: legit.addr || "sender@company.com",
      subject: legit.subject || "Routine security update",
      body: legit.body || "This is an example of a legitimate communication.",
      safe: true,
    },
    phish: {
      from: phish.from || "Suspicious Sender",
      addr: phish.addr || "security-alert@fake-domain.tld",
      subject: phish.subject || "Urgent security notice",
      body: phish.body || "Review this suspicious message and identify red flags.",
      flags,
    },
  };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function SimulatorPage({ showToast }) {
  const { awardXP, updateStreak } = useUser();
  const { user } = useAuth();
  const [stageIdx, setStageIdx] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [stagePool, setStagePool] = useState(() => SIM_STAGES.map(normalizeStage));
  const [contentSource, setContentSource] = useState("local");

  useEffect(() => {
    let mounted = true;

    const loadScenarios = async () => {
      try {
        const remote = await getAdminSimScenarios();
        const normalizedRemote = remote.map(normalizeStage).filter((stage) => stage?.phish?.flags?.length > 0);
        if (mounted && normalizedRemote.length > 0) {
          setStagePool(normalizedRemote);
          setContentSource("backend");
          setStageIdx(0);
          setFlagged(new Set());
          setSubmitted(false);
          setRevealed(false);
        } else if (mounted) {
          setStagePool(SIM_STAGES.map(normalizeStage));
          setContentSource("local");
        }
      } catch {
        if (mounted) {
          setStagePool(SIM_STAGES.map(normalizeStage));
          setContentSource("local");
        }
      }
    };

    loadScenarios();
    return () => { mounted = false; };
  }, [user?.uid]);

  // ── Sign-in gate ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ ...T.page, background: "transparent", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 460, background: "rgba(0,8,18,0.85)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 16, backdropFilter: "blur(20px)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎯</div>
          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "#00f5ff" }}>Sign In to Run Simulation</div>
          <p style={{ color: "var(--txt2)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>Your phishing detection score, XP, and streak are saved to your profile. Sign in to keep your progress.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...T.btnHP, minWidth: 160 }} onClick={() => document.querySelector('.pg-login-btn')?.click?.()}>🔐 Sign In</button>
            <button style={{ ...T.btnG }} onClick={signInGuest}>👤 Continue as Guest</button>
          </div>
        </div>
      </div>
    );
  }

  const totalStages = stagePool.length || 1;
  const stage = stagePool[stageIdx % totalStages];
  const total = stage.phish.flags.length;
  const pct = Math.min(100, (flagged.size / total) * 100);

  const toggleFlag = (id) => {
    if (submitted) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const submit = async () => {
    setSubmitted(true);
    const found = stage.phish.flags.filter((f) => flagged.has(f.id)).length;
    const xpGain = Math.round((found / total) * 80);
    await awardXP(xpGain);
    if (user) {
      try {
        await Promise.all([
          logSimulatorAttempt({
            uid: user.uid,
            stageId: stage.id || stageIdx,
            flagsFound: found,
            totalFlags: total,
            xpEarned: xpGain,
            completed: found === total
          }),
          updateStreak(),  // from UserContext
          logPlatformAction(user.uid, "SIMULATION_SUBMITTED", {
            stageId: stage.id || stageIdx,
            flagsFound: found,
            totalFlags: total,
            xpEarned: xpGain,
            completed: found === total,
          }),
        ]);
      } catch (e) {
        if (e.code === 'permission-denied') {
          showToast("Warning: Progress not saved. Please verify your email to permanently save.", "inf");
        } else {
          console.warn("Failed to save progress:", e);
        }
      }
    }
    showToast(`${found}/${total} flags found! +${xpGain} XP`, found === total ? "ok" : "inf");
  };

  const nextStage = () => {
    setStageIdx((s) => (s + 1) % totalStages);
    setFlagged(new Set());
    setSubmitted(false);
    setRevealed(false);
  };

  const panelHdr = (legit) => ({
    padding: "12px 20px", display: "flex", alignItems: "center", gap: 8,
    fontFamily: "Share Tech Mono, monospace", fontSize: ".73rem",
    letterSpacing: 2, textTransform: "uppercase",
    borderBottom: legit ? "1px solid rgba(0,255,157,.1)" : "1px solid rgba(255,23,68,.1)",
    color: legit ? "#00ff9d" : "#ff1744",
    background: legit ? "rgba(0,255,157,.04)" : "rgba(255,23,68,.04)",
  });

  return (
    <div style={{ ...T.page, background: "transparent", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{`
          @media (max-width: 768px) {
            .cards-grid { grid-template-columns: 1fr !important; }
            .pg-container { padding: 80px 10px 40px !important; }
            .flex-mobile-col { flex-direction: column; width: 100%; }
          }
        `}</style>

      <div style={{ position: "relative", zIndex: 2, padding: "80px 20px 60px", maxWidth: 1200, margin: "0 auto" }} className="pg-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
          <PageHeader label="SIMULATOR" title="Spot the Phishing" />
          <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 100, padding: "6px 12px" }}>
            {contentSource === "backend" ? "BACKEND SCENARIOS" : "LOCAL SCENARIOS"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".73rem", color: "var(--txt2)" }}>Stage {stageIdx + 1}/{totalStages}</span>
          <div style={{ flex: 1, height: 6, background: "rgba(0,245,255,.1)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg,#00f5ff,#00ff9d)", width: `${pct}%`, transition: "width .6s" }} />
          </div>
          <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".73rem", color: "#00f5ff" }}>{flagged.size}/{total} Flags</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="cards-grid">
          <div style={{ ...T.card, overflow: "hidden" }}>
            <div style={panelHdr(true)}>✅ LEGITIMATE</div>
            <div style={{ padding: 20, fontSize: ".85rem", lineHeight: 1.6, color: "var(--txt2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,255,157,.1)", border: "1px solid rgba(0,255,157,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ff9d" }}>✓</div>
                <div><div style={{ fontSize: ".8rem", fontWeight: 600, color: "#e0f7fa" }}>{stage.legit.from}</div><div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".7rem", color: "#00ff9d" }}>{stage.legit.addr}</div></div>
              </div>
              <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#9becc6", marginBottom: 8 }}>
                Subject: {stage.legit.subject}
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>{stage.legit.body}</p>
            </div>
          </div>
          <div style={{ ...T.card, overflow: "hidden" }}>
            <div style={panelHdr(false)}>🎣 SUSPICIOUS</div>
            <div style={{ padding: 20, fontSize: ".85rem", lineHeight: 1.6, color: "var(--txt2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,23,68,.1)", border: "1px solid rgba(255,23,68,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff1744" }}>!</div>
                <div><div style={{ fontSize: ".8rem", fontWeight: 600, color: "#e0f7fa" }}>{stage.phish.from}</div><FlagElement id={stage.phish.flags[0].id} text={stage.phish.addr} hint={stage.phish.flags[0].hint} flagged={flagged} submitted={submitted} revealed={revealed} onToggle={toggleFlag} /></div>
              </div>
              <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#ff9ea8", marginBottom: 8 }}>
                Subject: {stage.phish.subject}
              </div>
              <PhishBody stage={stage} flagged={flagged} submitted={submitted} revealed={revealed} onToggle={toggleFlag} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {!submitted && <button style={T.btnHP} onClick={submit}>Submit Analysis</button>}
          {submitted && <button style={T.btnP} onClick={nextStage}>Next Stage</button>}
          {!revealed && <button style={T.btnG} onClick={() => setRevealed(true)}>Help & Hints</button>}
        </div>
      </div>
    </div>
  );
}
