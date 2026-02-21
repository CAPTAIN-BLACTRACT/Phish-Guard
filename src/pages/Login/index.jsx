import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { T } from '../../styles';

export default function LoginPage({ onClose }) {
    const { signInWithGoogle, signInEmail, registerEmail, resetPassword, signInGuest } = useAuth();

    const [mode, setMode] = useState("login");   // "login" | "register" | "reset"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const handle = async (fn) => {
        setError(""); setMsg(""); setBusy(true);
        try { await fn(); if (onClose) onClose(); }
        catch (e) {
            console.error("Auth Error:", e.code, e.message);
            if (e.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with this email using a different login method (e.g. Google). Please use that method to sign in.");
            } else if (e.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please sign in instead.");
            } else if (e.code === "auth/wrong-password" || e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
                setError("Invalid email or password. Please try again.");
            } else if (e.code === "auth/weak-password") {
                setError("Password is too weak. Please use at least 6 characters.");
            } else {
                setError(e.message);
            }
        }
        finally { setBusy(false); }
    };

    const handleGoogle = () => handle(signInWithGoogle);
    const handleSignIn = (e) => { e.preventDefault(); handle(() => signInEmail(email, password)); };
    const handleRegister = (e) => { e.preventDefault(); handle(() => registerEmail(email, password, name)); };
    const handleGuest = () => handle(signInGuest);
    const handleReset = async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try { await resetPassword(email); setMsg("Reset link sent – check your inbox!"); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
            style={{
                position: "fixed", inset: 0, zIndex: 9000,
                background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem",
            }}
        >
            <style>{`
              @keyframes loginPop { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
              @media (max-width: 500px) {
                .login-card { padding: 24px !important; }
              }
            `}</style>
            <div
                className="login-card"
                style={{
                    background: "linear-gradient(145deg,#0a0e1a,#0d1525)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: 20, padding: 40, width: "100%", maxWidth: 420,
                    boxShadow: "0 0 60px rgba(0,245,255,0.15)",
                    position: "relative", animation: "loginPop 0.4s ease both"
                }}
            >
                <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>🛡️</div>
                    <h2 style={{ margin: 0, fontFamily: "Orbitron, sans-serif", color: "#00f5ff", fontSize: "1.5rem" }}>Authentication</h2>
                    <p style={{ color: "var(--txt2)", marginTop: 4, fontSize: "0.85rem", fontFamily: "Share Tech Mono" }}>PHISH-GUARD TERMINAL v1.0</p>
                </div>

                {error && (
                    <div style={{ color: "#ff4757", background: "rgba(255,71,87,0.1)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: "0.8rem", border: "1px solid rgba(255,71,87,0.2)" }}>
                        <strong>AUTH_ERROR:</strong> {error}
                        {error.includes("auth/operation-not-allowed") && <div style={{ marginTop: 8, color: "#00f5ff", fontSize: "0.7rem" }}>Tip: Enable Google Auth in Firebase Console!</div>}
                    </div>
                )}
                {msg && <p style={{ color: "#00f5ff", background: "rgba(0,245,255,0.1)", padding: 10, borderRadius: 8, marginBottom: 16, fontSize: "0.85rem" }}>{msg}</p>}

                {mode === "login" && (
                    <>
                        <button onClick={handleGoogle} disabled={busy} style={{ ...T.btnP, width: "100%", marginBottom: 12, background: "#fff", color: "#000", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="18" style={{ marginRight: 10 }} alt="google" />
                            Sign in with Google
                        </button>
                        <button onClick={handleGuest} disabled={busy} style={{ ...T.btnG, width: "100%", marginBottom: 16 }}>
                            ⚡ Continue as Guest
                        </button>
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", margin: "12px 0", fontSize: "0.75rem" }}>— OR —</div>
                        <form onSubmit={handleSignIn}>
                            <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 12 }} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 6 }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <div style={{ textAlign: "right", marginBottom: 16 }}>
                                <span onClick={() => setMode("reset")} style={{ cursor: "pointer", color: "var(--txt2)", fontSize: "0.75rem", fontFamily: "Share Tech Mono" }}>Forgot Password?</span>
                            </div>
                            <button type="submit" disabled={busy} style={{ ...T.btnP, width: "100%" }}>{busy ? "Authenticating..." : "Sign In"}</button>
                        </form>
                        <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: "rgba(0,245,255,0.05)", border: "1px dashed rgba(0,245,255,0.3)" }}>
                            <div style={{ fontSize: "0.7rem", color: "#00f5ff", fontFamily: "Share Tech Mono", marginBottom: 4 }}>// DEMO CONSOLE</div>
                            <div style={{ fontSize: "0.75rem", color: "#90a4ae" }}>Email: <span style={{ color: "#fff" }}>sumitboy2005@gmail.com</span></div>
                            <div style={{ fontSize: "0.75rem", color: "#90a4ae" }}>Pass: <span style={{ color: "#fff" }}>demo123</span></div>
                        </div>
                        <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", color: "var(--txt2)" }}>
                            New recruit? <span onClick={() => setMode("register")} style={{ cursor: "pointer", color: "#00f5ff" }}>Create Account</span>
                        </div>
                    </>
                )}

                {mode === "reset" && (
                    <>
                        <p style={{ color: "var(--txt2)", fontSize: "0.85rem", marginBottom: 20, textAlign: "center" }}>Enter your email and we'll send a transmission to reset your credentials.</p>
                        <form onSubmit={handleReset}>
                            <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 16 }} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                            <button type="submit" disabled={busy} style={{ ...T.btnP, width: "100%" }}>{busy ? "Transmitting..." : "Send Reset Link"}</button>
                        </form>
                        <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", color: "var(--txt2)" }}>
                            Back to <span onClick={() => setMode("login")} style={{ cursor: "pointer", color: "#00f5ff" }}>Sign In</span>
                        </div>
                    </>
                )}

                {mode === "register" && (
                    <form onSubmit={handleRegister}>
                        <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 12 }} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                        <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 12 }} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "#fff", marginBottom: 16 }} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                        <button type="submit" disabled={busy} style={{ ...T.btnP, width: "100%" }}>{busy ? "Initializing..." : "Register Now"}</button>
                        <div style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", color: "var(--txt2)" }}>
                            Already guarded? <span onClick={() => setMode("login")} style={{ cursor: "pointer", color: "#00f5ff" }}>Sign In</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
