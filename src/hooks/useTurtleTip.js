import { useEffect, useRef, useState } from "react";
import { TIPS } from "../constants/tips";

export function useTurtleTip(userName = "OPERATOR") {
  const [index, setIndex] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const hideTimerRef = useRef(null);
  const speechRunRef = useRef(0);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = (delay = 4500) => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setShowTip(false), delay);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const markLoaded = () => {
      if (synth.getVoices().length > 0) setVoicesLoaded(true);
    };

    markLoaded();
    synth.addEventListener("voiceschanged", markLoaded);
    return () => synth.removeEventListener("voiceschanged", markLoaded);
  }, []);

  useEffect(() => {
    return () => {
      clearHideTimer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const runId = Date.now();
    speechRunRef.current = runId;
    let didStart = false;

    // Prevent overlapping speech when user taps repeatedly.
    if (synth.speaking || synth.pending) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const voices = synth.getVoices();
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.includes("Female") ||
        voice.name.includes("Google UK English Female") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Google US English")
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.pitch = 1.3;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => {
      if (speechRunRef.current !== runId) return;
      didStart = true;
      clearHideTimer();
      setShowTip(true);
    };
    utterance.onend = () => {
      if (speechRunRef.current !== runId) return;
      scheduleHide(1500);
    };
    utterance.onerror = () => {
      if (speechRunRef.current !== runId) return;
      scheduleHide(1800);
    };

    const speakNow = () => {
      // Helps on iOS/Safari when speech gets paused after navigation/backgrounding.
      synth.resume();
      synth.speak(utterance);
      // If browser blocks speech start, still auto-hide after brief visible period.
      setTimeout(() => {
        if (speechRunRef.current !== runId) return;
        if (!didStart) scheduleHide(2200);
      }, 1800);
    };

    // Mobile browsers may populate voices asynchronously after first interaction.
    if (!voices.length && !voicesLoaded) {
      let handled = false;
      const handleVoices = () => {
        if (handled) return;
        handled = true;
        const refreshedVoices = synth.getVoices();
        const refreshedFemaleVoice = refreshedVoices.find(
          (voice) =>
            voice.name.includes("Female") ||
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Samantha") ||
            voice.name.includes("Google US English")
        );
        if (refreshedFemaleVoice) utterance.voice = refreshedFemaleVoice;
        speakNow();
        synth.removeEventListener("voiceschanged", handleVoices);
      };

      synth.addEventListener("voiceschanged", handleVoices);
      setTimeout(() => {
        if (handled) return;
        handled = true;
        speakNow();
        synth.removeEventListener("voiceschanged", handleVoices);
      }, 300);
      return;
    }

    speakNow();
  };

  const getPersonalizedTip = (idx) => TIPS[idx].replace("[USER]", userName.toUpperCase());

  // Speech only triggers on manual click.
  const nextTip = () => {
    const nextIdx = (index + 1) % TIPS.length;
    setIndex(nextIdx);
    setShowTip(true);
    speak(getPersonalizedTip(nextIdx));
  };

  return {
    currentTip: showTip ? getPersonalizedTip(index) : null,
    nextTip,
  };
}
