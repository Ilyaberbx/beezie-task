"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSoundPreference } from "@/hooks/claw/use-sound-preference";

/** How long the picture may sit on one frame before we hand over the result. */
const STALL_MS = 1500;

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
  const [soundOn, setSoundOn] = useSoundPreference();
  const [openings, setOpenings] = useState(0);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = !soundOn;
  }, [soundOn, openings]);

  useEffect(() => {
    if (open && skipAnimation) onFinish();
  }, [open, skipAnimation, onFinish]);

  useEffect(() => {
    if (open) return;
    const element = videoRef.current;
    if (!element) return;
    element.pause();
    element.currentTime = 0;
  }, [open]);

  useEffect(() => {
    if (!open || openings === 0) return;

    const element = videoRef.current;
    if (!element) return;

    const play = () => element.play();
    void play().catch(() => {
      element.muted = true;
      return play().catch(onFinish);
    });

    // One watchdog for the whole playback, not just its start. A reveal that
    // never gets a decoder and one that stalls mid-frame look identical from
    // here, and this overlay has no way out — if the picture stops moving,
    // give the user their result rather than a still they cannot dismiss.
    let last = -1;
    const watchdog = window.setInterval(() => {
      if (element.currentTime === last) return onFinish();
      last = element.currentTime;
    }, STALL_MS);

    return () => window.clearInterval(watchdog);
  }, [open, openings, onFinish]);

  if (skipAnimation) return null;

  return (
    <Dialog
      open={open}
      onClose={() => undefined}
      onOpened={() => setOpenings((count) => count + 1)}
      label="Revealing your pull"
      variant="video"
      dismissible={false}
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        src={source}
        preload="auto"
        playsInline
        onEnded={onFinish}
        onError={onFinish}
      />

      <button
        type="button"
        onClick={() => setSoundOn(!soundOn)}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute reveal sound" : "Unmute reveal sound"}
        className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-md bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
      >
        {soundOn ? <Volume2 className="size-4.5" /> : <VolumeX className="size-4.5" />}
      </button>
    </Dialog>
  );
}
