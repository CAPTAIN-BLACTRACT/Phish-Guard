import { useState, useEffect, useRef } from "react";
import { T } from '../../styles';
import { SIM_STAGES } from '../../constants';
import { logSimulatorAttempt } from '../../firebase';
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function SimulatorPage({ showToast }) {
  const { awardXP } = useUser();
  const { user } = useAuth();
  const [stageIdx, setStageIdx] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const stage = SIM_STAGES[stageIdx];
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
    awardXP(xpGain);
    if (user) {
      await logSimulatorAttempt(user.uid, {
        stageId: stage.id || stageIdx,
        flagsFound: found,
        totalFlags: total,
        xpEarned: xpGain,
        completed: found === total
      });
    }
    showToast(`${found}/${total} flags found! +${xpGain} XP`, found === total ? "ok" : "inf");
  };

  const nextStage = () => {
    setStageIdx((s) => (s + 1) % SIM_STAGES.length);
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
          @media (max-width: 900px) {
            .cards-grid { grid-template-columns: 1fr !important; }
            .pg-container { padding: 80px 15px 60px !important; }
          }
        `}</style>

      <div style={{ position: "relative", zIndex: 2, padding: "80px 40px 60px" }} className="pg-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
          <PageHeader label="SIMULATOR" title="Spot the Phishing" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".73rem", color: "var(--txt2)" }}>Stage {stageIdx + 1}/{SIM_STAGES.length}</span>
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
