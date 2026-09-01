"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { useId } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { orderTotals, type Affordability } from "@/lib/claw/session";
import { shortfallFor } from "@/lib/claw/wallet-service";
import type { ClawMachine, PaymentMethod, PaymentMethodId } from "@/lib/claw/types";

const TABS = [
  { id: "beezie-wallet", label: "Wallet" },
  { id: "card", label: "Credit/ Debit" },
] as const satisfies readonly { id: PaymentMethodId; label: string }[];

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
  const { total, points } = orderTotals(machine, quantity);
  const alertId = useId();
  const payingByCard = selectedMethodId === "card";
  const wallets = methods.filter((method) => method.id !== "card");
  const canReduce =
    affordability.affordableQuantity >= 1 &&
    affordability.affordableQuantity < quantity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Review and pay"
      variant="sheet"
      panelClassName="sm:max-w-[720px]"
    >
      <div className="flex flex-col gap-5 p-4 pb-safe-16 sm:gap-5 sm:p-5 sm:pb-5">
        <h2 className="text-lg font-semibold text-white">Review &amp; pay</h2>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-3 text-sm font-semibold text-foreground">
              Pay with
            </legend>

            <div className="hidden flex-col gap-2 sm:flex">
              {methods.map((method) => (
                <PaymentRow
                  key={method.id}
                  method={method}
                  checked={method.id === selectedMethodId}
                  shortfall={shortfallFor(method.balance, total)}
                  onSelect={() => onSelectMethod(method.id)}
                />
              ))}
            </div>

            <div className="relative grid grid-cols-2 rounded-md border border-border sm:hidden">
              <SlidingTabPill shifted={payingByCard} />
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectMethod(tab.id)}
                  aria-pressed={payingByCard === (tab.id === "card")}
                  className={cn(
                    "relative h-11 rounded-[5px] text-sm font-semibold transition-colors duration-300",
                    payingByCard === (tab.id === "card")
                      ? "text-primary-foreground"
                      : "text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex min-w-0 flex-col gap-2">
            <p className="mb-3 text-sm font-semibold text-foreground">Summary</p>

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

            <div className="hidden flex-1 flex-col gap-5 rounded-lg border border-border-strong bg-card-gradient px-4 py-5 sm:flex">
              <div className="flex items-center gap-3">
                <Image
                  src={machine.poster}
                  alt=""
                  width={96}
                  height={96}
                  className="size-24 shrink-0 rounded-md border border-border object-cover shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold leading-6 text-foreground">
                    {machine.name}
                  </p>
                  <p className="tnum mt-1.5 text-xs font-medium leading-none text-secondary-foreground">
                    {currency(machine.price)}
                  </p>
                </div>
                <span className="tnum shrink-0 rounded-full border border-border bg-card-gradient px-2.5 py-1.5 text-xs font-medium leading-none text-primary">
                  +{points} pts
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <SummaryRow label="Quantity" value={String(quantity)} />
                <SummaryRow label="Total" value={currency(total)} emphasis />
              </div>
            </div>

            {payingByCard && (
              <p className="grid h-24 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground sm:hidden">
                Coinflow widget
              </p>
            )}
          </div>

          {!payingByCard && (
            <fieldset className="flex min-w-0 flex-col sm:hidden">
              <legend className="mb-3 text-sm font-semibold text-foreground">
                Choose Wallet
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {wallets.map((wallet) => (
                  <WalletOption
                    key={wallet.id}
                    method={wallet}
                    checked={wallet.id === selectedMethodId}
                    onSelect={() => onSelectMethod(wallet.id)}
                  />
                ))}
              </div>
            </fieldset>
          )}
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
          className="w-full [&]:rounded-[10px] sm:mx-auto sm:h-9 sm:w-[328px]"
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

function SlidingTabPill({ shifted }: { shifted: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-y-0 left-0 w-1/2 rounded-[5px] bg-primary transition-transform duration-300 ease-out-quint",
        shifted && "translate-x-full",
      )}
    />
  );
}

function WalletOption({
  method,
  checked,
  onSelect,
}: {
  method: PaymentMethod;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-1 rounded-lg border bg-secondary/40 px-3 py-2.5 transition-[background-color,border-color,scale] active:scale-[0.985]",
        checked ? "border-primary" : "border-border-strong",
      )}
    >
      <input
        type="radio"
        name="wallet"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "grid size-3.5 shrink-0 place-items-center rounded-full transition-colors",
            checked ? "bg-elevated" : "bg-secondary",
          )}
        >
          <span
            className={cn(
              "size-[7px] rounded-full transition-colors",
              checked ? "bg-primary" : "bg-border-strong",
            )}
          />
        </span>
        <span
          className={cn(
            "truncate text-sm font-medium",
            checked ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {method.label}
        </span>
        {method.id === "beezie-wallet" && (
          <Image
            src={asset("/media/beezie-mark.svg")}
            alt=""
            width={14}
            height={20}
            className={cn("ms-auto h-4 w-auto shrink-0", !checked && "opacity-50")}
          />
        )}
      </span>
      <span
        className={cn(
          "tnum ps-[22px] text-sm font-semibold",
          checked ? "text-white" : "text-muted-foreground",
        )}
      >
        {currency(method.balance ?? 0)}
      </span>
    </label>
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
    <p
      className={cn(
        "flex items-center justify-between gap-4",
        emphasis
          ? "border-t border-dashed border-border pt-3 text-sm text-foreground"
          : "text-xs text-secondary-foreground",
      )}
    >
      <span className={emphasis ? "font-medium" : undefined}>{label}</span>
      <span className={cn("tnum", emphasis && "font-semibold")}>{value}</span>
    </p>
  );
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
        "flex min-h-[58px] cursor-pointer items-center gap-3 rounded-lg bg-secondary/40 px-4 py-3 transition-[background-color,border-color,scale] active:scale-[0.995]",
        checked
          ? "border-2 border-primary"
          : "border border-border-strong hover:bg-secondary/70",
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
          "grid size-3.5 shrink-0 place-items-center rounded-full transition-colors",
          checked ? "bg-elevated" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "size-[7px] rounded-full transition-colors",
            checked ? "bg-primary" : "bg-border-strong",
          )}
        />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {method.id === "beezie-wallet" && (
          <Image
            src={asset("/media/beezie-mark.svg")}
            alt=""
            width={14}
            height={20}
            className="h-4 w-auto shrink-0"
          />
        )}
        <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          {method.label}
        </span>
        {method.note && (
          <span className="block text-xs italic text-muted-foreground">
            {method.note}
          </span>
        )}
        </span>
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
