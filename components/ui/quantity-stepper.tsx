import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onAdjust: (delta: number) => void;
  className?: string;
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  onAdjust,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-32 shrink-0 items-center justify-between rounded-lg border border-border bg-secondary px-1 shadow-tile",
        className,
      )}
    >
      <StepButton
        label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onAdjust(-1)}
      >
        <Minus className="size-5" strokeWidth={2} />
      </StepButton>
      <span
        key={value}
        aria-live="polite"
        className="tnum animate-fade-in text-base font-semibold"
      >
        {value}
      </span>
      <StepButton
        label="Increase quantity"
        disabled={value >= max}
        onClick={() => onAdjust(1)}
      >
        <Plus className="size-5" strokeWidth={2} />
      </StepButton>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center text-foreground transition-[color,scale] hover:text-primary active:scale-90 disabled:pointer-events-none disabled:text-secondary-foreground"
    >
      {children}
    </button>
  );
}
