import { queryOptions } from "@tanstack/react-query";
import {
  COLLECTIBLES,
  MACHINES,
  PAYMENT_METHODS,
  RECENT_PULLS,
  SWAP_WINDOW_MS,
  TOP_ITEMS,
  delay,
  drawPulls,
  findMachine,
} from "./mock";
import { walletService } from "./wallet-service";
import type {
  ClawMachine,
  Collectible,
  PaymentMethod,
  Pull,
  PurchaseRequest,
  PurchaseResult,
  RecentPull,
  SwapResult,
  TopItem,
  Wallet,
} from "./types";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchMachine(slug: string): Promise<ClawMachine> {
  const machine = findMachine(slug);
  if (!machine) throw new Error(`Unknown claw machine: ${slug}`);
  return machine;
}

async function fetchMachineDirectory(): Promise<ClawMachine[]> {
  return MACHINES;
}

async function fetchTopItems(): Promise<TopItem[]> {
  return TOP_ITEMS;
}

async function fetchRecentPulls(): Promise<RecentPull[]> {
  return RECENT_PULLS;
}

async function fetchWallet(): Promise<Wallet> {
  return walletService.getWallet();
}

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const wallet = await walletService.getWallet();
  return PAYMENT_METHODS.map((method) =>
    method.id === "beezie-wallet" ? { ...method, balance: wallet.balance } : method,
  );
}

async function fetchPrizeHighlights(): Promise<Collectible[]> {
  return [...COLLECTIBLES]
    .sort((a, b) => b.swapValue - a.swapValue)
    .slice(0, 5);
}

export async function purchasePulls(request: PurchaseRequest): Promise<PurchaseResult> {
  const machine = await fetchMachine(request.slug);

  if (request.paymentMethodId === "beezie-wallet") {
    await walletService.debit({
      amount: machine.price * request.quantity,
      reason: `claw:${request.slug}`,
    });
  }

  await delay(2600);
  return {
    orderId: `order-${request.slug}-${Date.now()}`,
    pulls: drawPulls(request.quantity),
    expiresAt: Date.now() + SWAP_WINDOW_MS,
  };
}

export async function swapPulls(pulls: Pull[]): Promise<SwapResult> {
  await delay(1800);
  const credited = pulls.reduce((total, pull) => total + pull.collectible.swapValue, 0);
  const points = Math.round(credited / 10);

  await walletService.credit({
    amount: credited,
    points,
    reason: `swap:${pulls.map((pull) => pull.id).join(",")}`,
  });

  return { credited, points };
}

export const clawQueries = {
  machine: (slug: string) =>
    queryOptions({
      queryKey: ["claw", "machine", slug] as const,
      queryFn: () => fetchMachine(slug),
      staleTime: FIVE_MINUTES,
    }),
  machineDirectory: () =>
    queryOptions({
      queryKey: ["claw", "machines"] as const,
      queryFn: fetchMachineDirectory,
      staleTime: FIVE_MINUTES,
    }),
  topItems: () =>
    queryOptions({
      queryKey: ["claw", "top-items"] as const,
      queryFn: fetchTopItems,
      staleTime: FIVE_MINUTES,
    }),
  recentPulls: () =>
    queryOptions({
      queryKey: ["claw", "recent-pulls"] as const,
      queryFn: fetchRecentPulls,
      staleTime: FIVE_MINUTES,
    }),
  wallet: () =>
    queryOptions({
      queryKey: ["claw", "wallet"] as const,
      queryFn: fetchWallet,
      staleTime: FIVE_MINUTES,
    }),
  paymentMethods: () =>
    queryOptions({
      queryKey: ["claw", "payment-methods"] as const,
      queryFn: fetchPaymentMethods,
      staleTime: FIVE_MINUTES,
    }),
  prizeHighlights: () =>
    queryOptions({
      queryKey: ["claw", "prize-highlights"] as const,
      queryFn: fetchPrizeHighlights,
      staleTime: FIVE_MINUTES,
    }),
};
