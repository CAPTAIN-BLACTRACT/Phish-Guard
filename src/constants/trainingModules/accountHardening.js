export const accountHardeningModule = {
    id: "account-hardening",
    name: "Account Hardening and MFA",
    icon: "\u{1F510}",
    diff: "Medium",
    time: "25 min",
    topics: ["MFA", "Password Hygiene", "Session Security"],
    desc: "Reduce account takeover risk with modern authentication hygiene.",
    tip: "Use passkeys or strong MFA for all critical accounts.",
    reqLevel: 12,
    drill: [
        "Review MFA enrollment and backup factors.",
        "Rotate reused credentials and enable password manager.",
        "Check active sessions and revoke unknown devices.",
    ],
    resources: [
        {
            id: "mfa-video",
            type: "video",
            title: "MFA Security Essentials (YouTube)",
            url: "https://www.youtube.com/results?search_query=multi+factor+authentication+security+training",
        },
        {
            id: "mfa-pdf",
            type: "pdf",
            title: "NIST Authentication and Lifecycle Guidance",
            url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        },
        {
            id: "mfa-guide",
            type: "guide",
            title: "CISA Account Security Best Practices",
            url: "https://www.cisa.gov/secure-our-world",
        },
    ],
};
