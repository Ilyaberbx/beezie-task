"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/cn";

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

const EXIT_MS = 180;
const MORPH_MS = 320;
/** How long a closing panel's box stays available to the next one to grow from. */
const HANDOFF_MS = 500;
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Only content-sized panels morph; fullscreen and video are viewport-fixed. */
const MORPHABLE = new Set(["center", "sheet"]);

type Box = { w: number; h: number };

type DialogPhase = "open" | "closing";

const registry = new Map<symbol, DialogPhase>();
const listeners = new Set<() => void>();

let version = 0;
let anyOpen = false;
let waiting = 0;
let handoff: (Box & { at: number }) | null = null;

function setWaiting(delta: number) {
  waiting += delta;
  version += 1;
  for (const listener of listeners) listener();
}

/** Grow or shrink the panel between two boxes, clipping its content meanwhile. */
function morphBox(el: HTMLElement, from: Box, to: Box) {
  const previousOverflow = el.style.overflow;
  el.style.overflow = "hidden";
  // max-width is what actually sizes these panels, so it has to travel too —
  // animating width alone just gets clamped back to the incoming panel's cap.
  const animation = el.animate(
    [
      { width: `${from.w}px`, maxWidth: `${from.w}px`, height: `${from.h}px` },
      { width: `${to.w}px`, maxWidth: `${to.w}px`, height: `${to.h}px` },
    ],
    { duration: MORPH_MS, easing: MORPH_EASE },
  );
  const restore = () => {
    el.style.overflow = previousOverflow;
  };
  animation.finished.then(restore, restore);
  return animation;
}

const measure = (el: HTMLElement): Box => ({ w: el.offsetWidth, h: el.offsetHeight });

function publish(id: symbol, phase: DialogPhase | null) {
  if (phase === null) {
    if (!registry.delete(id)) return;
  } else {
    if (registry.get(id) === phase) return;
    registry.set(id, phase);
  }
  version += 1;
  anyOpen = registry.size > 0;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function hasOtherDialog(id: symbol) {
  for (const key of registry.keys()) if (key !== id) return true;
  return false;
}

const getVersion = () => version;
const getAnyOpen = () => anyOpen;
const getWaiting = () => waiting;
const serverVersion = () => 0;
const serverClosed = () => false;

export function DialogScrim() {
  const open = useSyncExternalStore(subscribe, getAnyOpen, serverClosed);

  return (
    <div
      aria-hidden
      data-open={open || undefined}
      className="pointer-events-none fixed inset-0 z-50 bg-black/72 opacity-0 transition-opacity duration-200 data-[open]:opacity-100"
    />
  );
}

const PANELS = {
  center:
    "max-h-[100dvh] m-auto w-[calc(100vw-32px)] max-w-[608px] rounded-xl border border-border bg-card not-data-[closing]:open:animate-dialog-in data-[closing]:animate-dialog-out",
  sheet:
    "max-h-[100dvh] mt-auto mb-0 w-full max-w-none rounded-t-2xl border-t border-border bg-card not-data-[closing]:open:animate-sheet-in data-[closing]:animate-sheet-out sm:m-auto sm:w-[calc(100vw-32px)] sm:rounded-2xl sm:border sm:not-data-[closing]:open:animate-dialog-in sm:data-[closing]:animate-dialog-out",
  fullscreen:
    "m-auto h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-none rounded-2xl border border-border bg-background not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out",
  video:
    "m-0 h-dvh max-h-none w-screen max-w-none rounded-none border-0 bg-black not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out",
};

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
  const onOpenedRef = useRef(onOpened);
  const [id] = useState(() => Symbol("dialog"));
  const [closing, setClosing] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const box = useRef<Box | null>(null);
  const morphing = useRef(false);

  useSyncExternalStore(subscribe, getVersion, serverVersion);
  const queued = useSyncExternalStore(subscribe, getWaiting, serverVersion);
  const hasOther = hasOtherDialog(id);
  const morphable = MORPHABLE.has(variant) && !reduceMotion;

  useEffect(() => {
    onCloseRef.current = onClose;
    onOpenedRef.current = onOpened;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open && !hasOther) {
      dialog.showModal();
      dialog.focus();
      onOpenedRef.current?.();

      const from = handoff;
      handoff = null;
      const to = measure(dialog);
      box.current = to;

      const continues =
        morphable &&
        from !== null &&
        performance.now() - from.at < HANDOFF_MS &&
        (Math.abs(to.w - from.w) > 1 || Math.abs(to.h - from.h) > 1);

      if (continues && from) {
        // The entrance keyframes would fight the morph over the same box.
        for (const animation of dialog.getAnimations()) animation.cancel();
        morphing.current = true;
        const settle = () => {
          morphing.current = false;
          box.current = measure(dialog);
        };
        morphBox(dialog, from, to).finished.then(settle, settle);
        // The shell carries over; its contents are what actually changed.
        for (const child of Array.from(dialog.children)) {
          child.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 220,
            delay: 90,
            easing: MORPH_EASE,
            fill: "backwards",
          });
        }
      }
    }
    if (open && dialog.open && !closing) publish(id, "open");
    if (!open && dialog.open && !closing) setClosing(true);
  }, [open, hasOther, closing, id, morphable]);

  // Announce that this dialog is blocked, so whatever holds the slot can hand it over.
  useEffect(() => {
    if (!open || !hasOther) return;
    setWaiting(1);
    return () => setWaiting(-1);
  }, [open, hasOther]);

  useEffect(() => {
    if (!closing) return;
    publish(id, "closing");
    // Something is waiting: hand the slot over now rather than playing an exit
    // it would only sit through.
    const handover = queued > 0 && morphable;
    const timer = window.setTimeout(
      () => {
        const dialog = ref.current;
        if (dialog && handover) {
          handoff = { ...measure(dialog), at: performance.now() };
        }
        dialog?.close();
        publish(id, null);
        setClosing(false);
      },
      reduceMotion || handover ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [closing, reduceMotion, id, queued, morphable]);

  // A panel whose own content changes size resizes to match instead of snapping.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open || closing || !morphable) return;

    const observer = new ResizeObserver(() => {
      if (morphing.current) return;
      const from = box.current;
      const to = measure(dialog);
      box.current = to;
      if (!from || (Math.abs(to.w - from.w) < 2 && Math.abs(to.h - from.h) < 2)) return;
      morphing.current = true;
      const settle = () => {
        morphing.current = false;
        box.current = measure(dialog);
      };
      morphBox(dialog, from, to).finished.then(settle, settle);
    });
    observer.observe(dialog);
    return () => observer.disconnect();
  }, [open, closing, morphable]);

  useEffect(() => () => publish(id, null), [id]);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

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
        "overflow-visible p-0 text-foreground",
        PANELS[variant],
        panelClassName,
      )}
    >
      {dismissible && (
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-md text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4.5" strokeWidth={2} />
        </button>
      )}
      {children}
    </dialog>
  );
}
