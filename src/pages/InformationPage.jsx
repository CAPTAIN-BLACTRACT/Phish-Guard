import { T } from "../styles";
import { CyberBackground } from "../components";

const CONTENT = {
    about: {
        title: "About PhishGuard",
        subtitle: "OUR MISSION",
        body: `PhishGuard was born out of a simple observation: technical security measures are only as strong as the people who use them. In a world of sophisticated social engineering, human intuition is the ultimate firewall.

    Our platform combines game design principles with behavioral psychology to transform boring security training into an engaging, immersive experience. We don't just teach you what a phishing email looks like; we train your brain to recognize the subtle patterns of deception.`,
        sections: [
            { h: "Gamified Learning", p: "We believe competition and rewards drive better retention than traditional video lectures." },
            { h: "Real-World Scenarios", p: "Our simulator uses sanitized, real-world examples to provide practical experience without the risk." },
            { h: "Community Driven", p: "Recruits can submit threats they encounter, helping the entire community stay ahead of attackers." }
        ]
    },
    privacy: {
        title: "Privacy Policy",
        subtitle: "DATA PROTECTION",
        body: `At PhishGuard, your security is our priority. We handle your data with the same vigilance we use to detect threats.`,
        sections: [
            { h: "Minimal Collection", p: "We only collect data necessary for providing our training services, such as your progress and XP." },
            { h: "No Credential Storage", p: "We never ask for or store actual financial or personal credentials. Simulations are strictly educational." },
            { h: "Transparency", p: "You have full control over your profile data. We never sell your information to third parties." }
        ]
    },
    faq: {
        title: "Frequently Asked Questions",
        subtitle: "INTEL CORE",
        body: "Common inquiries about the PhishGuard terminal and training protocols.",
        sections: [
            { h: "Is PhishGuard free?", p: "Yes, the basic training modules and simulator are free for individual recruits." },
            { h: "Will this protect my real accounts?", p: "While we provide the skills, you must apply them. PhishGuard is a training tool, not a security software suite." },
            { h: "Can I use this for my team?", p: "We are developing enterprise features for organizations. Contact hello@phishguard.io for details." }
        ]
    },
    checklist: {
        title: "The PhishGuard Checklist",
        subtitle: "OPERATIONAL PROTOCOL",
        body: "Follow these 5 steps before every click. Download the full PDF for your workstation.",
        sections: [
            { h: "1. Verify the Sender", p: "Check the actual email address, not just the display name." },
            { h: "2. Hover Before Click", p: "Check the URL preview at the bottom of your browser." },
            { h: "3. Check the Tone", p: "Is there excessive urgency or a sense of fear being exploited?" },
            { h: "4. Question the Request", p: "Would this company normally ask for this information via email?" },
            { h: "5. When in Doubt, Out", p: "Close the email and visit the official website directly through your browser." }
        ]
    }
};

export function InformationPage({ type = "about", onBack }) {
    const data = CONTENT[type] || CONTENT.about;

    return (
        <div style={{ ...T.page, background: "#000509" }}>
            <CyberBackground />
            <section style={{ ...T.sec, maxWidth: 900, margin: "0 auto", animation: "fuA .5s ease both" }}>
                <button
                    onClick={onBack}
                    style={{ ...T.btnG, marginBottom: 30, display: "flex", alignItems: "center", gap: 8 }}
                >
                    ← EXIT TERMINAL
                </button>

                <div style={{ marginBottom: 40 }}>
                    <div style={T.secLbl}>// {data.subtitle}</div>
                    <h1 style={{ ...T.secTitle, fontSize: " clamp(2.5rem, 5vw, 4rem)" }}>{data.title}</h1>
                </div>

                <div style={{ ...T.card, padding: 40, border: "1px solid rgba(0,245,255,0.15)" }}>
                    <p style={{ fontSize: "1.1rem", color: "#e0f7fa", lineHeight: 1.7, marginBottom: 40, whiteSpace: "pre-line" }}>
                        {data.body}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 30 }}>
                        {data.sections.map((s, i) => (
                            <div key={i} style={{ padding: 20, background: "rgba(0,245,255,0.03)", borderRadius: 4, borderLeft: "2px solid #00f5ff" }}>
                                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", color: "#00f5ff", marginBottom: 10 }}>{s.h}</h3>
                                <p style={{ color: "#546e7a", fontSize: "0.9rem", lineHeight: 1.5 }}>{s.p}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {type === "checklist" && (
                    <div style={{ marginTop: 40, textAlign: "center" }}>
                        <button style={T.btnHP}>Download PDF Version (1.2MB)</button>
                    </div>
                )}
            </section>
        </div>
    );
}
