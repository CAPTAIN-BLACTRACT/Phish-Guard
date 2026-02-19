import { useState, useEffect } from "react";
import { T } from "../styles";
import { CyberBackground } from "../components";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { db, storage } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function ProfilePage({ showToast }) {
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useUser();
    const [loading, setLoading] = useState(false);
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
            <div style={{ ...T.page, background: "#000509", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CyberBackground />
                <div style={{ ...T.card, padding: 40, textAlign: "center" }}>
                    <div style={T.secLbl}>// ERROR 401</div>
                    <h2 style={T.secTitle}>UNAUTHORIZED</h2>
                    <p style={{ color: "#546e7a" }}>Please initialize session to access dossier.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...T.page, background: "#000509" }}>
            <CyberBackground />
            <section style={{ ...T.sec, maxWidth: 900, margin: "0 auto" }}>
                <div style={{ marginBottom: 40 }}>
                    <div style={T.secLbl}>// AGENT DOSSIER</div>
                    <h1 style={T.secTitle}>Identity Management</h1>
                    <p style={{ color: "#546e7a" }}>Refine your presence in the digital defense grid.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
                    {/* Left: Avatar & Stats */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ ...T.card, padding: 30, textAlign: "center" }}>
                            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
                                <img
                                    src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`}
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
                            <div style={{ color: "#00f5ff", fontFamily: "Share Tech Mono", fontSize: "0.8rem", marginBottom: 15 }}>LVL {profile?.level || 1} DEFENDER</div>

                            <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid rgba(0,245,255,0.1)", paddingTop: 20 }}>
                                <div>
                                    <div style={{ color: "#00f5ff", fontWeight: 700 }}>{profile?.xp || 0}</div>
                                    <div style={{ color: "#546e7a", fontSize: "0.65rem" }}>XP</div>
                                </div>
                                <div>
                                    <div style={{ color: "#ff6d00", fontWeight: 700 }}>{profile?.streak || 0}</div>
                                    <div style={{ color: "#546e7a", fontSize: "0.65rem" }}>STREAK</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ ...T.card, padding: 25 }}>
                            <h3 style={{ color: "#00f5ff", fontSize: "0.85rem", marginBottom: 15, fontFamily: "Orbitron" }}>Badges Earned</h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {(profile?.badges || ["🛡️"]).map((b, i) => (
                                    <span key={i} title="Master of Defense" style={{ fontSize: "1.5rem", filter: "drop-shadow(0 0 8px rgba(0,245,255,0.4))" }}>{b}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div style={{ ...T.card, padding: 35 }}>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ color: "#546e7a", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Codename</label>
                                <input
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit" }}
                                    value={formData.displayName}
                                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ color: "#546e7a", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Bio / Mission Statement</label>
                                <textarea
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit", minHeight: 100 }}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Identify your defense methodology..."
                                />
                            </div>

                            <div>
                                <label style={{ color: "#546e7a", fontSize: "0.75rem", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Specialization</label>
                                <select
                                    style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit" }}
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                >
                                    <option>General Defense</option>
                                    <option>Anti-Phishing Elite</option>
                                    <option>Zero-Trust Specialist</option>
                                    <option>Social Engineering Auditor</option>
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
