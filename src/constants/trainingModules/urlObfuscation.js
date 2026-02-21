export const urlObfuscationModule = {
    id: "url-obfuscation",
    name: "Malicious URL Analysis",
    icon: "\u{1F517}",
    diff: "Medium",
    time: "25 min",
    topics: ["Typosquatting", "Homograph", "Subdomain Tricks"],
    desc: "Understand URL deception tactics and build habits for safe destination validation.",
    tip: "Read domains from right to left to find the real root domain.",
    reqLevel: 4,
    drill: [
        "Compare lookalike domains and detect typosquats.",
        "Inspect subdomain abuse and misleading path names.",
        "Use URL reputation checks before login.",
    ],
    resources: [
        {
            id: "url-video",
            type: "video",
            title: "Malicious URL Analysis Lab (YouTube)",
            url: "https://www.youtube.com/results?search_query=malicious+url+analysis+training",
        },
        {
            id: "url-pdf",
            type: "pdf",
            title: "NIST Cybersecurity Framework",
            url: "https://www.nist.gov/cyberframework",
        },
        {
            id: "url-guide",
            type: "guide",
            title: "CISA Secure Browsing Basics",
            url: "https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks",
        },
    ],
};
