import { useState, useRef, useCallback } from "react";

/**
 * useToast
 * Manages a single bottom-right toast notification.
 *
 * Returns:
 *   toast         – { msg, type, visible }
 *   showToast(msg, type) – display toast; auto-dismisses after 3.5 s
 *                          type: "ok" | "ng" | "inf"
 */
export function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "ok", visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = "ok") => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, visible: true });
    timerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3500
    );
  }, []);

  return { toast, showToast };
}
