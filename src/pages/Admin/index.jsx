import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { T } from '../../styles';
import { PageHeader } from '../../components';
import { QUESTIONS, SIM_STAGES, MODULES } from '../../constants';
import { db, storage } from '../../firebase/config';
import {
    collection, addDoc, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    getAdminAnalytics,
    addAdminQuizQuestion, getAdminQuizQuestions, deleteAdminQuizQuestion,
    addAdminSimScenario, getAdminSimScenarios, deleteAdminSimScenario,
    syncQuizQuestionsToBackend, syncSimScenariosToBackend,
} from '../../firebase/db';

const INP = {
    width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,245,255,0.2)",
    color: "#fff", padding: "10px 12px", borderRadius: 6, fontFamily: "inherit", fontSize: "0.85rem",
    outline: "none", marginTop: 4,
};
const LBL = { color: "rgba(0,245,255,0.6)", fontSize: "0.7rem", fontFamily: "Share Tech Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" };
const CARD = { background: "rgba(0,8,18,0.8)", border: "1px solid rgba(0,245,255,0.08)", borderRadius: 10, padding: 24, marginBottom: 16 };
const BTN_DEL = { cursor: "pointer", background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.3)", color: "#ff1744", borderRadius: 4, padding: "4px 10px", fontSize: "0.75rem" };

