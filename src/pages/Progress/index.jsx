import { useState, useEffect, useRef } from "react";
import { T } from '../../styles';
import { BADGES, MODULES } from '../../constants';
import { useAuth, useUser } from "../../context";
import { PageHeader, XPBar } from "../../components";

const ACTIVITY_STATS = [
  ["Quizzes Completed", "23", "#00f5ff"],
  ["Simulations Done", "8", "#00ff9d"],
  ["Streak Record", "12 days", "#ff6d00"],
  ["Community Flags", "15", "#d500f9"],
];

function dotColor(s) { return s === "done" ? "#00ff9d" : s === "active" ? "#00f5ff" : "var(--txt2)"; }
function badgeText(s) { return s === "done" ? "✓ DONE" : s === "active" ? "→ ACTIVE" : "🔒 LOCKED"; }

// ─── CANVAS: MATRIX RAIN ─────────────────────────────────────────────────────


// ─── CANVAS: PARTICLE NETWORK ────────────────────────────────────────────────


// ─── CANVAS: HEX GRID ────────────────────────────────────────────────────────


// ─── LIGHTNING STREAKS ───────────────────────────────────────────────────────


// ─── CYBER BACKGROUND ────────────────────────────────────────────────────────


// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "Orbitron, sans-serif", fontSize: ".85rem", fontWeight: 700,
      marginBottom: 20, color: "#00f5ff", letterSpacing: "0.08em",
    }}>
      // {children}
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────
export function ProgressPage({ xp, level, xpPct, xpToNext }) {
  const { user } = useAuth();
  const { profile } = useUser();

  const quizAttempts = profile?.quizAttempts || profile?.quizzesCompleted || 0;
  const simAttempts = profile?.simulationsDone || 0;
  const emailsFlagged = profile?.emailsFlagged || profile?.communityFlags || 0;
  const moduleCompletions = profile?.trainingModulesCompleted || 0;
  const quizAccuracy =
    quizAttempts > 0
      ? `${Math.round(((profile?.quizCorrect || 0) / quizAttempts) * 100)}%`
      : "0%";

  const ACTIVITY_STATS = [
    ["Quizzes Completed", quizAttempts, "#00f5ff"],
    ["Simulations Done", simAttempts, "#00ff9d"],
    ["Modules Completed", moduleCompletions, "#ffd600"],
    ["Emails Flagged", emailsFlagged, "#d500f9"],
  ];

  const agentName = profile?.displayName || user?.displayName || "Guest Agent";
  const agentInitials = agentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  if (!user) {
    return (
      <div style={{ ...T.page, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...T.card, padding: 40, textAlign: "center" }}>
          <PageHeader label="ERROR 401" title="UNAUTHORIZED" subtitle="Please initialize session to access your progress record." />
        </div>
      </div>
    );
  }

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
        @keyframes avatarGlow     {
          0%,100% { box-shadow: 0 0 40px rgba(0,245,255,.25), 0 0 80px rgba(213,0,249,.15); }
          50%     { box-shadow: 0 0 60px rgba(0,245,255,.45), 0 0 100px rgba(213,0,249,.3); }
        }
        @keyframes statIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 6px currentColor; }
          50%     { box-shadow: 0 0 14px currentColor; }
        }
      `}</style>

      {/* ── Full background stack ── */}


      {/* ── Page content ── */}
      <div className="pg-container" style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Profile header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 28, marginBottom: 48,
          flexWrap: "wrap", animation: "fuA .5s ease both",
        }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 6,
            background: "linear-gradient(135deg,#00f5ff,#d500f9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Orbitron, sans-serif", fontSize: "2rem", fontWeight: 800, color: "#000",
            animation: "avatarGlow 4s ease-in-out infinite",
            flexShrink: 0,
          }}>
            {agentInitials || "CK"}
          </div>

          <div>
            <h2 style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800,
              marginBottom: 6, letterSpacing: "-0.01em",
            }}>
              {agentName}
            </h2>
            <p style={{ color: "var(--txt2)", fontFamily: "Share Tech Mono, monospace", fontSize: ".82rem", textTransform: "uppercase" }}>
              Level {level} · {level >= 10 ? "Grandmaster" : level >= 7 ? "Veteran" : level >= 4 ? "Guardian" : "Recruit"} · Joined {profile?.createdAt ? "recently" : "60 days ago"}
            </p>
            {/* Live status dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#00ff9d", boxShadow: "0 0 10px #00ff9d",
                display: "inline-block", animation: "pulse 2s infinite",
              }} />
              <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".68rem", color: "#00ff9d", letterSpacing: "0.1em" }}>
                ONLINE · ACTIVE SESSION
              </span>
            </div>
          </div>

          {/* Global rank */}
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{
              fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem",
              color: "var(--txt2)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Global Rank
            </div>
            <div style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "2.4rem", fontWeight: 800,
              color: "#ffd600", textShadow: "0 0 30px rgba(255,214,0,0.5)", lineHeight: 1,
            }}>
              #47
            </div>
            <div style={{
              fontFamily: "Share Tech Mono, monospace", fontSize: ".68rem",
              color: "var(--txt2)", marginTop: 4,
            }}>
              Top 5% worldwide
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="stat-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            ["⚡", xp.toLocaleString(), "Total XP", "#00f5ff"],
            ["🔥", profile?.streak || 0, "Day Streak", "#ff6d00"],
            ["🎯", quizAccuracy, "Accuracy", "#00ff9d"],
            ["📧", emailsFlagged, "Emails Flagged", "#d500f9"],
          ].map(([icon, val, lbl, color], idx) => (
            <div
              key={lbl}
              style={{
                ...T.card,
                padding: "24px 20px",
                textAlign: "center",
                animation: `statIn .5s ${idx * 0.08}s ease both`,
                borderColor: `${color}22`,
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                borderRadius: "6px 6px 0 0", opacity: 0.7,
              }} />
              <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>{icon}</span>
              <div style={{
                fontFamily: "Orbitron, sans-serif", fontSize: "1.6rem", fontWeight: 800,
                color, marginBottom: 4, textShadow: `0 0 20px ${color}60`,
              }}>
                {val}
              </div>
              <div style={{
                fontSize: ".72rem", color: "var(--txt2)",
                fontFamily: "Share Tech Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div className="prog-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── LEFT col: badges + learning map ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Badge rack */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>ACHIEVEMENT BADGES</SectionLabel>
              <div className="badges-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {BADGES.map((b, idx) => {
                  const isEarned = (b.req.type === 'level' && level >= b.req.value) ||
                    (b.req.type === 'xp' && xp >= b.req.value) ||
                    (b.req.type === 'streak' && (profile?.streak || 0) >= b.req.value);

                  let progressStr = "";
                  if (!isEarned) {
                    if (b.req.type === 'xp') progressStr = `${b.req.value - xp} XP left`;
                    if (b.req.type === 'level') progressStr = `Reach Level ${b.req.value}`;
                    if (b.req.type === 'streak') progressStr = `${(profile?.streak || 0)}/${b.req.value} days`;
                  }

                  return (
                    <div
                      key={b.name}
                      title={b.name + (progressStr ? " · " + progressStr : "")}
                      style={{
                        textAlign: "center",
                        padding: "14px 8px",
                        borderRadius: 6,
                        cursor: isEarned ? "pointer" : "default",
                        transition: "all .2s",
                        animation: `statIn .4s ${idx * 0.04}s ease both`,
                        ...(isEarned
                          ? {
                            background: "linear-gradient(135deg,rgba(0,245,255,.06),rgba(0,12,26,0.95))",
                            border: "1px solid rgba(0,245,255,.25)",
                            boxShadow: "0 0 20px rgba(0,245,255,.06)",
                          }
                          : {
                            background: "rgba(0,5,14,0.8)",
                            border: "1px solid rgba(255,255,255,.06)",
                            opacity: 0.5,
                            filter: "grayscale(0.8)",
                          }),
                      }}
                    >
                      <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{b.icon}</div>
                      <div style={{
                        fontFamily: "Share Tech Mono, monospace", fontSize: ".6rem",
                        color: isEarned ? "#e0f7fa" : "var(--txt2)",
                      }}>
                        {b.name}
                      </div>
                      {!isEarned && progressStr && (
                        <div style={{ fontSize: ".52rem", color: "var(--txt2)", marginTop: 2, textTransform: "uppercase" }}>{progressStr}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {(() => {
                const nextB = BADGES.find(b => {
                  const isEarned = (b.req.type === 'level' && level >= b.req.value) ||
                    (b.req.type === 'xp' && xp >= b.req.value) ||
                    (b.req.type === 'streak' && (profile?.streak || 0) >= b.req.value);
                  return !isEarned;
                });
                if (!nextB) return null;

                let diff = "";
                if (nextB.req.type === 'xp') diff = `${nextB.req.value - xp} XP`;
                if (nextB.req.type === 'level') diff = `Level ${nextB.req.value}`;
                if (nextB.req.type === 'streak') diff = `${nextB.req.value - (profile?.streak || 0)} days`;

                return (
                  <div style={{
                    marginTop: 16, padding: "10px 14px",
                    background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.1)",
                    borderRadius: 4, fontSize: ".78rem", color: "var(--txt2)",
                    fontFamily: "Share Tech Mono, monospace",
                  }}>
                    {diff} until next badge →{" "}
                    <span style={{ color: "#00f5ff" }}>{nextB.name}</span>
                  </div>
                );
              })()}
            </div>

            {/* Learning map */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>NEURAL TRAINING MODULES</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {MODULES.map((m, i) => {
                  const userModule = profile?.trainingProgress?.[m.id];
                  const unlocked = level >= m.reqLevel;
                  const opened = userModule?.resourcesOpenedCount || 0;
                  const totalResources = userModule?.resourcesTotalCount || m.resources?.length || 0;

                  let status = "locked";
                  let subText = `Unlock at Level ${m.reqLevel}`;
                  let progressPct = 0;

                  if (unlocked && userModule?.completed) {
                    status = "done";
                    subText = "Completed";
                    progressPct = 100;
                  } else if (unlocked && userModule) {
                    status = "active";
                    subText = totalResources > 0
                      ? `${opened}/${totalResources} resources explored`
                      : "In Progress";
                    progressPct = userModule?.progressPct || 35;
                  } else if (unlocked) {
                    status = "active";
                    subText = "Not started";
                    progressPct = 0;
                  }

                  const dc = dotColor(status);
                  const isLocked = status === "locked";

                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: "16px",
                        background: isLocked ? "rgba(0,0,0,0.2)" : "rgba(0,245,255,0.03)",
                        border: `1px solid ${isLocked ? "rgba(255,255,255,0.05)" : "rgba(0,245,255,0.15)"}`,
                        borderRadius: 8,
                        animation: `statIn .4s ${i * 0.07}s ease both`,
                        position: "relative",
                        overflow: "hidden"
                      }}
                    >
                      {/* Side Indicator */}
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: dc }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: "1.4rem", opacity: isLocked ? 0.3 : 1 }}>{m.icon}</span>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: isLocked ? "var(--txt2)" : "#fff" }}>{m.name}</div>
                            <div style={{ fontSize: "0.7rem", color: dc, fontFamily: "Share Tech Mono" }}>{isLocked ? "ACCESS RESTRICTED" : subText}</div>
                          </div>
                        </div>
                        <span style={{
                          fontFamily: "Share Tech Mono, monospace", fontSize: ".65rem",
                          color: dc, padding: "3px 10px", borderRadius: 4,
                          border: `1px solid ${dc}80`, background: `${dc}15`
                        }}>
                          {badgeText(status)}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 4, color: "#90a4ae" }}>⏱ {m.time}</div>
                        <div style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 4, color: "#90a4ae" }}>📊 {m.diff}</div>
                        {m.topics?.slice(0, 2).map(t => (
                          <div key={t} style={{ fontSize: "0.65rem", background: "rgba(0,245,255,0.05)", padding: "3px 8px", borderRadius: 4, color: "#00f5ff" }}># {t}</div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, position: "relative" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, height: "100%",
                          width: `${progressPct}%`,
                          background: dc, boxShadow: `0 0 10px ${dc}`
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT col: XP + activity + Sheldon ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* XP block */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>XP PROGRESS</SectionLabel>
              <XPBar xp={xp} level={level} xpPct={xpPct} xpToNext={xpToNext} />
              <div style={{ marginTop: 16 }}>
                {ACTIVITY_STATS.map(([lbl, val, color], idx) => (
                  <div
                    key={lbl}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "11px 0",
                      borderBottom: idx < ACTIVITY_STATS.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
                      animation: `statIn .4s ${idx * 0.07}s ease both`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: color, boxShadow: `0 0 6px ${color}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: ".85rem", color: "var(--txt2)" }}>{lbl}</span>
                    </div>
                    <span style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: ".9rem",
                      fontWeight: 700, color,
                      textShadow: `0 0 12px ${color}60`,
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly activity mini-chart */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>WEEKLY ACTIVITY</SectionLabel>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 70 }}>
                {[40, 75, 55, 90, 60, 100, 80].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%",
                      height: `${h}%`,
                      background: i === 6
                        ? "linear-gradient(180deg,#00f5ff,#00ff9d)"
                        : "rgba(0,245,255,.18)",
                      borderRadius: "3px 3px 0 0",
                      boxShadow: i === 6 ? "0 0 12px rgba(0,245,255,.4)" : "none",
                      transition: "all .3s",
                    }} />
                    <span style={{
                      fontFamily: "Share Tech Mono, monospace", fontSize: ".58rem",
                      color: i === 6 ? "#00f5ff" : "var(--txt2)",
                    }}>
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, fontFamily: "Share Tech Mono, monospace",
                fontSize: ".72rem", color: "var(--txt2)", textAlign: "right",
              }}>
                This week: <span style={{ color: "#00f5ff" }}>247 XP earned</span>
              </div>
            </div>

            {/* Finn's Advisor tip */}
            <div style={{ ...T.card, padding: 28 }}>
              <SectionLabel>FINN-AI NEURAL ADVISOR</SectionLabel>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  fontSize: "2rem", flexShrink: 0,
                  filter: "drop-shadow(0 0 8px rgba(0,245,255,.3))",
                }}>
                  📡
                </div>
                <p style={{
                  fontSize: ".85rem", color: "var(--txt2)",
                  lineHeight: 1.7, fontStyle: "italic", margin: 0,
                }}>
                  "Neural analysis complete. Your performance metrics are stabilizing. Keep the momentum — just{" "}
                  <span style={{ color: "#00ff9d" }}>2 more days</span> to unlock the{" "}
                  <span style={{ color: "#ffd600" }}>Dedication Badge</span>. Today, try the Spear Phishing simulator!"
                </p>
              </div>
              {/* Tip action */}
              <div style={{
                marginTop: 14, padding: "8px 14px",
                background: "rgba(0,245,255,.04)", border: "1px solid rgba(0,245,255,.12)",
                borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "Share Tech Mono, monospace", fontSize: ".72rem", color: "#00f5ff" }}>
                  → Recommendation: Execute High-Fidelity Simulation
                </span>
                <span style={{ fontSize: ".72rem", color: "var(--txt2)", fontFamily: "Share Tech Mono, monospace" }}>
                  +150 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .pg-container { padding: 40px 10px !important; }
          .stat-cards-grid { grid-template-columns: 1fr 1fr !important; }
          .prog-main-grid { grid-template-columns: 1fr !important; }
          .badges-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stat-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div >
  );
}
