import { asset } from "../asset.ts";
import type {
  ClawMachine,
  Collectible,
  MachineSummary,
  PaymentMethod,
  Pull,
  RarityKey,
  RecentPull,
  TopItem,
} from "./types";

const item = (path: string) => asset(`/media/items/${path}.webp`);

export const COLLECTIBLES: Collectible[] = [
  { id: "poncho-pikachu", title: "2016 Japanese Promo Poncho Wear Pikachu #231 PSA 10", image: item("poncho-wear-pikachu"), swapValue: 14200, rarity: "ultra" },
  { id: "legendary-mewtwo", title: "2002 Legendary Collection Mewtwo #29 CGC 10", image: item("legendary-mewtwo"), swapValue: 8600, rarity: "ultra" },
  { id: "rayquaza-vmax", title: "2021 Evolving Skies Rayquaza VMAX #218 PSA 10", image: item("rayquaza-vmax"), swapValue: 5200, rarity: "rare" },
  { id: "charizard-holo", title: "2016 Japanese XY Promo Charizard Holo #280 PSA 10", image: item("charizard-holo"), swapValue: 6400, rarity: "rare" },
  { id: "mew-ex", title: "2023 Pokémon SV4a Mew ex #347 PSA 10", image: item("mew-ex"), swapValue: 3500, rarity: "uncommon" },
  { id: "gengar-vmax", title: "2021 Fusion Strike Gengar VMAX #271 PSA 10", image: item("gengar-vmax"), swapValue: 2400, rarity: "uncommon" },
  { id: "charizard-ex", title: "2023 Pokémon Mew EN Charizard ex #199 PSA 9", image: item("charizard-ex"), swapValue: 1900, rarity: "uncommon" },
  { id: "togepi-gx", title: "2019 Cosmic Eclipse Togepi & Cleffa & Igglybuff GX #143 PSA 10", image: item("togepi-cleffa-igglybuff-gx"), swapValue: 1200, rarity: "common" },
  { id: "karens-umbreon", title: "2001 Japanese VS Karen's Umbreon #91 PSA 9", image: item("karens-umbreon"), swapValue: 980, rarity: "common" },
  { id: "venusaur-ex", title: "2013 Japanese XY Venusaur EX #061 PSA 10", image: item("venusaur-ex"), swapValue: 760, rarity: "common" },
  { id: "flareon-ex", title: "2016 Japanese XY Flareon EX #007 PSA 10", image: item("flareon-ex"), swapValue: 640, rarity: "common" },
  { id: "tohoku-pikachu", title: "2025 Tohoku Pikachu SV-P #260 PSA 10", image: item("tohoku-pikachu"), swapValue: 480, rarity: "base" },
  { id: "pichu-holo", title: "2000 Neo Genesis Pichu Holo #12 1st Edition PSA 7", image: item("pichu-holo"), swapValue: 420, rarity: "base" },
  { id: "mega-evolution-box", title: "Pokémon Mega Evolution Elite Trainer Box", image: item("mega-evolution-box"), swapValue: 360, rarity: "base" },
  { id: "prizm-blaster", title: "2020-21 Panini Prizm NBA Basketball Blaster Box", image: item("prizm-blaster-box"), swapValue: 300, rarity: "base" },
  { id: "jordan-bordeaux", title: "Air Jordan 1 Retro High OG Bordeaux", image: item("jordan-1-bordeaux"), swapValue: 260, rarity: "base" },
];

const collectiblesByRarity = COLLECTIBLES.reduce<Record<RarityKey, Collectible[]>>(
  (grouped, collectible) => {
    grouped[collectible.rarity].push(collectible);
    return grouped;
  },
  { ultra: [], rare: [], uncommon: [], common: [], base: [] },
);

const ODDS = [
  { key: "ultra", label: "Ultra-Rare", chance: 0.72, range: "$8001+" },
  { key: "rare", label: "Rare", chance: 0.19, range: "$5001 - $8000" },
  { key: "uncommon", label: "Uncommon", chance: 3.48, range: "$1501 - $5000" },
  { key: "common", label: "Common", chance: 21.08, range: "$501 - $1500" },
  { key: "base", label: "Base", chance: 74.53, range: "$250 - $500" },
] as const satisfies readonly { key: RarityKey; label: string; chance: number; range: string }[];