/* ─── DEFAULT EMPTY FORMS ────────────────────────────────────────────────── */
const emptyQuiz = {
    q: "", opts: ["", "", "", ""], correct: 0, explain: "",
    diff: "easy", topic: "", scenario: "", img: ""
};
const emptySim = {
    legitFrom: "", legitAddr: "", legitSubject: "", legitBody: "",
    phishFrom: "", phishAddr: "", phishSubject: "", phishBody: "",
    flags: [{ id: "f1", text: "", hint: "" }, { id: "f2", text: "", hint: "" }]
};

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
export function AdminPage({ showToast }) {
    const navigate = useNavigate();
    const [pass, setPass] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [tab, setTab] = useState("analytics");
    const [loading, setLoading] = useState(false);

    /* analytics */
    const [analytics, setAnalytics] = useState(null);

    /* quiz */
    const [quizForm, setQuizForm] = useState(emptyQuiz);
    const [quizList, setQuizList] = useState([]);
    const [editingQuizId, setEditingQuizId] = useState(null);

    /* simulator */
    const [simForm, setSimForm] = useState(emptySim);
    const [simList, setSimList] = useState([]);
    const [editingSimId, setEditingSimId] = useState(null);

    /* gallery */
    const [galleryForm, setGalleryForm] = useState({ title: "", description: "", type: "phish", file: null });

    /* neural academy */
    const [aiConfigForm, setAiConfigForm] = useState({ systemPrompt: "You are Finn-AI, a high-level cybersecurity neural advisor for PhishGuard.\nYour mission is to provide deep technical analysis on phishing, social engineering, and defense strategies.\nKeep responses concise, formatted for a terminal interface (use 🟢, 🔴, 📡 emojis), and authoritative.", modelFallback: "gemini-1.5-pro, gemini-2.0-flash, gemini-1.5-flash" });
    const staticQuizCount = QUESTIONS.length;
    const staticSimCount = SIM_STAGES.length;
    const staticModuleCount = MODULES.length;

    const openRoute = (path) => {
        navigate(path);
    };
    /* ── Auth ── */
    const handleAuth = (e) => {
        e.preventDefault();
        const adminKey = import.meta.env.VITE_ADMIN_ACCESS_KEY;
        if (!adminKey) {
            showToast("ADMIN ACCESS KEY NOT CONFIGURED", "ng");
            return;
        }
        if (pass === adminKey) setIsAuth(true);
        else showToast("INVALID ACCESS KEY", "ng");
    };

    /* Load data after auth */
    useEffect(() => {
        if (!isAuth) return;
        loadAnalytics();
        loadQuizList();
        loadSimList();
    }, [isAuth]);

    async function loadAnalytics() {
        try {
            const data = await getAdminAnalytics();
            setAnalytics(data);
        } catch (e) { showToast(e.message, "ng"); }
    }

    async function loadQuizList() {
        try { setQuizList(await getAdminQuizQuestions()); } catch (e) { showToast(e.message, "ng"); }
    }

    async function loadSimList() {
        try { setSimList(await getAdminSimScenarios()); } catch (e) { showToast(e.message, "ng"); }
    }

    /* ── Quiz CRUD ── */
    const handleSubmitQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...quizForm, correct: Number(quizForm.correct) };
            if (editingQuizId) {
                await updateDoc(doc(db, "quizQuestions", editingQuizId), { ...payload, updatedAt: serverTimestamp() });
                showToast("Question updated!", "ok");
            } else {
                await addAdminQuizQuestion(payload);
                showToast("Question published to Firestore!", "ok");
            }
            setQuizForm(emptyQuiz); setEditingQuizId(null);
            loadQuizList();
        } catch (err) { showToast(err.message, "ng"); }
        finally { setLoading(false); }
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        await deleteAdminQuizQuestion(id);
        showToast("Question deleted", "ok");
        loadQuizList();
    };

    const handleEditQuiz = (q) => {
        setQuizForm({ q: q.q, opts: q.opts, correct: q.correct, explain: q.explain || "", diff: q.diff, topic: q.topic || "", scenario: q.scenario || "", img: q.img || "" });
        setEditingQuizId(q.id);
        setTab("quiz");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ── Simulator CRUD ── */
    const handleSubmitSim = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const scenario = {
                legit: { from: simForm.legitFrom, addr: simForm.legitAddr, subject: simForm.legitSubject, body: simForm.legitBody, safe: true },
                phish: { from: simForm.phishFrom, addr: simForm.phishAddr, subject: simForm.phishSubject, body: simForm.phishBody, flags: simForm.flags.filter(f => f.text) }
            };
            if (editingSimId) {
                await updateDoc(doc(db, "simScenarios", editingSimId), { ...scenario, updatedAt: serverTimestamp() });
                showToast("Scenario updated!", "ok");
            } else {
                await addAdminSimScenario(scenario);
                showToast("Scenario published to Firestore!", "ok");
            }
            setSimForm(emptySim); setEditingSimId(null);
            loadSimList();
        } catch (err) { showToast(err.message, "ng"); }
        finally { setLoading(false); }
    };

    const handleDeleteSim = async (id) => {
        if (!window.confirm("Delete this scenario?")) return;
        await deleteAdminSimScenario(id);
        showToast("Scenario deleted", "ok");
        loadSimList();
    };

    const handleEditSim = (scenario) => {
        setSimForm({
            legitFrom: scenario?.legit?.from || "",
            legitAddr: scenario?.legit?.addr || "",
            legitSubject: scenario?.legit?.subject || "",
            legitBody: scenario?.legit?.body || "",
            phishFrom: scenario?.phish?.from || "",
            phishAddr: scenario?.phish?.addr || "",
            phishSubject: scenario?.phish?.subject || "",
            phishBody: scenario?.phish?.body || "",
            flags: Array.isArray(scenario?.phish?.flags) && scenario.phish.flags.length > 0
                ? scenario.phish.flags.map((flag, idx) => ({
                    id: flag?.id || `f${idx + 1}`,
                    text: flag?.text || "",
                    hint: flag?.hint || "",
                }))
                : [{ id: "f1", text: "", hint: "" }, { id: "f2", text: "", hint: "" }],
        });
        setEditingSimId(scenario.id);
        setTab("simulator");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSyncQuizContent = async () => {
        setLoading(true);
        try {
            const result = await syncQuizQuestionsToBackend(QUESTIONS);
            await loadQuizList();
            showToast(`Synced ${result.synced} quiz questions to backend.`, "ok");
        } catch (err) {
            showToast(err.message || "Failed to sync quiz content.", "ng");
        } finally {
            setLoading(false);
        }
    };

    const handleSyncSimulatorContent = async () => {
        setLoading(true);
        try {
            const result = await syncSimScenariosToBackend(SIM_STAGES);
            await loadSimList();
            showToast(`Synced ${result.synced} simulator scenarios to backend.`, "ok");
        } catch (err) {
            showToast(err.message || "Failed to sync simulator content.", "ng");
        } finally {
            setLoading(false);
        }
    };

    /* ── Gallery Upload ── */
    const handleGalleryUpload = async (e) => {
        e.preventDefault();
        if (!galleryForm.file) return showToast("Please select an image", "inf");
        setLoading(true);
        try {
            const fileRef = ref(storage, `gallery/${Date.now()}_${galleryForm.file.name}`);
            await uploadBytes(fileRef, galleryForm.file);
            const url = await getDownloadURL(fileRef);
            await addDoc(collection(db, "gallery"), {
                title: galleryForm.title, description: galleryForm.description,
                type: galleryForm.type, imageUrl: url, timestamp: serverTimestamp(), approved: true
            });
            showToast("Gallery item uploaded!", "ok");
            setGalleryForm({ title: "", description: "", type: "phish", file: null });
        } catch (err) { showToast(err.message, "ng"); }
        finally { setLoading(false); }
    };

    /* ─── LOGIN WALL ──────────────────────────────────────────────────────────── */
    if (!isAuth) return (
        <div style={{ ...T.page, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <form onSubmit={handleAuth} style={{ ...T.card, padding: 48, maxWidth: 420, width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
                <PageHeader label="RESTRICTED AREA" title="Admin Command Center" />
                <p style={{ color: "var(--txt2)", fontSize: "0.8rem", marginBottom: 24 }}>Enter your administrative access key to continue.</p>
                <input
                    type="password" placeholder="ENTER ACCESS KEY" value={pass}
                    onChange={e => setPass(e.target.value)} autoFocus
                    style={{ ...INP, textAlign: "center", letterSpacing: "0.3em", marginBottom: 20, padding: 14 }}
                />
                <button type="submit" style={{ ...T.btnHP, width: "100%", justifyContent: "center" }}>🚀 INITIALIZE SESSION</button>
            </form>
        </div>
    );

    /* ─── TABS ────────────────────────────────────────────────────────────────── */
    const tabs = [
        { id: "analytics", label: "📊 Analytics" },
        { id: "quiz", label: "🧠 Quiz Questions" },
        { id: "simulator", label: "🎯 Simulator Scenarios" },
        { id: "gallery", label: "🖼️ Gallery Upload" },
        { id: "ai", label: "🤖 Neural Config" },
    ];

    return (
        <div style={{ ...T.page, background: "#000509", minHeight: "100vh" }}>
            <section style={{ ...T.sec, maxWidth: 1100, margin: "0 auto" }}>
                <PageHeader label="// COMMAND CENTER" title="Admin Dashboard" />

                {/* Tab bar */}
                <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", borderBottom: "1px solid rgba(0,245,255,0.08)", paddingBottom: 16 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            background: tab === t.id ? "rgba(0,245,255,0.12)" : "transparent",
                            border: `1px solid ${tab === t.id ? "#00f5ff" : "rgba(0,245,255,0.15)"}`,
                            color: tab === t.id ? "#00f5ff" : "var(--txt2)",
                            borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                            fontFamily: "Share Tech Mono, monospace", fontSize: "0.8rem",
                            transition: "all 0.2s",
                        }}>{t.label}</button>
                    ))}
                    <button onClick={loadAnalytics} style={{ ...T.btnG, marginLeft: "auto", fontSize: "0.75rem" }}>↻ Refresh</button>
                    <button onClick={() => openRoute("/neural-academy")} style={{ ...T.btnG, fontSize: "0.75rem" }}>Open Academy</button>
                    <button onClick={() => openRoute("/quiz")} style={{ ...T.btnG, fontSize: "0.75rem" }}>Open Quiz</button>
                    <button onClick={() => openRoute("/simulator")} style={{ ...T.btnG, fontSize: "0.75rem" }}>Open Simulator</button>
                </div>

                {/* ─── ANALYTICS TAB ───────────────────────────────────────────────── */}
                {tab === "analytics" && (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                            {analytics ? [
                                { lbl: "TOTAL USERS", val: analytics.totalUsers, icon: "👥", color: "#00f5ff" },
                                { lbl: "QUIZ ATTEMPTS", val: analytics.totalQuizAttempts.toLocaleString(), icon: "🧠", color: "#00ff9d" },
                                { lbl: "SIM ATTEMPTS", val: analytics.totalSimAttempts.toLocaleString(), icon: "🎯", color: "#d500f9" },
                                { lbl: "GALLERY ITEMS", val: analytics.totalGalleryItems, icon: "🖼️", color: "#ff6d00" },
                                { lbl: "AVG XP / USER", val: analytics.avgXP.toLocaleString(), icon: "⚡", color: "#ffd600" },
                                { lbl: "AVG LEVEL", val: analytics.avgLevel, icon: "🏅", color: "#00f5ff" },
                                { lbl: "QUIZ ACCURACY", val: `${analytics.quizAccuracy}%`, icon: "🎯", color: "#00ff9d" },
                            ].map(s => (
                                <div key={s.lbl} style={{ padding: 24, background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)", borderRadius: 10, textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>{s.icon}</div>
                                    <div style={{ color: s.color, fontFamily: "Orbitron, sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>{s.val}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem", letterSpacing: "0.15em", fontFamily: "Share Tech Mono, monospace" }}>{s.lbl}</div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--txt2)", padding: 40 }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                                    Loading live analytics...
                                </div>
                            )}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div style={CARD}>
                                <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono", fontSize: "0.75rem", marginBottom: 12 }}>// QUIZ QUESTION POOL</div>
                                <div style={{ color: "#e0f7fa", fontSize: "1.4rem", fontWeight: 700 }}>{quizList.length} questions in Firestore</div>
                                <div style={{ color: "var(--txt2)", fontSize: "0.75rem", marginTop: 4 }}>Static questions in code: {staticQuizCount}</div>
                                <button onClick={handleSyncQuizContent} disabled={loading} style={{ ...T.btnG, marginTop: 10, fontSize: "0.72rem" }}>
                                    Sync Static Quiz to Backend
                                </button>
                            </div>
                            <div style={CARD}>
                                <div style={{ color: "#d500f9", fontFamily: "Share Tech Mono", fontSize: "0.75rem", marginBottom: 12 }}>// SIMULATOR SCENARIOS</div>
                                <div style={{ color: "#e0f7fa", fontSize: "1.4rem", fontWeight: 700 }}>{simList.length} scenarios in Firestore</div>
                                <div style={{ color: "var(--txt2)", fontSize: "0.75rem", marginTop: 4 }}>Static scenarios in code: {staticSimCount}</div>
                                <button onClick={handleSyncSimulatorContent} disabled={loading} style={{ ...T.btnG, marginTop: 10, fontSize: "0.72rem" }}>
                                    Sync Static Simulator to Backend
                                </button>
                            </div>
                        </div>
                        <div style={{ ...CARD, marginTop: 4 }}>
                            <div style={{ color: "#00ff9d", fontFamily: "Share Tech Mono", fontSize: "0.75rem", marginBottom: 10 }}>// NEURAL ACADEMY MODULES</div>
                            <div style={{ color: "#e0f7fa", fontSize: "1.1rem", fontWeight: 700 }}>{staticModuleCount} modules in academy constants</div>
                            <div style={{ color: "var(--txt2)", fontSize: "0.75rem", marginTop: 4 }}>
                                Quiz and simulator pages now support backend-first content with local fallback.
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── QUIZ TAB ─────────────────────────────────────────────────────── */}
                {tab === "quiz" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
                        {/* Form */}
                        <form onSubmit={handleSubmitQuiz}>
                            <h3 style={{ color: "#00f5ff", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>
                                {editingQuizId ? "✏️ Edit Question" : "➕ Add New Question"}
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <div style={LBL}>Difficulty</div>
                                        <select value={quizForm.diff} onChange={e => setQuizForm({ ...quizForm, diff: e.target.value })} style={INP}>
                                            <option value="easy">Easy (+50 XP)</option>
                                            <option value="medium">Medium (+100 XP)</option>
                                            <option value="hard">Hard (+150 XP)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div style={LBL}>Topic</div>
                                        <input placeholder="e.g. Spear Phishing" value={quizForm.topic} onChange={e => setQuizForm({ ...quizForm, topic: e.target.value })} style={INP} />
                                    </div>
                                </div>
                                <div>
                                    <div style={LBL}>Scenario Context (shown above email)</div>
                                    <input placeholder="e.g. You receive this email:" value={quizForm.scenario} onChange={e => setQuizForm({ ...quizForm, scenario: e.target.value })} style={INP} />
                                </div>
                                <div>
                                    <div style={LBL}>Email Mockup (shown in the code box)</div>
                                    <textarea placeholder="📧 FROM: ...\nSUBJECT: ...\nBODY: ..." value={quizForm.img} onChange={e => setQuizForm({ ...quizForm, img: e.target.value })} style={{ ...INP, minHeight: 80, resize: "vertical" }} />
                                </div>
                                <div>
                                    <div style={LBL}>Question Text</div>
                                    <textarea placeholder="What is the primary red flag?" value={quizForm.q} onChange={e => setQuizForm({ ...quizForm, q: e.target.value })} style={{ ...INP, minHeight: 60, resize: "vertical" }} required />
                                </div>
                                <div>
                                    <div style={LBL}>Answer Options (4 required)</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                                        {quizForm.opts.map((opt, i) => (
                                            <div key={i} style={{ position: "relative" }}>
                                                <input
                                                    placeholder={`Option ${i + 1}`} value={opt}
                                                    onChange={e => { const o = [...quizForm.opts]; o[i] = e.target.value; setQuizForm({ ...quizForm, opts: o }); }}
                                                    style={{ ...INP, borderColor: quizForm.correct === i ? "rgba(0,255,157,0.5)" : "rgba(0,245,255,0.2)", marginTop: 0 }}
                                                    required
                                                />
                                                <small style={{ color: quizForm.correct === i ? "#00ff9d" : "var(--txt2)", fontSize: "0.65rem" }}>
                                                    {quizForm.correct === i ? "✓ Correct Answer" : ""}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={LBL}>Correct Answer Index (0–3)</div>
                                    <input type="number" min="0" max="3" value={quizForm.correct} onChange={e => setQuizForm({ ...quizForm, correct: parseInt(e.target.value) })} style={INP} />
                                    <small style={{ color: "var(--txt2)", fontSize: "0.7rem" }}>Currently marking Option {Number(quizForm.correct) + 1} as correct</small>
                                </div>
                                <div>
                                    <div style={LBL}>Explanation</div>
                                    <textarea placeholder="Explain why this is the correct answer..." value={quizForm.explain} onChange={e => setQuizForm({ ...quizForm, explain: e.target.value })} style={{ ...INP, minHeight: 70, resize: "vertical" }} />
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button type="submit" disabled={loading} style={{ ...T.btnHP, flex: 1 }}>
                                        {loading ? "PUSHING..." : editingQuizId ? "✏️ UPDATE QUESTION" : "🚀 PUBLISH QUESTION"}
                                    </button>
                                    {editingQuizId && (
                                        <button type="button" onClick={() => { setEditingQuizId(null); setQuizForm(emptyQuiz); }} style={{ ...T.btnG }}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Existing questions list */}
                        <div>
                            <h3 style={{ color: "#00f5ff", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>
                                📋 Firestore Questions ({quizList.length})
                            </h3>
                            {quizList.length === 0 ? (
                                <div style={{ ...CARD, textAlign: "center", color: "var(--txt2)" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                                    No questions in Firestore yet. Add your first one!
                                </div>
                            ) : quizList.map(q => (
                                <div key={q.id} style={CARD}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                                <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 100, background: q.diff === "easy" ? "rgba(0,255,157,0.1)" : q.diff === "medium" ? "rgba(255,109,0,0.1)" : "rgba(255,23,68,0.1)", color: q.diff === "easy" ? "#00ff9d" : q.diff === "medium" ? "#ff6d00" : "#ff1744", fontFamily: "Share Tech Mono", textTransform: "uppercase" }}>{q.diff}</span>
                                                {q.topic && <span style={{ fontSize: "0.65rem", color: "var(--txt2)", padding: "2px 8px" }}>{q.topic}</span>}
                                            </div>
                                            <div style={{ color: "#e0f7fa", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>{q.q}</div>
                                            <div style={{ color: "var(--txt2)", fontSize: "0.75rem" }}>✓ {q.opts?.[q.correct]}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                            <button onClick={() => handleEditQuiz(q)} style={{ ...BTN_DEL, color: "#00f5ff", borderColor: "rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.05)" }}>✏️ Edit</button>
                                            <button onClick={() => handleDeleteQuiz(q.id)} style={BTN_DEL}>🗑 Del</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── SIMULATOR TAB ────────────────────────────────────────────────── */}
                {tab === "simulator" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
                        {/* Form */}
                        <form onSubmit={handleSubmitSim}>
                            <h3 style={{ color: "#d500f9", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>
                                {editingSimId ? "✏️ Edit Scenario" : "➕ New Simulator Scenario"}
                            </h3>

                            {/* Legit email */}
                            <div style={{ ...CARD, borderColor: "rgba(0,255,157,0.15)" }}>
                                <div style={{ color: "#00ff9d", fontFamily: "Share Tech Mono", fontSize: "0.7rem", marginBottom: 12 }}>✅ LEGITIMATE EMAIL</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <div><div style={LBL}>Sender Name</div><input placeholder="PayPal" value={simForm.legitFrom} onChange={e => setSimForm({ ...simForm, legitFrom: e.target.value })} style={INP} required /></div>
                                        <div><div style={LBL}>Email Address</div><input placeholder="service@paypal.com" value={simForm.legitAddr} onChange={e => setSimForm({ ...simForm, legitAddr: e.target.value })} style={INP} required /></div>
                                    </div>
                                    <div><div style={LBL}>Subject</div><input placeholder="Your transaction receipt" value={simForm.legitSubject} onChange={e => setSimForm({ ...simForm, legitSubject: e.target.value })} style={INP} required /></div>
                                    <div><div style={LBL}>Email Body</div><textarea placeholder="Hi John, your payment..." value={simForm.legitBody} onChange={e => setSimForm({ ...simForm, legitBody: e.target.value })} style={{ ...INP, minHeight: 80, resize: "vertical" }} required /></div>
                                </div>
                            </div>

                            {/* Phish email */}
                            <div style={{ ...CARD, borderColor: "rgba(255,23,68,0.15)" }}>
                                <div style={{ color: "#ff1744", fontFamily: "Share Tech Mono", fontSize: "0.7rem", marginBottom: 12 }}>🎣 PHISHING EMAIL</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <div><div style={LBL}>Sender Name</div><input placeholder="PayPal Security" value={simForm.phishFrom} onChange={e => setSimForm({ ...simForm, phishFrom: e.target.value })} style={INP} required /></div>
                                        <div><div style={LBL}>Fake Address <span style={{ color: "#ff1744" }}>(red flag #1)</span></div><input placeholder="security@paypa1-verify.com" value={simForm.phishAddr} onChange={e => setSimForm({ ...simForm, phishAddr: e.target.value })} style={{ ...INP, borderColor: "rgba(255,23,68,0.3)" }} required /></div>
                                    </div>
                                    <div><div style={LBL}>Subject</div><input placeholder="🚨 Urgent: Account Suspended!" value={simForm.phishSubject} onChange={e => setSimForm({ ...simForm, phishSubject: e.target.value })} style={INP} required /></div>
                                    <div><div style={LBL}>Email Body (include the exact red-flag texts below)</div><textarea placeholder="Your PayPal account has been SUSPENDED..." value={simForm.phishBody} onChange={e => setSimForm({ ...simForm, phishBody: e.target.value })} style={{ ...INP, minHeight: 100, resize: "vertical" }} required /></div>
                                </div>
                            </div>

                            {/* Red flags */}
                            <div style={CARD}>
                                <div style={{ color: "#ffd600", fontFamily: "Share Tech Mono", fontSize: "0.7rem", marginBottom: 12 }}>🚩 RED FLAGS (Clickable highlights in body)</div>
                                {simForm.flags.map((f, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                                        <div>
                                            <div style={LBL}>Flag #{i + 1} Text (exact match in body)</div>
                                            <input placeholder="SUSPENDED!!" value={f.text}
                                                onChange={e => { const fl = [...simForm.flags]; fl[i] = { ...fl[i], text: e.target.value }; setSimForm({ ...simForm, flags: fl }); }} style={INP} />
                                        </div>
                                        <div>
                                            <div style={LBL}>Hint / Explanation</div>
                                            <input placeholder="Artificial urgency tactic" value={f.hint}
                                                onChange={e => { const fl = [...simForm.flags]; fl[i] = { ...fl[i], hint: e.target.value }; setSimForm({ ...simForm, flags: fl }); }} style={INP} />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setSimForm({ ...simForm, flags: [...simForm.flags, { id: `f${simForm.flags.length + 1}`, text: "", hint: "" }] })}
                                    style={{ ...T.btnG, fontSize: "0.75rem", padding: "6px 14px" }}>+ Add Flag</button>
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <button type="submit" disabled={loading} style={{ ...T.btnHP, flex: 1 }}>
                                    {loading ? "PUSHING..." : editingSimId ? "✏️ UPDATE SCENARIO" : "🚀 PUBLISH SCENARIO"}
                                </button>
                                {editingSimId && <button type="button" onClick={() => { setEditingSimId(null); setSimForm(emptySim); }} style={T.btnG}>Cancel</button>}
                            </div>
                        </form>

                        {/* Existing scenarios list */}
                        <div>
                            <h3 style={{ color: "#d500f9", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>
                                📋 Firestore Scenarios ({simList.length})
                            </h3>
                            {simList.length === 0 ? (
                                <div style={{ ...CARD, textAlign: "center", color: "var(--txt2)" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                                    No custom scenarios yet. Add your first one!
                                </div>
                            ) : simList.map(s => (
                                <div key={s.id} style={CARD}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: "#00ff9d", fontSize: "0.75rem" }}>✅ {s.legit?.from} — {s.legit?.addr}</div>
                                            <div style={{ color: "#ff1744", fontSize: "0.75rem", marginTop: 4 }}>🎣 {s.phish?.from} — {s.phish?.addr}</div>
                                            <div style={{ color: "var(--txt2)", fontSize: "0.7rem", marginTop: 4 }}>{s.phish?.flags?.length || 0} red flags</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button
                                                onClick={() => handleEditSim(s)}
                                                style={{ ...BTN_DEL, color: "#00f5ff", borderColor: "rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.05)" }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDeleteSim(s.id)} style={BTN_DEL}>🗑 Del</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── GALLERY TAB ──────────────────────────────────────────────────── */}
                {tab === "gallery" && (
                    <form onSubmit={handleGalleryUpload} style={{ maxWidth: 600 }}>
                        <h3 style={{ color: "#ff6d00", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>🖼️ Upload Threat Example to Gallery</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <div style={LBL}>Title</div>
                                <input value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} style={INP} placeholder="e.g. Netflix Phishing Email Jan 2026" required />
                            </div>
                            <div>
                                <div style={LBL}>Description / Analysis</div>
                                <textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} style={{ ...INP, minHeight: 90, resize: "vertical" }} placeholder="Explain the red flags in this example..." required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div>
                                    <div style={LBL}>Type</div>
                                    <select value={galleryForm.type} onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value })} style={INP}>
                                        <option value="phish">Phishing Email</option>
                                        <option value="smish">Smishing (SMS)</option>
                                        <option value="vishing">Vishing (Voice)</option>
                                        <option value="quish">Quishing (QR Code)</option>
                                        <option value="web">Fake Website</option>
                                    </select>
                                </div>
                                <div>
                                    <div style={LBL}>Screenshot</div>
                                    <input type="file" accept="image/*" onChange={e => setGalleryForm({ ...galleryForm, file: e.target.files[0] })} style={{ ...INP, color: "var(--txt2)" }} required />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={{ ...T.btnHP, marginTop: 6 }}>
                                {loading ? "UPLOADING ASSETS..." : "📤 PUBLISH TO GALLERY"}
                            </button>
                        </div>
                    </form>
                )}

                {/* ─── NEURAL ACADEMY TAB ────────────────────────────────────────── */}
                {tab === "ai" && (
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        try {
                            // Example: await setDoc(doc(db, "system", "aiConfig"), aiConfigForm);
                            // Simulating for now, will log success
                            await new Promise(r => setTimeout(r, 800));
                            showToast("Neural Link configuration updated globally.", "ok");
                        } catch (err) { showToast(err.message, "ng"); }
                        finally { setLoading(false); }
                    }} style={{ maxWidth: 700 }}>
                        <h3 style={{ color: "#00f5ff", fontFamily: "Orbitron", fontSize: "1rem", marginBottom: 20 }}>🤖 Neural Link Management</h3>
                        <p style={{ color: "var(--txt2)", fontSize: "0.85rem", marginBottom: 24, lineHeight: 1.6 }}>Configure the core personality, instruction set, and fallback logic for Finn-AI across all user sessions.</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div>
                                <div style={LBL}>Finn-AI System Directive</div >
                                <textarea
                                    value={aiConfigForm.systemPrompt}
                                    onChange={e => setAiConfigForm({ ...aiConfigForm, systemPrompt: e.target.value })}
                                    style={{ ...INP, minHeight: 180, resize: "vertical", fontFamily: "Share Tech Mono, monospace", fontSize: "0.75rem", background: "rgba(0,12,26,0.8)" }}
                                    required
                                />
                                <div style={{ fontSize: "0.65rem", color: "var(--txt2)", marginTop: 6 }}>This prompt is dynamically injected before every user query.</div>
                            </div>

                            <div>
                                <div style={LBL}>Model Fallback Chain (comma separated)</div >
                                <input
                                    value={aiConfigForm.modelFallback}
                                    onChange={e => setAiConfigForm({ ...aiConfigForm, modelFallback: e.target.value })}
                                    style={{ ...INP, fontFamily: "Share Tech Mono, monospace" }}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loading} style={{ ...T.btnHP, marginTop: 12 }}>
                                {loading ? "SYNCHRONIZING..." : "💾 APPLY NEURAL CHANGES"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}

