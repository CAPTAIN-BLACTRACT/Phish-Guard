export const advancedSocialModule = {
    id: "advanced-social",
    name: "Advanced Social Engineering",
    icon: "\u{1F680}",
    diff: "Expert",
    time: "60 min",
    topics: ["Vishing", "Deepfake Voice", "Multi-Channel Ops"],
    desc: "Prepare for sophisticated social engineering campaigns across email, voice, and messaging channels.",
    tip: "Default to verification workflows, not trust by tone or urgency.",
    reqLevel: 15,
    drill: [
        "Perform cross-channel validation for urgent executive requests.",
        "Design a deepfake-resistant callback protocol.",
        "Create a weekly red-team simulation for social attacks.",
    ],
    resources: [
        {
            id: "advanced-video",
            type: "video",
            title: "Advanced Social Engineering Defense (YouTube)",
            url: "https://www.youtube.com/results?search_query=advanced+social+engineering+defense+training",
        },
        {
            id: "advanced-pdf",
            type: "pdf",
            title: "NIST Cybersecurity Publications Library",
            url: "https://csrc.nist.gov/publications",
        },
        {
            id: "advanced-guide",
            type: "guide",
            title: "CISA Cybersecurity Best Practices",
            url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
        },
    ],
};
