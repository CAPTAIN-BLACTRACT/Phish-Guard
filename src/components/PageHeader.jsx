import React from 'react';
import { T } from '../styles';

export function PageHeader({ title, subtitle, label }) {
    return (
        <div style={{ marginBottom: 36 }}>
            {label && (
                <div style={T.secLbl}>
                    <span style={{ color: "rgba(0,245,255,0.4)" }}>//</span> {label}
                </div>
            )}
            <h1 style={{ ...T.secTitle, margin: "0 0 8px 0" }}>{title}</h1>
            {subtitle && (
                <p style={{ color: "var(--txt2)", fontFamily: "Share Tech Mono, monospace", fontSize: "0.9rem", margin: 0 }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
