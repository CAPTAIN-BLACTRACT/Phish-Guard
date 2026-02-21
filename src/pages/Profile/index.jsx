import { useState, useEffect } from "react";
import { T } from '../../styles';
import { PageHeader } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { db, storage } from '../../firebase/config';
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { BADGES } from '../../constants';

export function ProfilePage({ showToast }) {
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useUser();
    const [loading, setLoading] = useState(false);

    // XP and level logic
    const level = profile?.level || 1;
    const xp = profile?.xp || 0;
    const streak = profile?.streak || 0;

    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        specialization: "General Defense"
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || user?.displayName || "",
                bio: profile.bio || "",
                specialization: profile.specialization || "General Defense"
            });
        }
    }, [profile, user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ...formData,
                updatedAt: new Date()
            });
            showToast("PROFILE SYNCHRONIZED", "ok");
        } catch (err) {
            showToast(err.message, "ng");
        } finally {
            setLoading(false);
        }
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
        } catch (err) {
            showToast(err.message, "ng");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ ...T.page, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ ...T.card, padding: 40, textAlign: "center" }}>
                    <PageHeader label="ERROR 401" title="UNAUTHORIZED" subtitle="Please initialize session to access dossier." />
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...T.page, background: "transparent" }}>
            <section style={{ ...T.sec, maxWidth: 900, margin: "0 auto", padding: "80px 20px" }}>
                <PageHeader label="AGENT DOSSIER" title="Identity Management" subtitle="Refine your presence in the digital defense grid." />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                    {/* Left: Avatar & Badges */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ ...T.card, padding: 30, textAlign: "center" }}>
                            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
                                <img
                                    src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || 'agent'}&backgroundColor=00f5ff`}
                                    alt="avatar"
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #00f5ff", boxShadow: "0 0 20px rgba(0,245,255,0.3)" }}
                                />
                                <label style={{
                                    position: "absolute", bottom: 0, right: 0,
                                    background: "#00f5ff", color: "#000", width: 32, height: 32,
                                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", border: "2px solid #000", fontSize: "0.9rem"
                                }}>
                                    📸
                                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <h2 style={{ fontFamily: "Orbitron", fontSize: "1.2rem", color: "#e0f7fa" }}>{profile?.displayName || user?.displayName || "Agent"}</h2>
                            <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono", fontSize: "0.8rem", marginBottom: 15 }}>LVL {level} DEFENDER</div>

                            <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid rgba(0,245,255,0.1)", paddingTop: 20 }}>
                                <div>
                                    <div style={{ color: "#00f5ff", fontWeight: 700 }}>{xp}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem" }}>XP</div>
                                </div>
                                <div>
                                    <div style={{ color: "#ff6d00", fontWeight: 700 }}>{streak}</div>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.65rem" }}>STREAK</div>
                                </div>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div style={{ ...T.card, padding: 25 }}>
                            <div style={{ ...T.secLbl, fontSize: "0.7rem", marginBottom: 15 }}>// ACHIEVEMENT BADGES</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                                {BADGES.map((b, i) => {
                                    const isEarned = (b.req.type === 'level' && level >= b.req.value) ||
                                        (b.req.type === 'xp' && xp >= b.req.value) ||
                                        (b.req.type === 'streak' && streak >= b.req.value);

                                    const prog = !isEarned ? (
                                        b.req.type === 'xp' ? `${b.req.value - xp} XP` :
                                            b.req.type === 'level' ? `LVL ${b.req.value}` :
                                                `${b.req.value - streak}D`
                                    ) : null;

                                    return (
                                        <div key={i} title={b.name} style={{
                                            textAlign: "center",
                                            padding: 8,
                                            background: isEarned ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.3)",
                                            border: `1px solid ${isEarned ? "rgba(0,245,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                                            borderRadius: 4,
                                            opacity: isEarned ? 1 : 0.6
                                        }}>
                                            <div style={{ fontSize: "1.2rem" }}>{b.icon}</div>
                                            <div style={{ fontSize: "0.5rem", color: isEarned ? "#00f5ff" : "var(--txt2)", fontFamily: "Share Tech Mono", marginTop: 4 }}>{b.name}</div>
                                            {!isEarned && prog && (
                                                <div style={{ fontSize: "0.45rem", color: "var(--txt2)", marginTop: 2 }}>{prog}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {(() => {
                                const nextB = BADGES.find(b => {
                                    const earned = (b.req.type === 'level' && level >= b.req.value) ||
                                        (b.req.type === 'xp' && xp >= b.req.value) ||
                                        (b.req.type === 'streak' && streak >= b.req.value);
                                    return !earned;
                                });
                                if (!nextB) return null;
                                const diff = nextB.req.type === 'xp' ? `${nextB.req.value - xp} XP` :
                                    nextB.req.type === 'level' ? `Level ${nextB.req.value}` :
                                        `${nextB.req.value - streak} days`;
                                return (
                                    <div style={{
                                        marginTop: 15, padding: 10, background: "rgba(0,245,255,0.05)", borderRadius: 4,
                                        border: "1px solid rgba(0,245,255,0.1)", fontSize: "0.65rem", color: "var(--txt2)",
                                        fontFamily: "Share Tech Mono"
                                    }}>
                                        Next Badge: <span style={{ color: "#00f5ff" }}>{nextB.name}</span> ({diff} left)
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div style={{ ...T.card, padding: 35 }}>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Codename</label>
                                <input
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit" }}
                                    value={formData.displayName}
                                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Bio / Mission Statement</label>
                                <textarea
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit", minHeight: 100 }}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Identify your defense methodology..."
                                />
                            </div>

                            <div>
                                <label style={{ color: "var(--txt2)", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Specialization</label>
                                <select
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit" }}
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                >
                                    <option>Student / Learner</option>
                                    <option>Working Professional</option>
                                    <option>Senior Citizen</option>
                                    <option>Tech Enthusiast</option>
                                    <option>Business Owner</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...T.btnHP, marginTop: 10, width: "100%", justifyContent: "center" }}
                            >
                                {loading ? "SYNCHRONIZING..." : "UPDATE DOSSIER"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
