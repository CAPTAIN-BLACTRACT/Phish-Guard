import { db } from "./config";
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore";

const QUIZZES = [
    {
        category: "Email Integrity",
        question: "What is the primary indicator of a phishing email's sender?",
        options: ["The 'From' display name", "The sender's actual email address domain", "The profile picture", "The color of the email header"],
        answer: 1,
        explanation: "Display names can be spoofed easily. The domain in the actual email address is the only reliable indicator."
    },
    {
        category: "Link Verification",
        question: "A URL in an email says 'https://paypal.com/login' but hovering reveals 'http://pay-pal.secure-link.com'. What should you do?",
        options: ["Click it, it looks secure", "Copy and paste it into a new tab", "Delete the email immediately", "Reply asking for verification"],
        answer: 2,
        explanation: "Mismatched URLs are a classic phishing tactic. Never click a link that redirects to a different domain than advertised."
    },
    {
        category: "Social Engineering",
        question: "You receive an urgent email from your 'CEO' asking for a wire transfer to a new vendor. What's the best first step?",
        options: ["Do it immediately to show initiative", "Reply to the email asking for confirmation", "Call the CEO on a known trusted number", "Check the CEO's profile picture"],
        answer: 2,
        explanation: "Urgency and unexpected financial requests are major red flags. Always verify through an out-of-band channel like a phone call."
    }
];

const USERS = [
    { name: "CyberKnight_99", xp: 12480, level: 42, streak: 21, initials: "CK", color: "#00f5ff", badges: ["🏆", "🛡️", "🎯", "⚡", "🔥", "🥈"] },
    { name: "PhishHunter", xp: 10920, level: 38, streak: 14, initials: "PH", color: "#00ff9d", badges: ["🏆", "🛡️", "🎯", "⚡", "🥉"] },
    { name: "ZeroX_Hacks", xp: 9340, level: 31, streak: 8, initials: "ZX", color: "#d500f9", badges: ["🏆", "🎯", "⚡"] },
    { name: "NexGuard", xp: 7210, level: 24, streak: 5, initials: "NX", color: "#ff1744", badges: ["🏆", "🎯"] },
    { name: "SecureRobot", xp: 6550, level: 19, streak: 3, initials: "SR", color: "#64ffda", badges: ["🎯"] },
    { name: "DataDefender", xp: 5200, level: 17, streak: 7, initials: "DD", color: "#ff6d00", badges: ["🛡️", "⚡"] },
    { name: "Alice_InfoSec", xp: 4100, level: 14, streak: 2, initials: "AI", color: "#f50057", badges: ["🎯"] },
    { name: "Th3Watcher", xp: 3850, level: 12, streak: 4, initials: "TW", color: "#7c4dff", badges: ["🏆"] }
];

export async function seedDatabase() {
    try {
        // 1. Seed Quizzes if empty
        const qSnap = await getDocs(query(collection(db, "quizzes"), limit(1)));
        if (qSnap.empty) {
            console.log("Seeding quizzes...");
            for (const q of QUIZZES) await addDoc(collection(db, "quizzes"), q);
        }

        // 2. Seed Initial Users for Leaderboard if empty
        const uSnap = await getDocs(query(collection(db, "users"), limit(1)));
        if (uSnap.empty) {
            console.log("Seeding leaderboard...");
            for (const u of USERS) await addDoc(collection(db, "users"), u);
        }

        console.log("Database seeded successfully!");
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}
