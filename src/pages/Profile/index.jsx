import { useState, useEffect } from "react";
import { T } from '../../styles';
import { PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { db, storage } from '../../firebase/config';
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { BADGES, MODULES } from '../../constants';
import { createClass, joinClass, leaveClass, getClassInfo, getUserActivityLogs, logPlatformAction } from '../../firebase/db';

const INP = {
    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)",
    color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit", outline: "none",
};

export function ProfilePage({ showToast }) {
    const { user, resetPassword, verifyEmail, linkGoogle, linkEmail, deleteAccount } = useAuth();
    const { profile } = useUser();
    const [loading, setLoading] = useState(false);
    const [linkMode, setLinkMode] = useState(null);
    const [linkEmailData, setLinkEmailData] = useState({ email: "", password: "" });
    const [classMode, setClassMode] = useState(null);
    const [joinCode, setJoinCode] = useState("");
    const [classInfo, setClassInfo] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [formData, setFormData] = useState({ displayName: "", bio: "", specialization: "General Defense" });

    const level = profile?.level || 1;
    const xp = profile?.xp || 0;
    const streak = profile?.streak || 0;

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || user?.displayName || "",
                bio: profile.bio || "",
                specialization: profile.specialization || "General Defense",
            });
        }
    }, [profile, user]);

    useEffect(() => {
        if (profile?.classCode) {
            getClassInfo(profile.classCode).then(setClassInfo).catch(() => { });
        }
    }, [profile?.classCode]);

    useEffect(() => {
        if (!user?.uid) return;

        let mounted = true;
        setLogsLoading(true);

        Promise.all([
            getUserActivityLogs(user.uid, 12),
            logPlatformAction(user.uid, "PROFILE_VIEWED"),
        ])
            .then(([logs]) => {
                if (mounted) setActivityLogs(logs);
            })
            .catch(() => {
                if (mounted) setActivityLogs([]);
            })
            .finally(() => {
                if (mounted) setLogsLoading(false);
            });

        return () => { mounted = false; };
    }, [user?.uid]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { ...formData, updatedAt: new Date() });
            showToast("PROFILE SYNCHRONIZED", "ok");
        } catch (err) { showToast(err.message, "ng"); }
        finally { setLoading(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        setLoading(true);
        try {
            const fileRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            await updateDoc(doc(db, "users", user.uid), { photoURL: url });
            showToast("AVATAR UPDATED", "ok");
        } catch (err) { showToast(err.message, "ng"); }
        finally { setLoading(false); }
    };

    if (!user) {
        return (
            <div style={{ ...T.page, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ ...T.card, padding: 40, textAlign: "center", maxWidth: 400 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
                    <PageHeader label="ERROR 401" title="UNAUTHORIZED" subtitle="Please sign in to access your dossier." />
                    <button className="pg-login-btn" style={{ ...T.btnHP, width: "100%", marginTop: 20, justifyContent: "center" }} onClick={() => document.querySelector('.pg-login-btn')?.click?.()}>
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const XP_LEVELS = [0, 500, 1200, 2100, 3200, 4500, 6000, 7700, 9600, 11700];
    const curXP = XP_LEVELS[level - 1] || 0;
    const nextXP = XP_LEVELS[level] || XP_LEVELS[9] + 5000;
    const progress = Math.min(100, Math.max(0, ((xp - curXP) / (nextXP - curXP)) * 100));
    const trainingProgress = profile?.trainingProgress || {};
    const completedModules = MODULES.filter((m) => trainingProgress[m.id]?.completed).length;
    const startedModules = Object.keys(trainingProgress).length;
    const moduleProgressPct = MODULES.length ? Math.round((completedModules / MODULES.length) * 100) : 0;

    const formatLogTime = (timestamp) => {
        const d = timestamp?.toDate ? timestamp.toDate() : null;
        if (!d) return "Pending";
        return d.toLocaleString();
    };

    const actionLabel = (action = "") =>
        action
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div style={{ ...T.page, background: "transparent" }}>
            <section style={{ ...T.sec, maxWidth: 920, margin: "0 auto", padding: "80px 20px" }}>
                <PageHeader label="AGENT DOSSIER" title="Identity Management" subtitle="Refine your presence in the digital defense grid." />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>

                    {/* ── LEFT: Avatar & Badges ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ ...T.card, padding: 30, textAlign: "center" }}>
                            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
                                <img
                                    src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || 'agent'}&backgroundColor=00f5ff`}
                                    alt="avatar"
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #00f5ff", boxShadow: "0 0 20px rgba(0,245,255,0.3)" }}
                                />
                                <label style={{ position: "absolute", bottom: 0, right: 0, background: "#00f5ff", color: "#000", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #000", fontSize: "0.9rem" }}>
                                    📸
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <h2 style={{ fontFamily: "Orbitron", fontSize: "1.2rem", color: "#e0f7fa", margin: "0 0 4px" }}>{profile?.displayName || user?.displayName || "Agent"}</h2>
                            <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono", fontSize: "0.8rem", marginBottom: 8 }}>LVL {level} DEFENDER</div>
                            <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: "0.65rem", fontFamily: "Share Tech Mono", background: user.emailVerified ? "rgba(0,255,157,0.1)" : "rgba(255,23,68,0.1)", color: user.emailVerified ? "#00ff9d" : "#ff1744", border: `1px solid ${user.emailVerified ? "rgba(0,255,157,0.2)" : "rgba(255,23,68,0.2)"}`, marginBottom: 15 }}>
                                STATUS: {user.emailVerified ? "VERIFIED" : "UNVERIFIED"}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid rgba(0,245,255,0.1)", paddingTop: 15 }}>
                                <div>
                                    <div style={{ color: "#00f5ff", fontWeight: 700 }}>{xp.toLocaleString()}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem" }}>XP</div>
                                </div>
                                <div>
                                    <div style={{ color: "#ff6d00", fontWeight: 700 }}>{streak}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem" }}>STREAK</div>
                                </div>
                                <div>
                                    <div style={{ color: "#d500f9", fontWeight: 700 }}>{profile?.classCode || "—"}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem" }}>CLASS</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 15 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", fontFamily: "Share Tech Mono", color: "var(--txt2)", marginBottom: 4 }}>
                                    <span>LEVEL {level} → {level + 1}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#00f5ff,#00ff9d)", transition: "width 0.5s" }} />
                                </div>
                                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: 3, textAlign: "right", fontFamily: "Share Tech Mono" }}>{xp} / {nextXP} XP</div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div style={{ ...T.card, padding: 25 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 15 }}>// ACHIEVEMENT BADGES</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                {BADGES.map((b, i) => {
                                    const earned = (b.req.type === 'level' && level >= b.req.value) ||
                                        (b.req.type === 'xp' && xp >= b.req.value) ||
                                        (b.req.type === 'streak' && streak >= b.req.value);
                                    return (
                                        <div key={i} title={b.name} style={{ textAlign: "center", padding: 8, background: earned ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.3)", border: `1px solid ${earned ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 4, opacity: earned ? 1 : 0.5 }}>
                                            <div style={{ fontSize: "1.2rem" }}>{b.icon}</div>
                                            <div style={{ fontSize: "0.5rem", color: earned ? "#00f5ff" : "var(--txt2)", fontFamily: "Share Tech Mono", marginTop: 3 }}>{b.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Edit Form + Class + Security ── */}
                    <div style={{ ...T.card, padding: 35 }}>

                        {/* EDIT FORM */}
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 4 }}>// AGENT CONFIGURATION</div>
                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 6 }}>CODENAME</label>
                                <input style={INP} value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 6 }}>BIO / MISSION STATEMENT</label>
                                <textarea style={{ ...INP, minHeight: 90, resize: "vertical" }} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Identify your defense methodology..." />
                            </div>
                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 6 }}>SPECIALIZATION</label>
                                <select style={INP} value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })}>
                                    <option>General Defense</option>
                                    <option>Student / Learner</option>
                                    <option>Working Professional</option>
                                    <option>Senior Citizen</option>
                                    <option>Tech Enthusiast</option>
                                    <option>Educator / Trainer</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading} style={{ ...T.btnHP, marginTop: 4, width: "100%", justifyContent: "center" }}>
                                {loading ? "SYNCHRONIZING..." : "UPDATE DOSSIER"}
                            </button>
                        </form>

                        {/* ── CLASS / GROUP ── */}
                        <div style={{ marginTop: 32, borderTop: "1px solid rgba(0,245,255,0.08)", paddingTop: 24 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 14 }}>// TRAINING CLASS / FRIEND GROUP</div>

                            {profile?.classCode ? (
                                <div style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, padding: 20 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                        <div>
                                            <div style={{ color: "var(--txt2)", fontSize: "0.65rem", fontFamily: "Share Tech Mono", marginBottom: 4 }}>YOUR CLASS CODE</div>
                                            <div style={{ fontFamily: "Orbitron", fontSize: "2rem", fontWeight: 800, color: "#00f5ff", letterSpacing: "0.3em", textShadow: "0 0 20px rgba(0,245,255,0.5)" }}>
                                                {profile.classCode}
                                            </div>
                                            {classInfo && (
                                                <div style={{ color: "var(--txt2)", fontSize: "0.75rem", marginTop: 6 }}>
                                                    👥 {classInfo.members?.length || 1} member{classInfo.members?.length !== 1 ? "s" : ""}
                                                    {classInfo.createdByName ? ` · Created by ${classInfo.createdByName}` : ""}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(profile.classCode); showToast("Code copied!", "ok"); }}
                                                style={{ ...T.btnG, fontSize: "0.75rem", padding: "8px 14px" }}
                                            >📋 Copy Code</button>
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm("Leave this class? Your XP won't be lost.")) return;
                                                    setLoading(true);
                                                    try {
                                                        await leaveClass(user.uid, profile.classCode);
                                                        setClassInfo(null);
                                                        showToast("Left class successfully", "ok");
                                                    } catch (e) { showToast(e.message, "ng"); }
                                                    finally { setLoading(false); }
                                                }}
                                                style={{ ...T.btnG, fontSize: "0.75rem", padding: "8px 14px", color: "#ff4757", borderColor: "rgba(255,71,87,0.3)" }}
                                            >🚪 Leave Class</button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 6, fontSize: "0.72rem", color: "var(--txt2)" }}>
                                        💡 Share this code with friends — they join from their Profile page and appear on your shared leaderboard.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <p style={{ color: "var(--txt2)", fontSize: "0.8rem", margin: 0 }}>
                                        Create a private group or join a friend's class to compete on a shared leaderboard.
                                    </p>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button
                                            disabled={loading}
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    const code = await createClass(user.uid, profile?.displayName || user?.displayName);
                                                    showToast(`Class created! Code: ${code}`, "ok");
                                                    const info = await getClassInfo(code);
                                                    setClassInfo(info);
                                                } catch (e) { showToast(e.message, "ng"); }
                                                finally { setLoading(false); }
                                            }}
                                            style={{ ...T.btnHP, flex: 1, fontSize: "0.8rem" }}
                                        >🏫 Create Class</button>
                                        <button onClick={() => setClassMode(classMode === "join" ? null : "join")} style={{ ...T.btnG, flex: 1, fontSize: "0.8rem" }}>
                                            🔗 Join with Code
                                        </button>
                                    </div>
                                    {classMode === "join" && (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <input
                                                placeholder="6-char code e.g. AB3X9K"
                                                value={joinCode}
                                                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                                                maxLength={6}
                                                style={{ ...INP, flex: 1, fontFamily: "monospace", fontSize: "1.1rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                                            />
                                            <button
                                                disabled={loading || joinCode.length < 6}
                                                onClick={async () => {
                                                    setLoading(true);
                                                    try {
                                                        await joinClass(user.uid, joinCode);
                                                        const info = await getClassInfo(joinCode);
                                                        setClassInfo(info);
                                                        setClassMode(null);
                                                        showToast(`Joined class ${joinCode}!`, "ok");
                                                    } catch (e) { showToast(e.message, "ng"); }
                                                    finally { setLoading(false); }
                                                }}
                                                style={{ ...T.btnHP, padding: "10px 18px", whiteSpace: "nowrap" }}
                                            >Join</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── SECURITY ── */}
                        <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,245,255,0.08)", paddingTop: 24 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 14 }}>// NEURAL ACADEMY TRACKING</div>
                            <div style={{ ...T.card, padding: 16, background: "rgba(0,0,0,0.2)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <div style={{ fontSize: "0.78rem", color: "#e0f7fa" }}>
                                        {completedModules}/{MODULES.length} modules completed
                                    </div>
                                    <div style={{ fontSize: "0.72rem", color: "#00f5ff", fontFamily: "Share Tech Mono" }}>
                                        {moduleProgressPct}%
                                    </div>
                                </div>
                                <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                                    <div style={{ width: `${moduleProgressPct}%`, height: "100%", background: "linear-gradient(90deg,#00f5ff,#00ff9d)" }} />
                                </div>
                                <div style={{ fontSize: "0.67rem", color: "var(--txt2)", marginBottom: 12 }}>
                                    Started modules: {startedModules}
                                </div>
                                <div style={{ display: "grid", gap: 8, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                                    {MODULES.map((m) => {
                                        const unlocked = level >= m.reqLevel;
                                        const done = Boolean(trainingProgress[m.id]?.completed);
                                        const active = !done && Boolean(trainingProgress[m.id]);
                                        const opened = trainingProgress[m.id]?.resourcesOpenedCount || 0;
                                        const totalResources = trainingProgress[m.id]?.resourcesTotalCount || m.resources?.length || 0;
                                        const statusText = done
                                            ? "Completed"
                                            : active
                                                ? totalResources > 0
                                                    ? `${opened}/${totalResources} opened`
                                                    : "In Progress"
                                                : unlocked
                                                    ? "Not Started"
                                                    : `Locked L${m.reqLevel}`;
                                        const statusColor = done ? "#00ff9d" : active ? "#00f5ff" : unlocked ? "var(--txt2)" : "#ff6d00";

                                        return (
                                            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.72rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 6 }}>
                                                <span style={{ color: "#e0f7fa" }}>{m.icon} {m.name}</span>
                                                <span style={{ color: statusColor, fontFamily: "Share Tech Mono", whiteSpace: "nowrap" }}>{statusText}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,245,255,0.08)", paddingTop: 24 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 14 }}>// RECENT ACTIVITY LOGS</div>
                            <div style={{ ...T.card, padding: 16, background: "rgba(0,0,0,0.2)", maxHeight: 220, overflowY: "auto" }}>
                                {logsLoading && (
                                    <div style={{ color: "var(--txt2)", fontSize: "0.75rem" }}>Loading logs...</div>
                                )}
                                {!logsLoading && activityLogs.length === 0 && (
                                    <div style={{ color: "var(--txt2)", fontSize: "0.75rem" }}>No activity logs yet.</div>
                                )}
                                {!logsLoading && activityLogs.map((log) => (
                                    <div key={log.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ color: "#e0f7fa", fontSize: "0.75rem" }}>{actionLabel(log.action)}</div>
                                        <div style={{ color: "var(--txt2)", fontSize: "0.65rem", fontFamily: "Share Tech Mono" }}>
                                            {formatLogTime(log.timestamp)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 16 }}>// SECURITY &amp; AUTHENTICATION</div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {user.isAnonymous && (
                                    <div style={{ padding: 15, background: "rgba(255,215,0,0.05)", borderRadius: 8, border: "1px dashed rgba(255,215,0,0.3)" }}>
                                        <div style={{ color: "#ffd700", fontFamily: "Orbitron", fontSize: "0.8rem", marginBottom: 5 }}>⚠️ GUEST PROFILE ALERT</div>
                                        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>Link your account to save XP and progress permanently.</p>
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button
                                                onClick={async () => {
                                                    try { setLoading(true); await linkGoogle(); showToast("LINKED TO GOOGLE", "ok"); }
                                                    catch (e) { showToast(e.message, "ng"); }
                                                    finally { setLoading(false); }
                                                }}
                                                style={{ ...T.btnP, flex: 1, fontSize: "0.75rem", background: "#fff", color: "#000" }}
                                            >Link Google</button>
                                            <button onClick={() => setLinkMode("email")} style={{ ...T.btnP, flex: 1, fontSize: "0.75rem" }}>Link Email</button>
                                        </div>
                                    </div>
                                )}

                                {linkMode === "email" && user.isAnonymous && (
                                    <div style={{ padding: 15, background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid rgba(0,245,255,0.2)" }}>
                                        <div style={{ ...T.secLbl, fontSize: "0.6rem", marginBottom: 10 }}>// ENTER CREDENTIALS</div>
                                        <input style={{ ...INP, marginBottom: 10 }} type="email" placeholder="Email" value={linkEmailData.email} onChange={e => setLinkEmailData({ ...linkEmailData, email: e.target.value })} />
                                        <input style={{ ...INP, marginBottom: 10 }} type="password" placeholder="Password" value={linkEmailData.password} onChange={e => setLinkEmailData({ ...linkEmailData, password: e.target.value })} />
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button
                                                onClick={async () => {
                                                    try { setLoading(true); await linkEmail(linkEmailData.email, linkEmailData.password); showToast("LINKED TO EMAIL", "ok"); setLinkMode(null); }
                                                    catch (e) { showToast(e.message, "ng"); }
                                                    finally { setLoading(false); }
                                                }}
                                                style={{ ...T.btnHP, flex: 2, fontSize: "0.75rem" }}
                                            >Confirm Link</button>
                                            <button onClick={() => setLinkMode(null)} style={{ ...T.btnG, flex: 1, fontSize: "0.75rem" }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {!user.emailVerified && !user.isAnonymous && (
                                    <div style={{ padding: 15, background: "rgba(255,71,87,0.05)", borderRadius: 8, border: "1px dashed rgba(255,71,87,0.3)" }}>
                                        <div style={{ color: "#ff4757", fontFamily: "Orbitron", fontSize: "0.8rem", marginBottom: 5 }}>⚡ VERIFICATION REQUIRED</div>
                                        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>Your identity is not verified.</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <button
                                                onClick={async () => {
                                                    try { setLoading(true); await linkGoogle(); showToast("VERIFIED VIA GOOGLE", "ok"); }
                                                    catch (e) { showToast(e.message, "ng"); }
                                                    finally { setLoading(false); }
                                                }}
                                                style={{ ...T.btnP, width: "100%", fontSize: "0.75rem", background: "#fff", color: "#000" }}
                                            >Verify via Google</button>
                                            <button
                                                onClick={async () => {
                                                    try { await verifyEmail(); showToast("VERIFICATION EMAIL SENT", "ok"); }
                                                    catch (e) { showToast(e.message, "ng"); }
                                                }}
                                                style={{ ...T.btnG, width: "100%", fontSize: "0.75rem" }}
                                            >✉️ Send Verification Email</button>
                                        </div>
                                    </div>
                                )}

                                {user.providerData.some(p => p.providerId === "password") && !user.isAnonymous && (
                                    <button
                                        onClick={async () => {
                                            try { await resetPassword(user.email); showToast("RESET LINK SENT", "ok"); }
                                            catch (e) { showToast(e.message, "ng"); }
                                        }}
                                        style={{ ...T.btnP, width: "100%", fontSize: "0.85rem", background: "transparent", border: "1px solid rgba(0,245,255,0.3)" }}
                                    >🔑 Send Password Reset Link</button>
                                )}

                                {user.providerData.some(p => p.providerId === "google.com") && (
                                    <div style={{ padding: 14, background: "rgba(0,245,255,0.08)", borderRadius: 8, border: "1px solid rgba(0,245,255,0.2)", fontSize: "0.8rem", color: "#00f5ff", fontFamily: "Share Tech Mono" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="18" alt="google" />
                                            ACCOUNT SECURED BY GOOGLE
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,71,87,0.1)", paddingTop: 16 }}>
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("CRITICAL: This permanently deletes your account and ALL progress. Cannot be undone. Proceed?")) return;
                                            try {
                                                setLoading(true);
                                                await deleteAccount();
                                                showToast("ACCOUNT DELETED.", "ok");
                                            } catch (e) {
                                                if (e.code === "auth/requires-recent-login") {
                                                    showToast("Please sign out and sign in again first.", "ng");
                                                } else { showToast(e.message, "ng"); }
                                            } finally { setLoading(false); }
                                        }}
                                        style={{ ...T.btnG, width: "100%", color: "#ff4757", borderColor: "rgba(255,71,87,0.3)", background: "rgba(255,71,87,0.05)", fontSize: "0.8rem" }}
                                    >
                                        ⚠️ Delete Account &amp; Wipe All Data (Permanent)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
