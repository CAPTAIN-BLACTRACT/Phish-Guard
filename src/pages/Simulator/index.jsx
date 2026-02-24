import { useState, useEffect } from "react";
import { T } from '../../styles';
import { SIM_STAGES } from '../../constants';
import { logSimulatorAttempt, logPlatformAction, signInGuest, getAdminSimScenarios } from '../../firebase';
import { useUser, useAuth } from '../../context';
import { useGemini } from '../../hooks';
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

  const [mode, setMode] = useState("stages"); // "stages" or "neural"
  const [emailInput, setEmailInput] = useState({ sender: "", body: "" });
  const [urlInput, setUrlInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisType, setAnalysisType] = useState(null);
  const { callGemini, loading: aiLoading } = useGemini();

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

  // ── Neural Lab Functions ───────────────────────────────────────────────────
  const handleAnalyzeEmail = async () => {
    if (!emailInput.body) return showToast("Please provide email body.", "err");
    setAnalysisType("email");
    setAnalysisResult("INITIALIZING_NEURAL_SCAN...");

    const prompt = `
      Deep analysis of the following email:
      Sender: ${emailInput.sender || "Unknown"}
      Body: ${emailInput.body}
      
      Requirements: 
      1. Determine if phishy or genuine.
      2. List specific red flags (if any).
      3. Give a risk level (LOW/MED/HIGH/CRITICAL).
      4. Suggest safe actions.
    `;
    const result = await callGemini(prompt, "You are an Elite Phishing Analyst. Provide a structured report using PLAIN TEXT ONLY. Do not use markdown like **bold** or ## headers. Use simple bullet points if needed.");
    setAnalysisResult(result.replace(/\*\*|\#\#/g, ""));
    awardXP(10); // Reward for using the lab
    showToast("Email Analysis Complete! +10 XP", "ok");
  };

  const handleAnalyzeLink = async () => {
    if (!urlInput) return showToast("Please provide a URL.", "err");
    setAnalysisType("link");
    setAnalysisResult("SCANNING_URL_FOR_THREATS...");

    const prompt = `Analyze this URL for potential phishing: ${urlInput}`;
    const result = await callGemini(prompt, "Analyze the URL structure, TLD, and common typosquatting patterns. Verdict first. Use PLAIN TEXT ONLY, no markdown.");
    setAnalysisResult(result.replace(/\*\*|\#\#/g, ""));
    awardXP(5); // Reward for using the lab
    showToast("URL Scan Complete! +5 XP", "ok");
  };

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
    try {
      await awardXP(xpGain);
    } catch (e) {
      console.warn("Failed to award XP:", e);
    }
    if (user) {
      try {
        await logSimulatorAttempt({
          uid: user.uid,
          stageId: stage.id || stageIdx,
          flagsFound: found,
          totalFlags: total,
          xpEarned: xpGain,
          completed: found === total
        });
        await updateStreak();  // from UserContext
        await logPlatformAction(user.uid, "SIMULATION_SUBMITTED", {
          stageId: stage.id || stageIdx,
          flagsFound: found,
          totalFlags: total,
          xpEarned: xpGain,
          completed: found === total,
        });
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
          @media (max-width: 900px) {
            .cards-grid { grid-template-columns: 1fr !important; }
            .pg-container { padding: 80px 15px 60px !important; }
          }
          @keyframes cyberBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>

      <div style={{ position: "relative", zIndex: 2, padding: "80px 20px 60px", maxWidth: 1200, margin: "0 auto" }} className="pg-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
          <PageHeader label="SIMULATOR" title={mode === "stages" ? "Spot the Phishing" : "Neural Lab Analysis"} />
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={() => setMode("stages")} 
              style={{ ...T.btnHS, borderColor: mode === "stages" ? "#00f5ff" : "rgba(255,255,255,0.1)", color: mode === "stages" ? "#00f5ff" : "var(--txt2)" }}
            >
              🎓 TRAINING STAGES
            </button>
            <button 
              onClick={() => setMode("neural")} 
              style={{ ...T.btnHS, borderColor: mode === "neural" ? "#00f5ff" : "rgba(255,255,255,0.1)", color: mode === "neural" ? "#d500f9" : "var(--txt2)" }}
            >
              📡 NEURAL LAB
            </button>
            <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 100, padding: "6px 12px", display: "flex", alignItems: "center" }}>
              {contentSource === "backend" ? "BACKEND SCENARIOS" : "LOCAL SCENARIOS"}
            </div>
          </div>
        </div>

        {mode === "stages" ? (
          <>
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
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 30 }}>
            {/* Input Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ ...T.card, padding: 25 }}>
                <div style={{ ...T.secLbl, marginBottom: 20 }}>// DYNAMIC EMAIL ANALYZER</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <input 
                    placeholder="Sender Address (e.g., support@m-amazon.com)"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: "12px 15px", borderRadius: 4, fontFamily: "Share Tech Mono" }}
                    value={emailInput.sender}
                    onChange={e => setEmailInput({...emailInput, sender: e.target.value})}
                  />
                  <textarea 
                    placeholder="Paste the suspicious email body here..."
                    rows={8}
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: "12px 15px", borderRadius: 4, fontFamily: "inherit", resize: "none" }}
                    value={emailInput.body}
                    onChange={e => setEmailInput({...emailInput, body: e.target.value})}
                  />
                  <button onClick={handleAnalyzeEmail} disabled={aiLoading} style={T.btnHP}>
                    {aiLoading && analysisType === "email" ? "ANALYZING NEURAL PATTERNS..." : "ANALYZE EMAIL"}
                  </button>
                </div>
              </div>

              <div style={{ ...T.card, padding: 25 }}>
                <div style={{ ...T.secLbl, marginBottom: 20 }}>// NEURAL LINK SCANNER</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input 
                    placeholder="Enter URL to scan..."
                    style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: "12px 15px", borderRadius: 4, fontFamily: "Share Tech Mono" }}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                  />
                  <button onClick={handleAnalyzeLink} disabled={aiLoading} style={{ ...T.btnHP, whiteSpace: "nowrap" }}>
                    {aiLoading && analysisType === "link" ? "SCANNING..." : "SCAN LINK"}
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Result Side Panel */}
            <div style={{ ...T.card, display: "flex", flexDirection: "column", background: "rgba(0,12,26,0.8)", border: "1px solid rgba(213,0,249,0.3)", height: "600px" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(213,0,249,0.2)", background: "rgba(213,0,249,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "Orbitron", fontSize: "0.8rem", color: "#d500f9", letterSpacing: 1 }}>📡 NEURAL_READOUT</span>
                {analysisResult && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 10px #00f5ff" }}></div>}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", scrollbarWidth: "thin", scrollbarColor: "rgba(213,0,249,0.3) transparent" }}>
                {!analysisResult && !aiLoading ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--txt2)", fontFamily: "Share Tech Mono", fontSize: "0.85rem", opacity: 0.6 }}>
                    Awaiting intelligence input...<br/>Initialize scan to begin.
                  </div>
                ) : (
                  <>
                    {/* Section 1: Quick Status */}
                    <div style={{ marginTop: 20, padding: 15, background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #d500f9", borderRadius: "0 4px 4px 0" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--txt2)", marginBottom: 5, fontFamily: "Orbitron" }}>// QUICK_STATUS</div>
                      <div style={{ fontFamily: "Share Tech Mono", fontSize: "1rem", color: "#fff", fontWeight: "bold" }}>
                        {aiLoading ? (
                          <span style={{ animation: "cyberBlink 1.5s infinite ease-in-out" }}>SCANNING...</span>
                        ) : (
                          analysisResult?.toLowerCase().includes("🔴") || analysisResult?.toLowerCase().includes("phish") || analysisResult?.toLowerCase().includes("malicious") 
                          ? "🔴 THREAT_DETECTED" 
                          : analysisResult?.toLowerCase().includes("🟢") || analysisResult?.toLowerCase().includes("safe") || analysisResult?.toLowerCase().includes("genuine")
                          ? "🟢 VERIFIED_SAFE"
                          : "🟡 UNKNOWN_ORIGIN"
                        )}
                      </div>
                    </div>

                    {/* Section 2: Deep Analysis */}
                    <div style={{ marginTop: 25 }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--txt2)", marginBottom: 12, fontFamily: "Orbitron" }}>// DEEP_NEURAL_ANALYSIS</div>
                      <div style={{ fontFamily: "Share Tech Mono", fontSize: "0.85rem", lineHeight: 1.6, color: "#e0f7fa", whiteSpace: "pre-wrap" }}>
                        {aiLoading ? (
                          <div style={{ color: "#d500f9", animation: "cyberBlink 1.5s infinite ease-in-out" }}>
                            &gt; ACCESSING_NEURAL_NODES...<br/>
                            &gt; DECODING_HEURISTICS...<br/>
                            &gt; CALCULATING_RISK_VECTORS...
                          </div>
                        ) : analysisResult}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {analysisResult && (
                <div style={{ padding: 15, borderTop: "1px solid rgba(213,0,249,0.1)", background: "rgba(0,0,0,0.2)" }}>
                  <button onClick={() => setAnalysisResult(null)} style={{ ...T.btnHS, width: "100%", fontSize: "0.7rem", padding: "8px" }}>PURGE DATA CACHE</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
