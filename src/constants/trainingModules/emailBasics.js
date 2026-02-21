export const emailBasicsModule = {
    id: "email-basics",
    name: "Email Phishing Basics",
    icon: "\u{1F4E7}",
    diff: "Easy",
    time: "15 min",
    topics: ["Header Analysis", "Spoofing", "Urgency"],
    desc: "Learn the core phishing patterns used in fake email campaigns and how to verify suspicious messages quickly.",
    tip: "Check sender, reply-to, and urgency tone before clicking anything.",
    reqLevel: 1,
    drill: [
        "Verify sender domain against official domain.",
        "Inspect reply-to mismatch and unusual signature blocks.",
        "Identify urgency or fear language designed to rush action.",
    ],
    resources: [
        {
            id: "email-video",
            type: "video",
            title: "Email Phishing Awareness (YouTube)",
            url: "https://www.youtube.com/results?search_query=email+phishing+awareness+training",
        },
        {
            id: "email-pdf",
            type: "pdf",
            title: "NIST SP 800-61r2 Incident Handling (PDF)",
            url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf",
        },
        {
            id: "email-guide",
            type: "guide",
            title: "CISA Anti-Phishing Guidance",
            url: "https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks",
        },
    ],
};
