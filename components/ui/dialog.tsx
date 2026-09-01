"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

type Morph = { animation: Animation; overflow: string; pinned: HTMLElement[] };
type MorphRef = { current: Morph | null };

/** Put the panel back on its own feet: no animated box, no pinned content. */
function stopMorph(el: HTMLElement, run: MorphRef) {
  const active = run.current;
  if (!active) return;
  run.current = null;
  active.animation.cancel();
  el.style.overflow = active.overflow;
  el.style.width = "";
  el.style.maxWidth = "";
  el.style.height = "";
  for (const child of active.pinned) child.style.width = "";
}

/** Grow or shrink the panel between two boxes, clipping its content meanwhile. */
function morphBox(el: HTMLElement, run: MorphRef, from: Box, to: Box) {
  // One morph at a time — a second one layered on top would snapshot the first
  // one's clipped overflow as the panel's own and never give the scroll back.
  stopMorph(el, run);
  const overflow = el.style.overflow;
  el.style.overflow = "hidden";

  // A travelling width re-wraps every line of content on every frame, which is
  // the stutter. Hold the content at the width it ends on and slide the box
  // over it instead; the panel is cross-fading its contents anyway.
  const pinned: HTMLElement[] = [];
  if (Math.abs(to.w - from.w) > 1) {
    const inner = el.clientWidth;
    for (const child of Array.from(el.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (getComputedStyle(child).position === "absolute") continue;
      child.style.width = `${inner}px`;
      pinned.push(child);
    }
  }

  // max-width is what actually sizes these panels, so it has to travel too —
  // animating width alone just gets clamped back to the incoming panel's cap.
  const animation = el.animate(
    [
      { width: `${from.w}px`, maxWidth: `${from.w}px`, height: `${from.h}px` },
      { width: `${to.w}px`, maxWidth: `${to.w}px`, height: `${to.h}px` },
    ],
    { duration: MORPH_MS, easing: MORPH_EASE },
  );
  run.current = { animation, overflow, pinned };
  const restore = () => {
    if (run.current?.animation === animation) stopMorph(el, run);
  };
  animation.finished.then(restore, restore);
  return animation;
}

const measure = (el: HTMLElement): Box => ({ w: el.offsetWidth, h: el.offsetHeight });

/** When the viewport last moved. A panel sized off the viewport has to follow it
    instantly — animating that just makes the panel lag the window. */
let viewportAt = 0;
if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    () => {
      viewportAt = performance.now();
    },
    { passive: true },
  );
}

/* Showing the panel and starting its morph has to happen in the same frame the
   panel appears in. A passive effect is free to land after that frame is
   painted, which is a flash of the panel at its own size before the morph
   yanks it back — and only sometimes, whenever the commit slips a frame. */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

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

/** Is any dialog on screen? Lets the page quiet down behind the scrim. */
export function useAnyDialogOpen() {
  return useSyncExternalStore(subscribe, getAnyOpen, serverClosed);
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

/* Content-sized panels must scroll themselves: a short screen (a phone in
   landscape, or any phone once the shortfall alert appears) pushes the primary
   action past max-height, and an unscrollable panel simply hides it.

   svh, never dvh: dvh tracks Safari's retracting search bar, so an open panel
   grows the moment the user scrolls — and the ResizeObserver below animates it
   there, which turns a chrome change into a modal that visibly inflates. svh
   pins every panel to the smallest viewport, so the box never moves. */
const PANELS = {
  center:
    "max-h-[calc(100svh-32px)] overflow-y-auto overscroll-contain m-auto w-[calc(100vw-32px)] max-w-[608px] rounded-[12px] border border-border-strong bg-card not-data-[closing]:open:animate-dialog-in data-[closing]:animate-dialog-out",
  sheet:
    "max-h-[100svh] overflow-y-auto overscroll-contain mt-auto mb-0 w-full max-w-none rounded-t-2xl border-t border-border-strong bg-card not-data-[closing]:open:animate-sheet-in data-[closing]:animate-sheet-out sm:m-auto sm:max-h-[calc(100svh-32px)] sm:w-[calc(100vw-32px)] sm:rounded-[12px] sm:border sm:not-data-[closing]:open:animate-dialog-in sm:data-[closing]:animate-dialog-out",
  fullscreen:
    "overflow-visible m-auto h-[calc(100svh-24px)] w-[calc(100vw-24px)] max-w-none rounded-2xl border border-border bg-background not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out",
  video:
    "overflow-visible m-0 h-svh max-h-none w-screen max-w-none rounded-none border-0 bg-black not-data-[closing]:open:animate-fade-in data-[closing]:animate-fade-out",
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
  const morph = useRef<Morph | null>(null);

  useSyncExternalStore(subscribe, getVersion, serverVersion);
  const queued = useSyncExternalStore(subscribe, getWaiting, serverVersion);
  const hasOther = hasOtherDialog(id);
  const morphable = MORPHABLE.has(variant) && !reduceMotion;

  useEffect(() => {
    onCloseRef.current = onClose;
    onOpenedRef.current = onOpened;
  });

  useBeforePaint(() => {
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
        const settle = () => {
          box.current = measure(dialog);
        };
        morphBox(dialog, morph, from, to).finished.then(settle, settle);
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
        if (dialog && morphable) {
          // Always leave the box behind, not only when something has already
          // announced itself: a dialog still loading its chunk announces late
          // and would otherwise get a plain entrance where a warm one morphs.
          // Stop any morph first, or the box handed on is a half-animated one.
          stopMorph(dialog, morph);
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
      if (morph.current) return;
      const from = box.current;
      const to = measure(dialog);
      box.current = to;
      if (!from || (Math.abs(to.w - from.w) < 2 && Math.abs(to.h - from.h) < 2)) return;
      if (performance.now() - viewportAt < 300) return;
      const settle = () => {
        box.current = measure(dialog);
      };
      morphBox(dialog, morph, from, to).finished.then(settle, settle);
    });
    observer.observe(dialog);
    return () => {
      observer.disconnect();
      stopMorph(dialog, morph);
    };
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
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-md text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4.5" strokeWidth={2} />
        </button>
      )}
      {children}
    </dialog>
  );
}
