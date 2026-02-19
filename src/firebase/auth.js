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
} from "firebase/auth";

import { auth } from "./config";
import { createOrUpdateUser } from "./db";

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

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutUser() {
    await signOut(auth);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────
/** Calls `callback` whenever the signed-in user changes. Returns unsubscribe fn. */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export { auth };
