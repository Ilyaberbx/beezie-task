export type RarityKey = "ultra" | "rare" | "uncommon" | "common" | "base";

export type RarityTier = {
  key: RarityKey;
  label: string;
  chance: number;
  range: string;
};

export type Collectible = {
  id: string;
  title: string;
  image: string;
  swapValue: number;
  rarity: RarityKey;
};

export type Pull = {
  id: string;
  collectible: Collectible;
};

export type MachineSummary = {
  slug: string;
  name: string;
  price: number;
  icon: string;
};

export type ClawMachine = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  points: number;
  idleVideo: string;
  poster: string;
  averageValue: number;
  odds: RarityTier[];
  siblings: MachineSummary[];
};

export type TopItem = {
  id: string;
  title: string;
  image: string;
  fairMarketValue: number;
};

export type RecentPull = {
  id: string;
  title: string;
  image: string;
  owner: string;
  price: number;
};

export type PaymentMethodId = "beezie-wallet" | "external-wallet" | "card";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  note?: string;
  balance?: number;
};

export type Wallet = {
  balance: number;
  points: number;
};

export type PurchaseRequest = {
  slug: string;
  quantity: number;
  paymentMethodId: PaymentMethodId;
};

export type PurchaseResult = {
  orderId: string;
  pulls: Pull[];
  expiresAt: number;
};

export type SwapResult = {
  credited: number;
  points: number;
};
