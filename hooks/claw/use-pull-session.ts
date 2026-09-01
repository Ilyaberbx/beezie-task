"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
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
  | "swapped";

export const MAX_QUANTITY = 8;

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
    onSuccess: (result, request) => {
      const swapped = request.pulls.map((pull) => pull.id);
      setSwappedPullIds((current) => [...current, ...swapped]);
      setSelectedPullIds((current) => current.filter((id) => !swapped.includes(id)));
      setSwapResult(result);
      setStage("swapped");
      refreshFunds();
    },
    onError: () => setStage("revealed"),
  });

  const pulls = useMemo(() => order?.pulls ?? [], [order]);

  /** Which pulls the assay animation should play over right now. */
  const swappingPulls = stage === "swapping" ? (swap.variables?.pulls ?? []) : [];

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
    isSwapping: stage === "swapping",
    swappingPullIds: swappingPulls.map((pull) => pull.id),
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
