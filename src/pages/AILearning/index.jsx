import { useState, useRef, useEffect } from "react";
import { T } from '../../styles';


const TUTORIAL_STEPS = [
    {
        icon: "📧",
        title: "Email Phishing Basics",
        desc: "Master the fundamentals of email security. Learn about display name spoofing, urgent language, and suspicious attachments.",
        tip: "Tip: Always check the sender's actual email address, not just the name!"
    },
    {
        icon: "🚩",
        title: "Red Flag Identification",
        desc: "Deep dive into the 6 universal indicators of a phishing attempt. From poor grammar to mismatched links.",
        tip: "Tip: Hover over links to see the real destination in the status bar."
    },
    {
        icon: "📱",
        title: "SMS / Smishing",
        desc: "Learn to identify malicious text messages. Mobile attacks are on the rise and often bypass traditional email filters.",
        tip: "Tip: Banks will never ask for your PIN via text message!"
    },
    {
        icon: "🕵️",
        title: "Spear Phishing",
        desc: "Advanced social engineering targeted at specific individuals. Learn how attackers use OSINT to craft believable lies.",
        tip: "Tip: Be careful what personal information you share on social media."
    },
    {
        icon: "🚀",
        title: "Advanced Social Engineering",
        desc: "The final frontier. Protect against highly sophisticated multi-channel attacks and psychological manipulation.",
        tip: "Tip: Zero-Trust is the only absolute defense—verify everything."
    }
];

const MOCK_RESOURCES = [
    {
        type: "video",
        title: "Anatomy of a Phish",
        desc: "Visual walkthrough of a modern spear-phishing attack.",
        icon: "🎬",
        duration: "4:20"
    },
    {
        type: "infographic",
        title: "The URL Anatomy",
        desc: "Hi-res breakdown of subdomains, paths, and TLDs.",
        icon: "📊",
        size: "2.4 MB"
    }
];

