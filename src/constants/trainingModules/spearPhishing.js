export const spearPhishingModule = {
    id: "spear-phishing",
    name: "Spear Phishing",
    icon: "\u{1F575}\uFE0F",
    diff: "Hard",
    time: "40 min",
    topics: ["OSINT", "Pretext", "Impersonation"],
    desc: "Understand targeted phishing that uses personal data and believable context.",
    tip: "Verify unusual requests through a known, trusted channel.",
    reqLevel: 7,
    drill: [
        "Check if message details can be sourced from public profiles.",
        "Validate requests with callback verification.",
        "Escalate identity impersonation attempts immediately.",
    ],
    resources: [
        {
            id: "spear-video",
            type: "video",
            title: "Spear Phishing Case Studies (YouTube)",
            url: "https://www.youtube.com/results?search_query=spear+phishing+case+study+training",
        },
        {
            id: "spear-pdf",
            type: "pdf",
            title: "NIST Digital Identity Guidance",
            url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        },
        {
            id: "spear-guide",
            type: "guide",
            title: "CISA Social Engineering Best Practices",
            url: "https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks",
        },
    ],
};
