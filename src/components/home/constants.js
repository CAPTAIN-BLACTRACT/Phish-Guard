export const RED_FLAGS = [
  {
    icon: "🔗",
    name: "Suspicious URLs",
    desc: "Attackers use lookalike domains with subtle swaps — 'paypa1.com' instead of 'paypal.com'. Always hover before clicking.",
    tip: "Hover to preview destination",
  },
  {
    icon: "⚡",
    name: "Urgency Tactics",
    desc: "Phrases like 'Act NOW' or 'Account suspended' bypass rational thinking and trigger impulsive clicks.",
    tip: "Take 60 seconds to verify",
  },
  {
    icon: "🏢",
    name: "Sender Spoofing",
    desc: "Display names can be faked. Always check the actual email address domain, not just the friendly name shown.",
    tip: "Expand sender details",
  },
  {
    icon: "📎",
    name: "Dangerous Attachments",
    desc: ".exe, .zip, .docx with macros — unexpected attachments are prime malware vectors. Don't open what you didn't request.",
    tip: "Scan before opening",
  },
  {
    icon: "🔑",
    name: "Credential Requests",
    desc: "Legitimate organizations never ask for passwords or 2FA codes via email. Any such request is a guaranteed red flag.",
    tip: "Never share via email",
  },
  {
    icon: "✍️",
    name: "Generic Greetings",
    desc: "'Dear valued customer' signals mass phishing. Your bank knows your name — impersonators usually don't.",
    tip: "Check for personalization",
  },
];
