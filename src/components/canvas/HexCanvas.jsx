import { useEffect, useRef } from "react";

export function HexCanvas() {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let W, H, t = 0, raf;
        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);
        const hex = (x, y, s, a) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                ctx.lineTo(x + s * Math.cos(angle), y + s * Math.sin(angle));
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(0,245,255,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        };
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.004;
            const s = 42, hx = s * Math.sqrt(3), hy = s * 1.5;
            const cols = Math.ceil(W / hx) + 2, rows = Math.ceil(H / hy) + 2;
            for (let r = -1; r < rows; r++) {
                for (let c = -1; c < cols; c++) {
                    const x = c * hx + (r % 2 === 0 ? hx / 2 : 0), y = r * hy;
                    const dx = (x - W / 2) / W, dy = (y - H / 2) / H;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const wave = Math.abs(Math.sin(dist * 5 - t * 2));
                    const a = (0.25 + 0.75 * (1 - dist)) * wave * 0.55;
                    if (a > 0.005) hex(x, y, s - 4, a);
                }
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);
    return (
        <canvas
            ref={ref}
            style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                zIndex: 0, pointerEvents: "none", opacity: 0.065,
            }}
        />
    );
}
