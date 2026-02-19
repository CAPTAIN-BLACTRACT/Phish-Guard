export const QUESTIONS = [
  {
    diff: "easy",
    topic: "Email Phishing",
    scenario: "You receive this email:",
    img: '📧 FROM: paypa1-security@gmail.com\nSUBJECT: 🚨 Urgent: Your account is suspended\nBODY: Click here to verify your account immediately or it will be deleted.',
    q: "What is the primary red flag in this email?",
    opts: [
      "The email has an attachment",
      'The sender domain is "paypa1" not "paypal" and uses Gmail',
      "The subject line is too short",
      "The email was received at night",
    ],
    correct: 1,
    explain:
      'The domain "paypa1.com" uses the number "1" instead of the letter "l" — a classic lookalike domain trick. Legitimate PayPal emails come from @paypal.com only.',
  },
  {
    diff: "easy",
    topic: "SMS Phishing",
    scenario: "You get this text message:",
    img: '📱 SMS from: +1-800-123-4567\n"USPS: Your package is held. Update delivery info: bit.ly/usps-track-8271"',
    q: "Why is this SMS suspicious?",
    opts: [
      "It uses a shortened URL (bit.ly) hiding the real destination",
      "USPS never sends text messages",
      "The phone number looks real",
      "The message is too short",
    ],
    correct: 0,
    explain:
      "Shortened URLs like bit.ly hide the real destination. Phishers use them to disguise malicious links. Always go directly to the official website instead of clicking links in SMS.",
  },
  {
    diff: "easy",
    topic: "Credential Theft",
    scenario: "A pop-up appears on your screen:",
    img: '⚠️ POPUP: "Your Microsoft account password expired!\nEnter your current password to continue:\n[Password field] [Submit]"',
    q: "What should you do?",
    opts: [
      "Enter your password quickly to avoid lockout",
      "Close the popup and go to microsoft.com directly",
      "Click submit but use a fake password",
      "Call the number shown in the popup",
    ],
    correct: 1,
    explain:
      "Legitimate services NEVER ask for your password via pop-ups. Close it and navigate directly to the official website. This is a classic credential harvesting attack.",
  },
  {
    diff: "medium",
    topic: "Spear Phishing",
    scenario: 'Your "CFO" emails you:',
    img: "📧 FROM: cfo@company-finance.net\nSUBJECT: CONFIDENTIAL – Wire Transfer Needed\nBODY: Hi [Your Name], I'm in a meeting and need you to urgently wire $15,000. Do not discuss with anyone.",
    q: "This is a Business Email Compromise (BEC) attack. What are the red flags?",
    opts: [
      "The CFO should never email about money",
      "Domain is 'company-finance.net' not your company's domain + unusual request + secrecy",
      "The amount is too large",
      "CFOs always use phone for wire transfers",
    ],
    correct: 1,
    explain:
      "BEC attacks impersonate executives. Red flags: non-company domain, unusual financial request, demand for secrecy, and urgency. Always verify wire transfers via phone to a known number.",
  },
  {
    diff: "medium",
    topic: "Fake Website",
    scenario: "You search for your bank and click the first result:",
    img: "🌐 URL: https://www.bankofamerlca.com/signin\n[Bank of America Logo]\n[Username] [Password] [Login]",
    q: "What is wrong with this URL?",
    opts: [
      "The URL uses HTTP instead of HTTPS",
      'The letter "i" in "america" is replaced with "l" making it "amerlca"',
      "The login page looks too simple",
      "The bank logo looks slightly different",
    ],
    correct: 1,
    explain:
      'The domain uses "amerlca" — a lowercase "L" replacing the "i". This is called a homograph attack. Always check the URL character by character before entering credentials.',
  },
  {
    diff: "medium",
    topic: "Whaling",
    scenario: "You receive this LinkedIn message:",
    img: '💼 LinkedIn DM from: "Elon Musk (CEO, Tesla)"\n"Hey, I\'ve chosen you for a special investment opportunity. Send 0.5 BTC and get 5 BTC back. Act fast!"',
    q: "Why is this definitely a scam?",
    opts: [
      "Billionaires don't use LinkedIn",
      "Crypto doubling scam — no one guarantees crypto returns; verified accounts don't DM strangers about investments",
      "The return rate is too high",
      "LinkedIn is not secure",
    ],
    correct: 1,
    explain:
      "No legitimate investment ever guarantees crypto returns. This is a 'doubling scam.' Real executives don't DM strangers with investment offers. The promise of guaranteed returns is always fraud.",
  },
  {
    diff: "hard",
    topic: "Advanced Persistent Threat",
    scenario: "Your work laptop shows this notification:",
    img: '🔔 SYSTEM ALERT: IT Support\nFROM: helpdesk@it-support-corp.net\n"We detected malware on your device. Install our security patch immediately: [Download SecurePatch.exe]"',
    q: "This is a sophisticated phishing attack. Why should you refuse?",
    opts: [
      "IT departments use tickets, not email downloads",
      "SecurePatch.exe could be malware, the domain is not your company's, and IT never pushes executables via unsolicited email",
      "The file size is suspicious",
      "You should ask your manager first",
    ],
    correct: 1,
    explain:
      "This is a 'Fake IT' attack. Red flags: external domain, unsolicited email, executable attachment. Legitimate IT uses your company's ticketing system. NEVER run executables from email.",
  },
  {
    diff: "hard",
    topic: "OAuth Phishing",
    scenario: 'You try to log into a site using "Login with Google":',
    img: '🔐 OAuth Consent Screen:\nApp: "Google Drive Backup Pro"\nRequests: Read ALL your emails, Access your contacts, Send emails on your behalf\n[Allow] [Deny]',
    q: "What should concern you about these OAuth permissions?",
    opts: [
      "OAuth is always safe since Google handles it",
      "The app requests excessive permissions (read all emails, send as you) — more than a backup tool needs",
      "You should always allow apps that use Google login",
      "The app name sounds legitimate",
    ],
    correct: 1,
    explain:
      "OAuth phishing grants attackers persistent access to your account. Legitimate backup apps only need read access to Drive — not email read/send. Always review OAuth permissions carefully.",
  },
];
