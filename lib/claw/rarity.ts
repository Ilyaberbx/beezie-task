import type { RarityKey } from "./types";

export const RARITY_STYLE: Record<
  RarityKey,
  { tint: string; border: string; label: string; chance: string }
> = {
  ultra: { tint: "255 202 40", border: "#ffca28", label: "text-rarity-ultra", chance: "text-primary" },
  rare: { tint: "192 132 252", border: "#c084fc", label: "text-rarity-rare", chance: "text-rarity-rare" },
  uncommon: { tint: "110 231 183", border: "#6ee7b7", label: "text-rarity-uncommon", chance: "text-rarity-uncommon" },
  common: { tint: "96 165 250", border: "#60a5fa", label: "text-rarity-common", chance: "text-rarity-common" },
  base: { tint: "170 170 170", border: "#aaaaaa", label: "text-foreground", chance: "text-foreground" },
};

export const FMV_COLOR: Record<RarityKey, string> = {
  ultra: "text-rarity-ultra",
  rare: "text-rarity-rare",
  uncommon: "text-rarity-uncommon",
  common: "text-rarity-common",
  base: "text-rarity-base",
};

export function rarityTintGradient(tint: string) {
  return `linear-gradient(90deg, rgb(${tint} / 0.07) 0%, rgb(${tint} / 0) 100%)`;
}
