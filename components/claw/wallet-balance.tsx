"use client";

import { currency } from "@/lib/format";
import { useWallet } from "@/hooks/claw/use-wallet";

export function WalletAmount() {
  const wallet = useWallet();

  return (
    <span key={wallet.balance} className="tnum animate-fade-in">
      {currency(wallet.balance)}
    </span>
  );
}
