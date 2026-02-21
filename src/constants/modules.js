export const MODULES = [
    {
        id: "email-basics",
        name: "Email Phishing Basics",
        sub: "5 levels completed",
        status: "done",
        icon: "📧",
        diff: "Easy",
        time: "15 min",
        topics: ["Header Analysis", "Spoofing", "Urgency"],
        desc: "Master the fundamentals of email security. Learn about display name spoofing, urgent language, and suspicious attachments.",
        tip: "Tip: Always check the sender's actual email address, not just the name!"
    },
    {
        id: "red-flags",
        name: "Red Flag Identification",
        sub: "6 levels completed",
        status: "done",
        icon: "🚩",
        diff: "Medium",
        time: "25 min",
        topics: ["Grammar Scan", "Mismatched Links", "Tone Analysis"],
        desc: "Deep dive into the 6 universal indicators of a phishing attempt. From poor grammar to mismatched links.",
        tip: "Tip: Hover over links to see the real destination in the status bar."
    },
    {
        id: "smishing",
        name: "SMS / Smishing",
        sub: "Level 2 of 5 in progress",
        status: "active",
        icon: "📱",
        diff: "Medium",
        time: "20 min",
        topics: ["Shortlinks", "Text Spoofing", "MFA Scams"],
        desc: "Learn to identify malicious text messages. Mobile attacks are on the rise and often bypass traditional email filters.",
        tip: "Tip: Banks will never ask for your PIN via text message!"
    },
    {
        id: "spear-phishing",
        name: "Spear Phishing",
        sub: "Unlock at Level 10",
        status: "locked",
        icon: "🕵️",
        diff: "Hard",
        time: "40 min",
        topics: ["OSINT", "Social Engineering", "Tailored Baits"],
        desc: "Advanced social engineering targeted at specific individuals. Learn how attackers use OSINT to craft believable lies.",
        tip: "Tip: Be careful what personal information you share on social media."
    },
    {
        id: "advanced-social",
        name: "Advanced Social Engineering",
        sub: "Unlock at Level 15",
        status: "locked",
        icon: "🚀",
        diff: "Expert",
        time: "60 min",
        topics: ["Vishing", "Business Email Compromise", "Pretexting"],
        desc: "The final frontier. Protect against highly sophisticated multi-channel attacks and psychological manipulation.",
        tip: "Tip: Zero-Trust is the only absolute defense—verify everything."
    }
];
