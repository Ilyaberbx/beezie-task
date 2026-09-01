"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useDialogChoreography } from "@/hooks/ui/use-dialog-choreography";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/cn";
import { anyDialogOpen } from "@/lib/ui/dialog-registry";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: "center" | "sheet" | "fullscreen" | "video";
  dismissible?: boolean;
  onOpened?: () => void;
  panelClassName?: string;
  children: ReactNode;
};

const CONTENT_SIZED = new Set(["center", "sheet"]);
const FULL_BLEED = new Set(["fullscreen", "video"]);
const PANELS = {
  center: `max-h-[calc(100svh-32px)] overflow-hidden m-auto w-[calc(100vw-32px)] max-w-[608px] rounded-[12px] border border-border-strong bg-card not-data-[closing]:open:animate-dialog-in data-[closing]:animate-dialog-out`,
  sheet: `max-h-[100svh] overflow-hidden mt-auto mb-0 w-full max-w-none rounded-t-2xl border-t border-border-strong bg-card not-data-[closing]:open:animate-sheet-in data-[closing]:animate-sheet-out sm:m-auto sm:max-h-[calc(100svh-32px)] sm:w-[calc(100vw-32px)] sm:rounded-[12px] sm:border sm:not-data-[closing]:open:animate-dialog-in sm:data-[closing]:animate-dialog-out`,
  fullscreen:
    "overflow-hidden m-0 inset-0 h-auto max-h-none w-auto max-w-none rounded-none border-0 bg-background not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out md:m-auto md:h-[calc(100svh-32px)] md:w-[calc(100vw-32px)] md:rounded-2xl md:border md:border-border",
  video:
    "overflow-visible m-0 inset-0 h-auto max-h-none w-auto max-w-none rounded-none border-0 bg-black not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out",
};

export function useAnyDialogOpen() {
  return useSyncExternalStore(
    anyDialogOpen.subscribe,
    anyDialogOpen.get,
    anyDialogOpen.getServer,
  );
}

export function DialogScrim() {
  const open = useAnyDialogOpen();

  return (
    <div
      aria-hidden
      data-open={open || undefined}
      className="pointer-events-none fixed inset-0 z-50 bg-black/72 opacity-0 transition-opacity duration-200 data-[open]:opacity-100"
    />
  );
}

export function Dialog({
  open,
  onClose,
  label,
  variant = "center",
  dismissible = true,
  onOpened,
  panelClassName,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const reduceMotion = usePrefersReducedMotion();
  const morphable = CONTENT_SIZED.has(variant) && !reduceMotion;

  const closing = useDialogChoreography({ ref, open, morphable, reduceMotion, onOpened });
  useScrollLock(open);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const requestClose = useCallback(() => {
    if (!dismissible) return;
    onCloseRef.current();
  }, [dismissible]);

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) requestClose();
  };

  return (
    <dialog
      ref={ref}
      aria-label={label}
      tabIndex={-1}
      data-closing={closing || undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={handleClick}
      className={cn(
        "p-0 text-foreground",
        PANELS[variant],
        panelClassName,
      )}
    >
      {dismissible && (
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className={cn(
            "absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-md text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground",
            "before:absolute before:-inset-1.5 before:content-['']",
            FULL_BLEED.has(variant) && "top-safe-16",
          )}
        >
          <X className="size-4.5" strokeWidth={2} />
        </button>
      )}
      {children}
    </dialog>
  );
}
