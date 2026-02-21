import { db } from "./config";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { GALLERY_DATA, LB_DATA, QUESTIONS, SIM_STAGES } from "../constants";

const QUIZZES = [
  {
    category: "Email Integrity",
    question: "What is the primary indicator of a phishing email sender?",
    options: [
      "Display name",
      "Actual sender domain",
      "Profile picture",
      "Header color",
    ],
    answer: 1,
    explanation:
      "Display names are easy to spoof. Verify the real sender domain.",
  },
  {
    category: "Link Verification",
    question:
      "A visible link says paypal.com, but hover shows a different domain. What should you do?",
    options: [
      "Click anyway",
      "Copy into a new tab",
      "Delete/report it",
      "Reply for confirmation",
    ],
    answer: 2,
    explanation:
      "Mismatched destination domains are a classic phishing indicator.",
  },
  {
    category: "Social Engineering",
    question:
      "You get an urgent wire-transfer request from leadership. First step?",
    options: [
      "Send immediately",
      "Reply and ask again",
      "Verify over a trusted channel",
      "Check profile picture",
    ],
    answer: 2,
    explanation:
      "Always verify high-risk requests out-of-band before taking action.",
  },
];

const USER_QUIZ_RESULTS = [
  {
    score: 8,
    total: 10,
    xpEarned: 120,
    category: "Email Phishing",
    difficulty: "medium",
    correct: true,
  },
  {
    score: 6,
    total: 10,
    xpEarned: 80,
    category: "URL Safety",
    difficulty: "easy",
    correct: true,
  },
];

const USER_SIM_LOGS = [
  {
    scenarioId: "paypal-suspension",
    detected: true,
    timeTakenMs: 42000,
    xpEarned: 100,
    flagsFound: 4,
    totalFlags: 4,
  },
  {
    scenarioId: "microsoft-renewal",
    detected: true,
    timeTakenMs: 51000,
    xpEarned: 100,
    flagsFound: 3,
    totalFlags: 4,
  },
];

const USER_ACTIVITY_LOGS = [
  {
    action: "XP_AWARDED",
    metadata: { reason: "SEED_QUIZ", xpEarned: 120 },
  },
  {
    action: "XP_AWARDED",
    metadata: { reason: "SEED_SIMULATION", xpEarned: 100 },
  },
  {
    action: "TRAINING_MODULE_COMPLETED",
    metadata: { moduleId: "email-basics", xpEarned: 80 },
  },
];

