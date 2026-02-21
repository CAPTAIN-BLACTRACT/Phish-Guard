export const becModule = {
    id: "bec",
    name: "Business Email Compromise",
    icon: "\u{1F4BC}",
    diff: "Hard",
    time: "35 min",
    topics: ["Executive Fraud", "Payment Redirect", "Invoice Scam"],
    desc: "Defend against executive impersonation and payment fraud workflows.",
    tip: "Require out-of-band verification for all payment changes.",
    reqLevel: 9,
    drill: [
        "Validate vendor bank-change requests with voice confirmation.",
        "Require dual approval for transfer requests.",
        "Audit executive impersonation patterns in mailbox logs.",
    ],
    resources: [
        {
            id: "bec-video",
            type: "video",
            title: "BEC Attack Simulation (YouTube)",
            url: "https://www.youtube.com/results?search_query=business+email+compromise+training",
        },
        {
            id: "bec-pdf",
            type: "pdf",
            title: "FBI IC3 BEC Public Advisory",
            url: "https://www.ic3.gov/",
        },
        {
            id: "bec-guide",
            type: "guide",
            title: "CISA BEC Mitigation Practices",
            url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
        },
    ],
};
