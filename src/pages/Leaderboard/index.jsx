import { useState, useEffect } from "react";
import { T } from '../../styles';
import { LB_DATA, BADGES } from '../../constants';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useAuth, useUser } from "../../context";

const TABS = ["🌍 Global", "👥 This Week", "🏫 Class"];

export function LeaderboardPage() {
  const [tab, setTab] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useUser();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLeaderboard(LB_DATA); // Fallback if empty
      } else {
        const data = snap.docs.map((doc, idx) => ({
          id: doc.id,
          rank: idx + 1,
          ...doc.data(),
          isYou: doc.id === user?.uid
        }));
        setLeaderboard(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const myRank = leaderboard.find(u => u.isYou)?.rank || "--";
  const myXP = profile?.xp || 0;
  const myStreak = profile?.streak || 0;
  const myAccuracy = profile?.accuracy || "87%"; // Default if not tracked

  // Calculate earned badges count
  const level = profile?.level || 1;
  const earnedBadgesCount = BADGES.filter(b =>
    (b.req.type === 'level' && level >= b.req.value) ||
    (b.req.type === 'xp' && myXP >= b.req.value) ||
    (b.req.type === 'streak' && myStreak >= b.req.value)
  ).length;

  const getBadgesForUser = (u) => {
    return BADGES.filter(b =>
      (b.req.type === 'level' && (u.level || 1) >= b.req.value) ||
      (b.req.type === 'xp' && (u.xp || 0) >= b.req.value) ||
      (b.req.type === 'streak' && (u.streak || 0) >= b.req.value)
    ).map(b => b.icon);
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
        @keyframes rowIn          { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 0 0 transparent; }
          50%     { box-shadow: 0 0 24px rgba(0,245,255,.12); }
        }
        @media (max-width: 768px) {
          .pg-container { padding: 40px 10px !important; }
          .lb-table { display: block; overflow-x: auto; white-space: nowrap; }
        }
      `}</style>

      {/* ── Full background stack ── */}


      {/* ── Page content ── */}
      <div className="pg-container" style={{ position: "relative", zIndex: 2, padding: "80px 60px 60px", maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={T.secLbl}>
          <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> HALL OF DEFENDERS
        </div>
        <h2 style={{ ...T.secTitle, marginBottom: 8 }}>
          Global <span style={{ color: "#00f5ff" }}>Leaderboard</span>
        </h2>
        <p style={{ color: "var(--txt2)", marginBottom: 36, fontFamily: "Rajdhani, sans-serif", fontSize: ".95rem" }}>
          Compete with thousands of learners worldwide. Your rank updates in real-time.
        </p>

        {/* ── Stat cards ── */}
        <div style={{ display: "flex", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
          {[
            { val: myRank === "--" ? "--" : `#${myRank}`, color: "#ffd600", lbl: "Your Rank", icon: "🏅" },
            { val: myXP.toLocaleString(), color: "#00f5ff", lbl: "Your XP", icon: "⚡" },
            { val: `🔥 ${myStreak}`, color: "#ff6d00", lbl: "Day Streak", icon: null },
            { val: `${earnedBadgesCount}/8`, color: "#00ff9d", lbl: "Badges", icon: "💎" },
          ].map(({ val, color, lbl }) => (
            <div
              key={lbl}
              style={{
                ...T.card,
                padding: "22px 28px",
                textAlign: "center",
                flex: 1,
                minWidth: 140,
                animation: "cardGlow 4s ease-in-out infinite",
                borderColor: `${color}22`,
              }}
            >
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                borderRadius: "6px 6px 0 0",
                opacity: 0.6,
              }} />
              <div style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.9rem",
                fontWeight: 800,
                color,
                textShadow: `0 0 20px ${color}88`,
                lineHeight: 1,
                marginBottom: 6,
              }}>
                {val}
              </div>
              <div style={{
                fontSize: ".72rem",
                color: "var(--txt2)",
                fontFamily: "Share Tech Mono, monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                padding: "8px 22px",
                borderRadius: 4,
                border: tab === i ? "1px solid rgba(0,245,255,.4)" : "1px solid rgba(0,245,255,.12)",
                background: tab === i ? "rgba(0,245,255,.08)" : "transparent",
                fontSize: ".85rem",
                fontWeight: 600,
                cursor: "pointer",
                color: tab === i ? "#00f5ff" : "var(--txt2)",
                fontFamily: "Share Tech Mono, monospace",
                letterSpacing: "0.05em",
                transition: "all .2s",
                boxShadow: tab === i ? "0 0 14px rgba(0,245,255,.12)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        {tab === 2 && !profile?.classId ? (
          <div style={{ ...T.card, padding: "80px 20px", textAlign: "center", background: "rgba(0,10,20,0.6)", border: "1px dashed rgba(0,245,255,0.3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.8 }}>🏫</div>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", color: "#e0f7fa", marginBottom: 12 }}>No Academy Assigned</h3>
            <p style={{ color: "var(--txt2)", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>
              You are not currently enrolled in any class or operational group. Join a class to compete on your private leaderboard.
            </p>
          </div>
        ) : (
          <div style={{ ...T.card, overflow: "hidden" }}>

            {/* Table top accent */}
            <div style={{
              height: 2,
              background: "linear-gradient(90deg,transparent,#00f5ff,#d500f9,#00f5ff,transparent)",
              opacity: 0.5,
            }} />

            <table className="lb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,245,255,.03)" }}>
                  {["Rank", "Defender", "XP", "Streak", "Badges"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "Share Tech Mono, monospace",
                        fontSize: ".68rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(0,245,255,.6)",
                        padding: "12px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid rgba(0,245,255,.1)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, rowIdx) => {
                  const rankColor =
                    u.rank === 1 ? "#ffd600" :
                      u.rank === 2 ? "#b0bec5" :
                        u.rank === 3 ? "#ff9e80" : "rgba(0,245,255,0.7)";

                  const rankBg =
                    u.rank === 1 ? "rgba(255,214,0,.08)" :
                      u.rank === 2 ? "rgba(176,190,197,.05)" :
                        u.rank === 3 ? "rgba(255,158,128,.06)" : "transparent";

                  const displayName = u.displayName || u.name || "Anonymous Agent";
                  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const photoURL = u.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id || u.uid}`;

                  return (
                    <tr
                      key={u.id || u.rank}
                      style={{
                        background: u.isYou ? "rgba(0,245,255,0.08)" : rankBg,
                        borderLeft: u.isYou ? "4px solid #00f5ff" : "4px solid transparent",
                        transition: "all .3s ease",
                        animation: `rowIn .4s ${rowIdx * 0.05}s ease both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = u.isYou ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = u.isYou ? "rgba(0,245,255,0.08)" : rankBg;
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.04)", width: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          {u.rank <= 3 ? (
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: `${rankColor}22`, border: `1px solid ${rankColor}44`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1.2rem", boxShadow: `0 0 10px ${rankColor}33`
                            }}>
                              {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : "🥉"}
                            </div>
                          ) : (
                            <span style={{
                              fontFamily: "Orbitron, sans-serif",
                              fontSize: ".9rem",
                              fontWeight: 800,
                              color: rankColor,
                            }}>
                              #{u.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Defender */}
                      <td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ position: "relative" }}>
                            <img
                              src={photoURL}
                              alt={displayName}
                              style={{
                                width: 42, height: 42, borderRadius: "50%",
                                border: `2px solid ${u.isYou ? "#00f5ff" : "rgba(0,245,255,0.2)"}`,
                                background: "rgba(0,0,0,0.5)",
                                boxShadow: u.isYou ? "0 0 15px rgba(0,245,255,0.3)" : "none",
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div style={{
                              display: 'none', width: 42, height: 42, borderRadius: "50%",
                              background: "linear-gradient(135deg, #00f5ff, #d500f9)",
                              color: "#000", fontSize: "0.8rem", fontWeight: 700,
                              alignItems: "center", justifyContent: "center"
                            }}>
                              {initials}
                            </div>
                            {u.rank === 1 && (
                              <div style={{ position: "absolute", right: -10, top: -8, fontSize: "1rem", transform: "rotate(-20deg)" }}>👑</div>
                            )}
                          </div>
                          <div>
                            <div style={{
                              fontSize: "1rem", fontWeight: 600,
                              color: u.isYou ? "#00f5ff" : "#e0f7fa",
                              display: "flex", alignItems: "center", gap: 8
                            }}>
                              {displayName}
                              {u.isYou && (
                                <span style={{
                                  fontSize: ".6rem",
                                  fontFamily: "Share Tech Mono, monospace",
                                  color: "#00f5ff", letterSpacing: "0.1em",
                                  padding: "2px 6px",
                                  border: "1px solid rgba(0,245,255,.4)",
                                  borderRadius: 4,
                                  background: "rgba(0,245,255,.1)",
                                  textTransform: "uppercase"
                                }}>YOU</span>
                              )}
                            </div>
                            <div style={{
                              fontSize: ".75rem", color: "var(--txt2)",
                              fontFamily: "Share Tech Mono, monospace",
                              display: "flex", alignItems: "center", gap: 6
                            }}>
                              <span style={{ color: "rgba(0,245,255,0.5)" }}>LVL</span> {u.level || 1}
                              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                              {u.level >= 10 ? "GRANDMASTER" : u.level >= 7 ? "VETERAN" : u.level >= 4 ? "GUARDIAN" : "RECRUIT"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* XP */}
                      <td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{
                            fontFamily: "Share Tech Mono, monospace",
                            fontSize: ".95rem",
                            color: "#00f5ff",
                            fontWeight: 700,
                            textShadow: "0 0 10px rgba(0,245,255,0.4)",
                          }}>
                            {(u.xp || 0).toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.6rem", color: "var(--txt2)", textTransform: "uppercase", letterSpacing: "1px" }}>Total XP</span>
                        </div>
                      </td>

                      {/* Streak */}
                      <td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontFamily: "Share Tech Mono, monospace",
                            fontSize: ".9rem",
                            color: (u.streak || 0) > 0 ? "#ff6d00" : "rgba(255,255,255,0.2)",
                            fontWeight: 700
                          }}>
                            {u.streak || 0}
                          </span>
                          <span style={{ fontSize: "1.1rem" }}>{(u.streak || 0) >= 7 ? "🔥" : "⚡"}</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 150 }}>
                          {getBadgesForUser(u).length > 0 ? (
                            getBadgesForUser(u).map((b, i) => (
                              <span
                                key={i}
                                title="Achievement Unlocked"
                                style={{
                                  fontSize: "1.2rem",
                                  filter: "drop-shadow(0 0 5px rgba(0,245,255,.4))",
                                  cursor: "help",
                                  transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                              >
                                {b}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.1)", fontStyle: "italic" }}>No medals yet</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
