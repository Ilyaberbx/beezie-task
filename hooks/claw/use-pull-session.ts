"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { clawQueries, purchasePulls, swapPulls } from "@/lib/claw/queries";
import { InsufficientBalanceError } from "@/lib/claw/wallet-service";
import type { PaymentMethodId, Pull, PurchaseResult, SwapResult } from "@/lib/claw/types";

export type SessionStage =
  | "browsing"
  | "reviewing"
  | "pending"
  | "revealing"
  | "revealed"
  | "swapping"
  | "swapped";

const MAX_QUANTITY = 8;

export function usePullSession(slug: string) {
  const { data: machine } = useSuspenseQuery(clawQueries.machine(slug));
  const { data: paymentMethods } = useSuspenseQuery(clawQueries.paymentMethods());

  const [quantity, setQuantity] = useState(1);
  const [stage, setStage] = useState<SessionStage>("browsing");
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>("beezie-wallet");
  const [order, setOrder] = useState<PurchaseResult | null>(null);
  const [selectedPullIds, setSelectedPullIds] = useState<string[]>([]);
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
      // Cleared here rather than in reset() so the result dialogs stay mounted
      // long enough to play their exit animation.
      setOrder(null);
      setSelectedPullIds([]);
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
      setStage("swapped");
      refreshFunds();
    },
    onError: () => setStage("revealed"),
  });

  const pulls = useMemo(() => order?.pulls ?? [], [order]);

  const selectedPulls = useMemo(
    () => pulls.filter((pull) => selectedPullIds.includes(pull.id)),
    [pulls, selectedPullIds],
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

  const total = machine.price * quantity;
  const selectedMethod = paymentMethods.find(
    (method) => method.id === paymentMethodId,
  );
  const methodBalance = selectedMethod?.balance;
  const shortfall =
    methodBalance === undefined ? 0 : Math.max(0, total - methodBalance);
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
      current.length === pulls.length ? [] : pulls.map((pull) => pull.id),
    );
  }, [pulls]);

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
    selectedPullIds,
    selectedPulls,
    selectedValue,
    swapResult,
    isSwapping: stage === "swapping",
    startReview: () => setStage("reviewing"),
    cancelReview: () => setStage("browsing"),
    confirmPurchase: () =>
      purchase.mutate({ slug, quantity, paymentMethodId }),
    finishReveal,
    togglePull,
    toggleAll,
    swapPulls: (chosen: Pull[]) => swap.mutate(chosen),
    reset,
  };
}
