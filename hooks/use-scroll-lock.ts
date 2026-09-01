"use client";

import { useEffect } from "react";

/**
 * Dialogs hand off to each other, so two locks overlap by design. Counting them
 * keeps the restore honest: without it the outgoing dialog writes the incoming
 * dialog's "hidden" back onto <html> and the page never scrolls again.
 */
let locks = 0;
let restore = "";

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (locks++ === 0) {
      restore = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      if (--locks === 0) document.documentElement.style.overflow = restore;
    };
  }, [locked]);
}
