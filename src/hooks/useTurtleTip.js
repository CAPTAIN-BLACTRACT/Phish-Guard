import { useState, useEffect } from "react";
import { TIPS } from "../constants";

/**
 * useTurtleTip
 * Cycles through Sheldon's tips automatically.
 *
 * Returns:
 *   currentTip  – the tip string to display (null when hidden)
 *   nextTip()   – manually advance to the next tip
 */
export function useTurtleTip() {
  const [tipIdx,   setTipIdx]   = useState(0);
  const [showTip,  setShowTip]  = useState(false);

  // Show first tip after 2 s
  useEffect(() => {
    const id = setTimeout(() => setShowTip(true), 2000);
    return () => clearTimeout(id);
  }, []);

  // Cycle every 12 s
  useEffect(() => {
    const id = setInterval(() => {
      setShowTip(true);
      setTipIdx((i) => (i + 1) % TIPS.length);
      const offId = setTimeout(() => setShowTip(false), 4500);
      return () => clearTimeout(offId);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const nextTip = () => {
    setShowTip(true);
    setTipIdx((i) => (i + 1) % TIPS.length);
    const id = setTimeout(() => setShowTip(false), 4500);
    return () => clearTimeout(id);
  };

  return {
    currentTip: showTip ? TIPS[tipIdx] : null,
    nextTip,
  };
}
