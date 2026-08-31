"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { useId } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ClawMachine, PaymentMethod, PaymentMethodId } from "@/lib/claw/types";

type Affordability = {
  total: number;
  shortfall: number;
  canAfford: boolean;
  affordableQuantity: number;
  methodLabel: string;
};

type ReviewAndPayDialogProps = {
  open: boolean;
  machine: ClawMachine;
  quantity: number;
  methods: PaymentMethod[];
  selectedMethodId: PaymentMethodId;
  onSelectMethod: (id: PaymentMethodId) => void;
  affordability: Affordability;
  onReduceQuantity: (next: number) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ReviewAndPayDialog({
  open,
  machine,
  quantity,
  methods,
  selectedMethodId,
  onSelectMethod,
  affordability,
  onReduceQuantity,
  onConfirm,
  onClose,
}: ReviewAndPayDialogProps) {
  const total = machine.price * quantity;
  const points = machine.points * quantity;
  const alertId = useId();
  const canReduce =
    affordability.affordableQuantity >= 1 &&
    affordability.affordableQuantity < quantity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Review and pay"
      variant="sheet"
      panelClassName="sm:max-w-[608px]"
    >
      <div className="flex flex-col gap-5 p-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:gap-6 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Review &amp; pay</h2>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-secondary-foreground">
              Pay with
            </legend>

            <div className="hidden flex-col gap-2 sm:flex">
              {methods.map((method) => (
                <PaymentRow
                  key={method.id}
                  method={method}
                  checked={method.id === selectedMethodId}
                  shortfall={shortfallFor(method, total)}
                  onSelect={() => onSelectMethod(method.id)}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 rounded-md border border-border p-0 sm:hidden">
              {(["beezie-wallet", "card"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectMethod(id)}
                  aria-pressed={selectedMethodId === id}
                  className={cn(
                    "h-11 rounded-[5px] text-sm font-semibold transition-colors",
                    selectedMethodId === id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  {id === "beezie-wallet" ? "Wallet" : "Credit/ Debit"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex min-w-0 flex-col gap-2">
            <p className="mb-2 text-sm font-medium text-secondary-foreground">Summary</p>

            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 p-3 sm:hidden">
              <Image
                src={machine.poster}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {machine.name}
                </p>
                <p className="text-xs font-medium text-secondary-foreground">
                  Quantity: {quantity}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="tnum text-sm font-semibold text-white">
                  {currency(total)}
                </p>
                <p className="tnum text-xs font-semibold text-primary">
                  +{points} pts
                </p>
              </div>
            </div>

            <div className="hidden flex-col gap-3 rounded-md border border-border bg-secondary/40 p-3 sm:flex">
              <div className="flex items-center gap-3">
                <Image
                  src={machine.poster}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight text-white">
                    {machine.name}
                  </p>
                  <p className="tnum mt-0.5 text-xs font-medium text-secondary-foreground">
                    {currency(machine.price)}
                  </p>
                </div>
                <span className="tnum shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                  +{points} pts
                </span>
              </div>
              <Separator />
              <SummaryRow label="Quantity" value={String(quantity)} />
              <SummaryRow label="Total" value={currency(total)} emphasis />
            </div>

            {selectedMethodId === "card" && (
              <p className="grid h-24 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground sm:hidden">
                Coinflow widget
              </p>
            )}
          </div>
        </div>

        {!affordability.canAfford && (
          <Alert
            id={alertId}
            title={`Not enough in your ${affordability.methodLabel}`}
            actions={
              <>
                <Button
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => onSelectMethod("card")}
                >
                  Pay with Credit / Debit
                </Button>
                {canReduce && (
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs"
                    onClick={() => onReduceQuantity(affordability.affordableQuantity)}
                  >
                    Reduce to {affordability.affordableQuantity} pull
                    {affordability.affordableQuantity > 1 ? "s" : ""}
                  </Button>
                )}
              </>
            }
          >
            This order costs {currency(total)} and you are{" "}
            {currency(affordability.shortfall)} short. Pick another payment method or
            lower the quantity.
          </Alert>
        )}

        <Button
          className="w-full sm:mx-auto sm:w-[276px]"
          onClick={onConfirm}
          disabled={!affordability.canAfford}
          aria-describedby={affordability.canAfford ? undefined : alertId}
        >
          Confirm
        </Button>
      </div>
    </Dialog>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <p className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-secondary-foreground">{label}</span>
      <span
        className={cn(
          "tnum text-sm",
          emphasis ? "font-semibold text-white" : "font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </p>
  );
}

function shortfallFor(method: PaymentMethod, total: number) {
  if (method.balance === undefined) return 0;
  return Math.max(0, total - method.balance);
}

function PaymentRow({
  method,
  checked,
  shortfall,
  onSelect,
}: {
  method: PaymentMethod;
  checked: boolean;
  shortfall: number;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-[background-color,border-color,scale] active:scale-[0.995]",
        checked
          ? "border-primary bg-primary/6"
          : "border-border bg-secondary/40 hover:border-border-strong hover:bg-secondary/70",
      )}
    >
      <input
        type="radio"
        name="payment-method"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors",
          checked ? "border-primary" : "border-border-strong",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-colors",
            checked ? "bg-primary" : "bg-border-strong",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {method.label}
        </span>
        {method.note && (
          <span className="block text-xs italic text-muted-foreground">
            {method.note}
          </span>
        )}
      </span>
      {method.balance !== undefined && (
        <span className="shrink-0 text-right">
          <span
            className={cn(
              "tnum block text-sm font-semibold",
              shortfall > 0 ? "text-primary" : "text-foreground",
            )}
          >
            {currency(method.balance)}
          </span>
          {shortfall > 0 && (
            <span className="tnum block text-xs font-medium text-primary">
              Short by {currency(shortfall)}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
