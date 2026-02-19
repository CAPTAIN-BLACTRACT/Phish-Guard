/**
 * LoginPage
 * Full-screen animated login/register modal that integrates with Firebase Auth.
 * Supports: Google OAuth, email+password sign-in, and new account registration.
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ onClose }) {
    const { signInWithGoogle, signInEmail, registerEmail, resetPassword } = useAuth();

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
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };

    const handleGoogle = () => handle(signInWithGoogle);
    const handleSignIn = (e) => { e.preventDefault(); handle(() => signInEmail(email, password)); };
    const handleRegister = (e) => { e.preventDefault(); handle(() => registerEmail(email, password, name)); };
    const handleReset = async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try { await resetPassword(email); setMsg("Reset link sent – check your inbox!"); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    };

    /* ── Styles ── */
    const overlay = {
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
    };
    const card = {
        background: "linear-gradient(145deg,#0a0e1a,#0d1525)",
        border: "1px solid rgba(0,245,255,0.2)",
        borderRadius: 20, padding: "2.5rem",
        width: "100%", maxWidth: 420,
        boxShadow: "0 0 60px rgba(0,245,255,0.15), 0 0 120px rgba(213,0,249,0.1)",
        position: "relative",
    };
    const inp = {
        width: "100%", padding: "0.75rem 1rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(0,245,255,0.25)",
        borderRadius: 10, color: "#fff",
        fontFamily: "inherit", fontSize: "0.95rem",
        outline: "none", boxSizing: "border-box",
        marginBottom: "0.75rem",
    };
    const btn = (grad) => ({
        width: "100%", padding: "0.8rem",
        background: grad, border: "none",
        borderRadius: 10, color: "#fff",
        fontFamily: "inherit", fontWeight: 700,
        fontSize: "0.95rem", cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.6 : 1,
        marginBottom: "0.5rem",
        transition: "opacity .2s",
    });

    return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <div style={card}>
                {/* Close */}
                <button onClick={onClose} style={{
                    position: "absolute", top: 16, right: 16, background: "none", border: "none",
                    color: "rgba(255,255,255,0.5)", fontSize: "1.4rem", cursor: "pointer",
                }}>✕</button>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🛡️</div>
                    <h2 style={{
                        margin: 0, fontFamily: "Share Tech Mono,monospace",
                        background: "linear-gradient(135deg,#00f5ff,#d500f9)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        fontSize: "1.6rem",
                    }}>PhishGuard</h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", marginTop: 4, fontSize: "0.85rem" }}>
                        {mode === "login" && "Sign in to your account"}
                        {mode === "register" && "Create a new account"}
                        {mode === "reset" && "Reset your password"}
                    </p>
                </div>

                {/* Error / Success */}
                {error && <p style={{
                    color: "#ff4757", background: "rgba(255,71,87,0.1)",
                    padding: "0.6rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem"
                }}>{error}</p>}
                {msg && <p style={{
                    color: "#00f5ff", background: "rgba(0,245,255,0.1)",
                    padding: "0.6rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem"
                }}>{msg}</p>}

                {/* ── Login form ── */}
                {mode === "login" && (
                    <>
                        <button onClick={handleGoogle} style={btn("linear-gradient(135deg,#4285f4,#34a853)")}>
                            🔗 Continue with Google
                        </button>
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", margin: "0.75rem 0", fontSize: "0.8rem" }}>
                            — or —
                        </div>
                        <form onSubmit={handleSignIn}>
                            <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <button type="submit" style={btn("linear-gradient(135deg,#00f5ff,#d500f9)")} disabled={busy}>
                                {busy ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                        <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                            <span onClick={() => setMode("reset")} style={{ cursor: "pointer", color: "#00f5ff" }}>Forgot password?</span>
                            {" · "}
                            <span onClick={() => setMode("register")} style={{ cursor: "pointer", color: "#d500f9" }}>Create account</span>
                        </div>
                    </>
                )}

                {/* ── Register form ── */}
                {mode === "register" && (
                    <>
                        <button onClick={handleGoogle} style={btn("linear-gradient(135deg,#4285f4,#34a853)")}>
                            🔗 Sign up with Google
                        </button>
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", margin: "0.75rem 0", fontSize: "0.8rem" }}>
                            — or with email —
                        </div>
                        <form onSubmit={handleRegister}>
                            <input style={inp} type="text" placeholder="Display Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input style={inp} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                            <button type="submit" style={btn("linear-gradient(135deg,#00ff9d,#00b8ff)")} disabled={busy}>
                                {busy ? "Creating…" : "Create Account"}
                            </button>
                        </form>
                        <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                            Already have an account?{" "}
                            <span onClick={() => setMode("login")} style={{ cursor: "pointer", color: "#00f5ff" }}>Sign in</span>
                        </div>
                    </>
                )}

                {/* ── Reset form ── */}
                {mode === "reset" && (
                    <>
                        <form onSubmit={handleReset}>
                            <input style={inp} type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <button type="submit" style={btn("linear-gradient(135deg,#ff6b6b,#ffa502)")} disabled={busy}>
                                {busy ? "Sending…" : "Send Reset Link"}
                            </button>
                        </form>
                        <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                            <span onClick={() => setMode("login")} style={{ cursor: "pointer", color: "#00f5ff" }}>Back to Sign In</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