const toSeedId = (value, idx) => {
  const slug = String(value || `seed-${idx + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "seed"}-${idx + 1}`;
};

const defaultSeedName = (uid) => `Agent_${String(uid).slice(0, 5).toUpperCase()}`;
const defaultSeedAvatar = (uid) =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(uid)}`;

async function isCollectionEmpty(name) {
  const snap = await getDocs(query(collection(db, name), limit(1)));
  return snap.empty;
}

export async function seedDatabase(seedUser = null) {
  const uid = seedUser?.uid || null;
  const displayName = seedUser?.displayName || (uid ? defaultSeedName(uid) : "Seeder");
  const email = seedUser?.email || null;

  const summary = {
    quizzes: 0,
    leaderboardSeed: 0,
    quizQuestions: 0,
    simScenarios: 0,
    userProfile: 0,
    leaderboard: 0,
    quizResults: 0,
    simulatorLogs: 0,
    activityLogs: 0,
    gallery: 0,
    logs: 0,
  };

  try {
    if (await isCollectionEmpty("quizzes")) {
      for (const quiz of QUIZZES) {
        await addDoc(collection(db, "quizzes"), {
          ...quiz,
          createdAt: serverTimestamp(),
          source: "seed",
        });
        summary.quizzes += 1;
      }
    }

    if (await isCollectionEmpty("leaderboardSeed")) {
      const rows = LB_DATA.filter((row) => !row?.isYou);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        await setDoc(
          doc(db, "leaderboardSeed", `seed-${toSeedId(row.name || row.displayName, i)}`),
          {
            uid: `seed-${i + 1}`,
            displayName: row.name || row.displayName || `Defender ${i + 1}`,
            xp: Number(row.xp) || 0,
            level: Number(row.level) || 1,
            streak: Number(row.streak) || 0,
            badges: Array.isArray(row.badges) ? row.badges : [],
            source: "seed",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        summary.leaderboardSeed += 1;
      }
    }

    if (!uid) {
      console.info("Seeded public collections. Sign in to seed user-owned collections.");
      return summary;
    }

    if (await isCollectionEmpty("quizQuestions")) {
      for (let i = 0; i < QUESTIONS.length; i += 1) {
        const q = QUESTIONS[i];
        await setDoc(
          doc(db, "quizQuestions", `seed-q-${toSeedId(q.q, i)}`),
          {
            ...q,
            source: "seed",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        summary.quizQuestions += 1;
      }
    }

    if (await isCollectionEmpty("simScenarios")) {
      for (let i = 0; i < SIM_STAGES.length; i += 1) {
        const stage = SIM_STAGES[i];
        await setDoc(
          doc(db, "simScenarios", `seed-s-${toSeedId(stage.id, i)}`),
          {
            ...stage,
            source: "seed",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        summary.simScenarios += 1;
      }
    }

    await setDoc(
      doc(db, "users", uid),
      {
        uid,
        displayName,
        email,
        photoURL: seedUser?.photoURL || defaultSeedAvatar(uid),
        xp: 1250,
        level: 8,
        streak: 5,
        quizAttempts: 2,
        quizCorrect: 2,
        simulationsDone: 2,
        emailsFlagged: 7,
        trainingModulesCompleted: 1,
        trainingProgress: {},
        classCode: null,
        badges: [],
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
    summary.userProfile = 1;

    await setDoc(
      doc(db, "leaderboard", uid),
      {
        uid,
        displayName,
        photoURL: seedUser?.photoURL || defaultSeedAvatar(uid),
        xp: 1250,
        level: 8,
        streak: 5,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    summary.leaderboard = 1;

    const existingQuizResults = await getDocs(
      query(collection(db, "quizResults"), where("uid", "==", uid), limit(1))
    );
    if (existingQuizResults.empty) {
      for (const result of USER_QUIZ_RESULTS) {
        await addDoc(collection(db, "quizResults"), {
          uid,
          ...result,
          completedAt: serverTimestamp(),
        });
        summary.quizResults += 1;
      }
    }

    const existingSimLogs = await getDocs(
      query(collection(db, "simulatorLogs"), where("uid", "==", uid), limit(1))
    );
    if (existingSimLogs.empty) {
      for (const result of USER_SIM_LOGS) {
        await addDoc(collection(db, "simulatorLogs"), {
          uid,
          ...result,
          attemptedAt: serverTimestamp(),
        });
        summary.simulatorLogs += 1;
      }
    }

    const existingActivity = await getDocs(
      query(collection(db, "activity_logs"), where("uid", "==", uid), limit(1))
    );
    if (existingActivity.empty) {
      for (const row of USER_ACTIVITY_LOGS) {
        await addDoc(collection(db, "activity_logs"), {
          uid,
          action: row.action,
          metadata: row.metadata || {},
          timestamp: serverTimestamp(),
        });
        summary.activityLogs += 1;
      }
    }

    const existingGallery = await getDocs(
      query(collection(db, "gallery"), where("uid", "==", uid), limit(1))
    );
    if (existingGallery.empty) {
      for (let i = 0; i < Math.min(3, GALLERY_DATA.length); i += 1) {
        const item = GALLERY_DATA[i];
        await addDoc(collection(db, "gallery"), {
          uid,
          displayName,
          title: item.title,
          description: item.caption,
          type: item.type || "email",
          status: item.status || "review",
          likes: Number(item.likes) || 0,
          tags: [item.type || "email", item.status || "review"],
          thumb: item.thumb || "",
          submittedAt: serverTimestamp(),
        });
        summary.gallery += 1;
      }
    }

    await addDoc(collection(db, "logs"), {
      uid,
      action: "SEED_COMPLETED",
      summary,
      createdAt: serverTimestamp(),
    });
    summary.logs += 1;

    console.log("Database seeded:", summary);
    return summary;
  } catch (err) {
    console.error("Error seeding database:", err);
    return summary;
  }
}
