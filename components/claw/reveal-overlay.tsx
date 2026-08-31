"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSoundPreference } from "@/hooks/claw/use-sound-preference";

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
    if (openings === 0) return;

    const element = videoRef.current;
    let started = false;
    const play = () =>
      element?.play().then(() => {
        started = true;
      });

    void play()?.catch(() => {
      if (!element) return onFinish();
      element.muted = true;
      return play()?.catch(() => onFinish());
    });

    const bailout = window.setTimeout(() => {
      if (!started) onFinish();
    }, MAX_WAIT_MS);

    return () => window.clearTimeout(bailout);
  }, [openings, onFinish]);

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
