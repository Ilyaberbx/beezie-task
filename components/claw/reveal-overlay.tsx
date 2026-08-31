"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "@/components/ui/dialog";

const MAX_WAIT_MS = 4000;

type RevealOverlayProps = {
  open: boolean;
  source: string;
  skipAnimation: boolean;
  onFinish: () => void;
};

export function RevealOverlay({
  open,
  source,
  skipAnimation,
  onFinish,
}: RevealOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;

    if (skipAnimation) {
      onFinish();
      return;
    }

    const element = videoRef.current;
    let started = false;

    void element?.play().then(() => {
      started = true;
    }).catch(() => onFinish());

    const bailout = window.setTimeout(() => {
      if (!started) onFinish();
    }, MAX_WAIT_MS);

    return () => window.clearTimeout(bailout);
  }, [open, skipAnimation, onFinish]);

  if (skipAnimation) return null;

  return (
    <Dialog
      open={open}
      onClose={onFinish}
      label="Revealing your pull"
      variant="video"
      dismissible={false}
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        src={source}
        preload="auto"
        muted
        playsInline
        onEnded={onFinish}
        onError={onFinish}
      />
    </Dialog>
  );
}
