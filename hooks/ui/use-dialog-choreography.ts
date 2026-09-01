"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
  MORPH_EPSILON_PX,
  boxesDiffer,
  measureBox,
  type Box,
} from "@/lib/ui/box";
import {
  EXIT_MS,
  MORPH_EASE,
  morphBox,
  stopMorph,
  viewportIsStillSettling,
  type Morph,
} from "@/lib/ui/dialog-morph";
import {
  dialogVersion,
  hasLiveDialog,
  leaveHandoffBox,
  publish,
  takeFreshHandoffBox,
  type Handoff,
} from "@/lib/ui/dialog-registry";

/**
 * A handoff between two dialogs is worth animating at a pixel; a sheet resizing
 * under its own content is not. Below this the panel just adopts the new box.
 */
const RESIZE_EPSILON_PX = 12;

const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

function cancelEntranceKeyframes(el: HTMLElement) {
  for (const animation of el.getAnimations()) animation.cancel();
}

function crossFadeChildren(el: HTMLElement) {
  for (const child of Array.from(el.children)) {
    child.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 220,
      delay: 90,
      easing: MORPH_EASE,
      fill: "backwards",
    });
  }
}

type Choreography = {
  ref: RefObject<HTMLDialogElement | null>;
  open: boolean;
  morphable: boolean;
  reduceMotion: boolean;
  onOpened?: () => void;
};

export function useDialogChoreography({
  ref,
  open,
  morphable,
  reduceMotion,
  onOpened,
}: Choreography) {
  const [id] = useState(() => Symbol("dialog"));
  const [closing, setClosing] = useState(false);
  const onOpenedRef = useRef(onOpened);
  const box = useRef<Box | null>(null);
  const morph = useRef<Morph | null>(null);
  const handedOver = useRef<Handoff | null>(null);

  useSyncExternalStore(dialogVersion.subscribe, dialogVersion.get, dialogVersion.getServer);
  const blocked = hasLiveDialog(id);

  useEffect(() => {
    onOpenedRef.current = onOpened;
  });

  useBeforePaint(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open && !blocked) {
      handedOver.current = null;
      dialog.showModal();
      dialog.focus();
      onOpenedRef.current?.();

      const from = takeFreshHandoffBox();
      const to = measureBox(dialog);
      box.current = to;

      if (morphable && from && boxesDiffer(to, from, MORPH_EPSILON_PX)) {
        from.taken = true;
        cancelEntranceKeyframes(dialog);
        const settle = () => {
          box.current = measureBox(dialog);
        };
        morphBox(dialog, morph, from, to).finished.then(settle, settle);
        crossFadeChildren(dialog);
      }
    }
    if (open && dialog.open && !closing) publish(id, "open");
    if (!open && dialog.open && !closing) {
      if (morphable) {
        stopMorph(dialog, morph);
        handedOver.current = leaveHandoffBox(measureBox(dialog));
      }
      publish(id, "closing");
      setClosing(true);
    }
  }, [ref, open, blocked, closing, id, morphable]);

  useEffect(() => {
    if (!closing) return;
    const succeeded = handedOver.current?.taken ?? false;
    const timer = window.setTimeout(
      () => {
        ref.current?.close();
        publish(id, null);
        setClosing(false);
      },
      reduceMotion || succeeded ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [ref, closing, reduceMotion, id]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open || closing || !morphable) return;

    const observer = new ResizeObserver(() => {
      if (morph.current) return;
      const from = box.current;
      const to = measureBox(dialog);
      box.current = to;
      if (!from || !boxesDiffer(to, from, RESIZE_EPSILON_PX)) return;
      if (viewportIsStillSettling()) return;
      const settle = () => {
        box.current = measureBox(dialog);
      };
      morphBox(dialog, morph, from, to).finished.then(settle, settle);
    });
    observer.observe(dialog);
    return () => {
      observer.disconnect();
      stopMorph(dialog, morph);
    };
  }, [ref, open, closing, morphable]);

  useEffect(() => () => publish(id, null), [id]);

  return closing;
}
