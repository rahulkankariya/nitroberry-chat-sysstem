"use client";

import { useEffect } from "react";

export function useKeyboardControls(
  isChatOpen: boolean,
  hasActiveMode: boolean,
  onCloseChat: () => void,
  onTerminate: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isChatOpen) {
          onCloseChat();
        } else if (hasActiveMode) {
          onTerminate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatOpen, hasActiveMode, onCloseChat, onTerminate]);
}