export function AILearningPage() {
    const [view, setView] = useState("chat"); // "chat" | "tutorial"
    const [messages, setMessages] = useState([
        { role: "ai", text: "Welcome, Agent. I am Finn-AI. My neural network is online and ready. How can I assist your training today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const callGemini = async (prompt) => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
            return "ERROR: GEMINI_API_KEY NOT FOUND. Please initialize neural link in .env file.";
        }

        // Ordered fallback list for maximum uptime
        const MODELS = [
            "gemini-1.5-pro",          // Primary Heavy Compute
            "gemini-2.0-flash",        // High Speed Fallback (using existing stable/preview names likely to work)
            "gemini-1.5-flash",        // Efficient Backup
            "gemini-pro-vision"        // Last Resort
        ];

        // The user specifically requested these (using them as fallback if above naming style fails or as preferred sequence)
        const preferredModels = [
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-3-flash-preview"
        ];

        // High-Fidelity Sequence as requested by Agent
        const trialSequence = [
            "gemini-3.1-pro-preview",
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-1.5-pro",     // Proven stable node
            "gemini-1.5-flash"    // High-speed fallback
        ];

        for (const modelId of trialSequence) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are Finn-AI, a high-level cybersecurity neural advisor for PhishGuard. 
                                Your mission is to provide deep technical analysis on phishing, social engineering, and defense strategies.
                                Keep responses concise, formatted for a terminal interface (use 🟢, 🔴, 📡 emojis), and authoritative.
                                
                                Current User Intelligence Request: ${prompt}`
                            }]
                        }]
                    })
                });

                const data = await response.json();

                if (data.error) {
                    // If rate limited or model not found, try next in sequence
                    if (data.error.code === 429 || data.error.status?.includes("RESOURCE_EXHAUSTED") || data.error.code === 404) {
                        console.warn(`Neural Node ${modelId} unavailable. Shifting frequencies...`);
                        continue;
                    }
                    return `NEURAL_FAILURE: ${data.error.message}`;
                }

                return data.candidates[0].content.parts[0].text;
            } catch (err) {
                console.error(`Link failure on ${modelId}:`, err);
                continue; // Try next model on network error
            }
        }

        return "CRITICAL_FAILURE: All neural nodes are currently over-saturated. Please stand by for bandwidth reclamation.";
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const { logPlatformAction } = await import("../../firebase/db");
        logPlatformAction(null, "AI_QUERY_SENT", { length: input.length });

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const aiText = await callGemini(input);
        setMessages(prev => [...prev, { role: "ai", text: aiText }]);
        setLoading(false);
    };

    return (
        <div style={{ ...T.page, background: "transparent" }}>

            <section style={{ ...T.sec, maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div style={T.secLbl}>// NEURAL ACADEMY v2.0</div>
                        <h1 style={T.secTitle}>{view === "chat" ? "AI Intelligence Hub" : "Foundational Training"}</h1>
                        <p style={{ color: "var(--txt2)" }}>Unified training environment with advanced neural integration.</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={() => setView("chat")}
                            style={{ ...T.btnHS, borderColor: view === "chat" ? "#00f5ff" : "rgba(255,255,255,0.1)", color: view === "chat" ? "#00f5ff" : "var(--txt2)" }}
                        >
                            🤖 NEURAL LINK
                        </button>
                        <button
                            onClick={() => setView("tutorial")}
                            style={{ ...T.btnHS, borderColor: view === "tutorial" ? "#00f5ff" : "rgba(255,255,255,0.1)", color: view === "tutorial" ? "#00f5ff" : "var(--txt2)" }}
                        >
                            🎓 MODULES
                        </button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 30, height: "70vh" }}>

                    {/* Left Panel: Content */}
                    <div style={{ ...T.card, display: "flex", flexDirection: "column", background: "rgba(0,12,26,0.8)" }}>
                        {view === "chat" ? (
                            <>
                                <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: loading ? "#ff1744" : "#00ff9d", boxShadow: `0 0 10px ${loading ? "#ff1744" : "#00ff9d"}`, animation: loading ? "pulse 1s infinite" : "none" }}></div>
                                    <span style={{ fontFamily: "Orbitron", fontSize: "0.85rem", color: "#00f5ff" }}>FINN-AI NEURAL LINK [{loading ? "PROCESSING" : "READY"}]</span>
                                </div>

                                <div style={{ flex: 1, padding: 25, overflowY: "auto", display: "flex", flexDirection: "column", gap: 15 }}>
                                    {messages.map((m, i) => (
                                        <div key={i} style={{
                                            alignSelf: m.role === "ai" ? "flex-start" : "flex-end",
                                            maxWidth: "85%",
                                            padding: "14px 20px",
                                            borderRadius: 12,
                                            background: m.role === "ai" ? "rgba(0,245,255,0.08)" : "rgba(213,0,249,0.1)",
                                            border: `1px solid ${m.role === "ai" ? "rgba(0,245,255,0.2)" : "rgba(213,0,249,0.3)"}`,
                                            color: m.role === "ai" ? "#e0f7fa" : "#fff",
                                            fontFamily: m.role === "ai" ? "Share Tech Mono" : "inherit",
                                            fontSize: "0.9rem",
                                            lineHeight: 1.6,
                                            animation: "fuA 0.3s ease both"
                                        }}>
                                            {m.text}
                                        </div>
                                    ))}
                                    {loading && <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono", fontSize: "0.8rem" }}> Finn is parsing data...</div>}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={handleSend} style={{ padding: 20, borderTop: "1px solid rgba(0,245,255,0.1)", display: "flex", gap: 10 }}>
                                    <input
                                        style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: "12px 15px", borderRadius: 4, fontFamily: "inherit" }}
                                        placeholder="Ask Finn-AI about suspicious traffic..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button type="submit" disabled={loading} style={{ ...T.btnHP, padding: "0 25px" }}>{loading ? "..." : "QUERY"}</button>
                                </form>
                            </>
                        ) : (
                            <div style={{ padding: 40, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
                                <div style={{ fontSize: "5rem", marginBottom: 20 }}>{TUTORIAL_STEPS[tutorialStep].icon}</div>
                                <h2 style={{ fontFamily: "Orbitron", color: "#00f5ff", marginBottom: 15 }}>{TUTORIAL_STEPS[tutorialStep].title}</h2>
                                <p style={{ color: "#e0f7fa", fontSize: "1.1rem", marginBottom: 30, lineHeight: 1.6 }}>{TUTORIAL_STEPS[tutorialStep].desc}</p>
                                <div style={{ background: "rgba(0,255,157,0.1)", border: "1px solid #00ff9d", padding: 15, borderRadius: 4, color: "#00ff9d", fontFamily: "Share Tech Mono", marginBottom: 40 }}>
                                    {TUTORIAL_STEPS[tutorialStep].tip}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <button
                                        onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
                                        disabled={tutorialStep === 0}
                                        style={{ ...T.btnHS, opacity: tutorialStep === 0 ? 0.3 : 1 }}
                                    >BACK</button>
                                    <button
                                        onClick={() => setTutorialStep(s => (s + 1) % TUTORIAL_STEPS.length)}
                                        style={T.btnHP}
                                    >NEXT MODULE</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Learning Map Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
                        <div style={{ ...T.card, padding: 20 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 15 }}>// LEARNING MAP</div>
                            {[
                                { name: "Email Phishing Basics", sub: "5 levels completed", status: "done" },
                                { name: "Red Flag Identification", sub: "6 levels completed", status: "done" },
                                { name: "SMS / Smishing", sub: "Level 2 of 5 in progress", status: "active" },
                                { name: "Spear Phishing", sub: "Unlock at Level 10", status: "locked" },
                                { name: "Advanced Social Engineering", sub: "Unlock at Level 15", status: "locked" },
                            ].map((m, i) => {
                                const dc = m.status === "done" ? "#00ff9d" : m.status === "active" ? "#00f5ff" : "var(--txt2)";
                                return (
                                    <div key={i} style={{ marginBottom: 12, opacity: m.status === "locked" ? 0.6 : 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                            <span style={{ fontSize: "0.8rem", color: m.status === "locked" ? "var(--txt2)" : "#fff", fontWeight: 600 }}>{m.name}</span>
                                            <span style={{ fontSize: "0.6rem", color: dc, fontFamily: "Share Tech Mono" }}>
                                                {m.status === "done" ? "✓" : m.status === "active" ? "→" : "🔒"}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.65rem", color: "var(--txt2)", fontFamily: "Share Tech Mono" }}>{m.sub}</div>
                                        <div style={{ height: 2, background: "rgba(255,255,255,0.05)", marginTop: 6, borderRadius: 1, position: "relative" }}>
                                            <div style={{
                                                position: "absolute", left: 0, top: 0, height: "100%",
                                                width: m.status === "done" ? "100%" : (m.status === "active" ? "40%" : "0%"),
                                                background: dc, boxShadow: `0 0 8px ${dc}`
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Achievement Badges */}
                        <div style={{ ...T.card, padding: 20 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 15 }}>// ACTIVE ACHIEVEMENTS</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                                {[
                                    { icon: "🎯", name: "Blood", e: true },
                                    { icon: "⚡", name: "Spotter", e: true },
                                    { icon: "🔗", name: "Draw", e: true },
                                    { icon: "🛡️", name: "Link", e: true },
                                ].map((b, i) => (
                                    <div key={i} style={{
                                        textAlign: "center",
                                        padding: 8,
                                        background: "rgba(0,245,255,0.05)",
                                        border: "1px solid rgba(0,245,255,0.2)",
                                        borderRadius: 4
                                    }}>
                                        <div style={{ fontSize: "1.2rem" }}>{b.icon}</div>
                                        <div style={{ fontSize: "0.5rem", color: "#00f5ff", fontFamily: "Share Tech Mono", marginTop: 4 }}>{b.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 style={{ color: "var(--txt2)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>Multimedia Library</h3>
                        {MOCK_RESOURCES.map((r, i) => (
                            <div key={i} style={{ ...T.card, padding: 20, cursor: "pointer", transition: "all 0.2s" }} className="res-card">
                                <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 12 }}>
                                    <span style={{ fontSize: "1.5rem" }}>{r.icon}</span>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#00f5ff" }}>{r.title}</div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--txt2)" }}>{r.type.toUpperCase()}</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#90a4ae", lineHeight: 1.4 }}>{r.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
            <style>{`
        .res-card:hover { border-color: rgba(0,245,255,0.5) !important; transform: translateX(-5px); background: rgba(0,245,255,0.03) !important; }
      `}</style>
        </div>
    );
}
