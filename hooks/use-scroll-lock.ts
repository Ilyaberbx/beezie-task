"use client";

import { useEffect } from "react";

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
