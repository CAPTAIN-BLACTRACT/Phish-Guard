import { useState, useEffect, useRef, useCallback } from "react";
import { T } from '../../styles';
import { XPBar } from '../../components';
import { QUESTIONS } from '../../constants';
import { saveQuizResult, signInGuest, logPlatformAction, getAdminQuizQuestions } from '../../firebase';
import { useUser, useAuth } from '../../context';

const QUIZ_LIMIT = 15;

function normalizeQuizQuestion(raw, idx) {
  const opts = Array.isArray(raw?.opts) ? raw.opts.filter(Boolean).slice(0, 4) : [];
  const safeOpts = opts.length >= 2 ? opts : ["Report and verify through official channel", "Click and respond quickly"];
  const safeCorrect = Number.isInteger(raw?.correct) && raw.correct >= 0 && raw.correct < safeOpts.length ? raw.correct : 0;
  const diffValue = String(raw?.diff || "easy").toLowerCase();
  const diff = ["easy", "medium", "hard"].includes(diffValue) ? diffValue : "easy";

  return {
    id: raw?.id || `quiz-${idx + 1}`,
    diff,
    topic: raw?.topic || "Phishing Defense",
    scenario: raw?.scenario || "You receive the following message:",
    img: raw?.img || "Analyze this suspicious communication carefully before acting.",
    q: raw?.q || `Question ${idx + 1}`,
    opts: safeOpts,
    correct: safeCorrect,
    explain: raw?.explain || "Always verify requests through trusted channels before sharing data.",
  };
}

// ─── CANVAS: MATRIX RAIN ─────────────────────────────────────────────────────


// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────


// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────


// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────


// ─── CYBER BACKGROUND ────────────────────────────────────────────────────────


