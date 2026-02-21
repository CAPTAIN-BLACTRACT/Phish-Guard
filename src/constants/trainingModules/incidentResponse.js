export const incidentResponseModule = {
    id: "incident-response",
    name: "Phishing Incident Response",
    icon: "\u{1F6E1}\uFE0F",
    diff: "Hard",
    time: "30 min",
    topics: ["Containment", "Escalation", "Reporting"],
    desc: "Learn fast containment and reporting actions after a phishing event.",
    tip: "Speed matters: isolate, report, reset, and preserve evidence.",
    reqLevel: 11,
    drill: [
        "Draft a 15-minute response checklist.",
        "Practice account lock + token revoke flow.",
        "Create post-incident learning notes for team training.",
    ],
    resources: [
        {
            id: "ir-video",
            type: "video",
            title: "Phishing Incident Response Walkthrough (YouTube)",
            url: "https://www.youtube.com/results?search_query=phishing+incident+response+training",
        },
        {
            id: "ir-pdf",
            type: "pdf",
            title: "NIST Incident Response Guide (PDF)",
            url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf",
        },
        {
            id: "ir-guide",
            type: "guide",
            title: "CISA Incident Reporting Resources",
            url: "https://www.cisa.gov/report",
        },
    ],
};
