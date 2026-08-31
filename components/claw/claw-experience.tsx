"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { usePullSession } from "@/hooks/claw/use-pull-session";
import { useRevealPreload } from "@/hooks/claw/use-reveal-preload";
import { clawQueries } from "@/lib/claw/queries";
import { PendingDialog } from "./pending-dialog";
import { PromoField } from "./promo-field";
import { PurchaseBar } from "./purchase-bar";
import { ReviewAndPayDialog } from "./review-and-pay-dialog";
import { RevealMulti } from "./reveal-multi";
import { RevealOverlay } from "./reveal-overlay";
import { RevealSingle } from "./reveal-single";
import { SwapSuccessDialog } from "./swap-success-dialog";

export function ClawExperience({ slug }: { slug: string }) {
  const session = usePullSession(slug);
  const { data: prizeHighlights } = useSuspenseQuery(clawQueries.prizeHighlights());
  const { source, isBuffered, prefersReducedMotion } = useRevealPreload();

  const revealReady = isBuffered || prefersReducedMotion;
  const isPending =
    session.stage === "pending" || (session.stage === "revealing" && !revealReady);
  const isResultOpen = session.stage === "revealed" || session.stage === "swapping";
  const [firstPull] = session.pulls;

  const purchaseControls = (
    <PurchaseBar
      quantity={session.quantity}
      maxQuantity={session.maxQuantity}
      onAdjustQuantity={session.adjustQuantity}
      onStart={session.startReview}
      disabled={session.stage !== "browsing"}
    />
  );

  return (
    <>
      {/* Direct children of the card's stack so they inherit its Figma gap. */}
      <div className="hidden md:block">{purchaseControls}</div>
      {/* Figma's mobile price-to-promo gap is 20px against the stack's 16px. */}
      <PromoField className="max-md:mt-1" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-[6px] md:hidden">
        {purchaseControls}
      </div>

      <ReviewAndPayDialog
        open={session.stage === "reviewing"}
        machine={session.machine}
        quantity={session.quantity}
        methods={session.paymentMethods}
        selectedMethodId={session.paymentMethodId}
        onSelectMethod={session.setPaymentMethodId}
        affordability={session.affordability}
        onReduceQuantity={session.setQuantityTo}
        onConfirm={session.confirmPurchase}
        onClose={session.cancelReview}
      />

      <PendingDialog open={isPending} previews={prizeHighlights} />

      <RevealOverlay
        open={session.stage === "revealing" && revealReady}
        source={source}
        skipAnimation={prefersReducedMotion}
        onFinish={session.finishReveal}
      />

      {firstPull && session.pulls.length === 1 && (
        <RevealSingle
          open={isResultOpen}
          pull={firstPull}
          isSwapping={session.isSwapping}
          onSwap={() => session.swapPulls([firstPull])}
          onKeep={session.reset}
        />
      )}

      {session.order && session.pulls.length > 1 && (
        <RevealMulti
          open={isResultOpen}
          pulls={session.pulls}
          selectedIds={session.selectedPullIds}
          selectedValue={session.selectedValue}
          expiresAt={session.order.expiresAt}
          isSwapping={session.isSwapping}
          onToggle={session.togglePull}
          onToggleAll={session.toggleAll}
          onSwapSelected={() => session.swapPulls(session.selectedPulls)}
          onSwapOne={(pull) => session.swapPulls([pull])}
          onClose={session.reset}
        />
      )}

      {session.swapResult && (
        <SwapSuccessDialog
          open={session.stage === "swapped"}
          result={session.swapResult}
          onClose={session.reset}
        />
      )}
    </>
  );
}
