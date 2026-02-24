import { useState, useCallback } from "react";

/**
 * useGemini Hook
 * Provides a robust interface for interacting with Google's Gemini AI models
 * includes an automated fallback sequence for high availability.
 */
export function useGemini() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callGemini = useCallback(async (prompt, systemContext = "") => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
            const err = "ERROR: GEMINI_API_KEY NOT FOUND. Please initialize neural link in .env file.";
            setError(err);
            return err;
        }

        setLoading(true);
        setError(null);

        // High-Fidelity Sequence for maximum reliability
        const trialSequence = [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-3.1-pro-preview",
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
        ];

        const fullPrompt = systemContext 
            ? `${systemContext}

User Request: ${prompt}`
            : `You are Finn-AI, a high-level cybersecurity neural advisor for PhishGuard. 
               Your mission is to provide deep technical analysis on phishing, social engineering, and defense strategies.
               Keep responses concise, formatted for a terminal interface (use 🟢, 🔴, 📡 emojis), and authoritative.
               
               Current User Intelligence Request: ${prompt}`;

        for (const modelId of trialSequence) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: fullPrompt
                            }]
                        }]
                    })
                });

                const data = await response.json();

                if (data.error) {
                    if (data.error.code === 429 || data.error.status?.includes("RESOURCE_EXHAUSTED") || data.error.code === 404) {
                        console.warn(`Neural Node ${modelId} unavailable. Shifting frequencies...`);
                        continue;
                    }
                    const err = `NEURAL_FAILURE: ${data.error.message}`;
                    setError(err);
                    setLoading(false);
                    return err;
                }

                setLoading(false);
                return data.candidates[0].content.parts[0].text;
            } catch (err) {
                console.error(`Link failure on ${modelId}:`, err);
                continue; 
            }
        }

        const finalErr = "CRITICAL_FAILURE: All neural nodes are currently over-saturated. Please stand by for bandwidth reclamation.";
        setError(finalErr);
        setLoading(false);
        return finalErr;
    }, []);

    return { callGemini, loading, error };
}
