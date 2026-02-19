/**
 * AuthContext
 * Provides the currently signed-in Firebase user (or null) to the whole tree.
 * Also exposes sign-in / sign-out helpers directly from context.
 *
 * Usage:
 *   const { user, loading, signInWithGoogle, signOutUser } = useAuth();
 */
import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthChange,
    signInWithGoogle,
    signInEmail,
    registerEmail,
    signOutUser,
    resetPassword,
} from "../firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsub;
    }, []);

    const value = {
        user,
        loading,
        signInWithGoogle,
        signInEmail,
        registerEmail,
        signOutUser,
        resetPassword,
    };

    // While Firebase resolves existing sessions don't flash the UI
    if (loading) return null;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Returns the current auth context. Must be called inside <AuthProvider>. */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
