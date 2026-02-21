export const smishingModule = {
    id: "smishing",
    name: "SMS / Smishing Defense",
    icon: "\u{1F4F1}",
    diff: "Medium",
    time: "20 min",
    topics: ["Short URLs", "OTP Fraud", "Mobile Spoofing"],
    desc: "Recognize mobile phishing patterns and safe response flow for text-based attacks.",
    tip: "Never share OTP or PIN via SMS.",
    reqLevel: 3,
    drill: [
        "Expand short URLs before opening.",
        "Confirm sender from an official channel.",
        "Report suspicious SMS to your provider and security team.",
    ],
    resources: [
        {
            id: "smishing-video",
            type: "video",
            title: "Smishing Awareness Training (YouTube)",
            url: "https://www.youtube.com/results?search_query=smishing+awareness+training",
        },
        {
            id: "smishing-pdf",
            type: "pdf",
            title: "FCC SMS Spoofing Guidance",
            url: "https://www.fcc.gov/spoofing",
        },
        {
            id: "smishing-guide",
            type: "guide",
            title: "CISA Mobile Phishing Resources",
            url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
        },
    ],
};
