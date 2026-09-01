import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn } from "@/lib/cn";

type PurchaseBarProps = {
  quantity: number;
  maxQuantity: number;
  onAdjustQuantity: (delta: number) => void;
  onStart: () => void;
  disabled?: boolean;
  className?: string;
};

export function PurchaseBar({
  quantity,
  maxQuantity,
  onAdjustQuantity,
  onStart,
  disabled,
  className,
}: PurchaseBarProps) {
  return (
    <div className={cn("flex items-center gap-2 md:gap-4", className)}>
      <QuantityStepper
        value={quantity}
        max={maxQuantity}
        onAdjust={onAdjustQuantity}
      />
      <Button
        className="flex-1 rounded-lg text-base md:rounded-md md:text-sm"
        onClick={onStart}
        disabled={disabled}
      >
        Start Now
      </Button>
    </div>
  );
}
