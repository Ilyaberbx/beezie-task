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

type DialogPhase = "open" | "closing";

const registry = new Map<symbol, DialogPhase>();
const listeners = new Set<() => void>();

let version = 0;
let anyOpen = false;

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

  useSyncExternalStore(subscribe, getVersion, serverVersion);
  const hasOther = hasOtherDialog(id);

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
    }
    if (open && dialog.open && !closing) publish(id, "open");
    if (!open && dialog.open && !closing) setClosing(true);
  }, [open, hasOther, closing, id]);

  useEffect(() => {
    if (!closing) return;
    publish(id, "closing");
    const timer = window.setTimeout(
      () => {
        ref.current?.close();
        publish(id, null);
        setClosing(false);
      },
      reduceMotion ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [closing, reduceMotion, id]);

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
