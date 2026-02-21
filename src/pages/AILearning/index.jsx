import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "../../styles";
import { MODULES } from "../../constants";
import { useAuth, useUser } from "../../context";
import { useToast } from "../../hooks/useToast";
import { Finn } from "../../components";
import {
    logPlatformAction,
    saveTrainingModuleProgress,
    signInGuest,
} from "../../firebase";

const XP_BY_DIFFICULTY = {
    Easy: 80,
    Medium: 120,
    Hard: 180,
    Expert: 240,
};
const USECURE_PLAYLIST_URL = "https://www.usecure.io/video/security-awareness-videos";
const USECURE_VIDEO_RESOURCES_URL = "https://www.usecure.io/en/thank-you/security-awareness-month";
const USECURE_TOOLKIT_URL = "https://www.usecure.io/kits/anti-phishing";

const TERM_DEFINITIONS = {
    "Header Analysis": "Inspect sender headers to verify if an email path is legitimate or spoofed.",
    Spoofing: "Impersonating a trusted sender, domain, or identity to trick users.",
    Urgency: "Pressure language that pushes immediate action without verification.",
    Grammar: "Unnatural phrasing and errors often indicate malicious or rushed phishing content.",
    Tone: "Mismatch between expected tone and message style can reveal impersonation.",
    "Link Mismatch": "Visible link text differs from the real destination URL.",
    "Short URLs": "Compressed links that hide destination domains and risk indicators.",
    "OTP Fraud": "Attackers trick users into sharing one-time passwords for account takeover.",
    "Mobile Spoofing": "Faked sender IDs in SMS or calls to appear trusted.",
    Typosquatting: "Lookalike domains with small spelling changes to mimic legitimate sites.",
    Homograph: "Unicode character substitution to make fake domains look real.",
    "Subdomain Tricks": "Using deceptive subdomains to hide malicious root domains.",
    "Macro Abuse": "Malicious scripts in documents triggered by enabling macros.",
    "File Spoofing": "Disguising harmful files with fake names/icons/extensions.",
    Sandboxing: "Opening unknown files in an isolated environment before trusting them.",
    OSINT: "Open-source intelligence used by attackers to personalize phishing.",
    Pretext: "A fabricated scenario created to gain trust and sensitive info.",
    Impersonation: "Pretending to be a trusted person, team, or authority.",
    "Executive Fraud": "Impersonating senior leaders to force urgent payments/actions.",
    "Payment Redirect": "Changing beneficiary/payment details to attacker accounts.",
    "Invoice Scam": "Fake or altered invoices sent to trigger fraudulent transfers.",
    Containment: "Immediate actions to stop spread and reduce ongoing incident impact.",
    Escalation: "Routing incidents quickly to security owners and response teams.",
    Reporting: "Documenting and submitting incidents for investigation and compliance.",
    MFA: "Multi-factor authentication adds a second verification layer beyond passwords.",
    "Password Hygiene": "Strong unique passwords managed safely to reduce compromise risk.",
    "Session Security": "Monitoring and revoking suspicious sessions/tokens to prevent takeover.",
    Vishing: "Voice phishing where attackers use calls to manipulate victims.",
    "Deepfake Voice": "AI-generated voices used to imitate trusted individuals.",
    "Multi-Channel Ops": "Coordinated attacks across email, SMS, chat, and phone.",
};

