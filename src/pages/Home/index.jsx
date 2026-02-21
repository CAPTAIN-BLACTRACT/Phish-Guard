import './home.css';
import { useState, useEffect, useRef } from "react";
import { logPlatformAction } from '../../firebase';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

import {
  EmailMock,
  NavCard,
  RedFlagCard,
  StatItem,
  StatDivider,
  FeedbackSection
} from '../../components/home';
import { T } from '../../components/home/styles';
import { RED_FLAGS } from '../../components/home/constants';

export function HomePage({ setPage }) {
  const { user, signInWithGoogle } = useAuth();
  const [recruitCount, setRecruitCount] = useState(12482);

  useEffect(() => {
    // Dynamic recruit count from Firestore
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        if (!snap.empty) setRecruitCount(12482 + snap.size);
      },
      (error) => {
        console.warn("Users snapshot failed on Home:", error?.code || error?.message || error);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="pg-grid-bg" style={{ ...T.page, background: "transparent", paddingTop: 60 }}>
      <style>{`
        .sc-lk:hover {
          color: #00f5ff !important;
          border-color: rgba(0,245,255,0.4) !important;
          background: rgba(0,245,255,0.08) !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,245,255,0.15);
        }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>



      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{
          padding: "0 40px",
          paddingTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 40,
          minHeight: "85vh",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LEFT */}
        <div
          className="hero-left"
          style={{ flex: 1, maxWidth: 580, animation: "fuA .6s ease both" }}
        >
          {/* Live badge */}
          <div
            className="live-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(0,245,255,.05)",
              border: "1px solid rgba(0,245,255,.25)",
              borderRadius: 4,
              fontSize: ".72rem",
              color: "#00f5ff",
              fontFamily: "'Share Tech Mono',monospace",
              marginBottom: 26,
              letterSpacing: "0.15em",
              boxShadow: "0 0 25px rgba(0,245,255,0.15)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              position: "relative",
              zIndex: 5,
              width: "max-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00ff9d",
                boxShadow: "0 0 15px #00ff9d",
                animation: "pulse 2s infinite",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            LIVE THREAT DETECTION ACTIVE
          </div>

          <h1
            style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: "clamp(2.4rem,5vw,4.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 24,
              animation: "fuA .6s .1s ease both",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ display: "block" }}>
              Detect{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#00f5ff,#00ff9d)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 20px rgba(0,245,255,0.4))",
                }}
              >
                Phishing
              </span>
            </span>
            <span style={{ display: "block", marginTop: 6, fontSize: "0.9em", color: "#90a4ae" }}>
              Before It
            </span>
            <span
              style={{
                display: "block",
                marginTop: 6,
                color: "#ff1744",
                textShadow: "0 0 30px rgba(255,23,68,0.5)",
              }}
            >
              Detects You
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--txt2)",
              lineHeight: 1.8,
              marginBottom: 32,
              fontWeight: 400,
              animation: "fuA .6s .2s ease both",
            }}
          >
            Master cybersecurity through gamified simulations, real-world
            phishing scenarios, and adaptive learning. Level up your digital
            defenses.
          </p>

          <div
            className="hero-btns"
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 44,
              flexWrap: "wrap",
              animation: "fuA .6s .3s ease both",
            }}
          >
            <button style={T.btnHP} onClick={() => {
              logPlatformAction(user?.uid, "START_SIMULATOR_HERO");
              setPage("simulator");
            }}>
              ⚡ Start Simulation
            </button>
            <button style={T.btnHS} onClick={() => {
              logPlatformAction(user?.uid, "START_QUIZ_HERO");
              setPage("quiz");
            }}>
              📖 Take Adaptive Quiz
            </button>
          </div>

          {/* Fixed: StatDivider uses fixed height instead of alignSelf:stretch */}
          <div
            className="stats-row"
            style={{
              display: "flex",
              gap: 36,
              animation: "fuA .6s .4s ease both",
              alignItems: "center",
            }}
          >
            <StatItem num="3.4B" lbl="Phishing emails/day" />
            <StatDivider />
            <StatItem num="92%" lbl="Malware via email" />
            <StatDivider />
            <StatItem num={`${(recruitCount / 1000).toFixed(1)}K+`} lbl="Users trained" />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="hero-right-vis"
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 460,
            animation: "fuA .6s .2s ease both",
          }}
        >
          <EmailMock />

          {/* Threat blocked badge */}
          <div
            style={{
              position: "absolute",
              top: "8%",
              right: -15,
              background: "rgba(0,8,18,.98)",
              borderRadius: 4,
              padding: "11px 15px",
              border: "1px solid rgba(0,255,157,.3)",
              color: "#00ff9d",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: ".75rem",
              letterSpacing: "0.08em",
              boxShadow: "0 0 20px rgba(0,255,157,.15)",
              animation: "fuA .6s .5s ease both",
            }}
          >
            🛡️ THREAT BLOCKED
            <br />
            <small style={{ color: "var(--txt2)" }}>Risk Score: 94/100</small>
          </div>

          {/* Flags detected badge */}
          <div
            style={{
              position: "absolute",
              bottom: "12%",
              left: -25,
              background: "rgba(0,8,18,.98)",
              borderRadius: 4,
              padding: "11px 15px",
              border: "1px solid rgba(255,23,68,.3)",
              animation: "floatY 6s 2s ease-in-out infinite",
              backdropFilter: "blur(24px)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: ".68rem",
                color: "var(--txt2)",
                marginBottom: 3,
                fontFamily: "'Share Tech Mono',monospace",
                letterSpacing: "0.08em",
              }}
            >
              FLAGS DETECTED
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#ff1744",
                textShadow: "0 0 15px rgba(255,23,68,.5)",
              }}
            >
              6 Red Flags
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK NAV CARDS ── */}
      <section
        className="section-pad"
        style={{ padding: "60px 80px", position: "relative", zIndex: 2 }}
      >
        <div
          className="nav-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {[
            { icon: "🎯", title: "Real-vs-Fake Sim", desc: "Compare real and phishing emails side-by-side", page: "simulator" },
            { icon: "🧠", title: "Adaptive Quiz", desc: "Questions get harder as you improve", page: "quiz" },
            { icon: "🏆", title: "Leaderboard", desc: "Rank against global defenders", page: "leaderboard" },
            { icon: "🖼️", title: "Community Gallery", desc: "Browse real phishing examples submitted by users", page: "gallery" },
          ].map((c) => (
            <NavCard key={c.title} {...c} onClick={() => setPage(c.page)} />
          ))}
        </div>
      </section>



      {/* ── SENTINEL EXTENSION SECTION ── */}
      <section className="sentinel-section" style={{ padding: "80px 20px", position: "relative", zIndex: 2, overflow: "hidden" }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start",
          background: "linear-gradient(135deg, rgba(0,245,255,0.03), transparent)",
          border: "1px solid rgba(0,245,255,0.1)", borderRadius: 12, padding: "clamp(20px, 5vw, 60px)",
          maxWidth: 900, margin: "0 auto"
        }}>
          <div>
            <div style={T.secLbl}>// REAL-TIME PROTECTION</div>
            <h2 style={{ ...T.secTitle, fontSize: "clamp(1.5rem, 6vw, 2.5rem)", marginBottom: 20 }}>
              PhishGuard <span style={{ color: "#00f5ff" }}>Sentinel</span>
            </h2>
            <p style={{ color: "var(--txt2)", fontSize: "clamp(0.9rem, 2vw, 1.1rem)", lineHeight: 1.8, marginBottom: 30 }}>
              Bring our defense grid to your browser. PhishGuard Sentinel scans every URL you visit, detecting typosquats, homograph attacks, and insecure credential leaks before they harm you.
            </p>
            <div className="sentinel-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
              {[
                { i: "🛡️", t: "Live Filtering", d: "Block malicious scripts on the fly." },
                { i: "🔍", t: "URL Analysis", d: "Deep inspect suspicious domains." },
                { i: "⚠️", t: "Alert System", d: "Instant warnings on threat detection." },
                { i: "📊", t: "Threat Logs", d: "Keep track of scanned sites." },
              ].map(f => (
                <div key={f.t} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: "1.5rem" }}>{f.i}</span>
                  <div>
                    <div style={{ color: "#00f5ff", fontWeight: 700, fontSize: "0.9rem" }}>{f.t}</div>
                    <div style={{ color: "var(--txt2)", fontSize: "0.75rem" }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ ...T.btnHP, fontSize: "1rem", padding: "15px 40px", width: "100%", maxWidth: "300px" }}>INSTALL SENTINEL ➔</button>
          </div>
        </div>
      </section>


      {/* ── RED FLAGS ── */}
      <section
        className="section-pad"
        style={{
          padding: "80px 80px",
          background: "linear-gradient(180deg,transparent,rgba(0,8,18,.6),transparent)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ marginBottom: 52 }}>
          <div style={T.secLbl}>
            <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> THREAT INDICATORS
          </div>
          <h2 style={T.secTitle}>
            Know the{" "}
            <span style={{ color: "#ff1744", textShadow: "0 0 20px rgba(255,23,68,0.4)" }}>
              Red Flags
            </span>
          </h2>
          <p style={{ fontSize: ".95rem", color: "var(--txt2)", lineHeight: 1.8, maxWidth: 540 }}>
            Master these 6 universal phishing indicators to protect yourself from 95% of attacks.
          </p>
        </div>
        <div
          className="flags-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {RED_FLAGS.map((f) => (
            <RedFlagCard key={f.name} {...f} />
          ))}
        </div>
      </section>

      <FeedbackSection user={user} />

      {/* ── FOOTER ── */}
      <footer
        className="footer-wrap"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "72px 80px 36px",
          background: "linear-gradient(180deg,transparent,rgba(0,5,9,.98))",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 56,
            marginBottom: 56,
            alignItems: "start",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                ...T.logo,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "1.2rem",
                animation: "glitch 8s infinite",
              }}
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                width={28}
                height={28}
                style={{ filter: "drop-shadow(0 0 10px #00f5ff)", flexShrink: 0 }}
              >
                <g transform="translate(2 1.5)">
                  <path
                    d="M18 2L4 8v12c0 8 6.67 14.93 14 16 7.33-1.07 14-7.99 14-16V8L18 2z"
                    fill="rgba(0,229,255,.1)"
                    stroke="#00e5ff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 18l4 4 8-8"
                    stroke="#00e5ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
              <span style={{ display: "flex", alignItems: "center" }}>
                Phish<span style={{ color: "#00f5ff", textShadow: "0 0 18px #00f5ff" }}>Guard</span>
              </span>
            </div>
            <p
              style={{
                fontSize: ".85rem",
                color: "var(--txt2)",
                lineHeight: 1.8,
                marginTop: 12,
                maxWidth: 250,
              }}
            >
              Empowering internet users with skills to identify, avoid, and report phishing attacks.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {/* GitHub */}
              <a
                href="https://github.com/Binary-Beast25/phish-guard"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,245,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  color: "var(--txt2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,245,255,0.1)";
                  e.currentTarget.style.borderColor = "#00f5ff";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,245,255,0.2)";
                  e.currentTarget.querySelector('svg').style.fill = "#00f5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(0,245,255,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.querySelector('svg').style.fill = "currentColor";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/binarybeast"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,245,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  color: "var(--txt2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,245,255,0.1)";
                  e.currentTarget.style.borderColor = "#00f5ff";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,245,255,0.2)";
                  e.currentTarget.querySelector('svg').style.fill = "#00f5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(0,245,255,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.querySelector('svg').style.fill = "currentColor";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer link columns */}
          {[
            [
              "Platform",
              [
                { label: "Home", page: "home" },
                { label: "Quiz", page: "quiz" },
                { label: "Simulator", page: "simulator" },
                { label: "Neural Academy", page: "neural-academy" },
                { label: "Leaderboard", page: "leaderboard" },
                { label: "Progress", page: "progress" },
                { label: "Gallery", page: "gallery" },
              ],
            ],
            [
              "Contact",
              [
                { label: "sumitboy2005@gmail.com", page: null, href: "mailto:sumitboy2005@gmail.com" },
                { label: "About Us", page: "about" },
                { label: "Privacy Policy", page: "privacy" },
              ],
            ],
            [
              "Resources",
              [
                { label: "Checklist PDF", page: "checklist" },
                { label: "Report Phishing", page: "gallery" },
                { label: "FAQ", page: "faq" },
                { label: "CISA Guidance", page: "about" },
              ],
            ],
          ].map(([title, items]) => (
            <div key={title}>
              <div
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  marginBottom: 14,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#00f5ff",
                }}
              >
                {title}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {items.map(({ label, page, href }) => (
                  <li key={label}>
                    <a
                      href={href || "#"}
                      className="ft-lk"
                      onClick={(e) => {
                        if (!href) {
                          e.preventDefault();
                          if (page) setPage(page);
                        }
                      }}
                      style={{
                        fontSize: ".82rem",
                        color: "var(--txt2)",
                        textDecoration: "none",
                        fontFamily: "'Share Tech Mono',monospace",
                        transition: "color .2s",
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="footer-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 26,
            borderTop: "1px solid rgba(255,255,255,.04)",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span
              style={{
                fontSize: ".75rem",
                color: "var(--txt2)",
                fontFamily: "'Share Tech Mono',monospace",
                flexShrink: 0,
              }}
            >
              © 2026 PhishGuard.
            </span>
            {/* Social links removed as requested */}
          </div>
        </div>
      </footer>
    </div>
  );
}
export default HomePage;
