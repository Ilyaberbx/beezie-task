"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { useSoundPreference } from "@/hooks/claw/use-sound-preference";
import { useVideoPlayback } from "@/hooks/use-video-playback";

const PANEL_IN_MS = 240;
const CURTAIN_MS = 420;

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
  const [rolling, setRolling] = useState(false);
  const [lit, setLit] = useState(false);
  const [ending, setEnding] = useState(false);

  const cutToBlack = useCallback(() => {
    setLit(false);
    setEnding(true);
  }, []);

  useVideoPlayback(videoRef, {
    playing: open && openings > 0,
    muted: !soundOn,
    restartKey: openings,
    rewindWhenStopped: true,
    onStall: cutToBlack,
    onGiveUp: cutToBlack,
  });

  useEffect(() => {
    if (open && skipAnimation) onFinish();
  }, [open, skipAnimation, onFinish]);

  useEffect(() => {
    if (!rolling || ending) return;
    const timer = window.setTimeout(() => setLit(true), PANEL_IN_MS);
    return () => window.clearTimeout(timer);
  }, [rolling, ending]);

  useEffect(() => {
    if (!ending) return;
    const timer = window.setTimeout(onFinish, CURTAIN_MS);
    return () => window.clearTimeout(timer);
  }, [ending, onFinish]);

  if (skipAnimation) return null;

  return (
    <Dialog
      open={open}
      onClose={() => undefined}
      onOpened={() => {
        setOpenings((count) => count + 1);
        setRolling(false);
        setLit(false);
        setEnding(false);
      }}
      label="Revealing your pull"
      variant="video"
      dismissible={false}
    >
      <video
        ref={videoRef}
        className={cn(
          "size-full object-contain transition-opacity ease-out-quint",
          lit ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${CURTAIN_MS}ms` }}
        src={source}
        preload="auto"
        playsInline
        onPlaying={() => setRolling(true)}
        onEnded={cutToBlack}
        onError={cutToBlack}
      />

      <button
        type="button"
        onClick={() => setSoundOn(!soundOn)}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute reveal sound" : "Unmute reveal sound"}
        className={cn(
          "absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-md bg-black/50 text-white backdrop-blur-sm transition-[background-color,opacity] duration-300 hover:bg-black/65",
          lit ? "opacity-100" : "opacity-0",
        )}
      >
        {soundOn ? <Volume2 className="size-4.5" /> : <VolumeX className="size-4.5" />}
      </button>
    </Dialog>
  );
}
