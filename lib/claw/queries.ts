import { queryOptions } from "@tanstack/react-query";
import {
  COLLECTIBLES,
  PAYMENT_METHODS,
  RECENT_PULLS,
  SWAP_POINTS_PER_DOLLAR,
  SWAP_WINDOW_MS,
  TOP_ITEMS,
  delay,
  drawPulls,
  findMachine,
} from "./mock.ts";
import { walletService } from "./wallet-service.ts";
import type {
  ClawMachine,
  Collectible,
  PaymentMethod,
  PurchaseRequest,
  PurchaseResult,
  RecentPull,
  SwapRequest,
  SwapResult,
  TopItem,
  Wallet,
} from "./types";

const FIVE_MINUTES = 5 * 60 * 1000;

const PURCHASE_SETTLEMENT_MS = 2600;
const SWAP_SETTLEMENT_MS = 1800;

const PRIZE_HIGHLIGHT_COUNT = 5;

export class SwapWindowClosedError extends Error {
  constructor() {
    super("The swap window for this order has closed");
    this.name = "SwapWindowClosedError";
  }
}

async function fetchMachine(slug: string): Promise<ClawMachine> {
  const machine = findMachine(slug);
  if (!machine) throw new Error(`Unknown claw machine: ${slug}`);
  return machine;
}

export async function fetchTopItems(): Promise<TopItem[]> {
  return TOP_ITEMS;
}

export async function fetchRecentPulls(): Promise<RecentPull[]> {
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
    .slice(0, PRIZE_HIGHLIGHT_COUNT);
}

export async function purchasePulls(request: PurchaseRequest): Promise<PurchaseResult> {
  const machine = await fetchMachine(request.slug);

  if (request.paymentMethodId === "beezie-wallet") {
    await walletService.debit({
      amount: machine.price * request.quantity,
      reason: `claw:${request.slug}`,
    });
  }

  await delay(PURCHASE_SETTLEMENT_MS);
  return {
    orderId: `order-${request.slug}-${Date.now()}`,
    pulls: drawPulls(request.quantity),
    expiresAt: Date.now() + SWAP_WINDOW_MS,
  };
}

export async function swapPulls({ pulls, expiresAt }: SwapRequest): Promise<SwapResult> {
  if (Date.now() > expiresAt) throw new SwapWindowClosedError();

  await delay(SWAP_SETTLEMENT_MS);
  const credited = pulls.reduce((total, pull) => total + pull.collectible.swapValue, 0);
  const points = Math.round(credited * SWAP_POINTS_PER_DOLLAR);

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
