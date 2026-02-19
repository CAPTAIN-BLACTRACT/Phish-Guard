/**
 * Firestore database helpers
 * Collections:
 *   users/         – user profiles, XP, level, streak, badges
 *   quizResults/   – per-attempt quiz scores
 *   simulatorLogs/ – phishing simulator attempt logs
 *   leaderboard/   – denormalised leaderboard snapshot (updated on XP change)
 *   gallery/       – user-submitted entries (reported phishing examples)
 */
import {
    doc, getDoc, setDoc, updateDoc, addDoc, getDocs,
    collection, query, orderBy, limit, where,
    serverTimestamp, increment, arrayUnion,
} from "firebase/firestore";

import { db } from "./config";

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Create or merge a user document on first sign-in. */
export async function createOrUpdateUser(firebaseUser) {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName ?? "Agent",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL ?? null,
            xp: 0,
            level: 1,
            streak: 0,
            lastActive: serverTimestamp(),
            badges: [],
            createdAt: serverTimestamp(),
        });
    } else {
        // Refresh last-active timestamp only
        await updateDoc(ref, { lastActive: serverTimestamp() });
    }
}

/** Fetch a user's profile document. */
export async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
}

/** Update arbitrary fields on a user document. */
export async function updateUserProfile(uid, fields) {
    await updateDoc(doc(db, "users", uid), fields);
}

/**
 * Award XP and update level if needed.
 * Returns the new { xp, level } values.
 */
export async function awardXP(uid, pts) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    const data = snap.data() ?? { xp: 0, level: 1 };

    const XP_PER_LEVEL = [0, 500, 1200, 2100, 3200, 4500, 6000, 7700, 9600, 11700];
    const newXP = (data.xp ?? 0) + pts;
    let newLevel = data.level ?? 1;

    while (newLevel < 10 && newXP >= (XP_PER_LEVEL[newLevel] ?? Infinity)) {
        newLevel++;
    }

    await updateDoc(ref, { xp: newXP, level: newLevel, lastActive: serverTimestamp() });

    // Mirror to leaderboard collection
    await setDoc(doc(db, "leaderboard", uid), {
        uid,
        displayName: data.displayName,
        photoURL: data.photoURL ?? null,
        xp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    return { xp: newXP, level: newLevel };
}

/** Unlock a badge for a user. */
export async function unlockBadge(uid, badgeId) {
    await updateDoc(doc(db, "users", uid), {
        badges: arrayUnion(badgeId),
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Save the result of a quiz attempt. */
export async function saveQuizResult({ uid, score, total, xpEarned, category }) {
    await addDoc(collection(db, "quizResults"), {
        uid,
        score,
        total,
        xpEarned,
        category: category ?? "general",
        completedAt: serverTimestamp(),
    });
}

/** Get past quiz results for a user (latest 20). */
export async function getUserQuizResults(uid) {
    const q = query(
        collection(db, "quizResults"),
        where("uid", "==", uid),
        orderBy("completedAt", "desc"),
        limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR LOGS
// ═══════════════════════════════════════════════════════════════════════════════

/** Log a simulator attempt (correct / incorrect, which scenario, time taken). */
export async function logSimulatorAttempt({ uid, scenarioId, detected, timeTakenMs, xpEarned }) {
    await addDoc(collection(db, "simulatorLogs"), {
        uid,
        scenarioId,
        detected,
        timeTakenMs,
        xpEarned,
        attemptedAt: serverTimestamp(),
    });
}

/** Get simulator logs for a user. */
export async function getUserSimulatorLogs(uid) {
    const q = query(
        collection(db, "simulatorLogs"),
        where("uid", "==", uid),
        orderBy("attemptedAt", "desc"),
        limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch top N leaderboard entries ordered by XP desc. */
export async function getLeaderboard(topN = 50) {
    const q = query(
        collection(db, "leaderboard"),
        orderBy("xp", "desc"),
        limit(topN)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit a gallery entry (user-reported phishing example). */
export async function addGalleryEntry({ uid, displayName, title, description, imageURL, tags }) {
    await addDoc(collection(db, "gallery"), {
        uid,
        displayName,
        title,
        description,
        imageURL: imageURL ?? null,
        tags: tags ?? [],
        likes: 0,
        submittedAt: serverTimestamp(),
    });
}

/** Fetch gallery entries (latest 50). */
export async function getGalleryEntries(topN = 50) {
    const q = query(
        collection(db, "gallery"),
        orderBy("submittedAt", "desc"),
        limit(topN)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Increment likes on a gallery entry. */
export async function likeGalleryEntry(entryId) {
    await updateDoc(doc(db, "gallery", entryId), { likes: increment(1) });
}