export const DEFAULT_MACHINE_SLUG = "pokemon-gold";

export const PURCHASE_POINTS_PER_DOLLAR = 0.5;
export const SWAP_POINTS_PER_DOLLAR = 0.1;

const MACHINE_DIRECTORY: MachineSummary[] = [
  { slug: "pokemon-gold", name: "Pokémon Gold", price: 500, icon: asset("/media/machines/gold.webp") },
  { slug: "tcg-gold", name: "TCG Gold", price: 250, icon: asset("/media/machines/box-dark.png") },
  { slug: "tcg-silver", name: "TCG Silver", price: 50, icon: asset("/media/machines/box-dark.png") },
  { slug: "wildcard", name: "Wildcard", price: 30, icon: asset("/media/machines/box-wildcard.png") },
];

const TAGLINES: Record<string, string> = {
  "pokemon-gold": "Every pull is a statement piece, every grail secured with Brink's and tokenized on Beezie.",
  "tcg-gold": "Graded slabs and sealed product from the golden era, vaulted the moment you pull.",
  "tcg-silver": "An everyday pull with real slabs in the pool and instant SWAP on anything you keep.",
  "wildcard": "Open instantly to reveal your collectible, then decide whether to hold or SWAP.",
};

export const MACHINES: ClawMachine[] = MACHINE_DIRECTORY.map((machine) => ({
  slug: machine.slug,
  name: `${machine.name} Claw`,
  tagline: TAGLINES[machine.slug],
  price: machine.price,
  points: Math.round(machine.price * PURCHASE_POINTS_PER_DOLLAR),
  idleVideo: asset("/media/machine-idle.mp4"),
  poster: asset("/media/machine-poster.webp"),
  averageValue: 505,
  odds: ODDS.map((tier) => ({ ...tier })),
  siblings: MACHINE_DIRECTORY.filter((sibling) => sibling.slug !== machine.slug),
}));

export const TOP_ITEMS: TopItem[] = COLLECTIBLES.slice(0, 12).map((collectible) => ({
  id: collectible.id,
  title: collectible.title,
  image: collectible.image,
  fairMarketValue: collectible.swapValue,
  rarity: collectible.rarity,
}));

const OWNERS = ["lebnani", "0xhoneycomb", "vaultrat", "grailhunter", "slabqueen", "mintcondition"];

export const RECENT_PULLS: RecentPull[] = COLLECTIBLES.slice(2, 8).map((collectible, index) => ({
  id: `${collectible.id}-recent`,
  title: collectible.title,
  image: collectible.image,
  owner: OWNERS[index],
  price: collectible.swapValue,
}));

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "beezie-wallet", label: "Beezie wallet" },
  { id: "external-wallet", label: "External wallet", balance: 50 },
  { id: "card", label: "Credit / Debit", note: "Processing fees may apply" },
];

export const SWAP_WINDOW_MS = 15 * 60 * 1000;

const cumulativeOdds = ODDS.reduce<{ key: RarityKey; ceiling: number }[]>((acc, tier) => {
  const previous = acc.at(-1)?.ceiling ?? 0;
  acc.push({ key: tier.key, ceiling: previous + tier.chance });
  return acc;
}, []);

function drawRarity(): RarityKey {
  const roll = Math.random() * 100;
  return cumulativeOdds.find((tier) => roll <= tier.ceiling)?.key ?? "base";
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function drawCollectible(): Collectible {
  return pick(collectiblesByRarity[drawRarity()]);
}

export function drawPulls(quantity: number): Pull[] {
  return Array.from({ length: quantity }, (_, index) => ({
    id: `pull-${Date.now()}-${index}`,
    collectible: drawCollectible(),
  }));
}

let livePullSequence = 0;
let lastLiveId: string | null = null;

export function drawRecentPull(): RecentPull {
  let collectible = drawCollectible();
  if (collectible.id === lastLiveId) collectible = drawCollectible();
  lastLiveId = collectible.id;

  return {
    id: `${collectible.id}-live-${livePullSequence++}`,
    title: collectible.title,
    image: collectible.image,
    owner: pick(OWNERS),
    price: collectible.swapValue,
  };
}

export function findMachine(slug: string) {
  return MACHINES.find((machine) => machine.slug === slug);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