// ─── QUIZ PAGE ────────────────────────────────────────────────────────────────
export function QuizPage({ xp, level, xpPct, xpToNext, addXP, showToast }) {
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(30);
  const [history, setHistory] = useState([]);
  const [questionBank, setQuestionBank] = useState(() => QUESTIONS.map(normalizeQuizQuestion));
  const [contentSource, setContentSource] = useState("local");
  const timerRef = useRef(null);

  const totalQuestionsInBank = questionBank.length || 1;
  const TOTAL_QUESTIONS = Math.min(QUIZ_LIMIT, totalQuestionsInBank);
  const questionNumber = Math.min(history.length + 1, TOTAL_QUESTIONS);
  const q = questionBank[qIdx % totalQuestionsInBank] || normalizeQuizQuestion({}, 0);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [qIdx]);

  // ── Adaptive Logic ────────────────────────────────────────────────────────
  const [currentDiff, setCurrentDiff] = useState("easy");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  // Filter and pick next question based on adaptive difficulty
  const getNextQuestion = (prevIdx, wasCorrect) => {
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

    // Find questions for new difficulty
    const pool = questionBank.filter((item) => item.diff === newDiff);
    if (pool.length === 0) {
      return (prevIdx + 1) % totalQuestionsInBank;
    }

    // Return a random one from that pool (excluding same if possible)
    const randomIdx = Math.floor(Math.random() * pool.length);
    const selectedQ = pool[randomIdx];
    const selectedIdx = questionBank.findIndex((item) => item.id === selectedQ.id);
    return selectedIdx >= 0 ? selectedIdx : (prevIdx + 1) % totalQuestionsInBank;
  };

  const { awardXP, updateStreak } = useUser();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const loadQuestionBank = async () => {
      try {
        const remote = await getAdminQuizQuestions();
        const normalizedRemote = remote.map(normalizeQuizQuestion).filter((item) => item?.q && item?.opts?.length >= 2);
        if (mounted && normalizedRemote.length > 0) {
          setQuestionBank(normalizedRemote);
          setContentSource("backend");
          setQIdx(0);
          setHistory([]);
          setAnswered(false);
          setSelected(null);
          setCurrentDiff("easy");
          setConsecutiveCorrect(0);
        } else if (mounted) {
          setQuestionBank(QUESTIONS.map(normalizeQuizQuestion));
          setContentSource("local");
        }
      } catch {
        if (mounted) {
          setQuestionBank(QUESTIONS.map(normalizeQuizQuestion));
          setContentSource("local");
        }
      }
    };

    loadQuestionBank();
    return () => { mounted = false; };
  }, [user?.uid]);

  // ── Sign-in gate ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ ...T.page, background: "transparent", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 460, background: "rgba(0,8,18,0.85)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 16, backdropFilter: "blur(20px)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🧠</div>
          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "#00f5ff" }}>Sign In to Train</div>
          <p style={{ color: "var(--txt2)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>Your progress, XP, and streak are saved to your profile. Sign in or play as a guest to start training.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...T.btnHP, minWidth: 160 }} onClick={() => document.querySelector('.pg-login-btn')?.click?.()}>🔐 Sign In</button>
            <button style={{ ...T.btnG }} onClick={signInGuest}>👤 Continue as Guest</button>
          </div>
        </div>
      </div>
    );
  }

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

    try {
      await awardXP(xpGain);
    } catch (e) {
      console.warn("Failed to award XP:", e);
    }

    if (user) {
      try {
        await saveQuizResult({
          uid: user.uid,
          questionId: q.id || qIdx,
          correct,
          xpEarned: xpGain,
          topic: q.topic,
          difficulty: q.diff,
          score: correct ? 1 : 0,
          total: 1,
          category: q.topic || "general",
        });
        await updateStreak();  // from UserContext
        await logPlatformAction(user.uid, "QUIZ_ANSWERED", {
          questionId: q.id || qIdx,
          correct,
          xpEarned: xpGain,
          difficulty: q.diff,
        });
      } catch (e) {
        if (e.code === 'permission-denied') {
          showToast("Warning: Progress not saved. Please verify your email to permanently save.", "inf");
        } else {
          console.warn("Failed to save progress:", e);
        }
      }
    }

    setHistory((h) => [...h, { idx: qIdx, correct }]);
    showToast(
      correct ? `🎯 Correct! +${xpGain} XP earned!` : "❌ Not quite. Read the explanation below.",
      correct ? "ok" : "ng"
    );
  };

  // ── Next question ──────────────────────────────────────────────────────────
  const next = () => {
    if (history.length >= TOTAL_QUESTIONS) {
      showToast("🏆 Quiz complete! Well done!", "ok");
      setQIdx(0); setHistory([]); setAnswered(false); setSelected(null);
      setCurrentDiff("easy"); setConsecutiveCorrect(0);
    } else {
      const nextQIdx = getNextQuestion(qIdx, history[history.length - 1].correct);
      setQIdx(nextQIdx);
      setAnswered(false);
      setSelected(null);
    }
  };

  // ── Timer ring visuals ─────────────────────────────────────────────────────
  const CIRC = 125.6;
  const offset = CIRC - (timer / 30) * CIRC;
  const timerColor = timer > 15 ? "#00f5ff" : timer > 7 ? "#ff6d00" : "#ff1744";
  const diffColor = q.diff === "easy" ? "#00ff9d" : q.diff === "medium" ? "#ff6d00" : "#ff1744";

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

      {/* ── Full background stack ── */}


      {/* ── Page content ── */}
      <div className="pg-container" style={{ position: "relative", zIndex: 2, maxWidth: 880, margin: "0 auto", padding: "80px 24px 60px" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".78rem", color: "var(--txt2)" }}>
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </span>
            <span style={{
              padding: "4px 12px", borderRadius: 100,
              fontFamily: "Share Tech Mono, monospace", fontSize: ".7rem", fontWeight: 700,
              background: `${diffColor}18`, border: `1px solid ${diffColor}50`, color: diffColor,
            }}>
              {q.diff.toUpperCase()}
            </span>
            <span style={{
              padding: "4px 10px",
              borderRadius: 100,
              fontFamily: "Share Tech Mono, monospace",
              fontSize: ".66rem",
              border: "1px solid rgba(0,245,255,0.3)",
              color: "#00f5ff",
            }}>
              {contentSource === "backend" ? "BACKEND CONTENT" : "LOCAL CONTENT"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            {q.topic.toUpperCase()} · SCENARIO {questionNumber}
          </div>

          <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono, monospace", fontSize: ".75rem", marginBottom: 10 }}>
            {q.scenario}
          </div>

          {/* Scenario block */}
          <div style={{
            width: "100%", borderRadius: 6, marginBottom: 22,
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
            padding: 14, fontFamily: "Share Tech Mono, monospace",
            fontSize: ".82rem", color: "var(--txt2)", whiteSpace: "pre-wrap", lineHeight: 1.6,
          }}>
            {q.img}
          </div>

          <div style={{
            fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem",
            fontWeight: 700, lineHeight: 1.5, marginBottom: 26,
          }}>
            {q.q}
          </div>

          {/* Options */}
          <div className="quiz-options-grid" style={{ display: "grid", gap: 14 }}>
            {q.opts.map((o, i) => {
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
                  {o}
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
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
              const activeDotIdx = Math.max(0, questionNumber - 1);
              const h = history[i];
              const bg = h ? (h.correct ? "#00f5ff" : "#ff1744") : i === activeDotIdx ? "#00ff9d" : "rgba(255,255,255,.1)";
              const shd = h ? (h.correct ? "0 0 6px #00f5ff" : "0 0 6px #ff1744") : i === activeDotIdx ? "0 0 8px #00ff9d" : "none";
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
              Next Question →
            </button>
          )}
        </div>
      </div>
      <style>{`
        .quiz-options-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .quiz-options-grid { grid-template-columns: 1fr; }
          .pg-container { padding: 40px 10px 40px !important; }
        }
      `}</style>
    </div>
  );
}
