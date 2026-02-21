/**
 * UserContext
 * Provides the Firestore user profile document and XP/level/streak state
 * to the whole component tree.  Syncs with Firestore on sign-in.
 *
 * Usage:
 *   const { profile, awardXP, loading } = useUser();
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getUserProfile, awardXP as dbAwardXP, unlockBadge, updateStreak as dbUpdateStreak } from "../firebase/db";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch profile whenever auth user changes
    useEffect(() => {
        if (!user) { setProfile(null); return; }

        setLoading(true);
        getUserProfile(user.uid)
            .then(setProfile)
            .finally(() => setLoading(false));
    }, [user]);

    /** Award XP, persist to Firestore, and update local state. */
    const awardXP = useCallback(async (pts) => {
        if (!user) return;
        const updated = await dbAwardXP(user.uid, pts);
        setProfile((prev) => ({ ...prev, ...updated }));
        return updated;
    }, [user]);

    /** Update streak for today, persist to Firestore, and reflect locally. */
    const updateStreak = useCallback(async () => {
        if (!user) return;
        const newStreak = await dbUpdateStreak(user.uid);
        setProfile((prev) => ({ ...prev, streak: newStreak }));
        return newStreak;
    }, [user]);

    /** Refresh profile from Firestore. */
    const refreshProfile = useCallback(async () => {
        if (!user) return;
        const p = await getUserProfile(user.uid);
        setProfile(p);
        return p;
    }, [user]);

    /** Unlock a badge. */
    const earnBadge = useCallback(async (badgeId) => {
        if (!user) return;
        await unlockBadge(user.uid, badgeId);
        setProfile((prev) => ({
            ...prev,
            badges: [...(prev?.badges ?? []), badgeId],
        }));
    }, [user]);

    const value = { profile, loading, awardXP, updateStreak, refreshProfile, earnBadge };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
}
