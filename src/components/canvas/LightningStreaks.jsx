import { useState, useEffect } from "react";

export function LightningStreaks() {
    const [streaks, setStreaks] = useState([]);

    useEffect(() => {
        let idCounter = 0;
        const spawnStreak = () => {
            const id = idCounter++;
            const left = Math.random() * 100;
            const height = 100 + Math.random() * 300;
            const duration = 2 + Math.random() * 4;
            const delay = Math.random() * 0.5;

            const newStreak = { id, left, height, duration, delay };
            setStreaks(prev => [...prev.slice(-15), newStreak]);

            // Cleanup after animation finishes
            setTimeout(() => {
                setStreaks(prev => prev.filter(s => s.id !== id));
            }, (duration + delay) * 1000);
        };

        const interval = setInterval(() => {
            if (Math.random() > 0.4) spawnStreak();
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
            {streaks.map(s => (
                <div
                    key={s.id}
                    style={{
                        position: "absolute",
                        left: `${s.left}%`,
                        width: 1,
                        height: s.height,
                        top: -s.height,
                        background: "linear-gradient(180deg, transparent, #00f5ff, #d500f9, transparent)",
                        boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)",
                        animation: `streamFall ${s.duration}s ${s.delay}s linear forwards`,
                    }}
                />
            ))}
            <style>{`
        @keyframes streamFall {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
