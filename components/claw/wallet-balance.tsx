"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import { currency } from "@/lib/format";
import { useWallet } from "@/hooks/claw/use-wallet";

export function WalletBalance() {
  const wallet = useWallet();

  return (
    <span className="hidden h-10 items-center gap-2.5 rounded-[7px] bg-card px-4 text-sm font-medium sm:flex">
      <Image
        src={asset("/media/icons/wallet.svg")}
        alt=""
        width={16}
        height={13}
        className="h-[13px] w-4"
      />
      <span key={wallet.balance} className="tnum animate-fade-in">
        {currency(wallet.balance)}
      </span>
    </span>
  );
}
