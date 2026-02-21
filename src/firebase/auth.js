/**
 * Firebase Auth helpers
 * Provides: signInWithGoogle, signInEmail, registerEmail,
 *           signOutUser, resetPassword, onAuthChange
 */
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendEmailVerification,
    signInAnonymously as firebaseSignInAnonymously,
    linkWithPopup,
    linkWithCredential,
    EmailAuthProvider,
    deleteUser,
    reauthenticateWithCredential,
} from "firebase/auth";

import { auth } from "./config";
import { createOrUpdateUser, deleteUserData } from "./db";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUser(result.user);
    return result.user;
}

// ─── Email / Password ─────────────────────────────────────────────────────────
export async function registerEmail(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await createOrUpdateUser(user);
    return user;
}

export async function signInEmail(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

export async function verifyEmail() {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
}

export async function signInGuest() {
    const { user } = await firebaseSignInAnonymously(auth);
    await createOrUpdateUser(user);
    return user;
}

// ─── Guest Upgrade / Linking ────────────────────────────────────────────────
export async function linkGoogle() {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    // After linking, ensure the user document reflects any changes (though UID remains the same)
    await createOrUpdateUser(result.user);
    return result.user;
}

export async function linkEmail(email, password) {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    await createOrUpdateUser(result.user);
    return result.user;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutUser() {
    await signOut(auth);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────
/** Calls `callback` whenever the signed-in user changes. Returns unsubscribe fn. */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/** Deletes the authenticated user and all associated Firestore data. */
export async function deleteAccount() {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
        await deleteUserData(uid);
        await deleteUser(auth.currentUser);
    } catch (e) {
        console.error("Deletion failed:", e);
        throw e;
    }
}

export { auth };
