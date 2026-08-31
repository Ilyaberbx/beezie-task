import type { Wallet } from "./types";

const INITIAL_WALLET: Wallet = { balance: 2500, points: 20000 };

export class InsufficientBalanceError extends Error {
  readonly available: number;
  readonly required: number;
  readonly shortfall: number;

  constructor(available: number, required: number) {
    super(`Insufficient balance: ${required} required, ${available} available`);
    this.name = "InsufficientBalanceError";
    this.available = available;
    this.required = required;
    this.shortfall = Math.max(0, required - available);
  }
}

export function shortfallFor(balance: number | undefined, total: number) {
  return balance === undefined ? 0 : Math.max(0, total - balance);
}

export type DebitInput = {
  amount: number;
  reason: string;
};

export type CreditInput = {
  amount: number;
  points?: number;
  reason: string;
};

export type WalletService = {
  getWallet(): Promise<Wallet>;
  debit(input: DebitInput): Promise<Wallet>;
  credit(input: CreditInput): Promise<Wallet>;
};

export function createInMemoryWalletService(seed: Wallet): WalletService {
  let wallet: Wallet = { ...seed };

  return {
    async getWallet() {
      return wallet;
    },
    async debit(input) {
      if (input.amount > wallet.balance) {
        throw new InsufficientBalanceError(wallet.balance, input.amount);
      }
      wallet = { ...wallet, balance: wallet.balance - input.amount };
      return wallet;
    },
    async credit(input) {
      wallet = {
        balance: wallet.balance + input.amount,
        points: wallet.points + (input.points ?? 0),
      };
      return wallet;
    },
  };
}

export const walletService: WalletService = createInMemoryWalletService(INITIAL_WALLET);