export function AILearningPage() {
    const { user } = useAuth();
    const { profile, awardXP, refreshProfile } = useUser();
    const { showToast } = useToast();
    const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0]?.id);
    const [chatOpen, setChatOpen] = useState(false);
    const [resourceViewer, setResourceViewer] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "ai",
            text: "Finn AI online. Ask for phishing analysis, training tips, or response playbooks.",
        },
    ]);
    const chatEndRef = useRef(null);
    const level = profile?.level || 1;
    const trainingProgress = profile?.trainingProgress || {};

    const selectedModule = useMemo(
        () => MODULES.find((m) => m.id === selectedModuleId) || MODULES[0],
        [selectedModuleId]
    );

    const supplementalResources = useMemo(() => {
        if (!selectedModule) return [];
        const queryBase = encodeURIComponent(`${selectedModule.name} cybersecurity training`);
        const labQuery = encodeURIComponent(`${selectedModule.name} phishing lab walkthrough`);

        return [
            {
                id: `${selectedModule.id}-deepdive-video`,
                type: "video",
                title: `${selectedModule.name} Deep Dive (YouTube)`,
                url: `https://www.youtube.com/results?search_query=${queryBase}`,
            },
            {
                id: `${selectedModule.id}-glossary`,
                type: "glossary",
                title: "Cybersecurity Terms Glossary (NIST)",
                url: "https://csrc.nist.gov/glossary",
            },
            {
                id: `${selectedModule.id}-reference`,
                type: "reference",
                title: "OWASP Top 10 Reference",
                url: "https://owasp.org/www-project-top-ten/",
            },
            {
                id: `${selectedModule.id}-lab`,
                type: "lab",
                title: "Hands-on Lab Walkthrough",
                url: `https://www.youtube.com/results?search_query=${labQuery}`,
            },
        ];
    }, [selectedModule]);

    const selectedResources = useMemo(() => {
        if (!selectedModule) return [];
        const merged = [
            {
                id: `${selectedModule.id}-usecure-playlist`,
                type: "playlist",
                title: "uSecure Security Awareness Video Playlist",
                url: USECURE_PLAYLIST_URL,
            },
            {
                id: `${selectedModule.id}-usecure-library`,
                type: "video",
                title: "uSecure Cyber Awareness Video Library",
                url: USECURE_VIDEO_RESOURCES_URL,
            },
            {
                id: `${selectedModule.id}-usecure-toolkit`,
                type: "guide",
                title: "uSecure Anti-Phishing Toolkit",
                url: USECURE_TOOLKIT_URL,
            },
            ...(selectedModule.resources || []),
            ...supplementalResources,
            {
                id: `${selectedModule.id}-quick-lesson`,
                type: "lesson",
                title: "Easy Module Summary (In-App)",
                content: [
                    selectedModule.desc,
                    selectedModule.tip,
                    `Focus on these topics: ${selectedModule.topics.join(", ")}.`,
                ],
            },
            {
                id: `${selectedModule.id}-playbook`,
                type: "playbook",
                title: "Response Playbook (In-App)",
                content: [
                    "Stop and verify before taking action.",
                    "Confirm request using a trusted secondary channel.",
                    "Report suspicious content and preserve evidence.",
                    "Reset credentials if any risky interaction occurred.",
                ],
            },
        ];
        const seen = new Set();
        return merged.filter((r) => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
        });
    }, [selectedModule, supplementalResources]);

    const completedCount = MODULES.filter((m) => trainingProgress[m.id]?.completed).length;
    const isModuleUnlocked = (moduleId) => {
        const moduleIndex = MODULES.findIndex((m) => m.id === moduleId);
        if (moduleIndex <= 0) return true;

        const module = MODULES[moduleIndex];
        if (level >= (module?.reqLevel || 1)) return true;

        const previousModule = MODULES[moduleIndex - 1];
        return Boolean(trainingProgress[previousModule?.id]?.completed);
    };
    const selectedProgress = trainingProgress[selectedModule?.id] || null;
    const selectedLocked = selectedModule ? !isModuleUnlocked(selectedModule.id) : false;
    const selectedCompleted = Boolean(selectedProgress?.completed);
    const selectedOpenedIds = new Set((selectedProgress?.openedResources || []).map((r) => r.id));
    const selectedOpenedCount = selectedProgress?.resourcesOpenedCount || 0;
    const selectedResourceCount = selectedResources.length || 0;
    const selectedResourcePct = selectedCompleted
        ? 100
        : selectedResourceCount > 0
            ? Math.round((selectedOpenedCount / selectedResourceCount) * 100)
            : 0;
    const selectedGlossary = (selectedModule?.topics || []).map((topic) => ({
        term: topic,
        definition: TERM_DEFINITIONS[topic] || "Security concept relevant to this module.",
    }));

    useEffect(() => {
        if (!selectedModule) return;
        if (!isModuleUnlocked(selectedModule.id)) {
            const firstUnlocked = MODULES.find((m) => isModuleUnlocked(m.id));
            if (firstUnlocked) setSelectedModuleId(firstUnlocked.id);
        }
    }, [level, selectedModule, trainingProgress]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, chatLoading]);

    const callGemini = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return "Neural link is offline because VITE_GEMINI_API_KEY is missing.";
        }

        const modelSequence = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-flash",
        ];

        for (const modelId of modelSequence) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text:
                                                "You are Finn AI, a cybersecurity trainer focused on phishing defense. " +
                                                "Give practical and concise advice. User query: " +
                                                prompt,
                                        },
                                    ],
                                },
                            ],
                        }),
                    }
                );

                const data = await response.json();
                if (data?.error) {
                    if (data.error.code === 429 || data.error.code === 404) continue;
                    return `AI error: ${data.error.message}`;
                }

                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            } catch {
                // Try next model
            }
        }

        return "All AI models are temporarily unavailable. Please retry in a minute.";
    };

    const handleOpenResource = async (resource) => {
        if (!user || !selectedModule || selectedLocked) return;
        const hasExternalUrl = Boolean(resource.url);

        if (hasExternalUrl) {
            window.open(resource.url, "_blank", "noopener,noreferrer");
        } else {
            setResourceViewer({
                ...resource,
                content: resource.content || [
                    `Module: ${selectedModule.name}`,
                    `Resource type: ${resource.type.toUpperCase()}`,
                    `Why this helps: strengthens understanding of ${selectedModule.topics.join(", ")}.`,
                    "Complete this lesson and continue with the next module resource.",
                ],
            });
        }

        try {
            await saveTrainingModuleProgress({
                uid: user.uid,
                moduleId: selectedModule.id,
                moduleName: selectedModule.name,
                completed: false,
                resourceId: resource.id,
                resourceType: resource.type,
                resourceTitle: resource.title,
                resourcesTotal: selectedResourceCount,
                notes: `Opened ${resource.type}: ${resource.title}`,
            });
            await refreshProfile();
            showToast(
                hasExternalUrl
                    ? `${resource.type.toUpperCase()} link opened and progress updated.`
                    : `${resource.type.toUpperCase()} opened and progress updated.`,
                "ok"
            );
        } catch (e) {
            showToast(e.message || "Could not save resource activity.", "ng");
        }
    };

    const handleCompleteModule = async () => {
        if (!user || !selectedModule || selectedLocked) return;
        if (selectedCompleted) {
            showToast("This module is already completed.", "inf");
            return;
        }

        const xpGain = XP_BY_DIFFICULTY[selectedModule.diff] || 120;
        let completedSaved = false;
        try {
            await saveTrainingModuleProgress({
                uid: user.uid,
                moduleId: selectedModule.id,
                moduleName: selectedModule.name,
                completed: true,
                resourcesTotal: selectedResourceCount,
                resourceType: "completion",
                xpEarned: xpGain,
                notes: "Completed from Neural Academy.",
            });
            completedSaved = true;
        } catch (e) {
            showToast(e.message || "Could not save module completion.", "ng");
            return;
        }

        try {
            await awardXP(xpGain);
        } catch (e) {
            console.warn("Failed to award XP:", e);
        }

        try {
            await logPlatformAction(user.uid, "TRAINING_COMPLETION_CLICKED", {
                moduleId: selectedModule.id,
                xpGain,
            });
        } catch (e) {
            console.warn("Failed to log completion action:", e);
        }

        try {
            await refreshProfile();
        } catch (e) {
            console.warn("Failed to refresh profile after module completion:", e);
        }

        if (completedSaved) {
            showToast(`Module completed. +${xpGain} XP awarded.`, "ok");
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading || !user) return;

        const prompt = chatInput.trim();
        setChatMessages((prev) => [...prev, { role: "user", text: prompt }]);
        setChatInput("");
        setChatLoading(true);

        try {
            await logPlatformAction(user.uid, "AI_QUERY_SENT", {
                moduleId: selectedModule?.id || null,
                length: prompt.length,
            });
            const responseText = await callGemini(prompt);
            setChatMessages((prev) => [...prev, { role: "ai", text: responseText }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (!user) {
        return (
            <div
                style={{
                    ...T.page,
                    background: "transparent",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: 40,
                        maxWidth: 460,
                        background: "rgba(0,8,18,0.85)",
                        border: "1px solid rgba(0,245,255,0.15)",
                        borderRadius: 16,
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>ðŸ¢</div>
                    <div
                        style={{
                            fontFamily: "Orbitron, sans-serif",
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            marginBottom: 12,
                            color: "#00f5ff",
                        }}
                    >
                        Neural Academy Requires Sign In
                    </div>
                    <p
                        style={{
                            color: "var(--txt2)",
                            fontSize: "0.9rem",
                            lineHeight: 1.7,
                            marginBottom: 24,
                        }}
                    >
                        Sign in to unlock video training, module completion tracking, and AI-assisted coaching.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            style={{ ...T.btnHP, minWidth: 150 }}
                            onClick={() => document.querySelector(".pg-login-btn")?.click?.()}
                        >
                            Sign In
                        </button>
                        <button style={{ ...T.btnG }} onClick={signInGuest}>
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...T.page, background: "transparent", overflowX: "hidden" }}>
            <section className="pg-container" style={{ ...T.sec, maxWidth: 1200, margin: "0 auto", padding: "80px 20px 60px" }}>
                <div style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
                    <div>
                        <div style={T.secLbl}>// NEURAL ACADEMY</div>
                        <h1 style={T.secTitle}>Training Modules</h1>
                        <p style={{ color: "var(--txt2)" }}>
                            {completedCount}/{MODULES.length} modules completed. Progress is synced to your profile.
                        </p>
                    </div>
                </div>

                <div className="academy-grid" style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20 }}>
                    <aside style={{ ...T.card, padding: 16 }}>
                        <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 14 }}>// MODULE LIST</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {MODULES.map((module) => {
                                const locked = !isModuleUnlocked(module.id);
                                const done = Boolean(trainingProgress[module.id]?.completed);
                                const active = selectedModuleId === module.id;
                                const moduleIndex = MODULES.findIndex((m) => m.id === module.id);
                                const previousDone = moduleIndex > 0
                                    ? Boolean(trainingProgress[MODULES[moduleIndex - 1].id]?.completed)
                                    : true;

                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => setSelectedModuleId(module.id)}
                                        style={{
                                            textAlign: "left",
                                            borderRadius: 8,
                                            border: active
                                                ? "1px solid rgba(0,245,255,0.5)"
                                                : "1px solid rgba(255,255,255,0.08)",
                                            background: active
                                                ? "rgba(0,245,255,0.08)"
                                                : "rgba(0,0,0,0.2)",
                                            padding: "12px 10px",
                                            color: locked ? "var(--txt2)" : "#fff",
                                            cursor: "pointer",
                                            opacity: locked ? 0.6 : 1,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                                {module.icon} {module.name}
                                            </span>
                                            <span style={{ fontSize: "0.72rem", color: done ? "#00ff9d" : locked ? "var(--txt2)" : "#00f5ff" }}>
                                                {done ? "Done" : locked ? (previousDone ? `L${module.reqLevel}` : "Prev") : "Open"}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.7rem", marginTop: 6, color: "var(--txt2)" }}>
                                            {module.time} Â· {module.diff}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <div style={{ ...T.card, padding: 26 }}>
                        {selectedModule && (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ ...T.secLbl, fontSize: "0.68rem", marginBottom: 8 }}>
                                            // {selectedModule.diff.toUpperCase()} MODULE
                                        </div>
                                        <h2 style={{ fontFamily: "Orbitron, sans-serif", color: "#00f5ff", marginBottom: 10 }}>
                                            {selectedModule.icon} {selectedModule.name}
                                        </h2>
                                        <p style={{ color: "#e0f7fa", lineHeight: 1.6, maxWidth: 700 }}>
                                            {selectedModule.desc}
                                        </p>
                                    </div>
                                    <div style={{ minWidth: 140, textAlign: "right" }}>
                                        <div style={{ fontSize: "0.7rem", color: "var(--txt2)", marginBottom: 4 }}>
                                            Status
                                        </div>
                                        <div style={{ color: selectedCompleted ? "#00ff9d" : selectedLocked ? "#ff6d00" : "#00f5ff", fontWeight: 700 }}>
                                            {selectedCompleted
                                                ? "Completed"
                                                : selectedLocked
                                                    ? `Locked (Complete previous module or reach Level ${selectedModule.reqLevel})`
                                                    : "In Progress"}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: 18,
                                        background: "rgba(0,255,157,0.08)",
                                        border: "1px solid rgba(0,255,157,0.2)",
                                        borderRadius: 8,
                                        padding: 12,
                                        color: "#00ff9d",
                                        fontFamily: "Share Tech Mono, monospace",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {selectedModule.tip}
                                </div>

                                <div style={{ marginTop: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--txt2)", marginBottom: 6 }}>
                                        <span>Resource Progress</span>
                                        <span>{selectedOpenedCount}/{selectedResourceCount}</span>
                                    </div>
                                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${selectedResourcePct}%`, height: "100%", background: "linear-gradient(90deg,#00f5ff,#00ff9d)" }} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <h3 style={{ color: "var(--txt2)", fontSize: "0.74rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                                        Key Cyber Terms
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="terms-grid">
                                        {selectedGlossary.map((item) => (
                                            <div key={item.term} style={{ border: "1px solid rgba(0,245,255,0.12)", borderRadius: 6, padding: "8px 10px", background: "rgba(0,245,255,0.03)" }}>
                                                <div style={{ color: "#00f5ff", fontSize: "0.74rem", fontWeight: 700 }}>{item.term}</div>
                                                <div style={{ color: "var(--txt2)", fontSize: "0.68rem", marginTop: 4, lineHeight: 1.5 }}>{item.definition}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="resource-grid">
                                    {selectedResources.map((resource) => (
                                        <button
                                            key={resource.id}
                                            disabled={selectedLocked}
                                            onClick={() => handleOpenResource(resource)}
                                            style={{
                                                ...T.btnG,
                                                justifyContent: "space-between",
                                                opacity: selectedLocked ? 0.5 : 1,
                                                pointerEvents: selectedLocked ? "none" : "auto",
                                            }}
                                        >
                                            <span>{resource.title}</span>
                                            <span>{selectedOpenedIds.has(resource.id) ? "Opened" : resource.url ? "OPEN" : "IN-APP"}</span>
                                        </button>
                                    ))}
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <h3 style={{ color: "var(--txt2)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                                        Practical Drill
                                    </h3>
                                    <div style={{ display: "grid", gap: 8 }}>
                                        {selectedModule.drill.map((step, idx) => (
                                            <div
                                                key={step}
                                                style={{
                                                    padding: "10px 12px",
                                                    background: "rgba(0,245,255,0.04)",
                                                    border: "1px solid rgba(0,245,255,0.12)",
                                                    borderRadius: 6,
                                                    fontSize: "0.82rem",
                                                    color: "#e0f7fa",
                                                }}
                                            >
                                                {idx + 1}. {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--txt2)" }}>
                                        Reward: +{XP_BY_DIFFICULTY[selectedModule.diff] || 120} XP on first completion
                                    </div>
                                    <button
                                        onClick={handleCompleteModule}
                                        disabled={selectedLocked || selectedCompleted}
                                        style={{
                                            ...T.btnHP,
                                            opacity: selectedLocked || selectedCompleted ? 0.55 : 1,
                                            pointerEvents: selectedLocked || selectedCompleted ? "none" : "auto",
                                        }}
                                    >
                                        {selectedCompleted ? "Completed" : "Mark as Completed"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {chatOpen && (
                <div
                    style={{
                        position: "fixed",
                        right: 16,
                        bottom: 20,
                        width: "min(360px, calc(100vw - 24px))",
                        height: "min(560px, calc(100vh - 90px))",
                        background: "rgba(0,12,26,0.98)",
                        border: "1px solid rgba(0,245,255,0.35)",
                        borderRadius: 12,
                        zIndex: 2000,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,245,255,0.16)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Share Tech Mono, monospace", color: "#00f5ff", fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                            FINN COMPANION
                        </span>
                        <button onClick={() => setChatOpen(false)} style={{ ...T.btnG, padding: "4px 10px", fontSize: "0.72rem" }}>
                            Close
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        {chatMessages.map((m, idx) => (
                            <div
                                key={`${m.role}-${idx}`}
                                style={{
                                    alignSelf: m.role === "ai" ? "flex-start" : "flex-end",
                                    maxWidth: "90%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    background: m.role === "ai" ? "rgba(0,245,255,0.08)" : "rgba(213,0,249,0.14)",
                                    border: `1px solid ${m.role === "ai" ? "rgba(0,245,255,0.22)" : "rgba(213,0,249,0.34)"}`,
                                    color: m.role === "ai" ? "#dffaff" : "#fff",
                                    fontSize: "0.84rem",
                                    lineHeight: 1.5,
                                }}
                            >
                                {m.text}
                            </div>
                        ))}
                        {chatLoading && (
                            <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono, monospace", fontSize: "0.72rem" }}>
                                Finn AI is analyzing...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={{ padding: 12, borderTop: "1px solid rgba(0,245,255,0.16)", display: "flex", gap: 8 }}>
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={chatLoading}
                            placeholder="Ask about phishing, response, or verification..."
                            style={{
                                flex: 1,
                                background: "rgba(0,0,0,0.3)",
                                border: "1px solid rgba(0,245,255,0.25)",
                                color: "#fff",
                                borderRadius: 4,
                                padding: "10px 12px",
                                fontSize: "0.82rem",
                            }}
                        />
                        <button type="submit" disabled={chatLoading} style={{ ...T.btnHP, padding: "0 16px" }}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            {resourceViewer && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                    <div style={{ width: "min(720px, 100%)", maxHeight: "80vh", overflowY: "auto", background: "rgba(0,12,26,0.98)", border: "1px solid rgba(0,245,255,0.3)", borderRadius: 10, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <h3 style={{ color: "#00f5ff", margin: 0, fontFamily: "Orbitron, sans-serif", fontSize: "1rem" }}>{resourceViewer.title}</h3>
                            <button onClick={() => setResourceViewer(null)} style={{ ...T.btnG, padding: "6px 10px", fontSize: "0.72rem" }}>Close</button>
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                            {(resourceViewer.content || []).map((line) => (
                                <div key={line} style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)", borderRadius: 6, padding: "10px 12px", color: "#e0f7fa", fontSize: "0.82rem", lineHeight: 1.6 }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                        {resourceViewer.url && (
                            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => window.open(resourceViewer.url, "_blank", "noopener,noreferrer")}
                                    style={{ ...T.btnHP, padding: "8px 12px", fontSize: "0.78rem" }}
                                >
                                    Open External Source
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!chatOpen && (
                <Finn
                    tip={`Need help with ${selectedModule?.name}? Tap me to open AI chat.`}
                    onClick={() => setChatOpen(true)}
                />
            )}

            <style>{`
                @media (max-width: 900px) {
                    .academy-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    .pg-container { padding: 40px 10px !important; }
                    .resource-grid { grid-template-columns: 1fr !important; }
                    .terms-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

