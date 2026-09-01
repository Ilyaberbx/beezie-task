"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSoundPreference } from "@/hooks/claw/use-sound-preference";
import { useVideoPlayback } from "@/hooks/use-video-playback";

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

  useVideoPlayback(videoRef, {
    playing: open && openings > 0,
    muted: !soundOn,
    restartKey: openings,
    rewindWhenStopped: true,
    onStall: onFinish,
    onGiveUp: onFinish,
  });

  useEffect(() => {
    if (open && skipAnimation) onFinish();
  }, [open, skipAnimation, onFinish]);

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
