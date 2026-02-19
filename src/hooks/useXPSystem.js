import { useState, useCallback } from "react";
import { XP_PER_LEVEL } from "../constants";

/**
 * useXPSystem
 * Manages player XP, level, and level-up notifications.
 *
 * Returns:
 *   xp          – current XP total
 *   level       – current level (1–10)
 *   addXP(pts)  – award XP and trigger level-up if threshold crossed
 *   xpPct()     – 0–100 progress % within current level
 *   xpToNext()  – XP remaining until next level
 *   levelUpData – { title, msg, emoji } when a level-up just occurred, null otherwise
 *   clearLevelUp() – dismiss the level-up overlay
 */
export function useXPSystem(initialXP = 1250, initialLevel = 8) {
  const [xp, setXP]               = useState(initialXP);
  const [level, setLevel]         = useState(initialLevel);
  const [levelUpData, setLevelUp] = useState(null);

  const addXP = useCallback(
    (pts) => {
      setXP((prev) => {
        const next        = prev + pts;
        const nextThresh  = XP_PER_LEVEL[level] ?? next + 9999;
        if (next >= nextThresh && level < 10) {
          setLevel((l) => l + 1);
          setLevelUp({
            title: "LEVEL UP!",
            msg:   `You advanced to Level ${level + 1}`,
            emoji: "🎉",
          });
        }
        return next;
      });
    },
    [level]
  );

  const xpPct = () => {
    const start = XP_PER_LEVEL[level - 1] ?? 0;
    const end   = XP_PER_LEVEL[level]     ?? start + 1000;
    return Math.min(100, ((xp - start) / (end - start)) * 100);
  };

  const xpToNext = () => {
    const end = XP_PER_LEVEL[level] ?? xp + 1000;
    return end - xp;
  };

  return {
    xp,
    level,
    addXP,
    xpPct,
    xpToNext,
    levelUpData,
    clearLevelUp: () => setLevelUp(null),
  };
}
