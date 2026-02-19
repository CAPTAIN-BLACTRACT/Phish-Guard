export const SIM_STAGES = [
  {
    legit: {
      from: "PayPal",
      addr: "service@paypal.com",
      subject: "Your transaction receipt",
      body: "Hi John, your payment of $25.99 to Netflix was successful on Jan 15, 2026.\n\nTransaction ID: PP-2026-891234\n\nIf you have questions, visit paypal.com/help.",
      safe: true,
    },
    phish: {
      from: "PayPal Security",
      addr: "security@paypa1-verify.com",
      subject: "🚨 Urgent: Account Suspended!",
      body: "Your PayPal account has been !!SUSPENDED!! due to suspicious activity.\n\nClick here to verify: http://paypa1-verify.xyz/login\n\nFAILURE TO COMPLY will result in PERMANENT account closure.",
      flags: [
        { id: "domain",  text: "security@paypa1-verify.com",      hint: "Fake domain: 'paypa1' uses number 1 instead of letter l" },
        { id: "url",     text: "http://paypa1-verify.xyz/login",   hint: "Malicious URL with fake domain" },
        { id: "urgency", text: "!!SUSPENDED!!",                    hint: "Artificial urgency with excessive punctuation" },
        { id: "threat",  text: "PERMANENT account closure",        hint: "Fear-based threat to pressure immediate action" },
      ],
    },
  },
  {
    legit: {
      from: "Microsoft",
      addr: "account-security@microsoft.com",
      subject: "Sign-in from new device",
      body: "Hi, we noticed a sign-in to your Microsoft account from a new device.\n\nDate: Jan 15, 2026 · Location: Mumbai, India\n\nIf this was you, no action needed. If not, secure your account at microsoft.com.",
      safe: true,
    },
    phish: {
      from: "Microsoft Support",
      addr: "support@microsofft-help.net",
      subject: "Your account will be DELETED",
      body: "ALERT: Your Microsoft 365 license has EXPIRED.\n\nUpdate your payment at: http://microsofft-renew.com/pay\n\nYour account and ALL FILES will be deleted in 24 HOURS.",
      flags: [
        { id: "domain2", text: "microsofft-help.net",            hint: "'microsofft' has a double 'f' — typosquatting attack" },
        { id: "url2",    text: "http://microsofft-renew.com/pay", hint: "Same fake domain, non-HTTPS link" },
        { id: "delete",  text: "ALL FILES will be deleted",       hint: "Extreme fear tactic — not how Microsoft operates" },
        { id: "24h",     text: "24 HOURS",                        hint: "False urgency — real warnings give 30+ days notice" },
      ],
    },
  },
];
