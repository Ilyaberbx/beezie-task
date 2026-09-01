import { CircleHelp } from "lucide-react";
import { currency, percent } from "@/lib/format";
import { RARITY_STYLE, rarityTintGradient } from "@/lib/claw/rarity";
import type { RarityTier } from "@/lib/claw/types";

export function OddsGrid({
  odds,
  averageValue,
}: {
  odds: RarityTier[];
  averageValue: number;
}) {
  return (
    <section className="@container flex flex-col gap-4 md:gap-2.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-1 text-base font-semibold leading-none text-white">
            Odds
            <CircleHelp
              className="size-3.5 text-secondary-foreground"
              strokeWidth={1.7}
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
          <p className="tnum text-base font-semibold leading-4 text-emerald md:text-lg">
            {currency(averageValue)}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-1.5 @[23rem]:grid-cols-3 @[38rem]:grid-cols-5 md:gap-2">
        {odds.map((tier) => {
          const style = RARITY_STYLE[tier.key];
          return (
            <li
              key={tier.key}
              className="flex flex-col gap-1.5 rounded-sm border-l bg-elevated px-1.5 py-2 md:px-2 md:py-3"
              style={{
                borderLeftColor: style.border,
                backgroundImage: rarityTintGradient(style.tint),
              }}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-[10px] font-medium leading-none md:font-semibold">
                <span className={`whitespace-nowrap ${style.label}`}>{tier.label}</span>
                <span className={`tnum whitespace-nowrap ${style.chance}`}>
                  {percent(tier.chance)}
                </span>
              </span>
              <span className="tnum text-[10px] font-medium leading-none text-secondary-foreground">
                {tier.range}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
