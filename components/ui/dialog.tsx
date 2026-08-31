"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: "center" | "sheet" | "fullscreen" | "video";
  dismissible?: boolean;
  panelClassName?: string;
  children: ReactNode;
};

const EXIT_MS = 180;

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
  panelClassName,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setClosing(false);
      onCloseRef.current();
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const requestClose = useCallback(() => {
    if (!dismissible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCloseRef.current();
      return;
    }
    setClosing(true);
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
        "not-data-[closing]:backdrop:animate-fade-in data-[closing]:backdrop:animate-fade-out",
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
