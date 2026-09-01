"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clawQueries, purchasePulls, swapPulls } from "@/lib/claw/queries";
import {
  MAX_QUANTITY,
  clampQuantity,
  computeAffordability,
  isAssayingStage,
  type SessionStage,
} from "@/lib/claw/session";
import { InsufficientBalanceError } from "@/lib/claw/wallet-service";
import type { PaymentMethodId, Pull, PurchaseResult, SwapResult } from "@/lib/claw/types";

export { MAX_QUANTITY };
export type { SessionStage };

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

  const { mutate: runPurchase } = purchase;
  const { mutate: runSwap } = swap;

  const pulls = useMemo(() => order?.pulls ?? [], [order]);

  const swapVariables = swap.variables;
  useEffect(() => {
    if (stage !== "settling") return;
    const assayFinale = window.setTimeout(() => {
      setStage("swapped");
      refreshFunds();
    }, ASSAY_FINALE_MS);
    return () => window.clearTimeout(assayFinale);
  }, [stage, refreshFunds]);

  const assaying = isAssayingStage(stage);

  const swappingPullIds = useMemo(
    () => (assaying ? (swapVariables?.pulls ?? []) : []).map((pull) => pull.id),
    [assaying, swapVariables],
  );

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

  // The grid only loses the swapped cards on the way back in. Retiring them at the
  // finale reflows the list under a dialog that is still fading out.
  const dismissSwap = useCallback(() => {
    const swapped = swapVariables?.pulls.map((pull) => pull.id) ?? [];
    const survivors = remainingPulls.filter((pull) => !swapped.includes(pull.id));
    setSwappedPullIds((current) => [...current, ...swapped]);
    setSelectedPullIds((current) => current.filter((id) => !swapped.includes(id)));
    if (survivors.length === 0) {
      reset();
      return;
    }
    setStage("revealed");
  }, [remainingPulls, swapVariables, reset]);

  const affordability = useMemo(
    () =>
      computeAffordability({
        price: machine.price,
        quantity,
        method: paymentMethods.find((method) => method.id === paymentMethodId),
        balanceError,
        maxQuantity: MAX_QUANTITY,
      }),
    [machine.price, quantity, paymentMethods, paymentMethodId, balanceError],
  );

  const finishReveal = useCallback(() => setStage("revealed"), []);

  const adjustQuantity = useCallback((delta: number) => {
    setBalanceError(null);
    setQuantity((current) => clampQuantity(current + delta, MAX_QUANTITY));
  }, []);

  const setQuantityTo = useCallback((next: number) => {
    setBalanceError(null);
    setQuantity(clampQuantity(next, MAX_QUANTITY));
  }, []);

  const selectPaymentMethod = useCallback((id: PaymentMethodId) => {
    setBalanceError(null);
    setPaymentMethodId(id);
  }, []);

  const startReview = useCallback(() => setStage("reviewing"), []);
  const cancelReview = useCallback(() => setStage("browsing"), []);

  const confirmPurchase = useCallback(
    () => runPurchase({ slug, quantity, paymentMethodId }),
    [runPurchase, slug, quantity, paymentMethodId],
  );

  const swapChosenPulls = useCallback(
    (chosen: Pull[]) => {
      if (!order) return;
      runSwap({ pulls: chosen, expiresAt: order.expiresAt });
    },
    [order, runSwap],
  );

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
    adjustQuantity,
    setQuantityTo,
    maxQuantity: MAX_QUANTITY,
    stage,
    paymentMethodId,
    setPaymentMethodId: selectPaymentMethod,
    affordability,
    order,
    pulls,
    remainingPulls,
    selectedPullIds,
    selectedPulls,
    selectedValue,
    swapResult,
    isSwapping: assaying,
    isSettling: stage === "settling" || stage === "swapped",
    swappingPullIds,
    startReview,
    cancelReview,
    confirmPurchase,
    finishReveal,
    togglePull,
    toggleAll,
    swapPulls: swapChosenPulls,
    dismissSwap,
    reset,
  };
}
