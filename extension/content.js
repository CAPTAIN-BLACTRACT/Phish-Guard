// PhishGuard Sentinel - Content Script
// Analyzes the current page for common phishing indicators

const analyzePage = () => {
    const hostname = window.location.hostname;
    const url = window.location.href;

    // 1. Basic Typosquatting Check (Mock logic)
    const knownBrands = ["paypal", "google", "facebook", "microsoft", "apple", "amazon"];
    const suspiciousPatterns = [/paypa1/i, /g00gle/i, /faceb00k/i, /mircosoft/i];

    let score = 0;
    let alerts = [];

    suspiciousPatterns.forEach(pattern => {
        if (pattern.test(hostname)) {
            score += 50;
            alerts.push("⚠️ Potential Typosquatted Domain Detected!");
        }
    });

    // 2. Check for Punycode (homograph attack)
    if (hostname.includes("xn--")) {
        score += 40;
        alerts.push("⚠️ Punycode Domain Detected (Potential Homograph Attack).");
    }

    // 3. Form Analysis
    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 0 && !window.isSecureContext) {
        score += 30;
        alerts.push("❌ Password field on non-secure (HTTP) page!");
    }

    if (score >= 30) {
        injectWarning(alerts);
    }
};

const injectWarning = (alerts) => {
    const banner = document.createElement("div");
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #ff1744;
        color: white;
        padding: 10px;
        z-index: 999999;
        text-align: center;
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    `;
    banner.innerHTML = `🛡️ [PHISHGUARD ALERT]: ${alerts.join(" | ")} <button id="pg-ignore" style="margin-left:20px; background:rgba(255,255,255,0.2); border:1px solid white; color:white; cursor:pointer;">IGNORE</button>`;

    document.body.prepend(banner);

    document.getElementById("pg-ignore").onclick = () => {
        banner.remove();
    };
};

analyzePage();
