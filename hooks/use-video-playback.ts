"use client";

import { useEffect, type RefObject } from "react";

const HAVE_FUTURE_DATA = 3;
const STALL_MS = 1500;

type VideoPlaybackOptions = {
  playing: boolean;
  muted: boolean;
  restartKey?: number;
  rewindWhenStopped?: boolean;
  onCachedAndPlayable?: () => void;
  onStall?: () => void;
  onGiveUp?: () => void;
};

export function useVideoPlayback(
  ref: RefObject<HTMLVideoElement | null>,
  {
    playing,
    muted,
    restartKey = 0,
    rewindWhenStopped = false,
    onCachedAndPlayable,
    onStall,
    onGiveUp,
  }: VideoPlaybackOptions,
) {
  useEffect(() => {
    const element = ref.current;
    if (element && element.readyState >= HAVE_FUTURE_DATA) onCachedAndPlayable?.();
  }, [ref, onCachedAndPlayable]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.muted = muted;
  }, [ref, muted, restartKey]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!playing) {
      element.pause();
      if (rewindWhenStopped) element.currentTime = 0;
      return;
    }

    const play = () => element.play();
    void play().catch(() => {
      element.muted = true;
      return play().catch(() => onGiveUp?.());
    });

    if (!onStall) return;

    let lastFrame = -1;
    const watchdog = window.setInterval(() => {
      if (element.currentTime === lastFrame) return onStall();
      lastFrame = element.currentTime;
    }, STALL_MS);

    return () => window.clearInterval(watchdog);
  }, [ref, playing, restartKey, rewindWhenStopped, onStall, onGiveUp]);
}
