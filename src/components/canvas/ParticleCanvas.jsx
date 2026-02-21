import { useEffect, useRef } from "react";

export function ParticleCanvas() {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let W, H, particles = [];
        let mouse = { x: -9999, y: -9999 };
        let targetDark = { x: -9999, y: -9999 };
        let currentDark = { x: -9999, y: -9999 };
        const CONN = 120, MDIST = 150, DARK_R = 220;
        const CONN2 = CONN * CONN, MDIST2 = MDIST * MDIST;

        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        const initP = () => {
            resize();
            const n = Math.floor((W * H) / 6000);
            particles = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2.2 + 0.6,
                color: Math.random() > 0.65 ? [255, 23, 68] : Math.random() > 0.4 ? [0, 245, 255] : Math.random() > 0.5 ? [0, 255, 157] : [213, 0, 249],
                pulse: Math.random() * Math.PI * 2,
            }));
        };
        initP();

        const onMouse = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            targetDark.x = e.clientX;
            targetDark.y = e.clientY;
        };
        const onLeave = () => {
            targetDark.x = -9999;
            targetDark.y = -9999;
        };
        window.addEventListener("mousemove", onMouse);
        window.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", initP);

        let raf;
        const frame = () => {
            ctx.clearRect(0, 0, W, H);
            currentDark.x += (targetDark.x - currentDark.x) * 0.1;
            currentDark.y += (targetDark.y - currentDark.y) * 0.1;
            if (currentDark.x > -500) {
                const grad = ctx.createRadialGradient(currentDark.x, currentDark.y, 0, currentDark.x, currentDark.y, DARK_R);
                grad.addColorStop(0, "rgba(0,0,0,0.82)");
                grad.addColorStop(0.35, "rgba(0,0,0,0.6)");
                grad.addColorStop(0.65, "rgba(0,0,0,0.25)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, H);
            }
            particles.forEach((p) => {
                p.pulse += 0.018;
                const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
                const md2 = mdx * mdx + mdy * mdy;
                if (md2 < MDIST2) {
                    const md = Math.sqrt(md2);
                    p.vx += (mdx / md) * 0.012;
                    p.vy += (mdy / md) * 0.012;
                }
                p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            });
            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < CONN2) {
                        const d = Math.sqrt(d2);
                        const alpha = (1 - d / CONN) * 0.22;
                        const [r, g, bl] = a.color;
                        ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
                const p = particles[i];
                const mdx2 = p.x - mouse.x, mdy2 = p.y - mouse.y;
                const md2sq = mdx2 * mdx2 + mdy2 * mdy2;
                if (md2sq < MDIST2) {
                    const md2 = Math.sqrt(md2sq);
                    const alpha = (1 - md2 / MDIST) * 0.55;
                    const [r, g, bl] = p.color;
                    ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                    ctx.lineWidth = 0.6; // restore for particle connections
                }
            }
            particles.forEach((p) => {
                const [r, g, b] = p.color;
                const pr = p.r * (0.75 + Math.sin(p.pulse) * 0.25);
                ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
                // Removed expensive shadowBlur for performance
                ctx.fill();
            });
            raf = requestAnimationFrame(frame);
        };
        frame();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMouse);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", initP);
        };
    }, []);
    return (
        <canvas
            ref={ref}
            style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                zIndex: 0, pointerEvents: "none", opacity: 0.9,
            }}
        />
    );
}
