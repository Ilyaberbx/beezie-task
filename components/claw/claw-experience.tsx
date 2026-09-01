"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useImagePreload } from "@/hooks/claw/use-image-preload";
import { usePullSession } from "@/hooks/claw/use-pull-session";
import { useRevealPreload } from "@/hooks/claw/use-reveal-preload";
import { useMounted } from "@/hooks/use-mounted";
import { thumb } from "@/lib/asset";
import { COLLECTIBLES } from "@/lib/claw/mock";
import { clawQueries } from "@/lib/claw/queries";
import { isPendingStage, isResultStage } from "@/lib/claw/session";
import { PurchaseBar } from "./purchase-bar";

const CATALOGUE_THUMBS = COLLECTIBLES.map((collectible) => thumb(collectible.image));

const PendingDialog = dynamic(() => import("./pending-dialog").then((m) => m.PendingDialog));
const ReviewAndPayDialog = dynamic(() =>
  import("./review-and-pay-dialog").then((m) => m.ReviewAndPayDialog),
);
const RevealOverlay = dynamic(() => import("./reveal-overlay").then((m) => m.RevealOverlay));
const RevealSingle = dynamic(() => import("./reveal-single").then((m) => m.RevealSingle));
const RevealMulti = dynamic(() => import("./reveal-multi").then((m) => m.RevealMulti));
const SwapSuccessDialog = dynamic(() =>
  import("./swap-success-dialog").then((m) => m.SwapSuccessDialog),
);

export function ClawExperience({ slug }: { slug: string }) {
  const session = usePullSession(slug);
  const { data: prizeHighlights } = useSuspenseQuery(clawQueries.prizeHighlights());
  const [engaged, setEngaged] = useState(false);
  const { source, isBuffered, prefersReducedMotion } = useRevealPreload(engaged);
  const mounted = useMounted();

  useImagePreload(CATALOGUE_THUMBS);
  useImagePreload(session.pulls.map((pull) => pull.collectible.image));

  const revealReady = isBuffered || prefersReducedMotion;
  const isPending = isPendingStage(session.stage, revealReady);
  const isResultOpen = isResultStage(session.stage);
  const [firstPull] = session.pulls;

  const purchaseControls = (
    <PurchaseBar
      quantity={session.quantity}
      maxQuantity={session.maxQuantity}
      onAdjustQuantity={session.adjustQuantity}
      onStart={() => {
        setEngaged(true);
        session.startReview();
      }}
      disabled={session.stage !== "browsing"}
    />
  );

  const viewportPinnedPurchaseBar = (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 pb-safe-16 pl-safe-16 pr-safe-16 pt-4 backdrop-blur-md md:hidden">
      {purchaseControls}
    </div>
  );

  return (
    <>
      <div className="hidden md:block">{purchaseControls}</div>

      {mounted && createPortal(viewportPinnedPurchaseBar, document.body)}

      {engaged && (
        <>
          <ReviewAndPayDialog
            open={session.stage === "reviewing"}
            machine={session.machine}
            quantity={session.quantity}
            methods={session.paymentMethods}
            selectedMethodId={session.paymentMethodId}
            onSelectMethod={session.setPaymentMethodId}
            affordability={session.affordability}
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
              isSettling={session.isSettling}
              onSwap={() => session.swapPulls([firstPull])}
              onKeep={session.reset}
            />
          )}

          {session.order && session.pulls.length > 1 && (
            <RevealMulti
              open={isResultOpen}
              pulls={session.remainingPulls}
              selectedIds={session.selectedPullIds}
              selectedValue={session.selectedValue}
              expiresAt={session.order.expiresAt}
              isSwapping={session.isSwapping}
              swappingIds={session.swappingPullIds}
              isSettling={session.isSettling}
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
              onClose={session.dismissSwap}
            />
          )}
        </>
      )}
    </>
  );
}
