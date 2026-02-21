import { useEffect, useState } from "react";

/**
 * Finn Robot Mascot
 * Floating robot advisor with contextual tip bubble.
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
        bottom: 24,
        right: 24,
        zIndex: 5000,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        transition: "transform 0.25s ease",
        transform: hover ? "translateY(-6px) scale(1.04)" : "translateY(0) scale(1)",
      }}
    >
      {tip && (
        <div
          style={{
            background: "rgba(0, 8, 18, 0.95)",
            border: "1px solid rgba(0,245,255,0.35)",
            borderRadius: "16px 16px 0 16px",
            padding: "12px 16px",
            marginBottom: 10,
            maxWidth: 240,
            fontSize: "0.84rem",
            color: "#e0f7fa",
            fontFamily: "Share Tech Mono, monospace",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45), 0 0 22px rgba(0,245,255,0.15)",
            animation: "finnFadeIn 0.25s ease-out",
            position: "relative",
          }}
        >
          <div style={{ color: "#00f5ff", fontWeight: 700, marginBottom: 4, fontSize: "0.68rem", letterSpacing: 1 }}>
            FINN // ROBOT ADVISOR
          </div>
          {tip}

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(tip.includes("feedback") || tip.includes("Report")) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  document.querySelector(".intel-report")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "rgba(0,245,255,0.1)",
                  border: "1px solid #00f5ff",
                  color: "#00f5ff",
                  padding: "4px 8px",
                  fontSize: "0.6rem",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                GIVE FEEDBACK
              </button>
            )}
            {tip.includes("AI Academy") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.pgSetPage?.("neural-academy");
                }}
                style={{
                  background: "rgba(213,0,249,0.1)",
                  border: "1px solid #d500f9",
                  color: "#d500f9",
                  padding: "4px 8px",
                  fontSize: "0.6rem",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                OPEN ACADEMY
              </button>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: -8,
              right: 12,
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid rgba(0,245,255,0.35)",
            }}
          />
        </div>
      )}

      <div
        style={{
          width: 76,
          height: 86,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: hover ? "drop-shadow(0 0 20px rgba(0,245,255,0.45))" : "drop-shadow(0 0 10px rgba(0,245,255,0.25))",
          animation: "finnFloat 3s ease-in-out infinite",
        }}
      >
        <svg className="pg-finn-bot" width="72" height="80" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="finnBodyGrad" x1="50" y1="45" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DDEEF0" />
            </linearGradient>
            <radialGradient id="finnFaceGrad" cx="50" cy="30" r="25" gradientUnits="userSpaceOnUse">
              <stop offset="60%" stopColor="#0B1A2A" />
              <stop offset="100%" stopColor="#1B3B5A" />
            </radialGradient>
            <filter id="finnEyeGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <ellipse cx="50" cy="100" rx="15" ry="4" fill="black" opacity="0.15">
            <animate attributeName="rx" values="15;18;15" dur="3s" repeatCount="indefinite" />
          </ellipse>

          <path d="M30 50 C30 50 20 95 50 95 C80 95 70 50 70 50" fill="url(#finnBodyGrad)" stroke="#B0C4C7" strokeWidth="0.5" />
          <rect x="18" y="55" width="10" height="22" rx="5" fill="#FFFFFF" transform="rotate(15 18 55)" />
          <rect x="72" y="55" width="10" height="22" rx="5" fill="#FFFFFF" transform="rotate(-15 72 55)" />
          <rect x="20" y="5" width="60" height="48" rx="24" fill="#FFFFFF" stroke="#B0C4C7" strokeWidth="0.5" />
          <rect x="25" y="12" width="50" height="34" rx="17" fill="url(#finnFaceGrad)" />

          <circle cx="40" cy="28" r="4.5" fill="#00f5ff" filter="url(#finnEyeGlow)">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="28" r="4.5" fill="#00f5ff" filter="url(#finnEyeGlow)">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>

          <path d="M44 38 Q50 42 56 38" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <rect x="16" y="20" width="8" height="18" rx="4" fill="#A0BCC0" />
          <rect x="76" y="20" width="8" height="18" rx="4" fill="#A0BCC0" />
        </svg>
      </div>

      <style>{`
        @keyframes finnFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes finnFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .pg-finn-bot {
            width: 58px !important;
            height: 64px !important;
          }
        }
      `}</style>
    </div>
  );
}
