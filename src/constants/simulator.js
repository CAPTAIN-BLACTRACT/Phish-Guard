export const SIM_STAGES = [
  {
    id: "paypal-suspension",
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
      subject: "Urgent: Account Suspended",
      body: "Your PayPal account has been !!SUSPENDED!! due to suspicious activity.\n\nClick here to verify: http://paypa1-verify.xyz/login\n\nFAILURE TO COMPLY will result in PERMANENT account closure.",
      flags: [
        { id: "domain", text: "security@paypa1-verify.com", hint: "Fake domain: paypa1 uses number 1 instead of letter l." },
        { id: "url", text: "http://paypa1-verify.xyz/login", hint: "Malicious URL with fake domain." },
        { id: "urgency", text: "!!SUSPENDED!!", hint: "Artificial urgency with excessive punctuation." },
        { id: "threat", text: "PERMANENT account closure", hint: "Fear-based threat to pressure immediate action." },
      ],
    },
  },
  {
    id: "microsoft-renewal",
    legit: {
      from: "Microsoft",
      addr: "account-security@microsoft.com",
      subject: "Sign-in from new device",
      body: "Hi, we noticed a sign-in to your Microsoft account from a new device.\n\nDate: Jan 15, 2026 - Location: Mumbai, India\n\nIf this was you, no action needed. If not, secure your account at microsoft.com.",
      safe: true,
    },
    phish: {
      from: "Microsoft Support",
      addr: "support@microsofft-help.net",
      subject: "Your account will be DELETED",
      body: "ALERT: Your Microsoft 365 license has EXPIRED.\n\nUpdate your payment at: http://microsofft-renew.com/pay\n\nYour account and ALL FILES will be deleted in 24 HOURS.",
      flags: [
        { id: "domain2", text: "support@microsofft-help.net", hint: "Typosquatting: microsofft contains a double f." },
        { id: "url2", text: "http://microsofft-renew.com/pay", hint: "Same fake domain and non-HTTPS link." },
        { id: "delete", text: "ALL FILES will be deleted", hint: "Extreme fear tactic unlike real support notices." },
        { id: "24h", text: "24 HOURS", hint: "False urgency; real renewals usually provide longer windows." },
      ],
    },
  },
  {
    id: "hr-payroll-update",
    legit: {
      from: "HR Operations",
      addr: "hr@company.com",
      subject: "Payroll profile reminder",
      body: "Please review your payroll profile in the official employee portal before month-end.\n\nUse the HR portal bookmark in the company intranet.\n\nNo immediate action is required if your details are unchanged.",
      safe: true,
    },
    phish: {
      from: "HR Payroll Team",
      addr: "hr-support@company-payroll-secure.net",
      subject: "Immediate payroll lock warning",
      body: "Your salary transfer is ON HOLD.\n\nOpen this form now: http://company-payroll-secure.net/unlock\n\nYou must submit credentials and OTP in 10 MINUTES or payroll will be canceled.",
      flags: [
        { id: "hr-domain", text: "hr-support@company-payroll-secure.net", hint: "External lookalike domain, not company.com." },
        { id: "hr-url", text: "http://company-payroll-secure.net/unlock", hint: "Suspicious external link using HTTP." },
        { id: "hr-urgency", text: "10 MINUTES", hint: "High-pressure urgency to force mistakes." },
        { id: "hr-otp", text: "credentials and OTP", hint: "Legitimate teams never ask for OTP in forms." },
      ],
    },
  },
  {
    id: "cloud-share-oauth",
    legit: {
      from: "Drive Collaboration",
      addr: "noreply@google.com",
      subject: "Document shared with you",
      body: "A colleague shared a document with view-only permissions.\n\nOpen the file from drive.google.com and verify the sender before requesting edit access.",
      safe: true,
    },
    phish: {
      from: "Cloud Storage Team",
      addr: "alerts@drive-security-access.com",
      subject: "Shared file blocked, authorize app now",
      body: "To view the shared document, authorize this app immediately.\n\nGrant permissions here: http://drive-security-access.com/oauth\n\nThe app requires read-all-mail and send-as access to continue.",
      flags: [
        { id: "drive-domain", text: "alerts@drive-security-access.com", hint: "Not an official Google domain." },
        { id: "drive-url", text: "http://drive-security-access.com/oauth", hint: "Suspicious OAuth page over HTTP." },
        { id: "drive-mail", text: "read-all-mail", hint: "Permission scope far beyond file sharing." },
        { id: "drive-send", text: "send-as access", hint: "Token abuse risk: attacker can send email as user." },
      ],
    },
  },
];
