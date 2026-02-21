import { MatrixCanvas } from "./MatrixCanvas";
import { ParticleCanvas } from "./ParticleCanvas";
import { HexCanvas } from "./HexCanvas";
import { LightningStreaks } from "./LightningStreaks";

/**
 * CyberBackground
 * A unified background component that stacks multiple canvas effects:
 * - Matrix Rain (Subtle vertical text)
 * - Particle Network (Interactive points and lines)
 * - Hex Grid (Pulse waving geometric pattern)
 * - Lightning Streaks (Falling vertical light beams)
 */
export function CyberBackground() {
    return (
        <>
            <MatrixCanvas />
            <ParticleCanvas />
            <HexCanvas />
            <LightningStreaks />

            {/* Grid overlay */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                backgroundImage: `
            linear-gradient(rgba(0,245,255,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,245,255,.04) 1px,transparent 1px),
            linear-gradient(rgba(0,245,255,.015) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,245,255,.015) 1px,transparent 1px)`,
                backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
            }} />

            {/* Radial ambient gradients */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                background: `
            radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,245,255,0.04) 0%,transparent 60%),
            radial-gradient(ellipse 40% 40% at 100% 50%,rgba(213,0,249,0.04) 0%,transparent 60%)`,
            }} />

            {/* Ambient Darkening layer for better content readability */}
            <div style={{
                position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
                background: "rgba(0,5,10,0.7)",
                backdropFilter: "blur(2px)",
            }} />

            {/* Scanline overlay */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)",
            }} />
        </>
    );
}
