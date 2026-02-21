export const redFlagsModule = {
    id: "red-flags",
    name: "Red Flag Identification",
    icon: "\u{1F6A9}",
    diff: "Easy",
    time: "20 min",
    topics: ["Grammar", "Tone", "Link Mismatch"],
    desc: "Build a repeatable checklist to detect suspicious language, fake links, and trust abuse cues.",
    tip: "Use a checklist before every high-risk click.",
    reqLevel: 2,
    drill: [
        "Scan for spelling/grammar anomalies.",
        "Hover every link and validate destination.",
        "Mark suspicious asks for credentials or payment.",
    ],
    resources: [
        {
            id: "redflags-video",
            type: "video",
            title: "How To Spot Phishing Red Flags (YouTube)",
            url: "https://www.youtube.com/results?search_query=how+to+spot+phishing+red+flags",
        },
        {
            id: "redflags-pdf",
            type: "pdf",
            title: "FTC Consumer Scam Guide",
            url: "https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams",
        },
        {
            id: "redflags-guide",
            type: "guide",
            title: "Google Phishing Quiz",
            url: "https://phishingquiz.withgoogle.com/",
        },
    ],
};
