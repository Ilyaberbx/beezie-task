import { CircleHelp } from "lucide-react";
import { currency, percent } from "@/lib/format";
import type { RarityKey, RarityTier } from "@/lib/claw/types";

const RARITY_STYLE: Record<
  RarityKey,
  { tint: string; border: string; label: string; chance: string }
> = {
  ultra: { tint: "255,202,40", border: "#ffca28", label: "text-rarity-ultra", chance: "text-primary" },
  rare: { tint: "192,132,252", border: "#c084fc", label: "text-rarity-rare", chance: "text-rarity-rare" },
  uncommon: { tint: "110,231,183", border: "#6ee7b7", label: "text-rarity-uncommon", chance: "text-rarity-uncommon" },
  common: { tint: "96,165,250", border: "#60a5fa", label: "text-rarity-common", chance: "text-rarity-common" },
  base: { tint: "170,170,170", border: "#aaaaaa", label: "text-foreground", chance: "text-foreground" },
};

export function OddsGrid({
  odds,
  averageValue,
}: {
  odds: RarityTier[];
  averageValue: number;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-1 text-base font-semibold leading-none text-white">
            Odds
            <CircleHelp
              className="size-3.5 text-secondary-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </h2>
          <p className="text-xs font-medium leading-none text-secondary-foreground">
            Updates every few seconds.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <p className="text-xs font-medium leading-none text-secondary-foreground md:text-sm">
            Average Value:
          </p>
          <p className="tnum text-lg font-semibold leading-none text-emerald">
            {currency(averageValue)}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-1 md:gap-2">
        {odds.map((tier) => {
          const style = RARITY_STYLE[tier.key];
          return (
            <li
              key={tier.key}
              className="flex flex-col gap-1.5 rounded-sm border-l bg-elevated px-1.5 py-2 md:px-2 md:py-3"
              style={{
                borderLeftColor: style.border,
                backgroundImage: `linear-gradient(90deg, rgb(${style.tint} / 0.07) 0%, rgb(${style.tint} / 0) 100%)`,
              }}
            >
              <span className="flex items-start justify-between gap-2 text-[10px] font-semibold leading-none">
                <span className={style.label}>{tier.label}</span>
                <span className={`tnum ${style.chance}`}>{percent(tier.chance)}</span>
              </span>
              <span className="tnum text-[8px] font-medium leading-none text-secondary-foreground md:text-[10px]">
                {tier.range}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
