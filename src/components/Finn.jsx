import { useState, useEffect } from "react";

/**
 * Finn the Fish Mascot
 * An interactive, floating fish that provides cybersecurity tips.
 */
export function Finn({ tip, onClick }) {
    const [hover, setHover] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            style={{
                position: "fixed",
                bottom: 30,
                right: 30,
                zIndex: 5000,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: hover ? "scale(1.1) translateY(-10px)" : "scale(1)",
            }}
        >
            {/* Speech Bubble */}
            {tip && (
                <div
                    style={{
                        background: "rgba(0, 5, 9, 0.95)",
                        border: "1px solid rgba(0, 245, 255, 0.3)",
                        borderRadius: "16px 16px 0 16px",
                        padding: "12px 18px",
                        marginBottom: 12,
                        maxWidth: 240,
                        fontSize: "0.85rem",
                        color: "#e0f7fa",
                        fontFamily: "Share Tech Mono, monospace",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 245, 255, 0.1)",
                        animation: "finnFadeIn 0.3s ease-out",
                        position: "relative",
                    }}
                >
                    <div style={{ color: "#00f5ff", fontWeight: 700, marginBottom: 4, fontSize: "0.7rem", letterSpacing: 1 }}>FINN // ADVISOR</div>
                    {tip}

                    {/* Neural Actions */}
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        {(tip.includes("feedback") || tip.includes("Report")) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); document.querySelector('.intel-report')?.scrollIntoView({ behavior: 'smooth' }); }}
                                style={{ background: "rgba(0,245,255,0.1)", border: "1px solid #00f5ff", color: "#00f5ff", padding: "4px 8px", fontSize: "0.6rem", borderRadius: 4, cursor: "pointer" }}
                            >
                                GIVE FEEDBACK
                            </button>
                        )}
                        {tip.includes("AI Academy") && (
                            <button
                                onClick={(e) => { e.stopPropagation(); window.pgSetPage?.("ai-learning"); }}
                                style={{ background: "rgba(213,0,249,0.1)", border: "1px solid #d500f9", color: "#d500f9", padding: "4px 8px", fontSize: "0.6rem", borderRadius: 4, cursor: "pointer" }}
                            >
                                OPEN ACADEMY
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "#90a4ae", padding: "4px 8px", fontSize: "0.6rem", borderRadius: 4, cursor: "pointer" }}
                        >
                            OK
                        </button>
                    </div>

                    {/* Bubble Pointer */}
                    <div style={{
                        position: "absolute",
                        bottom: -8,
                        right: 12,
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid rgba(0, 245, 255, 0.3)",
                    }} />
                </div>
            )}

            {/* Finn Character (SVG) */}
            <div style={{
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(213, 0, 249, 0.1))",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(0, 245, 255, 0.2)",
                boxShadow: hover ? "0 0 30px rgba(0, 245, 255, 0.3)" : "0 0 15px rgba(0, 245, 255, 0.1)",
                position: "relative",
                animation: "finnFloat 3s ease-in-out infinite",
            }}>
                <svg viewBox="0 0 100 100" width="60" height="60" style={{ filter: "drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))" }}>
                    {/* Simple Abstract Fish Body */}
                    <path
                        d="M20,50 Q20,30 50,30 Q80,30 80,50 Q80,70 50,70 Q20,70 20,50"
                        fill="none"
                        stroke="#00f5ff"
                        strokeWidth="3"
                    />
                    {/* Tail */}
                    <path
                        d="M20,50 L5,40 L5,60 Z"
                        fill="none"
                        stroke="#d500f9"
                        strokeWidth="3"
                    />
                    {/* Eye */}
                    <circle cx="65" cy="45" r="4" fill="#00f5ff">
                        <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
                    </circle>
                    {/* Fins */}
                    <path d="M50,30 L60,20" stroke="#00f5ff" strokeWidth="2" />
                    <path d="M50,70 L60,80" stroke="#00f5ff" strokeWidth="2" />

                    {/* Tech lines */}
                    <line x1="10" y1="10" x2="20" y2="20" stroke="rgba(0, 245, 255, 0.2)" strokeWidth="1" />
                    <line x1="90" y1="90" x2="80" y2="80" stroke="rgba(0, 245, 255, 0.2)" strokeWidth="1" />
                </svg>

                {/* Pulse Ring */}
                <div style={{
                    position: "absolute",
                    inset: -10,
                    border: "1px solid rgba(0, 245, 255, 0.2)",
                    borderRadius: "50%",
                    animation: "finnPulse 2s linear infinite",
                }} />
            </div>

            <style>{`
        @keyframes finnFloat {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes finnPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes finnFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
