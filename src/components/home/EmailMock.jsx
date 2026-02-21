import { ScanLine } from "./ScanLine";

export function EmailMock() {
    return (
        <div
            style={{
                background: "rgba(0,8,18,0.97)",
                border: "1px solid rgba(0,245,255,.2)",
                borderRadius: 6,
                padding: 22,
                width: "100%",
                maxWidth: 400,
                backdropFilter: "blur(24px)",
                position: "relative",
                boxShadow:
                    "0 0 60px rgba(0,245,255,.1),0 40px 80px rgba(0,0,0,.7),inset 0 0 60px rgba(0,245,255,.02)",
                animation: "floatY 4s ease-in-out infinite",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    borderRadius: 6,
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            >
                <ScanLine />
            </div>

            <div
                style={{
                    position: "absolute",
                    top: -10,
                    left: 16,
                    background: "#000509",
                    padding: "0 8px",
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: ".6rem",
                    color: "#00f5ff",
                    letterSpacing: "0.15em",
                    zIndex: 3,
                }}
            >
                THREAT ANALYSIS
            </div>

            {[
                { top: 6, left: 6, borderWidth: "1px 0 0 1px" },
                { top: 6, right: 6, borderWidth: "1px 1px 0 0" },
                { bottom: 6, left: 6, borderWidth: "0 0 1px 1px" },
                { bottom: 6, right: 6, borderWidth: "0 1px 1px 0" },
            ].map((s, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: 12,
                        height: 12,
                        borderColor: "rgba(0,245,255,0.4)",
                        borderStyle: "solid",
                        zIndex: 3,
                        ...s,
                    }}
                />
            ))}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                    position: "relative",
                    zIndex: 4,
                }}
            >
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 4,
                        background: "linear-gradient(135deg,#ff1744,#ff6d00)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".9rem",
                        fontWeight: 700,
                        boxShadow: "0 0 15px rgba(255,23,68,0.4)",
                        flexShrink: 0,
                    }}
                >
                    ⚠
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontFamily: "'Share Tech Mono',monospace",
                            fontSize: ".78rem",
                            color: "var(--txt2)",
                        }}
                    >
                        From:{" "}
                        <strong style={{ color: "#ff1744" }}>billing@paypa1.com</strong>
                    </div>
                    <div style={{ fontSize: ".85rem", fontWeight: 600 }}>
                        🔴 URGENT: Verify Your Account
                    </div>
                </div>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 9px",
                        background: "rgba(255,23,68,.1)",
                        border: "1px solid rgba(255,23,68,.4)",
                        borderRadius: 2,
                        fontSize: ".68rem",
                        color: "#ff1744",
                        fontFamily: "'Share Tech Mono',monospace",
                        animation: "blinkBorder 2s infinite",
                        flexShrink: 0,
                    }}
                >
                    ⚠ SUSPICIOUS
                </div>
            </div>
            <p
                style={{
                    fontSize: ".83rem",
                    lineHeight: 1.7,
                    color: "var(--txt2)",
                    marginBottom: 14,
                    position: "relative",
                    zIndex: 4,
                }}
            >
                Dear valued customer, your account has been{" "}
                <strong style={{ color: "#ff1744" }}>suspended</strong>. Click
                immediately to restore access or lose your funds permanently.
            </p>
            <div
                style={{
                    display: "block",
                    padding: "7px 11px",
                    background: "rgba(255,23,68,.06)",
                    border: "1px solid rgba(255,23,68,.2)",
                    borderRadius: 4,
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: ".74rem",
                    color: "#ff1744",
                    marginBottom: 14,
                    cursor: "pointer",
                    wordBreak: "break-all",
                    position: "relative",
                    zIndex: 4,
                }}
            >
                http://secure-paypal-verify.xyz/login?token=a8c...
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", position: "relative", zIndex: 4 }}>
                {[
                    { label: "⚠ Fake Domain", cls: "red" },
                    { label: "⚠ Urgency", cls: "red" },
                    { label: "🔗 Bad URL", cls: "orange" },
                ].map(({ label, cls }) => (
                    <span
                        key={label}
                        style={{
                            padding: "3px 9px",
                            borderRadius: 2,
                            fontSize: ".68rem",
                            fontFamily: "'Share Tech Mono',monospace",
                            background:
                                cls === "red" ? "rgba(255,23,68,.1)" : "rgba(255,109,0,.1)",
                            border:
                                cls === "red"
                                    ? "1px solid rgba(255,23,68,.35)"
                                    : "1px solid rgba(255,109,0,.35)",
                            color: cls === "red" ? "#ff1744" : "#ff6d00",
                        }}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}
