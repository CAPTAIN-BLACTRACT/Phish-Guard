import { useState, useEffect, useRef } from "react";
import { TIPS } from "../constants";

/**
 * useFinnTip
 * Rotates advisor tips and can speak them using Web Speech API.
 */
export function useFinnTip() {
  const tips = Array.isArray(TIPS) && TIPS.length
    ? TIPS
    : ["Hi! I am Finn, your neural defense advisor."];

  const [tipIdx, setTipIdx] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const isSpeakingRef = useRef(false);
  const hideTimerRef = useRef(null);

  const queueHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isSpeakingRef.current) setShowTip(false);
    }, 4500);
  };

  const pickVoice = (voices) => {
    if (!Array.isArray(voices) || voices.length === 0) return null;

    return (
      voices.find((voice) =>
        voice.name.includes("Female") ||
        voice.name.includes("Google UK English Female") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Google US English")
      ) || null
    );
  };

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = pickVoice(voices);

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.pitch = 1.3;
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setShowTip(true);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      queueHide();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      queueHide();
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setShowTip(true);
      queueHide();
    }, 2000);

    return () => {
      clearTimeout(id);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIdx((current) => {
        const nextIdx = (current + 1) % tips.length;
        setShowTip(true);
        queueHide();
        return nextIdx;
      });
    }, 12000);

    return () => clearInterval(id);
  }, [tips.length]);

  const nextTip = () => {
    const nextIdx = (tipIdx + 1) % tips.length;
    setShowTip(true);
    setTipIdx(nextIdx);
    speak(tips[nextIdx]);
    queueHide();
  };

  return {
    currentTip: showTip ? tips[tipIdx] : null,
    nextTip,
  };
}
