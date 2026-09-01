"use client";

import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { markStageReady } from "@/hooks/claw/use-stage-ready";
import { useSoundPreference } from "@/hooks/claw/use-sound-preference";
import { cn } from "@/lib/cn";

type MachineStageProps = {
  name: string;
  video: string;
  poster: string;
};

export function MachineStage({ name, video, poster }: MachineStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useSoundPreference();
  const [animationOn, setAnimationOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = !soundOn;
    if (soundOn && element.paused && animationOn) void element.play().catch(() => undefined);
  }, [soundOn, animationOn]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (animationOn) {
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
  }, [animationOn]);

  // A cached video can already be playable before this component mounts.
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) handleReady();
  }, []);

  function handleReady() {
    setReady(true);
    markStageReady();
  }

  return (
    <div
      className="relative mx-auto aspect-square w-full max-h-[72svh] max-w-[72svh] overflow-hidden rounded-[15px] bg-card bg-cover bg-center shadow-panel md:rounded-panel"
      style={{ backgroundImage: `url(${poster})` }}
    >
      <video
        ref={videoRef}
        className={cn(
          "size-full object-cover transition-opacity duration-700 ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
        poster={poster}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={handleReady}
        aria-label={`${name} machine`}
      >
        <source src={video} type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/55 to-transparent p-3">
        <StageToggle
          active={soundOn}
          onClick={() => setSoundOn(!soundOn)}
          icon={soundOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          label={soundOn ? "Sound on" : "Sound off"}
        />
        <StageToggle
          active={animationOn}
          onClick={() => setAnimationOn((current) => !current)}
          icon={<Sparkles className="size-3.5" />}
          label={animationOn ? "Animation on" : "Animation off"}
        />
      </div>
    </div>
  );
}

function StageToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "pointer-events-auto flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium pointer-coarse:h-10",
        "bg-black/50 backdrop-blur-sm transition-colors",
        active ? "text-white hover:bg-black/65" : "text-secondary-foreground hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
