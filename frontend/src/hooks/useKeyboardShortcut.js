import { useEffect } from "react";

export function useKeyboardShortcut(key, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && !e.ctrlKey && !e.metaKey && document.activeElement === document.body) {
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback]);
}