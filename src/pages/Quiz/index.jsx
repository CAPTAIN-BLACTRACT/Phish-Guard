import { useState, useEffect, useRef, useCallback } from "react";
import { T } from '../../styles';
import { XPBar } from '../../components';
import { QUESTIONS } from '../../constants';
import { saveQuizResult } from '../../firebase';
import { useUser, useAuth } from '../../context';
import { useGemini } from '../../hooks/useGemini';

// ─── CANVAS: MATRIX RAIN ─────────────────────────────────────────────────────


// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────


// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────


// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────


// ─── CYBER BACKGROUND ────────────────────────────────────────────────────────


// ─── QUIZ PAGE ────────────────────────────────────────────────────────────────

export function QuizPage({ xp, level, xpPct, xpToNext, addXP, setPage, showToast }) {
  const [quizMode, setQuizMode] = useState(null); // 'easy', 'hard', 'adaptive', 'dynamic'
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(30);
  const [history, setHistory] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const timerRef = useRef(null);
  const { callGemini } = useGemini();

  const q = activeQuestions[qIdx % activeQuestions.length];

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (!quizMode || !activeQuestions.length) return;
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [quizMode, activeQuestions.length]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [qIdx, quizMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Adaptive Logic ────────────────────────────────────────────────────────
  const [currentDiff, setCurrentDiff] = useState("easy");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  // Filter and pick next question
  const getNextQuestion = (prevIdx, wasCorrect) => {
    if (quizMode === 'adaptive') {
      let newDiff = currentDiff;
      let newStreak = wasCorrect ? consecutiveCorrect + 1 : 0;

      if (wasCorrect && newStreak >= 2) {
        if (currentDiff === "easy") newDiff = "medium";
        else if (currentDiff === "medium") newDiff = "hard";
        newStreak = 0; // Reset streak on level up
      } else if (!wasCorrect) {
        if (currentDiff === "hard") newDiff = "medium";
        else if (currentDiff === "medium") newDiff = "easy";
      }

      setCurrentDiff(newDiff);
      setConsecutiveCorrect(newStreak);

      // Find questions for new difficulty from the full pool
      const pool = QUESTIONS.filter(q => q.diff === newDiff);
      const randomIdx = Math.floor(Math.random() * pool.length);
      const selectedQ = pool[randomIdx];

      // Convert back to original QUESTIONS index or just set it
      // Actually, since we're using activeQuestions, let's just find it there if we pre-filled it, 
      // but for adaptive we might want to keep the full pool.
      // Let's adjust how activeQuestions is used.
      return QUESTIONS.findIndex(item => item.q === selectedQ.q);
    } else {
      // Fixed modes or dynamic
      return (qIdx + 1) % activeQuestions.length;
    }
  };

  const startQuiz = async (mode) => {
    setQuizMode(mode);
    setHistory([]);
    setQIdx(0);
    setAnswered(false);
    setSelected(null);

    if (mode === 'easy') {
      setActiveQuestions(QUESTIONS.filter(q => q.diff === 'easy').sort(() => Math.random() - 0.5).slice(0, 10));
    } else if (mode === 'hard') {
      setActiveQuestions(QUESTIONS.filter(q => q.diff === 'hard' || q.diff === 'medium').sort(() => Math.random() - 0.5).slice(0, 10));
    } else if (mode === 'adaptive') {
      setActiveQuestions(QUESTIONS); // Use full pool
      setCurrentDiff("easy");
      setConsecutiveCorrect(0);
    } else if (mode === 'dynamic') {
      setGenerating(true);
      try {
        const prompt = `Generate 5 unique, technical phishing quiz questions. 
        Return ONLY a JSON array of objects with this structure:
        [{"diff": "hard", "topic": "...", "img": "Scenario description...", "q": "Question?", "opts": ["opt1", "opt2", "opt3", "opt4"], "correct": 0, "explain": "..."}]
        IMPORTANT: Do not use markdown (e.g. **bold**, ## headers) in any of the text fields.
        Ensure they are challenging and realistic.`;
        
        const response = await callGemini(prompt, "You are a cybersecurity expert. Output raw JSON only with NO markdown in content.");
        // Clean response if it contains markdown code blocks
        const jsonStr = response.replace(/```json|```/g, "").trim();
        const customQs = JSON.parse(jsonStr).map(q => ({
          ...q,
          explain: q.explain.replace(/\*\*|\#\#/g, ""),
          q: q.q.replace(/\*\*|\#\#/g, ""),
          img: q.img.replace(/\*\*|\#\#/g, ""),
        }));
        setActiveQuestions(customQs);
      } catch (err) {
        console.error("Failed to generate dynamic questions:", err);
        showToast("Neural link failed. Falling back to standard protocol.", "ng");
        setActiveQuestions(QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5));
      }
      setGenerating(false);
    }
  };

  const { awardXP } = useUser();
  const { user } = useAuth();

  // ── Answer ─────────────────────────────────────────────────────────────────
  const answer = async (idx) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(idx);

    const correct = idx === q.correct;
    const xpGain = correct
      ? (q.diff === "easy" ? 50 : q.diff === "medium" ? 100 : 150)
      : 10;

    awardXP(xpGain);

    if (user) {
      await saveQuizResult(user.uid, {
        questionId: q.id || qIdx,
        correct,
        xpEarned: xpGain,
        topic: q.topic,
        difficulty: q.diff
      });
    }

    setHistory((h) => [...h, { idx: qIdx, correct }]);
    showToast(
      correct ? `🎯 Correct! +${xpGain} XP earned!` : "❌ Not quite. Read the explanation below.",
      correct ? "ok" : "ng"
    );
  };

  // ── Next question ──────────────────────────────────────────────────────────
  const next = () => {
    const total = quizMode === 'adaptive' ? 12 : activeQuestions.length;
    if (history.length >= total) {
      showToast("🏆 Quiz complete! Well done!", "ok");
      setQuizMode(null);
      setQIdx(0); setHistory([]); setAnswered(false); setSelected(null);
    } else {
      if (quizMode === 'adaptive') {
        const nextQIdx = getNextQuestion(qIdx, history[history.length - 1].correct);
        setQIdx(nextQIdx);
      } else {
        setQIdx(prev => prev + 1);
      }
      setAnswered(false);
      setSelected(null);
    }
  };

  // ── Timer ring visuals ─────────────────────────────────────────────────────
  const CIRC = 125.6;
  const offset = CIRC - (timer / 30) * CIRC;
  const timerColor = timer > 15 ? "#00f5ff" : timer > 7 ? "#ff6d00" : "#ff1744";
  const diffColor = !q ? "#00f5ff" : q.diff === "easy" ? "#00ff9d" : q.diff === "medium" ? "#ff6d00" : "#ff1744";

  // ── Selection Screen ───────────────────────────────────────────────────────
  if (!quizMode) {
    return (
      <div style={{ ...T.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...T.card, maxWidth: 500, padding: 40, textAlign: "center" }}>
          <h2 style={{ fontFamily: "Orbitron", marginBottom: 10, color: "#00f5ff" }}>PHISH-QUIZ OS</h2>
          <p style={{ color: "var(--txt2)", marginBottom: 30, fontSize: ".9rem" }}>Select training intensity for your neural firewall.</p>
          
          <div style={{ display: "grid", gap: 12 }}>
            <button style={{ ...T.btnG, padding: "18px" }} onClick={() => startQuiz('easy')}>
              🟢 BASIC (Easy Mode)
            </button>
            <button style={{ ...T.btnP, padding: "18px" }} onClick={() => startQuiz('hard')}>
              🔴 ELITE (Hard Mode)
            </button>
            <button style={{ ...T.btnG, border: "1px solid #ff00ff", color: "#ff00ff", padding: "18px" }} onClick={() => startQuiz('adaptive')}>
              ⚡ ADAPTIVE NEURAL (Dynamic Difficulty)
            </button>
            <button 
              disabled={generating}
              style={{ ...T.btnP, border: "1px solid #00ff9d", color: "#00ff9d", padding: "18px" }} 
              onClick={() => startQuiz('dynamic')}
            >
              {generating ? "📡 RECALIBRATING..." : "🤖 AI GENERATED (Real-time Phish)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ ...T.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 20, animation: "pulse 1.5s infinite" }}>📡</div>
          <h2 style={{ fontFamily: "Share Tech Mono", color: "#00f5ff" }}>CONNECTING TO FINN-AI...</h2>
          <p style={{ color: "var(--txt2)" }}>Synthesizing custom phishing scenarios...</p>
        </div>
      </div>
    );
  }

  const currentTotal = quizMode === 'adaptive' ? 12 : activeQuestions.length;

  return (
    <div style={{
      ...T.page,
      background: "transparent",
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
        @keyframes timerPulse     { 0%,100%{box-shadow:0 0 0 0 rgba(255,23,68,0)} 50%{box-shadow:0 0 0 6px rgba(255,23,68,.25)} }
      `}</style>

      {/* ── Page content ── */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 880, margin: "0 auto", padding: "80px 24px 60px" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".78rem", color: "var(--txt2)" }}>
              Question {history.length + 1} of {currentTotal}
            </span>
            <span style={{
              padding: "4px 12px", borderRadius: 100,
              fontFamily: "Share Tech Mono, monospace", fontSize: ".7rem", fontWeight: 700,
              background: `${diffColor}18`, border: `1px solid ${diffColor}50`, color: diffColor,
            }}>
              {q?.diff?.toUpperCase() || "DYNAMIC"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={T.btnG} onClick={() => setQuizMode(null)}>
              ⬅️ Back
            </button>

            {/* SVG timer ring */}
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <svg
                style={{ position: "absolute", top: 0, left: 0, width: 48, height: 48, transform: "rotate(-90deg)" }}
                viewBox="0 0 48 48"
              >
                <circle fill="none" stroke="rgba(0,245,255,.12)" strokeWidth="3" cx="24" cy="24" r="20" />
                <circle
                  fill="none"
                  stroke={timerColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  cx="24" cy="24" r="20"
                  strokeDasharray={CIRC}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset .9s linear, stroke .3s" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Share Tech Mono, monospace", fontSize: ".88rem", fontWeight: 700,
                color: timerColor,
                animation: timer <= 7 ? "timerPulse 1s infinite" : "none",
              }}>
                {timer}
              </div>
            </div>
          </div>
        </div>

        {/* ── XP Bar ── */}
        <XPBar xp={xp} level={level} xpPct={xpPct} xpToNext={xpToNext} />

        {/* ── Question card ── */}
        <div style={{ ...T.card, padding: 38 }}>
          <div style={{
            fontFamily: "Share Tech Mono, monospace", fontSize: ".78rem",
            color: "var(--txt2)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14,
          }}>
            {q?.topic?.toUpperCase() || "PHISHING"} · SCENARIO {history.length + 1}
          </div>

          {/* Scenario block */}
          <div style={{
            width: "100%", borderRadius: 6, marginBottom: 22,
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
            padding: 14, fontFamily: "Share Tech Mono, monospace",
            fontSize: ".82rem", color: "var(--txt2)", whiteSpace: "pre-wrap", lineHeight: 1.6,
          }}>
            {q?.img}
          </div>

          <div style={{
            fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem",
            fontWeight: 700, lineHeight: 1.5, marginBottom: 26,
          }}>
            {q?.q}
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
            {q?.opts?.map((opt, i) => {
              let border = "1px solid rgba(0,245,255,.08)";
              let bg = "rgba(0,8,18,0.8)";
              let color = "#e0f7fa";

              if (answered) {
                if (i === q.correct) { border = "1px solid #00ff9d"; bg = "rgba(0,255,157,.08)"; color = "#00ff9d"; }
                else if (i === selected) { border = "1px solid #ff1744"; bg = "rgba(255,23,68,.08)"; color = "#ff1744"; }
              }

              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => answer(i)}
                  style={{
                    padding: "15px 18px", border, borderRadius: 4,
                    cursor: answered ? "default" : "pointer",
                    fontSize: ".88rem", lineHeight: 1.5,
                    background: bg, textAlign: "left",
                    fontFamily: "Rajdhani, sans-serif", color,
                    transition: "all .2s", position: "relative",
                  }}
                >
                  {opt}
                  {answered && i === q.correct && (
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#00ff9d", fontWeight: 700 }}>✓</span>
                  )}
                  {answered && i === selected && i !== q.correct && (
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#ff1744", fontWeight: 700 }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div style={{
              marginTop: 18, padding: 16,
              background: "rgba(0,245,255,.04)", borderLeft: "3px solid #00f5ff",
              borderRadius: "0 8px 8px 0", fontSize: ".85rem",
              color: "var(--txt2)", lineHeight: 1.7, animation: "fuA .4s ease both",
            }}>
              {selected === q.correct ? "✅ " : "❌ "}{q.explain}
            </div>
          )}

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, marginTop: 22 }}>
            {Array.from({ length: currentTotal }).map((_, i) => {
              const h = history[i];
              const isCurrent = i === history.length;
              const bg = h ? (h.correct ? "#00f5ff" : "#ff1744") : isCurrent ? "#00ff9d" : "rgba(255,255,255,.1)";
              const shd = h ? (h.correct ? "0 0 6px #00f5ff" : "0 0 6px #ff1744") : isCurrent ? "0 0 8px #00ff9d" : "none";
              return (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: bg, boxShadow: shd, transition: "all .3s",
                }} />
              );
            })}
          </div>

          {answered && (
            <button style={{ ...T.btnP, marginTop: 20 }} onClick={next}>
              {history.length >= currentTotal ? "Finish Quiz" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
