"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clawQueries, purchasePulls, swapPulls } from "@/lib/claw/queries";
import { InsufficientBalanceError, shortfallFor } from "@/lib/claw/wallet-service";
import type { PaymentMethodId, Pull, PurchaseResult, SwapResult } from "@/lib/claw/types";

export type SessionStage =
  | "browsing"
  | "reviewing"
  | "pending"
  | "revealing"
  | "revealed"
  | "swapping"
  | "settling"
  | "swapped";

export const MAX_QUANTITY = 8;

/** How long the assay's last beat runs once settlement lands. Mirrors the
    --animate-assay-finale keyframes; the wait before it is unbounded. */
const ASSAY_FINALE_MS = 900;

export function usePullSession(slug: string) {
  const { data: machine } = useSuspenseQuery(clawQueries.machine(slug));
  const { data: paymentMethods } = useSuspenseQuery(clawQueries.paymentMethods());

  const [quantity, setQuantity] = useState(1);
  const [stage, setStage] = useState<SessionStage>("browsing");
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>("beezie-wallet");
  const [order, setOrder] = useState<PurchaseResult | null>(null);
  const [selectedPullIds, setSelectedPullIds] = useState<string[]>([]);
  const [swappedPullIds, setSwappedPullIds] = useState<string[]>([]);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [balanceError, setBalanceError] = useState<InsufficientBalanceError | null>(null);

  const queryClient = useQueryClient();

  const refreshFunds = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: clawQueries.wallet().queryKey });
    void queryClient.invalidateQueries({
      queryKey: clawQueries.paymentMethods().queryKey,
    });
  }, [queryClient]);

  const purchase = useMutation({
    mutationFn: purchasePulls,
    onMutate: () => {
      setBalanceError(null);
      setOrder(null);
      setSelectedPullIds([]);
      setSwappedPullIds([]);
      setSwapResult(null);
      setStage("pending");
    },
    onSuccess: (result) => {
      setOrder(result);
      setStage("revealing");
      refreshFunds();
    },
    onError: (error) => {
      if (error instanceof InsufficientBalanceError) {
        setBalanceError(error);
        setStage("reviewing");
        refreshFunds();
        return;
      }
      setStage("browsing");
    },
  });

  const swap = useMutation({
    mutationFn: swapPulls,
    onMutate: () => setStage("swapping"),
    onSuccess: (result) => {
      setSwapResult(result);
      setStage("settling");
    },
    onError: () => setStage("revealed"),
  });

  const pulls = useMemo(() => order?.pulls ?? [], [order]);

  // Settlement landing is the cue for the assay's last beat, not for the result
  // sheet. The pulls leave the grid with that beat rather than under it.
  const swapVariables = swap.variables;
  useEffect(() => {
    if (stage !== "settling") return;
    const timer = window.setTimeout(() => {
      const swapped = swapVariables?.pulls.map((pull) => pull.id) ?? [];
      setSwappedPullIds((current) => [...current, ...swapped]);
      setSelectedPullIds((current) => current.filter((id) => !swapped.includes(id)));
      setStage("swapped");
      // The wallet ticks over when the value has finished leaving the card, not
      // while it is still on screen.
      refreshFunds();
    }, ASSAY_FINALE_MS);
    return () => window.clearTimeout(timer);
  }, [stage, swapVariables, refreshFunds]);

  /** Which pulls the assay is playing over — through the finale, not just the wait. */
  const assaying = stage === "swapping" || stage === "settling";
  const assayingPulls = assaying ? (swap.variables?.pulls ?? []) : [];

  const remainingPulls = useMemo(
    () => pulls.filter((pull) => !swappedPullIds.includes(pull.id)),
    [pulls, swappedPullIds],
  );

  const selectedPulls = useMemo(
    () => remainingPulls.filter((pull) => selectedPullIds.includes(pull.id)),
    [remainingPulls, selectedPullIds],
  );

  const selectedValue = useMemo(
    () => selectedPulls.reduce((total, pull) => total + pull.collectible.swapValue, 0),
    [selectedPulls],
  );

  const reset = useCallback(() => {
    setStage("browsing");
    setBalanceError(null);
    swap.reset();
    purchase.reset();
  }, [purchase, swap]);

  const dismissSwap = useCallback(() => {
    if (remainingPulls.length === 0) {
      reset();
      return;
    }
    setStage("revealed");
  }, [remainingPulls.length, reset]);

  const total = machine.price * quantity;
  const selectedMethod = paymentMethods.find(
    (method) => method.id === paymentMethodId,
  );
  const methodBalance = selectedMethod?.balance;
  const shortfall = shortfallFor(methodBalance, total);
  const affordableQuantity =
    methodBalance === undefined
      ? MAX_QUANTITY
      : Math.floor(methodBalance / machine.price);

  const affordability = {
    total,
    shortfall: balanceError?.shortfall ?? shortfall,
    canAfford: shortfall === 0 && balanceError === null,
    affordableQuantity: Math.min(MAX_QUANTITY, affordableQuantity),
    methodLabel: selectedMethod?.label ?? "this method",
  };

  const finishReveal = useCallback(() => setStage("revealed"), []);

  const togglePull = useCallback((pullId: string) => {
    setSelectedPullIds((current) =>
      current.includes(pullId)
        ? current.filter((id) => id !== pullId)
        : [...current, pullId],
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedPullIds((current) =>
      current.length === remainingPulls.length ? [] : remainingPulls.map((pull) => pull.id),
    );
  }, [remainingPulls]);

  return {
    machine,
    paymentMethods,
    quantity,
    adjustQuantity: (delta: number) => {
      setBalanceError(null);
      setQuantity((current) => Math.min(MAX_QUANTITY, Math.max(1, current + delta)));
    },
    setQuantityTo: (next: number) => {
      setBalanceError(null);
      setQuantity(Math.min(MAX_QUANTITY, Math.max(1, next)));
    },
    maxQuantity: MAX_QUANTITY,
    stage,
    paymentMethodId,
    setPaymentMethodId: (id: PaymentMethodId) => {
      setBalanceError(null);
      setPaymentMethodId(id);
    },
    affordability,
    order,
    pulls,
    remainingPulls,
    selectedPullIds,
    selectedPulls,
    selectedValue,
    swapResult,
    isSwapping: assaying,
    isSettling: stage === "settling",
    swappingPullIds: assayingPulls.map((pull) => pull.id),
    startReview: () => setStage("reviewing"),
    cancelReview: () => setStage("browsing"),
    confirmPurchase: () =>
      purchase.mutate({ slug, quantity, paymentMethodId }),
    finishReveal,
    togglePull,
    toggleAll,
    swapPulls: (chosen: Pull[]) => {
      if (!order) return;
      swap.mutate({ pulls: chosen, expiresAt: order.expiresAt });
    },
    dismissSwap,
    reset,
  };
}
