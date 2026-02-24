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
    completeRedirectSignIn,
    signInWithGoogle,
    signInEmail,
    registerEmail,
    signOutUser,
    resetPassword,
    signInGuest,
    verifyEmail,
    linkGoogle,
    linkEmail,
    deleteAccount,
} from "../firebase/auth";

const AuthContext = createContext(null);
const DEV_AUTH_FALLBACK = {
    user: null,
    loading: true,
    signInWithGoogle: async () => null,
    signInEmail: async () => null,
    registerEmail: async () => null,
    signOutUser: async () => null,
    resetPassword: async () => null,
    signInGuest: async () => null,
    verifyEmail: async () => null,
    linkGoogle: async () => null,
    linkEmail: async () => null,
    deleteAccount: async () => null,
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        completeRedirectSignIn().catch((error) => {
            if (import.meta.env.DEV) {
                console.warn("Redirect sign-in resolution failed:", error?.code || error?.message);
            }
        });

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
        signInGuest,
        verifyEmail,
        linkGoogle,
        linkEmail,
        deleteAccount,
    };

    // While Firebase resolves existing sessions don't flash the UI
    if (loading) return null;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Returns the current auth context. Must be called inside <AuthProvider>. */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        if (import.meta.env.DEV) return DEV_AUTH_FALLBACK;
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
