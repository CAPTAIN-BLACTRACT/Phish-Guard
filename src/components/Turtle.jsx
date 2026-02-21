/**
 * Realistic 3D Robot Mascot (Finn)
 */
export function Turtle({ tip, onClick }) {
  return (
    <div
      className="pg-turtle-wrap"
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "18px",
        right: "20px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        cursor: "pointer",
        animation: "turtleBob 3s ease-in-out infinite",
      }}
    >
      {tip && (
        <div
          className="pg-turtle-tip"
          style={{
            background: "rgba(0, 8, 18, 0.95)",
            border: "1.5px solid #00f5ff",
            borderRadius: "16px 16px 0 16px",
            padding: "10px 14px",
            maxWidth: "180px",
            marginBottom: "6px",
            boxShadow: "0 0 25px rgba(0, 245, 255, 0.25)",
            position: "relative",
            backdropFilter: "blur(12px)",
            animation: "fuA 0.4s ease-out",
          }}
        >
          <div
            className="pg-turtle-tip-title"
            style={{
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "0.6rem",
              color: "#00f5ff",
              textTransform: "uppercase",
              marginBottom: "4px",
              letterSpacing: "0.8px",
              opacity: 0.8,
            }}
          >
            Finn // AI Advisor
          </div>
          <div
            className="pg-turtle-tip-body"
            style={{
              color: "#e0f7fa",
              fontSize: "0.78rem",
              lineHeight: "1.35",
              fontFamily: "Rajdhani, sans-serif",
              fontWeight: 500,
            }}
          >
            {tip}
          </div>
        </div>
      )}

      <svg className="pg-turtle-bot" width="72" height="80" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="50" y1="45" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DDEEF0" />
          </linearGradient>
          <radialGradient id="faceGrad" cx="50" cy="30" r="25" gradientUnits="userSpaceOnUse">
            <stop offset="60%" stopColor="#0B1A2A" />
            <stop offset="100%" stopColor="#1B3B5A" />
          </radialGradient>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <ellipse cx="50" cy="100" rx="15" ry="4" fill="black" opacity="0.15">
          <animate attributeName="rx" values="15;18;15" dur="3s" repeatCount="indefinite" />
        </ellipse>

        <path d="M30 50 C30 50 20 95 50 95 C80 95 70 50 70 50" fill="url(#bodyGrad)" stroke="#B0C4C7" strokeWidth="0.5" />
        <rect x="18" y="55" width="10" height="22" rx="5" fill="#FFFFFF" transform="rotate(15 18 55)" />
        <rect x="72" y="55" width="10" height="22" rx="5" fill="#FFFFFF" transform="rotate(-15 72 55)" />
        <rect x="20" y="5" width="60" height="48" rx="24" fill="#FFFFFF" stroke="#B0C4C7" strokeWidth="0.5" />
        <rect x="25" y="12" width="50" height="34" rx="17" fill="url(#faceGrad)" />

        <circle cx="40" cy="28" r="4.5" fill="#00f5ff" filter="url(#eyeGlow)">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="28" r="4.5" fill="#00f5ff" filter="url(#eyeGlow)">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>

        <path d="M44 38 Q50 42 56 38" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <rect x="16" y="20" width="8" height="18" rx="4" fill="#A0BCC0" />
        <rect x="76" y="20" width="8" height="18" rx="4" fill="#A0BCC0" />
      </svg>

      <style>{`
        @media (max-width: 768px) {
          .pg-turtle-wrap {
            right: 10px !important;
            bottom: 12px !important;
          }
          .pg-turtle-tip {
            display: block !important;
            max-width: 132px !important;
            padding: 7px 9px !important;
            margin-bottom: 4px !important;
            border-width: 1px !important;
          }
          .pg-turtle-tip-title {
            font-size: 0.48rem !important;
            margin-bottom: 2px !important;
            letter-spacing: 0.5px !important;
          }
          .pg-turtle-tip-body {
            font-size: 0.64rem !important;
            line-height: 1.22 !important;
          }
          .pg-turtle-bot {
            width: 58px !important;
            height: 64px !important;
          }
        }
      `}</style>
    </div>
  );
}
