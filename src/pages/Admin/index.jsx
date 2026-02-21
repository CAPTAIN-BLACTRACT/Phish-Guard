import { useState } from "react";
import { T } from '../../styles';
import { PageHeader } from '../../components';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function AdminPage({ showToast }) {
    const [pass, setPass] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [activeTab, setActiveTab] = useState("quiz");
    const [loading, setLoading] = useState(false);

    // Forms State
    const [quizForm, setQuizForm] = useState({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
    const [galleryForm, setGalleryForm] = useState({ title: "", description: "", type: "phish", file: null });

    const handleAuth = (e) => {
        e.preventDefault();
        if (pass === "phishguard2026") setIsAuth(true);
        else showToast("INVALID ACCESS KEY", "ng");
    };

    if (!isAuth) {
        return (
            <div style={{ ...T.page, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>

                <form onSubmit={handleAuth} style={{ ...T.card, padding: 40, maxWidth: 400, width: "100%", textAlign: "center" }}>
                    <PageHeader label="RESTRICTED AREA" title="Admin Access" />
                    <input
                        type="password"
                        placeholder="ENTER ACCESS KEY"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, textAlign: "center", fontFamily: "Share Tech Mono", marginBottom: 20 }}
                    />
                    <button type="submit" style={T.btnHP}>INITIALIZE SESSION</button>
                </form>
            </div>
        )
    }

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "quizzes"), quizForm);
            showToast("Quiz question added successfully!", "ok");
            setQuizForm({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
        } catch (err) {
            showToast(err.message, "ng");
        } finally {
            setLoading(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        e.preventDefault();
        if (!galleryForm.file) return showToast("Please select an image", "inf");
        setLoading(true);
        try {
            const fileRef = ref(storage, `gallery/${Date.now()}_${galleryForm.file.name}`);
            await uploadBytes(fileRef, galleryForm.file);
            const url = await getDownloadURL(fileRef);

            await addDoc(collection(db, "gallery"), {
                title: galleryForm.title,
                description: galleryForm.description,
                type: galleryForm.type,
                imageUrl: url,
                timestamp: serverTimestamp(),
                approved: true
            });

            showToast("Gallery item uploaded!", "ok");
            setGalleryForm({ title: "", description: "", type: "phish", file: null });
        } catch (err) {
            showToast(err.message, "ng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...T.page, background: "#000509" }}>

            <section style={T.sec}>
                <PageHeader label="COMMAND CENTER" title="Admin Dashboard" />

                <div style={{ display: "flex", gap: 12, marginBottom: 30, flexWrap: "wrap" }}>
                    {["quiz", "simulator", "gallery", "analytics"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...T.btnG,
                                background: activeTab === tab ? "rgba(0,245,255,0.1)" : "transparent",
                                borderColor: activeTab === tab ? "#00f5ff" : "rgba(0,245,255,0.2)",
                                color: activeTab === tab ? "#00f5ff" : "var(--txt2)",
                                textTransform: "uppercase",
                                padding: "10px 20px"
                            }}
                        >
                            Manage {tab}
                        </button>
                    ))}
                </div>

                <div style={{ ...T.card, padding: 30 }}>
                    {activeTab === "quiz" && (
                        <form onSubmit={handleAddQuiz}>
                            <h2 style={{ ...T.secTitle, fontSize: "1.2rem", color: "#00f5ff", marginBottom: 20 }}>Add New Quiz Question</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                                <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Question Text</label>
                                <textarea
                                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, fontFamily: "inherit", minHeight: 80 }}
                                    value={quizForm.question}
                                    onChange={e => setQuizForm({ ...quizForm, question: e.target.value })}
                                    required
                                />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                                    {quizForm.options.map((opt, i) => (
                                        <div key={i}>
                                            <label style={{ color: "var(--txt2)", fontSize: "0.7rem" }}>Option {i + 1}</label>
                                            <input
                                                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 10, borderRadius: 4 }}
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...quizForm.options];
                                                    newOpts[i] = e.target.value;
                                                    setQuizForm({ ...quizForm, options: newOpts });
                                                }}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                                    <div>
                                        <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Correct Answer (Index 0-3)</label>
                                        <input
                                            type="number" min="0" max="3"
                                            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 10, borderRadius: 4 }}
                                            value={quizForm.answer}
                                            onChange={e => setQuizForm({ ...quizForm, answer: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Difficulty Level</label>
                                        <select style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 10, borderRadius: 4 }}>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} style={{ ...T.btnHP, marginTop: 10 }}>
                                    {loading ? "INITIALIZING..." : "UPLOAD TO CLOUD"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "gallery" && (
                        <form onSubmit={handleGalleryUpload}>
                            <h2 style={{ ...T.secTitle, fontSize: "1.2rem", color: "#00f5ff", marginBottom: 20 }}>Upload Threat Example</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                                <div>
                                    <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Threat Title</label>
                                    <input
                                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 10, borderRadius: 4 }}
                                        value={galleryForm.title}
                                        onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Description / Critical Info</label>
                                    <textarea
                                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 12, borderRadius: 4, minHeight: 80 }}
                                        value={galleryForm.description}
                                        onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                                    <div>
                                        <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Type</label>
                                        <select
                                            value={galleryForm.type}
                                            onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value })}
                                            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", padding: 10, borderRadius: 4 }}
                                        >
                                            <option value="phish">Phishing Email</option>
                                            <option value="smish">Smishing (SMS)</option>
                                            <option value="vishing">Vishing (Voice)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ color: "var(--txt2)", fontSize: "0.8rem" }}>Screenshot</label>
                                        <input
                                            type="file" accept="image/*"
                                            onChange={e => setGalleryForm({ ...galleryForm, file: e.target.files[0] })}
                                            style={{ color: "var(--txt2)", fontSize: "0.8rem" }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} style={{ ...T.btnHP, marginTop: 10 }}>
                                    {loading ? "UPLOADING ASSETS..." : "SUBMIT TO GALLERY"}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "simulator" && (
                        <div>
                            <h2 style={{ ...T.secTitle, fontSize: "1.2rem", color: "#00f5ff", marginBottom: 20 }}>Configure Simulation Stage</h2>
                            <p style={{ color: "var(--txt2)" }}>Simulation deployment tools are coming soon. This will allow you to define email headers, body content, and specific red flags for new training scenarios.</p>
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                            {[
                                { lbl: "TOTAL RECRUITS", val: "12,482" },
                                { lbl: "ACTIVE SESSIONS", val: "142" },
                                { lbl: "THREATS NEUTRALIZED", val: "847" },
                                { lbl: "AVG DEFENSE SCORE", val: "78%" }
                            ].map(stat => (
                                <div key={stat.lbl} style={{ padding: 20, background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)", borderRadius: 4 }}>
                                    <div style={{ color: "var(--txt2)", fontSize: "0.7rem", marginBottom: 8 }}>{stat.lbl}</div>
                                    <div style={{ color: "#00f5ff", fontSize: "1.5rem", fontWeight: 700, fontFamily: "Orbitron" }}>{stat.val}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
