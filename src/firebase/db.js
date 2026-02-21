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
    doc, getDoc, setDoc, updateDoc, addDoc, getDocs, deleteDoc, writeBatch,
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
        // Enforce anonymity by default - don't leak Google Name/Image
        const anonymousName = `Agent_${firebaseUser.uid.slice(0, 5).toUpperCase()}`;
        const anonymousPhoto = `https://api.dicebear.com/7.x/identicon/svg?seed=${firebaseUser.uid}`;

        await setDoc(ref, {
            uid: firebaseUser.uid,
            displayName: anonymousName,
            email: firebaseUser.email,
            photoURL: anonymousPhoto,
            xp: 0,
            level: 1,
            streak: 0,
            quizAttempts: 0,
            quizCorrect: 0,
            simulationsDone: 0,
            emailsFlagged: 0,
            trainingModulesCompleted: 0,
            trainingProgress: {},
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
export async function saveQuizResult(payloadOrUid, maybePayload = {}) {
    const payload = typeof payloadOrUid === "string"
        ? { ...maybePayload, uid: payloadOrUid }
        : (payloadOrUid || {});

    const uid = payload.uid;
    if (!uid) throw new Error("saveQuizResult requires uid.");

    const score = Number.isFinite(payload.score) ? payload.score : (payload.correct ? 1 : 0);
    const total = Number.isFinite(payload.total) ? payload.total : 1;
    const xpEarned = Number.isFinite(payload.xpEarned) ? payload.xpEarned : 0;
    const category = payload.category ?? payload.topic ?? "general";
    const isCorrect = typeof payload.correct === "boolean"
        ? payload.correct
        : score >= total;

    await addDoc(collection(db, "quizResults"), {
        uid,
        score,
        total,
        xpEarned,
        category,
        questionId: payload.questionId ?? null,
        difficulty: payload.difficulty ?? "unknown",
        correct: isCorrect,
        completedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "users", uid), {
        quizAttempts: increment(1),
        quizCorrect: increment(isCorrect ? 1 : 0),
        lastActive: serverTimestamp(),
    }, { merge: true });

    await logPlatformAction(uid, "QUIZ_ATTEMPT", {
        category,
        isCorrect,
        score,
        total,
        xpEarned,
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
export async function logSimulatorAttempt(payloadOrUid, maybePayload = {}) {
    const payload = typeof payloadOrUid === "string"
        ? { ...maybePayload, uid: payloadOrUid }
        : (payloadOrUid || {});

    const uid = payload.uid;
    if (!uid) throw new Error("logSimulatorAttempt requires uid.");

    const scenarioId = payload.scenarioId ?? payload.stageId ?? "unknown";
    const detected = typeof payload.detected === "boolean"
        ? payload.detected
        : Boolean(payload.completed);
    const flagsFound = Number.isFinite(payload.flagsFound)
        ? payload.flagsFound
        : (detected ? 1 : 0);
    const totalFlags = Number.isFinite(payload.totalFlags)
        ? payload.totalFlags
        : 1;
    const timeTakenMs = Number.isFinite(payload.timeTakenMs) ? payload.timeTakenMs : null;
    const xpEarned = Number.isFinite(payload.xpEarned) ? payload.xpEarned : 0;

    await addDoc(collection(db, "simulatorLogs"), {
        uid,
        scenarioId,
        detected,
        timeTakenMs,
        xpEarned,
        flagsFound,
        totalFlags,
        attemptedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "users", uid), {
        simulationsDone: increment(1),
        emailsFlagged: increment(Math.max(0, flagsFound)),
        lastActive: serverTimestamp(),
    }, { merge: true });

    await logPlatformAction(uid, "SIMULATION_ATTEMPT", {
        scenarioId,
        detected,
        flagsFound,
        totalFlags,
        xpEarned,
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
    return snap.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// STREAK TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Update daily streak for a user.
 * Increments streak if last active was yesterday, resets if > 1 day gap.
 * Returns the new streak count.
 */
export async function updateStreak(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return 0;

    const data = snap.data();
    const now = new Date();
    const lastActive = data.lastActive?.toDate?.() ?? new Date(0);

    const daysSince = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    let newStreak = data.streak ?? 0;

    if (daysSince === 1) {
        newStreak = newStreak + 1;
    } else if (daysSince > 1) {
        newStreak = 1; // reset
    }
    // daysSince === 0 means same day — don't change streak

    await updateDoc(ref, { streak: newStreak, lastActive: serverTimestamp() });

    // Mirror streak to leaderboard
    await setDoc(doc(db, "leaderboard", uid), { streak: newStreak }, { merge: true });

    return newStreak;
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

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK & LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit user feedback / bug report. */
export async function submitFeedback({ uid, email, type, message }) {
    await addDoc(collection(db, "feedback"), {
        uid: uid || "guest",
        email: email || "unknown",
        type: type || "general",
        message,
        status: "new",
        submittedAt: serverTimestamp(),
    });
}

/** Save module/resource progress for Neural Academy. */
export async function saveTrainingModuleProgress({
    uid,
    moduleId,
    moduleName,
    completed = false,
    resourceId = "",
    resourceType = "module",
    resourceTitle = "",
    resourcesTotal = 0,
    xpEarned = 0,
    notes = "",
}) {
    if (!uid) throw new Error("saveTrainingModuleProgress requires uid.");
    if (!moduleId) throw new Error("saveTrainingModuleProgress requires moduleId.");

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const existing = snap.exists() ? (snap.data()?.trainingProgress?.[moduleId] ?? null) : null;
    const firstSeen = !existing;
    const firstCompletion = Boolean(completed && !existing?.completed);
    const existingOpenedResources = Array.isArray(existing?.openedResources) ? existing.openedResources : [];
    const resourceAlreadyOpened = resourceId
        ? existingOpenedResources.some((r) => r.id === resourceId)
        : false;
    const openedResources = resourceId && !resourceAlreadyOpened
        ? [
            ...existingOpenedResources,
            {
                id: resourceId,
                type: resourceType,
                title: resourceTitle || resourceId,
                openedAt: new Date().toISOString(),
            },
        ]
        : existingOpenedResources;
    const nowISO = new Date().toISOString();
    const safeResourcesTotal = Number.isFinite(resourcesTotal) ? resourcesTotal : 0;
    const openedCount = openedResources.length;
    const progressPct = completed
        ? 100
        : safeResourcesTotal > 0
            ? Math.min(95, Math.round((openedCount / safeResourcesTotal) * 100))
            : (existing?.progressPct || 0);

    await setDoc(userRef, {
        trainingProgress: {
            [moduleId]: {
                moduleId,
                moduleName: moduleName || existing?.moduleName || moduleId,
                completed: Boolean(completed || existing?.completed),
                resourceType,
                notes: notes || existing?.notes || "",
                xpEarned: (existing?.xpEarned || 0) + Math.max(0, xpEarned || 0),
                openedResources,
                resourcesOpenedCount: openedCount,
                resourcesTotalCount: safeResourcesTotal || existing?.resourcesTotalCount || 0,
                progressPct,
                updatedAt: nowISO,
                completedAt: completed ? nowISO : (existing?.completedAt || null),
            },
        },
        trainingModulesStarted: increment(firstSeen ? 1 : 0),
        trainingResourcesOpened: increment(completed ? 0 : (resourceAlreadyOpened ? 0 : 1)),
        trainingModulesCompleted: increment(firstCompletion ? 1 : 0),
        lastActive: serverTimestamp(),
    }, { merge: true });

    await logPlatformAction(uid, completed ? "TRAINING_MODULE_COMPLETED" : "TRAINING_RESOURCE_OPENED", {
        moduleId,
        moduleName: moduleName || moduleId,
        resourceType,
        resourceId: resourceId || null,
        resourceTitle: resourceTitle || null,
        resourcesTotal: safeResourcesTotal || null,
        openedCount,
        xpEarned: Math.max(0, xpEarned || 0),
    });

    return {
        completed: Boolean(completed || existing?.completed),
        firstCompletion,
    };
}

/** Log a platform-level action for analytics. */
export async function logPlatformAction(uid, action, metadata = {}) {
    await addDoc(collection(db, "activity_logs"), {
        uid: uid || "guest",
        action,
        metadata,
        timestamp: serverTimestamp(),
    });
}

/** Read a user's recent activity logs (newest first). */
export async function getUserActivityLogs(uid, topN = 25) {
    if (!uid) return [];
    const q = query(
        collection(db, "activity_logs"),
        where("uid", "==", uid),
        limit(Math.max(topN, 100))
    );
    const snap = await getDocs(q);

    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
            const aMs = a.timestamp?.toDate?.()?.getTime?.() || 0;
            const bMs = b.timestamp?.toDate?.()?.getTime?.() || 0;
            return bMs - aMs;
        })
        .slice(0, topN);
}

/** Purge all user data from Firestore. */
export async function deleteUserData(uid) {
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", uid));
    batch.delete(doc(db, "leaderboard", uid));
    await batch.commit();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS / FRIEND GROUPS
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate a random 6-char alphanumeric class code. */
function generateClassCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Create a new class group. Returns the generated class code. */
export async function createClass(uid, displayName) {
    let code;
    let attempts = 0;
    while (attempts < 10) {
        code = generateClassCode();
        const existing = await getDocs(query(collection(db, "classes"), where("code", "==", code)));
        if (existing.empty) break;
        attempts++;
    }
    await addDoc(collection(db, "classes"), {
        code, createdBy: uid,
        createdByName: displayName || "Unknown",
        members: [uid], createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", uid), { classCode: code });
    return code;
}

/** Join an existing class by code. */
export async function joinClass(uid, code) {
    const upperCode = code.trim().toUpperCase();
    const snap = await getDocs(query(collection(db, "classes"), where("code", "==", upperCode)));
    if (snap.empty) throw new Error("Class code not found. Check the code and try again.");
    const classRef = doc(db, "classes", snap.docs[0].id);
    await updateDoc(classRef, { members: arrayUnion(uid) });
    await updateDoc(doc(db, "users", uid), { classCode: upperCode });
    return snap.docs[0].data();
}

/** Leave a class and clear user's classCode. */
export async function leaveClass(uid, code) {
    const upperCode = code.trim().toUpperCase();
    const snap = await getDocs(query(collection(db, "classes"), where("code", "==", upperCode)));
    if (!snap.empty) {
        const members = (snap.docs[0].data().members || []).filter(m => m !== uid);
        await updateDoc(doc(db, "classes", snap.docs[0].id), { members });
    }
    await updateDoc(doc(db, "users", uid), { classCode: null });
}

/** Get leaderboard filtered to class members only. */
export async function getClassLeaderboard(code) {
    const upperCode = code.trim().toUpperCase();
    const classSnap = await getDocs(query(collection(db, "classes"), where("code", "==", upperCode)));
    if (classSnap.empty) return [];
    const members = classSnap.docs[0].data().members || [];
    if (members.length === 0) return [];
    const results = [];
    for (let i = 0; i < members.length; i += 30) {
        const chunk = members.slice(i, i + 30);
        const snap = await getDocs(query(collection(db, "leaderboard"), where("uid", "in", chunk)));
        snap.docs.forEach(d => results.push({ id: d.id, ...d.data() }));
    }
    return results.sort((a, b) => (b.xp || 0) - (a.xp || 0)).map((u, i) => ({ ...u, rank: i + 1 }));
}

/** Get class info by code. */
export async function getClassInfo(code) {
    const snap = await getDocs(query(collection(db, "classes"), where("code", "==", code.toUpperCase())));
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN – QUIZ QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch all admin-created quiz questions from Firestore. */
export async function getAdminQuizQuestions() {
    const snap = await getDocs(collection(db, "quizQuestions"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Add a new quiz question. */
export async function addAdminQuizQuestion(question) {
    return await addDoc(collection(db, "quizQuestions"), {
        ...question,
        createdAt: serverTimestamp(),
    });
}

/** Update an existing quiz question. */
export async function updateAdminQuizQuestion(id, fields) {
    await updateDoc(doc(db, "quizQuestions", id), { ...fields, updatedAt: serverTimestamp() });
}

/** Delete a quiz question. */
export async function deleteAdminQuizQuestion(id) {
    await deleteDoc(doc(db, "quizQuestions", id));
}

function toSeedSlug(value, fallback = "item") {
    const raw = String(value || fallback).toLowerCase();
    const slug = raw
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
        .slice(0, 64);
    return slug || fallback;
}

/** Upsert static quiz questions into backend so all content is visible in admin/backend. */
export async function syncQuizQuestionsToBackend(questions = []) {
    let synced = 0;

    for (let idx = 0; idx < questions.length; idx += 1) {
        const q = questions[idx];
        if (!q?.q || !Array.isArray(q?.opts) || q.opts.length < 2) continue;

        const docId = `seed-quiz-${toSeedSlug(q.q, `q-${idx + 1}`)}-${idx + 1}`;
        await setDoc(
            doc(db, "quizQuestions", docId),
            {
                ...q,
                source: "seed",
                seedIndex: idx + 1,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        synced += 1;
    }

    return { synced };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN – SIMULATOR SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch all simulator scenarios from Firestore. */
export async function getAdminSimScenarios() {
    const snap = await getDocs(collection(db, "simScenarios"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Add a new simulator scenario. */
export async function addAdminSimScenario(scenario) {
    return await addDoc(collection(db, "simScenarios"), {
        ...scenario,
        createdAt: serverTimestamp(),
    });
}

/** Update an existing simulator scenario. */
export async function updateAdminSimScenario(id, fields) {
    await updateDoc(doc(db, "simScenarios", id), { ...fields, updatedAt: serverTimestamp() });
}

/** Delete a simulator scenario. */
export async function deleteAdminSimScenario(id) {
    await deleteDoc(doc(db, "simScenarios", id));
}

/** Upsert static simulator scenarios into backend so all content is visible in admin/backend. */
export async function syncSimScenariosToBackend(scenarios = []) {
    let synced = 0;

    for (let idx = 0; idx < scenarios.length; idx += 1) {
        const scenario = scenarios[idx];
        if (!scenario?.legit || !scenario?.phish || !Array.isArray(scenario?.phish?.flags)) continue;

        const seedName = scenario?.phish?.subject || scenario?.legit?.subject || `scenario-${idx + 1}`;
        const docId = `seed-sim-${toSeedSlug(seedName, `scenario-${idx + 1}`)}-${idx + 1}`;

        await setDoc(
            doc(db, "simScenarios", docId),
            {
                ...scenario,
                source: "seed",
                seedIndex: idx + 1,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
        synced += 1;
    }

    return { synced };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN – ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

/** Retrieve live platform analytics. */
export async function getAdminAnalytics() {
    const [usersSnap, quizSnap, simSnap, gallerySnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "quizResults")),
        getDocs(collection(db, "simulatorLogs")),
        getDocs(collection(db, "gallery")),
    ]);

    const users = usersSnap.docs.map(d => d.data());
    const totalUsers = users.length;
    const avgXP = totalUsers > 0
        ? Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / totalUsers)
        : 0;
    const avgLevel = totalUsers > 0
        ? (users.reduce((s, u) => s + (u.level || 1), 0) / totalUsers).toFixed(1)
        : 1;

    const quizAttempts = quizSnap.docs.map(d => d.data());
    const correctCount = quizAttempts.filter(a => a.correct).length;
    const quizAccuracy = quizAttempts.length > 0
        ? Math.round((correctCount / quizAttempts.length) * 100)
        : 0;

    return {
        totalUsers,
        totalQuizAttempts: quizAttempts.length,
        totalSimAttempts: simSnap.size,
        totalGalleryItems: gallerySnap.size,
        avgXP,
        avgLevel,
        quizAccuracy,
    };
}
