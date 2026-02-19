import { useEffect, useRef } from "react";

/**
 * MatrixCanvas
 * Full-screen fixed canvas that renders a subtle matrix-rain effect
 * using cyber-themed characters. Opacity is kept very low so it acts
 * as a texture rather than a distraction.
 */
export function MatrixCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const chars =
      "01アイウエオカキクケコ PHISHGUARD THREAT DETECT XOR AES SHA256 NULL VOID EXPLOIT";

    let drops = [];
    let W, H;

    const init = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      drops = Array(Math.floor(W / 12)).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0,5,9,0.05)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = '11px "Share Tech Mono", monospace';

      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle =
          i % 5 === 0 ? "#00ff9d" : i % 7 === 0 ? "#d500f9" : "#00f5ff";
        ctx.globalAlpha = 0.5;
        ctx.fillText(ch, i * 12, y * 12);
        ctx.globalAlpha = 1;

        if (y * 12 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    init();
    window.addEventListener("resize", init);
    const id = setInterval(draw, 60);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        0,
        pointerEvents: "none",
        opacity:       0.04,
      }}
    />
  );
}
