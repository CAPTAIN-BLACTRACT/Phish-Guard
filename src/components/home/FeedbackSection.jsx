import React, { useState, useEffect, useRef } from 'react';
import { T } from './styles';

// ─── FEEDBACK SECTION ────────────────────────────────────────────────────────
export function FeedbackSection({ user }) {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | ok | ng

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setStatus("sending");
    try {
      const { submitFeedback } = await import("../../firebase/db");
      await submitFeedback({
        uid: user?.uid,
        email: user?.email,
        message: msg
      });
      setStatus("ok");
      setMsg("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("ng");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="intel-report" style={{ padding: "80px 40px", background: "rgba(0,245,255,0.02)", borderTop: "1px solid rgba(0,245,255,0.05)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={T.secLbl}>// INTEL REPORT</div>
        <h2 style={{ ...T.secTitle, fontSize: "2rem", marginBottom: 12 }}>Platform Feedback</h2>
        <p style={{ color: "var(--txt2)", marginBottom: 32, fontFamily: "Share Tech Mono" }}>Help us strengthen the defense grid by reporting bugs or suggesting features.</p>

        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Transmit your message..."
            disabled={status !== "idle"}
            style={{
              width: "100%", background: "#000a12", border: "1px solid rgba(0,245,255,0.2)",
              color: "#fff", padding: 16, borderRadius: 4, minHeight: 120,
              fontFamily: "Share Tech Mono", fontSize: "0.9rem", resize: "none",
              outline: "none", transition: "border-color .25s"
            }}
          />
          <button
            type="submit"
            disabled={status !== "idle" || !msg.trim()}
            style={{
              ...T.btnHP, width: "100%", justifyContent: "center",
              background: status === "ok" ? "#00ff9d" : (status === "ng" ? "#ff1744" : undefined),
              borderColor: status === "ok" ? "#00ff9d" : (status === "ng" ? "#ff1744" : undefined),
              color: (status === "ok" || status === "ng") ? "#000" : undefined
            }}
          >
            {status === "idle" && "SUBMIT REPORT ➔"}
            {status === "sending" && "TRANSMITTING..."}
            {status === "ok" && "REPORT RECEIVED"}
            {status === "ng" && "TRANSMISSION FAILED"}
          </button>
        </form>
      </div>
    </section>
  );
}
